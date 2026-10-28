const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getRoutines = async (req, res) => {
  const routines = await prisma.routine.findMany({
    where: { userId: req.userId },
    include: {
      _count: {
        select: { workouts: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  res.json(routines.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    createdAt: r.createdAt,
    workoutCount: r._count.workouts
  })))
}

const createRoutine = async (req, res) => {
  const { name, type } = req.body

  const routine = await prisma.routine.create({
    data: {
      name,
      type,
      userId: req.userId
    }
  })

  res.status(201).json(routine)
}

const getRoutine = async (req, res) => {
  const { id } = req.params

  const routine = await prisma.routine.findFirst({
    where: {
      id,
      userId: req.userId
    },
    include: {
      workouts: {
        include: {
          exercises: {
            include: {
              sets: true,
              aerobicLog: true,
              flexibilityLog: true
            }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  res.json(routine)
}

const updateRoutine = async (req, res) => {
  const { id } = req.params
  const { name, type } = req.body

  const routine = await prisma.routine.findFirst({
    where: { id, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  const updated = await prisma.routine.update({
    where: { id },
    data: { name, type }
  })

  res.json(updated)
}

const deleteRoutine = async (req, res) => {
  const { id } = req.params

  const routine = await prisma.routine.findFirst({
    where: { id, userId: req.userId }
  })

  if (!routine) {
    return res.status(404).json({ error: 'Routine not found' })
  }

  await prisma.routine.delete({ where: { id } })

  res.json({ message: 'Routine deleted successfully' })
}

module.exports = {
  getRoutines,
  createRoutine,
  getRoutine,
  updateRoutine,
  deleteRoutine
}
