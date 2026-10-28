<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const template = ref(null)
const loading = ref(true)

onMounted(async () => {
  await loadTemplate()
})

const loadTemplate = async () => {
  try {
    const response = await fetch(`/api/templates/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      template.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load template:', error)
  } finally {
    loading.value = false
  }
}

const startFromTemplate = async () => {
  try {
    const response = await fetch(`/api/templates/${route.params.id}/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (response.ok) {
      router.push('/routines')
    }
  } catch (error) {
    console.error('Failed to start from template:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <button
      class="text-blue-600 hover:underline"
      @click="router.push('/templates')"
    >
      ← Back to Templates
    </button>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <template v-else-if="template">
      <div class="card">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold">
              {{ template.name }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              {{ template.description }}
            </p>
          </div>
          <button
            class="btn btn-primary"
            @click="startFromTemplate"
          >
            Start This Template
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm capitalize">
            {{ template.type }}
          </span>
          <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm capitalize">
            {{ template.difficulty }}
          </span>
          <span
            v-for="goal in template.goals"
            :key="goal"
            class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm capitalize"
          >
            {{ goal.replace('_', ' ') }}
          </span>
        </div>
      </div>

      <div
        v-for="workout in template.workouts"
        :key="workout.id"
        class="card"
      >
        <h2 class="text-lg font-semibold mb-4">
          {{ workout.name }}
        </h2>
        
        <div
          v-if="workout.exerciseGroups?.length > 0"
          class="space-y-4"
        >
          <div
            v-for="group in workout.exerciseGroups"
            :key="group.id"
            class="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
          >
            <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ group.name }}
            </h3>
            
            <div
              v-if="group.exercises?.length > 0"
              class="space-y-2"
            >
              <div
                v-for="(exercise, idx) in group.exercises"
                :key="exercise.id"
                class="flex items-center gap-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span class="text-gray-400 font-medium w-6">{{ idx + 1 }}</span>
                <div class="flex-1">
                  <div class="font-medium">
                    {{ exercise.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    <span v-if="exercise.defaultSets && exercise.defaultReps">
                      {{ exercise.defaultSets }} × {{ exercise.defaultReps }} reps
                    </span>
                    <span v-if="exercise.restSeconds">
                      • {{ exercise.restSeconds }}s rest
                    </span>
                    <span v-if="exercise.durationMinutes">
                      {{ exercise.durationMinutes }} min
                    </span>
                  </div>
                </div>
                <span class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded capitalize">
                  {{ exercise.type }}
                </span>
              </div>
            </div>
            <div
              v-else
              class="text-gray-500 text-sm py-2"
            >
              No exercises
            </div>
          </div>
        </div>
        <div
          v-else
          class="text-gray-500 text-center py-4"
        >
          No exercise groups
        </div>
      </div>
    </template>
  </div>
</template>
