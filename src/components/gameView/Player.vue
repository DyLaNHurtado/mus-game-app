<template>
    <div :class="['absolute flex flex-col items-center', positionClass]">
      <div :class="[
        'h-16 w-16 mb-2 rounded-full overflow-hidden',
        { 'ring-4 ring-amber-500 shadow-lg': isCurrentPlayer }
      ]">
        <img :src="player.avatar" :alt="player.name" class="w-full h-full object-cover" />
      </div>
      <span class="text-sm mb-2 font-semibold">{{ player.name }}</span>
      <div class="flex">
        <img
          v-for="(card, cardIndex) in player.cards"
          :key="cardIndex"
          :src="`images/placeholder.svg?height=${position === 0 ? '80' : '60'}&width=${position === 0 ? '55' : '40'}&text=${card}`"
          :alt="`Carta ${card}`"
          :class="[
            position === 0 ? 'h-20 w-14' : 'h-15 w-10',
            'object-cover rounded-lg shadow-md -ml-2 first:ml-0 hover:translate-y-[-4px] transition-transform duration-200'
          ]"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Player',
    props: {
      player: {
        type: Object,
        required: true
      },
      position: {
        type: Number,
        required: true
      },
      isCurrentPlayer: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      positionClass() {
        switch (this.position) {
          case 0: return 'bottom-0 left-1/2 -translate-x-1/2'
          case 1: return 'top-1/2 right-0 -translate-y-1/2'
          case 2: return 'top-0 left-1/2 -translate-x-1/2'
          case 3: return 'top-1/2 left-0 -translate-y-1/2'
          default: return ''
        }
      }
    }
  }
  </script>