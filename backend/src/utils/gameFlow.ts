import type { Game } from "@/core/Game"
import { logger } from "./logger"

export class GameFlowManager {
  /**
   * Avanza automáticamente el flujo del juego cuando sea necesario
   */
  static processAutoFlow(game: Game): void {
    const gameState = game.getGameState()

    switch (gameState.currentPhase) {
      case "counting":
        this.processCountingPhase(game)
        break

      case "finished":
        this.processGameEnd(game)
        break
    }
  }

  /**
   * Procesa la fase de conteo de puntos
   */
  private static processCountingPhase(game: Game): void {
    const gameState = game.getGameState()

    logger.game(`Contando puntos de la mano ${gameState.currentHand}`, gameState.id)

    // Verificar si alguien ganó
    if (gameState.isGameFinished) {
      game.changePhase("finished")
      return
    }

    // Iniciar nueva mano
    setTimeout(() => {
      game.startNewHand()
      logger.game(`Nueva mano iniciada automáticamente`, gameState.id)
    }, 3000) // Pausa de 3 segundos entre manos
  }

  /**
   * Procesa el final del juego
   */
  private static processGameEnd(game: Game): void {
    const gameState = game.getGameState()
    const winner = gameState.winner
    const scores = gameState.scores

    logger.game(`🎉 Partida terminada! Ganó el equipo ${winner} con ${scores[winner || 0]} puntos`, gameState.id)
  }

  /**
   * Obtiene el siguiente evento automático programado
   */
  static getNextAutoEvent(game: Game): { event: string; timeMs: number } | null {
    const gameState = game.getGameState()

    switch (gameState.currentPhase) {
      case "counting":
        return { event: "startNewHand", timeMs: 3000 }

      case "finished":
        return { event: "cleanup", timeMs: 30000 } // Limpiar después de 30 segundos

      default:
        return null
    }
  }

  /**
   * Verifica si todos los jugadores han completado la acción requerida
   */
  static checkPhaseCompletion(game: Game): boolean {
    const gameState = game.getGameState()

    switch (gameState.currentPhase) {
      case "mus":
        return this.checkMusCompletion(gameState)

      default:
        return false
    }
  }

  /**
   * Verifica si la fase de Mus está completa
   */
  private static checkMusCompletion(gameState: any): boolean {
    const connectedPlayers = gameState.players.filter((p: any) => p.isConnected)
    const musActions = gameState.phaseData.bets.filter((bet: any) => ["mus", "no-mus"].includes(bet.type))

    // La fase termina si alguien dice "no-mus" o todos dicen "mus"
    return musActions.some((action: any) => action.type === "no-mus") || musActions.length === connectedPlayers.length
  }

  /**
   * Obtiene estadísticas de la partida
   */
  static getGameStats(game: Game) {
    const gameState = game.getGameState()
    const teamInfo = game.getTeamInfo()

    return {
      gameId: gameState.id,
      currentHand: gameState.currentHand,
      currentPhase: gameState.currentPhase,
      scores: gameState.scores,
      isFinished: gameState.isGameFinished,
      winner: gameState.winner,
      connectedPlayers: gameState.players.filter((p) => p.isConnected).length,
      totalPlayers: gameState.players.length,
      teams: teamInfo,
      phaseData: gameState.phaseData,
    }
  }
}
