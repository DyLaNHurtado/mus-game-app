import type { Server, Socket } from "socket.io";
import type { GameManager } from "@/core/GameManager";
import { logger } from "@/utils/logger";
import { SocketEvents, SocketData, ClientToServerEvents, ServerToClientEvents } from "@/types/SocketTypes";
import {
  JoinRoomSchema,
  PlayActionSchema,
  DiscardCardsSchema,
  ReconnectSchema,
  ValidationError,
} from "@/utils/validators";
import type {
  InterServerEvents,
} from "@/types/GameTypes";
import { ErrorMessages } from "@/types/ErrorTypes";

export class SocketHandler {
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private gameManager: GameManager;

  constructor(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    gameManager: GameManager,
  ) {
    this.io = io;
    this.gameManager = gameManager;
  }

  initialize(): void {
    this.io.on("connection", (socket) => {
      logger.socket(`Cliente conectado`, socket.id);

      // Registrar todos los eventos
      this.registerEvents(socket);

      // Manejar desconexión
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });

    // Limpiar salas inactivas cada 30 minutos
    setInterval(
      () => {
        this.gameManager.cleanupInactiveRooms();
      },
      30 * 60 * 1000,
    );

    logger.info("SocketHandler inicializado");
  }

  private registerEvents(socket: Socket): void {
    socket.on(SocketEvents.JOIN_ROOM, (data) => {
      this.handleJoinRoom(socket, data);
    });

    socket.on(SocketEvents.LEAVE_ROOM, () => {
      this.handleLeaveRoom(socket);
    });

    socket.on(SocketEvents.START_GAME, () => {
      this.handleStartGame(socket);
    });

    socket.on(SocketEvents.DISCARD_CARDS, (cardIndices) => {
      this.handleDiscardCards(socket, cardIndices);
    });

    socket.on(SocketEvents.PLAY_ACTION, (action) => {
      this.handlePlayAction(socket, action);
    });

    socket.on(SocketEvents.RECONNECT, (data) => {
      this.handleReconnect(socket, data);
    });
  }

  private handleJoinRoom(socket: Socket, data: { roomId: string; playerName: string }): void {
    try {
      // Validar datos
      const validatedData = JoinRoomSchema.parse(data);

      // Unirse a la sala
      const { room, player } = this.gameManager.joinRoom(
        validatedData.roomId,
        validatedData.playerName,
        socket.id,
      );

      // Guardar datos en el socket
      socket.data.playerId = player.id;
      socket.data.roomId = room.id;

      // Unirse al room de Socket.IO
      socket.join(room.id);

      // Notificar al jugador que se unió
      socket.emit(SocketEvents.ROOM_JOINED, {
        room,
        playerId: player.id,
      });

      // Notificar a otros jugadores
      socket.to(room.id).emit(SocketEvents.PLAYER_JOINED, player.getPublicInfo());

      // Si hay una partida en curso, enviar estado actual
      if (room.gameState && !room.gameState.isGameFinished) {
        const game = this.gameManager.getGame(room.id);
        if (game) {
          socket.emit(SocketEvents.GAME_STATE_UPDATE, game.getGameState(player.id));
          socket.emit(SocketEvents.HAND_UPDATE, game.getPlayerHand(player.id));
        }
      }

      logger.socket(`Jugador ${player.name} se unió a sala ${room.id}`, socket.id);
    } catch (error) {
      logger.error("Error en joinRoom:", error);
      socket.emit(SocketEvents.ERROR, this.getErrorMessage(error));
    }
  }

  private handleLeaveRoom(socket: Socket): void {
    try {
      const playerId = socket.data.playerId;
      if (!playerId) {
        return;
      }

      const { room, player } = this.gameManager.leaveRoom(playerId);

      if (room && player) {
        // Salir del room de Socket.IO
        socket.leave(room.id);

        // Limpiar datos del socket
        socket.data.playerId = undefined;
        socket.data.roomId = undefined;

        // Notificar a otros jugadores
        if (player.isConnected) {
          socket.to(room.id).emit(SocketEvents.PLAYER_LEFT, player.id);
        } else {
          socket.to(room.id).emit(SocketEvents.PLAYER_DISCONNECTED, player.id);
        }

        logger.socket(`Jugador ${player.name} salió de sala ${room.id}`, socket.id);
      }
    } catch (error) {
      logger.error("Error en leaveRoom:", error);
      socket.emit(SocketEvents.ERROR, this.getErrorMessage(error));
    }
  }

  private handleStartGame(socket: Socket): void {
    try {
      const roomId = socket.data.roomId;
      if (!roomId) {
        throw new Error(ErrorMessages.ROOM_NOT_FOUND);
      }

      const game = this.gameManager.startGame(roomId);
      const gameState = game.getPublicGameState();

      // Notificar a todos los jugadores que empezó la partida
      this.io.to(roomId).emit(SocketEvents.GAME_STARTED, gameState);

      // Enviar mano privada a cada jugador
      const room = this.gameManager.getRoom(roomId);
      if (room) {
        room.players.forEach((player) => {
          const playerSocket = this.getSocketByPlayerId(player.id);
          if (playerSocket) {
            playerSocket.emit(SocketEvents.HAND_UPDATE, game.getPlayerHand(player.id));
          }
        });
      }

      logger.game(`Partida iniciada`, roomId);
    } catch (error) {
      logger.error("Error en startGame:", error);
      socket.emit(SocketEvents.ERROR, this.getErrorMessage(error));
    }
  }

  private handleDiscardCards(socket: Socket, cardIndices: number[]): void {
    try {
      // Validar datos
      const validatedData = DiscardCardsSchema.parse({ cardIndices });

      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      if (!playerId || !roomId) {
        throw new Error(ErrorMessages.PLAYER_NOT_FOUND);
      }

      // TODO: Implementar lógica de descarte en el Game
      // const game = this.gameManager.getGame(roomId);
      // if (!game) {
      //   throw new Error(ErrorMessages.ROOM_NOT_FOUND);
      // }

      // game.discardCards(playerId, validatedData.cardIndices);

      logger.socket(`Jugador descartó cartas: ${validatedData.cardIndices}`, socket.id);
    } catch (error) {
      logger.error("Error en discardCards:", error);
      socket.emit(SocketEvents.ERROR, this.getErrorMessage(error));
    }
  }

  private handlePlayAction(socket: Socket, action: any): void {
    try {
      // Validar datos
      const validatedAction = PlayActionSchema.parse(action);

      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      if (!playerId || !roomId) {
        throw new Error(ErrorMessages.PLAYER_NOT_FOUND);
      }

      // TODO: Implementar lógica de acciones en el Game
      // const game = this.gameManager.getGame(roomId);
      // if (!game) {
      //   throw new Error(ErrorMessages.ROOM_NOT_FOUND);
      // }

      // game.playAction(playerId, validatedAction);

      logger.socket(`Jugador jugó acción: ${validatedAction.type}`, socket.id);
    } catch (error) {
      logger.error("Error en playAction:", error);
      socket.emit(SocketEvents.ERROR, this.getErrorMessage(error));
    }
  }

  private handleReconnect(socket: Socket, data: { roomId: string; playerId: string }): void {
    try {
      // Validar datos
      const validatedData = ReconnectSchema.parse(data);

      const room = this.gameManager.getRoom(validatedData.roomId);
      if (!room) {
        throw new Error(ErrorMessages.ROOM_NOT_FOUND);
      }

      const game = this.gameManager.getGame(validatedData.roomId);
      if (!game) {
        throw new Error(ErrorMessages.ROOM_NOT_FOUND);
      }

      // Reconectar jugador
      const success = game.reconnectPlayer(validatedData.playerId, socket.id);
      if (!success) {
        throw new Error(ErrorMessages.PLAYER_NOT_FOUND);
      }

      // Actualizar datos del socket
      socket.data.playerId = validatedData.playerId;
      socket.data.roomId = validatedData.roomId;

      // Unirse al room
      socket.join(validatedData.roomId);

      // Enviar estado actual
      socket.emit(SocketEvents.GAME_STATE_UPDATE, game.getGameState(validatedData.playerId));
      socket.emit(SocketEvents.HAND_UPDATE, game.getPlayerHand(validatedData.playerId));

      // Notificar a otros jugadores
      socket.to(validatedData.roomId).emit(SocketEvents.PLAYER_RECONNECTED, validatedData.playerId);

      logger.socket(`Jugador reconectado`, socket.id);
    } catch (error) {
      logger.error("Error en reconnect:", error);
      socket.emit(SocketEvents.ERROR, this.getErrorMessage(error));
    }
  }

  private handleDisconnect(socket: Socket): void {
    const playerId = socket.data.playerId;
    const roomId = socket.data.roomId;

    if (playerId && roomId) {
      // Marcar como desconectado pero no eliminar
      const playerInfo = this.gameManager.getPlayerBySocketId(socket.id);
      if (playerInfo) {
        playerInfo.player.disconnect();

        // Notificar a otros jugadores
        socket.to(roomId).emit(SocketEvents.PLAYER_DISCONNECTED, playerId);

        logger.socket(`Jugador ${playerInfo.player.name} desconectado`, socket.id);
      }
    }

    logger.socket(`Cliente desconectado`, socket.id);
  }

  // Utilidades
  private getSocketByPlayerId(playerId: string): Socket | undefined {
    const playerInfo = this.gameManager.getPlayerBySocketId(""); // TODO: Mejorar búsqueda
    // Implementar búsqueda de socket por player ID
    return undefined;
  }

  private getErrorMessage(error: any): string {
    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return ErrorMessages.CONNECTION_ERROR;
  }

  // Métodos para enviar eventos desde el Game
  public emitToRoom(roomId: string, event: keyof ServerToClientEvents, data: any): void {
    this.io.to(roomId).emit(event, data);
  }

  public emitToPlayer(playerId: string, event: keyof ServerToClientEvents, data: any): void {
    // TODO: Implementar envío a jugador específico
  }
}
