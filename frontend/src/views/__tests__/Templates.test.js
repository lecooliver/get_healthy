import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Templates from '../Templates.vue'

// Mock the router
const mockRouter = {
  push: vi.fn()
}

// Mock fetch globally
global.fetch = vi.fn()

describe('Templates.vue', () => {
  let pinia

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should initialize with exercise groups in new template', () => {
    const wrapper = mount(Templates, {
      global: {
        plugins: [pinia],
        mocks: {
          $router: mockRouter
        }
      }
    })

    // Check that new template has exerciseGroups structure
    expect(wrapper.vm.newTemplate.workouts[0].exerciseGroups).toBeDefined()
    expect(wrapper.vm.newTemplate.workouts[0].exerciseGroups).toHaveLength(1)
    expect(wrapper.vm.newTemplate.workouts[0].exerciseGroups[0].exercises).toBeDefined()
  })

  it('should add exercise group to workout', async () => {
    const wrapper = mount(Templates, {
      global: {
        plugins: [pinia]
      }
    })

    // Open create modal first
    await wrapper.vm.openCreateModal()

    // Add a new exercise group
    await wrapper.vm.addExerciseGroup(0)

    expect(wrapper.vm.newTemplate.workouts[0].exerciseGroups).toHaveLength(2)
  })

  it('should remove exercise group from workout', async () => {
    const wrapper = mount(Templates, {
      global: {
        plugins: [pinia]
      }
    })

    // Open create modal first
    await wrapper.vm.openCreateModal()

    // Add another group first
    await wrapper.vm.addExerciseGroup(0)
    expect(wrapper.vm.newTemplate.workouts[0].exerciseGroups).toHaveLength(2)

    // Remove the second group
    await wrapper.vm.removeExerciseGroup(0, 1)
    expect(wrapper.vm.newTemplate.workouts[0].exerciseGroups).toHaveLength(1)
  })

  it('should calculate exercise count correctly with exercise groups', () => {
    const wrapper = mount(Templates, {
      global: {
        plugins: [pinia]
      }
    })

    // Mock template data
    wrapper.vm.templates = [
      {
        id: 't1',
        name: 'Test Template',
        workouts: [
          {
            id: 'w1',
            exerciseGroups: [
              {
                id: 'g1',
                exercises: [{ id: 'e1' }, { id: 'e2' }]
              },
              {
                id: 'g2',
                exercises: [{ id: 'e3' }]
              }
            ]
          }
        ]
      }
    ]

    const count = wrapper.vm.getExerciseCount(wrapper.vm.templates[0])
    expect(count).toBe(3)
  })
})
