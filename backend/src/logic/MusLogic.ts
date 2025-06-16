import type { Player } from "@/core/Player"
import type { Card } from "@/types/GameTypes"

export interface HandRanking {
  type: "pares" | "medias" | "duples" | "juego" | "punto" | "nada"
  value: number
  cards: Card[]
  description: string
  // Información adicional para comparaciones
  primaryValue?: number
  secondaryValue?: number
  equivalentValue?: number // Para manejar equivalencias Rey=Tres, As=Dos
}

export interface PhaseResult {
  winner: 0 | 1
  rankings: (HandRanking & { player: Player })[]
  points: number
  description: string
}

export interface CompleteHandEvaluation {
  pares: HandRanking
  juego: HandRanking
  punto: HandRanking
  grande: { value: number; equivalentValue: number; card: Card }
  chica: { value: number; equivalentValue: number; card: Card }
}

export class MusLogic {
  // Valores para el juego (suma de puntos) - CORREGIDO
  private static readonly GAME_VALUES: Record<number, number> = {
    1: 1, // As = 1 punto
    2: 1, // Dos = 1 punto
    3: 10, // Tres = 10 puntos
    4: 4, // Cuatro = 4 puntos
    5: 5, // Cinco = 5 puntos
    6: 6, // Seis = 6 puntos
    7: 7, // Siete = 7 puntos
    8: 10, // Sota = 10 puntos
    9: 10, // Caballo = 10 puntos
    10: 10, // Rey = 10 puntos
  }

  // Equivalencias para comparaciones (Rey=Tres, As=Dos)
  private static readonly EQUIVALENT_VALUES: Record<number, number> = {
    1: 2, // As = Dos
    2: 2, // Dos = Dos
    3: 10, // Tres = Rey
    4: 4, // Cuatro
    5: 5, // Cinco
    6: 6, // Seis
    7: 7, // Siete
    8: 8, // Sota
    9: 9, // Caballo
    10: 10, // Rey = Tres
  }

  // Orden para Grande (de mayor a menor)
  private static readonly GRANDE_ORDER = [10, 9, 8, 7, 6, 5, 4, 2] // Rey/Tres, Caballo, Sota, Siete, Seis, Cinco, Cuatro, As/Dos

  // Orden para Chica (de menor a mayor - inverso de Grande)
  private static readonly CHICA_ORDER = [2, 4, 5, 6, 7, 8, 9, 10] // As/Dos, Cuatro, Cinco, Seis, Siete, Sota, Caballo, Rey/Tres

  // Orden para Punto: 31 es lo mejor, luego 32, luego descendente desde 40
  private static readonly PUNTO_ORDER = [31, 32, 40, 39, 38, 37, 36, 35, 34, 33]

  // ==================== EVALUACIÓN COMPLETA DE MANOS ====================

  /**
   * Evalúa completamente la mano de un jugador para todas las modalidades
   */
  static evaluateCompleteHand(cards: Card[]): CompleteHandEvaluation {
    if (cards.length !== 4) {
      throw new Error("Una mano debe tener exactamente 4 cartas")
    }

    const pares = this.evaluatePares(cards)
    const juego = this.evaluateJuego(cards)
    const punto = this.evaluatePunto(cards)

    // Para Grande: encontrar la carta con mayor valor equivalente
    let grandeCard = cards[0]
    let grandeEquivalent = this.EQUIVALENT_VALUES[cards[0].value]

    for (const card of cards) {
      const equivalent = this.EQUIVALENT_VALUES[card.value]
      const currentIndex = this.GRANDE_ORDER.indexOf(equivalent)
      const bestIndex = this.GRANDE_ORDER.indexOf(grandeEquivalent)

      if (currentIndex < bestIndex) {
        // Menor índice = mayor valor
        grandeCard = card
        grandeEquivalent = equivalent
      }
    }

    // Para Chica: encontrar la carta con menor valor equivalente
    let chicaCard = cards[0]
    let chicaEquivalent = this.EQUIVALENT_VALUES[cards[0].value]

    for (const card of cards) {
      const equivalent = this.EQUIVALENT_VALUES[card.value]
      const currentIndex = this.CHICA_ORDER.indexOf(equivalent)
      const bestIndex = this.CHICA_ORDER.indexOf(chicaEquivalent)

      if (currentIndex < bestIndex) {
        // Menor índice = menor valor
        chicaCard = card
        chicaEquivalent = equivalent
      }
    }

    return {
      pares,
      juego,
      punto,
      grande: {
        value: grandeCard.value,
        equivalentValue: grandeEquivalent,
        card: grandeCard,
      },
      chica: {
        value: chicaCard.value,
        equivalentValue: chicaEquivalent,
        card: chicaCard,
      },
    }
  }

  /**
   * Evalúa la mejor combinación de la mano (prioridad: pares > juego > punto)
   */
  static evaluateHand(cards: Card[]): HandRanking {
    const evaluation = this.evaluateCompleteHand(cards)

    // Los pares tienen prioridad sobre todo
    if (evaluation.pares.type !== "nada") {
      return evaluation.pares
    }

    // Si no hay pares, el juego tiene prioridad sobre punto
    if (evaluation.juego.type === "juego") {
      return evaluation.juego
    }

    // Si no hay juego, devolver punto
    return evaluation.punto
  }

  /**
   * Evalúa pares en la mano usando equivalencias correctas
   * CORREGIDO: Duples > Medias > Pares
   */
  static evaluatePares(cards: Card[]): HandRanking {
    // Agrupar cartas por valor equivalente
    const equivalentGroups = new Map<number, Card[]>()

    cards.forEach((card) => {
      const equivalent = this.EQUIVALENT_VALUES[card.value]
      if (!equivalentGroups.has(equivalent)) {
        equivalentGroups.set(equivalent, [])
      }
      equivalentGroups.get(equivalent)!.push(card)
    })

    // Encontrar grupos con 2 o más cartas
    const pairs: { equivalentValue: number; count: number; cards: Card[] }[] = []

    equivalentGroups.forEach((cardGroup, equivalentValue) => {
      if (cardGroup.length >= 2) {
        pairs.push({
          equivalentValue,
          count: cardGroup.length,
          cards: cardGroup,
        })
      }
    })

    // Ordenar pares por valor equivalente (mayor primero según GRANDE_ORDER)
    pairs.sort((a, b) => {
      const aIndex = this.GRANDE_ORDER.indexOf(a.equivalentValue)
      const bIndex = this.GRANDE_ORDER.indexOf(b.equivalentValue)
      return aIndex - bIndex // Menor índice = mayor valor
    })

    // DUPLES (dos pares) - AHORA ES LO MEJOR
    if (pairs.length >= 2) {
      const firstPair = pairs[0]
      const secondPair = pairs[1]

      const firstRank = this.GRANDE_ORDER.indexOf(firstPair.equivalentValue)
      const secondRank = this.GRANDE_ORDER.indexOf(secondPair.equivalentValue)

      return {
        type: "duples",
        value: 20000 + (100 - firstRank) * 100 + (100 - secondRank), // Valor más alto que medias
        primaryValue: firstPair.equivalentValue,
        secondaryValue: secondPair.equivalentValue,
        cards: cards,
        description: `Duples de ${this.getEquivalentName(firstPair.equivalentValue)} y ${this.getEquivalentName(secondPair.equivalentValue)}`,
      }
    }

    // MEDIAS (tres iguales) - SEGUNDO MEJOR
    const medias = pairs.find((p) => p.count === 3)
    if (medias) {
      const rank = this.GRANDE_ORDER.indexOf(medias.equivalentValue)
      return {
        type: "medias",
        value: 10000 + (100 - rank), // Valor menor que duples
        primaryValue: medias.equivalentValue,
        equivalentValue: medias.equivalentValue,
        cards: cards,
        description: `Medias de ${this.getEquivalentName(medias.equivalentValue)}`,
      }
    }

    // PARES SIMPLES - TERCER MEJOR
    if (pairs.length === 1) {
      const pair = pairs[0]
      const rank = this.GRANDE_ORDER.indexOf(pair.equivalentValue)

      // El kicker es la mejor carta que no forma parte del par
      const nonPairCards = cards.filter((c) => this.EQUIVALENT_VALUES[c.value] !== pair.equivalentValue)
      let bestKicker = 0
      if (nonPairCards.length > 0) {
        bestKicker = Math.min(...nonPairCards.map((c) => this.GRANDE_ORDER.indexOf(this.EQUIVALENT_VALUES[c.value])))
      }

      return {
        type: "pares",
        value: 1000 + (100 - rank) * 10 + (100 - bestKicker),
        primaryValue: pair.equivalentValue,
        equivalentValue: pair.equivalentValue,
        cards: cards,
        description: `Pares de ${this.getEquivalentName(pair.equivalentValue)}`,
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
   * Evalúa si hay juego (31 o más puntos usando valores de juego CORREGIDOS)
   */
  static evaluateJuego(cards: Card[]): HandRanking {
    const total = cards.reduce((sum, card) => sum + this.GAME_VALUES[card.value], 0)

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
   * Evalúa punto usando el orden correcto: 31 > 32 > 40 > 39 > ... > 33
   */
  static evaluatePunto(cards: Card[]): HandRanking {
    const total = cards.reduce((sum, card) => sum + this.GAME_VALUES[card.value], 0)

    // Calcular valor según el orden especial del punto
    let puntoValue = 0
    const puntoIndex = this.PUNTO_ORDER.indexOf(total)

    if (puntoIndex !== -1) {
      // Está en la lista de valores válidos - menor índice = mejor
      puntoValue = 1000 - puntoIndex
    } else {
      // No está en la lista - valores muy bajos o muy altos
      if (total < 31) {
        puntoValue = total // Valores bajos mantienen su valor
      } else {
        // Valores altos no contemplados (mayor que 40)
        puntoValue = 1100 + total // Mejor que los valores normales
      }
    }

    return {
      type: "punto",
      value: puntoValue,
      cards: cards,
      description: `Punto de ${total}`,
    }
  }

  // ==================== RESOLUCIÓN DE FASES CON MANO ====================

  /**
   * Resuelve una fase con rankings y manejo de empates por MANO
   */
  private static resolvePhaseWithRankings(
    rankings: (HandRanking & { player: Player })[],
    phase: string,
    points: number,
    handPosition = 0, // Posición de la mano (quien reparte)
  ): PhaseResult {
    // Ordenar por valor descendente
    rankings.sort((a, b) => b.value - a.value)

    const maxValue = rankings[0].value
    const winners = rankings.filter((r) => r.value === maxValue)

    if (winners.length > 1) {
      // Empate - resolver por proximidad a la mano
      // En el Mus, la mano va hacia la DERECHA (sentido horario)
      winners.sort((a, b) => {
        const distanceA = this.getDistanceFromHand(a.player.position, handPosition)
        const distanceB = this.getDistanceFromHand(b.player.position, handPosition)
        return distanceA - distanceB // Menor distancia gana
      })

      const winnerPlayer = winners[0].player
      return {
        winner: winnerPlayer.team,
        rankings: rankings,
        points: points,
        description: `${phase}: Empate resuelto por mano - ${winners[0].description} (${winnerPlayer.name})`,
      }
    }

    const winnerPlayer = rankings[0].player
    return {
      winner: winnerPlayer.team,
      rankings: rankings,
      points: points,
      description: `${phase}: ${rankings[0].description} (${winnerPlayer.name})`,
    }
  }

  /**
   * Calcula la distancia desde la mano (hacia la derecha)
   */
  private static getDistanceFromHand(playerPosition: number, handPosition: number): number {
    // La mano va hacia la derecha (sentido horario)
    // Posiciones: 0, 1, 2, 3
    const distance = (playerPosition - handPosition + 4) % 4
    return distance === 0 ? 4 : distance // La mano misma tiene prioridad 4 (última)
  }

  /**
   * Resuelve la fase Grande comparando las cartas más altas de cada jugador
   */
  static resolveGrande(players: Player[], handPosition = 0): PhaseResult {
    const rankings = players.map((player) => {
      const evaluation = this.evaluateCompleteHand(player.hand)
      const grandeRank = this.GRANDE_ORDER.indexOf(evaluation.grande.equivalentValue)

      return {
        type: "nada" as const,
        value: 100 - grandeRank, // Convertir a valor donde mayor = mejor
        cards: [evaluation.grande.card],
        description: `${this.getCardDisplayName(evaluation.grande.card)} (${this.getEquivalentName(evaluation.grande.equivalentValue)})`,
        player,
        equivalentValue: evaluation.grande.equivalentValue,
      }
    })

    return this.resolvePhaseWithRankings(rankings, "Grande", 1, handPosition)
  }

  /**
   * Resuelve la fase Chica comparando las cartas más bajas de cada jugador
   */
  static resolveChica(players: Player[], handPosition = 0): PhaseResult {
    const rankings = players.map((player) => {
      const evaluation = this.evaluateCompleteHand(player.hand)
      const chicaRank = this.CHICA_ORDER.indexOf(evaluation.chica.equivalentValue)

      return {
        type: "nada" as const,
        value: 100 - chicaRank, // Convertir a valor donde mayor = mejor (menor carta)
        cards: [evaluation.chica.card],
        description: `${this.getCardDisplayName(evaluation.chica.card)} (${this.getEquivalentName(evaluation.chica.equivalentValue)})`,
        player,
        equivalentValue: evaluation.chica.equivalentValue,
      }
    })

    return this.resolvePhaseWithRankings(rankings, "Chica", 1, handPosition)
  }

  /**
   * Resuelve la fase Pares comparando los pares de cada jugador
   */
  static resolvePares(players: Player[], handPosition = 0): PhaseResult {
    const rankings = players.map((player) => ({
      ...this.evaluatePares(player.hand),
      player,
    }))

    // Filtrar solo jugadores con pares
    const withPares = rankings.filter((r) => r.type !== "nada")

    if (withPares.length === 0) {
      return {
        winner: 0,
        rankings: rankings,
        points: 0,
        description: "Nadie tiene pares - fase no jugada",
      }
    }

    return this.resolvePhaseWithRankings(withPares, "Pares", 1, handPosition)
  }

  /**
   * Resuelve la fase Juego comparando los juegos de cada jugador
   */
  static resolveJuego(players: Player[], handPosition = 0): PhaseResult {
    const rankings = players.map((player) => ({
      ...this.evaluateJuego(player.hand),
      player,
    }))

    const withJuego = rankings.filter((r) => r.type === "juego")

    if (withJuego.length === 0) {
      return {
        winner: 0,
        rankings: rankings,
        points: 0,
        description: "Nadie tiene juego - pasar a Punto",
      }
    }

    return this.resolvePhaseWithRankings(withJuego, "Juego", 2, handPosition)
  }

  /**
   * Resuelve la fase Punto comparando los puntos de cada jugador
   */
  static resolvePunto(players: Player[], handPosition = 0): PhaseResult {
    const rankings = players.map((player) => ({
      ...this.evaluatePunto(player.hand),
      player,
    }))

    return this.resolvePhaseWithRankings(rankings, "Punto", 1, handPosition)
  }

  // ==================== UTILIDADES ====================

  /**
   * Obtiene el nombre de una carta equivalente
   */
  private static getEquivalentName(equivalentValue: number): string {
    switch (equivalentValue) {
      case 2:
        return "Unos" // As/Dos
      case 4:
        return "Cuatros"
      case 5:
        return "Cincos"
      case 6:
        return "Seises"
      case 7:
        return "Sietes"
      case 8:
        return "Sotas"
      case 9:
        return "Caballos"
      case 10:
        return "Dieces" // Rey/Tres
      default:
        return `Valor ${equivalentValue}`
    }
  }

  /**
   * Obtiene el nombre completo de una carta para mostrar
   */
  private static getCardDisplayName(card: Card): string {
    const names: Record<number, string> = {
      1: "As",
      2: "Dos",
      3: "Tres",
      4: "Cuatro",
      5: "Cinco",
      6: "Seis",
      7: "Siete",
      8: "Sota",
      9: "Caballo",
      10: "Rey",
    }

    return `${names[card.value] || card.value} de ${card.suit}`
  }

  /**
   * Compara dos manos para determinar cuál es mejor
   */
  static compareHands(hand1: Card[], hand2: Card[]): number {
    const eval1 = this.evaluateHand(hand1)
    const eval2 = this.evaluateHand(hand2)

    // Comparar por tipo primero - CORREGIDO: Duples > Medias
    const typeOrder = { duples: 5, medias: 4, pares: 3, juego: 2, punto: 1, nada: 0 }
    const typeDiff = typeOrder[eval1.type] - typeOrder[eval2.type]

    if (typeDiff !== 0) return typeDiff

    // Si son del mismo tipo, comparar por valor
    return eval1.value - eval2.value
  }

  /**
   * Verifica si una mano debería aceptar Mus
   */
  static shouldAcceptMus(cards: Card[]): boolean {
    const evaluation = this.evaluateCompleteHand(cards)

    // No mus si tiene duples o medias
    if (evaluation.pares.type === "duples" || evaluation.pares.type === "medias") {
      return false
    }

    // No mus si tiene pares de dieces (Rey/Tres)
    if (evaluation.pares.type === "pares" && evaluation.pares.primaryValue === 10) {
      return false
    }

    // No mus si tiene juego alto (35+)
    if (evaluation.juego.type === "juego" && evaluation.juego.value >= 35) {
      return false
    }

    // No mus si tiene punto excelente (31 o 32)
    if (evaluation.punto.value >= 999) {
      // 31 o 32 puntos
      return false
    }

    // No mus si tiene grande muy buena (Rey/Tres) y chica muy buena (As/Dos)
    if (evaluation.grande.equivalentValue === 10 && evaluation.chica.equivalentValue === 2) {
      return false
    }

    return true
  }

  /**
   * Calcula la siguiente posición de mano (hacia la derecha)
   */
  static getNextHandPosition(currentHand: number): number {
    return (currentHand + 1) % 4
  }

  /**
   * Obtiene información detallada sobre el orden del punto
   */
  static getPuntoRanking(points: number): { rank: number; description: string } {
    const index = this.PUNTO_ORDER.indexOf(points)

    if (index === -1) {
      if (points < 31) {
        return { rank: 999, description: `${points} puntos (muy bajo)` }
      } else {
        return { rank: 0, description: `${points} puntos (excepcional)` }
      }
    }

    const descriptions = [
      "Excelente", // 31
      "Muy bueno", // 32
      "Bueno", // 40
      "Aceptable", // 39
      "Regular", // 38
      "Mediocre", // 37
      "Malo", // 36
      "Muy malo", // 35
      "Pésimo", // 34
      "Terrible", // 33
    ]

    return {
      rank: index + 1,
      description: `${points} puntos (${descriptions[index] || "Normal"})`,
    }
  }

  /**
   * Simula todas las fases para una mano completa
   */
  static simulateCompleteHand(
    players: Player[],
    handPosition = 0,
  ): {
    grande: PhaseResult
    chica: PhaseResult
    pares: PhaseResult
    juego: PhaseResult
    punto: PhaseResult
  } {
    return {
      grande: this.resolveGrande(players, handPosition),
      chica: this.resolveChica(players, handPosition),
      pares: this.resolvePares(players, handPosition),
      juego: this.resolveJuego(players, handPosition),
      punto: this.resolvePunto(players, handPosition),
    }
  }
}
