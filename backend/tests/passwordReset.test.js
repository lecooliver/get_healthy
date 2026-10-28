describe('Password Reset Controller', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('forgotPassword validation', () => {
    it('should reject missing email', async () => {
      const { forgotPassword } = require('../src/controllers/passwordResetController')
      
      mockReq = { body: {} }
      await forgotPassword(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email is required' })
    })

    it('should return success for non-existent user (security)', async () => {
      const { forgotPassword } = require('../src/controllers/passwordResetController')
      
      global.mockPrismaClient.user.findUnique.mockResolvedValue(null)
      mockReq = { body: { email: 'nonexistent@test.com' } }
      
      await forgotPassword(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Password reset instructions sent to email'
      }))
    })
  })

  describe('resetPassword validation', () => {
    it('should reject missing token', async () => {
      const { resetPassword } = require('../src/controllers/passwordResetController')
      
      mockReq = { body: { password: 'password123' } }
      await resetPassword(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token and new password are required' })
    })

    it('should reject missing password', async () => {
      const { resetPassword } = require('../src/controllers/passwordResetController')
      
      mockReq = { body: { token: 'some-token' } }
      await resetPassword(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token and new password are required' })
    })

    it('should reject short password', async () => {
      const { resetPassword } = require('../src/controllers/passwordResetController')
      
      mockReq = { body: { token: 'some-token', password: '123' } }
      await resetPassword(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters' })
    })

    it('should reject invalid token', async () => {
      const { resetPassword } = require('../src/controllers/passwordResetController')
      
      global.mockPrismaClient.user.findFirst.mockResolvedValue(null)
      mockReq = { body: { token: 'invalid-token', password: 'password123' } }
      
      await resetPassword(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired reset token' })
    })
  })
})
