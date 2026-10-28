const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  res.json(users)
}

const updateUser = async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      createdAt: true
    }
  })

  res.json(user)
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  if (id === req.userId) {
    return res.status(400).json({ error: 'Cannot delete your own account' })
  }

  await prisma.bodyMeasurement.deleteMany({
    where: { userId: id }
  })

  await prisma.userProfile.deleteMany({
    where: { userId: id }
  })

  await prisma.user.delete({
    where: { id }
  })

  res.json({ message: 'User deleted successfully' })
}

const getStats = async (req, res) => {
  const [totalUsers, adminUsers, totalWorkouts, totalMeasurements] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.workout.count({ where: { completedAt: { not: null } } }),
    prisma.bodyMeasurement.count()
  ])

  res.json({
    totalUsers,
    adminUsers,
    totalWorkouts,
    totalMeasurements
  })
}

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getStats
}
