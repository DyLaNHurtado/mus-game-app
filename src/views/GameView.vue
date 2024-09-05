<template>
  <div
    class="min-h-screen flex flex-col items-center justify-between text-white"
  >
    <div class="flex justify-between w-full px-4 py-2">
      <div v-for="player in players" :key="player.id" class="avatar">
        {{ player.name }}
      </div>
    </div>
    <div class="cards-container flex justify-center w-full">
      <!-- Aquí irán las cartas del jugador -->
    </div>
    <div class="actions flex justify-around w-full px-4 py-2">
      <button class="btn-primary">Paso</button>
      <button class="btn-primary">Juego</button>
      <button class="btn-primary">Mus</button>
    </div>
  </div>
</template>

<script>
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
};
</script>

<style scoped>
.avatar {
  @apply text-center text-lg font-bold;
}
.btn-primary {
  @apply bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-300;
}
.cards-container {
  @apply flex space-x-4;
}
</style>
