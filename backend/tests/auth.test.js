const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

describe('Auth Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('register validation', () => {
    it('should reject registration with missing fields', async () => {
      const { register } = require('../src/controllers/authController')
      
      mockReq = { body: { email: 'test@test.com' } }
      await register(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'All fields are required' })
    })

    it('should reject registration with short password', async () => {
      const { register } = require('../src/controllers/authController')
      
      mockReq = { body: { displayName: 'Test', email: 'test@test.com', password: '123' } }
      await register(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters' })
    })

    it('should reject duplicate email registration', async () => {
      const { register } = require('../src/controllers/authController')
      
      global.mockPrismaClient.user.findUnique.mockResolvedValue({ id: '123', provider: 'local' })
      mockReq = { body: { displayName: 'Test', email: 'test@test.com', password: 'password123' } }
      
      await register(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email already registered' })
    })
  })

  describe('login validation', () => {
    it('should reject login with missing credentials', async () => {
      const { login } = require('../src/controllers/authController')
      
      mockReq = { body: { email: 'test@test.com' } }
      await login(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email and password are required' })
    })

    it('should reject login for non-existent user', async () => {
      const { login } = require('../src/controllers/authController')
      
      global.mockPrismaClient.user.findUnique.mockResolvedValue(null)
      mockReq = { body: { email: 'test@test.com', password: 'password' } }
      
      await login(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid credentials' })
    })
  })

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const { generateToken } = require('../src/controllers/authController')
      const token = generateToken('user-123')
      
      const decoded = jwt.verify(token, 'test-secret-key')
      expect(decoded.userId).toBe('user-123')
    })
  })
})
