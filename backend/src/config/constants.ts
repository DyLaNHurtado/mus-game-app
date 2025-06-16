import { Card, GamePhase } from "@/types/GameTypes";

export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  CARDS_PER_PLAYER: 4,
  WINNING_SCORE: 40,
  TURN_TIMEOUT: 30000, // 30 segundos
  RECONNECT_TIMEOUT: 60000, // 1 minuto
} as const;

export const CARD_VALUES = {
  AS: 1,
  DOS: 2,
  TRES: 3,
  CUATRO: 4,
  CINCO: 5,
  SEIS: 6,
  SIETE: 7,
  SOTA: 10,
  CABALLO: 11,
  REY: 12,
} as const;

// Valores para el Mus (Rey y Caballo valen 10, Sota vale 7)
export const MUS_VALUES: Record<number, number> = {
  1: 1, // As
  2: 2, // Dos
  3: 3, // Tres
  4: 4, // Cuatro
  5: 5, // Cinco
  6: 6, // Seis
  7: 7, // Siete
  10: 7, // Sota
  11: 10, // Caballo
  12: 10, // Rey
};

export const SUITS = ["oros", "copas", "espadas", "bastos"] as const;

export const PHASE_ORDER = [
  GamePhase.WAITING,
  GamePhase.MUS,
  GamePhase.GRANDE,
  GamePhase.CHICA,
  GamePhase.PARES,
  GamePhase.JUEGO,
  GamePhase.PUNTO,
  GamePhase.COUNTING,
  GamePhase.FINISHED,
] as const;

export const DEFAULT_PHASE_POINTS = {
  grande: 1,
  chica: 1,
  pares: 1,
  juego: 2,
  punto: 1,
} as const;

export const ENVIDO_VALUES = {
  DOS_TANTOS: 2,
  TRES_TANTOS: 3,
  CINCO_TANTOS: 5,
  SIETE_TANTOS: 7,
  RESTO: "resto",
} as const;

// Crear baraja española completa
export function createSpanishDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    // Cartas del 1 al 7
    for (let value = 1; value <= 7; value++) {
      deck.push({
        suit,
        value,
      });
    }

    // Sota, Caballo, Rey (10, 11, 12)
    for (let value = 10; value <= 12; value++) {
      deck.push({
        suit,
        value,
      });
    }
  }

  return deck;
}

export const TEAM_POSITIONS = {
  TEAM_0: [0, 2], // Posiciones 0 y 2
  TEAM_1: [1, 3], // Posiciones 1 y 3
} as const;
