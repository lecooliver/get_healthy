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
    { to: '/dashboard', label: 'Painel', icon: '📊' },
    { to: '/measurements', label: 'Medidas', icon: '📏' },
    { to: '/photos', label: 'Fotos', icon: '📷' },
    { to: '/routines', label: 'Rotinas', icon: '🏋️' },
    { to: '/templates', label: 'Modelos', icon: '📋' },
    { to: '/schedule', label: 'Agenda', icon: '📅' },
    { to: '/reports', label: 'Relatórios', icon: '📈' },
    { to: '/export', label: 'Exportar dados', icon: '💾' },
    { to: '/profile', label: 'Perfil', icon: '👤' },
    { to: '/admin', label: 'Administração', icon: '⚙️' }
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
