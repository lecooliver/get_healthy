<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const templates = ref([])
const loading = ref(true)
const starting = ref(null)
const filterType = ref('all')
const filterGoal = ref('all')
const showCreateModal = ref(false)
const creating = ref(false)
const newTemplate = ref({
  name: '',
  description: '',
  type: 'weightlifting',
  difficulty: 'beginner',
  isPublic: false,
  workouts: [{ name: 'Workout 1', exerciseGroups: [{ name: 'Main Exercises', exercises: [{ name: '', type: 'strength', defaultSets: 3, defaultReps: 10 }] }] }]
})

const types = ['all', 'weightlifting', 'aerobic', 'flexibility', 'combination']
const goals = ['all', 'strength', 'endurance', 'flexibility', 'weight_loss', 'general_fitness']

const goalLabels = {
  strength: 'Strength',
  endurance: 'Endurance',
  flexibility: 'Flexibility',
  weight_loss: 'Weight Loss',
  hypertrophy: 'Hypertrophy',
  recovery: 'Recovery',
  general_fitness: 'General Fitness'
}

onMounted(async () => {
  await loadTemplates()
})

const loadTemplates = async () => {
  try {
    const response = await fetch('/api/templates', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      templates.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
  } finally {
    loading.value = false
  }
}

const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const typeMatch = filterType.value === 'all' || t.type === filterType.value
    const goalMatch = filterGoal.value === 'all' || t.goals?.includes(filterGoal.value)
    return typeMatch && goalMatch
  })
})

const startFromTemplate = async (template) => {
  starting.value = template.id
  try {
    const response = await fetch(`/api/templates/${template.id}/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (response.ok) {
      router.push('/routines')
    }
  } catch (error) {
    console.error('Failed to start from template:', error)
  } finally {
    starting.value = null
  }
}

const getTypeIcon = (type) => {
  const icons = {
    weightlifting: '🏋️',
    aerobic: '🏃',
    flexibility: '🧘',
    combination: '💪'
  }
  return icons[type] || '💪'
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[difficulty] || colors.beginner
}

const getGoalLabel = (goal) => {
  return goalLabels[goal] || goal
}

const getExerciseCount = (template) => {
  return template.workouts?.reduce((sum, w) =>
    sum + (w.exerciseGroups?.reduce((groupSum, g) => groupSum + (g.exercises?.length || 0), 0) || 0), 0
  ) || 0
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newTemplate.value = {
    name: '',
    description: '',
    type: 'weightlifting',
    difficulty: 'beginner',
    isPublic: false,
    workouts: [{ name: 'Workout 1', exerciseGroups: [{ name: 'Main Exercises', exercises: [{ name: '', type: 'strength', defaultSets: 3, defaultReps: 10 }] }] }]
  }
}

const addWorkout = () => {
  newTemplate.value.workouts.push({
    name: `Workout ${newTemplate.value.workouts.length + 1}`,
    exerciseGroups: [{ name: 'Main Exercises', exercises: [{ name: '', type: 'strength', defaultSets: 3, defaultReps: 10 }] }]
  })
}

const removeWorkout = (index) => {
  if (newTemplate.value.workouts.length > 1) {
    newTemplate.value.workouts.splice(index, 1)
  }
}

const addExerciseGroup = (workoutIndex) => {
  newTemplate.value.workouts[workoutIndex].exerciseGroups.push({
    name: `Group ${newTemplate.value.workouts[workoutIndex].exerciseGroups.length + 1}`,
    exercises: [{ name: '', type: 'strength', defaultSets: 3, defaultReps: 10 }]
  })
}

const removeExerciseGroup = (workoutIndex, groupIndex) => {
  if (newTemplate.value.workouts[workoutIndex].exerciseGroups.length > 1) {
    newTemplate.value.workouts[workoutIndex].exerciseGroups.splice(groupIndex, 1)
  }
}

const addExercise = (workoutIndex, groupIndex) => {
  newTemplate.value.workouts[workoutIndex].exerciseGroups[groupIndex].exercises.push({
    name: '',
    type: 'strength',
    defaultSets: 3,
    defaultReps: 10
  })
}

const removeExercise = (workoutIndex, groupIndex, exerciseIndex) => {
  if (newTemplate.value.workouts[workoutIndex].exerciseGroups[groupIndex].exercises.length > 1) {
    newTemplate.value.workouts[workoutIndex].exerciseGroups[groupIndex].exercises.splice(exerciseIndex, 1)
  }
}

const createTemplate = async () => {
  if (!newTemplate.value.name.trim()) return
  
  creating.value = true
  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        name: newTemplate.value.name,
        description: newTemplate.value.description,
        type: newTemplate.value.type,
        difficulty: newTemplate.value.difficulty,
        isPublic: newTemplate.value.isPublic,
        workouts: newTemplate.value.workouts
          .filter(w => w.exerciseGroups.some(g => g.exercises.some(e => e.name.trim())))
          .map(w => ({
            name: w.name,
            exerciseGroups: w.exerciseGroups
              .filter(g => g.exercises.some(e => e.name.trim()))
              .map(g => ({
                name: g.name,
                exercises: g.exercises.filter(e => e.name.trim())
              }))
          }))
      })
    })
    
    if (response.ok) {
      await loadTemplates()
      closeCreateModal()
    }
  } catch (error) {
    console.error('Failed to create template:', error)
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Workout Templates
      </h1>
      <button
        class="btn btn-primary"
        @click="openCreateModal"
      >
        + Create Template
      </button>
    </div>

    <div class="flex flex-wrap gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Type</label>
        <select
          v-model="filterType"
          class="input"
        >
          <option
            v-for="t in types"
            :key="t"
            :value="t"
          >
            {{ t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Goal</label>
        <select
          v-model="filterGoal"
          class="input"
        >
          <option
            v-for="g in goals"
            :key="g"
            :value="g"
          >
            {{ g === 'all' ? 'All Goals' : getGoalLabel(g) }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <div
      v-else-if="filteredTemplates.length === 0"
      class="card text-center py-12"
    >
      <div class="text-5xl mb-4">
        📋
      </div>
      <p class="text-gray-600 dark:text-gray-400">
        No templates found
      </p>
      <p class="text-sm text-gray-500 mt-2">
        Check back later or create your own template
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="startFromTemplate(template)"
      >
        <div class="flex items-start gap-3 mb-3">
          <span class="text-3xl">{{ getTypeIcon(template.type) }}</span>
          <div class="flex-1">
            <h3 class="font-semibold">
              {{ template.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ template.description }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span
            class="px-2 py-1 text-xs rounded capitalize"
            :class="getDifficultyColor(template.difficulty)"
          >
            {{ template.difficulty }}
          </span>
          <span
            v-for="goal in template.goals"
            :key="goal"
            class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded capitalize"
          >
            {{ getGoalLabel(goal) }}
          </span>
        </div>

        <div
          v-if="template.workouts?.length > 0"
          class="text-sm text-gray-500 mb-4"
        >
          {{ template.workouts.length }} workout(s) • {{ getExerciseCount(template) }} exercises
        </div>

        <button
          :disabled="starting === template.id"
          class="btn btn-primary w-full"
        >
          {{ starting === template.id ? 'Creating...' : 'Use This Template' }}
        </button>
      </div>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeCreateModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            Create New Template
          </h3>
          <button
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            @click="closeCreateModal"
          >
            ✕
          </button>
        </div>
        
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Template Name</label>
            <input
              v-model="newTemplate.name"
              type="text"
              class="input w-full"
              placeholder="My Custom Template"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-model="newTemplate.description"
              class="input w-full"
              rows="2"
              placeholder="Describe this template..."
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Type</label>
              <select
                v-model="newTemplate.type"
                class="input w-full"
              >
                <option value="weightlifting">
                  Weightlifting
                </option>
                <option value="aerobic">
                  Aerobic
                </option>
                <option value="flexibility">
                  Flexibility
                </option>
                <option value="combination">
                  Combination
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Difficulty</label>
              <select
                v-model="newTemplate.difficulty"
                class="input w-full"
              >
                <option value="beginner">
                  Beginner
                </option>
                <option value="intermediate">
                  Intermediate
                </option>
                <option value="advanced">
                  Advanced
                </option>
              </select>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <input
              id="isPublic"
              v-model="newTemplate.isPublic"
              type="checkbox"
              class="w-4 h-4"
            >
            <label
              for="isPublic"
              class="text-sm"
            >Make this template public</label>
          </div>
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium">
                Workouts
              </h4>
              <button
                class="btn btn-secondary text-sm"
                @click="addWorkout"
              >
                + Add Workout
              </button>
            </div>
            
            <div
              v-for="(workout, wi) in newTemplate.workouts"
              :key="wi"
              class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div class="flex items-center gap-2 mb-2">
                <input
                  v-model="workout.name"
                  type="text"
                  class="input flex-1"
                  placeholder="Workout name"
                >
                <button
                  v-if="newTemplate.workouts.length > 1"
                  class="text-red-500 hover:text-red-700 text-sm"
                  @click="removeWorkout(wi)"
                >
                  Remove
                </button>
              </div>
              
              <div class="ml-2 mt-2">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">Exercise Groups</span>
                  <button
                    class="btn btn-secondary text-xs"
                    @click="addExerciseGroup(wi)"
                  >
                    + Add Group
                  </button>
                </div>
                
                <div
                  v-for="(group, gi) in workout.exerciseGroups"
                  :key="gi"
                  class="mb-3 p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <input
                      v-model="group.name"
                      type="text"
                      class="input flex-1 text-sm"
                      placeholder="Group name"
                    >
                    <button
                      v-if="workout.exerciseGroups.length > 1"
                      class="text-red-500 hover:text-red-700 text-xs"
                      @click="removeExerciseGroup(wi, gi)"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div
                    v-for="(exercise, ei) in group.exercises"
                    :key="ei"
                    class="flex items-center gap-2 mb-2 ml-2"
                  >
                    <input
                      v-model="exercise.name"
                      type="text"
                      class="input flex-1 text-sm"
                      placeholder="Exercise name"
                    >
                    <select
                      v-model="exercise.type"
                      class="input w-24 text-sm"
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
                    <input
                      v-model.number="exercise.defaultSets"
                      type="number"
                      class="input w-14 text-sm"
                      placeholder="Sets"
                    >
                    <input
                      v-model.number="exercise.defaultReps"
                      type="number"
                      class="input w-14 text-sm"
                      placeholder="Reps"
                    >
                    <button
                      v-if="group.exercises.length > 1"
                      class="text-red-500 hover:text-red-700 text-xs"
                      @click="removeExercise(wi, gi, ei)"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <button
                    class="text-xs text-blue-600 hover:text-blue-800 ml-2"
                    @click="addExercise(wi, gi)"
                  >
                    + Add Exercise
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            class="btn btn-primary flex-1"
            :disabled="creating || !newTemplate.name.trim()"
            @click="createTemplate"
          >
            {{ creating ? 'Creating...' : 'Create Template' }}
          </button>
          <button
            class="btn btn-secondary"
            @click="closeCreateModal"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
