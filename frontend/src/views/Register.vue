<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  
  if (!form.value.displayName || !form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }
  
  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }
  
  loading.value = true
  
  try {
    await authStore.register(form.value.displayName, form.value.email, form.value.password)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (err) {
    error.value = err.message || 'Registration failed'
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
        Create your account
      </p>
    </div>
    
    <div class="card">
      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div
          v-if="error"
          class="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm"
        >
          {{ error }}
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Display Name</label>
          <input
            v-model="form.displayName"
            type="text"
            class="input"
            placeholder="John Doe"
            autocomplete="name"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="you@example.com"
            autocomplete="email"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="••••••••"
            autocomplete="new-password"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="input"
            placeholder="••••••••"
            autocomplete="new-password"
          >
        </div>
        
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading"
        >
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
      
      <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Already have an account?
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
