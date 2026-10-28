const request = require('supertest')
const express = require('express')

const authController = require('../src/controllers/authController')
const mockPrisma = global.mockPrismaClient

describe('Template seeding on registration API', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.post('/api/auth/register', authController.register)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const registerAs = (displayName, email) =>
    request(app).post('/api/auth/register').send({ displayName, email, password: 'password123' })

  it('seeds all prebuilt templates when the first user registers as admin', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.count.mockResolvedValue(0)
    mockPrisma.user.create.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'admin'
    })
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
      email: 'admin@example.com'
    })
    mockPrisma.template.findFirst.mockResolvedValue(null)
    mockPrisma.template.create.mockResolvedValue({})

    const res = await registerAs('Admin User', 'admin@example.com')

    expect(res.status).toBe(201)
    expect(res.body.user.role).toBe('admin')
    expect(mockPrisma.template.create).toHaveBeenCalledTimes(11)

    for (const call of mockPrisma.template.create.mock.calls) {
      expect(call[0].data.createdBy).toBe('admin-1')
      expect(call[0].data.isPublic).toBe(true)
    }
  })

  it('does not seed templates for subsequent registrations', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.count.mockResolvedValue(3)
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-4',
      email: 'later@example.com',
      displayName: 'Later User',
      role: 'user'
    })

    const res = await registerAs('Later User', 'later@example.com')

    expect(res.status).toBe(201)
    expect(res.body.user.role).toBe('user')
    expect(mockPrisma.template.findFirst).not.toHaveBeenCalled()
    expect(mockPrisma.template.create).not.toHaveBeenCalled()
  })

  it('still registers the admin successfully if template seeding fails', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.count.mockResolvedValue(0)
    mockPrisma.user.create.mockResolvedValue({
      id: 'admin-2',
      email: 'admin2@example.com',
      displayName: 'Admin Two',
      role: 'admin'
    })
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'admin-2',
      role: 'admin',
      email: 'admin2@example.com'
    })
    mockPrisma.template.findFirst.mockRejectedValue(new Error('database unavailable'))

    const res = await registerAs('Admin Two', 'admin2@example.com')

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.role).toBe('admin')
  })
})
