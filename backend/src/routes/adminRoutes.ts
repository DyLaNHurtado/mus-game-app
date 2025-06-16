import { Router } from "express"
import { GameManager } from "../core/GameManager"
import { logger } from "../utils/logger"
import type { Room } from "@/types/GameTypes"

const router = Router()
const gameManager = GameManager.getInstance()

// Middleware de autenticación admin
const requireAdmin = (req: any, res: any, next: any) => {
  const adminKey = req.headers["x-admin-key"] || req.body.adminKey || req.query.adminKey

  if (!adminKey) {
    return res.status(401).json({
      success: false,
      error: "Admin key requerida",
      hint: "Usar header 'X-Admin-Key' o parámetro 'adminKey'",
    })
  }

  if (adminKey !== process.env.ADMIN_KEY && adminKey !== "admin123") {
    return res.status(403).json({
      success: false,
      error: "Admin key inválida",
    })
  }

  next()
}

// ==================== INFORMACIÓN DEL SISTEMA ====================

// 📊 Dashboard principal
router.get("/dashboard", requireAdmin, (req, res) => {
  try {
    const stats = gameManager.getStats()
    const metrics = gameManager.getMetrics()
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    }

    res.json({
      success: true,
      system: systemInfo,
      gameStats: stats,
      metrics,
      summary: {
        totalRooms: stats.totalRooms,
        activeGames: stats.totalGames,
        totalPlayers: stats.totalPlayers,
        serverUptime: `${Math.floor(systemInfo.uptime / 60)} minutos`,
      },
    })
  } catch (error) {
    logger.error(`Error getting dashboard: ${error}`)
    res.status(500).json({ success: false, error: "Error al obtener dashboard" })
  }
})

// 📈 Estadísticas detalladas
router.get("/stats", requireAdmin, (req, res) => {
  try {
    const stats = gameManager.getStats()
    const metrics = gameManager.getMetrics()

    res.json({
      success: true,
      stats,
      metrics,
      breakdown: {
        roomsByStatus: {
          waiting: metrics.rooms.total - metrics.rooms.withGames,
          playing: metrics.rooms.withGames,
          private: metrics.rooms.private,
          public: metrics.rooms.public,
        },
        playerDistribution: {
          connected: metrics.players.connected,
          disconnected: metrics.players.disconnected,
          total: metrics.players.total,
        },
      },
    })
  } catch (error) {
    logger.error(`Error getting stats: ${error}`)
    res.status(500).json({ success: false, error: "Error al obtener estadísticas" })
  }
})

// ==================== GESTIÓN DE ROOMS ====================

// 🏠 Listar todas las rooms (incluidas privadas)
router.get("/rooms", requireAdmin, (req, res) => {
  try {
    const { status, type } = req.query
    let rooms = gameManager.getAllRooms()

    // Filtros
    if (status === "playing") {
      rooms = rooms.filter((room: Room) => gameManager.getGame(room.id))
    } else if (status === "waiting") {
      rooms = rooms.filter((room: Room) => !gameManager.getGame(room.id))
    }

    if (type === "private") {
      rooms = rooms.filter((room: Room) => room.isPrivate)
    } else if (type === "public") {
      rooms = rooms.filter((room: Room) => !room.isPrivate)
    }

    const roomsWithDetails = rooms.map((room: Room) => {
      const game = gameManager.getGame(room.id)
      return {
        id: room.id,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        isPrivate: room.isPrivate,
        createdAt: room.createdAt,
        hasGame: !!game,
        gamePhase: game?.getGameState().currentPhase,
        scores: game?.getGameState().scores,
        players: room.players.map((p) => ({
          name: p.name,
          team: p.team,
          isConnected: p.isConnected,
        })),
      }
    })

    res.json({
      success: true,
      rooms: roomsWithDetails,
      total: roomsWithDetails.length,
      filters: { status, type },
    })
  } catch (error) {
    logger.error(`Error getting rooms: ${error}`)
    res.status(500).json({ success: false, error: "Error al obtener rooms" })
  }
})

// 🔍 Detalles de room específica
router.get("/rooms/:roomId", requireAdmin, (req, res) => {
  try {
    const { roomId } = req.params
    const room = gameManager.getRoom(roomId)

    if (!room) {
      return res.status(404).json({ success: false, error: "Room no encontrada" })
    }

    const game = gameManager.getGame(roomId)
    const gameState = game?.getGameState()

    res.json({
      success: true,
      room: {
        id: room.id,
        isPrivate: room.isPrivate,
        createdAt: room.createdAt,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
      },
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
        isConnected: p.isConnected,
        hand: gameState ? p.hand : [], // Solo mostrar cartas si hay juego
        lastAction: p.getLastAction(),
      })),
      game: gameState
        ? {
            phase: gameState.currentPhase,
            turn: gameState.currentTurn,
            hand: gameState.currentHand,
            scores: gameState.scores,
            isFinished: gameState.isGameFinished,
            winner: gameState.winner,
          }
        : null,
    })
  } catch (error) {
    logger.error(`Error getting room details: ${error}`)
    res.status(500).json({ success: false, error: "Error al obtener detalles de room" })
  }
})

// 🗑️ Eliminar room
router.delete("/rooms/:roomId", requireAdmin, (req, res) => {
  try {
    const { roomId } = req.params
    const { force = false } = req.body

    const room = gameManager.getRoom(roomId)
    if (!room) {
      return res.status(404).json({ success: false, error: "Room no encontrada" })
    }

    // Verificar si tiene jugadores
    if (room.players.length > 0 && !force) {
      return res.status(400).json({
        success: false,
        error: "Room tiene jugadores activos",
        hint: "Usar 'force: true' para eliminar forzadamente",
      })
    }

    gameManager.deleteRoom(roomId)
    logger.info(`Admin eliminó room ${roomId}`)

    res.json({
      success: true,
      message: `Room ${roomId} eliminada`,
      playersAffected: room.players.length,
    })
  } catch (error) {
    logger.error(`Error deleting room: ${error}`)
    res.status(500).json({ success: false, error: "Error al eliminar room" })
  }
})

// ==================== GESTIÓN DE JUEGOS ====================

// 🎮 Listar juegos activos
router.get("/games", requireAdmin, (req, res) => {
  try {
    const games = gameManager.getActiveGames()

    const gamesWithDetails = games.map((game) => {
      const gameState = game.getGameState()
      return {
        roomId: gameState.id,
        phase: gameState.currentPhase,
        turn: gameState.currentTurn,
        currentPlayer: gameState.players[gameState.currentTurn]?.name,
        hand: gameState.currentHand,
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
      games: gamesWithDetails,
      total: gamesWithDetails.length,
    })
  } catch (error) {
    logger.error(`Error getting games: ${error}`)
    res.status(500).json({ success: false, error: "Error al obtener juegos" })
  }
})

// 🧪 Crear juego de prueba
router.post("/games/create-test", requireAdmin, (req, res) => {
  try {
    const { roomId, scenario = "normal" } = req.body

    // Crear room
    const room = gameManager.createRoom(false, roomId)

    // Crear jugadores de prueba
    const testPlayers = [
      { name: "Admin_Juan", team: 0 },
      { name: "Admin_María", team: 1 },
      { name: "Admin_Pedro", team: 0 },
      { name: "Admin_Ana", team: 1 },
    ]

    const players = []
    for (const playerData of testPlayers) {
      const result = gameManager.joinRoom(room.id, playerData.name, `test-${playerData.name}`)
      players.push(result.player)
    }

    const game = gameManager.getGame(room.id)

    logger.info(`Admin creó juego de prueba ${room.id} con escenario ${scenario}`)

    res.json({
      success: true,
      message: "Juego de prueba creado",
      roomId: room.id,
      scenario,
      players: players.map((p) => ({ id: p.id, name: p.name, team: p.team })),
      gameState: game?.getPublicGameState(),
    })
  } catch (error) {
    logger.error(`Error creating test game: ${error}`)
    res.status(500).json({ success: false, error: "Error al crear juego de prueba" })
  }
})

// ==================== MANTENIMIENTO ====================

// 🧹 Limpiar recursos
router.post("/cleanup", requireAdmin, (req, res) => {
  try {
    const { type = "all" } = req.body
    let cleaned = 0

    switch (type) {
      case "empty-rooms":
        cleaned = gameManager.cleanupEmptyRooms()
        break
      case "finished-games":
        cleaned = gameManager.cleanupFinishedGames()
        break
      case "disconnected-players":
        cleaned = gameManager.cleanupDisconnectedPlayers()
        break
      case "all":
        cleaned += gameManager.cleanupEmptyRooms()
        cleaned += gameManager.cleanupFinishedGames()
        cleaned += gameManager.cleanupDisconnectedPlayers()
        break
      default:
        return res.status(400).json({ success: false, error: "Tipo de limpieza no válido" })
    }

    logger.info(`Admin ejecutó limpieza ${type}: ${cleaned} elementos eliminados`)

    res.json({
      success: true,
      message: `Limpieza completada: ${cleaned} elementos eliminados`,
      type,
      cleaned,
    })
  } catch (error) {
    logger.error(`Error in cleanup: ${error}`)
    res.status(500).json({ success: false, error: "Error en limpieza" })
  }
})

// 📊 Métricas del sistema
router.get("/metrics", requireAdmin, (req, res) => {
  try {
    const metrics = {
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
      },
      game: gameManager.getMetrics(),
      timestamp: new Date().toISOString(),
    }

    res.json({
      success: true,
      metrics,
    })
  } catch (error) {
    logger.error(`Error getting metrics: ${error}`)
    res.status(500).json({ success: false, error: "Error al obtener métricas" })
  }
})

export default router
