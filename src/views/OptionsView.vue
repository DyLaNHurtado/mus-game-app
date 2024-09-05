<template>
    <div class="min-h-screen flex flex-col items-center text-white p-5 bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 class="text-3xl font-bold mb-6">Configuración</h1>
      <p class="text-gray-400 mb-8">Ajusta las opciones de la aplicación a tu gusto.</p>
      <!-- Aquí irían los controles de configuración -->
      <button class="btn-primary">Guardar Configuración</button>
    </div>
  </template>
  
  <script>
  export default {
    name: "OptionsView",
  };
  </script>
  
  <style scoped>
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
  </style>
  