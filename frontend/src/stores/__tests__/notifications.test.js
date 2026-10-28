import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../notifications'

vi.stubGlobal('Notification', {
  permission: 'default',
  requestPermission: vi.fn().mockResolvedValue('granted')
})

describe('Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have notifications disabled by default', () => {
      const store = useNotificationStore()
      expect(store.enabled).toBe(false)
    })

    it('should check notification support', () => {
      const store = useNotificationStore()
      expect(typeof store.isSupported).toBe('boolean')
    })

    it('should not be able to notify without permission', () => {
      const store = useNotificationStore()
      expect(store.canNotify).toBe(false)
    })
  })

  describe('enable/disable', () => {
    it('should enable notifications when granted', async () => {
      const store = useNotificationStore()
      
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'granted',
          requestPermission: vi.fn().mockResolvedValue('granted')
        },
        writable: true
      })

      const result = await store.enable()
      expect(result).toBe(true)
      expect(store.enabled).toBe(true)
      expect(localStorage.getItem('notifications_enabled')).toBe('true')
    })

    it('should disable notifications', () => {
      const store = useNotificationStore()
      store.enabled = true
      
      store.disable()
      
      expect(store.enabled).toBe(false)
      expect(localStorage.getItem('notifications_enabled')).toBe('false')
    })
  })

  describe('notifications', () => {
    it('should add notification to list', () => {
      const store = useNotificationStore()
      
      store.addNotification({
        title: 'Test',
        body: 'Test notification'
      })
      
      expect(store.notifications.length).toBe(1)
      expect(store.notifications[0].title).toBe('Test')
    })

    it('should limit notifications to 50', () => {
      const store = useNotificationStore()
      
      for (let i = 0; i < 60; i++) {
        store.addNotification({ title: `Notification ${i}` })
      }
      
      expect(store.notifications.length).toBe(50)
    })

    it('should clear all notifications', () => {
      const store = useNotificationStore()
      
      store.addNotification({ title: 'Test 1' })
      store.addNotification({ title: 'Test 2' })
      expect(store.notifications.length).toBe(2)
      
      store.clearAll()
      expect(store.notifications.length).toBe(0)
    })
  })

  describe('instant notifications', () => {
    it('should not show notification without permission', () => {
      const store = useNotificationStore()
      store.enabled = false
      
      const result = store.showInstantNotification('Title', 'Body')
      expect(result).toBeNull()
    })
  })
})
