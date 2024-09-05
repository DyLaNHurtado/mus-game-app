<template>
  <div>
    <p class="text-lg text-center mb-2">{{ title }}</p>
    <div class="flex space-x-2 items-center justify-center">
      <button
        v-for="value in options"
        :key="value"
        :class="['toggle-button', modelValue === value ? 'active' : '']"
        @click="$emit('update:modelValue', value)"
      >
        {{ value }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    options: Array,
    modelValue: [String, Number]
  }
};
</script>

<style scoped>
.toggle-button {
  @apply bg-gray-800 hover:bg-gray-600 text-gray-400 w-16 h-16 py-2 px-4 rounded-lg transition duration-300;
}
.toggle-button.active {
  @apply bg-blue-500 text-white font-bold;
}
</style>
