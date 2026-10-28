const express = require('express')
const authMiddleware = require('../middleware/auth')
const {
  getProgress,
  getCalories,
  getByTimeOfDay,
  getWorkoutFrequency,
  getDashboard
} = require('../controllers/reportController')

const router = express.Router()

router.use(authMiddleware)

router.get('/progress', getProgress)
router.get('/calories', getCalories)
router.get('/by-time-of-day', getByTimeOfDay)
router.get('/workout-frequency', getWorkoutFrequency)
router.get('/dashboard', getDashboard)

module.exports = router
