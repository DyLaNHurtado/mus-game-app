import express from "express";
import cors from "cors";
import logsRoutes from "@/routes/logsRoutes";

export function setupExpressApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use("/logs", logsRoutes);
  app.use(express.json());

  return app;
}
