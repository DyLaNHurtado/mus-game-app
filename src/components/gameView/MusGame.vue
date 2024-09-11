<template>
  <div class="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-4">
    <GameTable :score="score">
      <Player
        v-for="(player, index) in players"
        :key="index"
        :player="player"
        :position="index"
        :isCurrentPlayer="currentPlayer === index"
      />
    </GameTable>

    <PhaseIndicator :phases="phases" :currentPhase="currentPhase" />

    <GameActions @action="handleAction" />

    <div class="self-center mt-4 text-lg bg-amber-600 text-gray-100 shadow-lg px-3 py-1 rounded-full">
      Turno de {{ players[currentPlayer].name }}
    </div>
  </div>
</template>

<script>
import GameTable from './GameTable.vue'
import Player from './Player.vue'
import PhaseIndicator from './PhaseIndicator.vue'
import GameActions from './GameActions.vue'

export default {
  name: 'MusGame',
  components: {
    GameTable,
    Player,
    PhaseIndicator,
    GameActions
  },
  data() {
    return {
      currentPhase: 'Grande',
      currentPlayer: 0,
      score: { team1: 22, team2: 11 },
      players: [
        { name: "Jugador 1", avatar: "/images/placeholder.svg?height=40&width=40", cards: ["1_oros", "3_copas", "7_espadas", "12_bastos"] },
        { name: "Jugador 2", avatar: "/images/placeholder.svg?height=40&width=40", cards: ["reverso", "reverso", "reverso", "reverso"] },
        { name: "Jugador 3", avatar: "/images/placeholder.svg?height=40&width=40", cards: ["reverso", "reverso", "reverso", "reverso"] },
        { name: "Jugador 4", avatar: "/images/placeholder.svg?height=40&width=40", cards: ["reverso", "reverso", "reverso", "reverso"] },
      ],
      phases: ["Grande", "Chica", "Pares", "Juego"]
    }
  },
  methods: {
    handleAction(action) {
      console.log(`Action: ${action}`)
      // Implementar lógica de acción aquí
    }
  }
}
</script>