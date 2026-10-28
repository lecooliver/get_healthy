const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getSets = async (req, res) => {
  const { exerciseId } = req.params

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      workout: {
        routine: { userId: req.userId }
      }
    }
  })

  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' })
  }

  const sets = await prisma.exerciseSet.findMany({
    where: { exerciseId },
    orderBy: { setNumber: 'asc' }
  })

  res.json(sets)
}

const createSet = async (req, res) => {
  const { exerciseId } = req.params
  const { reps, weight, rpe } = req.body

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      workout: {
        routine: { userId: req.userId }
      }
    }
  })

  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' })
  }

  const lastSet = await prisma.exerciseSet.findFirst({
    where: { exerciseId },
    orderBy: { setNumber: 'desc' }
  })

  const set = await prisma.exerciseSet.create({
    data: {
      exerciseId,
      setNumber: lastSet ? lastSet.setNumber + 1 : 1,
      reps: reps ? parseInt(reps) : 0,
      weight: weight ? parseFloat(weight) : 0,
      rpe: rpe ? parseInt(rpe) : null,
      completed: false
    }
  })

  res.status(201).json(set)
}

const updateSet = async (req, res) => {
  const { id } = req.params
  const { reps, weight, rpe, completed } = req.body

  const set = await prisma.exerciseSet.findFirst({
    where: {
      id,
      exercise: {
        workout: {
          routine: { userId: req.userId }
        }
      }
    }
  })

  if (!set) {
    return res.status(404).json({ error: 'Set not found' })
  }

  const updated = await prisma.exerciseSet.update({
    where: { id },
    data: {
      reps: reps !== undefined ? parseInt(reps) : undefined,
      weight: weight !== undefined ? parseFloat(weight) : undefined,
      rpe: rpe !== undefined ? (rpe ? parseInt(rpe) : null) : undefined,
      completed: completed !== undefined ? Boolean(completed) : undefined
    }
  })

  res.json(updated)
}

const deleteSet = async (req, res) => {
  const { id } = req.params

  const set = await prisma.exerciseSet.findFirst({
    where: {
      id,
      exercise: {
        workout: {
          routine: { userId: req.userId }
        }
      }
    }
  })

  if (!set) {
    return res.status(404).json({ error: 'Set not found' })
  }

  await prisma.exerciseSet.delete({ where: { id } })

  res.json({ message: 'Set deleted successfully' })
}

module.exports = {
  getSets,
  createSet,
  updateSet,
  deleteSet
}
