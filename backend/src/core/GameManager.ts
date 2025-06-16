import type { Room } from "@/types/GameTypes"
import { Player } from "./Player"
import { Game } from "./Game"
import { logger } from "@/utils/logger"
import { GAME_CONFIG } from "@/config/constants"

export class GameManager {
  private rooms: Map<string, Room> = new Map()
  private games: Map<string, Game> = new Map()
  private playerToRoom: Map<string, string> = new Map()

  private static _instance: GameManager

  public static getInstance(): GameManager {
    if (this._instance == null) {
      this._instance = new GameManager()
    }
    return this._instance
  }

  // ==================== MÉTODOS EXISTENTES ====================

  // Get todas las rooms publicas
  public getRooms(onlyPublic = true): Room[] {
    if (this.rooms.size === 0) return []

    const roomsArray = Array.from(this.rooms.values())
    return onlyPublic ? roomsArray.filter((room) => !room.isPrivate) : roomsArray
  }

  // Crear nueva room
  createRoom(isPrivate = false, customRoomId?: string): Room {
    const roomId = customRoomId || this.generateRoomId()

    const room: Room = {
      id: roomId,
      players: [],
      createdAt: new Date(),
      inGame: false,
      isPrivate,
      maxPlayers: GAME_CONFIG.MAX_PLAYERS,
    }

    this.rooms.set(roomId, room)
    logger.info(`Creando nueva room ${isPrivate ? `privada` : `publica`} : ${roomId}...`)

    return room
  }

  // Obtener room por ID
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  // Unir jugador a room
  joinRoom(roomId: string, playerName: string, socketId: string): { room: Room; player: Player } {
    let room = this.getRoom(roomId)

    // Si la room no existe, crearla
    if (!room) {
      room = this.createRoom(false, roomId)
    }

    // Verificar si la room está llena
    if (room.players.length >= room.maxPlayers) {
      throw new Error("La room está llena")
    }

    // Verificar si ya hay una room en curso
    if (room.gameState && !room.gameState.isGameFinished) {
      // Intentar reconectar jugador existente
      const existingPlayer = room.players.find((p) => p.name === playerName)
      if (existingPlayer && !existingPlayer.isConnected) {
        existingPlayer.reconnect(socketId)
        this.playerToRoom.set(existingPlayer.id, roomId)
        logger.info(`Jugador reconectado: ${playerName}`)
        return { room, player: existingPlayer }
      } else {
        throw new Error("La room ya ha comenzado")
      }
    }

    // Verificar nombre duplicado
    if (room.players.some((p) => p.name === playerName)) {
      throw new Error("Ya existe un jugador con ese nombre")
    }

    // Crear nuevo jugador
    const position = room.players.length as 0 | 1 | 2 | 3
    const team = (position % 2) as 0 | 1
    const playerId = this.generatePlayerId()

    const player = new Player(playerId, playerName, team, position, socketId)

    // Añadir jugador a la room
    room.players.push(player)
    this.playerToRoom.set(player.id, roomId)

    logger.info(`Jugador ${playerName} se unió a la room ${roomId} (${room.players.length}/${room.maxPlayers})`)

    // Auto-iniciar si hay 4 jugadores
    if (room.players.length === GAME_CONFIG.MAX_PLAYERS) {
      this.startGame(roomId)
    }

    return { room, player }
  }

  // Salir de room
  leaveRoom(playerId: string): { room: Room | undefined; player: Player | undefined } {
    const roomId = this.playerToRoom.get(playerId)
    if (!roomId) {
      return { room: undefined, player: undefined }
    }

    const room = this.getRoom(roomId)
    if (!room) {
      return { room: undefined, player: undefined }
    }

    const playerIndex = room.players.findIndex((p) => p.id === playerId)
    if (playerIndex === -1) {
      return { room, player: undefined }
    }

    const player = room.players[playerIndex]

    // Si hay room en curso, marcar como desconectado en lugar de eliminar
    if (room.gameState && !room.gameState.isGameFinished) {
      player.disconnect()
      logger.info(`Jugador ${player.name} se desconectó durante la room en la room ${roomId}`)
    } else {
      // Eliminar jugador si no hay room
      room.players.splice(playerIndex, 1)
      this.playerToRoom.delete(playerId)
      logger.info(`Jugador ${player.name} salió de la room ${roomId}`)
    }

    // Eliminar room si está vacía y no hay room
    if (room.players.length === 0 || room.players.every((p) => !p.isConnected)) {
      this.deleteRoom(roomId)
    }

    return { room, player }
  }

  // Iniciar room
  startGame(roomId: string): Game {
    const room = this.getRoom(roomId)
    if (!room) {
      throw new Error("room no encontrada")
    }

    if (room.players.length !== GAME_CONFIG.MAX_PLAYERS) {
      throw new Error("Se necesitan 4 jugadores para iniciar")
    }

    if (room.gameState && !room.gameState.isGameFinished) {
      throw new Error("Ya hay una room en curso")
    }

    // Crear nueva room
    const game = new Game(roomId, room.players)
    this.games.set(roomId, game)

    // Actualizar estado de la room
    room.gameState = game.getGameState()
    room.inGame = true

    logger.info(`room iniciada con 4 jugadores en la room ${roomId}`)

    return game
  }

  // Obtener room
  getGame(roomId: string): Game | undefined {
    return this.games.get(roomId)
  }

  // Eliminar room
  public deleteRoom(roomId: string): void {
    const room = this.getRoom(roomId)
    if (room) {
      // Limpiar referencias de jugadores
      room.players.forEach((player) => {
        this.playerToRoom.delete(player.id)
      })

      // Eliminar room si existe
      this.games.delete(roomId)

      // Eliminar room
      this.rooms.delete(roomId)

      logger.info(`room ${roomId} eliminada`)
    }
  }

  // ==================== MÉTODOS NUEVOS PARA ADMIN ====================

  // Obtener todas las rooms (incluidas privadas)
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values())
  }

  // Obtener todos los juegos activos
  getActiveGames(): Game[] {
    return Array.from(this.games.values())
  }

  // Limpiar rooms vacías
  cleanupEmptyRooms(): number {
    let cleaned = 0
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.players.length === 0) {
        this.deleteRoom(roomId)
        cleaned++
      }
    }
    return cleaned
  }

  // Limpiar juegos terminados
  cleanupFinishedGames(): number {
    let cleaned = 0
    for (const [roomId, game] of this.games.entries()) {
      if (game.isGameFinished()) {
        this.games.delete(roomId)
        const room = this.getRoom(roomId)
        if (room) {
          room.inGame = false
        }
        cleaned++
      }
    }
    return cleaned
  }

  // Limpiar jugadores desconectados
  cleanupDisconnectedPlayers(): number {
    let cleaned = 0
    for (const room of this.rooms.values()) {
      const disconnectedCount = room.players.filter((p) => !p.isConnected).length
      room.players = room.players.filter((p) => p.isConnected)
      cleaned += disconnectedCount

      // Si la room queda vacía, eliminarla
      if (room.players.length === 0) {
        this.deleteRoom(room.id)
      }
    }
    return cleaned
  }

  // Obtener métricas del sistema
  getMetrics() {
    const rooms = Array.from(this.rooms.values())
    const games = Array.from(this.games.values())

    return {
      rooms: {
        total: rooms.length,
        public: rooms.filter((r) => !r.isPrivate).length,
        private: rooms.filter((r) => r.isPrivate).length,
        withGames: rooms.filter((r) => r.inGame).length,
      },
      games: {
        total: games.length,
        finished: games.filter((g) => g.isGameFinished()).length,
        active: games.filter((g) => !g.isGameFinished()).length,
      },
      players: {
        total: rooms.reduce((sum, room) => sum + room.players.length, 0),
        connected: rooms.reduce((sum, room) => sum + room.players.filter((p) => p.isConnected).length, 0),
        disconnected: rooms.reduce((sum, room) => sum + room.players.filter((p) => !p.isConnected).length, 0),
      },
    }
  }

  // Broadcast a todos los clientes (placeholder)
  broadcastToAll(event: string, data: any): void {
    logger.info(`Broadcasting ${event} to all clients:`, data)
    // Implementar cuando tengas WebSocket
  }

  // ==================== MÉTODOS EXISTENTES ====================

  // Generar ID único para room
  private generateRoomId(): string {
    let roomId: string
    do {
      roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    } while (this.rooms.has(roomId))

    return roomId
  }

  // Generar ID único para jugador
  private generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  // Obtener jugador por socket ID
  getPlayerBySocketId(socketId: string): { player: Player; roomId: string } | undefined {
    for (const [roomId, room] of this.rooms) {
      const player = room.players.find((p) => p.socketId === socketId)
      if (player) {
        return { player, roomId }
      }
    }
    return undefined
  }

  // Obtener estadísticas
  getStats() {
    const totalRooms = this.rooms.size
    const totalGames = this.games.size
    const totalPlayers = Array.from(this.rooms.values()).reduce((sum, room) => sum + room.players.length, 0)
    const connectedPlayers = Array.from(this.rooms.values()).reduce(
      (sum, room) => sum + room.players.filter((p) => p.isConnected).length,
      0,
    )

    return {
      totalRooms,
      totalGames,
      totalPlayers,
      connectedPlayers,
      timestamp: new Date().toISOString(),
      rooms: Array.from(this.rooms.values()).map((room) => ({
        id: room.id,
        playerCount: room.players.length,
        hasGame: this.games.has(room.id),
        isPrivate: room.isPrivate,
      })),
    }
  }

  // Obtener contadores para health check
  getActiveRoomsCount(): number {
    return this.rooms.size
  }

  getActivePlayersCount(): number {
    return Array.from(this.rooms.values()).reduce(
      (sum, room) => sum + room.players.filter((p) => p.isConnected).length,
      0,
    )
  }

  // Limpiar rooms inactivas (ejecutar periódicamente)
  cleanupInactiveRooms(): void {
    const now = new Date()
    const inactiveThreshold = 2 * 60 * 60 * 1000 // 2 horas

    for (const [roomId, room] of this.rooms) {
      const isInactive = now.getTime() - room.createdAt.getTime() > inactiveThreshold
      const hasNoConnectedPlayers = room.players.every((p) => !p.isConnected)
      const hasNoGameOrFinished = !room.gameState || room.gameState.isGameFinished

      if (isInactive && hasNoConnectedPlayers && hasNoGameOrFinished) {
        this.deleteRoom(roomId)
        logger.info(`room inactiva eliminada: ${roomId}`)
      }
    }
  }
}
