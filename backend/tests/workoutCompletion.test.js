const request = require('supertest')
const express = require('express')

const {
  completeWorkout,
  updateWorkout
} = require('../src/controllers/workoutController')

const mockPrisma = global.mockPrismaClient

describe('Workout completion time override', () => {
  let mockRes

  const ownedWorkout = {
    id: 'workout-1',
    name: 'Push Day',
    completedAt: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    mockPrisma.workout.findFirst.mockResolvedValue(ownedWorkout)
    mockPrisma.routine.findFirst.mockResolvedValue({ id: 'routine-1', userId: 'user-1' })
    mockPrisma.workout.update.mockResolvedValue({ ...ownedWorkout, completedAt: new Date() })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('completeWorkout', () => {
    it('uses the client-supplied completedAt when provided', async () => {
      const requested = new Date('2026-08-20T07:30:00Z')
      await completeWorkout(
        { params: { id: 'workout-1' }, userId: 'user-1', body: { completedAt: requested.toISOString() } },
        mockRes
      )

      expect(mockPrisma.workout.update).toHaveBeenCalledWith({
        where: { id: 'workout-1' },
        data: { completedAt: requested }
      })
      expect(mockRes.status).not.toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'workout-1' }))
    })

    it('accepts datetime-local strings without timezone', async () => {
      await completeWorkout(
        { params: { id: 'workout-1' }, userId: 'user-1', body: { completedAt: '2026-08-20T07:30' } },
        mockRes
      )

      expect(mockPrisma.workout.update).toHaveBeenCalled()
      const saved = mockPrisma.workout.update.mock.calls[0][0].data.completedAt
      expect(saved).toBeInstanceOf(Date)
      expect(saved.getTime()).toBe(new Date('2026-08-20T07:30').getTime())
    })

    it('defaults to now when completedAt is not supplied (no request body)', async () => {
      const before = Date.now()
      await completeWorkout({ params: { id: 'workout-1' }, userId: 'user-1', body: undefined }, mockRes)

      const saved = mockPrisma.workout.update.mock.calls[0][0].data.completedAt
      expect(saved).toBeInstanceOf(Date)
      expect(saved.getTime()).toBeGreaterThanOrEqual(before)
      expect(saved.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('rejects unparseable datetimes with 400', async () => {
      await completeWorkout(
        { params: { id: 'workout-1' }, userId: 'user-1', body: { completedAt: 'not-a-date' } },
        mockRes
      )

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'completedAt must be a valid datetime' })
      expect(mockPrisma.workout.update).not.toHaveBeenCalled()
    })

    it('rejects future timestamps beyond clock skew tolerance with 400', async () => {
      const future = new Date(Date.now() + 5 * 60 * 1000)
      await completeWorkout(
        { params: { id: 'workout-1' }, userId: 'user-1', body: { completedAt: future.toISOString() } },
        mockRes
      )

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'completedAt cannot be in the future' })
      expect(mockPrisma.workout.update).not.toHaveBeenCalled()
    })

    it('returns 404 when workout does not belong to user', async () => {
      mockPrisma.workout.findFirst.mockResolvedValue(null)
      await completeWorkout(
        { params: { id: 'other-workout' }, userId: 'user-1', body: {} },
        mockRes
      )

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockPrisma.workout.update).not.toHaveBeenCalled()
    })
  })

  describe('updateWorkout', () => {
    it('updates completedAt on an already-completed workout', async () => {
      const corrected = new Date('2026-08-19T18:45:00Z')
      await updateWorkout(
        {
          params: { routineId: 'routine-1', id: 'workout-1' },
          userId: 'user-1',
          body: { completedAt: corrected.toISOString() }
        },
        mockRes
      )

      expect(mockPrisma.workout.update).toHaveBeenCalledWith({
        where: { id: 'workout-1' },
        data: expect.objectContaining({ completedAt: corrected })
      })
      expect(mockRes.json).toHaveBeenCalled()
    })

    it('leaves completedAt untouched when not supplied', async () => {
      await updateWorkout(
        {
          params: { routineId: 'routine-1', id: 'workout-1' },
          userId: 'user-1',
          body: { name: 'Renamed Workout' }
        },
        mockRes
      )

      expect(mockPrisma.workout.update).toHaveBeenCalledWith({
        where: { id: 'workout-1' },
        data: { name: 'Renamed Workout', scheduledDate: undefined, completedAt: undefined }
      })
    })

    it('rejects invalid completedAt with 400', async () => {
      await updateWorkout(
        {
          params: { routineId: 'routine-1', id: 'workout-1' },
          userId: 'user-1',
          body: { completedAt: 'yesterday-ish' }
        },
        mockRes
      )

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockPrisma.workout.update).not.toHaveBeenCalled()
    })

    it('rejects future completedAt with 400', async () => {
      const future = new Date(Date.now() + 60 * 60 * 1000)
      await updateWorkout(
        {
          params: { routineId: 'routine-1', id: 'workout-1' },
          userId: 'user-1',
          body: { completedAt: future.toISOString() }
        },
        mockRes
      )

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockPrisma.workout.update).not.toHaveBeenCalled()
    })
  })
})

describe('Workout completion time API', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    const setUser = (req, _res, next) => {
      req.userId = 'user-1'
      next()
    }
    app.post('/api/routines/:id/workouts/:wid/complete', setUser, completeWorkout)
    app.put('/api/routines/:id/workouts/:wid', setUser, updateWorkout)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.workout.findFirst.mockResolvedValue({ id: 'workout-1', name: 'Push Day' })
    mockPrisma.routine.findFirst.mockResolvedValue({ id: 'routine-1', userId: 'user-1' })
    mockPrisma.workout.update.mockImplementation(async ({ data }) => ({ id: 'workout-1', ...data }))
  })

  it('POST /complete stores the overridden timestamp', async () => {
    const res = await request(app)
      .post('/api/routines/routine-1/workouts/workout-1/complete')
      .send({ completedAt: '2026-08-20T06:15:00Z' })

    expect(res.status).toBe(200)
    expect(res.body.completedAt).toBe('2026-08-20T06:15:00.000Z')
  })

  it('POST /complete without body still completes at now', async () => {
    const res = await request(app)
      .post('/api/routines/routine-1/workouts/workout-1/complete')

    expect(res.status).toBe(200)
    expect(new Date(res.body.completedAt).getTime()).toBeLessThanOrEqual(Date.now())
  })

  it('POST /complete returns 400 for bad input', async () => {
    const res = await request(app)
      .post('/api/routines/routine-1/workouts/workout-1/complete')
      .send({ completedAt: 42 })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('PUT /:id corrects the completion time after the fact', async () => {
    const res = await request(app)
      .put('/api/routines/routine-1/workouts/workout-1')
      .send({ completedAt: '2026-08-18T17:00:00Z' })

    expect(res.status).toBe(200)
    expect(res.body.completedAt).toBe('2026-08-18T17:00:00.000Z')
  })
})
