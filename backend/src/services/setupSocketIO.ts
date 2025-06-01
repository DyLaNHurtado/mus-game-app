import { Server } from "socket.io";
import type { InterServerEvents } from "@/types/GameTypes";
import { GameManager } from "@/core/GameManager";
import { SocketHandler } from "@/sockets/socketHandler";
import { ClientToServerEvents, ServerToClientEvents, SocketData } from "@/types/SocketTypes";

export function setupSocketIO(server: any, gameManager: GameManager) {
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

  const socketHandler = new SocketHandler(io, gameManager);
  socketHandler.initialize();

  return io;
}
