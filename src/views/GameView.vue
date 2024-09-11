<template>
  <MusGame />
</template>

<script>
  import MusGame from '@/components/gameView/MusGame.vue'
export default {
  data() {
    return {
      players: [
        { id: 1, name: "Jugador 1" },
        { id: 2, name: "Jugador 2" },
        // Otros jugadores
      ],
    };
  },
  components: {
    MusGame,
  },
};
</script>

<style scoped></style>
