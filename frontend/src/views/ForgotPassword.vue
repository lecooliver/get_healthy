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
      throw new Error(data.error || 'Não foi possível enviar o e-mail de redefinição.')
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
        Redefina sua senha
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
          Confira seu e-mail
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Se houver uma conta com esse endereço, enviaremos as instruções para redefinir sua senha.
        </p>
        <button
          class="btn btn-primary"
          @click="router.push('/login')"
        >
          Voltar para o acesso
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
          Informe seu endereço de e-mail e enviaremos as instruções para redefinir sua senha.
        </p>
        
        <div>
          <label class="block text-sm font-medium mb-1">E-mail</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="voce@exemplo.com"
            autocomplete="email"
            required
          >
        </div>
        
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading"
        >
          {{ loading ? 'Enviando...' : 'Enviar link de redefinição' }}
        </button>
      </form>
      
      <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Lembrou sua senha?
        <RouterLink
          to="/login"
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Entrar
        </RouterLink>
      </p>
    </div>
  </div>
</template>
