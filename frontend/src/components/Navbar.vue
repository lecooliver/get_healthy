<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const mobileMenuOpen = ref(false)
const theme = ref('system')
const user = ref(null)

const checkAuth = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        user.value = await response.json()
      }
    } catch (e) {
      // Ignore transient errors - the auth store owns token lifecycle
    }
  }
}

const updateTheme = () => {
  const root = document.documentElement
  if (theme.value === 'dark' || (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

const onThemeChange = () => {
  localStorage.setItem('theme', theme.value)
  updateTheme()
}

const logout = async () => {
  localStorage.removeItem('token')
  window.location.href = '/login'
}

onMounted(() => {
  checkAuth()
  
  const savedTheme = localStorage.getItem('theme') || 'system'
  theme.value = savedTheme
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme)
  updateTheme()
})
</script>

<template>
  <nav
    role="navigation"
    aria-label="Main navigation"
    class="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50"
  >
    <div class="h-full px-4 flex items-center justify-between">
      <RouterLink
        to="/"
        class="flex items-center gap-2"
        aria-label="Get Healthy Home"
      >
        <span
          class="text-2xl"
          role="img"
          aria-label="flexed bicep"
        >💪</span>
        <span class="text-xl font-bold text-blue-600 dark:text-blue-400">Get Healthy</span>
      </RouterLink>

      <div class="flex items-center gap-4">
        <label
          class="sr-only"
          for="theme-select"
        >Theme</label>
        <select
          id="theme-select"
          v-model="theme"
          class="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Choose theme"
          @change="onThemeChange"
        >
          <option
            value="light"
            aria-label="Light theme"
          >
            ☀️ Light
          </option>
          <option
            value="dark"
            aria-label="Dark theme"
          >
            🌙 Dark
          </option>
          <option
            value="system"
            aria-label="System theme"
          >
            💻 System
          </option>
        </select>

        <template v-if="user">
          <div
            class="flex items-center gap-2"
            role="img"
            :aria-label="user.displayName ? `Logged in as ${user.displayName}` : 'User profile'"
          >
            <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              <img
                v-if="user.avatarUrl"
                :src="user.avatarUrl"
                :alt="user.displayName ? `${user.displayName}'s avatar` : 'User avatar'"
                class="w-full h-full object-cover"
                @error="($event.target.style.display = 'none')"
              >
            </div>
            <div
              v-if="!user.avatarUrl"
              class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
              role="img"
              aria-label="Default user avatar"
            >
              <span aria-hidden="true">👤</span>
            </div>
            <span class="text-sm font-medium hidden md:inline">{{ user.displayName }}</span>
          </div>
          <button
            class="btn btn-secondary text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="button"
            @click="logout"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <RouterLink
            to="/login"
            class="btn btn-secondary text-sm"
          >
            Login
          </RouterLink>
        </template>

        <button
          class="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-menu"
          aria-label="Toggle mobile menu"
          type="button"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>
    </div>
  </nav>
</template>
