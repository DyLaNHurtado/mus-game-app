import { DeckManager } from "./DeckManager"
import { TurnManager } from "./TurnManager"
import { PhaseManager } from "./PhaseManager"
import { ScoreManager } from "./ScoreManager"
import { logger } from "@/utils/logger"
import { GAME_CONFIG } from "@/config/constants"
// Añadir importaciones necesarias
import { ActionHandler, type ActionResult } from "@/logic/ActionHandler"
import { MusLogic } from "@/logic/MusLogic"
import { Card, GamePhase, GameState, PhaseData, type GameAction } from "@/types/GameTypes"
import { Player } from "./Player"

export class Game {
  private gameState: GameState
  private deckManager: DeckManager
  private turnManager: TurnManager
  private phaseManager: PhaseManager
  private scoreManager: ScoreManager

  constructor(roomId: string, players: Player[]) {
    if (players.length !== GAME_CONFIG.MAX_PLAYERS) {
      throw new Error("Se requieren exactamente 4 jugadores")
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
    }

    // Inicializar managers
    this.deckManager = new DeckManager()
    this.turnManager = new TurnManager(players)
    this.phaseManager = new PhaseManager()
    this.scoreManager = new ScoreManager()

    // Repartir cartas iniciales
    this.dealInitialCards()

    logger.info(`Nueva partida creada - Mano ${this.gameState.currentHand} en sala ${roomId}`);
  }

  // Repartir cartas iniciales
  private dealInitialCards(): void {
    this.gameState.players.forEach((player) => {
      const hand = this.deckManager.dealHand()
      player.setHand(hand)
    })

    logger.info(`Cartas repartidas a todos los jugadores ${this.gameState.players.map(p => p.name +" " +JSON.stringify(p.hand) ).join(", ")}`);
  }

  // Crear datos vacíos de fase
  private createEmptyPhaseData(): PhaseData {
    return {
      bets: [],
      hasEnvido: false,
      hasOrdago: false,
      phasePoints: 1,
    }
  }

  // Obtener estado del juego (filtrado por jugador)
  getGameState(playerId?: string): GameState {
    if (!playerId) {
      // Estado completo para el servidor
      return { ...this.gameState }
    }

    // Estado filtrado para el cliente (solo su mano)
    const player = this.gameState.players.find((p) => p.id === playerId)
    if (!player) {
      throw new Error("Jugador no encontrado")
    }

    return {
      ...this.gameState,
      players: this.gameState.players.map((p) => ({
        ...p.getPublicInfo(),
        hand: p.id === playerId ? p.hand : [], // Solo mostrar cartas propias
      })) as Player[],
    }
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
    }
  }

  // Obtener mano del jugador
  getPlayerHand(playerId: string): Card[] {
    const player = this.gameState.players.find((p) => p.id === playerId)
    if (!player) {
      throw new Error("Jugador no encontrado")
    }
    return [...player.hand]
  }

  // Verificar si es el turno del jugador
  isPlayerTurn(playerId: string): boolean {
    const currentPlayer = this.gameState.players[this.gameState.currentTurn]
    return currentPlayer.id === playerId
  }

  // Obtener jugador actual
  getCurrentPlayer(): Player {
    return this.gameState.players[this.gameState.currentTurn]
  }

  // Obtener jugador por ID
  getPlayer(playerId: string): Player | undefined {
    return this.gameState.players.find((p) => p.id === playerId)
  }

  // Verificar si el juego ha terminado
  isGameFinished(): boolean {
    return this.gameState.isGameFinished
  }

  // Obtener ganador
  getWinner(): 0 | 1 | undefined {
    return this.gameState.winner
  }

  // Avanzar turno
  nextTurn(): void {
    this.gameState.currentTurn = this.turnManager.nextTurn()
    logger.debug(`Turno avanzado al jugador ${this.getCurrentPlayer().name} en la room ${this.gameState.id}`)
  }

  // Cambiar fase
  changePhase(newPhase: GamePhase): void {
    this.gameState.currentPhase = newPhase
    this.gameState.phaseData = this.createEmptyPhaseData()

    // Resetear turno según la fase
    this.gameState.currentTurn = this.phaseManager.getStartingPlayerForPhase(newPhase, this.gameState.currentHand)

    logger.info(`Fase cambiada a: ${newPhase} en la room ${this.gameState.id}`, )
  }

  // Actualizar puntuación
  updateScore(team: 0 | 1, points: number): void {
    this.gameState.scores[team] += points

    // Verificar si alguien ganó
    if (this.gameState.scores[team] >= GAME_CONFIG.WINNING_SCORE) {
      this.gameState.isGameFinished = true
      this.gameState.winner = team
      logger.info(
        `¡Partida terminada! Ganó el equipo ${team} con ${this.gameState.scores[team]} puntos en la room ${this.gameState.id}`
      )
    }
  }

  // Iniciar nueva mano
  startNewHand(): void {
    if (this.gameState.isGameFinished) {
      throw new Error("La partida ya ha terminado")
    }

    this.gameState.currentHand++
    this.gameState.currentPhase = GamePhase.MUS
    this.gameState.phaseData = this.createEmptyPhaseData()

    // Limpiar manos de jugadores
    this.gameState.players.forEach((player) => player.clearHand())

    // Rebarajar y repartir nuevas cartas
    this.deckManager.reset()
    this.dealInitialCards()

    // El turno inicial rota
    this.gameState.currentTurn = (this.gameState.currentHand - 1) % 4

    logger.info(`Nueva mano iniciada - Mano ${this.gameState.currentHand} en la room ${this.gameState.id}` )
  }

  // Obtener información de equipos
  getTeamInfo() {
    const team0 = this.gameState.players.filter((p) => p.team === 0)
    const team1 = this.gameState.players.filter((p) => p.team === 1)

    return {
      team0: {
        players: team0.map((p) => p.getPublicInfo()),
        score: this.gameState.scores[0],
      },
      team1: {
        players: team1.map((p) => p.getPublicInfo()),
        score: this.gameState.scores[1],
      },
    }
  }

  // Verificar si todos los jugadores están conectados
  allPlayersConnected(): boolean {
    return this.gameState.players.every((p) => p.isConnected)
  }

  // Obtener jugadores desconectados
  getDisconnectedPlayers(): Player[] {
    return this.gameState.players.filter((p) => !p.isConnected)
  }

  // Reconectar jugador
  reconnectPlayer(playerId: string, socketId: string): boolean {
    const player = this.getPlayer(playerId)
    if (!player) {
      return false
    }

    player.reconnect(socketId)
    logger.info(`Jugador ${player.name} reconectado ${ this.gameState.id}`)
    return true
  }

  /**
   * Procesa una acción del jugador
   */
  playAction(playerId: string, action: Omit<GameAction, "timestamp">): ActionResult {
    const fullAction: GameAction = {
      ...action,
      timestamp: Date.now(),
    }

    const result = ActionHandler.processAction(this.gameState, playerId, fullAction)

    if (result.success) {
      // Aplicar cambios del resultado
      if (result.nextTurn !== undefined) {
        this.gameState.currentTurn = result.nextTurn
      }

      if (result.newPhase) {
        this.changePhase(result.newPhase)
      }

      if (result.phaseComplete && result.points && result.winner !== undefined) {
        this.updateScore(result.winner, result.points)
      }

      logger.info(`Acción procesada: ${action.type} - ${result.message} ${ this.gameState.id}`)
    }

    return result
  }

  /**
   * Procesa descarte de cartas en fase de Mus
   */
  discardCards(playerId: string, cardIndices: number[]): { success: boolean; message: string } {
    const player = this.getPlayer(playerId)
    if (!player) {
      return { success: false, message: "Jugador no encontrado" }
    }

    if (this.gameState.currentPhase !== "mus") {
      return { success: false, message: "Solo se puede descartar en fase de Mus" }
    }

    if (cardIndices.length === 0 || cardIndices.length > 4) {
      return { success: false, message: "Debe descartar entre 1 y 4 cartas" }
    }

    try {
      // Descartar cartas
      const discardedCards = player.discardCards(cardIndices)

      // Dar nuevas cartas
      const newCards = this.deckManager.replaceCards(discardedCards.length)
      player.addCards(newCards)

      logger.info(`${player.name} descartó ${discardedCards.length} cartas ${this.gameState.id}`)

      // Verificar si todos han descartado
      this.checkIfAllPlayersDiscarded()

      return { success: true, message: `Descartaste ${discardedCards.length} cartas` }
    } catch (error) {
      return { success: false, message: "Error al descartar cartas" }
    }
  }

  /**
   * Verifica si todos los jugadores han descartado
   */
  private checkIfAllPlayersDiscarded(): void {
    // Lógica simplificada - en una implementación real verificarías quién ha descartado
    // Por ahora, avanzamos a la siguiente fase después de un descarte
    const allDiscarded = true // Placeholder

    if (allDiscarded) {
      this.changePhase(GamePhase.GRANDE)
      logger.info(`Todos descartaron - avanzando a fase Grande en la room ${this.gameState.id}`)
    }
  }

  /**
   * Resuelve una fase completa del juego
   */
  resolveCurrentPhase(): { winner: 0 | 1; points: number; description: string } | null {
    switch (this.gameState.currentPhase) {
      case "grande":
        return MusLogic.resolveGrande(this.gameState.players)
      case "chica":
        return MusLogic.resolveChica(this.gameState.players)
      case "pares":
        return MusLogic.resolvePares(this.gameState.players)
      case "juego":
        const juegoResult = MusLogic.resolveJuego(this.gameState.players)
        if (juegoResult.points === 0) {
          // Nadie tiene juego, pasar a punto
          this.changePhase(GamePhase.PUNTO)
            logger.info(`Nadie tiene juego - pasando a fase Punto en la room ${this.gameState.id}`)
          return null
        }
        return juegoResult
      case "punto":
        return MusLogic.resolvePunto(this.gameState.players)
      default:
        return null
    }
  }

  /**
   * Evalúa las manos de todos los jugadores
   */
  evaluateAllHands() {
    return this.gameState.players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      hand: MusLogic.evaluateHand(player.hand),
    }))
  }
}
