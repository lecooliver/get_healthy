const request = require('supertest')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'test-secret-key'
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  passwordHash: bcrypt.hashSync('password123', 10),
  role: 'user',
  provider: 'local',
  emailVerified: true
}

const mockPrisma = global.mockPrismaClient

const authController = require('../src/controllers/authController')
const scheduleController = require('../src/controllers/scheduleController')
const templateController = require('../src/controllers/templateController')

describe('Auth API', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.post('/api/auth/register', authController.register)
    app.post('/api/auth/login', authController.login)
    app.get('/api/auth/me', authController.getMe)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.count.mockResolvedValue(1)
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'new@example.com',
        displayName: 'New User',
        role: 'user'
      })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'New User',
          email: 'new@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('email', 'new@example.com')
    })

    it('should assign admin role to first user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.count.mockResolvedValue(0)
      mockPrisma.user.create.mockResolvedValue({
        id: 'admin-user-id',
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: 'admin'
      })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Admin User',
          email: 'admin@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(201)
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'admin'
          })
        })
      )
    })

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('All fields are required')
    })

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Test',
          email: 'test@example.com',
          password: '123'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Password must be at least 6 characters')
    })

    it('should reject duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user', provider: 'local' })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Test',
          email: 'existing@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Email already registered')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user.email).toBe('test@example.com')
    })

    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Email and password are required')
    })

    it('should reject login with wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Invalid credentials')
    })

    it('should reject login for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Invalid credentials')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const middleware = (req, res, next) => {
        req.userId = 'user-123'
        next()
      }

      const testApp = express()
      testApp.use(express.json())
      testApp.use(middleware)
      testApp.get('/api/auth/me', authController.getMe)

      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        profile: { height: 70, age: 25, weightUnit: 'lb' }
      })

      const res = await request(testApp)
        .get('/api/auth/me')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('email', 'test@example.com')
      expect(res.body).toHaveProperty('height', 70)
    })
  })
})

describe('Schedule API', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.get('/api/schedule', scheduleController.getSchedule)
    app.post('/api/schedule', scheduleController.createSchedule)
    app.delete('/api/schedule/:id', scheduleController.deleteSchedule)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/schedule', () => {
    it('should return user schedule', async () => {
      const middleware = (req, res, next) => {
        req.userId = 'user-123'
        next()
      }

      const testApp = express()
      testApp.use(express.json())
      testApp.use(middleware)
      testApp.get('/api/schedule', scheduleController.getSchedule)

      const mockSchedules = [
        { id: '1', routineId: 'r1', scheduledDate: new Date(), routine: { name: 'Morning Workout' } },
        { id: '2', routineId: 'r2', scheduledDate: new Date(), routine: { name: 'Evening Run' } }
      ]

      mockPrisma.scheduledWorkout.findMany.mockResolvedValue(mockSchedules)

      const res = await request(testApp)
        .get('/api/schedule')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0]).toHaveProperty('routine')
    })
  })

  describe('POST /api/schedule', () => {
    it('should create a new scheduled workout', async () => {
      const middleware = (req, res, next) => {
        req.userId = 'user-123'
        next()
      }

      const testApp = express()
      testApp.use(express.json())
      testApp.use(middleware)
      testApp.post('/api/schedule', scheduleController.createSchedule)

      const newSchedule = {
        id: 'new-schedule-id',
        routineId: 'routine-1',
        scheduledDate: new Date('2024-12-25'),
        routine: { id: 'routine-1', name: 'Test Routine' }
      }

      mockPrisma.scheduledWorkout.create.mockResolvedValue(newSchedule)

      const res = await request(testApp)
        .post('/api/schedule')
        .send({
          routineId: 'routine-1',
          scheduledDate: '2024-12-25',
          cadenceType: 'once'
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id', 'new-schedule-id')
    })
  })

  describe('DELETE /api/schedule/:id', () => {
    it('should delete a scheduled workout', async () => {
      const middleware = (req, res, next) => {
        req.userId = 'user-123'
        next()
      }

      const testApp = express()
      testApp.use(express.json())
      testApp.use(middleware)
      testApp.delete('/api/schedule/:id', scheduleController.deleteSchedule)

      mockPrisma.scheduledWorkout.findFirst.mockResolvedValue({ id: 'schedule-1' })
      mockPrisma.scheduledWorkout.delete.mockResolvedValue({ id: 'schedule-1' })

      const res = await request(testApp)
        .delete('/api/schedule/schedule-1')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('message', 'Schedule deleted successfully')
    })

    it('should return 404 for non-existent schedule', async () => {
      const middleware = (req, res, next) => {
        req.userId = 'user-123'
        next()
      }

      const testApp = express()
      testApp.use(express.json())
      testApp.use(middleware)
      testApp.delete('/api/schedule/:id', scheduleController.deleteSchedule)

      mockPrisma.scheduledWorkout.findFirst.mockResolvedValue(null)

      const res = await request(testApp)
        .delete('/api/schedule/nonexistent')

      expect(res.status).toBe(404)
    })
  })
})

describe('Template API', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.get('/api/templates', templateController.getTemplates)
    app.get('/api/templates/public', templateController.getPublicTemplates)
    app.get('/api/templates/:id', templateController.getTemplate)
    app.post('/api/templates', templateController.createTemplate)
    app.post('/api/templates/:id/start', templateController.startFromTemplate)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/templates', () => {
    it('should return templates with exercise groups', async () => {
      const middleware = (req, res, next) => {
        req.userId = 'user-123'
        next()
      }

      const testApp = express()
      testApp.use(express.json())
      testApp.use(middleware)
      testApp.get('/api/templates', templateController.getTemplates)

      mockPrisma.template.findMany.mockResolvedValue([
        {
          id: 't1',
          name: 'Test Template',
          workouts: [
            {
              id: 'w1',
              exerciseGroups: [
                {
                  id: 'g1',
                  name: 'Main Lifts',
                  exercises: [
                    { id: 'e1', name: 'Squat' }
                  ]
                }
              ]
            }
          ]
        }
      ])

      const res = await request(testApp)
        .get('/api/templates')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].workouts[0].exerciseGroups).toBeDefined()
      expect(res.body[0].workouts[0].exerciseGroups[0].exercises).toBeDefined()
    })
  })

  describe('POST /api/templates', () => {
    it('should create template with exercise groups', async () => {
      const middleware = (req, res, next) => {
        req.userId = 'user-123'
        next()
      }

      const testApp = express()
      testApp.use(express.json())
      testApp.use(middleware)
      testApp.post('/api/templates', templateController.createTemplate)

      mockPrisma.template.create.mockResolvedValue({
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

      const res = await request(testApp)
        .post('/api/templates')
        .send({
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
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(mockPrisma.template.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New Template',
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
  })
})
