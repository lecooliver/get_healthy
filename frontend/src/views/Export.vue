<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const exporting = ref(false)
const exportSuccess = ref('')
const exportError = ref('')

const exportData = async (format) => {
  exporting.value = true
  exportError.value = ''
  exportSuccess.value = ''

  try {
    const response = await fetch(`/api/export/${format}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })

    if (!response.ok) throw new Error('Export failed')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `get_healthy_export.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    exportSuccess.value = `${format.toUpperCase()} export downloaded successfully!`
  } catch (error) {
    exportError.value = error.message
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">
      Export Your Data
    </h1>

    <div
      v-if="exportError"
      class="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
    >
      {{ exportError }}
    </div>

    <div
      v-if="exportSuccess"
      class="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"
    >
      {{ exportSuccess }}
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-2">
        Export All Your Data
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Download a complete copy of all your fitness data including measurements, workouts, and routines.
      </p>

      <div class="space-y-4">
        <button
          class="btn btn-primary w-full justify-center"
          :disabled="exporting"
          @click="exportData('json')"
        >
          📄 Download JSON Export
        </button>

        <button
          class="btn btn-secondary w-full justify-center"
          :disabled="exporting"
          @click="exportData('csv')"
        >
          📊 Download CSV Export (Measurements)
        </button>
      </div>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-2">
        About Your Data
      </h2>
      <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li>• <strong>JSON Export:</strong> Complete data backup including all measurements, routines, workouts, and exercise logs. Best for data portability or importing into other apps.</li>
        <li>• <strong>CSV Export:</strong> Spreadsheet-compatible format of your body measurements over time. Best for viewing in Excel or Google Sheets.</li>
        <li>• All exports are generated in real-time from your current data.</li>
      </ul>
    </div>

    <div class="card border border-orange-200 dark:border-orange-800">
      <h2 class="text-lg font-semibold mb-2 text-orange-600">
        ⚠️ Data Deletion
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        If you want to permanently delete all your data, you can do so from your Profile settings.
      </p>
      <RouterLink
        to="/profile"
        class="btn btn-secondary"
      >
        Go to Profile Settings
      </RouterLink>
    </div>
  </div>
</template>
