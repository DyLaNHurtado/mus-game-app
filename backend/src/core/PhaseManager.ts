import { GamePhase } from "@/types/GameTypes";
import { PHASE_ORDER } from "@/config/constants";

export class PhaseManager {
  private currentPhaseIndex = 0;

  // Obtener fase actual
  getCurrentPhase(): GamePhase {
    return PHASE_ORDER[this.currentPhaseIndex] as GamePhase;
  }

  // Avanzar a la siguiente fase
  nextPhase(): GamePhase {
    this.currentPhaseIndex++;

    if (this.currentPhaseIndex >= PHASE_ORDER.length) {
      // Fin de la mano, volver al conteo
      return GamePhase.COUNTING;
    }

    return this.getCurrentPhase();
  }

  // Verificar si es la última fase
  isLastPhase(): boolean {
    return this.currentPhaseIndex >= PHASE_ORDER.length - 1;
  }

  // Resetear a la primera fase (para nueva mano)
  reset(): void {
    this.currentPhaseIndex = 0;
  }

  // Obtener jugador que inicia cada fase
  getStartingPlayerForPhase(phase: GamePhase, handNumber: number): number {
    switch (phase) {
      case GamePhase.MUS:
        // En el Mus, empieza el jugador a la derecha del que repartió
        // El que reparte rota cada mano
        return (handNumber - 1) % 4;

      case GamePhase.GRANDE:
      case GamePhase.CHICA:
      case GamePhase.PARES:
      case GamePhase.JUEGO:
      case GamePhase.PUNTO:
        // En las demás fases, empieza el jugador a la derecha del que repartió
        return (handNumber - 1) % 4;

      default:
        return 0;
    }
  }

  // Verificar si una fase permite envidos
  phaseAllowsEnvido(phase: GamePhase): boolean {
    return [GamePhase.GRANDE, GamePhase.CHICA, GamePhase.JUEGO, GamePhase.PUNTO].includes(phase);
  }

  // Verificar si una fase permite órdago
  phaseAllowsOrdago(phase: GamePhase): boolean {
    return [
      GamePhase.GRANDE,
      GamePhase.CHICA,
      GamePhase.PARES,
      GamePhase.JUEGO,
      GamePhase.PUNTO,
    ].includes(phase);
  }

  // Obtener puntos por defecto de una fase
  getDefaultPhasePoints(phase: GamePhase): number {
    switch (phase) {
      case GamePhase.GRANDE:
      case GamePhase.CHICA:
      case GamePhase.PARES:
      case GamePhase.PUNTO:
        return 1;
      case GamePhase.JUEGO:
        return 2;
      default:
        return 0;
    }
  }

  // Verificar si se puede pasar en una fase
  canPassInPhase(phase: GamePhase): boolean {
    return [
      GamePhase.GRANDE,
      GamePhase.CHICA,
      GamePhase.PARES,
      GamePhase.JUEGO,
      GamePhase.PUNTO,
    ].includes(phase);
  }

  // Obtener nombre legible de la fase
  getPhaseDisplayName(phase: GamePhase): string {
    const names: Record<GamePhase, string> = {
      [GamePhase.WAITING]: "Esperando jugadores",
      [GamePhase.MUS]: "Mus",
      [GamePhase.GRANDE]: "Grande",
      [GamePhase.CHICA]: "Chica",
      [GamePhase.PARES]: "Pares",
      [GamePhase.JUEGO]: "Juego",
      [GamePhase.PUNTO]: "Punto",
      [GamePhase.COUNTING]: "Contando puntos",
      [GamePhase.FINISHED]: "Partida terminada",
    };

    return names[phase] || phase;
  }

  // Obtener todas las fases en orden
  getAllPhases(): GamePhase[] {
    return [...PHASE_ORDER] as GamePhase[];
  }

  // Verificar si una fase es válida
  isValidPhase(phase: string): phase is GamePhase {
    return Object.values(GamePhase).includes(phase as GamePhase);
  }

  // Saltar a una fase específica (para casos especiales)
  skipToPhase(targetPhase: GamePhase): boolean {
    const targetIndex = PHASE_ORDER.indexOf(targetPhase);
    if (targetIndex === -1) {
      return false;
    }

    this.currentPhaseIndex = targetIndex;
    return true;
  }

  // Obtener progreso de la mano (porcentaje)
  getHandProgress(): number {
    if (this.currentPhaseIndex >= PHASE_ORDER.length) {
      return 100;
    }
    return Math.round((this.currentPhaseIndex / PHASE_ORDER.length) * 100);
  }
}
