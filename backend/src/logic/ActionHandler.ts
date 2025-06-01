import { GameAction, GameState, GamePhase } from "@/types/GameTypes"
import { MusLogic } from "./MusLogic"
import { PHASE_ORDER } from "@/config/constants"
import { Player } from "@/core/Player"

export interface ActionResult {
  success: boolean
  newPhase?: GamePhase
  nextTurn?: number
  phaseComplete?: boolean
  points?: number
  winner?: 0 | 1
  message: string
}

export class ActionHandler {
  /**
   * Procesa una acción del jugador
   */
  static processAction(gameState: GameState, playerId: string, action: GameAction): ActionResult {
    const player = gameState.players.find((p) => p.id === playerId)
    if (!player) {
      return { success: false, message: "Jugador no encontrado" }
    }

    // Verificar turno
    if (gameState.players[gameState.currentTurn].id !== playerId) {
      return { success: false, message: "No es tu turno" }
    }

    switch (gameState.currentPhase) {
      case  GamePhase.MUS:
        return this.handleMusAction(gameState, player, action)

      case GamePhase.GRANDE:
      case GamePhase.CHICA:
      case  GamePhase.PARES:
      case  GamePhase.JUEGO:
      case  GamePhase.PUNTO:
        return this.handleBettingAction(gameState, player, action)

      default:
        return { success: false, message: "Fase no válida para acciones" }
    }
  }

  /**
   * Maneja acciones en la fase de Mus
   */
  private static handleMusAction(gameState: GameState, player: Player, action: GameAction): ActionResult {
    if (!["mus", "no-mus"].includes(action.type)) {
      return { success: false, message: "Acción no válida en fase Mus" }
    }

    // Registrar acción
    player.setLastAction(action)
    gameState.phaseData.bets.push(action)

    if (action.type === "no-mus") {
      // Si alguien dice "no mus", se termina la fase de mus
      return {
        success: true,
        newPhase: GamePhase.GRANDE,
        nextTurn: this.getNextPhaseStartingPlayer(gameState),
        phaseComplete: true,
        message: `${player.name} cortó el mus`,
      }
    }

    // Verificar si todos han dicho mus
    const musActions = gameState.phaseData.bets.filter((bet) => bet.type === "mus")
    if (musActions.length === 4) {
      // Todos quieren mus - fase de descarte
      return {
        success: true,
        message: "Todos quieren mus - tiempo de descartar",
        nextTurn: 0, // Empezar descartes desde posición 0
      }
    }

    // Pasar al siguiente jugador
    return {
      success: true,
      nextTurn: (gameState.currentTurn + 1) % 4,
      message: `${player.name} quiere mus`,
    }
  }

  /**
   * Maneja acciones en las fases de apuestas
   */
  private static handleBettingAction(gameState: GameState, player: Player, action: GameAction): ActionResult {
    const validActions = this.getValidActionsForPhase(gameState.currentPhase, gameState.phaseData)

    if (!validActions.includes(action.type)) {
      return {
        success: false,
        message: `Acción ${action.type} no válida en fase ${gameState.currentPhase}`,
      }
    }

    // Registrar acción
    player.setLastAction(action)
    gameState.phaseData.bets.push(action)

    switch (action.type) {
      case "paso":
        return this.handlePaso(gameState, player)

      case "envido":
        return this.handleEnvido(gameState, player, action.amount || 2)

      case "ordago":
        return this.handleOrdago(gameState, player)

      case "acepto":
        return this.handleAcepto(gameState, player)

      case "rechazo":
        return this.handleRechazo(gameState, player)

      default:
        return { success: false, message: "Acción no reconocida" }
    }
  }

  /**
   * Maneja la acción "paso"
   */
  private static handlePaso(gameState: GameState, player: Player): ActionResult {
    // Verificar si todos han pasado
    const currentTeamMates = gameState.players.filter((p) => p.team === player.team)
    const currentTeamPassed = currentTeamMates.every((p) => p.lastAction?.type === "paso")

    if (currentTeamPassed) {
      // El equipo completo pasó - la fase termina sin puntos
      return {
        success: true,
        phaseComplete: true,
        newPhase: this.getNextPhase(gameState.currentPhase),
        nextTurn: this.getNextPhaseStartingPlayer(gameState),
        points: 0,
        message: `Equipo ${player.team} pasó - fase sin puntos`,
      }
    }

    // Pasar turno al siguiente jugador del equipo contrario
    return {
      success: true,
      nextTurn: this.getNextPlayerFromOpposingTeam(gameState, player.team),
      message: `${player.name} pasó`,
    }
  }

  /**
   * Maneja la acción "envido"
   */
  private static handleEnvido(gameState: GameState, player: Player, amount: number): ActionResult {
    if (gameState.phaseData.hasOrdago) {
      return { success: false, message: "No se puede envidar después de órdago" }
    }

    gameState.phaseData.hasEnvido = true
    gameState.phaseData.currentBet = {
      type: "envido",
      amount,
      timestamp: Date.now(),
    }
    gameState.phaseData.phasePoints = amount

    return {
      success: true,
      nextTurn: this.getNextPlayerFromOpposingTeam(gameState, player.team),
      message: `${player.name} envida ${amount} tanto${amount > 1 ? "s" : ""}`,
    }
  }

  /**
   * Maneja la acción "órdago"
   */
  private static handleOrdago(gameState: GameState, player: Player): ActionResult {
    // Verificar si la fase permite órdago
    if (gameState.currentPhase ===  GamePhase.PARES) {
      // En pares, solo se puede hacer órdago si alguien tiene pares
      const anyoneHasPares = gameState.players.some((p) => MusLogic.evaluatePares(p.hand).type !== "nada")

      if (!anyoneHasPares) {
        return { success: false, message: "No se puede hacer órdago en pares sin pares" }
      }
    }

    gameState.phaseData.hasOrdago = true
    gameState.phaseData.currentBet = {
      type: "ordago",
      timestamp: Date.now(),
    }

    return {
      success: true,
      nextTurn: this.getNextPlayerFromOpposingTeam(gameState, player.team),
      message: `${player.name} cantó órdago`,
    }
  }

  /**
   * Maneja la acción "acepto"
   */
  private static handleAcepto(gameState: GameState, player: Player): ActionResult {
    if (!gameState.phaseData.currentBet) {
      return { success: false, message: "No hay apuesta que aceptar" }
    }

    // Resolver la fase inmediatamente
    const result = this.resolvePhase(gameState)

    let points = gameState.phaseData.phasePoints
    if (gameState.phaseData.hasOrdago) {
      // Órdago = toda la room
      points = 40
    }

    return {
      success: true,
      phaseComplete: true,
      newPhase: this.getNextPhase(gameState.currentPhase),
      nextTurn: this.getNextPhaseStartingPlayer(gameState),
      points: points,
      winner: result.winner,
      message: `${player.name} aceptó - ${result.description}`,
    }
  }

  /**
   * Maneja la acción "rechazo"
   */
  private static handleRechazo(gameState: GameState, player: Player): ActionResult {
    if (!gameState.phaseData.currentBet) {
      return { success: false, message: "No hay apuesta que rechazar" }
    }

    // El equipo que rechaza pierde la apuesta anterior
    const opposingTeam = player.team === 0 ? 1 : 0
    const points = Math.max(1, (gameState.phaseData.currentBet.amount || 1) - 1)

    return {
      success: true,
      phaseComplete: true,
      newPhase: this.getNextPhase(gameState.currentPhase),
      nextTurn: this.getNextPhaseStartingPlayer(gameState),
      points: points,
      winner: opposingTeam,
      message: `${player.name} rechazó - el equipo contrario gana ${points} punto${points > 1 ? "s" : ""}`,
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Resuelve una fase del juego
   */
  private static resolvePhase(gameState: GameState) {
    switch (gameState.currentPhase) {
      case  GamePhase.GRANDE:
        return MusLogic.resolveGrande(gameState.players)
      case  GamePhase.CHICA:
        return MusLogic.resolveChica(gameState.players)
      case  GamePhase.PARES:
        return MusLogic.resolvePares(gameState.players)
      case  GamePhase.JUEGO:
        return MusLogic.resolveJuego(gameState.players)
      case  GamePhase.PUNTO:
        return MusLogic.resolvePunto(gameState.players)
      default:
        throw new Error(`Fase no reconocida: ${gameState.currentPhase}`)
    }
  }

  /**
   * Obtiene acciones válidas para una fase
   */
  private static getValidActionsForPhase(phase: GamePhase, phaseData: any): string[] {
    if (phaseData.currentBet) {
      // Si hay una apuesta activa, solo se puede aceptar o rechazar
      return ["acepto", "rechazo"]
    }

    switch (phase) {
      case  GamePhase.PARES:
        // En pares solo se puede órdago o paso
        return ["paso", "ordago"]

      case  GamePhase.GRANDE:
      case  GamePhase.CHICA:
      case  GamePhase.JUEGO:
      case  GamePhase.PUNTO:
        return ["paso", "envido", "ordago"]

      default:
        return []
    }
  }

  /**
   * Obtiene la siguiente fase
   */
  private static getNextPhase(currentPhase: GamePhase): GamePhase {
    const currentIndex = PHASE_ORDER.indexOf(currentPhase)

    if (currentIndex === -1 || currentIndex >= PHASE_ORDER.length - 1) {
      return GamePhase.COUNTING;
    }

    return PHASE_ORDER[currentIndex + 1]
  }

  /**
   * Obtiene el jugador que inicia la siguiente fase
   */
  private static getNextPhaseStartingPlayer(gameState: GameState): number {
    // En todas las fases después del mus, empieza el jugador a la derecha del que repartió
    return (gameState.currentHand - 1) % 4
  }

  /**
   * Obtiene el siguiente jugador del equipo contrario
   */
  private static getNextPlayerFromOpposingTeam(gameState: GameState, currentTeam: 0 | 1): number {
    const opposingTeam = currentTeam === 0 ? 1 : 0
    const currentTurn = gameState.currentTurn

    // Buscar el siguiente jugador del equipo contrario
    for (let i = 1; i <= 4; i++) {
      const nextIndex = (currentTurn + i) % 4
      const nextPlayer = gameState.players[nextIndex]

      if (nextPlayer.team === opposingTeam && nextPlayer.isConnected) {
        return nextIndex
      }
    }

    // Fallback - siguiente jugador conectado
    for (let i = 1; i <= 4; i++) {
      const nextIndex = (currentTurn + i) % 4
      if (gameState.players[nextIndex].isConnected) {
        return nextIndex
      }
    }

    return currentTurn // No cambiar si no hay alternativa
  }
}
