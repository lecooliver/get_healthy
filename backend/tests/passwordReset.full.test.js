describe('Password Reset Controller - Full', () => {
  let mockReq, mockRes

  beforeEach(() => {
    jest.clearAllMocks()
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      const { forgotPassword } = require('../src/controllers/passwordResetController')
      
      global.mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com'
      })
      global.mockPrismaClient.user.update.mockResolvedValue({
        id: 'user-123',
        resetToken: 'mock-token'
      })
      
      mockReq = { body: { email: 'test@test.com' } }
      
      await forgotPassword(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const response = mockRes.json.mock.calls[0][0]
      expect(response.message).toContain('instructions sent')
    })

    it('should return success even for non-existent user (security)', async () => {
      const { forgotPassword } = require('../src/controllers/passwordResetController')
      
      global.mockPrismaClient.user.findUnique.mockResolvedValue(null)
      
      mockReq = { body: { email: 'nonexistent@test.com' } }
      
      await forgotPassword(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalled()
      const response = mockRes.json.mock.calls[0][0]
      expect(response.message).toContain('instructions sent')
    })
  })

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const { resetPassword } = require('../src/controllers/passwordResetController')
      
      const futureDate = new Date(Date.now() + 3600000)
      global.mockPrismaClient.user.findFirst.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com'
      })
      global.mockPrismaClient.user.update.mockResolvedValue({
        id: 'user-123',
        passwordHash: 'hashed-password'
      })
      
      mockReq = { body: { token: 'valid-token', password: 'newpassword123' } }
      
      await resetPassword(mockReq, mockRes)
      
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Password has been reset successfully' })
    })

    it('should reject expired token', async () => {
      const { resetPassword } = require('../src/controllers/passwordResetController')
      
      global.mockPrismaClient.user.findFirst.mockResolvedValue(null)
      
      mockReq = { body: { token: 'expired-token', password: 'newpassword123' } }
      
      await resetPassword(mockReq, mockRes)
      
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired reset token' })
    })
  })
})
