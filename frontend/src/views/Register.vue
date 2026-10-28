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
    error.value = 'Preencha todos os campos.'
    return
  }
  
  if (form.value.password.length < 6) {
    error.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'As senhas não coincidem.'
    return
  }
  
  loading.value = true
  
  try {
    await authStore.register(form.value.displayName, form.value.email, form.value.password)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (err) {
    error.value = err.message || 'Não foi possível criar a conta.'
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
        Crie sua conta
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
          <label class="block text-sm font-medium mb-1">Nome de exibição</label>
          <input
            v-model="form.displayName"
            type="text"
            class="input"
            placeholder="Seu nome"
            autocomplete="name"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="voce@exemplo.com"
            autocomplete="email"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Senha</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="••••••••"
            autocomplete="new-password"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Confirme a senha</label>
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
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </button>
      </form>
      
      <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Já tem uma conta?
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
