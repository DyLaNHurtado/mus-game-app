<template>
    <div class="flex justify-center space-x-2 my-4">
      <span
        v-for="phase in phases"
        :key="phase"
        :class="[
          'px-2 py-1 rounded-full text-sm font-medium',
          currentPhase === phase
            ? 'bg-amber-600 text-gray-100 ring-2 ring-amber-400 shadow-amber-400/50'
            : 'bg-gray-700 text-amber-100'
        ]"
      >
        {{ phase }}
      </span>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PhaseIndicator',
    props: {
      phases: {
        type: Array,
        required: true
      },
      currentPhase: {
        type: String,
        required: true
      }
    }
  }
  </script>