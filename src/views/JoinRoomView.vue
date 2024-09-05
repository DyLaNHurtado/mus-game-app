<template>
    <div class="min-h-screen flex flex-col items-center text-white p-5 bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 class="text-3xl font-bold mb-6">Unirse a una Sala</h1>
      <p class="text-gray-400 mb-8">Ingresa el código de la sala a la que deseas unirte.</p>
      <input type="text" placeholder="Código de la Sala" class="input mb-4"/>
      <button class="btn-primary">Unirse a la Sala</button>
    </div>
  </template>
  
  <script>
  export default {
    name: "JoinRoomView",
  };
  </script>
  
  <style scoped>
  .input {
    @apply bg-gray-700 text-white p-2 rounded w-full mb-4;
  }
  
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
  </style>
  