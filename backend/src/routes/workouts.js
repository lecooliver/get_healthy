const express = require('express')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const {
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
} = require('../controllers/workoutController')

const router = express.Router({ mergeParams: true })

const validateWorkout = [
  body('name').trim().notEmpty().withMessage('Workout name is required')
]

router.use(authMiddleware)

router.get('/', getWorkouts)
router.get('/archived', getArchivedWorkouts)
router.post('/', validateWorkout, createWorkout)
router.get('/:id', getWorkout)
router.put('/:id', updateWorkout)
router.delete('/:id', deleteWorkout)
router.post('/:id/complete', completeWorkout)
router.post('/:id/archive', archiveWorkout)
router.post('/:id/unarchive', unarchiveWorkout)
router.post('/batch-archive', batchArchiveWorkouts)

module.exports = router
