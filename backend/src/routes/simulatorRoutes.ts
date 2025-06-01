import { Router } from "express"
import path from "path"

const router = Router()

/**
 * GET /simulator
 * Servir la página del simulador interactivo
 */
router.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../logs/simulator.html"))
})

export default router;
