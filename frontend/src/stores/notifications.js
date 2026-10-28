import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const permission = ref(Notification.permission || 'default')
  const enabled = ref(localStorage.getItem('notifications_enabled') === 'true')
  const notifications = ref([])

  const isSupported = computed(() => 'Notification' in window)

  const canNotify = computed(() => {
    return isSupported.value && permission.value === 'granted' && enabled.value
  })

  const requestPermission = async () => {
    if (!isSupported.value) {
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result === 'granted'
    } catch (error) {
      console.error('Não foi possível solicitar permissão para notificações:', error)
      return false
    }
  }

  const enable = async () => {
    if (permission.value !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return false
    }
    enabled.value = true
    localStorage.setItem('notifications_enabled', 'true')
    return true
  }

  const disable = () => {
    enabled.value = false
    localStorage.setItem('notifications_enabled', 'false')
  }

  const scheduleWorkoutReminder = (workoutName, scheduledDate) => {
    if (!canNotify.value) return

    const workoutDate = new Date(scheduledDate)
    const reminderTime = new Date(workoutDate)
    reminderTime.setHours(8, 0, 0, 0)

    if (reminderTime <= new Date()) return

    const notification = new Notification('Lembrete de treino', {
      body: `Hora de ${workoutName}!`,
      icon: '/favicon.ico',
      tag: `workout-${workoutName}`
    })

    setTimeout(() => {
      notification.close()
    }, 10000)

    return notification
  }

  const showInstantNotification = (title, body) => {
    if (!canNotify.value) return null

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico'
    })

    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  }

  const addNotification = (notification) => {
    notifications.value.unshift({
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    })
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    permission,
    enabled,
    notifications,
    isSupported,
    canNotify,
    requestPermission,
    enable,
    disable,
    scheduleWorkoutReminder,
    showInstantNotification,
    addNotification,
    clearAll
  }
})
