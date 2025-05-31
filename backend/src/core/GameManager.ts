import { type Room } from "@/types/GameTypes";
import { Player } from "./Player";
import { Game } from "./Game";
import { logger } from "@/utils/logger";
import { GAME_CONFIG } from "@/config/constants";

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private games: Map<string, Game> = new Map();
  private playerToRoom: Map<string, string> = new Map();

  // Crear nueva sala
  createRoom(isPrivate = false): Room {
    const roomId = this.generateRoomId();

    const room: Room = {
      id: roomId,
      players: [],
      createdAt: new Date(),
      isPrivate,
      maxPlayers: GAME_CONFIG.MAX_PLAYERS,
    };

    this.rooms.set(roomId, room);
    logger.game(`Nueva sala creada: ${roomId}`, roomId);

    return room;
  }

  // Obtener sala por ID
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  // Unir jugador a sala
  joinRoom(roomId: string, playerName: string, socketId: string): { room: Room; player: Player } {
    let room = this.getRoom(roomId);

    // Si la sala no existe, crearla
    if (!room) {
      room = this.createRoom();
      room.id = roomId; // Usar el ID proporcionado
      this.rooms.set(roomId, room);
    }

    // Verificar si la sala está llena
    if (room.players.length >= room.maxPlayers) {
      throw new Error("La sala está llena");
    }

    // Verificar si ya hay una partida en curso
    if (room.gameState && !room.gameState.isGameFinished) {
      // Intentar reconectar jugador existente
      const existingPlayer = room.players.find((p) => p.name === playerName);
      if (existingPlayer && !existingPlayer.isConnected) {
        existingPlayer.reconnect(socketId);
        this.playerToRoom.set(existingPlayer.id, roomId);
        logger.game(`Jugador reconectado: ${playerName}`, roomId);
        return { room, player: existingPlayer };
      } else {
        throw new Error("La partida ya ha comenzado");
      }
    }

    // Verificar nombre duplicado
    if (room.players.some((p) => p.name === playerName)) {
      throw new Error("Ya existe un jugador con ese nombre");
    }

    // Crear nuevo jugador
    const position = room.players.length as 0 | 1 | 2 | 3;
    const player = new Player(playerName, socketId, position);

    // Añadir jugador a la sala
    room.players.push(player);
    this.playerToRoom.set(player.id, roomId);

    logger.game(
      `Jugador ${playerName} se unió a la sala (${room.players.length}/${room.maxPlayers})`,
      roomId,
    );

    // Auto-iniciar si hay 4 jugadores
    if (room.players.length === GAME_CONFIG.MAX_PLAYERS) {
      this.startGame(roomId);
    }

    return { room, player };
  }

  // Salir de sala
  leaveRoom(playerId: string): { room: Room | undefined; player: Player | undefined } {
    const roomId = this.playerToRoom.get(playerId);
    if (!roomId) {
      return { room: undefined, player: undefined };
    }

    const room = this.getRoom(roomId);
    if (!room) {
      return { room: undefined, player: undefined };
    }

    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      return { room, player: undefined };
    }

    const player = room.players[playerIndex];

    // Si hay partida en curso, marcar como desconectado en lugar de eliminar
    if (room.gameState && !room.gameState.isGameFinished) {
      player.disconnect();
      logger.game(`Jugador ${player.name} se desconectó durante la partida`, roomId);
    } else {
      // Eliminar jugador si no hay partida
      room.players.splice(playerIndex, 1);
      this.playerToRoom.delete(playerId);
      logger.game(`Jugador ${player.name} salió de la sala`, roomId);
    }

    // Eliminar sala si está vacía y no hay partida
    if (room.players.length === 0 || room.players.every((p) => !p.isConnected)) {
      this.deleteRoom(roomId);
    }

    return { room, player };
  }

  // Iniciar partida
  startGame(roomId: string): Game {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error("Sala no encontrada");
    }

    if (room.players.length !== GAME_CONFIG.MAX_PLAYERS) {
      throw new Error("Se necesitan 4 jugadores para iniciar");
    }

    if (room.gameState && !room.gameState.isGameFinished) {
      throw new Error("Ya hay una partida en curso");
    }

    // Crear nueva partida
    const game = new Game(roomId, room.players);
    this.games.set(roomId, game);

    // Actualizar estado de la sala
    room.gameState = game.getGameState();

    logger.game(`Partida iniciada con 4 jugadores`, roomId);

    return game;
  }

  // Obtener partida
  getGame(roomId: string): Game | undefined {
    return this.games.get(roomId);
  }

  // Eliminar sala
  private deleteRoom(roomId: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      // Limpiar referencias de jugadores
      room.players.forEach((player) => {
        this.playerToRoom.delete(player.id);
      });

      // Eliminar partida si existe
      this.games.delete(roomId);

      // Eliminar sala
      this.rooms.delete(roomId);

      logger.game(`Sala eliminada`, roomId);
    }
  }

  // Generar ID único para sala
  private generateRoomId(): string {
    let roomId: string;
    do {
      roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(roomId));

    return roomId;
  }

  // Obtener jugador por socket ID
  getPlayerBySocketId(socketId: string): { player: Player; roomId: string } | undefined {
    for (const [roomId, room] of this.rooms) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) {
        return { player, roomId };
      }
    }
    return undefined;
  }

  // Obtener estadísticas
  getStats() {
    const totalRooms = this.rooms.size;
    const totalGames = this.games.size;
    const totalPlayers = Array.from(this.rooms.values()).reduce(
      (sum, room) => sum + room.players.length,
      0,
    );
    const connectedPlayers = Array.from(this.rooms.values()).reduce(
      (sum, room) => sum + room.players.filter((p) => p.isConnected).length,
      0,
    );

    return {
      totalRooms,
      totalGames,
      totalPlayers,
      connectedPlayers,
      timestamp: new Date().toISOString(),
    };
  }

  // Obtener contadores para health check
  getActiveRoomsCount(): number {
    return this.rooms.size;
  }

  getActivePlayersCount(): number {
    return Array.from(this.rooms.values()).reduce(
      (sum, room) => sum + room.players.filter((p) => p.isConnected).length,
      0,
    );
  }

  // Limpiar salas inactivas (ejecutar periódicamente)
  cleanupInactiveRooms(): void {
    const now = new Date();
    const inactiveThreshold = 2 * 60 * 60 * 1000; // 2 horas

    for (const [roomId, room] of this.rooms) {
      const isInactive = now.getTime() - room.createdAt.getTime() > inactiveThreshold;
      const hasNoConnectedPlayers = room.players.every((p) => !p.isConnected);
      const hasNoGameOrFinished = !room.gameState || room.gameState.isGameFinished;

      if (isInactive && hasNoConnectedPlayers && hasNoGameOrFinished) {
        this.deleteRoom(roomId);
        logger.info(`Sala inactiva eliminada: ${roomId}`);
      }
    }
  }
}
