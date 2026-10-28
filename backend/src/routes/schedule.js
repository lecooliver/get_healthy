const express = require('express')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const {
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController')

const router = express.Router()

const validateSchedule = [
  body('routineId').notEmpty().withMessage('Routine ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required')
]

router.use(authMiddleware)

router.get('/', getSchedule)
router.post('/', validateSchedule, createSchedule)
router.put('/:id', validateSchedule, updateSchedule)
router.delete('/:id', deleteSchedule)

module.exports = router
