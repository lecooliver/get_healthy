<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const error = ref('')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const errorParam = params.get('error')

  if (errorParam) {
    error.value = 'OAuth authentication failed. Please try again.'
    return
  }

  if (!token) {
    error.value = 'No token received from OAuth provider.'
    return
  }

  authStore.token = token
  localStorage.setItem('token', token)
  await authStore.checkAuth()
  
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  } else {
    error.value = 'Failed to authenticate. Please try again.'
  }
})
</script>

<template>
  <div class="w-full max-w-md p-8">
    <div class="card text-center">
      <div
        v-if="error"
        class="space-y-4"
      >
        <div class="text-5xl mb-4">
          ❌
        </div>
        <h2 class="text-xl font-semibold text-red-600">
          Authentication Failed
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ error }}
        </p>
        <button
          class="btn btn-primary"
          @click="router.push('/login')"
        >
          Back to Login
        </button>
      </div>
      <div
        v-else
        class="space-y-4"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">
          Completing sign in...
        </p>
      </div>
    </div>
  </div>
</template>
