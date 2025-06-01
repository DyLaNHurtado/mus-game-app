import { GameManager } from "@/core/GameManager"
import type { Game } from "@/core/Game"
import type { Player } from "@/core/Player"
import type { Card } from "@/types/GameTypes"
import { logger } from "./logger"

export class TestUtils {
  /**
   * Crea una room de prueba con 4 jugadores
   */
  static createTestGame(): { gameManager: GameManager; game: Game; players: Player[] } {
    const gameManager = new GameManager()
    const room = gameManager.createRoom()

    // Crear 4 jugadores de prueba
    const playerNames = ["Alice", "Bob", "Charlie", "Diana"]
    const players: Player[] = []

    playerNames.forEach((name, index) => {
      const socketId = `socket-${index}`
      const { player } = gameManager.joinRoom(room.id, name, socketId)
      players.push(player)
    })

    // La room se inicia automáticamente al tener 4 jugadores
    const game = gameManager.getGame(room.id)!

    return { gameManager, game, players }
  }

  /**
   * Crea una mano específica para un jugador (para testing)
   */
  static setPlayerHand(player: Player, cards: Partial<Card>[]): void {
    const fullCards: Card[] = cards.map((card, index) => ({
      suit: card.suit || "oros",
      value: card.value || 1,
      musValue: card.musValue || card.value || 1,
    }))

    player.setHand(fullCards)
  }

  /**
   * Simula una room completa automática
   */
  static async simulateGame(gameManager: GameManager, gameId: string): Promise<void> {
    const game = gameManager.getGame(gameId)
    if (!game) {
      throw new Error("Juego no encontrado")
    }

    logger.info(`🎮 Iniciando simulación de room ${gameId}`)

    let handCount = 0
    const maxHands = 10 // Límite de seguridad

    while (!game.isGameFinished() && handCount < maxHands) {
      handCount++
      logger.info(`--- Mano ${handCount} ---`)

      await this.simulateHand(game)

      if (game.isGameFinished()) {
        const winner = game.getWinner()
        const scores = game.getGameState().scores
        logger.info(`🏆 room terminada! Ganó el equipo ${winner} con ${scores[winner || 0]} puntos`)
        break
      }
    }
  }

  /**
   * Simula una mano completa
   */
  private static async simulateHand(game: Game): Promise<void> {
    const phases = ["mus", "grande", "chica", "pares", "juego"]

    for (const phase of phases) {
      if (game.isGameFinished()) break

      logger.debug(`Simulando fase: ${phase}`)
      await this.simulatePhase(game, phase as any)

      // Pausa pequeña entre fases
      await this.delay(100)
    }
  }

  /**
   * Simula una fase específica
   */
  private static async simulatePhase(game: Game, phase: string): Promise<void> {
    const gameState = game.getGameState()

    if (gameState.currentPhase !== phase) {
      return // La fase ya cambió
    }

    const maxActions = 8 // Límite de seguridad
    let actionCount = 0

    while (gameState.currentPhase === phase && actionCount < maxActions) {
      const currentPlayer = game.getCurrentPlayer()

      if (!currentPlayer.isConnected) {
        game.nextTurn()
        continue
      }

      const action = this.getRandomAction(phase, gameState)
      const result = game.playAction(currentPlayer.id, action)

      logger.debug(`${currentPlayer.name} jugó ${action.type}: ${result.message}`)

      if (result.phaseComplete) {
        break
      }

      actionCount++
      await this.delay(50)
    }
  }

  /**
   * Genera una acción aleatoria válida para una fase
   */
  private static getRandomAction(phase: string, gameState: any): any {
    switch (phase) {
      case "mus":
        return { type: Math.random() < 0.7 ? "mus" : "no-mus" }

      case "grande":
      case "chica":
      case "juego":
        const actions = ["paso", "envido"]
        if (Math.random() < 0.1) actions.push("ordago")
        return {
          type: actions[Math.floor(Math.random() * actions.length)],
          amount: Math.random() < 0.5 ? 2 : 3,
        }

      case "pares":
        return {
          type: Math.random() < 0.8 ? "paso" : "ordago",
        }

      default:
        return { type: "paso" }
    }
  }

  /**
   * Crea manos de prueba específicas
   */
  static createTestHands(): { [key: string]: Card[] } {
    return {
      // Mano con pares de reyes
      paresReyes: [
        { suit: "oros", value: 12, musValue: 10 },
        { suit: "copas", value: 12, musValue: 10 },
        { suit: "espadas", value: 5, musValue: 5 },
        { suit: "bastos", value: 2, musValue: 2 },
      ],

      // Mano con juego (31)
      juego31: [
        { suit: "oros", value: 12, musValue: 10 },
        { suit: "copas", value: 11, musValue: 10 },
        { suit: "espadas", value: 7, musValue: 7 },
        { suit: "bastos", value: 4, musValue: 4 },
      ],

      // Mano con medias (tres ases)
      mediasAses: [
        { suit: "oros", value: 1, musValue: 1 },
        { suit: "copas", value: 1, musValue: 1 },
        { suit: "espadas", value: 1, musValue: 1 },
        { suit: "bastos", value: 7, musValue: 7 },
      ],

      // Mano mala
      manoMala: [
        { suit: "oros", value: 2, musValue: 2 },
        { suit: "copas", value: 3, musValue: 3 },
        { suit: "espadas", value: 4, musValue: 4 },
        { suit: "bastos", value: 5, musValue: 5 },
      ],
    }
  }

  /**
   * Muestra estadísticas de una room
   */
  static logGameStats(game: Game): void {
    const gameState = game.getGameState()
    const teamInfo = game.getTeamInfo()

    logger.info("=== ESTADÍSTICAS DE room ===")
    logger.info(`ID: ${gameState.id}`)
    logger.info(`Mano actual: ${gameState.currentHand}`)
    logger.info(`Fase actual: ${gameState.currentPhase}`)
    logger.info(`Puntuaciones: [${gameState.scores.join(", ")}]`)
    logger.info(`Terminada: ${gameState.isGameFinished ? "Sí" : "No"}`)

    if (gameState.winner !== undefined) {
      logger.info(`Ganador: Equipo ${gameState.winner}`)
    }

    logger.info("--- EQUIPOS ---")
    logger.info(`Equipo 0: ${teamInfo.team0.players.map((p) => p.name).join(", ")} - ${teamInfo.team0.score} puntos`)
    logger.info(`Equipo 1: ${teamInfo.team1.players.map((p) => p.name).join(", ")} - ${teamInfo.team1.score} puntos`)
  }

  /**
   * Delay helper para simulaciones
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Ejecuta tests básicos del sistema
   */
  static runBasicTests(): void {
    logger.info("🧪 Ejecutando tests básicos...")

    try {
      // Test 1: Crear room
      const { gameManager, game, players } = this.createTestGame()
      logger.info("✅ Test 1: Creación de room - PASÓ")

      // Test 2: Verificar manos
      players.forEach((player) => {
        if (player.hand.length !== 4) {
          throw new Error(`Jugador ${player.name} no tiene 4 cartas`)
        }
      })
      logger.info("✅ Test 2: Verificación de manos - PASÓ")

      // Test 3: Verificar equipos
      if (players[0].team !== players[2].team) {
        throw new Error("Equipos mal formados")
      }
      if (players[1].team !== players[3].team) {
        throw new Error("Equipos mal formados")
      }
      logger.info("✅ Test 3: Verificación de equipos - PASÓ")

      // Test 4: Acción válida
      const result = game.playAction(players[0].id, { type: "mus" })
      if (!result.success) {
        throw new Error("Acción válida rechazada")
      }
      logger.info("✅ Test 4: Acción válida - PASÓ")

      logger.info("🎉 Todos los tests básicos pasaron!")
    } catch (error) {
      logger.error(`❌ Test falló: ${error}` )
    }
  }
}
