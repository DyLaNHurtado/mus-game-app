import { Player } from "./Player";

export class TurnManager {
  private players: Player[];
  private currentTurnIndex = 0;

  constructor(players: Player[]) {
    if (players.length !== 4) {
      throw new Error("TurnManager requiere exactamente 4 jugadores");
    }
    this.players = [...players];
  }

  // Obtener índice del turno actual
  getCurrentTurn(): number {
    return this.currentTurnIndex;
  }

  // Obtener jugador actual
  getCurrentPlayer(): Player {
    return this.players[this.currentTurnIndex];
  }

  // Avanzar al siguiente turno
  nextTurn(): number {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % 4;
    return this.currentTurnIndex;
  }

  // Establecer turno específico
  setTurn(playerIndex: number): void {
    if (playerIndex < 0 || playerIndex >= 4) {
      throw new Error("Índice de jugador inválido");
    }
    this.currentTurnIndex = playerIndex;
  }

  // Establecer turno por ID de jugador
  setTurnByPlayerId(playerId: string): boolean {
    const playerIndex = this.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      return false;
    }
    this.currentTurnIndex = playerIndex;
    return true;
  }

  // Obtener siguiente jugador sin avanzar el turno
  getNextPlayer(): Player {
    const nextIndex = (this.currentTurnIndex + 1) % 4;
    return this.players[nextIndex];
  }

  // Obtener jugador anterior
  getPreviousPlayer(): Player {
    const prevIndex = (this.currentTurnIndex - 1 + 4) % 4;
    return this.players[prevIndex];
  }

  // Verificar si es el turno de un jugador específico
  isPlayerTurn(playerId: string): boolean {
    return this.getCurrentPlayer().id === playerId;
  }

  // Obtener orden de turnos desde el jugador actual
  getTurnOrder(): Player[] {
    const order: Player[] = [];
    for (let i = 0; i < 4; i++) {
      const index = (this.currentTurnIndex + i) % 4;
      order.push(this.players[index]);
    }
    return order;
  }

  // Obtener orden de turnos para una fase específica
  getTurnOrderForPhase(startingPlayerIndex: number): Player[] {
    const order: Player[] = [];
    for (let i = 0; i < 4; i++) {
      const index = (startingPlayerIndex + i) % 4;
      order.push(this.players[index]);
    }
    return order;
  }

  // Saltar jugadores desconectados
  nextConnectedPlayer(): number {
    let attempts = 0;
    do {
      this.nextTurn();
      attempts++;
    } while (!this.getCurrentPlayer().isConnected && attempts < 4);

    if (attempts >= 4) {
      throw new Error("No hay jugadores conectados");
    }

    return this.currentTurnIndex;
  }

  // Verificar si hay suficientes jugadores conectados
  hasEnoughConnectedPlayers(): boolean {
    const connectedCount = this.players.filter((p) => p.isConnected).length;
    return connectedCount >= 2; // Mínimo para continuar
  }

  // Obtener jugadores conectados
  getConnectedPlayers(): Player[] {
    return this.players.filter((p) => p.isConnected);
  }

  // Obtener compañero de equipo
  getTeammate(player: Player): Player {
    return this.players.find((p) => p.team === player.team && p.id !== player.id)!;
  }

  // Obtener oponentes
  getOpponents(player: Player): Player[] {
    return this.players.filter((p) => p.team !== player.team);
  }

  // Resetear turno al inicio
  reset(startingPlayerIndex = 0): void {
    this.currentTurnIndex = startingPlayerIndex;
  }
}
