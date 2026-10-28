const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getSchedule = async (req, res) => {
  const schedules = await prisma.scheduledWorkout.findMany({
    where: { userId: req.userId },
    include: {
      routine: true
    },
    orderBy: { scheduledDate: 'asc' }
  })

  res.json(schedules)
}

const createSchedule = async (req, res) => {
  const { routineId, scheduledDate, cadenceType, cadenceValue } = req.body

  const schedule = await prisma.scheduledWorkout.create({
    data: {
      userId: req.userId,
      routineId,
      scheduledDate: new Date(scheduledDate),
      cadenceType,
      cadenceValue: cadenceValue ? parseInt(cadenceValue) : null
    },
    include: {
      routine: true
    }
  })

  res.status(201).json(schedule)
}

const updateSchedule = async (req, res) => {
  const { id } = req.params
  const { scheduledDate, cadenceType, cadenceValue } = req.body

  const schedule = await prisma.scheduledWorkout.findFirst({
    where: { id, userId: req.userId }
  })

  if (!schedule) {
    return res.status(404).json({ error: 'Schedule not found' })
  }

  const updated = await prisma.scheduledWorkout.update({
    where: { id },
    data: {
      scheduledDate: new Date(scheduledDate),
      cadenceType,
      cadenceValue: cadenceValue ? parseInt(cadenceValue) : null
    },
    include: {
      routine: true
    }
  })

  res.json(updated)
}

const deleteSchedule = async (req, res) => {
  const { id } = req.params

  const schedule = await prisma.scheduledWorkout.findFirst({
    where: { id, userId: req.userId }
  })

  if (!schedule) {
    return res.status(404).json({ error: 'Schedule not found' })
  }

  await prisma.scheduledWorkout.delete({
    where: { id }
  })

  res.json({ message: 'Schedule deleted successfully' })
}

module.exports = {
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule
}
