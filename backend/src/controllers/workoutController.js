const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const CLOCK_SKEW_TOLERANCE_MS = 60000

const parseCompletedAt = (value, { defaultToNow = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    return defaultToNow ? { date: new Date() } : { date: undefined }
  }
  if (typeof value !== 'string') {
    return { error: 'completedAt must be an ISO datetime string' }
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return { error: 'completedAt must be a valid datetime' }
  }
  if (date.getTime() > Date.now() + CLOCK_SKEW_TOLERANCE_MS) {
    return { error: 'completedAt cannot be in the future' }
  }
  return { date }
}

const getWorkouts = async (req, res) => {
  const { routineId } = req.params
  const { includeArchived } = req.query

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const where = { routineId }
  if (includeArchived !== 'true') {
    where.archived = false
  }

  const workouts = await prisma.workout.findMany({
    where,
    include: {
      exercises: {
        include: {
          sets: true
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  })

  res.json(workouts)
}

const createWorkout = async (req, res) => {
  const { routineId } = req.params
  const { name, scheduledDate } = req.body

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const lastWorkout = await prisma.workout.findFirst({
    where: { routineId },
    orderBy: { order: 'desc' }
  })

  const workout = await prisma.workout.create({
    data: {
      name,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      routineId,
      order: lastWorkout ? lastWorkout.order + 1 : 1
    }
  })

  res.status(201).json(workout)
}

const getWorkout = async (req, res) => {
  const { routineId, id } = req.params

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const workout = await prisma.workout.findFirst({
    where: { id, routineId },
    include: {
      exercises: {
        include: {
          sets: true,
          aerobicLog: true,
          flexibilityLog: true
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  res.json(workout)
}

const updateWorkout = async (req, res) => {
  const { routineId, id } = req.params
  const { name, scheduledDate, completedAt } = req.body

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const workout = await prisma.workout.findFirst({
    where: { id, routineId }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  const parsed = parseCompletedAt(completedAt)
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error })
  }

  const updated = await prisma.workout.update({
    where: { id },
    data: {
      name,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      completedAt: parsed.date
    }
  })

  res.json(updated)
}

const deleteWorkout = async (req, res) => {
  const { routineId, id } = req.params

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const workout = await prisma.workout.findFirst({
    where: { id, routineId }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  await prisma.workout.delete({ where: { id } })

  res.json({ message: 'Workout deleted successfully' })
}

const completeWorkout = async (req, res) => {
  const { id } = req.params
  const { completedAt } = req.body || {}

  const parsed = parseCompletedAt(completedAt, { defaultToNow: true })
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error })
  }

  const workout = await prisma.workout.findFirst({
    where: {
      id,
      routine: { userId: req.userId }
    }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  const updated = await prisma.workout.update({
    where: { id },
    data: {
      completedAt: parsed.date
    }
  })

  res.json(updated)
}

const archiveWorkout = async (req, res) => {
  const { routineId, id } = req.params

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const workout = await prisma.workout.findFirst({
    where: { id, routineId }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  const updated = await prisma.workout.update({
    where: { id },
    data: { archived: true }
  })

  res.json(updated)
}

const unarchiveWorkout = async (req, res) => {
  const { routineId, id } = req.params

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const workout = await prisma.workout.findFirst({
    where: { id, routineId }
  })

  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }

  const updated = await prisma.workout.update({
    where: { id },
    data: { archived: false }
  })

  res.json(updated)
}

const batchArchiveWorkouts = async (req, res) => {
  const { routineId } = req.params
  const { workoutIds, startDate, endDate, namePattern } = req.body

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const where = { routineId, archived: false }

  if (workoutIds && workoutIds.length > 0) {
    where.id = { in: workoutIds }
  } else {
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z')
    }
    if (namePattern) {
      where.name = { contains: namePattern, mode: 'insensitive' }
    }
  }

  const result = await prisma.workout.updateMany({
    where,
    data: { archived: true }
  })

  res.json({ archived: result.count })
}

const getArchivedWorkouts = async (req, res) => {
  const { routineId } = req.params

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const workouts = await prisma.workout.findMany({
    where: { routineId, archived: true },
    include: {
      exercises: {
        include: {
          sets: true
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  })

  res.json(workouts)
}

module.exports = {
  getWorkouts,
  createWorkout,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  completeWorkout,
  archiveWorkout,
  unarchiveWorkout,
  batchArchiveWorkouts,
  getArchivedWorkouts
}
