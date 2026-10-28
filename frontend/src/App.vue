<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import { computed } from 'vue'

const route = useRoute()

const showLayout = computed(() => {
  return !route.meta?.guest
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Skip to main content
    </a>

    <template v-if="showLayout">
      <Navbar />
      <div class="flex flex-1 pt-16">
        <Sidebar />
        <main
          id="main-content"
          class="flex-1 md:ml-64 p-6"
          tabindex="-1"
        >
          <RouterView />
        </main>
      </div>
    </template>
    <template v-else>
      <main
        id="main-content"
        class="flex-1 flex items-center justify-center"
      >
        <RouterView />
      </main>
    </template>
  </div>
</template>
