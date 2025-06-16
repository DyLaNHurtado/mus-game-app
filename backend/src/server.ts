import { createServer } from "http";
import { setupExpressApp } from "@/services/setupExpressApp";
import { setupSocketIO } from "@/services/setupSocketIO";
import { setupRoutes } from "@/routes/routes";
import { errorHandler } from "@/middlewares/errorHandler";
import { setupGracefulShutdown } from "@/services/setupGracefulShutdown";
import { GameManager } from "@/core/GameManager";
import { logger } from "@/utils/logger";
import { setupRoomRoutes } from "./routes/RoomRoutes";

const app = setupExpressApp();
const server = createServer(app);

// GameManager global
const gameManager =  GameManager.getInstance();

// Configurar rutas
app.use(setupRoutes(gameManager));
app.use("/room", setupRoomRoutes(gameManager));


// Manejo de errores global
app.use(errorHandler);

// Configurar Socket.IO
const io = setupSocketIO(server, gameManager);

// Cierre graceful
setupGracefulShutdown(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  const baseUrl = process.env.BASE_URL || `http://localhost`;

  logger.info(`🚀 Mus Backend Server running: ${baseUrl}:${PORT}`);
  logger.info(`🎮 Game Manager initialized`);
  logger.info(`🔌 Socket.IO ready for connections`);
  logger.info(` Logs se pueden ver en: ${baseUrl}:${PORT}/logs/view/`);
  logger.info(`📅 Current Environment: ${process.env.NODE_ENV || "development"}`);
});

export { io, gameManager };
