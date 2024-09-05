<template>
    <div class="min-h-screen flex flex-col items-center text-white p-5 bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 class="text-3xl font-bold mb-6">Jugar sin conexión</h1>
      <p class="text-gray-400 mb-8">Selecciona una opción para comenzar una partida en modo local.</p>
      <button class="btn-primary mb-4">Nueva Partida</button>
      <button class="btn-secondary">Cargar Partida Guardada</button>
    </div>
  </template>
  
  <script>
  export default {
    name: "PlayOfflineView",
  };
  </script>
  
  <style scoped>
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
  
  .btn-secondary {
    @apply bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded;
  }
  </style>
  