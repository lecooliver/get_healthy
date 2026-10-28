<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Chart, registerables } from 'chart.js'
import { translatePrebuiltText } from '@/utils/prebuiltTemplateTranslations'

Chart.register(...registerables)

const authStore = useAuthStore()

const progressData = ref({ body: [], strength: [] })
const caloriesData = ref([])
const timeOfDayData = ref({})
const frequencyData = ref({})
const loading = ref(true)
const activeTab = ref('progress')
const selectedExercise = ref(null)
const chartContainer = ref(null)
let strengthChart = null

const tabs = [
  { id: 'progress', label: 'Progresso', icon: '📈' },
  { id: 'calories', label: 'Calorias', icon: '🔥' },
  { id: 'time', label: 'Horário', icon: '🕐' },
  { id: 'frequency', label: 'Frequência', icon: '📅' }
]

onMounted(async () => {
  await Promise.all([
    loadProgress(),
    loadCalories(),
    loadTimeOfDay(),
    loadFrequency()
  ])
  loading.value = false
})

const loadProgress = async () => {
  try {
    const response = await fetch('/api/reports/progress?metric=weight', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const data = await response.json()
      progressData.value = data
      if (data.strength?.length > 0) {
        selectedExercise.value = data.strength[0]
        await nextTick()
        createChart()
      }
    }
  } catch (error) {
    console.error('Não foi possível carregar o progresso:', error)
  }
}

const loadCalories = async () => {
  try {
    const response = await fetch('/api/reports/calories?range=week', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      caloriesData.value = await response.json()
    }
  } catch (error) {
    console.error('Não foi possível carregar as calorias:', error)
  }
}

const loadTimeOfDay = async () => {
  try {
    const response = await fetch('/api/reports/by-time-of-day', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      timeOfDayData.value = await response.json()
    }
  } catch (error) {
    console.error('Não foi possível carregar os dados por horário:', error)
  }
}

const loadFrequency = async () => {
  try {
    const response = await fetch('/api/reports/workout-frequency', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      frequencyData.value = await response.json()
    }
  } catch (error) {
    console.error('Não foi possível carregar os dados de frequência:', error)
  }
}

const totalCalories = () => {
  return caloriesData.value.reduce((sum, c) => sum + (c.calories || 0), 0)
}

const totalStrengthProgress = computed(() => {
  if (!progressData.value.strength?.length) return { improved: 0, maintained: 0, total: 0 }
  const improved = progressData.value.strength.filter(e => e.totalProgress > 0).length
  return {
    improved,
    maintained: progressData.value.strength.length - improved,
    total: progressData.value.strength.length
  }
})

const createChart = () => {
  const canvas = document.getElementById('strengthChart')
  if (!selectedExercise.value || !canvas) {
    return
  }

  const ctx = canvas.getContext('2d')
  const data = selectedExercise.value.data

  if (strengthChart) {
    strengthChart.destroy()
  }

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? '#374556' : '#e5e7eb'

  strengthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'Peso máximo (lb)',
        data: data.map(d => d.maxWeight),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const entry = data[context.dataIndex]
              return `${context.parsed.y} lb (${entry.sets} séries, ${entry.volume} de volume)`
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          beginAtZero: false
        }
      }
    }
  })
}

watch(selectedExercise, async () => {
  await nextTick()
  createChart()
})

watch(() => progressData.value.strength, async (newStrength) => {
  if (newStrength?.length > 0 && !selectedExercise.value) {
    selectedExercise.value = newStrength[0]
    await nextTick()
    createChart()
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      Relatórios e análises
    </h1>

    <div class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === tab.id
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'"
        @click="activeTab = tab.id"
      >
        <span class="mr-2">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <template v-else>
      <div
        v-if="activeTab === 'progress'"
        class="space-y-6"
      >
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">
            Medidas corporais (últimos 90 dias)
          </h2>
          <div
            v-if="progressData.body?.length === 0"
            class="text-center py-8 text-gray-500"
          >
            Nenhuma medida corporal registrada
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <div
              v-for="p in progressData.body?.slice(-10)"
              :key="p.date"
              class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
            >
              <span class="text-sm text-gray-600">{{ new Date(p.date).toLocaleDateString('pt-BR') }}</span>
              <span class="font-medium">{{ p.value }} lb</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold mb-4">
            Progresso na musculação
          </h2>
          <div
            v-if="!progressData.strength?.length"
            class="text-center py-8 text-gray-500"
          >
            Nenhum dado de musculação registrado
          </div>
          <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="text-2xl font-bold text-green-600">
                  {{ totalStrengthProgress.improved }}
                </div>
                <div class="text-sm text-gray-600">
                  Exercícios com evolução
                </div>
              </div>
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">
                  {{ totalStrengthProgress.maintained }}
                </div>
                <div class="text-sm text-gray-600">
                  Mantidos
                </div>
              </div>
              <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">
                  {{ totalStrengthProgress.total }}
                </div>
                <div class="text-sm text-gray-600">
                  Total de exercícios
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Selecionar exercício</label>
              <select
                v-model="selectedExercise"
                class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option
                  v-for="exercise in progressData.strength"
                  :key="exercise.name"
                  :value="exercise"
                >
                  {{ translatePrebuiltText(exercise.name) }} ({{ exercise.startingMax }} → {{ exercise.currentMax }} lb)
                  <span
                    v-if="exercise.totalProgress > 0"
                    class="text-green-600"
                  >+{{ exercise.totalProgress }}</span>
                </option>
              </select>
            </div>

            <div
              v-if="selectedExercise"
              class="space-y-4"
            >
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span class="font-medium">{{ translatePrebuiltText(selectedExercise.name) }}</span>
                <span
                  :class="selectedExercise.totalProgress >= 0 ? 'text-green-600' : 'text-red-600'"
                  class="font-bold"
                >
                  {{ selectedExercise.totalProgress >= 0 ? '+' : '' }}{{ selectedExercise.totalProgress }} lb no total
                </span>
              </div>
              <div class="text-sm text-gray-500">
                {{ selectedExercise.startingMax }} lb → {{ selectedExercise.currentMax }} lb
              </div>
              <div
                ref="chartContainer"
                style="height: 300px; position: relative;"
              >
                <canvas id="strengthChart" />
              </div>
            </div>
          </template>
        </div>
      </div>

      <div
        v-if="activeTab === 'calories'"
        class="space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card">
            <div class="text-2xl mb-1">
              🔥
            </div>
            <div class="text-2xl font-bold">
              {{ totalCalories().toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500">
              Calorias nesta semana
            </div>
          </div>
          <div class="card">
            <div class="text-2xl mb-1">
              📊
            </div>
            <div class="text-2xl font-bold">
              {{ caloriesData.length }}
            </div>
            <div class="text-sm text-gray-500">
              Sessões de cardio
            </div>
          </div>
          <div class="card">
            <div class="text-2xl mb-1">
              ⚡
            </div>
            <div class="text-2xl font-bold">
              {{ caloriesData.length > 0 ? Math.round(totalCalories() / caloriesData.length) : 0 }}
            </div>
            <div class="text-sm text-gray-500">
              Média de calorias por sessão
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'time'"
        class="space-y-6"
      >
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">
            Treinos por horário
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div class="text-2xl mb-2">
                🌅
              </div>
              <div class="text-xl font-bold">
                {{ timeOfDayData.morning?.count || 0 }}
              </div>
              <div class="text-sm text-gray-600">
                Manhã (5h às 12h)
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Média: {{ Math.round(timeOfDayData.morning?.avgDuration || 0) }} min
              </div>
            </div>
            <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div class="text-2xl mb-2">
                ☀️
              </div>
              <div class="text-xl font-bold">
                {{ timeOfDayData.afternoon?.count || 0 }}
              </div>
              <div class="text-sm text-gray-600">
                Tarde (12h às 17h)
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Média: {{ Math.round(timeOfDayData.afternoon?.avgDuration || 0) }} min
              </div>
            </div>
            <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-2xl mb-2">
                🌙
              </div>
              <div class="text-xl font-bold">
                {{ timeOfDayData.evening?.count || 0 }}
              </div>
              <div class="text-sm text-gray-600">
                Noite (a partir das 17h)
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Média: {{ Math.round(timeOfDayData.evening?.avgDuration || 0) }} min
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'frequency'"
        class="space-y-6"
      >
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">
            Frequência de treinos (últimos 30 dias)
          </h2>
          <div
            v-if="Object.keys(frequencyData).length === 0"
            class="text-center py-8 text-gray-500"
          >
            Nenhum treino registrado nos últimos 30 dias
          </div>
          <div
            v-else
            class="grid grid-cols-7 gap-1"
          >
            <div
              v-for="(day, date) in frequencyData"
              :key="date"
              class="aspect-square rounded"
              :class="day.count > 0 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'"
              :title="`${date}: ${day.count} treino(s)`"
            />
          </div>
          <div class="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
              <span>Sem treino</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-blue-500" />
              <span>Treino</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
