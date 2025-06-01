import { Router, Request, Response } from "express";
import { logger } from "@/utils/logger";
import { readFileSync } from "fs";
import { join } from "path";

const router = Router();

// Endpoint para obtener logs en JSON
router.get("/", (req: Request, res: Response) => {
  try {
    const logs = logger.getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error reading logs" });
  }
});

// Endpoint para mostrar logs en HTML
router.get("/view", (req: Request, res: Response) => {
  try {
    const htmlPath = join(__dirname, "../logs/log-viewer.html");
    const htmlContent = readFileSync(htmlPath, "utf-8");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error loading log viewer:", error);
    res.status(500).send(`
      <html>
        <body style="font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff;">
          <h1>❌ Error loading log viewer</h1>
          <p>Could not load the log viewer interface.</p>
          <a href="/logs" style="color: #61dafb;">View raw logs (JSON)</a>
        </body>
      </html>
    `);
  }
});
export default router;
