<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useUIStore } from '@/stores/ui'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const uiStore = useUIStore()

const profile = ref({
  displayName: '',
  height: null,
  age: null,
  weight: null,
  weightUnit: 'lb'
})
const avatarUrl = ref('')
const saving = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      profile.value = {
        displayName: data.displayName || '',
        height: data.height ?? null,
        age: data.age ?? null,
        weight: data.weight ?? null,
        weightUnit: data.weightUnit || 'lb'
      }
      avatarUrl.value = data.avatarUrl || ''
    }
  } catch (err) {
    console.error('Não foi possível carregar o perfil:', err)
  }
})

const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('avatar', file)
  
  saving.value = true
  try {
    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    })
    
    if (!response.ok) throw new Error('Não foi possível enviar o avatar.')
    
    const data = await response.json()
    avatarUrl.value = data.avatarUrl
    authStore.updateAvatar(data.avatarUrl)
    success.value = 'Avatar atualizado com sucesso.'
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

const saveProfile = async () => {
  error.value = ''
  saving.value = true
  
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(profile.value)
    })
    
    if (!response.ok) throw new Error('Não foi possível atualizar o perfil.')
    
    authStore.updateUser(profile.value)
    success.value = 'Perfil atualizado com sucesso.'
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

const deleteAllData = async () => {
  deleting.value = true
  try {
    const response = await fetch('/api/profile', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) throw new Error('Não foi possível excluir os dados.')
    
    authStore.logout()
    window.location.href = '/login'
  } catch (err) {
    error.value = err.message
    deleting.value = false
  }
}

const toggleNotifications = async () => {
  if (notificationStore.enabled) {
    notificationStore.disable()
  } else {
    await notificationStore.enable()
  }
}

const testNotification = () => {
  notificationStore.showInstantNotification(
    'Notificação de teste',
    'As notificações estão funcionando corretamente!'
  )
}

const limits = ref([])
const showAddLimit = ref(false)
const newLimit = ref({
  exerciseName: '',
  limitType: 'upper',
  value: '',
  unit: 'lb'
})

const loadLimits = async () => {
  try {
    const response = await fetch('/api/limits', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      limits.value = await response.json()
    }
  } catch (err) {
    console.error('Não foi possível carregar os limites:', err)
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      profile.value = {
        displayName: data.displayName || '',
        height: data.height ?? null,
        age: data.age ?? null,
        weight: data.weight ?? null,
        weightUnit: data.weightUnit || 'lb'
      }
      avatarUrl.value = data.avatarUrl || ''
    }
    await loadLimits()
  } catch (err) {
    console.error('Não foi possível carregar o perfil:', err)
  }
})

const addLimit = async () => {
  if (!newLimit.value.exerciseName.trim()) return
  
  try {
    const response = await fetch('/api/limits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        exerciseName: newLimit.value.exerciseName,
        limitType: newLimit.value.limitType,
        value: newLimit.value.value || null,
        unit: newLimit.value.unit
      })
    })
    
    if (response.ok) {
      showAddLimit.value = false
      newLimit.value = { exerciseName: '', limitType: 'upper', value: '', unit: 'lb' }
      await loadLimits()
    }
  } catch (err) {
    console.error('Não foi possível adicionar o limite:', err)
  }
}

const deleteLimit = async (id) => {
  try {
    const response = await fetch(`/api/limits/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      await loadLimits()
    }
  } catch (err) {
    console.error('Não foi possível excluir o limite:', err)
  }
}

const groupedLimits = computed(() => {
  const groups = {}
  limits.value.forEach(limit => {
    if (!groups[limit.exerciseName]) {
      groups[limit.exerciseName] = []
    }
    groups[limit.exerciseName].push(limit)
  })
  return groups
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">
      Configurações do perfil
    </h1>
    
    <div
      v-if="error"
      class="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
    >
      {{ error }}
    </div>
    
    <div
      v-if="success"
      class="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"
    >
      {{ success }}
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-4">
        Foto do perfil
      </h2>
      <div class="flex items-center gap-6">
        <div class="relative flex-shrink-0">
          <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              alt="Foto do perfil"
              class="w-full h-full object-cover"
              @error="($event.target.style.display = 'none')"
            >
          </div>
          <div
            v-if="!avatarUrl"
            class="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-5xl -mt-32"
          >
            👤
          </div>
          <label class="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <span
              class="text-lg"
              aria-hidden="true"
            >📷</span>
            <span class="sr-only">Enviar foto</span>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              :disabled="saving"
              aria-label="Enviar foto do perfil"
              @change="handleAvatarChange"
            >
          </label>
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Envie uma foto para personalizar seu perfil
          </p>
          <p class="text-xs text-gray-500">
            Recomendado: imagem quadrada com pelo menos 200 × 200 pixels
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-4">
        Informações pessoais
      </h2>
      <form
        class="space-y-4"
        @submit.prevent="saveProfile"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Nome de exibição</label>
          <input
            v-model="profile.displayName"
            type="text"
            class="input"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Altura</label>
          <input
            v-model="profile.height"
            type="number"
            step="0.1"
            class="input"
            placeholder="polegadas"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Idade</label>
          <input
            v-model="profile.age"
            type="number"
            class="input"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Peso atual</label>
          <input
            v-model="profile.weight"
            type="number"
            step="0.1"
            class="input"
            :placeholder="'in ' + profile.weightUnit"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Unidade de peso preferida</label>
          <select
            v-model="profile.weightUnit"
            class="input"
          >
            <option value="lb">
              Libras (lb)
            </option>
            <option value="kg">
              Quilogramas (kg)
            </option>
          </select>
        </div>
        
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-4">
        Aparência
      </h2>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">
            Tema
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Atual: {{ uiStore.theme === 'dark' ? 'Escuro' : uiStore.theme === 'system' ? 'Sistema' : 'Claro' }}
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class="btn"
            :class="uiStore.theme === 'light' ? 'btn-primary' : 'btn-secondary'"
            @click="uiStore.setTheme('light')"
          >
            ☀️ Claro
          </button>
          <button
            class="btn"
            :class="uiStore.theme === 'dark' ? 'btn-primary' : 'btn-secondary'"
            @click="uiStore.setTheme('dark')"
          >
            🌙 Escuro
          </button>
          <button
            class="btn"
            :class="uiStore.theme === 'system' ? 'btn-primary' : 'btn-secondary'"
            @click="uiStore.setTheme('system')"
          >
            💻 Sistema
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="notificationStore.isSupported"
      class="card"
    >
      <h2 class="text-lg font-semibold mb-4">
        Notificações
      </h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">
              Notificações push
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Receba lembretes dos treinos agendados
            </div>
          </div>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="notificationStore.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'"
            @click="toggleNotifications"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="notificationStore.enabled ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
        
        <div
          v-if="notificationStore.permission === 'denied'"
          class="text-sm text-red-600 dark:text-red-400"
        >
          As notificações estão bloqueadas. Ative-as nas configurações do navegador.
        </div>
        
        <div v-else-if="notificationStore.enabled">
          <button
            class="btn btn-secondary text-sm"
            @click="testNotification"
          >
            Enviar notificação de teste
          </button>
        </div>
        
        <div
          v-else
          class="text-sm text-gray-500"
        >
          Ative a opção acima para habilitar as notificações.
        </div>
      </div>
    </div>
    
    <div
      v-else
      class="card"
    >
      <h2 class="text-lg font-semibold mb-4">
        Notificações
      </h2>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Notificações push indisponíveis. Este recurso exige HTTPS e suporte a notificações no navegador.
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">
          Limites de exercícios
        </h2>
        <button
          class="btn btn-primary text-sm"
          @click="showAddLimit = true"
        >
          + Adicionar limite
        </button>
      </div>
      
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Defina limites máximos e mínimos para receber avisos quando forem ultrapassados.
      </p>
      
      <div
        v-if="limits.length === 0"
        class="text-center py-6 text-gray-500"
      >
        Nenhum limite definido. Adicione um limite para acompanhar seus exercícios.
      </div>
      
      <div
        v-else
        class="space-y-4"
      >
        <div
          v-for="(exerciseLimits, exerciseName) in groupedLimits"
          :key="exerciseName"
        >
          <h3 class="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
            {{ exerciseName }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="limit in exerciseLimits"
              :key="limit.id"
              class="flex items-center gap-2 px-3 py-1 rounded-full"
              :class="limit.limitType === 'upper' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'"
            >
              <span class="text-xs">{{ limit.limitType === 'upper' ? 'Máx.' : 'Mín.' }}:</span>
              <span class="font-medium">
                {{ limit.value }} {{ limit.unit || '' }}
              </span>
              <button
                class="text-red-500 hover:text-red-700 text-sm"
                @click="deleteLimit(limit.id)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div
        v-if="showAddLimit"
        class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <h3 class="font-medium mb-3">
          Adicionar novo limite
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Nome do exercício</label>
            <input
              v-model="newLimit.exerciseName"
              type="text"
              class="input w-full"
              placeholder="Ex.: agachamento"
            >
          </div>
          <div>
            <label class="block text-sm mb-1">Tipo de limite</label>
            <select
              v-model="newLimit.limitType"
              class="input w-full"
            >
              <option value="upper">
                Limite superior (máximo)
              </option>
              <option value="lower">
                Limite inferior (mínimo)
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">Valor</label>
            <input
              v-model="newLimit.value"
              type="number"
              step="0.5"
              class="input w-full"
              placeholder="Ex.: 100"
            >
          </div>
          <div>
            <label class="block text-sm mb-1">Unidade</label>
            <select
              v-model="newLimit.unit"
              class="input w-full"
            >
              <option value="lb">
                lb
              </option>
              <option value="kg">
                kg
              </option>
              <option value="reps">
                repetições
              </option>
            </select>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button
            class="btn btn-primary"
            :disabled="!newLimit.exerciseName.trim()"
            @click="addLimit"
          >
            Adicionar limite
          </button>
          <button
            class="btn btn-secondary"
            @click="showAddLimit = false"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <div class="card border-2 border-red-200 dark:border-red-800">
      <h2 class="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
        Zona de perigo
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Exclua permanentemente todos os seus dados. Esta ação não pode ser desfeita.
      </p>
      <div v-if="!showDeleteConfirm">
        <button
          class="btn btn-danger"
          @click="showDeleteConfirm = true"
        >
          Excluir todos os meus dados
        </button>
      </div>
      <div
        v-else
        class="space-y-3"
      >
        <p class="font-medium text-red-600 dark:text-red-400">
          Tem certeza? Os seguintes dados serão excluídos:
        </p>
        <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
          <li>Seu perfil e suas configurações</li>
          <li>Todas as medidas</li>
          <li>Todas as rotinas e os treinos</li>
          <li>Todos os modelos</li>
        </ul>
        <div class="flex gap-2">
          <button
            class="btn btn-danger"
            :disabled="deleting"
            @click="deleteAllData"
          >
            {{ deleting ? 'Excluindo...' : 'Sim, excluir tudo' }}
          </button>
          <button
            class="btn btn-secondary"
            @click="showDeleteConfirm = false"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
