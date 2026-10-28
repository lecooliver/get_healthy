import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const mockRoute = { params: { id: 'routine-1' } }
const mockRouter = { push: vi.fn() }

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ token: 'test-token' })
}))

import Workout from '../Workout.vue'

const mockRoutine = {
  id: 'routine-1',
  name: 'Push/Pull/Legs',
  type: 'weightlifting',
  workouts: [
    { id: 'w-pending', name: 'Push Day', archived: false, completedAt: null, exercises: [] },
    {
      id: 'w-done',
      name: 'Pull Day',
      archived: false,
      completedAt: '2026-08-19T18:00:00Z',
      exercises: [{ id: 'e1', name: 'Barbell Row', type: 'strength' }]
    }
  ]
}

describe('Workout.vue completion time override', () => {
  let fetchMock

  const jsonResponse = (body) => ({ ok: true, json: async () => body })

  const toDatetimeLocal = (date) => {
    const d = new Date(date)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())

    fetchMock = vi.fn((url, opts = {}) => {
      const target = String(url)
      if (target.includes('/api/profile')) {
        return Promise.resolve(jsonResponse({ weightUnit: 'lb' }))
      }
      if (target.endsWith('/complete')) {
        return Promise.resolve(jsonResponse({ id: 'w-pending', ...JSON.parse(opts.body) }))
      }
      if (opts.method === 'PUT') {
        return Promise.resolve(jsonResponse(JSON.parse(opts.body)))
      }
      return Promise.resolve(jsonResponse(mockRoutine))
    })
    global.fetch = fetchMock
  })

  const mountWorkout = async () => {
    const wrapper = mount(Workout, {
      global: {
        plugins: [createPinia()]
      }
    })
    await flushPromises()
    return wrapper
  }

  it('opens the completion modal pre-filled with the current local date/time', async () => {
    const wrapper = await mountWorkout()

    wrapper.vm.openCompletionModal()
    await flushPromises()

    expect(wrapper.vm.showCompletionModal).toBe(true)
    expect(wrapper.vm.completionInput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    const picked = new Date(wrapper.vm.completionInput)
    expect(Math.abs(Date.now() - picked.getTime())).toBeLessThan(60 * 1000)
  })

  it('sends the chosen datetime as ISO completedAt when confirming completion', async () => {
    const wrapper = await mountWorkout()
    wrapper.vm.currentWorkout = mockRoutine.workouts[0]

    wrapper.vm.openCompletionModal()
    wrapper.vm.completionInput = '2026-08-20T07:30'
    await wrapper.vm.confirmCompletion()
    await flushPromises()

    expect(wrapper.vm.showCompletionModal).toBe(false)

    const completeCall = fetchMock.mock.calls.find(
      ([url]) => String(url).endsWith('/complete')
    )
    expect(completeCall).toBeDefined()
    expect(completeCall[1].method).toBe('POST')
    const body = JSON.parse(completeCall[1].body)
    expect(body.completedAt).toBe(new Date('2026-08-20T07:30').toISOString())
  })

  it('pre-fills the picker from an existing completion and PUTs corrections', async () => {
    const wrapper = await mountWorkout()

    wrapper.vm.openEditCompletionModal({ id: 'w-done', completedAt: '2026-08-19T18:00:00Z' })
    await flushPromises()

    expect(wrapper.vm.editingCompletedWorkoutId).toBe('w-done')
    expect(wrapper.vm.completionInput).toBe(toDatetimeLocal('2026-08-19T18:00:00Z'))

    wrapper.vm.completionInput = '2026-08-19T06:45'
    await wrapper.vm.confirmCompletion()
    await flushPromises()

    const putCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === 'PUT')
    expect(putCall).toBeDefined()
    expect(String(putCall[0])).toContain('/workouts/w-done')
    expect(JSON.parse(putCall[1].body)).toEqual({
      completedAt: new Date('2026-08-19T06:45').toISOString()
    })
  })

  it('does not submit when the datetime field was cleared', async () => {
    const wrapper = await mountWorkout()

    wrapper.vm.openCompletionModal()
    wrapper.vm.completionInput = ''
    await wrapper.vm.confirmCompletion()
    await flushPromises()

    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/complete'))).toBe(false)
    expect(wrapper.vm.showCompletionModal).toBe(true)
  })

  it('renders completion date and time on past workouts', async () => {
    const wrapper = await mountWorkout()

    const html = wrapper.html()
    expect(html).toContain('✓')
    expect(wrapper.vm.formatCompletionDate('2026-08-19T22:05:00Z')).toMatch(/PM|AM/)
  })
})
