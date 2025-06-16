import type { GameState, Card } from "../types/GameTypes"

export class TestUtils {
  // Crear manos específicas para testing
  static createTestHand(cards: string[]): Card[] {
    return cards.map((cardStr) => {
      const [value, suit] = cardStr.split("-")
      return {
        suit: suit as "oros" | "copas" | "espadas" | "bastos",
        value: Number.parseInt(value),
      }
    })
  }

  // Crear escenarios específicos
  static createScenario(type: "good-hand" | "bad-hand" | "pairs" | "juego"): Card[] {
    switch (type) {
      case "good-hand":
        return this.createTestHand(["10-oros", "11-copas", "12-espadas", "7-bastos"])
      case "bad-hand":
        return this.createTestHand(["4-oros", "5-copas", "6-espadas", "2-bastos"])
      case "pairs":
        return this.createTestHand(["10-oros", "10-copas", "5-espadas", "6-bastos"])
      case "juego":
        return this.createTestHand(["10-oros", "11-copas", "12-espadas", "1-bastos"]) // 31 puntos
      default:
        return this.createTestHand(["1-oros", "2-copas", "3-espadas", "4-bastos"])
    }
  }

  // Logging mejorado para testing
  static logGameState(gameState: GameState): void {
    console.log("\n🎮 ESTADO DEL JUEGO:")
    console.log(`Fase: ${gameState.currentPhase}`)
    console.log(`Turno: ${gameState.players[gameState.currentTurn]?.name}`)
    console.log(`Puntuación: ${gameState.scores[0]} - ${gameState.scores[1]}`)
    console.log(`Mano: ${gameState.currentHand}`)

    console.log("\n👥 JUGADORES:")
    gameState.players.forEach((player) => {
      console.log(`${player.name} (Equipo ${player.team}): ${player.hand.length} cartas`)
    })
  }

  // Validar estado del juego
  static validateGameState(gameState: GameState): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (gameState.players.length !== 4) {
      errors.push("Debe haber exactamente 4 jugadores")
    }

    if (gameState.currentTurn < 0 || gameState.currentTurn >= 4) {
      errors.push("Turno inválido")
    }

    if (gameState.scores[0] < 0 || gameState.scores[1] < 0) {
      errors.push("Puntuaciones no pueden ser negativas")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // Crear jugadores de prueba
  static createTestPlayers(): Array<{ name: string; team: 0 | 1 }> {
    return [
      { name: "Test_Juan", team: 0 },
      { name: "Test_María", team: 1 },
      { name: "Test_Pedro", team: 0 },
      { name: "Test_Ana", team: 1 },
    ]
  }

  // Generar ID de room de prueba
  static generateTestRoomId(): string {
    return `TEST_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  }
}
