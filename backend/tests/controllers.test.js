describe('Profile Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getProfile', () => {
    it('should return user profile with weight', async () => {
      const { getProfile } = require('../src/controllers/profileController')
      
      global.mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com',
        displayName: 'Test User',
        profile: { height: 70, age: 25, weight: 180, weightUnit: 'lb' }
      })
      mockReq = { userId: 'user-123' }
      
      await getProfile(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveProperty('weight', 180)
      expect(result).toHaveProperty('weightUnit', 'lb')
    })

    it('should return 404 for non-existent user', async () => {
      const { getProfile } = require('../src/controllers/profileController')
      
      global.mockPrismaClient.user.findUnique.mockResolvedValue(null)
      mockReq = { userId: 'nonexistent' }
      
      await getProfile(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('updateProfile', () => {
    it('should update user profile with weight', async () => {
      const { updateProfile } = require('../src/controllers/profileController')
      
      global.mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com'
      })
      global.mockPrismaClient.user.update.mockResolvedValue({
        id: 'user-123',
        displayName: 'New Name'
      })
      global.mockPrismaClient.userProfile.upsert.mockResolvedValue({
        userId: 'user-123',
        height: 72,
        weight: 175,
        weightUnit: 'lb'
      })
      mockReq = {
        userId: 'user-123',
        body: { displayName: 'New Name', height: 72, weight: 175, weightUnit: 'lb' }
      }
      
      await updateProfile(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })
  })

  describe('deleteAllData', () => {
    it('should delete user account and all data', async () => {
      const { deleteAllData } = require('../src/controllers/profileController')
      
      global.mockPrismaClient.bodyMeasurement.deleteMany = jest.fn().mockResolvedValue({})
      global.mockPrismaClient.scheduledWorkout.deleteMany = jest.fn().mockResolvedValue({})
      global.mockPrismaClient.workout.findMany = jest.fn().mockResolvedValue([])
      global.mockPrismaClient.workout.deleteMany = jest.fn().mockResolvedValue({})
      global.mockPrismaClient.routine.deleteMany = jest.fn().mockResolvedValue({})
      global.mockPrismaClient.userProfile.deleteMany = jest.fn().mockResolvedValue({})
      global.mockPrismaClient.user.delete = jest.fn().mockResolvedValue({ id: 'user-123' })
      mockReq = { userId: 'user-123' }
      
      await deleteAllData(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })
  })
})

describe('Report Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getProgress', () => {
    it('should return body measurements and strength progress', async () => {
      const { getProgress } = require('../src/controllers/reportController')
      
      global.mockPrismaClient.bodyMeasurement.findMany.mockResolvedValue([
        { date: new Date('2024-01-01'), weight: 180 },
        { date: new Date('2024-01-08'), weight: 178 }
      ])
      
      global.mockPrismaClient.exerciseSet.findMany.mockResolvedValue([
        {
          weight: 135,
          reps: 8,
          setNumber: 1,
          completed: true,
          exercise: {
            name: 'Bench Press',
            type: 'strength',
            workout: {
              completedAt: new Date('2024-01-05'),
              routine: { userId: 'user-123' }
            }
          }
        },
        {
          weight: 145,
          reps: 8,
          setNumber: 1,
          completed: true,
          exercise: {
            name: 'Bench Press',
            type: 'strength',
            workout: {
              completedAt: new Date('2024-01-12'),
              routine: { userId: 'user-123' }
            }
          }
        }
      ])
      
      mockReq = { userId: 'user-123', query: { metric: 'weight' } }
      
      await getProgress(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveProperty('body')
      expect(result).toHaveProperty('strength')
      expect(result.body).toHaveLength(2)
      expect(result.strength).toHaveLength(1)
      expect(result.strength[0].name).toBe('Bench Press')
      expect(result.strength[0].startingMax).toBe(135)
      expect(result.strength[0].currentMax).toBe(145)
      expect(result.strength[0].totalProgress).toBe(10)
    })

    it('should return empty strength array when no data', async () => {
      const { getProgress } = require('../src/controllers/reportController')
      
      global.mockPrismaClient.bodyMeasurement.findMany.mockResolvedValue([])
      global.mockPrismaClient.exerciseSet.findMany.mockResolvedValue([])
      
      mockReq = { userId: 'user-123', query: { metric: 'weight' } }
      
      await getProgress(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result.body).toHaveLength(0)
      expect(result.strength).toHaveLength(0)
    })
  })

  describe('getCalories', () => {
    it('should return calories data for specified range', async () => {
      const { getCalories } = require('../src/controllers/reportController')
      
      global.mockPrismaClient.aerobicLog.findMany.mockResolvedValue([
        { calories: 300, createdAt: new Date(), exercise: { workout: {} } },
        { calories: 350, createdAt: new Date(), exercise: { workout: {} } }
      ])
      
      mockReq = { userId: 'user-123', query: { range: 'week' } }
      
      await getCalories(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })
  })

  describe('getDashboard', () => {
    it('should return dashboard data with stats', async () => {
      const { getDashboard } = require('../src/controllers/reportController')
      
      global.mockPrismaClient.workout.count.mockResolvedValue(10)
      global.mockPrismaClient.workout.findMany.mockResolvedValue([
        { id: 'w1', name: 'Workout 1', completedAt: new Date(), routine: { type: 'weightlifting' } }
      ])
      global.mockPrismaClient.aerobicLog.aggregate.mockResolvedValue({ _sum: { calories: 5000 } })
      
      mockReq = { userId: 'user-123' }
      
      await getDashboard(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveProperty('stats')
      expect(result).toHaveProperty('recentActivity')
      expect(result.stats.totalWorkouts).toBe(10)
      expect(result.stats.caloriesBurned).toBe(5000)
    })
  })
})

describe('Routine Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getRoutines', () => {
    it('should return user routines', async () => {
      const { getRoutines } = require('../src/controllers/routineController')
      
      const mockRoutines = [
        { id: '1', name: 'Morning Routine', type: 'strength', createdAt: new Date(), _count: { workouts: 3 } },
        { id: '2', name: 'Evening Routine', type: 'cardio', createdAt: new Date(), _count: { workouts: 5 } }
      ]
      global.mockPrismaClient.routine.findMany.mockResolvedValue(mockRoutines)
      mockReq = { userId: 'user-123' }
      
      await getRoutines(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('workoutCount', 3)
    })

    it('should return empty array when no routines', async () => {
      const { getRoutines } = require('../src/controllers/routineController')
      
      global.mockPrismaClient.routine.findMany.mockResolvedValue([])
      mockReq = { userId: 'user-123' }
      
      await getRoutines(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalledWith([])
    })
  })

  describe('createRoutine', () => {
    it('should create new routine', async () => {
      const { createRoutine } = require('../src/controllers/routineController')
      
      const newRoutine = {
        id: 'new-id',
        name: 'New Routine',
        type: 'strength'
      }
      global.mockPrismaClient.routine.create.mockResolvedValue(newRoutine)
      mockReq = {
        userId: 'user-123',
        body: { name: 'New Routine', type: 'strength' }
      }
      
      await createRoutine(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(newRoutine)
    })
  })

  describe('getRoutine', () => {
    it('should return routine with workouts', async () => {
      const { getRoutine } = require('../src/controllers/routineController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        name: 'Test Routine',
        workouts: []
      })
      mockReq = { userId: 'user-123', params: { id: 'routine-1' } }
      
      await getRoutine(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })

    it('should return 404 for non-existent routine', async () => {
      const { getRoutine } = require('../src/controllers/routineController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue(null)
      mockReq = { userId: 'user-123', params: { id: 'nonexistent' } }
      
      await getRoutine(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('updateRoutine', () => {
    it('should update existing routine', async () => {
      const { updateRoutine } = require('../src/controllers/routineController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.routine.update.mockResolvedValue({
        id: 'routine-1',
        name: 'Updated Name'
      })
      mockReq = {
        userId: 'user-123',
        params: { id: 'routine-1' },
        body: { name: 'Updated Name' }
      }
      
      await updateRoutine(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })

    it('should return 404 for non-existent routine', async () => {
      const { updateRoutine } = require('../src/controllers/routineController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue(null)
      mockReq = {
        userId: 'user-123',
        params: { id: 'nonexistent' },
        body: { name: 'Updated' }
      }
      
      await updateRoutine(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('deleteRoutine', () => {
    it('should delete routine', async () => {
      const { deleteRoutine } = require('../src/controllers/routineController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.routine.delete.mockResolvedValue({ id: 'routine-1' })
      mockReq = { userId: 'user-123', params: { id: 'routine-1' } }
      
      await deleteRoutine(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })

    it('should return 404 for non-existent routine', async () => {
      const { deleteRoutine } = require('../src/controllers/routineController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue(null)
      mockReq = { userId: 'user-123', params: { id: 'nonexistent' } }
      
      await deleteRoutine(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })
})

describe('Workout Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getWorkouts', () => {
    it('should return non-archived workouts by default', async () => {
      const { getWorkouts } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.workout.findMany.mockResolvedValue([
        { id: 'w1', name: 'Workout 1', archived: false },
        { id: 'w2', name: 'Workout 2', archived: false }
      ])
      mockReq = { userId: 'user-123', params: { routineId: 'routine-1' }, query: {} }
      
      await getWorkouts(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveLength(2)
    })

    it('should include archived workouts when requested', async () => {
      const { getWorkouts } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.workout.findMany.mockResolvedValue([
        { id: 'w1', name: 'Workout 1', archived: false },
        { id: 'w2', name: 'Workout 2', archived: true }
      ])
      mockReq = { userId: 'user-123', params: { routineId: 'routine-1' }, query: { includeArchived: 'true' } }
      
      await getWorkouts(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })
  })

  describe('archiveWorkout', () => {
    it('should archive a workout', async () => {
      const { archiveWorkout } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.workout.findFirst.mockResolvedValue({
        id: 'workout-1',
        routineId: 'routine-1',
        archived: false
      })
      global.mockPrismaClient.workout.update.mockResolvedValue({
        id: 'workout-1',
        archived: true
      })
      mockReq = { userId: 'user-123', params: { routineId: 'routine-1', id: 'workout-1' } }
      
      await archiveWorkout(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      expect(global.mockPrismaClient.workout.update).toHaveBeenCalledWith({
        where: { id: 'workout-1' },
        data: { archived: true }
      })
    })

    it('should return 404 for non-existent workout', async () => {
      const { archiveWorkout } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.workout.findFirst.mockResolvedValue(null)
      mockReq = { userId: 'user-123', params: { routineId: 'routine-1', id: 'nonexistent' } }
      
      await archiveWorkout(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('batchArchiveWorkouts', () => {
    it('should archive multiple workouts by IDs', async () => {
      const { batchArchiveWorkouts } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.workout.updateMany.mockResolvedValue({ count: 3 })
      mockReq = {
        userId: 'user-123',
        params: { routineId: 'routine-1' },
        body: { workoutIds: ['w1', 'w2', 'w3'] }
      }
      
      await batchArchiveWorkouts(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalledWith({ archived: 3 })
    })

    it('should archive workouts by date range', async () => {
      const { batchArchiveWorkouts } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.workout.updateMany.mockResolvedValue({ count: 2 })
      mockReq = {
        userId: 'user-123',
        params: { routineId: 'routine-1' },
        body: { startDate: '2024-01-01', endDate: '2024-01-31' }
      }
      
      await batchArchiveWorkouts(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalledWith({ archived: 2 })
    })

    it('should archive workouts by name pattern', async () => {
      const { batchArchiveWorkouts } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.workout.updateMany.mockResolvedValue({ count: 1 })
      mockReq = {
        userId: 'user-123',
        params: { routineId: 'routine-1' },
        body: { namePattern: 'Push' }
      }
      
      await batchArchiveWorkouts(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalledWith({ archived: 1 })
    })
  })

  describe('getArchivedWorkouts', () => {
    it('should return archived workouts', async () => {
      const { getArchivedWorkouts } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.routine.findFirst.mockResolvedValue({
        id: 'routine-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.workout.findMany.mockResolvedValue([
        { id: 'w1', name: 'Old Workout 1', archived: true },
        { id: 'w2', name: 'Old Workout 2', archived: true }
      ])
      mockReq = { userId: 'user-123', params: { routineId: 'routine-1' } }
      
      await getArchivedWorkouts(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveLength(2)
    })
  })

  describe('completeWorkout', () => {
    it('should mark workout as complete', async () => {
      const { completeWorkout } = require('../src/controllers/workoutController')
      
      global.mockPrismaClient.workout.findFirst.mockResolvedValue({
        id: 'workout-1',
        routine: { userId: 'user-123' }
      })
      global.mockPrismaClient.workout.update.mockResolvedValue({
        id: 'workout-1',
        completedAt: new Date()
      })
      mockReq = { userId: 'user-123', params: { id: 'workout-1' } }
      
      await completeWorkout(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      expect(global.mockPrismaClient.workout.update).toHaveBeenCalledWith({
        where: { id: 'workout-1' },
        data: { completedAt: expect.any(Date) }
    })
  })
})

describe('Template Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getTemplates', () => {
    it('should return user and public templates', async () => {
      const { getTemplates } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.template.findMany.mockResolvedValue([
        { id: 't1', name: 'User Template', isPublic: false, workouts: [
          { id: 'w1', exerciseGroups: [{ id: 'g1', exercises: [] }] }
        ] },
        { id: 't2', name: 'Public Template', isPublic: true, workouts: [
          { id: 'w2', exerciseGroups: [{ id: 'g2', exercises: [] }] }
        ] }
      ])
      mockReq = { userId: 'user-123' }
      
      await getTemplates(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveLength(2)
    })
  })

  describe('getPublicTemplates', () => {
    it('should return only public templates', async () => {
      const { getPublicTemplates } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.template.findMany.mockResolvedValue([
        { id: 't1', name: 'Public Template 1', isPublic: true, workouts: [
          { id: 'w1', exerciseGroups: [{ id: 'g1', exercises: [] }] }
        ] },
        { id: 't2', name: 'Public Template 2', isPublic: true, workouts: [
          { id: 'w2', exerciseGroups: [{ id: 'g2', exercises: [] }] }
        ] }
      ])
      mockReq = { userId: 'user-123' }
      
      await getPublicTemplates(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveLength(2)
      expect(global.mockPrismaClient.template.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isPublic: true }
        })
      )
    })
  })

  describe('getTemplate', () => {
    it('should return a single template with exercise groups', async () => {
      const { getTemplate } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.template.findUnique.mockResolvedValue({
        id: 't1',
        name: 'Test Template',
        workouts: [
          {
            id: 'w1',
            name: 'Workout 1',
            exerciseGroups: [
              {
                id: 'g1',
                name: 'Main Lifts',
                exercises: [
                  { id: 'e1', name: 'Squat', type: 'strength' }
                ]
              }
            ]
          }
        ]
      })
      mockReq = { params: { id: 't1' } }
      
      await getTemplate(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result.id).toBe('t1')
      expect(result.workouts[0].exerciseGroups).toBeDefined()
    })

    it('should return 404 for non-existent template', async () => {
      const { getTemplate } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.template.findUnique.mockResolvedValue(null)
      mockReq = { params: { id: 'nonexistent' } }
      
      await getTemplate(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('createTemplate', () => {
    it('should create a template with exercise groups', async () => {
      const { createTemplate } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.template.create.mockResolvedValue({
        id: 't1',
        name: 'New Template',
        workouts: [
          {
            id: 'w1',
            exerciseGroups: [
              {
                id: 'g1',
                exercises: [{ id: 'e1', name: 'Squat' }]
              }
            ]
          }
        ]
      })
      mockReq = {
        userId: 'user-123',
        body: {
          name: 'New Template',
          type: 'weightlifting',
          workouts: [
            {
              name: 'Workout 1',
              exerciseGroups: [
                {
                  name: 'Main Lifts',
                  exercises: [
                    { name: 'Squat', type: 'strength', sets: 5, reps: 5 }
                  ]
                }
              ]
            }
          ]
        }
      }
      
      await createTemplate(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(global.mockPrismaClient.template.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New Template',
            workouts: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  exerciseGroups: expect.objectContaining({
                    create: expect.anything()
                  })
                })
              ])
            })
          })
        })
      )
    })
  })

  describe('startFromTemplate', () => {
    it('should create a routine from template with exercise groups', async () => {
      const { startFromTemplate } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.template.findUnique.mockResolvedValue({
        id: 'template-1',
        name: 'Test Template',
        type: 'weightlifting',
        workouts: [
          { 
            id: 'w1', 
            name: 'Workout 1', 
            order: 1, 
            exerciseGroups: [
              {
                id: 'g1',
                name: 'Main Lifts',
                order: 1,
                exercises: [
                  { id: 'e1', name: 'Squat', type: 'strength', order: 1 },
                  { id: 'e2', name: 'Bench Press', type: 'strength', order: 2 }
                ]
              }
            ]
          },
          { 
            id: 'w2', 
            name: 'Workout 2', 
            order: 2, 
            exerciseGroups: [
              {
                id: 'g2',
                name: 'Main Lifts',
                order: 1,
                exercises: [
                  { id: 'e3', name: 'Deadlift', type: 'strength', order: 1 }
                ]
              }
            ]
          }
        ]
      })
      global.mockPrismaClient.routine.create.mockResolvedValue({
        id: 'routine-1',
        name: 'Test Template'
      })
      mockReq = { userId: 'user-123', params: { id: 'template-1' } }
      
      await startFromTemplate(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(global.mockPrismaClient.routine.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Template',
            type: 'weightlifting',
            userId: 'user-123'
          })
        })
      )
    })

    it('should return 404 for non-existent template', async () => {
      const { startFromTemplate } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.template.findUnique.mockResolvedValue(null)
      mockReq = { userId: 'user-123', params: { id: 'nonexistent' } }
      
      await startFromTemplate(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('createFromWorkout', () => {
    it('should create a template from a workout with exercise groups', async () => {
      const { createFromWorkout } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.workout.findFirst.mockResolvedValue({
        id: 'workout-1',
        name: 'Push Day',
        routine: { type: 'weightlifting' },
        exercises: [
          { 
            id: 'ex1', 
            name: 'Bench Press', 
            type: 'strength',
            sets: [{ reps: 10, weight: 135 }],
            aerobicLog: [],
            flexibilityLog: []
          }
        ]
      })
      global.mockPrismaClient.template.create.mockResolvedValue({
        id: 'template-1',
        name: 'Push Day Template',
        description: 'Created from Push Day',
        type: 'weightlifting'
      })
      mockReq = { 
        userId: 'user-123', 
        params: { workoutId: 'workout-1' },
        body: { name: 'Push Day Template', description: 'Created from Push Day' }
      }
      
      await createFromWorkout(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(global.mockPrismaClient.template.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Push Day Template',
            workouts: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  exerciseGroups: expect.anything()
                })
              ])
            })
          })
        })
      )
    })

    it('should return 404 for non-existent workout', async () => {
      const { createFromWorkout } = require('../src/controllers/templateController')
      
      global.mockPrismaClient.workout.findFirst.mockResolvedValue(null)
      mockReq = { 
        userId: 'user-123', 
        params: { workoutId: 'nonexistent' },
        body: {}
      }
      
      await createFromWorkout(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })
})

describe('Measurement Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getLatestMeasurement', () => {
    it('should return the most recent measurement', async () => {
      const { getLatestMeasurement } = require('../src/controllers/measurementController')
      
      global.mockPrismaClient.bodyMeasurement.findFirst.mockResolvedValue({
        id: 'm1',
        date: new Date('2024-01-15'),
        weight: 180,
        waist: 34
      })
      mockReq = { userId: 'user-123' }
      
      await getLatestMeasurement(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result.weight).toBe(180)
      expect(result.waist).toBe(34)
      expect(global.mockPrismaClient.bodyMeasurement.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { date: 'desc' }
      })
    })

    it('should return null when no measurements exist', async () => {
      const { getLatestMeasurement } = require('../src/controllers/measurementController')
      
      global.mockPrismaClient.bodyMeasurement.findFirst.mockResolvedValue(null)
      mockReq = { userId: 'user-123' }
      
      await getLatestMeasurement(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalledWith(null)
    })
  })
})

describe('Exercise Limit Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getLimits', () => {
    it('should return all user limits', async () => {
      const { getLimits } = require('../src/controllers/exerciseLimitController')
      
      global.mockPrismaClient.exerciseLimit.findMany.mockResolvedValue([
        { id: 'l1', exerciseName: 'Squat', limitType: 'upper', value: 315 },
        { id: 'l2', exerciseName: 'Squat', limitType: 'lower', value: 225 }
      ])
      mockReq = { userId: 'user-123' }
      
      await getLimits(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveLength(2)
    })
  })

  describe('setLimit', () => {
    it('should create a new limit', async () => {
      const { setLimit } = require('../src/controllers/exerciseLimitController')
      
      global.mockPrismaClient.exerciseLimit.upsert.mockResolvedValue({
        id: 'l1',
        userId: 'user-123',
        exerciseName: 'Bench Press',
        limitType: 'upper',
        value: 225,
        unit: 'lb'
      })
      mockReq = {
        userId: 'user-123',
        body: { exerciseName: 'Bench Press', limitType: 'upper', value: 225, unit: 'lb' }
      }
      
      await setLimit(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result.exerciseName).toBe('Bench Press')
      expect(result.limitType).toBe('upper')
      expect(result.value).toBe(225)
    })

    it('should return 400 for invalid limit type', async () => {
      const { setLimit } = require('../src/controllers/exerciseLimitController')
      
      mockReq = {
        userId: 'user-123',
        body: { exerciseName: 'Squat', limitType: 'invalid', value: 100 }
      }
      
      await setLimit(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Limit type') })
      )
    })

    it('should return 400 when exercise name is missing', async () => {
      const { setLimit } = require('../src/controllers/exerciseLimitController')
      
      mockReq = {
        userId: 'user-123',
        body: { limitType: 'upper', value: 100 }
      }
      
      await setLimit(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
    })
  })

  describe('deleteLimit', () => {
    it('should delete a limit', async () => {
      const { deleteLimit } = require('../src/controllers/exerciseLimitController')
      
      global.mockPrismaClient.exerciseLimit.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'user-123'
      })
      global.mockPrismaClient.exerciseLimit.delete.mockResolvedValue({ id: 'l1' })
      mockReq = { userId: 'user-123', params: { id: 'l1' } }
      
      await deleteLimit(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      expect(global.mockPrismaClient.exerciseLimit.delete).toHaveBeenCalledWith({
        where: { id: 'l1' }
      })
    })

    it('should return 404 for non-existent limit', async () => {
      const { deleteLimit } = require('../src/controllers/exerciseLimitController')
      
      global.mockPrismaClient.exerciseLimit.findFirst.mockResolvedValue(null)
      mockReq = { userId: 'user-123', params: { id: 'nonexistent' } }
      
      await deleteLimit(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('checkLimitViolation', () => {
    it('should detect upper limit violation', async () => {
      const { checkLimitViolation } = require('../src/controllers/exerciseLimitController')
      
      global.mockPrismaClient.exerciseLimit.findMany.mockResolvedValue([
        { id: 'l1', exerciseName: 'Squat', limitType: 'upper', value: 300 }
      ])
      mockReq = {
        userId: 'user-123',
        body: { exerciseName: 'Squat', value: 350 }
      }
      
      await checkLimitViolation(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result.hasViolation).toBe(true)
      expect(result.violations).toHaveLength(1)
      expect(result.violations[0].limitType).toBe('upper')
    })

    it('should detect lower limit violation', async () => {
      const { checkLimitViolation } = require('../src/controllers/exerciseLimitController')
      
      global.mockPrismaClient.exerciseLimit.findMany.mockResolvedValue([
        { id: 'l1', exerciseName: 'Pull-ups', limitType: 'lower', value: 5 }
      ])
      mockReq = {
        userId: 'user-123',
        body: { exerciseName: 'Pull-ups', value: 3 }
      }
      
      await checkLimitViolation(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result.hasViolation).toBe(true)
      expect(result.violations[0].limitType).toBe('lower')
    })

    it('should return no violation when within limits', async () => {
      const { checkLimitViolation } = require('../src/controllers/exerciseLimitController')
      
      global.mockPrismaClient.exerciseLimit.findMany.mockResolvedValue([
        { id: 'l1', exerciseName: 'Deadlift', limitType: 'upper', value: 400 },
        { id: 'l2', exerciseName: 'Deadlift', limitType: 'lower', value: 200 }
      ])
      mockReq = {
        userId: 'user-123',
        body: { exerciseName: 'Deadlift', value: 300 }
      }
      
      await checkLimitViolation(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result.hasViolation).toBe(false)
      expect(result.violations).toHaveLength(0)
    })
  })
})
})

describe('Photo Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getPhotos', () => {
    it('should return all user photos', async () => {
      const { getPhotos } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findMany.mockResolvedValue([
        { id: 'p1', filename: 'photo1.jpg', category: 'progress', takenAt: new Date() },
        { id: 'p2', filename: 'photo2.jpg', category: 'progress', takenAt: new Date() }
      ])
      mockReq = { userId: 'user-123', query: {} }
      
      await getPhotos(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toHaveLength(2)
    })

    it('should filter photos by category', async () => {
      const { getPhotos } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findMany.mockResolvedValue([
        { id: 'p1', filename: 'photo1.jpg', category: 'front' }
      ])
      mockReq = { userId: 'user-123', query: { category: 'front' } }
      
      await getPhotos(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      expect(global.mockPrismaClient.photo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
            category: 'front'
          })
        })
      )
    })
  })

  describe('getPhotoCategories', () => {
    it('should return unique categories', async () => {
      const { getPhotoCategories } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findMany.mockResolvedValue([
        { category: 'front' },
        { category: 'front' },
        { category: 'side' },
        { category: null }
      ])
      mockReq = { userId: 'user-123' }
      
      await getPhotoCategories(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const result = mockRes.json.mock.calls[0][0]
      expect(result).toEqual(['front', 'side'])
    })
  })

  describe('getPhoto', () => {
    it('should return a single photo', async () => {
      const { getPhoto } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findFirst.mockResolvedValue({
        id: 'p1',
        filename: 'photo1.jpg',
        category: 'progress'
      })
      mockReq = { userId: 'user-123', params: { id: 'p1' } }
      
      await getPhoto(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      expect(global.mockPrismaClient.photo.findFirst).toHaveBeenCalledWith({
        where: { id: 'p1', userId: 'user-123' }
      })
    })

    it('should return 404 for non-existent photo', async () => {
      const { getPhoto } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findFirst.mockResolvedValue(null)
      mockReq = { userId: 'user-123', params: { id: 'nonexistent' } }
      
      await getPhoto(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('deletePhoto', () => {
    it('should delete a photo', async () => {
      const { deletePhoto } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findFirst.mockResolvedValue({
        id: 'p1',
        userId: 'user-123'
      })
      global.mockPrismaClient.photo.delete.mockResolvedValue({ id: 'p1' })
      mockReq = { userId: 'user-123', params: { id: 'p1' } }
      
      await deletePhoto(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      expect(global.mockPrismaClient.photo.delete).toHaveBeenCalledWith({
        where: { id: 'p1' }
      })
    })

    it('should return 404 for non-existent photo', async () => {
      const { deletePhoto } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findFirst.mockResolvedValue(null)
      mockReq = { userId: 'user-123', params: { id: 'nonexistent' } }
      
      await deletePhoto(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('updatePhoto', () => {
    it('should update photo details', async () => {
      const { updatePhoto } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findFirst.mockResolvedValue({
        id: 'p1',
        userId: 'user-123',
        category: 'front',
        notes: 'Old notes'
      })
      global.mockPrismaClient.photo.update.mockResolvedValue({
        id: 'p1',
        category: 'side',
        notes: 'New notes'
      })
      mockReq = {
        userId: 'user-123',
        params: { id: 'p1' },
        body: { category: 'side', notes: 'New notes' }
      }
      
      await updatePhoto(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })

    it('should return 404 for non-existent photo', async () => {
      const { updatePhoto } = require('../src/controllers/photoController')
      
      global.mockPrismaClient.photo.findFirst.mockResolvedValue(null)
      mockReq = {
        userId: 'user-123',
        params: { id: 'nonexistent' },
        body: { category: 'side' }
      }
      
      await updatePhoto(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })
})
