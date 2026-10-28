const express = require('express')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const {
  getExercises,
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise
} = require('../controllers/exerciseController')

const router = express.Router({ mergeParams: true })

const validateExercise = [
  body('name').trim().notEmpty().withMessage('Exercise name is required'),
  body('type').isIn(['strength', 'cardio', 'flexibility']).withMessage('Invalid exercise type')
]

router.use(authMiddleware)

router.get('/', getExercises)
router.post('/', validateExercise, createExercise)
router.get('/:id', getExercise)
router.put('/:id', updateExercise)
router.delete('/:id', deleteExercise)

module.exports = router
