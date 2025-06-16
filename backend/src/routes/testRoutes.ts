import { Router } from "express"
import { GameManager } from "../core/GameManager"
import { logger } from "../utils/logger"
import { GamePhase } from "@/types/GameTypes"
import { TestUtils } from "../utils/testUtils"

const router = Router()
const gameManager = GameManager.getInstance()

// Middleware de admin
const requireAdmin = (req: any, res: any, next: any) => {
  const { adminKey } = req.body || req.query
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== "test123") {
    return res.status(403).json({ error: "Admin key requerida" })
  }
  next()
}

// 🎮 CREAR PARTIDA DE PRUEBA CON 4 JUGADORES AUTOMÁTICOS
router.post("/create-test-game", requireAdmin, (req, res) => {
  try {
    const { roomId } = req.body
    const testRoomId = roomId || TestUtils.generateTestRoomId()

    // Crear room
    const room = gameManager.createRoom(false, testRoomId)

    // Añadir 4 jugadores de prueba
    const testPlayers = TestUtils.createTestPlayers()

    const players = []
    for (const playerData of testPlayers) {
      const result = gameManager.joinRoom(room.id, playerData.name, `socket-${playerData.name}`)
      players.push(result.player)
    }

    const game = gameManager.getGame(room.id)

    res.json({
      success: true,
      message: "Partida de prueba creada",
      roomId: room.id,
      players: players.map((p) => ({ id: p.id, name: p.name, team: p.team })),
      gameState: game?.getPublicGameState(),
    })
  } catch (error) {
    logger.error(`Error creating test game: ${error}`)
    res.status(500).json({ error: "Error al crear partida de prueba" })
  }
})

// 🔍 VER ESTADO COMPLETO (CARTAS DE TODOS)
router.get("/game/:roomId/debug", requireAdmin, (req, res) => {
  try {
    const { roomId } = req.params
    const game = gameManager.getGame(roomId)

    if (!game) {
      return res.status(404).json({ error: "Partida no encontrada" })
    }

    const gameState = game.getGameState() // Estado completo

    res.json({
      success: true,
      gameState: {
        ...gameState,
        players: gameState.players.map((p) => ({
          id: p.id,
          name: p.name,
          team: p.team,
          position: p.position,
          hand: p.hand, // 🔥 Mostrar cartas de todos
          isConnected: p.isConnected,
          lastAction: p.getLastAction(),
        })),
      },
      recommendations: getRecommendations(gameState),
      validation: TestUtils.validateGameState(gameState),
    })
  } catch (error) {
    logger.error(`Error getting debug info: ${error}`)
    res.status(500).json({ error: "Error al obtener información de debug" })
  }
})

// 🎯 EJECUTAR ACCIÓN COMO CUALQUIER JUGADOR
router.post("/game/:roomId/force-action", requireAdmin, (req, res) => {
  try {
    const { roomId } = req.params
    const { playerName, action } = req.body

    const game = gameManager.getGame(roomId)
    if (!game) {
      return res.status(404).json({ error: "Partida no encontrada" })
    }

    const gameState = game.getGameState()
    const player = gameState.players.find((p) => p.name === playerName)

    if (!player) {
      return res.status(404).json({ error: "Jugador no encontrado" })
    }

    const result = game.playAction(player.id, action)

    res.json({
      success: result.success,
      message: result.message,
      action: { playerName, action },
      newGameState: game.getPublicGameState(),
      result,
    })
  } catch (error) {
    logger.error(`Error forcing action: ${error}`)
    res.status(500).json({ error: "Error al ejecutar acción forzada" })
  }
})

// 🎲 SIMULAR PARTIDA COMPLETA AUTOMÁTICA
router.post("/game/:roomId/simulate", requireAdmin, (req, res) => {
  try {
    const { roomId } = req.params
    const { steps = 10 } = req.body

    const game = gameManager.getGame(roomId)
    if (!game) {
      return res.status(404).json({ error: "Partida no encontrada" })
    }

    const log = []
    let gameState = game.getGameState()

    for (let i = 0; i < steps && !gameState.isGameFinished; i++) {
      const currentPlayer = gameState.players[gameState.currentTurn]

      // Acción automática inteligente
      const action = getSmartAction(gameState, currentPlayer)
      const result = game.playAction(currentPlayer.id, action)

      log.push({
        step: i + 1,
        player: currentPlayer.name,
        phase: gameState.currentPhase,
        action,
        result: result.message,
        scores: [...gameState.scores],
      })

      gameState = game.getGameState()
    }

    res.json({
      success: true,
      message: `Simulación de ${log.length} pasos completada`,
      log,
      finalState: game.getPublicGameState(),
    })
  } catch (error) {
    logger.error(`Error simulating game: ${error}`)
    res.status(500).json({ error: "Error en simulación" })
  }
})

// 🔄 FORZAR CAMBIO DE FASE
router.post("/game/:roomId/force-phase", requireAdmin, (req, res) => {
  try {
    const { roomId } = req.params
    const { phase } = req.body

    const game = gameManager.getGame(roomId)
    if (!game) {
      return res.status(404).json({ error: "Partida no encontrada" })
    }

    // Verificar que el método existe en Game.ts
    if (typeof game.forcePhase === "function") {
      game.forcePhase(phase)
    } else {
      return res.status(501).json({ error: "Método forcePhase no implementado en Game.ts" })
    }

    res.json({
      success: true,
      message: `Fase cambiada a ${phase}`,
      gameState: game.getPublicGameState(),
    })
  } catch (error) {
    logger.error(`Error forcing phase: ${error}`)
    res.status(500).json({ error: "Error al cambiar fase" })
  }
})

// 📊 ANÁLISIS DE MANO ACTUAL
router.get("/game/:roomId/analysis", requireAdmin, (req, res) => {
  try {
    const { roomId } = req.params
    const game = gameManager.getGame(roomId)

    if (!game) {
      return res.status(404).json({ error: "Partida no encontrada" })
    }

    const gameState = game.getGameState()

    res.json({
      success: true,
      analysis: {
        currentPhase: gameState.currentPhase,
        currentPlayer: gameState.players[gameState.currentTurn]?.name,
        scores: gameState.scores,
        handNumber: gameState.currentHand,
      },
      recommendations: {
        bestActions: getBestActions(gameState),
        gameStatus: `Mano ${gameState.currentHand} - ${gameState.scores[0]} vs ${gameState.scores[1]}`,
      },
      validation: TestUtils.validateGameState(gameState),
    })
  } catch (error) {
    logger.error(`Error getting analysis: ${error}`)
    res.status(500).json({ error: "Error en análisis" })
  }
})

// 📋 LISTA DE COMANDOS DISPONIBLES
router.get("/commands", (req, res) => {
  res.json({
    success: true,
    commands: {
      "POST /test/create-test-game": "Crear partida con 4 jugadores automáticos",
      "GET /test/game/:roomId/debug": "Ver estado completo con cartas",
      "POST /test/game/:roomId/force-action": "Ejecutar acción como cualquier jugador",
      "POST /test/game/:roomId/simulate": "Simular pasos automáticos",
      "POST /test/game/:roomId/force-phase": "Cambiar fase manualmente",
      "GET /test/game/:roomId/analysis": "Análisis detallado de la mano",
    },
    examples: {
      createGame: {
        url: "POST /test/create-test-game",
        body: { adminKey: "test123", roomId: "TEST01" },
      },
      forceAction: {
        url: "POST /test/game/TEST01/force-action",
        body: { adminKey: "test123", playerName: "Test_Juan", action: { type: "mus" } },
      },
      simulate: {
        url: "POST /test/game/TEST01/simulate",
        body: { adminKey: "test123", steps: 5 },
      },
    },
  })
})

// ==================== MÉTODOS AUXILIARES ====================

function getSmartAction(gameState: any, player: any): any {
  switch (gameState.currentPhase) {
    case GamePhase.MUS:
      // Lógica simple: aceptar mus si la mano es mala
      return Math.random() > 0.7 ? { type: "no-mus" } : { type: "mus" }

    case GamePhase.GRANDE:
    case GamePhase.CHICA:
    case GamePhase.PUNTO:
      // Pasar la mayoría de las veces
      return Math.random() > 0.8 ? { type: "envido", amount: 2 } : { type: "paso" }

    case GamePhase.PARES:
      // Solo apostar si tiene pares (simplificado)
      return { type: "paso" }

    case GamePhase.JUEGO:
      // Apostar más en juego
      return Math.random() > 0.6 ? { type: "envido", amount: 2 } : { type: "paso" }

    default:
      return { type: "paso" }
  }
}

function getRecommendations(gameState: any): any {
  const currentPlayer = gameState.players[gameState.currentTurn]

  return {
    currentPlayer: currentPlayer?.name || "Ninguno",
    phase: gameState.currentPhase,
    suggestedActions: ["paso", "envido", "ordago"],
    gameStatus: `Mano ${gameState.currentHand} - ${gameState.scores[0]} vs ${gameState.scores[1]}`,
  }
}

function getBestActions(gameState: any): string[] {
  return ["paso", "envido 2", "ordago"]
}

export default router
