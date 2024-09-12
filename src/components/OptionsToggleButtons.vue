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
  @apply bg-gray-700 hover:bg-gray-500 w-16 h-16 py-2 px-4 rounded-lg  duration-300  text-amber-100;
}
.toggle-button.active {
  @apply bg-gradient-to-r font-bold  from-amber-600 to-amber-700 text-gray-100 transition-colors shadow-md;
}
</style>
