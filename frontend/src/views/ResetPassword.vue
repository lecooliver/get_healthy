<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(() => {
  token.value = route.query.token || ''
  if (!token.value) {
    error.value = 'Link de redefinição inválido. Solicite uma nova redefinição de senha.'
  }
})

const handleSubmit = async () => {
  error.value = ''
  
  if (!token.value) {
    error.value = 'Token de redefinição inválido.'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem.'
    return
  }
  
  loading.value = true

  try {
    const response = await fetch('/api/password-reset/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.value,
        password: password.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Não foi possível redefinir a senha.')
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
        Crie uma nova senha
      </p>
    </div>
    
    <div class="card">
      <div
        v-if="success"
        class="text-center space-y-4"
      >
        <div class="text-5xl mb-4">
          ✅
        </div>
        <h2 class="text-xl font-semibold">
          Senha redefinida
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Sua senha foi redefinida. Agora você pode entrar com a nova senha.
        </p>
        <button
          class="btn btn-primary"
          @click="router.push('/login')"
        >
          Entrar
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
        
        <div>
          <label class="block text-sm font-medium mb-1">Nova senha</label>
          <input
            v-model="password"
            type="password"
            class="input"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Confirme a senha</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="input"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          >
        </div>
        
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading || !token"
        >
          {{ loading ? 'Redefinindo...' : 'Redefinir senha' }}
        </button>
      </form>
    </div>
  </div>
</template>
