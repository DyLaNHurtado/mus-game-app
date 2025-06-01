import { GAME_CONFIG } from "@/config/constants";
import { logger } from "@/utils/logger";

export interface ScoreUpdate {
  team: 0 | 1;
  points: number;
  reason: string;
  phase?: string;
}

export class ScoreManager {
  private scores: [number, number] = [0, 0];
  private scoreHistory: ScoreUpdate[] = [];

  // Obtener puntuaciones actuales
  getScores(): [number, number] {
    return [...this.scores];
  }

  // Añadir puntos a un equipo
  addPoints(team: 0 | 1, points: number, reason: string, phase?: string): void {
    if (points < 0) {
      throw new Error("Los puntos no pueden ser negativos");
    }

    this.scores[team] += points;

    const update: ScoreUpdate = {
      team,
      points,
      reason,
      phase,
    };

    this.scoreHistory.push(update);

    logger.info(`Equipo ${team} suma ${points} puntos (${reason}). Total: ${this.scores[team]}`);
  }

  // Verificar si hay un ganador
  checkWinner(): 0 | 1 | undefined {
    if (this.scores[0] >= GAME_CONFIG.WINNING_SCORE) {
      return 0;
    }
    if (this.scores[1] >= GAME_CONFIG.WINNING_SCORE) {
      return 1;
    }
    return undefined;
  }

  // Verificar si el juego ha terminado
  isGameFinished(): boolean {
    return this.checkWinner() !== undefined;
  }

  // Obtener diferencia de puntos
  getScoreDifference(): number {
    return Math.abs(this.scores[0] - this.scores[1]);
  }

  // Obtener equipo que va ganando
  getLeadingTeam(): 0 | 1 | undefined {
    if (this.scores[0] > this.scores[1]) return 0;
    if (this.scores[1] > this.scores[0]) return 1;
    return undefined; // Empate
  }

  // Obtener historial de puntuación
  getScoreHistory(): ScoreUpdate[] {
    return [...this.scoreHistory];
  }

  // Obtener últimas actualizaciones de puntuación
  getRecentUpdates(count = 5): ScoreUpdate[] {
    return this.scoreHistory.slice(-count);
  }

  // Resetear puntuaciones (para nueva room)
  reset(): void {
    this.scores = [0, 0];
    this.scoreHistory = [];
  }

  // Obtener puntos restantes para ganar
  getPointsToWin(team: 0 | 1): number {
    return Math.max(0, GAME_CONFIG.WINNING_SCORE - this.scores[team]);
  }

  // Verificar si un equipo puede ganar en la siguiente jugada
  canWinNextRound(team: 0 | 1, potentialPoints: number): boolean {
    return this.scores[team] + potentialPoints >= GAME_CONFIG.WINNING_SCORE;
  }

  // Obtener estadísticas del juego
  getGameStats() {
    const totalPoints = this.scores[0] + this.scores[1];
    const totalUpdates = this.scoreHistory.length;

    return {
      scores: this.getScores(),
      totalPoints,
      totalUpdates,
      leadingTeam: this.getLeadingTeam(),
      scoreDifference: this.getScoreDifference(),
      isFinished: this.isGameFinished(),
      winner: this.checkWinner(),
      pointsToWin: [this.getPointsToWin(0), this.getPointsToWin(1)],
    };
  }

  // Simular puntuación para verificar resultado
  simulateScore(
    team: 0 | 1,
    points: number,
  ): {
    newScore: number;
    wouldWin: boolean;
    wouldExceed: boolean;
  } {
    const newScore = this.scores[team] + points;
    return {
      newScore,
      wouldWin: newScore >= GAME_CONFIG.WINNING_SCORE,
      wouldExceed: newScore > GAME_CONFIG.WINNING_SCORE,
    };
  }
}
