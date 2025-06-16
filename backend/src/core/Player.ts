import type { Card, GameAction } from "@/types/GameTypes"

export class Player {
  public id: string
  public name: string
  public team: 0 | 1
  public position: number
  public hand: Card[] = []
  public isConnected = true
  public socketId?: string
  private lastAction: GameAction | null = null

  constructor(id: string, name: string, team: 0 | 1, position: number, socketId?: string) {
    this.id = id
    this.name = name
    this.team = team
    this.position = position
    this.socketId = socketId
  }

  // Gestión de cartas
  setHand(cards: Card[]): void {
    this.hand = [...cards]
  }

  addCards(cards: Card[]): void {
    this.hand.push(...cards)
  }

  discardCards(indices: number[]): Card[] {
    const discarded: Card[] = []
    // Ordenar índices de mayor a menor para no afectar posiciones
    const sortedIndices = [...indices].sort((a, b) => b - a)

    for (const index of sortedIndices) {
      if (index >= 0 && index < this.hand.length) {
        discarded.push(this.hand.splice(index, 1)[0])
      }
    }

    return discarded.reverse() // Devolver en orden original
  }

  clearHand(): void {
    this.hand = []
  }

  // Gestión de acciones
  setLastAction(action: GameAction | null): void {
    if (action) {
      this.lastAction = {
        ...action,
        timestamp: Date.now(),
      }
    } else {
      this.lastAction = null
    }
  }

  getLastAction(): GameAction | null {
    return this.lastAction
  }

  // Gestión de conexión
  disconnect(): void {
    this.isConnected = false
    this.socketId = undefined
  }

  reconnect(socketId: string): void {
    this.isConnected = true
    this.socketId = socketId
  }

  // Información pública (sin cartas)
  getPublicInfo() {
    return {
      id: this.id,
      name: this.name,
      team: this.team,
      position: this.position,
      isConnected: this.isConnected,
      hasCards: this.hand.length > 0,
      lastActionType: this.lastAction?.type || null,
    }
  }

  // Información completa (para el servidor)
  getFullInfo() {
    return {
      ...this.getPublicInfo(),
      hand: [...this.hand],
      lastAction: this.lastAction,
      socketId: this.socketId,
    }
  }
}
