import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { logger } from "@/utils/logger";
import { GameManager } from "@/core/GameManager";
import { SocketHandler } from "@/sockets/socketHandler";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@/types/GameTypes";

const app = express();
const server = createServer(app);

// Configuración de CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

// Socket.IO con tipos
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  server,
  {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  },
);

// Instancia global del GameManager
const gameManager = new GameManager();

// Configurar manejadores de socket
const socketHandler = new SocketHandler(io, gameManager);
socketHandler.initialize();

// Rutas básicas de la API
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    activeRooms: gameManager.getActiveRoomsCount(),
    activePlayers: gameManager.getActivePlayersCount(),
  });
});

app.get("/stats", (req, res) => {
  res.json(gameManager.getStats());
});

// Ruta para crear sala (opcional, también se puede hacer por socket)
app.post("/rooms", (req, res) => {
  try {
    const { isPrivate = false } = req.body;
    const room = gameManager.createRoom(isPrivate);
    res.json({ roomId: room.id });
  } catch (error) {
    logger.error("Error creating room:", error);
    res.status(500).json({ error: "Error al crear la sala" });
  }
});

// Manejo de errores global
app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error:", error);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Manejo de cierre graceful
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`🚀 Mus Backend Server running on port ${PORT}`);
  logger.info(`🎮 Game Manager initialized`);
  logger.info(`🔌 Socket.IO ready for connections`);

  if (process.env.NODE_ENV === "development") {
    logger.debug("Running in development mode");
  }
});

export { io, gameManager };
