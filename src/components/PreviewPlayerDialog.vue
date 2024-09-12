<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
    @click.self="closeDialog">
    <div class="bg-gray-800 rounded-lg max-w-md w-full p-6 text-gray-300 space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg text-center w-full font-bold"> Vista Previa</h3>
        <button class="text-gray-400 hover:text-gray-200 text-xl" @click="closeDialog">&times;</button>
      </div>
      <div class="my-4 flex items-center justify-center">
        <div v-if="player" class="flex flex-col items-center justify-center space-y-4 ">
          <img :src="player?.photo" alt="Avatar" class="w-28 h-28 bg-gray-700 border-gray-500 border-2 rounded-full shadow-md" />
          <div class="text-center flex items-center justify-center flex-col">
            <h4 class="text-lg font-semibold">{{ player.name }}</h4>
            <p v-if="player?.isBot" class="text-xs text-gray-800 bg-slate-300 rounded-xl py-1 px-3 shadow-lg font-semibold">Jugador Automático</p>
            <p v-else class="text-xs text-gray-800 bg-slate-300 rounded-xl py-1 px-3 shadow-lg font-semibold">Jugador Humano</p>
          </div>
        </div>
        <div v-else class="text-center py-4 flex flex-col items-center justify-center gap-4">
          <div class="flex justify-center mb-2">
            <div
              class="w-28 h-28 rounded-lg bg-gray-700 border-2  border-gray-500 text-gray-500 bg-gray-700; flex items-center justify-center">
            </div>
          </div>
          <p class="text-gray-500 text-sm">Este espacio está libre.</p>
        </div>
      </div>
      <div class="flex justify-center flex-wrap gap-4">
        <button v-if="player!=null && !player?.isBot" class="btn-option btn-primary" @click="removePlayer">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon w-8 h-8  text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-id="28"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path><path d="M5 21h14"></path></svg>
          &nbsp;
          Pasar líder</button>

        <button v-if="player!=null && player?.isBot" class="btn-option btn-error" @click="removePlayer">

          <svg class="w-8 h-8text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
          </svg>

          &nbsp;Eliminar bot</button>
        <button v-if="player!=null && !player?.isBot" class="btn-option btn-error" @click="removePlayer">
          <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-width="1"
              d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          &nbsp;Expulsar</button>
          <button  v-if="player==null" class="btn-option btn-primary" @click="addBot">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg> &nbsp;
            Agregar Bot</button>
<!--         <button class="btn-option btn-basic" @click="closeDialog">
          <svg class="icon w-8 h-8 flex items-center justify-center text-white" aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M6 18 17.94 6M18 18 6.06 6" />
          </svg>
          &nbsp;Cerrar</button> -->
          <button v-if="player==null"  class="btn-option btn-primary" @click="moveHere">
            <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16h13M4 16l4-4m-4 4 4 4M20 8H7m13 0-4 4m4-4-4-4"/>
</svg> &nbsp;
            Moverse aqui</button>


      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    player: {
      type: Object,
      default: null
    },
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close');
    },
    removePlayer() {
      this.$emit('remove', this.player);
    },
    addBot() {
      this.$emit('add-bot');
    },
    moveHere() {
      this.$emit('move-here');
    }
  }
};
</script>
<style scoped>
.btn-option{
  @apply min-w-28 max-w-44 min-h-24 w-full flex-col;
}
</style>