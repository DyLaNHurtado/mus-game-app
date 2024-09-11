<template>
    <div class="bg-gray-800 mt-4 shadow-lg p-4">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="action in actions"
          :key="action"
          @click="$emit('action', action)"
          class="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-amber-100 hover:from-amber-600 hover:to-amber-700 hover:text-gray-100 transition-colors duration-200 shadow-md px-4 py-2 rounded-md text-sm font-medium"
        >
          {{ action }}
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'GameActions',
    data() {
      return {
        actions: ["Envido", "Paso", "Órdago", "Quiero", "No Quiero", "Más"]
      }
    },
    emits: ['action']
  }
  </script>