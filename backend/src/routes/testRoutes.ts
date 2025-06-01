import { Router } from "express"
import type { GameManager } from "@/core/GameManager"
import { TestUtils } from "@/utils/testUtils"
import { logger } from "@/utils/logger"
import type { Game } from "@/core/Game"

const router = Router()

// Instancia global del GameManager para testing
let testGameManager: GameManager | null = null
const activeGames = new Map<string, Game>()

/**
 * GET /test/health
 * Verificar que el sistema de testing está funcionando
 */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Sistema de testing funcionando",
    timestamp: new Date().toISOString(),
    activeGames: activeGames.size,
  })
})

/**
 * POST /test/create-game
 * Crear una partida de prueba con 4 jugadores automáticamente
 */
router.post("/create-game", (req, res) => {
  try {
    const { gameManager, game, players } = TestUtils.createTestGame()

    // Guardar referencias
    testGameManager = gameManager
    activeGames.set(game.getGameState().id, game)

    const gameState = game.getGameState()

    logger.info(`🎮 Partida de prueba creada: ${gameState.id}`)

    res.json({
      success: true,
      gameId: gameState.id,
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
      })),
      gameState: {
        currentPhase: gameState.currentPhase,
        currentTurn: gameState.currentTurn,
        currentHand: gameState.currentHand,
        scores: gameState.scores,
      },
      message: "Partida creada con 4 jugadores automáticamente",
    })
  } catch (error) {
    logger.error(` creating test game: ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al crear partida de prueba",
      details: error instanceof Error ? error.message : "Error desconocido",
    })
  }
})

/**
 * GET /test/games
 * Listar todas las partidas de prueba activas
 */
router.get("/games", (req, res) => {
  try {
    const games = Array.from(activeGames.entries()).map(([id, game]) => {
      const gameState = game.getGameState()
      return {
        id,
        currentPhase: gameState.currentPhase,
        currentHand: gameState.currentHand,
        scores: gameState.scores,
        isFinished: gameState.isGameFinished,
        winner: gameState.winner,
        players: gameState.players.map((p) => ({
          name: p.name,
          team: p.team,
          isConnected: p.isConnected,
        })),
      }
    })

    res.json({
      success: true,
      totalGames: games.length,
      games,
    })
  } catch (error) {
    logger.error(`Error listing games: ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al listar partidas",
    })
  }
})

/**
 * GET /test/game/:gameId
 * Obtener estado detallado de una partida específica
 */
router.get("/game/:gameId", (req, res) => {
  try {
    const { gameId } = req.params
    const game = activeGames.get(gameId)

    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Partida no encontrada",
      })
    }

    const gameState = game.getGameState()
    const teamInfo = game.getTeamInfo()

    res.json({
      success: true,
      gameId,
      gameState: {
        id: gameState.id,
        currentPhase: gameState.currentPhase,
        currentTurn: gameState.currentTurn,
        currentHand: gameState.currentHand,
        scores: gameState.scores,
        isFinished: gameState.isGameFinished,
        winner: gameState.winner,
        phaseData: gameState.phaseData,
      },
      teams: teamInfo,
      players: gameState.players.map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
        isConnected: p.isConnected,
        handSize: p.hand.length,
      })),
    })
  } catch (error) {
    logger.error(`getting game state: ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al obtener estado de partida",
    })
  }
})

/**
 * POST /test/simulate/:gameId
 * Simular una partida completa automáticamente
 */
router.post("/simulate/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params

    if (!testGameManager) {
      return res.status(400).json({
        success: false,
        error: "No hay GameManager de prueba. Crea una partida primero.",
      })
    }

    const game = activeGames.get(gameId)
    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Partida no encontrada",
      })
    }

    logger.info(`🤖 Iniciando simulación automática de partida ${gameId}`)

    // Simular partida en background
    TestUtils.simulateGame(testGameManager, gameId)
      .then(() => {
        logger.info(`✅ Simulación de partida ${gameId} completada`)
      })
      .catch((error) => {
        logger.error(`❌ Error en simulación de partida ${gameId}: ${error}`)
      })

    res.json({
      success: true,
      message: "Simulación iniciada en background",
      gameId,
      note: "La simulación se ejecuta automáticamente. Usa GET /test/game/:gameId para ver el progreso.",
    })
  } catch (error) {
    logger.error(`Starting simulation: ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al iniciar simulación",
    })
  }
})

/**
 * POST /test/action/:gameId
 * Ejecutar una acción específica en una partida
 */
router.post("/action/:gameId", (req, res) => {
  try {
    const { gameId } = req.params
    const { playerId, action } = req.body

    if (!playerId || !action) {
      return res.status(400).json({
        success: false,
        error: "Se requiere playerId y action en el body",
      })
    }

    const game = activeGames.get(gameId)
    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Partida no encontrada",
      })
    }

    const result = game.playAction(playerId, action)

    res.json({
      success: result.success,
      result,
      gameState: game.getPublicGameState(),
    })
  } catch (error) {
    logger.error(`Error executing action: ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al ejecutar acción",
    })
  }
})

/**
 * POST /test/discard/:gameId
 * Descartar cartas para un jugador específico
 */
router.post("/discard/:gameId", (req, res) => {
  try {
    const { gameId } = req.params
    const { playerId, cardIndices } = req.body

    if (!playerId || !Array.isArray(cardIndices)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere playerId y cardIndices (array) en el body",
      })
    }

    const game = activeGames.get(gameId)
    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Partida no encontrada",
      })
    }

    const result = game.discardCards(playerId, cardIndices)

    res.json({
      success: result.success,
      message: result.message,
      gameState: game.getPublicGameState(),
      playerHand: game.getPlayerHand(playerId),
    })
  } catch (error) {
    logger.error(`discarding cards: ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al descartar cartas",
    })
  }
})

/**
 * GET /test/hands/:gameId
 * Ver las manos de todos los jugadores (solo para testing)
 */
router.get("/hands/:gameId", (req, res) => {
  try {
    const { gameId } = req.params
    const game = activeGames.get(gameId)

    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Partida no encontrada",
      })
    }

    const gameState = game.getGameState()
    const hands = gameState.players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      hand: game.getPlayerHand(player.id),
      handEvaluation: game.evaluateAllHands().find((h) => h.playerId === player.id),
    }))

    res.json({
      success: true,
      gameId,
      currentPhase: gameState.currentPhase,
      hands,
    })
  } catch (error) {
    logger.error(`Error getting hands: ${error}` )
    res.status(500).json({
      success: false,
      error: "Error al obtener manos",
    })
  }
})

/**
 * POST /test/set-hand/:gameId
 * Establecer una mano específica para un jugador (testing)
 */
router.post("/set-hand/:gameId", (req, res) => {
  try {
    const { gameId } = req.params
    const { playerId, handType } = req.body

    const game = activeGames.get(gameId)
    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Partida no encontrada",
      })
    }

    const player = game.getPlayer(playerId)
    if (!player) {
      return res.status(404).json({
        success: false,
        error: "Jugador no encontrado",
      })
    }

    const testHands = TestUtils.createTestHands()
    const selectedHand = testHands[handType]

    if (!selectedHand) {
      return res.status(400).json({
        success: false,
        error: "Tipo de mano no válido",
        availableHands: Object.keys(testHands),
      })
    }

    TestUtils.setPlayerHand(player, selectedHand)

    res.json({
      success: true,
      message: `Mano ${handType} establecida para ${player.name}`,
      playerHand: game.getPlayerHand(playerId),
    })
  } catch (error) {
    logger.error(`Error setting hand: ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al establecer mano",
    })
  }
})

/**
 * GET /test/run-basic
 * Ejecutar tests básicos del sistema
 */
router.get("/run-basic", (req, res) => {
  try {
    // Capturar logs de los tests
    const originalLog = logger.info
    const originalError = logger.error
    const logs: string[] = []

    logger.info = (message: string) => {
      logs.push(`INFO: ${message}`)
      originalLog(message)
    }

    logger.error = (message: string, error?: any) => {
      logs.push(`ERROR: ${message} ${error ? JSON.stringify(error) : ""}`)
      originalError(message)
    }

    // Ejecutar tests
    TestUtils.runBasicTests()

    // Restaurar logger
    logger.info = originalLog
    logger.error = originalError

    res.json({
      success: true,
      message: "Tests básicos ejecutados",
      logs,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error(`Error running basic tests: ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al ejecutar tests básicos",
    })
  }
})

/**
 * DELETE /test/cleanup
 * Limpiar todas las partidas de prueba
 */
router.delete("/cleanup", (req, res) => {
  try {
    const gameCount = activeGames.size

    activeGames.clear()
    testGameManager = null

    logger.info(`🧹 Limpieza completada: ${gameCount} partidas eliminadas`)

    res.json({
      success: true,
      message: `${gameCount} partidas de prueba eliminadas`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error(`during cleanup ${error}`)
    res.status(500).json({
      success: false,
      error: "Error durante la limpieza",
    })
  }
})

/**
 * GET /test/available-hands
 * Obtener tipos de manos disponibles para testing
 */
router.get("/available-hands", (req, res) => {
  try {
    const testHands = TestUtils.createTestHands()

    res.json({
      success: true,
      availableHands: Object.keys(testHands),
      handDetails: Object.entries(testHands).map(([name, cards]) => ({
        name,
        cards: cards.map((card) => `${card.value} de ${card.suit}`),
        description: name,
      })),
    })
  } catch (error) {
    logger.error(`getting available hands ${error}`)
    res.status(500).json({
      success: false,
      error: "Error al obtener manos disponibles",
    })
  }
})

export default router;
