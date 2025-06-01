import { Router } from "express";
import { GameManager } from "@/core/GameManager";
import { logger } from "@/utils/logger";

export function setupRoutes(gameManager: GameManager) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ message: "Bienvenido al servidor de Mus" });
  });

  router.get("/version", (_req, res) => {
    res.json({ version: process.env.VERSION || "1.0.0" });
  });


  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      activeRooms: gameManager.getActiveRoomsCount(),
      activePlayers: gameManager.getActivePlayersCount(),
    });
  });

  router.get("/stats", (_req, res) => {
    res.json(gameManager.getStats());
  });

  router.post("/rooms", (req, res) => {
    try {
      const { isPrivate = false } = req.body;
      const room = gameManager.createRoom(isPrivate);
      res.json({ roomId: room.id });
    } catch (error) {
      logger.error(`creating room: ${error}`);
      res.status(500).json({ error: "Error al crear la room" });
    }
  });

  return router;
}
