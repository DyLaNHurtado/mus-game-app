import type { Game } from "@/core/Game"
import { logger } from "./logger"
import { GAME_CONFIG } from "@/config/constants"

export interface TimeoutConfig {
  duration: number
  onTimeout: () => void
  onCancel: () => void
}

export class TimeoutManager {
  private timeouts: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Establece un timeout para el turno de un jugador
   */
  setPlayerTimeout(gameId: string, playerId: string, config: TimeoutConfig): void {
    const timeoutId = `${gameId}-${playerId}`

    // Cancelar timeout existente
    this.cancelTimeout(timeoutId)

    const timeout = setTimeout(() => {
      logger.warn(`Timeout para jugador ${playerId} en room ${gameId}`)
      config.onTimeout()
      this.timeouts.delete(timeoutId)
    }, config.duration)

    this.timeouts.set(timeoutId, timeout)

    logger.debug(`Timeout establecido para ${playerId} (${config.duration}ms) en room ${gameId}`)
  }

  /**
   * Cancela un timeout específico
   */
  cancelTimeout(timeoutId: string): void {
    const timeout = this.timeouts.get(timeoutId)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(timeoutId)
    }
  }

  /**
   * Cancela todos los timeouts de una room
   */
  cancelGameTimeouts(gameId: string): void {
    const gameTimeouts = Array.from(this.timeouts.keys()).filter((id) => id.startsWith(gameId))

    gameTimeouts.forEach((id) => this.cancelTimeout(id))
  }

  /**
   * Establece timeout automático para el turno actual
   */
  setTurnTimeout(game: Game, onPlayerTimeout: (playerId: string) => void): void {
    const gameState = game.getGameState()
    const currentPlayer = game.getCurrentPlayer()

    if (!currentPlayer.isConnected) {
      return // No establecer timeout para jugadores desconectados
    }

    this.setPlayerTimeout(gameState.id, currentPlayer.id, {
      duration: GAME_CONFIG.TURN_TIMEOUT,
      onTimeout: () => {
        logger.info(`Jugador ${currentPlayer.name} perdió su turno por timeout en room ${gameState.id}`)
        onPlayerTimeout(currentPlayer.id)
      },
      onCancel: () => {
        logger.debug(`Timeout cancelado para ${currentPlayer.name} en room ${gameState.id}`)
      },
    })
  }

  /**
   * Maneja timeout automático de turno
   */
  handleTurnTimeout(game: Game): void {
    const gameState = game.getGameState()
    const currentPlayer = game.getCurrentPlayer()

    // Acción automática según la fase
    switch (gameState.currentPhase) {
      case "mus":
        // En mus, automáticamente "no-mus"
        game.playAction(currentPlayer.id, { type: "no-mus" })
        break

      case "grande":
      case "chica":
      case "pares":
      case "juego":
      case "punto":
        // En fases de apuesta, automáticamente "paso"
        game.playAction(currentPlayer.id, { type: "paso" })
        break
    }
  }

  /**
   * Establece timeout para reconexión
   */
  setReconnectionTimeout(gameId: string, playerId: string, onReconnectionTimeout: () => void): void {
    this.setPlayerTimeout(gameId, `reconnect-${playerId}`, {
      duration: GAME_CONFIG.RECONNECT_TIMEOUT,
      onTimeout: () => {
        logger.warn(`Timeout de reconexión para jugador ${playerId} en room ${gameId}`)
        onReconnectionTimeout()
      },
      onCancel: () => {
        logger.debug(`Timeout de reconexión cancelado para ${playerId} en room ${gameId}`)
      },
    })
  }

  /**
   * Obtiene estadísticas de timeouts activos
   */
  getActiveTimeouts(): { [gameId: string]: number } {
    const stats: { [gameId: string]: number } = {}

    Array.from(this.timeouts.keys()).forEach((timeoutId) => {
      const gameId = timeoutId.split("-")[0]
      stats[gameId] = (stats[gameId] || 0) + 1
    })

    return stats
  }

  /**
   * Limpia todos los timeouts
   */
  cleanup(): void {
    Array.from(this.timeouts.values()).forEach((timeout) => clearTimeout(timeout))
    this.timeouts.clear()
    logger.info("Todos los timeouts han sido limpiados")
  }
}

// Instancia global del timeout manager
export const timeoutManager = new TimeoutManager()
