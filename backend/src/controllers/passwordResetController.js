const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { validationResult } = require('express-validator')
const { PrismaClient } = require('@prisma/client')
const { sendPasswordResetEmail } = require('../utils/emailService')

const prisma = new PrismaClient()

const forgotPassword = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return res.json({ message: 'Password reset instructions sent to email' })
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenExpiry = new Date(Date.now() + 3600000)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry
    }
  })

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

  if (process.env.NODE_ENV === 'development') {
    console.log(`Password reset link: ${resetUrl}`)
  }

  await sendPasswordResetEmail(user.email, resetUrl)

  res.json({
    message: 'Password reset instructions sent to email'
  })
}

const resetPassword = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  })

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null
    }
  })

  res.json({ message: 'Password has been reset successfully' })
}

module.exports = {
  forgotPassword,
  resetPassword
}
