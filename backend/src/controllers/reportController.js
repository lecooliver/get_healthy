const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getProgress = async (req, res) => {
  const { metric = 'weight' } = req.query

  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'asc' },
    take: 90
  })

  const bodyProgress = measurements.map(m => ({
    date: m.date,
    value: m[metric]
  })).filter(p => p.value !== null)

  const strengthProgress = await getStrengthProgress(req.userId)

  res.json({
    body: bodyProgress,
    strength: strengthProgress
  })
}

const getStrengthProgress = async (userId) => {
  const sets = await prisma.exerciseSet.findMany({
    where: {
      exercise: {
        workout: {
          routine: { userId }
        },
        type: 'strength'
      },
      completed: true,
      weight: { gt: 0 }
    },
    include: {
      exercise: {
        include: {
          workout: {
            include: { routine: true }
          }
        }
      }
    },
    orderBy: [
      { exercise: { workout: { completedAt: 'asc' } } },
      { setNumber: 'asc' }
    ]
  })

  const exerciseProgress = {}

  for (const set of sets) {
    const exerciseName = set.exercise.name
    if (!exerciseProgress[exerciseName]) {
      exerciseProgress[exerciseName] = {
        name: exerciseName,
        data: [],
        maxWeight: 0,
        totalVolume: 0
      }
    }

    const workoutDate = set.exercise.workout.completedAt
    if (!workoutDate) continue

    const dateKey = workoutDate.toISOString().split('T')[0]
    const volume = set.weight * set.reps
    const existing = exerciseProgress[exerciseName].data.find(d => d.date === dateKey)

    if (existing) {
      existing.maxWeight = Math.max(existing.maxWeight, set.weight)
      existing.volume += volume
      existing.sets++
    } else {
      exerciseProgress[exerciseName].data.push({
        date: dateKey,
        maxWeight: set.weight,
        volume: volume,
        sets: 1
      })
    }
  }

  return Object.values(exerciseProgress).map(ex => ({
    name: ex.name,
    data: ex.data.sort((a, b) => a.date.localeCompare(b.date)),
    currentMax: ex.data.length > 0 ? ex.data[ex.data.length - 1].maxWeight : 0,
    startingMax: ex.data.length > 0 ? ex.data[0].maxWeight : 0,
    totalProgress: ex.data.length > 1
      ? Math.round((ex.data[ex.data.length - 1].maxWeight - ex.data[0].maxWeight) * 10) / 10
      : 0
  }))
}

const getCalories = async (req, res) => {
  const { range = 'week' } = req.query

  let startDate = new Date()
  if (range === 'week') {
    startDate.setDate(startDate.getDate() - 7)
  } else if (range === 'month') {
    startDate.setMonth(startDate.getMonth() - 1)
  } else if (range === 'year') {
    startDate.setFullYear(startDate.getFullYear() - 1)
  }

  const logs = await prisma.aerobicLog.findMany({
    where: {
      exercise: {
        workout: {
          routine: { userId: req.userId }
        }
      },
      createdAt: { gte: startDate }
    },
    include: {
      exercise: {
        include: {
          workout: true
        }
      }
    }
  })

  const calories = logs.map(l => ({
    date: l.createdAt,
    calories: l.calories || 0
  }))

  res.json(calories)
}

const getByTimeOfDay = async (req, res) => {
  const workouts = await prisma.workout.findMany({
    where: {
      routine: { userId: req.userId },
      completedAt: { not: null }
    },
    include: {
      routine: true,
      exercises: {
        include: {
          sets: true
        }
      }
    }
  })

  const byTime = {
    morning: { count: 0, avgDuration: 0, totalDuration: 0 },
    afternoon: { count: 0, avgDuration: 0, totalDuration: 0 },
    evening: { count: 0, avgDuration: 0, totalDuration: 0 }
  }

  workouts.forEach(w => {
    const hour = new Date(w.completedAt).getHours()
    let period
    if (hour >= 5 && hour < 12) period = 'morning'
    else if (hour >= 12 && hour < 17) period = 'afternoon'
    else period = 'evening'

    const duration = w.exercises.reduce((sum, e) => {
      return sum + (e.sets?.length * 3 || 0)
    }, 0)

    byTime[period].count++
    byTime[period].totalDuration += duration
    byTime[period].avgDuration = byTime[period].totalDuration / byTime[period].count
  })

  res.json(byTime)
}

const getWorkoutFrequency = async (req, res) => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const workouts = await prisma.workout.findMany({
    where: {
      routine: { userId: req.userId },
      completedAt: { gte: thirtyDaysAgo }
    },
    select: {
      completedAt: true,
      routine: {
        select: { type: true }
      }
    }
  })

  const frequency = workouts.reduce((acc, w) => {
    const date = new Date(w.completedAt).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { count: 0, types: {} }
    }
    acc[date].count++
    acc[date].types[w.routine.type] = (acc[date].types[w.routine.type] || 0) + 1
    return acc
  }, {})

  res.json(frequency)
}

const getDashboard = async (req, res) => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [weekWorkouts, totalWorkouts, recentWorkouts] = await Promise.all([
    prisma.workout.count({
      where: {
        routine: { userId: req.userId },
        completedAt: { gte: oneWeekAgo }
      }
    }),
    prisma.workout.count({
      where: {
        routine: { userId: req.userId },
        completedAt: { not: null }
      }
    }),
    prisma.workout.findMany({
      where: {
        routine: { userId: req.userId },
        completedAt: { not: null }
      },
      include: {
        routine: true
      },
      orderBy: { completedAt: 'desc' },
      take: 5
    })
  ])

  const streak = calculateStreak(req.userId)

  const totalCalories = await prisma.aerobicLog.aggregate({
    where: {
      exercise: {
        workout: {
          routine: { userId: req.userId }
        }
      }
    },
    _sum: {
      calories: true
    }
  })

  const recentActivity = recentWorkouts.map(w => ({
    id: w.id,
    name: w.name,
    date: w.completedAt.toISOString(),
    icon: getRoutineIcon(w.routine.type),
    duration: 30
  }))

  res.json({
    stats: {
      workoutsThisWeek: weekWorkouts,
      totalWorkouts,
      currentStreak: streak,
      caloriesBurned: totalCalories._sum.calories || 0
    },
    recentActivity
  })
}

const calculateStreak = async (userId) => {
  const workouts = await prisma.workout.findMany({
    where: {
      routine: { userId },
      completedAt: { not: null }
    },
    select: { completedAt: true },
    orderBy: { completedAt: 'desc' }
  })

  if (workouts.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const w of workouts) {
    const workoutDate = new Date(w.completedAt)
    workoutDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) {
      streak++
      currentDate = workoutDate
    } else {
      break
    }
  }

  return streak
}

const getRoutineIcon = (type) => {
  const icons = {
    weightlifting: '🏋️',
    aerobic: '🏃',
    flexibility: '🧘',
    combination: '💪'
  }
  return icons[type] || '💪'
}

module.exports = {
  getProgress,
  getCalories,
  getByTimeOfDay,
  getWorkoutFrequency,
  getDashboard
}
