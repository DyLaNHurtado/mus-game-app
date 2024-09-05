<template>
  <div class="flex flex-col items-center space-y-10 max-w-40 w-full">
      <PlayerSlot :player="player" :room="room" class="flex w-full h-full" v-for="(player, index) in team" :key="index" @click="$emit('select', teamStartIndex + index)" />
  </div>
</template>

<script>
import PlayerSlot from './PlayerSlot.vue';

export default {
  props: {
    team: {
      type: Array,
      required: true
    },
    room: {
      type: Boolean,
      required: true
    },
    teamStartIndex: {
      type: Number,
      required: true
    }
  },
  components: {
    PlayerSlot
  }
};
</script>
