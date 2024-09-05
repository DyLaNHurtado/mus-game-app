<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50" @click.self="close">
    <div class="bg-gray-800 rounded-lg max-w-md w-full p-6 text-gray-300 space-y-6">
      <h1 class="text-center text-2xl flex justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="#dc2626"viewBox="0 0 512 512" class="mx-auto text-red-600 w-24 h-24">
          <path d="M85.57,446.25H426.43a32,32,0,0,0,28.17-47.17L284.18,82.58c-12.09-22.44-44.27-22.44-56.36,0L57.4,399.08A32,32,0,0,0,85.57,446.25Z" fill="#dc2626"  style="fill:none;stroke:#ff0000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
          <path d="M250.26,195.39l5.74,122,5.73-121.95a5.74,5.74,0,0,0-5.79-6h0A5.74,5.74,0,0,0,250.26,195.39Z"  fill="#dc2626" style="fill:none;stroke:#dc2626;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
          <path d="M256,397.25a20,20,0,1,1,20-20A20,20,0,0,1,256,397.25Z" fill="#dc2626" />
        </svg>
        &nbsp;
        Ooops ha ocurrido un error:</h1>
      
      <div class="my-4 text-center">
        <p class="mt-4 text-gray-400 text-md overflow-y-scroll max-h-96">{{ message }}</p>
      </div>
      <div class="flex justify-center flex-wrap gap-4">
        <button class="btn-option btn-error" @click="close">
          <svg class="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M6 18 17.94 6M18 18 6.06 6"/>
          </svg>
          &nbsp;Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.btn-option {
  @apply min-w-28 max-w-44 min-h-24 w-full flex justify-center items-center py-2;
}
</style>
