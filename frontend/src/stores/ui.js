import { defineStore } from 'pinia'
import { ref } from 'vue'

const getStoredTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('theme') || 'system'
  }
  return 'system'
}

export const useUIStore = defineStore('ui', () => {
  const theme = ref(getStoredTheme())

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/measurements', label: 'Measurements', icon: '📏' },
    { to: '/photos', label: 'Photo Journal', icon: '📷' },
    { to: '/routines', label: 'Routines', icon: '🏋️' },
    { to: '/templates', label: 'Templates', icon: '📋' },
    { to: '/schedule', label: 'Schedule', icon: '📅' },
    { to: '/reports', label: 'Reports', icon: '📈' },
    { to: '/export', label: 'Export', icon: '💾' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/admin', label: 'Admin', icon: '⚙️' }
  ]

  const setTheme = (newTheme) => {
    theme.value = newTheme
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('theme', newTheme)
    }
    
    const root = document.documentElement
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const initTheme = () => {
    const root = document.documentElement
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (theme.value === 'dark' || (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  return {
    theme,
    navLinks,
    setTheme,
    initTheme
  }
})
