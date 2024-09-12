<template>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <div v-for="skill in skills" :key="skill.name" class="flex items-center bg-gray-700 p-2 rounded-lg">
        <div class="mr-2 text-yellow-400" v-html="getSkillIcon(skill.name)"></div>
        <div class="flex-grow">
          <p class="font-medium text-xs">{{ skill.name }}</p>
          <div class="flex space-x-1 mt-1">
            <div 
              v-for="i in 5" 
              :key="i" 
              :class="[
                'w-5 h-2 rounded', 
                i <= skill.level ? 'bg-yellow-400' : 'bg-gray-600'
              ]"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    skills: {
      type: Array,
      required: true
    }
  })
  
  const getSkillIcon = (skillName) => {
    const icons = {
      "Atrevido": '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>',
      "Faroleo": '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>',
      "Caza señas": '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a7 7 0 100 14 7 7 0 000-14z" /></svg>',
      "Corta mus": '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a5 5 0 00-5 5v4a5 5 0 005 5h6a5 5 0 005-5V7a5 5 0 00-5-5H7zm-4 5a4 4 0 014-4h6a4 4 0 014 4v4a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" /></svg>',
      "Descartes": '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.914 7.485A4 4 0 015 8v2a4 4 0 010 1.515A7.961 7.961 0 0110 18a7.961 7.961 0 014.086-6.485A4 4 0 0115 10V8a4 4 0 010-1.515A7.961 7.961 0 0110 2a7.961 7.961 0 01-4.086 5.485z" /></svg>',
      "Interactividad": '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a4 4 0 018 0v1h-2v-1a2 2 0 00-4 0v1H6v-1z" /><path d="M10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>',
    }
    return icons[skillName] || ''
  }
  </script>
  
  <style scoped>
  /* Añadir estilo específico aquí si es necesario */
  </style>
  