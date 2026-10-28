const express = require('express')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')

const router = express.Router({ mergeParams: true })

router.use(authMiddleware)

const validateCardioLog = [
  body('durationMinutes').optional().isInt({ min: 0 }),
  body('distance').optional().isFloat({ min: 0 }),
  body('heartRate').optional().isInt({ min: 0, max: 300 }),
  body('calories').optional().isInt({ min: 0 }),
  body('bloodPressureSystolic').optional().isInt({ min: 0 }),
  body('bloodPressureDiastolic').optional().isInt({ min: 0 }),
  body('spo2').optional().isInt({ min: 0, max: 100 })
]

router.post('/exercises/:exerciseId/cardio-log', validateCardioLog, async (req, res) => {
  const { exerciseId } = req.params
  const { durationMinutes, distance, distanceUnit, heartRate, calories, bloodPressureSystolic, bloodPressureDiastolic, spo2 } = req.body

  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

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

  const log = await prisma.aerobicLog.create({
    data: {
      exerciseId,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : 0,
      distance: distance ? parseFloat(distance) : null,
      distanceUnit: distanceUnit || 'miles',
      heartRate: heartRate ? parseInt(heartRate) : null,
      calories: calories ? parseInt(calories) : null,
      bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
      bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
      spo2: spo2 ? parseInt(spo2) : null
    }
  })

  res.status(201).json(log)
})

router.put('/cardio-logs/:id', validateCardioLog, async (req, res) => {
  const { id } = req.params
  const { durationMinutes, distance, distanceUnit, heartRate, calories, bloodPressureSystolic, bloodPressureDiastolic, spo2 } = req.body

  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  const existingLog = await prisma.aerobicLog.findFirst({
    where: {
      id,
      exercise: {
        workout: {
          routine: { userId: req.userId }
        }
      }
    }
  })

  if (!existingLog) {
    return res.status(404).json({ error: 'Log not found' })
  }

  const log = await prisma.aerobicLog.update({
    where: { id },
    data: {
      durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes) : existingLog.durationMinutes,
      distance: distance !== undefined ? (distance ? parseFloat(distance) : null) : existingLog.distance,
      distanceUnit: distanceUnit || existingLog.distanceUnit,
      heartRate: heartRate !== undefined ? (heartRate ? parseInt(heartRate) : null) : existingLog.heartRate,
      calories: calories !== undefined ? (calories ? parseInt(calories) : null) : existingLog.calories,
      bloodPressureSystolic: bloodPressureSystolic !== undefined ? (bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null) : existingLog.bloodPressureSystolic,
      bloodPressureDiastolic: bloodPressureDiastolic !== undefined ? (bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null) : existingLog.bloodPressureDiastolic,
      spo2: spo2 !== undefined ? (spo2 ? parseInt(spo2) : null) : existingLog.spo2
    }
  })

  res.json(log)
})

router.delete('/cardio-logs/:id', async (req, res) => {
  const { id } = req.params

  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  const existingLog = await prisma.aerobicLog.findFirst({
    where: {
      id,
      exercise: {
        workout: {
          routine: { userId: req.userId }
        }
      }
    }
  })

  if (!existingLog) {
    return res.status(404).json({ error: 'Log not found' })
  }

  await prisma.aerobicLog.delete({ where: { id } })

  res.json({ message: 'Log deleted successfully' })
})

router.post('/exercises/:exerciseId/flexibility-log', async (req, res) => {
  const { exerciseId } = req.params
  const { durationMinutes, notes } = req.body

  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

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

  const log = await prisma.flexibilityLog.create({
    data: {
      exerciseId,
      durationMinutes: parseInt(durationMinutes) || 0,
      notes: notes || null
    }
  })

  res.status(201).json(log)
})

module.exports = router
