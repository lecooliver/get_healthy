const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const { seedPrebuiltTemplates } = require('./templateController')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

const register = async (req, res) => {
  const { displayName, email, password } = req.body

  if (!displayName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    if (existingUser.provider !== 'local') {
      return res.status(400).json({ error: 'Email already registered with ' + existingUser.provider })
    }
    return res.status(400).json({ error: 'Email already registered' })
  }

  const userCount = await prisma.user.count()
  const isFirstUser = userCount === 0

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      displayName,
      email,
      passwordHash,
      emailVerified: true,
      role: isFirstUser ? 'admin' : 'user'
    }
  })

  const token = generateToken(user.id)

  if (isFirstUser && user.role === 'admin') {
    try {
      await seedPrebuiltTemplates()
    } catch (error) {
      console.error('Failed to seed templates after registration:', error.message)
    }
  }

  res.status(201).json({
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role
    },
    token
  })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  if (user.provider !== 'local' || !user.passwordHash) {
    return res.status(401).json({ error: 'Please use ' + (user.provider === 'local' ? 'OAuth' : user.provider) + ' to sign in' })
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash)

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = generateToken(user.id)

  res.json({
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role
    },
    token
  })
}

const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' })
}

const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      profile: true
    }
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    height: user.profile?.height,
    age: user.profile?.age,
    weightUnit: user.profile?.weightUnit || 'lb',
    avatarUrl: user.profile?.avatarUrl
  })
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  generateToken
}
