import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  const register = async (displayName, email, password) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  const checkAuth = async () => {
    if (!token.value) {
      user.value = null
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })

      if (response.ok) {
        const text = await response.text()
        if (text) {
          user.value = JSON.parse(text)
        }
      } else if (response.status === 401) {
        logout()
      }
    } catch (error) {
      // Network error - keep user logged in with existing token
    }
  }

  const updateUser = (updates) => {
    user.value = { ...user.value, ...updates }
  }

  const updateAvatar = (avatarUrl) => {
    user.value = { ...user.value, avatarUrl }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    updateAvatar
  }
})
