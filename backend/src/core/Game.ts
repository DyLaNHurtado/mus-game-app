import { DeckManager } from "./DeckManager"
import { logger } from "@/utils/logger"
import { GAME_CONFIG, PHASE_ORDER } from "@/config/constants"
import { type Card, GamePhase, type GameState, type GameAction, type PhaseData } from "@/types/GameTypes"
import type { Player } from "./Player"
import { MusLogic } from "@/logic/MusLogic"

export interface ActionResult {
  success: boolean
  message: string
  newPhase?: GamePhase
  nextTurn?: number
  phaseComplete?: boolean
  points?: number
  winner?: 0 | 1
}

export class Game {
  private gameState: GameState
  private deckManager: DeckManager
  private handPosition: number

  constructor(roomId: string, players: Player[]) {
    if (players.length !== 4) {
      throw new Error("Se requieren exactamente 4 jugadores")
    }

    this.handPosition = 0
    this.deckManager = new DeckManager()

    this.gameState = {
      id: roomId,
      players: [...players],
      currentPhase: GamePhase.MUS,
      currentTurn: (this.handPosition + 1) % 4,
      deck: [],
      scores: [0, 0],
      currentHand: 1,
      phaseData: this.createEmptyPhaseData(GamePhase.MUS),
      isGameFinished: false,
      handPosition: this.handPosition,
    }

    this.dealCards()
    logger.info(`Partida iniciada - Room ${roomId}`)
  }

  // ==================== GESTIÓN DE CARTAS ====================

  private dealCards(): void {
    this.deckManager.reset()
    this.gameState.players.forEach((player) => {
      player.setHand(this.deckManager.dealHand())
    })
  }

  discardCards(playerId: string, cardIndices: number[]): ActionResult {
    const player = this.getPlayer(playerId)
    if (!player) {
      return { success: false, message: "Jugador no encontrado" }
    }

    if (this.gameState.currentPhase !== GamePhase.MUS) {
      return { success: false, message: "Solo se puede descartar en fase de Mus" }
    }

    if (cardIndices.length === 0 || cardIndices.length > 4) {
      return { success: false, message: "Debe descartar entre 1 y 4 cartas" }
    }

    try {
      const discarded = player.discardCards(cardIndices)
      const newCards = this.deckManager.replaceCards(discarded.length)
      player.addCards(newCards)

      return { success: true, message: `Descartaste ${discarded.length} cartas` }
    } catch (error) {
      return { success: false, message: "Error al descartar cartas" }
    }
  }

  // ==================== ACCIONES DEL JUEGO ====================

  playAction(playerId: string, action: Omit<GameAction, "timestamp" | "playerId">): ActionResult {
    const player = this.getPlayer(playerId)
    if (!player) {
      return { success: false, message: "Jugador no encontrado" }
    }

    // Verificar turno (excepto en Mus)
    if (this.gameState.currentPhase !== GamePhase.MUS) {
      if (this.gameState.players[this.gameState.currentTurn].id !== playerId) {
        return { success: false, message: "No es tu turno" }
      }
    }

    const fullAction: GameAction = {
      ...action,
      timestamp: Date.now(),
      playerId,
    }

    player.setLastAction(fullAction)
    this.gameState.phaseData.bets.push(fullAction)

    switch (this.gameState.currentPhase) {
      case GamePhase.MUS:
        return this.handleMusAction(player, fullAction)
      default:
        return this.handleBettingAction(player, fullAction)
    }
  }

  private handleMusAction(player: Player, action: GameAction): ActionResult {
    if (action.type === "no-mus") {
      return this.advancePhase("Mus cortado")
    }

    // Verificar si todos quieren mus
    const musActions = this.gameState.phaseData.bets.filter((bet) => bet.type === "mus")
    if (musActions.length === 4) {
      return { success: true, message: "Todos quieren mus - pueden descartar" }
    }

    return { success: true, message: `${player.name} quiere mus` }
  }

  private handleBettingAction(player: Player, action: GameAction): ActionResult {
    switch (action.type) {
      case "paso":
        return this.handlePaso(player)
      case "envido":
        return this.handleEnvido(player, action.amount || 2)
      case "ordago":
        return this.handleOrdago(player)
      case "acepto":
        return this.resolvePhase(this.gameState.phaseData.phasePoints)
      case "rechazo":
        return this.handleRechazo(player)
      default:
        return { success: false, message: "Acción no válida" }
    }
  }

  private handlePaso(player: Player): ActionResult {
    const team0Passed = this.gameState.players
      .filter((p) => p.team === 0)
      .every((p) => p.getLastAction()?.type === "paso")
    const team1Passed = this.gameState.players
      .filter((p) => p.team === 1)
      .every((p) => p.getLastAction()?.type === "paso")

    if (team0Passed && team1Passed) {
      return this.resolvePhase(1)
    }

    return {
      success: true,
      message: `${player.name} pasó`,
      nextTurn: this.getNextPlayerFromOpposingTeam(player.team),
    }
  }

  private handleEnvido(player: Player, amount: number): ActionResult {
    if (![2, 4, 6, 8, 10, 12, 14, 16, 18, 20].includes(amount)) {
      return { success: false, message: "Cantidad de envido no válida" }
    }

    this.gameState.phaseData.hasEnvido = true
    this.gameState.phaseData.currentBet = { type: "envido", amount, timestamp: Date.now(), playerId: player.id }
    this.gameState.phaseData.phasePoints = amount

    return {
      success: true,
      message: `${player.name} envida ${amount}`,
      nextTurn: this.getNextPlayerFromOpposingTeam(player.team),
    }
  }

  private handleOrdago(player: Player): ActionResult {
    this.gameState.phaseData.hasOrdago = true
    this.gameState.phaseData.currentBet = { type: "ordago", timestamp: Date.now(), playerId: player.id }

    return {
      success: true,
      message: `${player.name} cantó órdago`,
      nextTurn: this.getNextPlayerFromOpposingTeam(player.team),
    }
  }

  private handleRechazo(player: Player): ActionResult {
    const opposingTeam = player.team === 0 ? 1 : 0
    const points = this.gameState.phaseData.currentBet?.amount
      ? Math.max(1, this.gameState.phaseData.currentBet.amount - 2)
      : 1

    return {
      success: true,
      message: `${player.name} rechazó`,
      phaseComplete: true,
      points,
      winner: opposingTeam,
    }
  }

  // ==================== RESOLUCIÓN DE FASES ====================

  private resolvePhase(points: number): ActionResult {
    let phaseResult
    try {
      switch (this.gameState.currentPhase) {
        case GamePhase.GRANDE:
          phaseResult = MusLogic.resolveGrande(this.gameState.players, this.handPosition)
          break
        case GamePhase.CHICA:
          phaseResult = MusLogic.resolveChica(this.gameState.players, this.handPosition)
          break
        case GamePhase.PARES:
          phaseResult = MusLogic.resolvePares(this.gameState.players, this.handPosition)
          break
        case GamePhase.JUEGO:
          phaseResult = MusLogic.resolveJuego(this.gameState.players, this.handPosition)
          break
        case GamePhase.PUNTO:
          phaseResult = MusLogic.resolvePunto(this.gameState.players, this.handPosition)
          break
        default:
          throw new Error(`Fase no válida: ${this.gameState.currentPhase}`)
      }
    } catch (error) {
      return { success: false, message: `Error al resolver fase: ${error}` }
    }

    if (phaseResult.points === 0) {
      return this.advancePhase(phaseResult.description)
    }

    this.updateScore(phaseResult.winner, Math.max(points, phaseResult.points), phaseResult.description)

    const nextPhase = this.getNextPhase()
    if (nextPhase === GamePhase.COUNTING) {
      return this.handleHandEnd()
    }

    return {
      success: true,
      message: phaseResult.description,
      phaseComplete: true,
      newPhase: nextPhase,
      nextTurn: (this.handPosition + 1) % 4,
      points: Math.max(points, phaseResult.points),
      winner: phaseResult.winner,
    }
  }

  private advancePhase(message: string): ActionResult {
    const nextPhase = this.getNextPhase()

    if (nextPhase === GamePhase.COUNTING) {
      return this.handleHandEnd()
    }

    return {
      success: true,
      message,
      newPhase: nextPhase,
      nextTurn: (this.handPosition + 1) % 4,
      phaseComplete: true,
    }
  }

  private handleHandEnd(): ActionResult {
    if (
      this.gameState.scores[0] >= GAME_CONFIG.WINNING_SCORE ||
      this.gameState.scores[1] >= GAME_CONFIG.WINNING_SCORE
    ) {
      this.gameState.isGameFinished = true
      this.gameState.winner = this.gameState.scores[0] >= GAME_CONFIG.WINNING_SCORE ? 0 : 1
      return {
        success: true,
        message: `¡Partida terminada! Ganó el equipo ${this.gameState.winner}`,
        newPhase: GamePhase.FINISHED,
      }
    }

    // Nueva mano
    setTimeout(() => this.startNewHand(), 2000)
    return {
      success: true,
      message: "Mano terminada - iniciando nueva mano",
      newPhase: GamePhase.COUNTING,
    }
  }

  private startNewHand(): void {
    this.gameState.currentHand++
    this.handPosition = (this.handPosition + 1) % 4
    this.gameState.handPosition = this.handPosition
    this.gameState.currentPhase = GamePhase.MUS
    this.gameState.phaseData = this.createEmptyPhaseData(GamePhase.MUS)
    this.gameState.currentTurn = (this.handPosition + 1) % 4

    this.gameState.players.forEach((player) => {
      player.clearHand()
      player.setLastAction(null)
    })

    this.dealCards()
    logger.info(`Nueva mano ${this.gameState.currentHand}`)
  }

  // ==================== UTILIDADES ====================

  private updateScore(team: 0 | 1, points: number, reason: string): void {
    this.gameState.scores[team] += points
    logger.info(`Equipo ${team} suma ${points} puntos: ${reason}`)
  }

  private getNextPhase(): GamePhase {
    const currentIndex = PHASE_ORDER.indexOf(this.gameState.currentPhase)
    if (currentIndex === -1 || currentIndex >= PHASE_ORDER.length - 1) {
      return GamePhase.COUNTING
    }
    return PHASE_ORDER[currentIndex + 1] as GamePhase
  }

  private getNextPlayerFromOpposingTeam(currentTeam: 0 | 1): number {
    const opposingTeam = currentTeam === 0 ? 1 : 0
    const currentTurn = this.gameState.currentTurn

    for (let i = 1; i <= 4; i++) {
      const nextIndex = (currentTurn + i) % 4
      const nextPlayer = this.gameState.players[nextIndex]
      if (nextPlayer.team === opposingTeam && nextPlayer.isConnected) {
        return nextIndex
      }
    }
    return currentTurn
  }

  private createEmptyPhaseData(phase: GamePhase): PhaseData {
    const defaultPoints = [GamePhase.JUEGO].includes(phase) ? 2 : 1
    return {
      bets: [],
      hasEnvido: false,
      hasOrdago: false,
      phasePoints: defaultPoints,
    }
  }

  // ==================== GETTERS PÚBLICOS ====================

  getGameState(playerId?: string): GameState {
    if (!playerId) {
      return { ...this.gameState }
    }

    return {
      ...this.gameState,
      players: this.gameState.players.map((p) => ({
        ...p.getPublicInfo(),
        hand: p.id === playerId ? p.hand : [],
      })) as unknown as Player[],
    }
  }

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
      players: this.gameState.players.map((p) => p.getPublicInfo()) as unknown as Player[],
      handPosition: this.handPosition,
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.gameState.players.find((p) => p.id === playerId)
  }

  getPlayerHand(playerId: string): Card[] {
    const player = this.getPlayer(playerId)
    return player ? [...player.hand] : []
  }

  isPlayerTurn(playerId: string): boolean {
    if (this.gameState.currentPhase === GamePhase.MUS) return true
    return this.gameState.players[this.gameState.currentTurn].id === playerId
  }

  isGameFinished(): boolean {
    return this.gameState.isGameFinished
  }

  getWinner(): 0 | 1 | undefined {
    return this.gameState.winner
  }

  getTeamInfo() {
    const team0 = this.gameState.players.filter((p) => p.team === 0)
    const team1 = this.gameState.players.filter((p) => p.team === 1)

    return {
      team0: { players: team0.map((p) => p.getPublicInfo()), score: this.gameState.scores[0] },
      team1: { players: team1.map((p) => p.getPublicInfo()), score: this.gameState.scores[1] },
    }
  }

  // Para debugging/admin
  simulateAllPhases() {
    return MusLogic.simulateCompleteHand(this.gameState.players, this.handPosition)
  }

  getHandSummary() {
    return {
      handNumber: this.gameState.currentHand,
      handPosition: this.handPosition,
      handPlayer: this.gameState.players[this.handPosition].name,
      evaluations: this.gameState.players.map((player) => ({
        player: player.name,
        team: player.team,
        evaluation: MusLogic.evaluateCompleteHand(player.hand),
      })),
    }
  }

  // Gestión de conexiones
  reconnectPlayer(playerId: string, socketId: string): boolean {
    const player = this.getPlayer(playerId)
    if (!player) return false
    player.reconnect(socketId)
    return true
  }

  allPlayersConnected(): boolean {
    return this.gameState.players.every((p) => p.isConnected)
  }

  getDisconnectedPlayers(): Player[] {
    return this.gameState.players.filter((p) => !p.isConnected)
  }

  // Cambio de fase (para uso interno y testing)
  changePhase(newPhase: GamePhase): void {
    this.gameState.currentPhase = newPhase
    this.gameState.phaseData = this.createEmptyPhaseData(newPhase)
    this.gameState.currentTurn = (this.handPosition + 1) % 4
  }
}
