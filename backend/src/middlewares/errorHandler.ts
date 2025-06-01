import type { ErrorRequestHandler } from "express";
import { logger } from "@/utils/logger";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error("Unhandled error:");
  res.status(500).json({ error: "Error interno del servidor" });
};
