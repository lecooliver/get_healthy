<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleVerify = async () => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (!token) {
    error.value = 'Invalid verification link. Please check your email for the correct link.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/email/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Verification failed')
    }

    success.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  handleVerify()
})
</script>

<template>
  <div class="w-full max-w-md p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
        Get Healthy
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Email Verification
      </p>
    </div>
    
    <div class="card">
      <div
        v-if="loading"
        class="text-center py-8"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">
          Verifying your email...
        </p>
      </div>

      <div
        v-else-if="success"
        class="text-center space-y-4"
      >
        <div class="text-5xl mb-4">
          ✅
        </div>
        <h2 class="text-xl font-semibold">
          Email Verified!
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Your email has been successfully verified. You can now access all features.
        </p>
        <button
          class="btn btn-primary"
          @click="router.push('/dashboard')"
        >
          Go to Dashboard
        </button>
      </div>

      <div
        v-else
        class="text-center space-y-4"
      >
        <div class="text-5xl mb-4">
          ❌
        </div>
        <h2 class="text-xl font-semibold text-red-600 dark:text-red-400">
          Verification Failed
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ error || 'The verification link is invalid or has expired.' }}
        </p>
        <button
          class="btn btn-primary"
          @click="router.push('/dashboard')"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>
