const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getProfile = async (req, res) => {
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
    displayName: user.displayName,
    email: user.email,
    height: user.profile?.height,
    age: user.profile?.age,
    weight: user.profile?.weight,
    weightUnit: user.profile?.weightUnit || 'lb',
    avatarUrl: user.profile?.avatarUrl
  })
}

const updateProfile = async (req, res) => {
  const { displayName, height, age, weight, weightUnit } = req.body

  await prisma.user.update({
    where: { id: req.userId },
    data: { displayName }
  })

  await prisma.userProfile.upsert({
    where: { userId: req.userId },
    update: {
      height: height !== undefined && height !== null && height !== '' ? parseFloat(height) : null,
      age: age !== undefined && age !== null && age !== '' ? parseInt(age) : null,
      weight: weight !== undefined && weight !== null && weight !== '' ? parseFloat(weight) : null,
      weightUnit: weightUnit || 'lb'
    },
    create: {
      userId: req.userId,
      height: height !== undefined && height !== null && height !== '' ? parseFloat(height) : null,
      age: age !== undefined && age !== null && age !== '' ? parseInt(age) : null,
      weight: weight !== undefined && weight !== null && weight !== '' ? parseFloat(weight) : null,
      weightUnit: weightUnit || 'lb'
    }
  })

  res.json({ message: 'Profile updated successfully' })
}

const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const avatarUrl = `/uploads/${req.file.filename}`

  await prisma.userProfile.upsert({
    where: { userId: req.userId },
    update: { avatarUrl },
    create: {
      userId: req.userId,
      avatarUrl
    }
  })

  res.json({ avatarUrl })
}

const deleteAllData = async (req, res) => {
  await prisma.bodyMeasurement.deleteMany({
    where: { userId: req.userId }
  })

  await prisma.scheduledWorkout.deleteMany({
    where: { userId: req.userId }
  })

  const workouts = await prisma.workout.findMany({
    where: {
      routine: { userId: req.userId }
    },
    include: {
      exercises: {
        include: {
          sets: true
        }
      }
    }
  })

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      await prisma.exerciseSet.deleteMany({ where: { exerciseId: exercise.id } })
      await prisma.aerobicLog.deleteMany({ where: { exerciseId: exercise.id } })
      await prisma.flexibilityLog.deleteMany({ where: { exerciseId: exercise.id } })
    }
    await prisma.exercise.deleteMany({ where: { workoutId: workout.id } })
  }

  await prisma.workout.deleteMany({
    where: { routine: { userId: req.userId } }
  })

  await prisma.routine.deleteMany({
    where: { userId: req.userId }
  })

  await prisma.userProfile.deleteMany({
    where: { userId: req.userId }
  })

  await prisma.user.delete({
    where: { id: req.userId }
  })

  res.json({ message: 'All data deleted successfully' })
}

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAllData
}
