<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50" @click.self="cancel">
    <div class="bg-gray-800 rounded-lg max-w-md w-full p-6 text-gray-300 space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold w-full text-center">Confirmación</h3>
        <button class="text-gray-400 hover:text-gray-200 text-xl" @click="cancel">&times;</button>
      </div>
      <div class="my-4 text-center">
        <p>{{ question }}</p>
      </div>
      <div class="flex justify-center flex-wrap gap-4">
        <button class="btn-option btn-primary" @click="confirm">
          <svg class="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 11.917 9.724 16.5 19 7.5"/>
</svg>
&nbsp;Confirmar</button>
        <button class="btn-option btn-error" @click="cancel">
          <svg class="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M6 18 17.94 6M18 18 6.06 6"/>
</svg>

&nbsp;Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    question: {
      type: String,
      required: true
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.btn-option {
  @apply min-w-28 max-w-44 min-h-24 w-full flex flex-col justify-center items-center py-2;
}
</style>
