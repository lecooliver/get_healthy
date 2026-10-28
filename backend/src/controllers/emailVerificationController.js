const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const { sendVerificationEmail: sendEmail } = require('../utils/emailService')

const prisma = new PrismaClient()

const sendVerificationEmailToken = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user || user.emailVerified) {
    return null
  }

  const verificationToken = crypto.randomBytes(32).toString('hex')

  await prisma.user.update({
    where: { id: userId },
    data: { verificationToken }
  })

  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`

  if (process.env.NODE_ENV === 'development') {
    console.log(`Email verification link for ${user.email}: ${verifyUrl}`)
  }

  const emailEnabled = process.env.SMTP_HOST && process.env.SMTP_USER
  if (emailEnabled) {
    await sendEmail(user.email, verifyUrl)
  }

  return verificationToken
}

const verifyEmail = async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' })
  }

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      emailVerified: false
    }
  })

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification token' })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null
    }
  })

  res.json({ message: 'Email verified successfully' })
}

const resendVerification = async (req, res) => {
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (user.emailVerified) {
    return res.json({ message: 'Email already verified' })
  }

  const token = await sendVerificationEmailToken(userId)

  res.json({
    message: 'Verification email sent',
    verificationToken: process.env.NODE_ENV === 'development' ? token : undefined
  })
}

module.exports = {
  sendVerificationEmail: sendVerificationEmailToken,
  verifyEmail,
  resendVerification
}
