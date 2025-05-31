import { v4 as uuidv4 } from "uuid";
import { Card, GameAction } from "@/types/GameTypes";

export class Player {
  public readonly id: string;
  public name: string;
  public socketId: string;
  public position: 0 | 1 | 2 | 3;
  public hand: Card[] = [];
  public team: 0 | 1;
  public isConnected: boolean = true;
  public lastAction?: GameAction;
  public disconnectedAt?: Date;

  constructor(name: string, socketId: string, position: 0 | 1 | 2 | 3) {
    this.id = uuidv4();
    this.name = name.trim();
    this.socketId = socketId;
    this.position = position;
    this.team = (position % 2) as 0 | 1; // Posiciones 0,2 = equipo 0; 1,3 = equipo 1
  }

  // Actualizar cartas en mano
  setHand(cards: Card[]): void {
    this.hand = [...cards];
  }

  // Descartar cartas específicas por índice
  discardCards(indices: number[]): Card[] {
    const discarded: Card[] = [];

    // Ordenar índices de mayor a menor para no afectar los índices al eliminar
    const sortedIndices = [...indices].sort((a, b) => b - a);

    for (const index of sortedIndices) {
      if (index >= 0 && index < this.hand.length) {
        discarded.unshift(this.hand.splice(index, 1)[0]);
      }
    }

    return discarded;
  }

  // Añadir cartas nuevas a la mano
  addCards(cards: Card[]): void {
    this.hand.push(...cards);
  }

  // Registrar acción del jugador
  setLastAction(action: GameAction): void {
    this.lastAction = {
      ...action,
      timestamp: Date.now(),
    };
  }

  // Desconectar jugador
  disconnect(): void {
    this.isConnected = false;
    this.disconnectedAt = new Date();
  }

  // Reconectar jugador
  reconnect(newSocketId: string): void {
    this.socketId = newSocketId;
    this.isConnected = true;
    this.disconnectedAt = undefined;
  }

  // Obtener información pública del jugador (sin cartas)
  getPublicInfo() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      team: this.team,
      isConnected: this.isConnected,
      lastAction: this.lastAction,
    };
  }

  // Obtener información privada (con cartas)
  getPrivateInfo() {
    return {
      ...this.getPublicInfo(),
      hand: this.hand,
    };
  }

  // Verificar si el jugador está en un equipo específico
  isInTeam(team: 0 | 1): boolean {
    return this.team === team;
  }

  // Verificar si es compañero de otro jugador
  isTeammate(otherPlayer: Player): boolean {
    return this.team === otherPlayer.team && this.id !== otherPlayer.id;
  }

  // Limpiar mano
  clearHand(): void {
    this.hand = [];
  }

  // Verificar si tiene cartas
  hasCards(): boolean {
    return this.hand.length > 0;
  }

  // Obtener número de cartas
  getCardCount(): number {
    return this.hand.length;
  }
}
