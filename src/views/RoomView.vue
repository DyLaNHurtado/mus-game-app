<template>
  <div class="min-h-screen flex flex-col items-center justify-around p-4 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
    <section class="w-full max-w-md space-y-4 mb-6">
      <h2 class="text-2xl font-bold text-center text-gray-200">Configuración de la Partida</h2>
      <div class="grid gap-4 grid-cols-2">
        <OptionsToggleButtons title="Al mejor de:" :options="[3, 5, 7]" v-model="rounds" />
        <OptionsToggleButtons title="Piedras por ronda:" :options="[30, 40, 50]" v-model="stones" />
      </div>
    </section>

    <section v-if="roomCode" class="w-full max-w-md space-y-4">
      <RoomCodeDisplay :code="roomCode" @copy="copyCode" :copied="copied" />

      <div class="flex items-center mb-6 justify-around">
        <PlayerTeam :team="team1" :teamStartIndex="0" :room="room" @select="selectPlayer" @addBot="addBot" @removePlayer="confirmRemovePlayer" />
        <div class="text-yellow-400 text-3xl font-bold">VS</div>
        <PlayerTeam :team="team2" :teamStartIndex="2" :room="room" @select="selectPlayer" @addBot="addBot" @removePlayer="confirmRemovePlayer" />
      </div>
    </section>
    <section v-if="roomCode" class="w-full max-w-md space-y-4">
      <div class="w-full space-y-4">
        <button v-if="isCreator" class="btn-primary w-full" @click="startGame" :disabled="!isAllPlayer">
          <span v-if="isAllPlayer" class="flex items-center justify-center">
            <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 18V6l8 6-8 6z" />
            </svg>
            &nbsp; Iniciar Partida
          </span>
          <span v-else class="flex items-center justify-center animate-pulse">
            <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            &nbsp; Esperando jugadores...
          </span>
        </button>
        <button class="btn-error flex items-center justify-center w-full" @click="leaveRoom">
          <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          &nbsp; Salir {{ isCreator ? 'y borrar sala' : 'de la sala' }}
        </button>
      </div>
    </section>

    <PreviewPlayerDialog v-if="isPreviewVisible" :isVisible="isPreviewVisible" :player="selectedPlayer" @close="closePreview" @remove="removePlayer" @add-bot="addBotToSelectedIndex" />
  </div>
</template>

<script>
// Importa el componente PreviewPlayerDialog
import OptionsToggleButtons from '../components/OptionsToggleButtons.vue';
import RoomCodeDisplay from '../components/RoomCodeDisplay.vue';
import PlayerTeam from '../components/PlayerTeam.vue';
import PreviewPlayerDialog from '../components/PreviewPlayerDialog.vue';
import eventBus from '../services/eventBus';

export default {
  data() {
    return {
      roomCode: null,
      rounds: 5,
      stones: 40,
      isPreviewVisible: false,
      room: null,
      selectedPlayer: null,
      players: [null, null, null, null],
      selectedPlayerIndex: null,
      copied: false,
      isCreator: false,
    };
  },
  computed: {
    team1() {
      return this.players.slice(0, 2);
    },
    team2() {
      return this.players.slice(2, 4);
    },
    isAllPlayer() {
      return this.players.every(player => player !== null);
    }
  },
  methods: {
    createRoom() {
      this.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.players[0] = { name: "Tú", photo: "/path/to/avatar1.jpg" };
      this.isCreator = true;
    },
    startGame() {
      if (this.isAllPlayer) {
        this.$router.push({ name: "Game", params: { roomCode: this.roomCode } });
      }
    },
    addBot(index) {
      this.players[index] = { name: `Bot ${index + 1}`, photo: "/path/to/bot_avatar.jpg", isBot: true };
    },
    addBotToSelectedIndex() {
      if (this.selectedPlayerIndex !== null) {
        this.addBot(this.selectedPlayerIndex);
        this.isPreviewVisible = false;
      }
    },
    confirmRemovePlayer(index) {
      this.selectedPlayerIndex = index;
    },
    kickPlayer() {
      if (this.selectedPlayerIndex !== null && this.players[this.selectedPlayerIndex]) {
        this.players[this.selectedPlayerIndex] = null;
      }
    },
    leaveRoom() {
      if (this.isCreator) {
        // Lógica para eliminar la sala si es el creador
      }
      this.$router.push({ name: "Home" });
    },
    copyCode() {
      navigator.clipboard.writeText(this.roomCode)
        .then(() => {
          this.copied = true;
          setTimeout(() => {
            this.copied = false;
          }, 2000);
        })
        .catch(() => {
          console.error("Failed to copy room code.");
          eventBus.showErrorModal("Failed to copy room code.");
        });
    },
    selectPlayer(index) {
      console.log("Index", index)
      this.selectedPlayer = this.players[index];
      this.selectedPlayerIndex = index;
      this.isPreviewVisible = true;
    },
    closePreview(){
      this.isPreviewVisible = false;
    },
    removePlayer(player) {
      eventBus.showQuestionModal("deseas eliminar este bot?",
    ()=>{

    }, ()=>{
      
    }
      )
      const index = this.players.indexOf(player);
      if (index !== -1) {
        this.players[index] = null;
        this.isPreviewVisible = false;
      }
    }
  },
  components: {
    OptionsToggleButtons,
    RoomCodeDisplay,
    PlayerTeam,
    PreviewPlayerDialog,
  },
  mounted() {
    this.createRoom();
  },
};
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.p-4 {
  padding: 1rem;
}

.bg-gradient-to-b {
  background: linear-gradient(to bottom, #1a202c, #2d3748);
}

.text-white {
  color: #fff;
}

/* Estilo minimalista para botones */
.btn-primary {
  background-color: #3182ce;
  color: #fff;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:disabled {
  background-color: #718096;
  cursor: not-allowed;
}

.btn-error {
  background-color: #e53e3e;
  color: #fff;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-error:hover {
  background-color: #c53030;
}
</style>