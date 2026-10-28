const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getLimits = async (req, res) => {
  const limits = await prisma.exerciseLimit.findMany({
    where: { userId: req.userId },
    orderBy: [{ exerciseName: 'asc' }, { limitType: 'asc' }]
  })
  res.json(limits)
}

const getLimitsByExercise = async (req, res) => {
  const { exerciseName } = req.params
  const limits = await prisma.exerciseLimit.findMany({
    where: {
      userId: req.userId,
      exerciseName: {
        equals: exerciseName,
        mode: 'insensitive'
      }
    }
  })
  res.json(limits)
}

const setLimit = async (req, res) => {
  const { exerciseName, limitType, value, unit } = req.body

  if (!exerciseName || !limitType) {
    return res.status(400).json({ error: 'Exercise name and limit type are required' })
  }

  if (!['upper', 'lower'].includes(limitType)) {
    return res.status(400).json({ error: 'Limit type must be "upper" or "lower"' })
  }

  const limit = await prisma.exerciseLimit.upsert({
    where: {
      userId_exerciseName_limitType: {
        userId: req.userId,
        exerciseName,
        limitType
      }
    },
    update: {
      value: value ? parseFloat(value) : null,
      unit: unit || null
    },
    create: {
      userId: req.userId,
      exerciseName,
      limitType,
      value: value ? parseFloat(value) : null,
      unit: unit || null
    }
  })

  res.json(limit)
}

const deleteLimit = async (req, res) => {
  const { id } = req.params

  const limit = await prisma.exerciseLimit.findFirst({
    where: { id, userId: req.userId }
  })

  if (!limit) {
    return res.status(404).json({ error: 'Limit not found' })
  }

  await prisma.exerciseLimit.delete({
    where: { id }
  })

  res.json({ message: 'Limit deleted successfully' })
}

const checkLimitViolation = async (req, res) => {
  const { exerciseName, value } = req.body

  if (!exerciseName || value === undefined) {
    return res.status(400).json({ error: 'Exercise name and value are required' })
  }

  const limits = await prisma.exerciseLimit.findMany({
    where: {
      userId: req.userId,
      exerciseName: {
        equals: exerciseName,
        mode: 'insensitive'
      }
    }
  })

  const violations = []
  for (const limit of limits) {
    if (limit.value !== null) {
      const isViolation = limit.limitType === 'upper' 
        ? value > limit.value 
        : value < limit.value
      
      if (isViolation) {
        violations.push({
          limitType: limit.limitType,
          limitValue: limit.value,
          unit: limit.unit,
          actualValue: parseFloat(value)
        })
      }
    }
  }

  res.json({
    hasViolation: violations.length > 0,
    violations
  })
}

module.exports = {
  getLimits,
  getLimitsByExercise,
  setLimit,
  deleteLimit,
  checkLimitViolation
}
