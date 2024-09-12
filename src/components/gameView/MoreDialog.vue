<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
      <h2 class="text-2xl font-bold text-amber-400 mb-4">Añadir piedras</h2>
      <div class="mb-6">
        <input
          type="range"
          :min="2"
          :max="maxStones"
          v-model.number="selectedStones"
          class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        >
        <div class="text-center text-xl font-bold text-amber-400 mt-2">
          {{ selectedStones }} piedras
        </div>
      </div>
      <div class="flex justify-between">
        <button
          @click="cancel"
          class="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="confirm"
          class="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-500 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MoreDialog',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    maxStones: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      selectedStones: 2
    }
  },
  methods: {
    cancel() {
      this.$emit('close')
    },
    confirm() {
      this.$emit('confirm', this.selectedStones)
    }
  },
  watch: {
    isOpen(newValue) {
      if (newValue) {
        this.selectedStones = 2
      }
    }
  }
}
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #fbbf24;
  cursor: pointer;
  border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #fbbf24;
  cursor: pointer;
  border-radius: 50%;
}
</style>