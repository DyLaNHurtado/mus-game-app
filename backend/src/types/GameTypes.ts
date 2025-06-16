import type { Player } from "@/core/Player"

export interface Card {
  suit: "oros" | "copas" | "espadas" | "bastos"
  value: number // 1-12 (sin 8 y 9)
  musValue: number // Valor para el mus (Rey=10, Caballo=11, Sota=12)
}

export interface GameAction {
  type: "mus" | "no-mus" | "paso" | "envido" | "ordago" | "acepto" | "rechazo" | "quiero"
  amount?: number // Para envidos específicos
  timestamp: number
  playerId: string
}

export interface GameState {
  id: string
  players: Player[]
  currentPhase: GamePhase
  currentTurn: number // Índice del jugador actual
  deck: Card[]
  scores: [number, number] // Puntuación por equipos
  currentHand: number
  phaseData: PhaseData
  isGameFinished: boolean
  winner?: 0 | 1
  handPosition?: number // Posición de la mano (quien reparte)
}

export interface PhaseData {
  bets: GameAction[]
  currentBet?: GameAction
  hasEnvido: boolean
  hasOrdago: boolean
  phaseWinner?: 0 | 1
  phasePoints: number
}

export enum GamePhase {
  WAITING = "waiting",
  MUS = "mus",
  GRANDE = "grande",
  CHICA = "chica",
  PARES = "pares",
  JUEGO = "juego",
  PUNTO = "punto",
  COUNTING = "counting",
  FINISHED = "finished",
}

export interface Room {
  id: string
  players: Player[]
  gameState?: GameState
  createdAt: Date
  isPrivate: boolean
  maxPlayers: number
}

export interface InterServerEvents {
  ping: () => void
}

// Nuevos tipos para mejor organización
export interface HandSummary {
  handNumber: number
  handPosition: number
  handPlayer: string
  evaluations: Array<{
    player: string
    team: number
    evaluation: any
  }>
}

export interface GameEvents {
  onPhaseChange?: (phase: GamePhase, gameState: Partial<GameState>) => void
  onScoreUpdate?: (team: 0 | 1, points: number, reason: string) => void
  onHandComplete?: (handNumber: number, gameState: Partial<GameState>) => void
  onGameEnd?: (winner: 0 | 1, finalState: Partial<GameState>) => void
  onPlayerAction?: (playerId: string, action: GameAction, result: any) => void
}
