<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HelpIcon from '@/components/HelpIcon.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const routine = ref(null)
const currentWorkout = ref(null)
const profile = ref({ weightUnit: 'lb' })
const loading = ref(true)
const exerciseHistory = ref([])
const archivedWorkouts = ref([])
const showArchived = ref(false)
const showArchivePanel = ref(false)
const selectedWorkouts = ref([])
const showExerciseDropdown = ref(false)
const showSaveTemplateModal = ref(false)
const saveTemplateData = ref({
  name: '',
  description: '',
  isPublic: false
})
const savingTemplate = ref(false)

const showCompletionModal = ref(false)
const completionInput = ref('')
const editingCompletedWorkoutId = ref(null)
const savingCompletion = ref(false)

const newExercise = ref({
  name: '',
  type: 'strength'
})

const newSet = ref({})

const newCardioEntry = ref({})

const archiveFilter = ref({
  startDate: '',
  endDate: '',
  namePattern: ''
})

const commonExercises = {
  strength: [
    { name: 'Squat', muscle: 'Legs' },
    { name: 'Bench Press', muscle: 'Chest' },
    { name: 'Deadlift', muscle: 'Back' },
    { name: 'Overhead Press', muscle: 'Shoulders' },
    { name: 'Barbell Row', muscle: 'Back' },
    { name: 'Pull-up', muscle: 'Back' },
    { name: 'Lat Pulldown', muscle: 'Back' },
    { name: 'Dumbbell Press', muscle: 'Chest' },
    { name: 'Incline Bench Press', muscle: 'Chest' },
    { name: 'Leg Press', muscle: 'Legs' },
    { name: 'Romanian Deadlift', muscle: 'Hamstrings' },
    { name: 'Leg Curl', muscle: 'Hamstrings' },
    { name: 'Leg Extension', muscle: 'Quads' },
    { name: 'Calf Raise', muscle: 'Calves' },
    { name: 'Bicep Curl', muscle: 'Biceps' },
    { name: 'Tricep Pushdown', muscle: 'Triceps' },
    { name: 'Skull Crusher', muscle: 'Triceps' },
    { name: 'Lateral Raise', muscle: 'Shoulders' },
    { name: 'Face Pull', muscle: 'Rear Delts' },
    { name: 'Shrug', muscle: 'Traps' },
    { name: 'Plank', muscle: 'Core' },
    { name: 'Crunch', muscle: 'Core' },
    { name: 'Push-up', muscle: 'Chest' },
    { name: 'Dip', muscle: 'Triceps' },
    { name: 'Hip Thrust', muscle: 'Glutes' },
    { name: 'Cable Fly', muscle: 'Chest' }
  ],
  cardio: [
    { name: 'Running', type: 'Treadmill' },
    { name: 'Cycling', type: 'Bike' },
    { name: 'Elliptical', type: 'Machine' },
    { name: 'Rowing', type: 'Machine' },
    { name: 'Jump Rope', type: 'Equipment' },
    { name: 'Stair Climber', type: 'Machine' },
    { name: 'Swimming', type: 'Pool' },
    { name: 'Walking', type: 'Outdoor' },
    { name: 'Hiking', type: 'Outdoor' },
    { name: 'Box Jump', type: 'Plyometric' },
    { name: 'Burpee', type: 'HIIT' },
    { name: 'Mountain Climber', type: 'HIIT' },
    { name: 'Sprint', type: 'HIIT' }
  ],
  flexibility: [
    { name: 'Hamstring Stretch', type: 'Legs' },
    { name: 'Quad Stretch', type: 'Legs' },
    { name: 'Hip Flexor Stretch', type: 'Hips' },
    { name: 'Calf Stretch', type: 'Calves' },
    { name: 'Shoulder Stretch', type: 'Shoulders' },
    { name: 'Tricep Stretch', type: 'Arms' },
    { name: 'Chest Stretch', type: 'Chest' },
    { name: 'Cat-Cow', type: 'Back' },
    { name: 'Child\'s Pose', type: 'Back' },
    { name: 'Downward Dog', type: 'Full Body' },
    { name: 'Cobra Stretch', type: 'Back' },
    { name: 'Pigeon Pose', type: 'Hips' },
    { name: 'Butterfly Stretch', type: 'Hips' },
    { name: 'Seated Forward Fold', type: 'Hamstrings' },
    { name: 'Thoracic Rotation', type: 'Upper Back' },
    { name: 'Neck Stretch', type: 'Neck' }
  ]
}

const filteredCommonExercises = computed(() => {
  return commonExercises[newExercise.value.type] || []
})

const selectCommonExercise = (exercise) => {
  newExercise.value.name = exercise.name
  showExerciseDropdown.value = false
}

const toggleExerciseDropdown = () => {
  showExerciseDropdown.value = !showExerciseDropdown.value
}

const handleBlur = () => {
  window.setTimeout(() => {
    showExerciseDropdown.value = false
  }, 200)
}

onMounted(async () => {
  await Promise.all([loadRoutine(), loadProfile()])
})

const loadRoutine = async () => {
  try {
    const response = await fetch(`/api/routines/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      routine.value = await response.json()
      extractExerciseHistory()
    }
  } catch (error) {
    console.error('Failed to load routine:', error)
  } finally {
    loading.value = false
  }
}

const extractExerciseHistory = () => {
  if (!routine.value?.workouts) return
  const names = new Set()
  routine.value.workouts.forEach(workout => {
    workout.exercises?.forEach(ex => {
      if (ex.name) names.add(ex.name)
    })
  })
  exerciseHistory.value = Array.from(names).sort()
}

const loadProfile = async () => {
  try {
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const data = await response.json()
      profile.value.weightUnit = data.weightUnit || 'lb'
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}

const loadArchivedWorkouts = async () => {
  try {
    const response = await fetch(`/api/routines/${route.params.id}/workouts/archived`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      archivedWorkouts.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load archived workouts:', error)
  }
}

const incompleteWorkouts = computed(() => {
  if (!routine.value?.workouts) return []
  return routine.value.workouts.filter(w => !w.completedAt && !w.archived)
})

const pastWorkouts = computed(() => {
  if (!routine.value?.workouts) return []
  return routine.value.workouts.filter(w => w.completedAt && !w.archived)
})

const startWorkout = async () => {
  const response = await fetch(`/api/routines/${route.params.id}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify({
      name: `${routine.value.name} - ${new Date().toLocaleDateString()}`
    })
  })

  if (response.ok) {
    const workout = await response.json()
    workout.exercises = workout.exercises || []
    currentWorkout.value = workout
  }
}

const continueWorkout = async (workout) => {
  currentWorkout.value = workout
}

const addExercise = async () => {
  if (!currentWorkout.value || !newExercise.value.name) return

  const response = await fetch(`/api/workouts/${currentWorkout.value.id}/exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify(newExercise.value)
  })

  if (response.ok) {
    const exercise = await response.json()
    exercise.sets = []
    currentWorkout.value.exercises.push(exercise)
    if (!exerciseHistory.value.includes(newExercise.value.name)) {
      exerciseHistory.value.push(newExercise.value.name)
      exerciseHistory.value.sort()
    }
    newExercise.value = { name: '', type: 'strength' }
    showExerciseDropdown.value = false
  }
}

const getNewSet = (exerciseId) => {
  if (!newSet.value[exerciseId]) {
    newSet.value[exerciseId] = { reps: '', weight: '', rpe: null }
  }
  return newSet.value[exerciseId]
}

const addSet = async (exerciseId) => {
  const ns = getNewSet(exerciseId)
  const response = await fetch(`/api/exercises/${exerciseId}/sets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify({
      reps: parseInt(ns.reps) || 0,
      weight: parseFloat(ns.weight) || 0,
      rpe: ns.rpe ? parseInt(ns.rpe) : null
    })
  })

  if (response.ok) {
    const set = await response.json()
    const exercise = currentWorkout.value.exercises.find(e => e.id === exerciseId)
    if (exercise) {
      exercise.sets = exercise.sets || []
      exercise.sets.push(set)
    }
    newSet.value[exerciseId] = { reps: '', weight: '', rpe: null }
  }
}

const toggleSetComplete = async (set) => {
  const response = await fetch(`/api/sets/${set.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify({ completed: !set.completed })
  })

  if (response.ok) {
    set.completed = !set.completed
  }
}

const toDatetimeLocal = (date) => {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatCompletionDate = (value) => {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const openCompletionModal = () => {
  editingCompletedWorkoutId.value = null
  completionInput.value = toDatetimeLocal(new Date())
  showCompletionModal.value = true
}

const openEditCompletionModal = (workout) => {
  editingCompletedWorkoutId.value = workout.id
  completionInput.value = toDatetimeLocal(workout.completedAt || new Date())
  showCompletionModal.value = true
}

const closeCompletionModal = () => {
  showCompletionModal.value = false
  savingCompletion.value = false
}

const confirmCompletion = async () => {
  if (!completionInput.value || savingCompletion.value) return

  const completedAtIso = new Date(completionInput.value).toISOString()
  savingCompletion.value = true

  try {
    let response
    if (editingCompletedWorkoutId.value) {
      response = await fetch(`/api/routines/${route.params.id}/workouts/${editingCompletedWorkoutId.value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ completedAt: completedAtIso })
      })
    } else {
      response = await fetch(`/api/routines/${route.params.id}/workouts/${currentWorkout.value.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ completedAt: completedAtIso })
      })

      if (response.ok && currentWorkout.value) {
        currentWorkout.value.completedAt = completedAtIso
      }
    }

    if (response.ok) {
      showCompletionModal.value = false
      if (!editingCompletedWorkoutId.value) {
        currentWorkout.value = null
      }
      await loadRoutine()
    }
  } finally {
    savingCompletion.value = false
  }
}

const getNewCardioEntry = (exerciseId) => {
  if (!newCardioEntry.value[exerciseId]) {
    newCardioEntry.value[exerciseId] = { distance: '', duration: '', heartRate: '', distanceUnit: 'miles' }
  }
  return newCardioEntry.value[exerciseId]
}

const addCardioEntry = async (exerciseId) => {
  const entry = getNewCardioEntry(exerciseId)
  const response = await fetch(`/api/exercises/${exerciseId}/cardio-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify({
      distance: entry.distance ? parseFloat(entry.distance) : null,
      durationMinutes: entry.duration ? parseInt(entry.duration) : null,
      heartRate: entry.heartRate ? parseInt(entry.heartRate) : null,
      distanceUnit: entry.distanceUnit || 'miles'
    })
  })

  if (response.ok) {
    const log = await response.json()
    const exercise = currentWorkout.value.exercises.find(e => e.id === exerciseId)
    if (exercise) {
      exercise.aerobicLogs = exercise.aerobicLogs || []
      exercise.aerobicLogs.push(log)
      exercise.aerobicLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    newCardioEntry.value[exerciseId] = { distance: '', duration: '', heartRate: '', distanceUnit: 'miles' }
  }
}

const deleteCardioEntry = async (exerciseId, logId) => {
  const response = await fetch(`/api/cardio-logs/${logId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  })

  if (response.ok) {
    const exercise = currentWorkout.value.exercises.find(e => e.id === exerciseId)
    if (exercise && exercise.aerobicLogs) {
      exercise.aerobicLogs = exercise.aerobicLogs.filter(l => l.id !== logId)
    }
  }
}

const addFlexibilityLog = async (exerciseId) => {
  const entry = getNewCardioEntry(exerciseId)
  if (!entry.flexDuration) return
  
  const response = await fetch(`/api/exercises/${exerciseId}/flexibility-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify({
      durationMinutes: Math.round(parseInt(entry.flexDuration) / 60),
      notes: ''
    })
  })

  if (response.ok) {
    const log = await response.json()
    const exercise = currentWorkout.value.exercises.find(e => e.id === exerciseId)
    if (exercise) {
      exercise.flexibilityLogs = exercise.flexibilityLogs || []
      exercise.flexibilityLogs.push(log)
    }
    entry.flexDuration = ''
  }
}

const calculateAverageSpeed = (logs) => {
  const entriesWithBoth = logs.filter(l => l.distance && l.durationMinutes)
  if (entriesWithBoth.length === 0) return null
  
  const totalDistance = entriesWithBoth.reduce((sum, l) => sum + l.distance, 0)
  const totalDuration = entriesWithBoth.reduce((sum, l) => sum + l.durationMinutes, 0)
  
  if (totalDuration === 0) return null
  const speed = totalDistance / (totalDuration / 60)
  return speed.toFixed(2)
}

const calculateTotalStats = (logs) => {
  const totalDistance = logs.reduce((sum, l) => sum + (l.distance || 0), 0)
  const totalDuration = logs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0)
  const avgHeartRate = logs.filter(l => l.heartRate).length > 0
    ? Math.round(logs.filter(l => l.heartRate).reduce((sum, l) => sum + l.heartRate, 0) / logs.filter(l => l.heartRate).length)
    : null
  
  return { totalDistance, totalDuration, avgHeartRate }
}

const archiveWorkout = async (workoutId) => {
  const response = await fetch(`/api/routines/${route.params.id}/workouts/${workoutId}/archive`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  })

  if (response.ok) {
    await loadRoutine()
    if (showArchived.value) {
      await loadArchivedWorkouts()
    }
  }
}

const restoreWorkout = async (workoutId) => {
  const response = await fetch(`/api/routines/${route.params.id}/workouts/${workoutId}/unarchive`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  })

  if (response.ok) {
    await loadRoutine()
    await loadArchivedWorkouts()
  }
}

const toggleWorkoutSelection = (workoutId) => {
  if (selectedWorkouts.value.includes(workoutId)) {
    selectedWorkouts.value = selectedWorkouts.value.filter(id => id !== workoutId)
  } else {
    selectedWorkouts.value.push(workoutId)
  }
}

const selectAllPastWorkouts = () => {
  selectedWorkouts.value = pastWorkouts.value.map(w => w.id)
}

const clearSelection = () => {
  selectedWorkouts.value = []
}

const batchArchive = async () => {
  const response = await fetch(`/api/routines/${route.params.id}/workouts/batch-archive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify({
      workoutIds: selectedWorkouts.value.length > 0 ? selectedWorkouts.value : undefined,
      startDate: archiveFilter.value.startDate || undefined,
      endDate: archiveFilter.value.endDate || undefined,
      namePattern: archiveFilter.value.namePattern || undefined
    })
  })

  if (response.ok) {
    selectedWorkouts.value = []
    showArchivePanel.value = false
    await loadRoutine()
  }
}

const openArchivePanel = () => {
  showArchivePanel.value = true
  clearSelection()
}

const closeArchivePanel = () => {
  showArchivePanel.value = false
  clearSelection()
}

const toggleArchivedView = async () => {
  showArchived.value = !showArchived.value
  if (showArchived.value) {
    await loadArchivedWorkouts()
  }
}

const openSaveTemplateModal = (workout) => {
  saveTemplateData.value.name = `${workout.name} Template`
  saveTemplateData.value.description = `Created from ${workout.name}`
  saveTemplateData.value.isPublic = false
  saveTemplateData.value.workoutId = workout.id
  showSaveTemplateModal.value = true
}

const saveAsTemplate = async () => {
  if (!saveTemplateData.value.name.trim()) return
  
  savingTemplate.value = true
  try {
    const response = await fetch(`/api/templates/from-workout/${saveTemplateData.value.workoutId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        name: saveTemplateData.value.name,
        description: saveTemplateData.value.description,
        isPublic: saveTemplateData.value.isPublic
      })
    })
    
    if (response.ok) {
      showSaveTemplateModal.value = false
      saveTemplateData.value = { name: '', description: '', isPublic: false }
    }
  } finally {
    savingTemplate.value = false
  }
}

const closeSaveTemplateModal = () => {
  showSaveTemplateModal.value = false
  saveTemplateData.value = { name: '', description: '', isPublic: false }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <button
          class="text-blue-600 hover:underline mb-2"
          @click="router.push('/routines')"
        >
          ← Back to Routines
        </button>
        <h1 class="text-2xl font-bold">
          {{ routine?.name || 'Workout' }}
        </h1>
        <span class="text-sm text-gray-500 capitalize">{{ routine?.type }}</span>
      </div>
      <div class="flex gap-2">
        <button
          v-if="!showArchived"
          class="btn btn-secondary"
          @click="toggleArchivedView"
        >
          📦 View Archived ({{ routine?.workouts?.filter(w => w.archived)?.length || 0 }})
        </button>
        <button
          v-else
          class="btn btn-secondary"
          @click="toggleArchivedView"
        >
          ← Back to Active
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <template v-else>
      <template v-if="!showArchived">
        <div
          v-if="!currentWorkout"
          class="card text-center py-12"
        >
          <div class="text-5xl mb-4">
            🏋️
          </div>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Ready to start your workout?
          </p>
          <button
            class="btn btn-primary text-lg px-8 py-3"
            @click="startWorkout"
          >
            Start New Workout
          </button>
        </div>

        <div
          v-else
          class="space-y-6"
        >
          <div class="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-green-800 dark:text-green-200">
                  🔴 Workout in Progress
                </h2>
                <p class="text-sm text-green-600 dark:text-green-400">
                  {{ currentWorkout.name }}
                </p>
              </div>
              <button
                class="btn bg-green-600 hover:bg-green-700 text-white"
                @click="openCompletionModal"
              >
                ✅ Complete Workout
              </button>
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold mb-4">
              Add Exercise
            </h3>
            <div class="flex flex-col gap-3">
              <div class="flex flex-col sm:flex-row gap-2">
                <div class="relative flex-1">
                  <div class="flex gap-2">
                    <input
                      v-model="newExercise.name"
                      type="text"
                      class="input w-full"
                      placeholder="Select or type an exercise..."
                      @keyup.enter="addExercise"
                      @focus="showExerciseDropdown = true"
                      @blur="handleBlur"
                    >
                    <button
                      type="button"
                      class="btn btn-secondary px-3"
                      title="Show common exercises"
                      @click="toggleExerciseDropdown"
                    >
                      ▼
                    </button>
                  </div>
                  <div
                    v-if="showExerciseDropdown"
                    class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    style="top: 100%;"
                  >
                    <div class="p-2 border-b border-gray-100 dark:border-gray-700">
                      <input
                        v-model="newExercise.name"
                        type="text"
                        class="input w-full text-sm"
                        placeholder="Or type custom exercise name..."
                        @focus="$event.target.select()"
                      >
                    </div>
                    <div class="text-xs text-gray-500 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                      Common {{ newExercise.type }} exercises
                    </div>
                    <div
                      v-for="exercise in filteredCommonExercises"
                      :key="exercise.name"
                      class="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                      @mousedown.prevent="selectCommonExercise(exercise)"
                    >
                      <span>{{ exercise.name }}</span>
                      <span class="text-xs text-gray-400">{{ exercise.muscle || exercise.type }}</span>
                    </div>
                    <div
                      v-if="filteredCommonExercises.length === 0"
                      class="px-3 py-4 text-sm text-gray-500 text-center"
                    >
                      No common exercises for this type
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-row gap-2 items-center">
                <div class="relative">
                  <select
                    v-model="newExercise.type"
                    class="input"
                  >
                    <option value="strength">
                      Strength
                    </option>
                    <option value="cardio">
                      Cardio
                    </option>
                    <option value="flexibility">
                      Flexibility
                    </option>
                  </select>
                </div>
                <button
                  class="btn btn-primary flex-1 sm:flex-none"
                  :disabled="!newExercise.name.trim()"
                  @click="addExercise"
                >
                  Add Exercise
                </button>
              </div>
            </div>
          </div>

          <div
            v-for="exercise in currentWorkout.exercises"
            :key="exercise.id"
            class="card"
            role="region"
            :aria-label="`Exercise: ${exercise.name}`"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">
                {{ exercise.name }}
              </h3>
              <span
                class="text-xs text-gray-500 uppercase"
                aria-label="Exercise type"
              >{{ exercise.type }}</span>
            </div>

            <div
              v-if="exercise.type === 'strength'"
              class="space-y-2"
            >
              <div
                class="grid grid-cols-4 gap-2 text-sm font-medium text-gray-500 mb-2"
                role="row"
              >
                <span>Set <HelpIcon text="One completion of an exercise movement" /></span>
                <span>Reps <HelpIcon text="Number of times you perform the movement in each set" /></span>
                <span>Weight <HelpIcon text="Amount of resistance used (lb or kg)" /></span>
                <span>RPE <HelpIcon text="Rate of Perceived Exertion (1-10 scale, how hard it felt)" /></span>
              </div>
              
              <div
                v-for="(set, idx) in exercise.sets"
                :key="set.id"
                class="grid grid-cols-5 gap-2 items-center p-2 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
                :class="set.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'"
                :aria-label="`Set ${idx + 1}: ${set.reps} reps, ${set.weight} ${profile.weightUnit}, RPE ${set.rpe || 'not set'}${set.completed ? ', completed' : ''}`"
                role="row"
                tabindex="0"
                @click="toggleSetComplete(set)"
                @keydown.enter="toggleSetComplete(set)"
                @keydown.space.prevent="toggleSetComplete(set)"
              >
                <span class="font-medium">{{ idx + 1 }}</span>
                <span>{{ set.reps }}</span>
                <span>{{ set.weight }} {{ profile.weightUnit }}</span>
                <span>{{ set.rpe || '-' }}</span>
                <span
                  class="text-center"
                  :aria-label="set.completed ? 'Completed' : 'Not completed'"
                >{{ set.completed ? '✓' : '' }}</span>
              </div>

              <div
                class="flex flex-col sm:flex-row gap-2 mt-4"
                role="group"
                :aria-label="`Add set for ${exercise.name}`"
              >
                <div>
                  <label
                    :for="`reps-${exercise.id}`"
                    class="sr-only"
                  >Reps</label>
                  <input
                    :id="`reps-${exercise.id}`"
                    v-model="getNewSet(exercise.id).reps"
                    type="number"
                    class="input w-full sm:w-28"
                    placeholder="# reps"
                    aria-label="Reps"
                  >
                </div>
                <div>
                  <label
                    :for="`weight-${exercise.id}`"
                    class="sr-only"
                  >Weight</label>
                  <input
                    :id="`weight-${exercise.id}`"
                    v-model="getNewSet(exercise.id).weight"
                    type="number"
                    step="0.5"
                    class="input w-full sm:w-32"
                    :placeholder="profile.weightUnit || 'lb'"
                    aria-label="Weight"
                  >
                </div>
                <div>
                  <label
                    :for="`rpe-${exercise.id}`"
                    class="sr-only"
                  >RPE</label>
                  <input
                    :id="`rpe-${exercise.id}`"
                    v-model="getNewSet(exercise.id).rpe"
                    type="number"
                    min="1"
                    max="10"
                    class="input w-full sm:w-20"
                    placeholder="RPE 1-10"
                    aria-label="Rate of perceived exertion"
                  >
                </div>
                <button
                  class="btn btn-primary"
                  type="button"
                  @click="addSet(exercise.id)"
                >
                  + Set
                </button>
              </div>
            </div>

            <div
              v-else
              class="space-y-4"
            >
              <div
                v-if="exercise.aerobicLogs?.length > 0"
                class="space-y-3"
              >
                <div class="flex items-center justify-between text-sm font-medium text-gray-500 border-b pb-2">
                  <span>Cardio Log</span>
                  <div class="flex gap-4">
                    <span v-if="calculateAverageSpeed(exercise.aerobicLogs)">
                      Avg: {{ calculateAverageSpeed(exercise.aerobicLogs) }} mph
                    </span>
                    <span>
                      Total: {{ calculateTotalStats(exercise.aerobicLogs).totalDistance.toFixed(2) }} {{ exercise.aerobicLogs[0]?.distanceUnit || 'mi' }}
                      / {{ calculateTotalStats(exercise.aerobicLogs).totalDuration }} min
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-4 gap-2 text-sm font-medium text-gray-500 mb-2">
                  <span>Distance</span>
                  <span>Time (min)</span>
                  <span>Heart Rate</span>
                  <span />
                </div>

                <div
                  v-for="(log) in exercise.aerobicLogs"
                  :key="log.id"
                  class="grid grid-cols-4 gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span>{{ log.distance || '-' }} {{ log.distanceUnit || 'mi' }}</span>
                  <span>{{ log.durationMinutes || '-' }} min</span>
                  <span>{{ log.heartRate ? log.heartRate + ' bpm' : '-' }}</span>
                  <button
                    class="text-red-500 hover:text-red-700 text-sm"
                    type="button"
                    @click="deleteCardioEntry(exercise.id, log.id)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div class="border-t pt-4">
                <div class="text-sm font-medium text-gray-500 mb-2">
                  Add Entry
                </div>
                <div class="flex flex-col sm:flex-row gap-2 items-end">
                  <div class="flex-1">
                    <label
                      :for="`distance-${exercise.id}`"
                      class="sr-only"
                    >Distance</label>
                    <input
                      :id="`distance-${exercise.id}`"
                      v-model="getNewCardioEntry(exercise.id).distance"
                      type="number"
                      step="0.01"
                      class="input w-full"
                      placeholder="Distance"
                      aria-label="Distance"
                    >
                  </div>
                  <div class="w-24">
                    <label
                      :for="`unit-${exercise.id}`"
                      class="sr-only"
                    >Unit</label>
                    <select
                      :id="`unit-${exercise.id}`"
                      v-model="getNewCardioEntry(exercise.id).distanceUnit"
                      class="input w-full"
                      aria-label="Distance unit"
                    >
                      <option value="miles">
                        mi
                      </option>
                      <option value="km">
                        km
                      </option>
                      <option value="meters">
                        m
                      </option>
                    </select>
                  </div>
                  <div class="w-28">
                    <label
                      :for="`duration-${exercise.id}`"
                      class="sr-only"
                    >Duration</label>
                    <input
                      :id="`duration-${exercise.id}`"
                      v-model="getNewCardioEntry(exercise.id).duration"
                      type="number"
                      class="input w-full"
                      placeholder="Time (min)"
                      aria-label="Duration in minutes"
                    >
                  </div>
                  <div class="w-28">
                    <label
                      :for="`hr-${exercise.id}`"
                      class="sr-only"
                    >Heart Rate</label>
                    <input
                      :id="`hr-${exercise.id}`"
                      v-model="getNewCardioEntry(exercise.id).heartRate"
                      type="number"
                      class="input w-full"
                      placeholder="BPM"
                      aria-label="Heart rate in BPM"
                    >
                  </div>
                  <button
                    class="btn btn-primary"
                    type="button"
                    @click="addCardioEntry(exercise.id)"
                  >
                    + Entry
                  </button>
                </div>
                <p
                  v-if="getNewCardioEntry(exercise.id).distance && getNewCardioEntry(exercise.id).duration"
                  class="text-xs text-gray-500 mt-1"
                >
                  Pace: {{ (parseFloat(getNewCardioEntry(exercise.id).duration) / parseFloat(getNewCardioEntry(exercise.id).distance)).toFixed(2) }} min/{{ getNewCardioEntry(exercise.id).distanceUnit }}
                </p>
              </div>

              <div
                v-if="exercise.type === 'flexibility'"
                class="mt-4"
              >
                <div class="text-sm font-medium text-gray-500 mb-2">
                  Flexibility Log
                </div>
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label
                      :for="`flex-duration-${exercise.id}`"
                      class="sr-only"
                    >Duration</label>
                    <input
                      :id="`flex-duration-${exercise.id}`"
                      v-model="getNewCardioEntry(exercise.id).flexDuration"
                      type="number"
                      class="input w-full"
                      placeholder="Duration (sec)"
                      aria-label="Duration in seconds"
                    >
                  </div>
                  <button
                    class="btn btn-secondary"
                    type="button"
                    @click="addFlexibilityLog(exercise.id)"
                  >
                    Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="incompleteWorkouts.length > 0 && !currentWorkout"
          class="card border-yellow-200 dark:border-yellow-800"
        >
          <h3 class="font-semibold mb-4 text-yellow-700 dark:text-yellow-400">
            ⏸️ Incomplete Workouts
          </h3>
          <div class="space-y-2">
            <div
              v-for="workout in incompleteWorkouts"
              :key="workout.id"
              class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
            >
              <div>
                <span class="font-medium">{{ workout.name }}</span>
                <span class="ml-2 text-sm text-gray-500">
                  Started {{ new Date(workout.createdAt).toLocaleDateString() }}
                </span>
              </div>
              <button
                class="btn btn-secondary"
                @click="continueWorkout(workout)"
              >
                ▶ Continue
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="pastWorkouts.length > 0"
          class="card"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">
              📋 Past Workouts ({{ pastWorkouts.length }})
            </h3>
            <button
              class="btn btn-secondary text-sm"
              @click="openArchivePanel"
            >
              📦 Archive
            </button>
          </div>

          <div
            v-if="showArchivePanel"
            class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium">
                Select workouts to archive:
              </h4>
              <div class="flex gap-2">
                <button
                  class="text-sm text-blue-600 hover:underline"
                  @click="selectAllPastWorkouts"
                >
                  Select All
                </button>
                <button
                  v-if="selectedWorkouts.length > 0"
                  class="text-sm text-gray-500 hover:underline"
                  @click="clearSelection"
                >
                  Clear
                </button>
              </div>
            </div>

            <div
              v-if="selectedWorkouts.length > 0"
              class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm"
            >
              {{ selectedWorkouts.length }} workout(s) selected
            </div>

            <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Or filter by:
            </div>
            <div class="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label class="text-sm">Start Date</label>
                <input
                  v-model="archiveFilter.startDate"
                  type="date"
                  class="input w-full text-sm"
                >
              </div>
              <div>
                <label class="text-sm">End Date</label>
                <input
                  v-model="archiveFilter.endDate"
                  type="date"
                  class="input w-full text-sm"
                >
              </div>
              <div>
                <label class="text-sm">Name contains</label>
                <input
                  v-model="archiveFilter.namePattern"
                  type="text"
                  class="input w-full text-sm"
                  placeholder="e.g., 'Push'"
                >
              </div>
            </div>

            <div class="flex gap-2">
              <button
                class="btn btn-primary"
                @click="batchArchive"
              >
                Archive Selected/Filtered
              </button>
              <button
                class="btn btn-secondary"
                @click="closeArchivePanel"
              >
                Cancel
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="workout in pastWorkouts"
              :key="workout.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              :class="selectedWorkouts.includes(workout.id) ? 'ring-2 ring-blue-500' : ''"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :checked="selectedWorkouts.includes(workout.id)"
                  class="w-4 h-4"
                  @change="toggleWorkoutSelection(workout.id)"
                >
                <div>
                  <span class="font-medium">{{ workout.name }}</span>
                  <span class="ml-2 text-sm text-gray-500">
                    ✓ {{ formatCompletionDate(workout.completedAt) }}
                  </span>
                  <span class="ml-2 text-xs text-gray-400">
                    {{ workout.exercises?.length || 0 }} exercises
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="btn btn-secondary text-sm"
                  @click="continueWorkout(workout)"
                >
                  📋 Continue
                </button>
                <button
                  class="btn btn-secondary text-sm"
                  title="Edit completion time"
                  @click="openEditCompletionModal(workout)"
                >
                  🕐
                </button>
                <button
                  class="btn btn-secondary text-sm"
                  title="Save as Template"
                  @click="openSaveTemplateModal(workout)"
                >
                  📄 Template
                </button>
                <button
                  class="text-gray-400 hover:text-red-500"
                  title="Archive"
                  @click="archiveWorkout(workout.id)"
                >
                  📦
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">
              📦 Archived Workouts ({{ archivedWorkouts.length }})
            </h3>
          </div>

          <div
            v-if="archivedWorkouts.length === 0"
            class="text-center py-8 text-gray-500"
          >
            No archived workouts
          </div>

          <div
            v-else
            class="space-y-2"
          >
            <div
              v-for="workout in archivedWorkouts"
              :key="workout.id"
              class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <span class="font-medium">{{ workout.name }}</span>
                <span class="ml-2 text-sm text-gray-500">
                  {{ new Date(workout.completedAt || workout.createdAt).toLocaleDateString() }}
                </span>
              </div>
              <button
                class="btn btn-secondary text-sm"
                @click="restoreWorkout(workout.id)"
              >
                ↩️ Restore
              </button>
            </div>
          </div>
        </div>
      </template>
    </template>

    <div
      v-if="showSaveTemplateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeSaveTemplateModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-4">
          Save as Template
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Template Name</label>
            <input
              v-model="saveTemplateData.name"
              type="text"
              class="input w-full"
              placeholder="My Workout Template"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-model="saveTemplateData.description"
              class="input w-full"
              rows="3"
              placeholder="Describe this template..."
            />
          </div>
          
          <div class="flex items-center gap-2">
            <input
              id="isPublicTemplate"
              v-model="saveTemplateData.isPublic"
              type="checkbox"
              class="w-4 h-4"
            >
            <label
              for="isPublicTemplate"
              class="text-sm"
            >Make this template public</label>
          </div>
        </div>
        
        <div class="flex gap-2 mt-6">
          <button
            class="btn btn-primary flex-1"
            :disabled="savingTemplate || !saveTemplateData.name.trim()"
            @click="saveAsTemplate"
          >
            {{ savingTemplate ? 'Saving...' : 'Save Template' }}
          </button>
          <button
            class="btn btn-secondary"
            @click="closeSaveTemplateModal"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showCompletionModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeCompletionModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-2">
          {{ editingCompletedWorkoutId ? 'Edit Completion Time' : 'Complete Workout' }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          When did you actually finish this workout? You can log it after the fact.
        </p>

        <label class="block text-sm font-medium mb-1">Completed at</label>
        <input
          v-model="completionInput"
          type="datetime-local"
          class="input w-full"
        >

        <div class="flex gap-2 mt-6">
          <button
            class="btn bg-green-600 hover:bg-green-700 text-white flex-1"
            :disabled="savingCompletion || !completionInput"
            @click="confirmCompletion"
          >
            {{ savingCompletion ? 'Saving...' : (editingCompletedWorkoutId ? 'Save Time' : 'Complete Workout') }}
          </button>
          <button
            class="btn btn-secondary"
            @click="closeCompletionModal"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
