import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export interface AdminRequest extends Request {
  adminUser?: {
    id: string
    permissions: string[]
  }
}

export const adminAuth = (req: AdminRequest, res: Response, next: NextFunction) => {
  const adminKey = req.headers["x-admin-key"] || req.body.adminKey || req.query.adminKey

  if (!adminKey) {
    logger.warn(`Admin access attempt without key from ${req.ip}`)
    return res.status(401).json({
      success: false,
      error: "Admin key requerida",
      hint: "Usar header 'X-Admin-Key' o parámetro 'adminKey'",
    })
  }

  if (adminKey !== process.env.ADMIN_KEY && adminKey !== "admin123") {
    logger.warn(`Admin access attempt with invalid key from ${req.ip}`)
    return res.status(403).json({
      success: false,
      error: "Admin key inválida",
    })
  }

  // Añadir información del admin a la request
  req.adminUser = {
    id: "admin",
    permissions: ["all"],
  }

  logger.info(`Admin access granted to ${req.ip} for ${req.method} ${req.path}`)
  next()
}

// Middleware para logs de admin
export const adminLogger = (req: AdminRequest, res: Response, next: NextFunction) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    logger.info(`Admin API: ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`)
  })

  next()
}
