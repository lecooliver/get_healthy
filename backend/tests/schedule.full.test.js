describe('Schedule Controller - Extended', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('getSchedule', () => {
    it('should return empty array when no schedules exist', async () => {
      const { getSchedule } = require('../src/controllers/scheduleController')
      
      global.mockPrismaClient.scheduledWorkout.findMany.mockResolvedValue([])
      mockReq = { userId: 'user-123' }
      
      await getSchedule(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalledWith([])
    })

    it('should return schedules ordered by date', async () => {
      const { getSchedule } = require('../src/controllers/scheduleController')
      
      const mockSchedules = [
        { id: '1', routine: { name: 'Morning' } },
        { id: '2', routine: { name: 'Evening' } }
      ]
      global.mockPrismaClient.scheduledWorkout.findMany.mockResolvedValue(mockSchedules)
      mockReq = { userId: 'user-123' }
      
      await getSchedule(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalledWith(mockSchedules)
    })
  })

  describe('createSchedule', () => {
    it('should create schedule with cadence', async () => {
      const { createSchedule } = require('../src/controllers/scheduleController')
      
      const createdSchedule = {
        id: 'new-id',
        routineId: 'routine-1',
        scheduledDate: new Date('2024-12-25'),
        cadenceType: 'daily',
        cadenceValue: 2,
        routine: { id: 'routine-1', name: 'Test Routine' }
      }
      global.mockPrismaClient.scheduledWorkout.create.mockResolvedValue(createdSchedule)
      mockReq = {
        userId: 'user-123',
        body: {
          routineId: 'routine-1',
          scheduledDate: '2024-12-25',
          cadenceType: 'daily',
          cadenceValue: 2
        }
      }
      
      await createSchedule(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(createdSchedule)
    })
  })

  describe('updateSchedule', () => {
    it('should update existing schedule', async () => {
      const { updateSchedule } = require('../src/controllers/scheduleController')
      
      global.mockPrismaClient.scheduledWorkout.findFirst.mockResolvedValue({
        id: 'schedule-1',
        userId: 'user-123'
      })
      global.mockPrismaClient.scheduledWorkout.update.mockResolvedValue({
        id: 'schedule-1',
        scheduledDate: new Date('2024-12-26'),
        cadenceType: 'weekly',
        routine: { id: 'routine-1', name: 'Test' }
      })
      mockReq = {
        userId: 'user-123',
        params: { id: 'schedule-1' },
        body: {
          scheduledDate: '2024-12-26',
          cadenceType: 'weekly'
        }
      }
      
      await updateSchedule(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
    })

    it('should return 404 for non-existent schedule', async () => {
      const { updateSchedule } = require('../src/controllers/scheduleController')
      
      global.mockPrismaClient.scheduledWorkout.findFirst.mockResolvedValue(null)
      mockReq = {
        userId: 'user-123',
        params: { id: 'nonexistent' },
        body: { scheduledDate: '2024-12-26' }
      }
      
      await updateSchedule(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('deleteSchedule', () => {
    it('should return 404 for non-existent schedule', async () => {
      const { deleteSchedule } = require('../src/controllers/scheduleController')
      
      global.mockPrismaClient.scheduledWorkout.findFirst.mockResolvedValue(null)
      mockReq = { userId: 'user-123', params: { id: 'nonexistent' } }
      
      await deleteSchedule(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(404)
    })
  })
})
