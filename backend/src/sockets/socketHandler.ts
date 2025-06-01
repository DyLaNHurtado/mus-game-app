import type { Server, Socket } from "socket.io";
import type { GameManager } from "@/core/GameManager";
import { logger } from "@/utils/logger";
import {
    SocketEvents,
    SocketData,
    ClientToServerEvents,
    ServerToClientEvents,
} from "@/types/SocketTypes";
import {
    JoinRoomSchema,
    PlayActionSchema,
    DiscardCardsSchema,
    ReconnectSchema,
    ValidationError,
} from "@/utils/validators";
import type { GameAction, InterServerEvents } from "@/types/GameTypes";
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
            logger.info(`Cliente conectado con Socket ${socket.id}`);

            // Registrar todos los eventos
            this.registerEvents(socket);

            // Manejar desconexión
            socket.on("disconnect", () => {
                this.handleDisconnect(socket);
            });
        });

        // Limpiar rooms inactivas cada 30 minutos
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

            // Unirse a la room
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

            logger.info(`Jugador ${player.name} se unió a room ${room.id} ${socket.id}`);
        } catch (error) {
            logger.error(`handleJoinRoom con datos: ${JSON.stringify(data)}`);
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

                logger.info(`Jugador ${player.name} salió de room ${room.id}, Socket:${socket.id}`);
            }
        } catch (error) {
            logger.error(`handleLeaveRoom con datos: ${JSON.stringify(socket.data)}`);
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

            logger.info(`Partida iniciada en ROOM${roomId}`);
        } catch (error) {
            logger.error(` handleStartGame: ${JSON.stringify(socket.data)}`);
            socket.emit(SocketEvents.ERROR, this.getErrorMessage(error));
        }
    }

    private handleDiscardCards(socket: Socket, cardIndices: number[]): void {
        try {
            // Validar datos
            const validatedData = DiscardCardsSchema.parse({ cardIndices })

            const playerId = socket.data.playerId
            const roomId = socket.data.roomId

            if (!playerId || !roomId) {
                throw new Error(ErrorMessages.PLAYER_NOT_FOUND)
            }

            const game = this.gameManager.getGame(roomId)
            if (!game) {
                throw new Error(ErrorMessages.ROOM_NOT_FOUND)
            }

            // Procesar descarte
            const result = game.discardCards(playerId, validatedData.cardIndices)

            if (result.success) {
                // Enviar mano actualizada al jugador
                socket.emit(SocketEvents.HAND_UPDATE, game.getPlayerHand(playerId))

                // Notificar a la room sobre el descarte
                this.io.to(roomId).emit(SocketEvents.ACTION_PLAYED, {
                    playerId,
                    action: {
                        type: "descarte" as any,
                        amount: validatedData.cardIndices.length,
                        timestamp: Date.now(),
                    },
                })

                // Enviar estado actualizado
                this.io.to(roomId).emit(SocketEvents.GAME_STATE_UPDATE, game.getPublicGameState())

                logger.info(`Jugador ${playerId} descartó ${validatedData.cardIndices.length} cartas en la room ${roomId}`)
            } else {
                socket.emit(SocketEvents.ERROR, result.message)
            }
        } catch (error) {
            logger.error(`handleDiscardCards con datos: ${JSON.stringify(socket.data)} y cartas: ${JSON.stringify(cardIndices)}`);
            socket.emit(SocketEvents.ERROR, this.getErrorMessage(error))
        }
    }

    private handlePlayAction(socket: Socket, action: any): void {
    try {
      // Validar datos
      const validatedAction = PlayActionSchema.parse(action)

      const playerId = socket.data.playerId
      const roomId = socket.data.roomId

      if (!playerId || !roomId) {
        throw new Error(ErrorMessages.PLAYER_NOT_FOUND)
      }

      const game = this.gameManager.getGame(roomId)
      if (!game) {
        throw new Error(ErrorMessages.ROOM_NOT_FOUND)
      }

      // Procesar acción
      const result = game.playAction(playerId, validatedAction)

      if (result.success) {
        // Notificar acción a todos los jugadores
        this.io.to(roomId).emit(SocketEvents.ACTION_PLAYED, {
          playerId,
          action: {
            ...validatedAction,
            timestamp: Date.now(),
          },
        })

        // Si la fase cambió, notificar
        if (result.newPhase) {
          this.io.to(roomId).emit(SocketEvents.PHASE_CHANGED, {
            phase: result.newPhase,
            currentTurn: result.nextTurn || 0,
          })
        }

        // Si la fase se completó, enviar resultado
        if (result.phaseComplete && result.winner !== undefined) {
          this.io.to(roomId).emit(SocketEvents.PHASE_RESULT, {
            winner: result.winner,
            points: result.points || 0,
            phase: game.getGameState().currentPhase,
          })
        }

        // Enviar estado actualizado
        this.io.to(roomId).emit(SocketEvents.GAME_STATE_UPDATE, game.getPublicGameState())

        // Verificar si el juego terminó
        if (game.isGameFinished()) {
          this.io.to(roomId).emit(SocketEvents.GAME_ENDED, {
            winner: game.getWinner()!,
            finalScores: game.getGameState().scores,
          })
        }

        logger.info(`Jugador ${playerId} jugó acción: ${validatedAction.type} - ${result.message} en la room ${roomId}`)
      } else {
        socket.emit(SocketEvents.ERROR, result.message)
      }
    } catch (error) {
      logger.error(`handlePlayAction con datos: ${JSON.stringify(socket.data)} y acción: ${JSON.stringify(action)}`);
      socket.emit(SocketEvents.ERROR, this.getErrorMessage(error))
    }
  }

    private handleReconnect(socket: Socket, data: { roomId: string; playerId: string }): void {
        try {
        // Validar datos
        const validatedData = ReconnectSchema.parse(data)

        const room = this.gameManager.getRoom(validatedData.roomId)
        if (!room) {
            throw new Error(ErrorMessages.ROOM_NOT_FOUND)
        }

        const game = this.gameManager.getGame(validatedData.roomId)
        if (!game) {
            throw new Error(ErrorMessages.ROOM_NOT_FOUND)
        }

        // Reconectar jugador
        const success = game.reconnectPlayer(validatedData.playerId, socket.id)
        if (!success) {
            throw new Error(ErrorMessages.PLAYER_NOT_FOUND)
        }

        // Actualizar datos del socket
        socket.data.playerId = validatedData.playerId
        socket.data.roomId = validatedData.roomId

        // Unirse al room
        socket.join(validatedData.roomId)

        // Enviar estado actual
        socket.emit(SocketEvents.GAME_STATE_UPDATE, game.getGameState(validatedData.playerId))
        socket.emit(SocketEvents.HAND_UPDATE, game.getPlayerHand(validatedData.playerId))

        // Notificar a otros jugadores
        socket.to(validatedData.roomId).emit(SocketEvents.PLAYER_RECONNECTED, validatedData.playerId)

        logger.info(`Jugador ${data.playerId} reconectado en la sala ${data.roomId}`,)
        } catch (error) {
        logger.error(`handleReconnect ${JSON.stringify(data)}`);
        socket.emit(SocketEvents.ERROR, this.getErrorMessage(error))
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

                logger.info(
                    `Jugador ${playerInfo.player.name} desconectado de la room ${roomId} con Socket ${socket.id}`,
                );
            }
        }
        logger.info(`Cliente de player ${playerId}  en la room ${roomId} desconectado con Socket ${socket.id}`);
    }

    // Utilidades
    private getSocketByPlayerId(_playerId: string): Socket | undefined {
        const _playerInfo = this.gameManager.getPlayerBySocketId(""); // TODO: Mejorar búsqueda
        // Implementar búsqueda de socket por player ID
        return undefined;
    }

    private getErrorMessage(error: unknown): string {
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

    public emitToPlayer(_playerId: string, _event: keyof ServerToClientEvents, _data: any): void {
        // TODO: Implementar envío a jugador específico
    }
}
