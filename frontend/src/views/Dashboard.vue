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
  "Every workout counts! Keep pushing forward.",
  "Your body can do it. It's your mind you need to convince.",
  "The only bad workout is the one that didn't happen.",
  "Small progress is still progress.",
  "Consistency beats perfection.",
  "You're stronger than you think.",
  "One day at a time, one rep at a time.",
  "Champions train, losers complain.",
  "Your health is an investment, not an expense.",
  "The pain you feel today will be the strength you feel tomorrow."
]

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
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
    console.error('Failed to load dashboard data:', error)
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
          {{ greeting }}, {{ authStore.user?.displayName || 'Athlete' }}
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
            Workouts This Week
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
            Total Workouts
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
            Day Streak
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
            Calories Burned
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">
            Quick Actions
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
                Start Workout
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
                Browse Templates
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
                Log Measurements
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
                View Progress
              </div>
            </RouterLink>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold mb-4">
            Recent Activity
          </h2>
          <div
            v-if="recentActivity.length === 0"
            class="text-center py-8 text-gray-500"
          >
            <div class="text-4xl mb-2">
              🏃
            </div>
            <p>No recent activity yet. Start your first workout!</p>
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
