<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import ConfirmModal from '@/components/ConfirmModal.vue'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const scheduledWorkouts = ref([])
const routines = ref([])
const loading = ref(true)
const showAddForm = ref(false)
const viewMode = ref('list')
const currentMonth = ref(new Date())
const showDeleteConfirm = ref(false)
const deletingScheduleId = ref(null)

const newSchedule = ref({
  routineId: '',
  scheduledDate: new Date().toISOString().split('T')[0],
  cadenceType: 'once',
  cadenceValue: 1
})

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ date: null, workouts: [] })
  }
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().split('T')[0]
    const dayWorkouts = scheduledWorkouts.value.filter(s => {
      const schedDate = new Date(s.scheduledDate).toISOString().split('T')[0]
      return schedDate === dateStr
    })
    days.push({ date, workouts: dayWorkouts })
  }
  
  return days
})

const monthLabel = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const prevMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  )
}

const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isPast = (date) => {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

onMounted(async () => {
  await Promise.all([loadSchedule(), loadRoutines()])
})

const loadSchedule = async () => {
  try {
    const response = await fetch('/api/schedule', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      scheduledWorkouts.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load schedule:', error)
  } finally {
    loading.value = false
  }
}

const loadRoutines = async () => {
  try {
    const response = await fetch('/api/routines', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      routines.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load routines:', error)
  }
}

const addSchedule = async () => {
  try {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(newSchedule.value)
    })
    
    if (response.ok) {
      const schedule = await response.json()
      await loadSchedule()
      showAddForm.value = false
      
      const routine = routines.value.find(r => r.id === schedule.routineId)
      if (routine) {
        notificationStore.scheduleWorkoutReminder(routine.name, schedule.scheduledDate)
      }
      
      newSchedule.value = {
        routineId: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        cadenceType: 'once',
        cadenceValue: 1
      }
    }
  } catch (error) {
    console.error('Failed to add schedule:', error)
  }
}

const confirmDeleteSchedule = (id) => {
  deletingScheduleId.value = id
  showDeleteConfirm.value = true
}

const deleteSchedule = async () => {
  const id = deletingScheduleId.value
  if (!id) return
  
  try {
    const response = await fetch(`/api/schedule/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (response.ok) {
      await loadSchedule()
    }
  } catch (error) {
    console.error('Failed to delete schedule:', error)
  } finally {
    showDeleteConfirm.value = false
    deletingScheduleId.value = null
  }
}

const getCadenceLabel = (schedule) => {
  if (schedule.cadenceType === 'once') return 'One-time'
  if (schedule.cadenceType === 'daily') return 'Daily'
  if (schedule.cadenceType === 'every_x_days') return `Every ${schedule.cadenceValue} days`
  return ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Schedule
      </h1>
      <div class="flex gap-2">
        <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            :class="['px-3 py-1 rounded text-sm', viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : '']"
            @click="viewMode = 'list'"
          >
            List
          </button>
          <button
            :class="['px-3 py-1 rounded text-sm', viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 shadow' : '']"
            @click="viewMode = 'calendar'"
          >
            Calendar
          </button>
        </div>
        <button
          class="btn btn-primary"
          @click="showAddForm = !showAddForm"
        >
          {{ showAddForm ? 'Cancel' : '+ Schedule' }}
        </button>
      </div>
    </div>

    <div
      v-if="showAddForm"
      class="card"
    >
      <h2 class="text-lg font-semibold mb-4">
        Schedule a Workout
      </h2>
      <form
        class="space-y-4"
        @submit.prevent="addSchedule"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Routine</label>
          <select
            v-model="newSchedule.routineId"
            class="input"
            required
          >
            <option value="">
              Select a routine
            </option>
            <option
              v-for="r in routines"
              :key="r.id"
              :value="r.id"
            >
              {{ r.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Scheduled Date</label>
          <input
            v-model="newSchedule.scheduledDate"
            type="date"
            class="input"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Cadence</label>
          <div class="flex gap-2">
            <select
              v-model="newSchedule.cadenceType"
              class="input"
            >
              <option value="once">
                One-time
              </option>
              <option value="daily">
                Daily
              </option>
              <option value="every_x_days">
                Every X days
              </option>
            </select>
            <input
              v-if="newSchedule.cadenceType === 'every_x_days'"
              v-model="newSchedule.cadenceValue"
              type="number"
              min="2"
              class="input w-24"
              placeholder="Days"
            >
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
        >
          Schedule
        </button>
      </form>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <template v-else>
      <div
        v-if="viewMode === 'calendar'"
        class="card"
      >
        <div class="flex items-center justify-between mb-4">
          <button
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            @click="prevMonth"
          >
            ◀
          </button>
          <h2 class="text-lg font-semibold">
            {{ monthLabel }}
          </h2>
          <button
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            @click="nextMonth"
          >
            ▶
          </button>
        </div>
        
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-sm font-medium py-2 text-gray-500"
          >
            {{ day }}
          </div>
          
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'min-h-20 p-2 border rounded transition-colors',
              day.date ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-900 border-transparent',
              isToday(day.date) ? 'ring-2 ring-blue-500' : '',
              isPast(day.date) ? 'opacity-60' : ''
            ]"
          >
            <template v-if="day.date">
              <div
                class="text-sm font-medium mb-1"
                :class="isToday(day.date) ? 'text-blue-600' : ''"
              >
                {{ day.date.getDate() }}
              </div>
              <div class="space-y-1">
                <div
                  v-for="workout in day.workouts"
                  :key="workout.id"
                  class="text-xs p-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded truncate"
                >
                  {{ workout.routine?.name || 'Workout' }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div
        v-else-if="scheduledWorkouts.length === 0"
        class="card text-center py-12"
      >
        <div class="text-5xl mb-4">
          📅
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          No scheduled workouts
        </p>
        <button
          class="btn btn-primary"
          @click="showAddForm = true"
        >
          Schedule Your First Workout
        </button>
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <div
          v-for="schedule in scheduledWorkouts"
          :key="schedule.id"
          class="card flex items-center justify-between"
        >
          <div>
            <div class="font-medium">
              {{ schedule.routine?.name }}
            </div>
            <div class="text-sm text-gray-500">
              {{ new Date(schedule.scheduledDate).toLocaleDateString() }}
              <span class="mx-2">•</span>
              {{ getCadenceLabel(schedule) }}
            </div>
          </div>
          <button
            class="text-gray-400 hover:text-red-500"
            @click="confirmDeleteSchedule(schedule.id)"
          >
            🗑️
          </button>
        </div>
      </div>
    </template>

    <div class="card">
      <h2 class="text-lg font-semibold mb-4">
        Tips
      </h2>
      <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li>• Schedule workouts in advance to build consistency</li>
        <li>• Use the cadence feature for recurring routines (e.g., every 2 days)</li>
        <li>• Start with 3-4 workouts per week and build from there</li>
      </ul>
    </div>

    <ConfirmModal
      :show="showDeleteConfirm"
      title="Remove Scheduled Workout"
      message="Are you sure you want to remove this scheduled workout?"
      confirm-text="Remove"
      confirm-class="btn-danger"
      @update:show="showDeleteConfirm = $event"
      @confirm="deleteSchedule"
    />
  </div>
</template>
