<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const uiStore = useUIStore()

const mobileMenuOpen = ref(false)

const handleClickOutside = (_event) => {
  if (mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <aside
    role="complementary"
    aria-label="Main navigation sidebar"
    class="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin hidden md:block"
  >
    <nav
      role="navigation"
      aria-label="Navigation menu"
      class="p-4 space-y-1"
    >
      <RouterLink
        v-for="link in uiStore.navLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
        :class="[
          route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to))
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
        :aria-current="route.path === link.to ? 'page' : undefined"
      >
        <span
          class="text-xl"
          aria-hidden="true"
        >{{ link.icon }}</span>
        <span class="font-medium">{{ link.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
