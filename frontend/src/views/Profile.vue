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
    console.error('Failed to load profile:', err)
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
    
    if (!response.ok) throw new Error('Failed to upload avatar')
    
    const data = await response.json()
    avatarUrl.value = data.avatarUrl
    authStore.updateAvatar(data.avatarUrl)
    success.value = 'Avatar updated successfully'
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
    
    if (!response.ok) throw new Error('Failed to update profile')
    
    authStore.updateUser(profile.value)
    success.value = 'Profile updated successfully'
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
    
    if (!response.ok) throw new Error('Failed to delete data')
    
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
    'Test Notification',
    'Notifications are working correctly!'
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
    console.error('Failed to load limits:', err)
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
    console.error('Failed to load profile:', err)
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
    console.error('Failed to add limit:', err)
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
    console.error('Failed to delete limit:', err)
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
      Profile Settings
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
        Profile Picture
      </h2>
      <div class="flex items-center gap-6">
        <div class="relative flex-shrink-0">
          <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              alt="Profile picture"
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
            <span class="sr-only">Upload photo</span>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              :disabled="saving"
              aria-label="Upload profile picture"
              @change="handleAvatarChange"
            >
          </label>
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Upload a photo to personalize your profile
          </p>
          <p class="text-xs text-gray-500">
            Recommended: Square image, at least 200x200 pixels
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-4">
        Personal Information
      </h2>
      <form
        class="space-y-4"
        @submit.prevent="saveProfile"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Display Name</label>
          <input
            v-model="profile.displayName"
            type="text"
            class="input"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Height</label>
          <input
            v-model="profile.height"
            type="number"
            step="0.1"
            class="input"
            placeholder="inches"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Age</label>
          <input
            v-model="profile.age"
            type="number"
            class="input"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Current Weight</label>
          <input
            v-model="profile.weight"
            type="number"
            step="0.1"
            class="input"
            :placeholder="'in ' + profile.weightUnit"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Preferred Weight Unit</label>
          <select
            v-model="profile.weightUnit"
            class="input"
          >
            <option value="lb">
              Pounds (lb)
            </option>
            <option value="kg">
              Kilograms (kg)
            </option>
          </select>
        </div>
        
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-4">
        Appearance
      </h2>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">
            Theme
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Currently: {{ uiStore.theme === 'dark' ? 'Dark' : 'Light' }}
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class="btn"
            :class="uiStore.theme === 'light' ? 'btn-primary' : 'btn-secondary'"
            @click="uiStore.setTheme('light')"
          >
            ☀️ Light
          </button>
          <button
            class="btn"
            :class="uiStore.theme === 'dark' ? 'btn-primary' : 'btn-secondary'"
            @click="uiStore.setTheme('dark')"
          >
            🌙 Dark
          </button>
          <button
            class="btn"
            :class="uiStore.theme === 'system' ? 'btn-primary' : 'btn-secondary'"
            @click="uiStore.setTheme('system')"
          >
            💻 System
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="notificationStore.isSupported"
      class="card"
    >
      <h2 class="text-lg font-semibold mb-4">
        Notifications
      </h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">
              Push Notifications
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Get reminders for scheduled workouts
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
          Notifications are blocked. Please enable them in your browser settings.
        </div>
        
        <div v-else-if="notificationStore.enabled">
          <button
            class="btn btn-secondary text-sm"
            @click="testNotification"
          >
            Send Test Notification
          </button>
        </div>
        
        <div
          v-else
          class="text-sm text-gray-500"
        >
          Click the toggle above to enable notifications.
        </div>
      </div>
    </div>
    
    <div
      v-else
      class="card"
    >
      <h2 class="text-lg font-semibold mb-4">
        Notifications
      </h2>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Push notifications are not available. This feature requires HTTPS and browser notification support.
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">
          Exercise Limits
        </h2>
        <button
          class="btn btn-primary text-sm"
          @click="showAddLimit = true"
        >
          + Add Limit
        </button>
      </div>
      
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Set upper and lower limits for exercises to get warnings when exceeded.
      </p>
      
      <div
        v-if="limits.length === 0"
        class="text-center py-6 text-gray-500"
      >
        No limits set. Add a limit to track exercise boundaries.
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
              <span class="text-xs">{{ limit.limitType === 'upper' ? 'Max' : 'Min' }}:</span>
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
          Add New Limit
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Exercise Name</label>
            <input
              v-model="newLimit.exerciseName"
              type="text"
              class="input w-full"
              placeholder="e.g., Squat"
            >
          </div>
          <div>
            <label class="block text-sm mb-1">Limit Type</label>
            <select
              v-model="newLimit.limitType"
              class="input w-full"
            >
              <option value="upper">
                Upper Limit (Max)
              </option>
              <option value="lower">
                Lower Limit (Min)
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">Value</label>
            <input
              v-model="newLimit.value"
              type="number"
              step="0.5"
              class="input w-full"
              placeholder="e.g., 225"
            >
          </div>
          <div>
            <label class="block text-sm mb-1">Unit</label>
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
                reps
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
            Add Limit
          </button>
          <button
            class="btn btn-secondary"
            @click="showAddLimit = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div class="card border-2 border-red-200 dark:border-red-800">
      <h2 class="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
        Danger Zone
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Permanently delete all your data. This action cannot be undone.
      </p>
      <div v-if="!showDeleteConfirm">
        <button
          class="btn btn-danger"
          @click="showDeleteConfirm = true"
        >
          Delete All My Data
        </button>
      </div>
      <div
        v-else
        class="space-y-3"
      >
        <p class="font-medium text-red-600 dark:text-red-400">
          Are you absolutely sure? This will delete:
        </p>
        <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
          <li>Your profile and settings</li>
          <li>All measurements</li>
          <li>All routines and workouts</li>
          <li>All templates</li>
        </ul>
        <div class="flex gap-2">
          <button
            class="btn btn-danger"
            :disabled="deleting"
            @click="deleteAllData"
          >
            {{ deleting ? 'Deleting...' : 'Yes, Delete Everything' }}
          </button>
          <button
            class="btn btn-secondary"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
