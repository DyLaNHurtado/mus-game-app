import { type GameState, GamePhase, type PhaseData, type Card } from "@/types/GameTypes";
import { DeckManager } from "./DeckManager";
import { TurnManager } from "./TurnManager";
import { PhaseManager } from "./PhaseManager";
import { ScoreManager } from "./ScoreManager";
import { Player } from "./Player";
import { logger } from "@/utils/logger";
import { GAME_CONFIG } from "@/config/constants";

export class Game {
  private gameState: GameState;
  private deckManager: DeckManager;
  private turnManager: TurnManager;
  private phaseManager: PhaseManager;
  private scoreManager: ScoreManager;

  constructor(roomId: string, players: Player[]) {
    if (players.length !== GAME_CONFIG.MAX_PLAYERS) {
      throw new Error("Se requieren exactamente 4 jugadores");
    }

    // Inicializar estado del juego
    this.gameState = {
      id: roomId,
      players: [...players],
      currentPhase: GamePhase.MUS,
      currentTurn: 0, // Empieza el jugador en posición 0
      deck: [],
      scores: [0, 0], // [equipo0, equipo1]
      currentHand: 1,
      phaseData: this.createEmptyPhaseData(),
      isGameFinished: false,
    };

    // Inicializar managers
    this.deckManager = new DeckManager();
    this.turnManager = new TurnManager(players);
    this.phaseManager = new PhaseManager();
    this.scoreManager = new ScoreManager();

    // Repartir cartas iniciales
    this.dealInitialCards();

    logger.game(`Nueva partida creada - Mano ${this.gameState.currentHand}`, roomId);
  }

  // Repartir cartas iniciales
  private dealInitialCards(): void {
    this.gameState.players.forEach((player) => {
      const hand = this.deckManager.dealHand();
      player.setHand(hand);
    });

    logger.game("Cartas repartidas a todos los jugadores", this.gameState.id);
  }

  // Crear datos vacíos de fase
  private createEmptyPhaseData(): PhaseData {
    return {
      bets: [],
      hasEnvido: false,
      hasOrdago: false,
      phasePoints: 1,
    };
  }

  // Obtener estado del juego (filtrado por jugador)
  getGameState(playerId?: string): GameState {
    if (!playerId) {
      // Estado completo para el servidor
      return { ...this.gameState };
    }

    // Estado filtrado para el cliente (solo su mano)
    const player = this.gameState.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error("Jugador no encontrado");
    }

    return {
      ...this.gameState,
      players: this.gameState.players.map((p) => ({
        ...p.getPublicInfo(),
        hand: p.id === playerId ? p.hand : [], // Solo mostrar cartas propias
      })) as Player[],
    };
  }

  // Obtener información pública del juego
  getPublicGameState(): Partial<GameState> {
    return {
      id: this.gameState.id,
      currentPhase: this.gameState.currentPhase,
      currentTurn: this.gameState.currentTurn,
      scores: [...this.gameState.scores],
      currentHand: this.gameState.currentHand,
      phaseData: { ...this.gameState.phaseData },
      isGameFinished: this.gameState.isGameFinished,
      winner: this.gameState.winner,
      players: this.gameState.players.map((p) => p.getPublicInfo()) as Player[],
    };
  }

  // Obtener mano del jugador
  getPlayerHand(playerId: string): Card[] {
    const player = this.gameState.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error("Jugador no encontrado");
    }
    return [...player.hand];
  }

  // Verificar si es el turno del jugador
  isPlayerTurn(playerId: string): boolean {
    const currentPlayer = this.gameState.players[this.gameState.currentTurn];
    return currentPlayer.id === playerId;
  }

  // Obtener jugador actual
  getCurrentPlayer(): Player {
    return this.gameState.players[this.gameState.currentTurn];
  }

  // Obtener jugador por ID
  getPlayer(playerId: string): Player | undefined {
    return this.gameState.players.find((p) => p.id === playerId);
  }

  // Verificar si el juego ha terminado
  isGameFinished(): boolean {
    return this.gameState.isGameFinished;
  }

  // Obtener ganador
  getWinner(): 0 | 1 | undefined {
    return this.gameState.winner;
  }

  // Avanzar turno
  nextTurn(): void {
    this.gameState.currentTurn = this.turnManager.nextTurn();
    logger.debug(`Turno avanzado al jugador ${this.getCurrentPlayer().name}`, this.gameState.id);
  }

  // Cambiar fase
  changePhase(newPhase: GamePhase): void {
    this.gameState.currentPhase = newPhase;
    this.gameState.phaseData = this.createEmptyPhaseData();

    // Resetear turno según la fase
    this.gameState.currentTurn = this.phaseManager.getStartingPlayerForPhase(
      newPhase,
      this.gameState.currentHand,
    );

    logger.game(`Fase cambiada a: ${newPhase}`, this.gameState.id);
  }

  // Actualizar puntuación
  updateScore(team: 0 | 1, points: number): void {
    this.gameState.scores[team] += points;

    // Verificar si alguien ganó
    if (this.gameState.scores[team] >= GAME_CONFIG.WINNING_SCORE) {
      this.gameState.isGameFinished = true;
      this.gameState.winner = team;
      logger.game(
        `¡Partida terminada! Ganó el equipo ${team} con ${this.gameState.scores[team]} puntos`,
        this.gameState.id,
      );
    }
  }

  // Iniciar nueva mano
  startNewHand(): void {
    if (this.gameState.isGameFinished) {
      throw new Error("La partida ya ha terminado");
    }

    this.gameState.currentHand++;
    this.gameState.currentPhase = GamePhase.MUS;
    this.gameState.phaseData = this.createEmptyPhaseData();

    // Limpiar manos de jugadores
    this.gameState.players.forEach((player) => player.clearHand());

    // Rebarajar y repartir nuevas cartas
    this.deckManager.reset();
    this.dealInitialCards();

    // El turno inicial rota
    this.gameState.currentTurn = (this.gameState.currentHand - 1) % 4;

    logger.game(`Nueva mano iniciada - Mano ${this.gameState.currentHand}`, this.gameState.id);
  }

  // Obtener información de equipos
  getTeamInfo() {
    const team0 = this.gameState.players.filter((p) => p.team === 0);
    const team1 = this.gameState.players.filter((p) => p.team === 1);

    return {
      team0: {
        players: team0.map((p) => p.getPublicInfo()),
        score: this.gameState.scores[0],
      },
      team1: {
        players: team1.map((p) => p.getPublicInfo()),
        score: this.gameState.scores[1],
      },
    };
  }

  // Verificar si todos los jugadores están conectados
  allPlayersConnected(): boolean {
    return this.gameState.players.every((p) => p.isConnected);
  }

  // Obtener jugadores desconectados
  getDisconnectedPlayers(): Player[] {
    return this.gameState.players.filter((p) => !p.isConnected);
  }

  // Reconectar jugador
  reconnectPlayer(playerId: string, socketId: string): boolean {
    const player = this.getPlayer(playerId);
    if (!player) {
      return false;
    }

    player.reconnect(socketId);
    logger.game(`Jugador ${player.name} reconectado`, this.gameState.id);
    return true;
  }
}
