<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const response = await fetch('/api/password-reset/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to send reset email')
    }

    success.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
        Get Healthy
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Reset your password
      </p>
    </div>
    
    <div class="card">
      <div
        v-if="success"
        class="text-center space-y-4"
      >
        <div class="text-5xl mb-4">
          📧
        </div>
        <h2 class="text-xl font-semibold">
          Check your email
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          If an account exists with that email, we've sent password reset instructions.
        </p>
        <button
          class="btn btn-primary"
          @click="router.push('/login')"
        >
          Back to Login
        </button>
      </div>

      <form
        v-else
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div
          v-if="error"
          class="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm"
        >
          {{ error }}
        </div>
        
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="you@example.com"
            autocomplete="email"
            required
          >
        </div>
        
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading"
        >
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>
      
      <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Remember your password?
        <RouterLink
          to="/login"
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Sign in
        </RouterLink>
      </p>
    </div>
  </div>
</template>
