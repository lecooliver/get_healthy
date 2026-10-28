import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Navbar from '../Navbar.vue'
import { createPinia, setActivePinia } from 'pinia'

vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'Dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/profile', name: 'Profile', component: { template: '<div>Profile</div>' } },
    { path: '/login', name: 'Login', component: { template: '<div>Login</div>' } }
  ]
})

const mockAuthStore = {
  isAuthenticated: false,
  user: null,
  logout: vi.fn()
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('Navbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    router.push('/dashboard')
  })

  it('should render navigation links', () => {
    const wrapper = mount(Navbar, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.findAll('a').length).toBeGreaterThan(0)
  })

  it('should show login link when not authenticated', () => {
    mockAuthStore.isAuthenticated = false
    
    const wrapper = mount(Navbar, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Login')
  })
})
