<!-- src/components/GameTable.vue -->
<template>
  <v-container class="game-table">
    <v-row class="justify-center mb-4">
      <v-col
        v-for="(player, index) in players"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <PlayerCard :player="player" />
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <CardDeck :deck="deck" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import PlayerCard from "@/components/PlayerCard";
import CardDeck from "@/components/CardDeck";

export default {
  props: {
    players: Array,
    deck: Array,
  },
  components: {
    PlayerCard,
    CardDeck,
  },
};
</script>

<style scoped>
.game-table {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #1f1f2e;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}
</style>
