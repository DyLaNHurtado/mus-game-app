<template>
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50" @click.self="cancel">
      <div class="bg-gray-800 rounded-lg max-w-md w-full p-6 text-gray-300 space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold w-full text-center">Añadir mas piedras</h2>
          <button class="text-gray-400 hover:text-gray-200 text-xl" @click="cancel">&times;</button>
        </div>
        <div class="my-4 text-center">
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
        <div class="flex justify-center flex-wrap gap-4">

          <button class="btn-option btn-error" @click="cancel">
            <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M6 18 17.94 6M18 18 6.06 6"/>
  </svg>
  
  &nbsp;Cancelar</button>
  <button class="btn-option btn-primary" @click="confirm">
            <svg class="w-8 h-8 :text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 11.917 9.724 16.5 19 7.5"/>
  </svg>
  &nbsp;Confirmar</button>
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
  .btn-option {
    @apply min-w-28 max-w-44 min-h-24 w-full flex flex-col justify-center items-center py-2;
  }
/*********** Baseline, reset styles ***********/
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 24rem;
  margin: 1.2rem 0.5rem;
}

/* Removes default focus */
input[type="range"]:focus {
  outline: none;
}

/******** Chrome, Safari, Opera and Edge Chromium styles ********/
/* slider track */
input[type="range"]::-webkit-slider-runnable-track {
  background-color: #444;
  border-radius: 500px;
  height: 2.5rem;
}

/* slider thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  margin-top: -12px; /* Centers thumb on the track */
  background-color: #ccc;
  border-radius: 0.5rem;
  height: 4rem;
  width: 2.5rem;
}

/* slider progress  */
input[type="range"]::-webkit-slider-runnable-track {
    height: 100%;
    height: 2.5rem;
    border-top-left-radius: 500px;
    border-bottom-left-radius: 500px;
    background: linear-gradient( #d97706 , #d9b206);
}


/*********** Firefox styles ***********/
/* slider track */
input[type="range"]::-moz-range-track {
  background-color: #444;
  border-radius: 500px;
  height: 2.5rem;
}

/* slider thumb */
input[type="range"]::-moz-range-thumb {
  background-color: #ccc;
  border: none; /*Removes extra border that FF applies*/
  border-radius: 0.5rem;
  height: 4rem;
  width: 2.5rem;
}
/* slider progress  */
input[type="range"]::-moz-range-progress {
    height: 100%;
    height: 2.5rem;
    border-top-left-radius: 500px;
    border-bottom-left-radius: 500px;
    background: linear-gradient( #d97706 , #d9b206);
}

  </style>
  