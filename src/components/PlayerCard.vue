<!-- src/components/PlayerCard.vue -->
<template>
  <v-card
    class="player-card"
    :class="{ 'current-turn': player.isTurn, folded: player.hasFolded }"
    elevation="10"
  >
    <v-card-title>{{ player.name }}</v-card-title>
    <v-card-text>
      <div class="player-points">Puntos: {{ player.points }}</div>
      <div v-if="player.hasFolded" class="player-status">Ha pasado</div>
      <div v-else class="player-hand">
        <span v-for="(card, index) in player.hand" :key="index">
          <Card :card="card" />
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import Card from "@/components/Card";

export default {
  props: {
    player: Object,
  },
  components: {
    Card,
  },
};
</script>

<style scoped>
.player-card {
  margin: 10px;
  width: 100%;
  background-color: #2e2e38;
  color: #fff;
  border-radius: 10px;
  padding: 15px;
  transition: transform 0.3s ease;
}

.player-card.current-turn {
  border: 2px solid #ff9800;
  transform: scale(1.05);
}

.player-card.folded {
  opacity: 0.5;
}

.player-points {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.player-status {
  color: #ff5252;
  font-weight: bold;
}

.player-hand {
  display: flex;
  justify-content: center;
}
</style>
