<template>
    <div class="player-slot" >
      <div v-if="player" class="player-info flex flex-col items-center space-y-4">
        <img :src="player?.photo" alt="Player Avatar" class="avatar" />
        <p class="player-name">
          <svg v-if="player?.isLeader" xmlns="http://www.w3.org/2000/svg" class="icon w-6 h-6 text-yellow-500 flex items-center justify-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-id="28"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path><path d="M5 21h14"></path></svg>
          <span class="dynamic-name">{{ player.name }}</span>
        </p>
      </div>
      <div  v-else class="player-info flex flex-col items-center space-y-4" >
        <div class="empty-slot flex items-center justify-center"></div>
        <p class="text-gray-500 text-sm">Espacio libre</p>

      </div>
      
    </div>
  </template>
  
  <script>
  // import eventBus from '@/services/eventBus';
  export default {
    props: {
      player: Object,
      room: Object,
    },
    computed:{
      isLeader(){
        if(this.player==null || this.room==null || this.room?.leader==null){
          return false;
        }
        return this.player?.id === this.room?.leader;
      }
    },
    mounted(){
      // eventBus.showErrorModal("Ejemplo error");
    }
  };
  </script>
  
  <style scoped>
  .player-slot {
    @apply p-4 rounded-lg w-full flex flex-col items-center justify-center bg-gray-800 border border-gray-700 cursor-pointer hover:bg-gray-700  hover:border-gray-400 transition-all duration-300;
    width: 100%;
    min-height: 200px;
  }
  
  .player-info {
    @apply flex flex-col items-center space-y-4;
  }
  
  .avatar {
    @apply w-28 h-28 rounded-full border-2 bg-gray-700 border-gray-500 shadow-lg;
  }
  
  .player-name {
    @apply text-xl font-semibold text-white flex items-center justify-center space-x-3 text-center;
  }
  
  .empty-slot {
    @apply w-28 h-28 rounded-lg border-2 border-gray-500 flex items-center justify-center text-gray-500 bg-gray-700;
    
  }
  .dynamic-name {
  font-size: clamp(0.75rem, 1.5vw, 1.25rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}
  </style>
  