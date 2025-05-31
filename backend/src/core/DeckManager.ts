import { Card } from "@/types/GameTypes";
import { createSpanishDeck } from "@/config/constants";
import { shuffle } from "lodash";

export class DeckManager {
  private deck: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.deck = shuffle(createSpanishDeck());
  }

  dealCards(count: number): Card[] {
    if (this.deck.length < count) {
      throw new Error("No hay suficientes cartas en la baraja");
    }

    return this.deck.splice(0, count);
  }

  dealHand(): Card[] {
    return this.dealCards(4);
  }

  getRemainingCards(): number {
    return this.deck.length;
  }

  // Para el descarte en el Mus
  replaceCards(count: number): Card[] {
    return this.dealCards(count);
  }

  // Verificar si quedan suficientes cartas para continuar
  canContinue(): boolean {
    return this.deck.length >= 0; // Siempre podemos continuar, en caso extremo se rebaraja
  }

  // En caso de que se agoten las cartas (muy raro), rebarajar
  reshuffleIfNeeded(): void {
    if (this.deck.length < 16) {
      // Menos de 4 cartas por jugador
      this.reset();
    }
  }
}
