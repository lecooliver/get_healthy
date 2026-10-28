<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const greeting = ref('')
const motivationalMessage = ref('')
const recentActivity = ref([])
const stats = ref({
  workoutsThisWeek: 0,
  totalWorkouts: 0,
  currentStreak: 0,
  caloriesBurned: 0
})
const loading = ref(true)

const motivationalMessages = [
  'Todo treino conta! Continue avançando.',
  'Seu corpo consegue. Você só precisa convencer sua mente.',
  'O único treino ruim é aquele que não aconteceu.',
  'Pequenos avanços também são progresso.',
  'Constância vale mais que perfeição.',
  'Você é mais forte do que imagina.',
  'Um dia de cada vez, uma repetição de cada vez.',
  'Quem quer resultados treina; quem não quer, encontra desculpas.',
  'Sua saúde é um investimento, não uma despesa.',
  'A dificuldade de hoje será a sua força de amanhã.'
]

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

const getRandomMotivation = () => {
  return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
}

onMounted(async () => {
  greeting.value = getGreeting()
  motivationalMessage.value = getRandomMotivation()
  
  try {
    const response = await fetch('/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      recentActivity.value = data.recentActivity || []
      stats.value = data.stats || stats.value
    }
  } catch (error) {
    console.error('Não foi possível carregar os dados do painel:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          {{ greeting }}, {{ authStore.user?.displayName || 'Atleta' }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ motivationalMessage }}
        </p>
      </div>
      <div class="text-6xl">
        💪
      </div>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card">
          <div class="text-3xl mb-2">
            🏋️
          </div>
          <div class="text-2xl font-bold">
            {{ stats.workoutsThisWeek }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Treinos nesta semana
          </div>
        </div>
        
        <div class="card">
          <div class="text-3xl mb-2">
            📊
          </div>
          <div class="text-2xl font-bold">
            {{ stats.totalWorkouts }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Total de treinos
          </div>
        </div>
        
        <div class="card">
          <div class="text-3xl mb-2">
            🔥
          </div>
          <div class="text-2xl font-bold">
            {{ stats.currentStreak }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Dias consecutivos
          </div>
        </div>
        
        <div class="card">
          <div class="text-3xl mb-2">
            ⚡
          </div>
          <div class="text-2xl font-bold">
            {{ stats.caloriesBurned.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Calorias gastas
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">
            Ações rápidas
          </h2>
          <div class="grid grid-cols-2 gap-3">
            <RouterLink
              to="/routines"
              class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div class="text-2xl mb-1">
                ➕
              </div>
              <div class="font-medium">
                Iniciar treino
              </div>
            </RouterLink>
            <RouterLink
              to="/templates"
              class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div class="text-2xl mb-1">
                📋
              </div>
              <div class="font-medium">
                Explorar modelos
              </div>
            </RouterLink>
            <RouterLink
              to="/measurements"
              class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div class="text-2xl mb-1">
                📏
              </div>
              <div class="font-medium">
                Registrar medidas
              </div>
            </RouterLink>
            <RouterLink
              to="/reports"
              class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div class="text-2xl mb-1">
                📈
              </div>
              <div class="font-medium">
                Ver progresso
              </div>
            </RouterLink>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold mb-4">
            Atividade recente
          </h2>
          <div
            v-if="recentActivity.length === 0"
            class="text-center py-8 text-gray-500"
          >
            <div class="text-4xl mb-2">
              🏃
            </div>
            <p>Nenhuma atividade recente. Comece seu primeiro treino!</p>
          </div>
          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div class="text-2xl">
                {{ activity.icon }}
              </div>
              <div class="flex-1">
                <div class="font-medium">
                  {{ activity.name }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ activity.date }}
                </div>
              </div>
              <div
                v-if="activity.duration"
                class="text-sm text-gray-600 dark:text-gray-400"
              >
                {{ activity.duration }} min
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
