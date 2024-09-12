<template>
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold flex justify-center items-center text-nowrap min-h-16">
        Código de Sala: &nbsp; <span class="text-teal-300">{{ code }}</span> &nbsp;
        <button v-if="!copied" @click="$emit('copy')" class="btn-icon">
          <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linejoin="round" stroke-width="1" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
          </svg>

        </button>

            <svg v-else class="w-8 h-8 m-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 11.917 9.724 16.5 19 7.5"/>
            </svg>
      </h2>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      code: String,
      copied: Boolean
    }
  };
  </script>
  