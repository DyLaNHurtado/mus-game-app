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
            <p v-if="player?.isBot" class="text-xs text-gray-400">Jugador Automático</p>
            <p v-else class="text-xs text-gray-400">Jugador Humano</p>
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
          <svg class="icon w-8 h-8 flex items-center justify-center" fill="#fff" viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.99 23.5C12.99 21.8431 14.3331 20.5 15.99 20.5C17.6468 20.5 18.99 21.8431 18.99 23.5C18.99 25.1569 17.6468 26.5 15.99 26.5C14.3331 26.5 12.99 25.1569 12.99 23.5Z" />
            <path
              d="M7.5 23.5C7.5 22.3954 8.39544 21.5 9.5 21.5C10.6046 21.5 11.5 22.3954 11.5 23.5C11.5 24.6045 10.6046 25.5 9.5 25.5C8.39542 25.5 7.5 24.6045 7.5 23.5Z" />
            <path
              d="M22.4999 21.5C21.3953 21.5 20.4999 22.3954 20.4999 23.5C20.4999 24.6045 21.3953 25.5 22.4999 25.5C23.6044 25.5 24.4999 24.6045 24.4999 23.5C24.4999 22.3954 23.6044 21.5 22.4999 21.5Z" />
            <path
              d="M13.27 8.72C13.27 7.21772 14.4877 6 15.99 6C17.4923 6 18.71 7.21772 18.71 8.72C18.71 9.33063 18.5085 9.8975 18.1674 10.3535L20.7046 13.7964L21.0529 13.3288C20.7843 13.0032 20.6201 12.5849 20.6201 12.13C20.6201 11.0939 21.464 10.25 22.5001 10.25C23.5362 10.25 24.3801 11.0939 24.3801 12.13C24.3801 12.7349 24.0929 13.2761 23.6458 13.6193L24.0754 14.6103L26.2237 13.2218C26.2213 13.1781 26.22 13.1342 26.22 13.09C26.22 11.7777 27.2877 10.71 28.6 10.71C29.9123 10.71 30.98 11.7777 30.98 13.09C30.98 14.0489 30.4098 14.8773 29.5907 15.2538C29.5836 15.3184 29.5735 15.3834 29.56 15.4489L29.5593 15.4526L28.2177 22.1449C28.5305 22.5087 28.7197 22.9821 28.7197 23.5C28.7197 24.313 28.2533 25.0171 27.5734 25.3592L26.9605 28.4166L26.9598 28.4202C26.6747 29.8155 25.4453 30.82 24.02 30.82H7.96C6.53467 30.82 5.3053 29.8155 5.02024 28.4202L5.01951 28.4166L4.4044 25.3481C3.73632 25.002 3.27979 24.3043 3.27979 23.5C3.27979 22.9908 3.4627 22.5248 3.76602 22.1635L2.42074 15.4526L2.42002 15.4491C2.40659 15.3837 2.39622 15.3185 2.38881 15.2536C1.56995 14.877 1 14.0488 1 13.09C1 11.7777 2.06771 10.71 3.38 10.71C4.69229 10.71 5.76 11.7777 5.76 13.09C5.76 13.1341 5.75882 13.1781 5.75645 13.2219L7.86897 14.5872L8.31632 13.6132C7.87373 13.2697 7.58987 12.7314 7.58987 12.13C7.58987 11.0939 8.43372 10.25 9.46987 10.25C10.506 10.25 11.3499 11.0939 11.3499 12.13C11.3499 12.6409 11.1492 13.0935 10.8305 13.4278L11.055 14.0954L13.8126 10.3535C13.4715 9.8975 13.27 9.33063 13.27 8.72ZM4.59282 14.8565C4.58303 14.8538 4.56391 14.85 4.53 14.85H4.44824L4.39056 14.952C4.3815 14.9681 4.37778 14.9806 4.37613 14.9908C4.37456 15.0007 4.37325 15.0183 4.37926 15.0474L4.38049 15.0534L6.97976 28.0198L6.98007 28.0213C7.07558 28.4852 7.48584 28.82 7.96 28.82H24.02C24.4941 28.82 24.9043 28.4853 24.9999 28.0215L25.0002 28.0198L27.6007 15.0474C27.6074 15.0151 27.6019 14.9752 27.5821 14.9388L27.5336 14.85H27.45C27.4161 14.85 27.397 14.8538 27.3872 14.8565C27.3788 14.8588 27.3691 14.8624 27.3547 14.8721L27.3488 14.876L23.4058 17.4243C22.4489 18.0316 21.1824 17.8121 20.4962 16.8849L16.1136 10.9379L16.1129 10.9371L15.99 10.8142L15.8671 10.9371L15.8664 10.9378L11.4878 16.8795C10.8055 17.8213 9.52218 18.026 8.57417 17.4243L8.56719 17.4199L4.63122 14.876L4.6253 14.8721C4.61086 14.8624 4.60117 14.8588 4.59282 14.8565Z" />
          </svg> &nbsp;
          Pasar líder</button>

        <button v-if="player!=null && player?.isBot" class="btn-option btn-error" @click="removePlayer">

          <svg class="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
          </svg>

          &nbsp;Eliminar bot</button>
        <button v-if="player!=null && !player?.isBot" class="btn-option btn-error" @click="removePlayer">
          <svg class="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
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
        <button class="btn-option btn-basic" @click="closeDialog">
          <svg class="icon w-8 h-8 flex items-center justify-center text-gray-800 dark:text-white" aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M6 18 17.94 6M18 18 6.06 6" />
          </svg>
          &nbsp;Cerrar</button>
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
    }
  }
};
</script>
<style scoped>
.btn-option{
  @apply min-w-28 max-w-44 min-h-24 w-full flex-col;
}
</style>