import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

global.fetch = vi.fn()

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have no user initially', () => {
      const authStore = useAuthStore()
      expect(authStore.user).toBe(null)
    })

    it('should read token from localStorage', () => {
      localStorage.setItem('token', 'test-token-123')
      const authStore = useAuthStore()
      expect(authStore.token).toBe('test-token-123')
    })

    it('should not be authenticated without token', () => {
      const authStore = useAuthStore()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should not be authenticated with only token', () => {
      localStorage.setItem('token', 'test-token')
      const authStore = useAuthStore()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should be authenticated with token and user', () => {
      localStorage.setItem('token', 'test-token')
      const authStore = useAuthStore()
      authStore.user = { id: '1', email: 'test@test.com' }
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          user: { id: '1', email: 'test@test.com', displayName: 'Test User' },
          token: 'jwt-token-123'
        })
      }
      fetch.mockResolvedValue(mockResponse)

      const authStore = useAuthStore()
      await authStore.login('test@test.com', 'password123')

      expect(authStore.user?.email).toBe('test@test.com')
      expect(authStore.token).toBe('jwt-token-123')
      expect(localStorage.getItem('token')).toBe('jwt-token-123')
    })

    it('should throw error on failed login', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      }
      fetch.mockResolvedValue(mockResponse)

      const authStore = useAuthStore()

      await expect(authStore.login('test@test.com', 'wrongpass'))
        .rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          user: { id: '1', email: 'new@test.com', displayName: 'New User' },
          token: 'new-token'
        })
      }
      fetch.mockResolvedValue(mockResponse)

      const authStore = useAuthStore()
      await authStore.register('New User', 'new@test.com', 'password123')

      expect(authStore.user?.email).toBe('new@test.com')
      expect(authStore.token).toBe('new-token')
    })

    it('should throw error on failed registration', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' })
      }
      fetch.mockResolvedValue(mockResponse)

      const authStore = useAuthStore()

      await expect(authStore.register('Test', 'existing@test.com', 'password123'))
        .rejects.toThrow('Email already exists')
    })
  })

  describe('logout', () => {
    it('should clear user and token', () => {
      localStorage.setItem('token', 'test-token')
      const authStore = useAuthStore()
      authStore.user = { id: '1', email: 'test@test.com' }

      authStore.logout()

      expect(authStore.user).toBe(null)
      expect(authStore.token).toBe(null)
      expect(localStorage.getItem('token')).toBe(null)
    })
  })

  describe('updateUser', () => {
    it('should update user data', () => {
      const authStore = useAuthStore()
      authStore.user = { id: '1', email: 'test@test.com', displayName: 'Old Name' }

      authStore.updateUser({ displayName: 'New Name', height: 70 })

      expect(authStore.user.displayName).toBe('New Name')
      expect(authStore.user.height).toBe(70)
      expect(authStore.user.email).toBe('test@test.com')
    })
  })
})
