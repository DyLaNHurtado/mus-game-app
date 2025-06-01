import { Player } from "@/core/Player"
import { Card } from "@/types/GameTypes"

export interface HandRanking {
  type: "pares" | "medias" | "duples" | "juego" | "punto" | "nada"
  value: number
  cards: Card[]
  description: string
}

export interface PhaseResult {
  winner: 0 | 1
  rankings: HandRanking[]
  points: number
  description: string
}

export class MusLogic {
  // ==================== EVALUACIÓN DE MANOS ====================

  /**
   * Evalúa la mano de un jugador para todas las modalidades
   */
  static evaluateHand(cards: Card[]): HandRanking {
    if (cards.length !== 4) {
      throw new Error("Una mano debe tener exactamente 4 cartas")
    }

    // Verificar pares primero (más importantes)
    const paresResult = this.evaluatePares(cards)
    if (paresResult.type !== "nada") {
      return paresResult
    }

    // Verificar juego
    const juegoResult = this.evaluateJuego(cards)
    if (juegoResult.type === "juego") {
      return juegoResult
    }

    // Si no hay juego, es punto
    return this.evaluatePunto(cards)
  }

  /**
   * Evalúa pares en la mano
   */
  static evaluatePares(cards: Card[]): HandRanking {
    const valueCounts = new Map<number, number>()

    // Contar ocurrencias de cada valor
    cards.forEach((card) => {
      const count = valueCounts.get(card.musValue) || 0
      valueCounts.set(card.musValue, count + 1)
    })

    const pairs: number[] = []
    const counts = Array.from(valueCounts.values()).sort((a, b) => b - a)

    valueCounts.forEach((count, value) => {
      if (count >= 2) {
        pairs.push(value)
      }
    })

    pairs.sort((a, b) => b - a) // Ordenar de mayor a menor

    // Duples (dos pares)
    if (pairs.length >= 2) {
      return {
        type: "duples",
        value: pairs[0] * 100 + pairs[1], // Valor compuesto para comparación
        cards: cards,
        description: `Duples de ${this.getCardName(pairs[0])} y ${this.getCardName(pairs[1])}`,
      }
    }

    // Medias (tres iguales)
    if (counts[0] === 3) {
      const threeValue = pairs[0]
      return {
        type: "medias",
        value: threeValue * 1000, // Valor alto para que gane a pares
        cards: cards,
        description: `Medias de ${this.getCardName(threeValue)}`,
      }
    }

    // Pares (dos iguales)
    if (pairs.length === 1) {
      return {
        type: "pares",
        value: pairs[0] * 100,
        cards: cards,
        description: `Pares de ${this.getCardName(pairs[0])}`,
      }
    }

    return {
      type: "nada",
      value: 0,
      cards: cards,
      description: "Sin pares",
    }
  }

  /**
   * Evalúa si hay juego (31 o más puntos)
   */
  static evaluateJuego(cards: Card[]): HandRanking {
    const total = cards.reduce((sum, card) => sum + card.musValue, 0)

    if (total >= 31) {
      return {
        type: "juego",
        value: total,
        cards: cards,
        description: `Juego de ${total}`,
      }
    }

    return {
      type: "nada",
      value: 0,
      cards: cards,
      description: "Sin juego",
    }
  }

  /**
   * Evalúa punto (suma total de la mano)
   */
  static evaluatePunto(cards: Card[]): HandRanking {
    const total = cards.reduce((sum, card) => sum + card.musValue, 0)

    return {
      type: "punto",
      value: total,
      cards: cards,
      description: `Punto de ${total}`,
    }
  }

  // ==================== COMPARACIONES DE FASES ====================

  /**
   * Resuelve la fase Grande (carta más alta)
   */
  static resolveGrande(players: Player[]): PhaseResult {
    const rankings = players.map((player) => {
      const maxCard = player.hand.reduce((max, card) => (card.musValue > max.musValue ? card : max))

      return {
        type: "nada" as const,
        value: maxCard.musValue,
        cards: [maxCard],
        description: `${this.getCardName(maxCard.musValue)} de ${maxCard.suit}`,
        player,
      }
    })

    // Ordenar por valor descendente
    rankings.sort((a, b) => b.value - a.value)

    // Verificar empates
    const maxValue = rankings[0].value
    const winners = rankings.filter((r) => r.value === maxValue)

    if (winners.length > 1) {
      // Empate - resolver por mano
      return this.resolveByMano(winners, "Grande")
    }

    const winnerPlayer = (rankings[0] as any).player
    return {
      winner: winnerPlayer.team,
      rankings: rankings,
      points: 1,
      description: `Grande: ${rankings[0].description}`,
    }
  }

  /**
   * Resuelve la fase Chica (carta más baja)
   */
  static resolveChica(players: Player[]): PhaseResult {
    const rankings = players.map((player) => {
      const minCard = player.hand.reduce((min, card) => (card.musValue < min.musValue ? card : min))

      return {
        type: "nada" as const,
        value: minCard.musValue,
        cards: [minCard],
        description: `${this.getCardName(minCard.musValue)} de ${minCard.suit}`,
        player,
      }
    })

    // Ordenar por valor ascendente (menor gana)
    rankings.sort((a, b) => a.value - b.value)

    const minValue = rankings[0].value
    const winners = rankings.filter((r) => r.value === minValue)

    if (winners.length > 1) {
      return this.resolveByMano(winners, "Chica")
    }

    const winnerPlayer = (rankings[0] as any).player
    return {
      winner: winnerPlayer.team,
      rankings: rankings,
      points: 1,
      description: `Chica: ${rankings[0].description}`,
    }
  }

  /**
   * Resuelve la fase Pares
   */
  static resolvePares(players: Player[]): PhaseResult {
    const rankings = players.map((player) => ({
      ...this.evaluatePares(player.hand),
      player,
    }))

    // Filtrar solo jugadores con pares
    const withPares = rankings.filter((r) => r.type !== "nada")

    if (withPares.length === 0) {
      // Nadie tiene pares - no se juega esta fase
      return {
        winner: 0, // Valor dummy
        rankings: rankings,
        points: 0,
        description: "Nadie tiene pares - fase no jugada",
      }
    }

    // Ordenar por tipo y valor (medias > duples > pares, luego por valor)
    withPares.sort((a, b) => {
      if (a.type !== b.type) {
        const order = { medias: 3, duples: 2, pares: 1, nada: 0 }
        return order[b.type] - order[a.type]
      }
      return b.value - a.value
    })

    const maxValue = withPares[0].value
    const maxType = withPares[0].type
    const winners = withPares.filter((r) => r.type === maxType && r.value === maxValue)

    if (winners.length > 1) {
      return this.resolveByMano(winners, "Pares")
    }

    const winnerPlayer = (withPares[0] as any).player
    return {
      winner: winnerPlayer.team,
      rankings: rankings,
      points: 1,
      description: `Pares: ${withPares[0].description}`,
    }
  }

  /**
   * Resuelve la fase Juego
   */
  static resolveJuego(players: Player[]): PhaseResult {
    const rankings = players.map((player) => ({
      ...this.evaluateJuego(player.hand),
      player,
    }))

    // Filtrar solo jugadores con juego
    const withJuego = rankings.filter((r) => r.type === "juego")

    if (withJuego.length === 0) {
      // Nadie tiene juego - pasar a Punto
      return {
        winner: 0, // Valor dummy
        rankings: rankings,
        points: 0,
        description: "Nadie tiene juego - pasar a Punto",
      }
    }

    // Ordenar por valor descendente
    withJuego.sort((a, b) => b.value - a.value)

    const maxValue = withJuego[0].value
    const winners = withJuego.filter((r) => r.value === maxValue)

    if (winners.length > 1) {
      return this.resolveByMano(winners, "Juego")
    }

    const winnerPlayer = (withJuego[0] as any).player
    return {
      winner: winnerPlayer.team,
      rankings: rankings,
      points: 2, // Juego vale 2 puntos
      description: `Juego: ${withJuego[0].description}`,
    }
  }

  /**
   * Resuelve la fase Punto
   */
  static resolvePunto(players: Player[]): PhaseResult {
    const rankings = players.map((player) => ({
      ...this.evaluatePunto(player.hand),
      player,
    }))

    // Ordenar por valor descendente
    rankings.sort((a, b) => b.value - a.value)

    const maxValue = rankings[0].value
    const winners = rankings.filter((r) => r.value === maxValue)

    if (winners.length > 1) {
      return this.resolveByMano(winners, "Punto")
    }

    const winnerPlayer = (rankings[0] as any).player
    return {
      winner: winnerPlayer.team,
      rankings: rankings,
      points: 1,
      description: `Punto: ${rankings[0].description}`,
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Resuelve empates por la mano (posición del jugador)
   */
  private static resolveByMano(winners: any[], phase: string): PhaseResult {
    // En caso de empate, gana el jugador más cercano a la mano (menor posición)
    winners.sort((a, b) => a.player.position - b.player.position)

    const winnerPlayer = winners[0].player
    const points = phase === "Juego" ? 2 : 1

    return {
      winner: winnerPlayer.team,
      rankings: winners,
      points: points,
      description: `${phase}: Empate resuelto por mano - ${winners[0].description}`,
    }
  }

  /**
   * Obtiene el nombre legible de una carta
   */
  private static getCardName(value: number): string {
    const names: Record<number, string> = {
      1: "As",
      2: "Dos",
      3: "Tres",
      4: "Cuatro",
      5: "Cinco",
      6: "Seis",
      7: "Siete",
      10: "Rey/Caballo", // En el mus, Rey y Caballo valen 10
    }

    return names[value] || `Carta ${value}`
  }

  /**
   * Verifica si una mano quiere Mus
   */
  static shouldAcceptMus(cards: Card[]): boolean {
    const hand = this.evaluateHand(cards)

    // No mus si tiene medias, duples o juego bueno
    if (hand.type === "medias" || hand.type === "duples") {
      return false
    }

    if (hand.type === "juego" && hand.value >= 35) {
      return false
    }

    // No mus si tiene pares altos
    if (hand.type === "pares" && hand.value >= 1000) {
      // Rey o Caballo
      return false
    }

    // Generalmente acepta mus si la mano es mala
    return true
  }

  /**
   * Obtiene sugerencias de descarte para mejorar la mano
   */
  static getDiscardSuggestions(cards: Card[]): number[] {
    const hand = this.evaluateHand(cards)

    // Si ya tiene buena mano, no descartar nada
    if (
      hand.type === "medias" ||
      hand.type === "duples" ||
      (hand.type === "juego" && hand.value >= 35) ||
      (hand.type === "pares" && hand.value >= 1000)
    ) {
      return []
    }

    // Estrategia básica: descartar cartas más bajas sin romper pares
    const valueCounts = new Map<number, number>()
    cards.forEach((card, index) => {
      const count = valueCounts.get(card.musValue) || 0
      valueCounts.set(card.musValue, count + 1)
    })

    const toDiscard: number[] = []

    cards.forEach((card, index) => {
      const count = valueCounts.get(card.musValue) || 0

      // No descartar si forma parte de un par
      if (count >= 2) return

      // Descartar cartas bajas (menos de 5)
      if (card.musValue < 5) {
        toDiscard.push(index)
      }
    })

    // Limitar a máximo 3 cartas
    return toDiscard.slice(0, 3)
  }
}
