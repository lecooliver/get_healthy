<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { translatePrebuiltText } from '@/utils/prebuiltTemplateTranslations'

const router = useRouter()
const authStore = useAuthStore()

const routines = ref([])
const templates = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const showTemplateModal = ref(false)
const starting = ref(null)
const showDeleteConfirm = ref(false)
const deletingRoutineId = ref(null)

const newRoutine = ref({
  name: '',
  type: 'weightlifting'
})

const routineTypes = [
  { value: 'weightlifting', label: 'Musculação', icon: '🏋️' },
  { value: 'aerobic', label: 'Aeróbico', icon: '🏃' },
  { value: 'flexibility', label: 'Flexibilidade', icon: '🧘' },
  { value: 'combination', label: 'Combinado', icon: '💪' }
]

const getRoutineTypeLabel = (type) => {
  return routineTypes.find(routineType => routineType.value === type)?.label || type
}

onMounted(async () => {
  await Promise.all([loadRoutines()])
})

const loadRoutines = async () => {
  try {
    const response = await fetch('/api/routines', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      routines.value = await response.json()
    }
  } catch (error) {
    console.error('Não foi possível carregar as rotinas:', error)
  } finally {
    loading.value = false
  }
}

const loadTemplates = async () => {
  try {
    const response = await fetch('/api/templates', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      templates.value = await response.json()
    }
  } catch (error) {
    console.error('Não foi possível carregar os modelos:', error)
  }
}

const createRoutine = async () => {
  if (!newRoutine.value.name) return
  
  try {
    const response = await fetch('/api/routines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(newRoutine.value)
    })
    
    if (response.ok) {
      await loadRoutines()
      showCreateModal.value = false
      newRoutine.value = { name: '', type: 'weightlifting' }
    }
  } catch (error) {
    console.error('Não foi possível criar a rotina:', error)
  }
}

const openTemplateModal = async () => {
  showTemplateModal.value = true
  if (templates.value.length === 0) {
    await loadTemplates()
  }
}

const startFromTemplate = async (template) => {
  starting.value = template.id
  try {
    const response = await fetch(`/api/templates/${template.id}/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (response.ok) {
      await loadRoutines()
      showTemplateModal.value = false
    }
  } catch (error) {
    console.error('Não foi possível iniciar pelo modelo:', error)
  } finally {
    starting.value = null
  }
}

const confirmDeleteRoutine = (id) => {
  deletingRoutineId.value = id
  showDeleteConfirm.value = true
}

const deleteRoutine = async () => {
  const id = deletingRoutineId.value
  if (!id) return
  
  try {
    const response = await fetch(`/api/routines/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (response.ok) {
      await loadRoutines()
    }
  } catch (error) {
    console.error('Não foi possível excluir a rotina:', error)
  } finally {
    showDeleteConfirm.value = false
    deletingRoutineId.value = null
  }
}

const getRoutineIcon = (type) => {
  const found = routineTypes.find(t => t.value === type)
  return found ? found.icon : '💪'
}

const getTemplateIcon = (type) => {
  const icons = {
    weightlifting: '🏋️',
    aerobic: '🏃',
    flexibility: '🧘',
    combination: '💪'
  }
  return icons[type] || '📋'
}

const getExerciseCount = (template) => {
  return template.workouts?.reduce((sum, w) => sum + (w.exercises?.length || 0), 0) || 0
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Minhas rotinas
      </h1>
      <div class="flex gap-2">
        <button
          class="btn btn-secondary"
          @click="openTemplateModal"
        >
          📋 Explorar modelos
        </button>
        <button
          class="btn btn-primary"
          @click="showCreateModal = true"
        >
          + Criar rotina
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <div
      v-else-if="routines.length === 0"
      class="card text-center py-12"
    >
      <div class="text-5xl mb-4">
        🏃
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Você ainda não tem rotinas
      </p>
      <p class="text-sm text-gray-500 mb-6">
        Crie uma rotina ou comece com um modelo pronto
      </p>
      <div class="flex justify-center gap-3">
        <button
          class="btn btn-primary"
          @click="showCreateModal = true"
        >
          Criar rotina
        </button>
        <button
          class="btn btn-secondary"
          @click="showTemplateModal = true"
        >
          Explorar modelos
        </button>
      </div>
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="routine in routines"
        :key="routine.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ getRoutineIcon(routine.type) }}</span>
            <div>
              <h3 class="font-semibold">
                {{ translatePrebuiltText(routine.name) }}
              </h3>
              <span class="text-xs text-gray-500">{{ getRoutineTypeLabel(routine.type) }}</span>
            </div>
          </div>
          <button
            class="text-gray-400 hover:text-red-500"
            @click.stop="confirmDeleteRoutine(routine.id)"
          >
            🗑️
          </button>
        </div>
        
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {{ routine.workoutCount || 0 }} treinos
        </div>
        
        <button
          class="btn btn-primary w-full"
          @click="router.push(`/routines/${routine.id}/workouts`)"
        >
          Iniciar treino
        </button>
      </div>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">
          Criar nova rotina
        </h2>
        <form
          class="space-y-4"
          @submit.prevent="createRoutine"
        >
          <div>
            <label class="block text-sm font-medium mb-1">Nome da rotina</label>
            <input
              v-model="newRoutine.name"
              type="text"
              class="input"
              placeholder="Minha rotina de treino"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Tipo de rotina</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="type in routineTypes"
                :key="type.value"
                type="button"
                class="p-3 rounded-lg border-2 transition-colors text-left"
                :class="newRoutine.type === type.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700'"
                @click="newRoutine.type = type.value"
              >
                <span class="text-xl mr-2">{{ type.icon }}</span>
                <span class="font-medium">{{ type.label }}</span>
              </button>
            </div>
          </div>
          
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showCreateModal = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="showTemplateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showTemplateModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">
          Começar com um modelo
        </h2>
        <div
          v-if="templates.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <p>Carregando modelos...</p>
          <p class="text-sm mt-2">
            Se nenhum modelo aparecer, verifique se existe um usuário administrador.
          </p>
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div
            v-for="template in templates"
            :key="template.id"
            class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
            :class="{ 'opacity-50': starting === template.id }"
            @click="startFromTemplate(template)"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">{{ getTemplateIcon(template.type) }}</span>
              <h3 class="font-semibold">
                {{ translatePrebuiltText(template.name) }}
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {{ translatePrebuiltText(template.description) }}
            </p>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ getRoutineTypeLabel(template.type) }}</span>
              <span v-if="template.workouts">{{ template.workouts.length }} treinos • {{ getExerciseCount(template) }} exercícios</span>
            </div>
            <button
              v-if="starting === template.id"
              class="btn btn-primary w-full mt-2 text-sm"
              disabled
            >
              Criando...
            </button>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            class="btn btn-secondary"
            @click="showTemplateModal = false"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :show="showDeleteConfirm"
      title="Excluir rotina"
      message="Tem certeza de que deseja excluir esta rotina? Esta ação não pode ser desfeita."
      confirm-text="Excluir"
      confirm-class="btn-danger"
      @update:show="showDeleteConfirm = $event"
      @confirm="deleteRoutine"
    />
  </div>
</template>
