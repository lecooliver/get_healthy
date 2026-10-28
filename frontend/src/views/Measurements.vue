<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const authStore = useAuthStore()

const measurements = ref([])
const loading = ref(true)
const showAddForm = ref(false)
const saving = ref(false)
const newMeasurement = ref({
  date: new Date().toISOString().split('T')[0],
  weight: null,
  waist: null,
  hips: null,
  chest: null,
  thighL: null,
  thighR: null,
  bicepL: null,
  bicepR: null,
  shoulderSpan: null,
  calfL: null,
  calfR: null,
  backSpan: null,
  neck: null,
  bodyFatPercentage: null
})
const showCharts = ref(true)
const selectedMetrics = ref(['weight', 'bodyFatPercentage'])

const metricOptions = [
  { key: 'weight', label: 'Peso', color: '#2563eb' },
  { key: 'bodyFatPercentage', label: 'Gordura corporal %', color: '#dc2626' },
  { key: 'waist', label: 'Cintura', color: '#16a34a' },
  { key: 'hips', label: 'Quadril', color: '#9333ea' },
  { key: 'chest', label: 'Peitoral', color: '#ea580c' },
  { key: 'bicepL', label: 'Bíceps esquerdo', color: '#0891b2' },
  { key: 'bicepR', label: 'Bíceps direito', color: '#4f46e5' },
  { key: 'thighL', label: 'Coxa esquerda', color: '#be185d' },
  { key: 'thighR', label: 'Coxa direita', color: '#0d9488' }
]

onMounted(async () => {
  await loadMeasurements()
})

const loadMeasurements = async () => {
  try {
    const response = await fetch('/api/measurements', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      measurements.value = await response.json()
    }
  } catch (error) {
    console.error('Não foi possível carregar as medidas:', error)
  } finally {
    loading.value = false
  }
}

const saveMeasurement = async () => {
  saving.value = true
  try {
    const response = await fetch('/api/measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(newMeasurement.value)
    })
    
    if (response.ok) {
      await loadMeasurements()
      showAddForm.value = false
      resetForm()
    }
  } catch (error) {
    console.error('Não foi possível salvar a medida:', error)
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  newMeasurement.value = {
    date: new Date().toISOString().split('T')[0],
    weight: null,
    waist: null,
    hips: null,
    chest: null,
    thighL: null,
    thighR: null,
    bicepL: null,
    bicepR: null,
    shoulderSpan: null,
    calfL: null,
    calfR: null,
    backSpan: null,
    neck: null,
    bodyFatPercentage: null
  }
}

const sortedMeasurements = computed(() => {
  return [...measurements.value].sort((a, b) => new Date(a.date) - new Date(b.date))
})

const chartData = computed(() => {
  const labels = sortedMeasurements.value.map(m => 
    new Date(m.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
  )
  
  const datasets = selectedMetrics.value.map(metricKey => {
    const option = metricOptions.find(o => o.key === metricKey)
    const data = sortedMeasurements.value.map(m => m[metricKey])
    
    return {
      label: option?.label || metricKey,
      data,
      borderColor: option?.color || '#666',
      backgroundColor: option?.color ? `${option.color}20` : '#66620',
      fill: true,
      tension: 0.3,
      spanGaps: true
    }
  })
  
  return {
    labels,
    datasets
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: false
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}

const toggleMetric = (metricKey) => {
  if (selectedMetrics.value.includes(metricKey)) {
    if (selectedMetrics.value.length > 1) {
      selectedMetrics.value = selectedMetrics.value.filter(k => k !== metricKey)
    }
  } else {
    selectedMetrics.value.push(metricKey)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Medidas corporais
      </h1>
      <div class="flex gap-2">
        <button
          class="btn btn-secondary"
          @click="showCharts = !showCharts"
        >
          {{ showCharts ? 'Ocultar gráficos' : 'Exibir gráficos' }}
        </button>
        <button
          class="btn btn-primary"
          @click="showAddForm = !showAddForm"
        >
          {{ showAddForm ? 'Cancelar' : '+ Adicionar medida' }}
        </button>
      </div>
    </div>

    <div
      v-if="showAddForm"
      class="card"
    >
      <h2 class="text-lg font-semibold mb-4">
        Nova medida
      </h2>
      <form
        class="space-y-4"
        @submit.prevent="saveMeasurement"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Data</label>
          <input
            v-model="newMeasurement.date"
            type="date"
            class="input"
            required
          >
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Peso</label>
            <input
              v-model="newMeasurement.weight"
              type="number"
              step="0.1"
              class="input"
              placeholder="lb"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Gordura corporal %</label>
            <input
              v-model="newMeasurement.bodyFatPercentage"
              type="number"
              step="0.1"
              class="input"
              placeholder="%"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Pescoço</label>
            <input
              v-model="newMeasurement.neck"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Ombros</label>
            <input
              v-model="newMeasurement.shoulderSpan"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Peitoral</label>
            <input
              v-model="newMeasurement.chest"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Cintura</label>
            <input
              v-model="newMeasurement.waist"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Quadril</label>
            <input
              v-model="newMeasurement.hips"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Bíceps esquerdo</label>
            <input
              v-model="newMeasurement.bicepL"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Bíceps direito</label>
            <input
              v-model="newMeasurement.bicepR"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Coxa esquerda</label>
            <input
              v-model="newMeasurement.thighL"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Coxa direita</label>
            <input
              v-model="newMeasurement.thighR"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Panturrilha esquerda</label>
            <input
              v-model="newMeasurement.calfL"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Panturrilha direita</label>
            <input
              v-model="newMeasurement.calfR"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Largura das costas</label>
            <input
              v-model="newMeasurement.backSpan"
              type="number"
              step="0.1"
              class="input"
              placeholder="in"
            >
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : 'Salvar medida' }}
        </button>
      </form>
    </div>

    <div
      v-if="showCharts && !loading && sortedMeasurements.length >= 2"
      class="card"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">
          Progresso ao longo do tempo
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in metricOptions"
            :key="option.key"
            class="px-3 py-1 text-sm rounded-full border transition-colors"
            :class="selectedMetrics.includes(option.key)
              ? 'border-transparent text-white'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'"
            :style="selectedMetrics.includes(option.key) ? { backgroundColor: option.color } : {}"
            @click="toggleMetric(option.key)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <div class="h-80">
        <Line
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <div
      v-else-if="measurements.length === 0"
      class="card text-center py-12"
    >
      <div class="text-5xl mb-4">
        📏
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Nenhuma medida registrada
      </p>
      <button
        class="btn btn-primary"
        @click="showAddForm = true"
      >
        Adicionar sua primeira medida
      </button>
    </div>

    <div
      v-else
      class="card overflow-x-auto"
    >
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="text-left py-3 px-2">
              Data
            </th>
            <th class="text-right py-3 px-2">
              Peso
            </th>
            <th class="text-right py-3 px-2">
              Gordura corporal %
            </th>
            <th class="text-right py-3 px-2">
              Cintura
            </th>
            <th class="text-right py-3 px-2">
              Quadril
            </th>
            <th class="text-right py-3 px-2">
              Peitoral
            </th>
            <th class="text-right py-3 px-2">
              Bíceps E
            </th>
            <th class="text-right py-3 px-2">
              Bíceps D
            </th>
            <th class="text-right py-3 px-2">
              Coxa E
            </th>
            <th class="text-right py-3 px-2">
              Coxa D
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in measurements"
            :key="m.id"
            class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="py-3 px-2">
              {{ new Date(m.date).toLocaleDateString('pt-BR') }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.weight || '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.bodyFatPercentage || '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.waist || '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.hips || '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.chest || '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.bicepL || '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.bicepR || '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.thighL || '-' }}
            </td>
            <td class="py-3 px-2 text-right">
              {{ m.thighR || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
