<template>
    <div class="flex-grow flex flex-col justify-between relative">
      <div class="absolute inset-0 m-auto w-3/4 h-3/4 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full border-4 border-gray-600 shadow-2xl overflow-hidden">
        <div class="absolute inset-0  opacity-10"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-4xl font-bold text-amber-400 bg-gray-800 bg-opacity-70 px-6 py-3 rounded-full shadow-lg">
            {{ score.team1 }} - {{ score.team2 }}
          </div>
        </div>
      </div>
      <div class="relative w-full h-full">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'GameTable',
    props: {
      score: {
        type: Object,
        required: true
      }
    }
  }
  </script>