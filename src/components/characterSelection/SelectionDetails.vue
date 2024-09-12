<template>
<div v-if="selectedCharacter" class="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
        <div class="flex items-start mb-4">
          <img 
            :src="selectedCharacter.image" 
            :alt="selectedCharacter.name" 
            class="w-24 h-24 object-cover rounded-lg mr-4"
          />
          <div>
            <h2 class="text-2xl font-bold mb-2 text-yellow-400">{{ selectedCharacter.name }}</h2>
            <p class="text-sm text-gray-300">{{ selectedCharacter.description }}</p>
          </div>
        </div>

        <Skills/>
      </div>
      <div v-else class="bg-gray-800 p-4 rounded-lg shadow-lg mb-4 text-center">
        <p class="text-gray-400">Selecciona un personaje para ver sus detalles</p>
      </div>
  </template>
  
  <script setup>
  import Skills from './Skills.vue'
  const props = defineProps({
    character: {
      type: Object,
      required: true
    }
  })
  </script>
  
  <style scoped>
  /* Añadir estilo específico aquí si es necesario */
  </style>
  