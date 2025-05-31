import { z } from "zod";
import { GamePhase } from "@/types/GameTypes";

export const JoinRoomSchema = z.object({
  roomId: z.string().min(1).max(50),
  playerName: z.string().min(1).max(30).trim(),
});

export const PlayActionSchema = z.object({
  type: z.enum(["mus", "no-mus", "paso", "envido", "ordago", "acepto", "rechazo"]),
  amount: z.number().optional(),
});

export const DiscardCardsSchema = z.object({
  cardIndices: z.array(z.number().min(0).max(3)).max(4),
});

export const ReconnectSchema = z.object({
  roomId: z.string().min(1).max(50),
  playerId: z.string().uuid(),
});

export function validateRoomId(roomId: string): boolean {
  return /^[a-zA-Z0-9]{4,10}$/.test(roomId);
}

export function validatePlayerName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 30;
}

export function validateCardIndices(indices: number[]): boolean {
  return (
    indices.every((i) => i >= 0 && i <= 3) &&
    indices.length <= 4 &&
    new Set(indices).size === indices.length
  );
}

export function validateActionForPhase(actionType: string, phase: GamePhase): boolean {
  switch (phase) {
    case GamePhase.MUS:
      return ["mus", "no-mus"].includes(actionType);

    case GamePhase.GRANDE:
    case GamePhase.CHICA:
    case GamePhase.JUEGO:
    case GamePhase.PUNTO:
      return ["paso", "envido", "ordago", "acepto", "rechazo"].includes(actionType);

    case GamePhase.PARES:
      return ["paso", "ordago", "acepto", "rechazo"].includes(actionType);

    default:
      return false;
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}
