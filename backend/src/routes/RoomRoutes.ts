import { Router } from "express";
import { GameManager } from "@/core/GameManager";
import { logger } from "@/utils/logger";
export function setupRoomRoutes(gameManager: GameManager): Router {
const router = Router();

    router.get("/rooms", (req, res) => {
        try {
            const onlyPublic = req.query.onlyPublic !== "false";
            const rooms = gameManager.getRooms(onlyPublic);
            res.json(rooms);
        } catch (error) {
            logger.error(`Error getting rooms: ${error}`);
            res.status(500).json({ error: "Error al obtener las rooms" });
        }
    });

    // Crear una nueva room (opcionalmente privada)

    router.post("/", (req, res) => {
        try {
            const { isPrivate = false } = req.body;
            const room = gameManager.createRoom(isPrivate);

            res.status(201).json({
            message: `Room ${isPrivate ? "privada" : "pública"} creada con éxito`,
            roomId: room.id,
            });
        } catch (error) {
            logger.error(`create room: ${error}`);
            res.status(500).json({ error: "Error al crear la room" });
        }
    });

    // Obtener una room por id
    router.get("/:roomId", (req, res) => {
        try {
            const { roomId } = req.params
            const room = gameManager.getRoom(roomId);

            if (!room) {
                res.status(404).json({ error: "Room no encontrada" });
            }else{
                res.json(room);
            }

        } catch (error) {
            logger.error(`Error getting room: ${error}`);
            res.status(500).json({ error: "Error al obtener la room" });
        }
    });

    // Unirse a una room existente (o crearla si no existe)
   router.post("/:roomId/join", (req, res) => {
        try {
            const { roomId } = req.params;
            const { playerName, socketId } = req.body;

            if (!playerName || !socketId) {
                return res.status(400).json({ error: "Faltan datos del jugador" });
            }

            const { room, player } = gameManager.joinRoom(roomId, playerName, socketId);

            res.json({
                message: "Jugador unido con éxito",
                roomId: room.id,
                playerId: player.id,
            });
        } catch (error) {
            logger.error(`join room: ${error}`);
            res.status(400).json({ error: error });
        }
    }); 

    // Salir de una room
       router.post("/:roomId/leave", (req, res) => {
        try {
            const { roomId } = req.params;
            const { playerId } = req.body;

            if (!playerId) {
            return res.status(400).json({ error: "Falta el ID del jugador" });
            }

            const { room, player } = gameManager.leaveRoom(playerId);

            res.json({
            message: `Jugador ${player?.name || "desconocido"} ha salido de la room`,
            roomId: room?.id || roomId,
            });
        } catch (error) {
            logger.error(`leave room: ${error}`);
            res.status(500).json({ error: "Error al salir de la room" });
        }
        });

        // Iniciar partida en una room
        router.post("/:roomId/start", (req, res) => {
        try {
            const { roomId } = req.params;
            const game = gameManager.startGame(roomId);

            res.json({
            message: "Partida iniciada con éxito",
            gameState: game.getGameState(),
            });
        } catch (error) {
            logger.error(`start game: ${error}`);
            res.status(400).json({ error: error });
        }
        });
        
        



    return router;



}
