import { Player } from "@/core/Player";
import { Card, GameAction, GamePhase, GameState, Room } from "./GameTypes";

export interface SocketData {
  playerId?: string;
  roomId?: string;
}

export enum SocketEvents {
  // Client to Server
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  DISCARD_CARDS = "discardCards",
  PLAY_ACTION = "playAction",
  RECONNECT = "reconnect",

  // Server to Client
  ROOM_JOINED = "roomJoined",
  PLAYER_JOINED = "playerJoined",
  PLAYER_LEFT = "playerLeft",
  GAME_STARTED = "gameStarted",
  GAME_STATE_UPDATE = "gameStateUpdate",
  PHASE_CHANGED = "phaseChanged",
  HAND_UPDATE = "handUpdate",
  ACTION_PLAYED = "actionPlayed",
  PHASE_RESULT = "phaseResult",
  GAME_ENDED = "gameEnded",
  ERROR = "error",
  PLAYER_DISCONNECTED = "playerDisconnected",
  PLAYER_RECONNECTED = "playerReconnected",
}

// Eventos del Socket
export interface ClientToServerEvents {
  joinRoom: (data: { roomId: string; playerName: string }) => void;
  leaveRoom: () => void;
  startGame: () => void;
  discardCards: (cardIndices: number[]) => void;
  playAction: (action: Omit<GameAction, "timestamp">) => void;
  reconnect: (data: { roomId: string; playerId: string }) => void;
}

export interface ServerToClientEvents {
  roomJoined: (data: { room: Room; playerId: string }) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  gameStarted: (gameState: Partial<GameState>) => void;
  gameStateUpdate: (gameState: Partial<GameState>) => void;
  phaseChanged: (data: { phase: GamePhase; currentTurn: number }) => void;
  handUpdate: (hand: Card[]) => void;
  actionPlayed: (data: { playerId: string; action: GameAction }) => void;
  phaseResult: (data: { winner: 0 | 1; points: number; phase: GamePhase }) => void;
  gameEnded: (data: { winner: 0 | 1; finalScores: [number, number] }) => void;
  error: (message: string) => void;
  playerDisconnected: (playerId: string) => void;
  playerReconnected: (playerId: string) => void;
}
