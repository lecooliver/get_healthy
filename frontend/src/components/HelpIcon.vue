<script setup>
defineProps({
  text: {
    type: String,
    required: true
  }
})
</script>

<template>
  <span class="relative inline-block group">
    <span
      role="img"
      :aria-label="`Ajuda: ${text}`"
      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      tabindex="0"
    >ⓘ</span>
    <span
      role="tooltip"
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-sm text-white bg-gray-800 dark:bg-gray-200 dark:text-gray-800 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none"
    >
      {{ text }}
    </span>
  </span>
</template>
