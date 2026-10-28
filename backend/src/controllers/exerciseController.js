const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getExercises = async (req, res) => {
  const { workoutId } = req.params

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      routine: { userId: req.userId }
    }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  const exercises = await prisma.exercise.findMany({
    where: { workoutId },
    include: {
      sets: true,
      aerobicLogs: true,
      flexibilityLogs: true
    },
    orderBy: { order: 'asc' }
  })

  res.json(exercises)
}

const createExercise = async (req, res) => {
  const { workoutId } = req.params
  const { name, type } = req.body

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      routine: { userId: req.userId }
    }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  const lastExercise = await prisma.exercise.findFirst({
    where: { workoutId },
    orderBy: { order: 'desc' }
  })

  const exercise = await prisma.exercise.create({
    data: {
      name,
      type,
      workoutId,
      order: lastExercise ? lastExercise.order + 1 : 1
    },
    include: {
      sets: true
    }
  })

  res.status(201).json(exercise)
}

const getExercise = async (req, res) => {
  const { id } = req.params

  const exercise = await prisma.exercise.findFirst({
    where: {
      id,
      workout: {
        routine: { userId: req.userId }
      }
    },
    include: {
      sets: true,
      aerobicLogs: true,
      flexibilityLogs: true
    }
  })

  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' })
  }

  res.json(exercise)
}

const updateExercise = async (req, res) => {
  const { id } = req.params
  const { name, type } = req.body

  const exercise = await prisma.exercise.findFirst({
    where: {
      id,
      workout: {
        routine: { userId: req.userId }
      }
    }
  })

  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' })
  }

  const updated = await prisma.exercise.update({
    where: { id },
    data: { name, type }
  })

  res.json(updated)
}

const deleteExercise = async (req, res) => {
  const { id } = req.params

  const exercise = await prisma.exercise.findFirst({
    where: {
      id,
      workout: {
        routine: { userId: req.userId }
      }
    }
  })

  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' })
  }

  await prisma.exerciseSet.deleteMany({ where: { exerciseId: id } })
  await prisma.aerobicLog.deleteMany({ where: { exerciseId: id } })
  await prisma.flexibilityLog.deleteMany({ where: { exerciseId: id } })
  await prisma.exercise.delete({ where: { id } })

  res.json({ message: 'Exercise deleted successfully' })
}

module.exports = {
  getExercises,
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise
}
