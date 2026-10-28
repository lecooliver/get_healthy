const express = require('express')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const {
  getRoutines,
  createRoutine,
  getRoutine,
  updateRoutine,
  deleteRoutine
} = require('../controllers/routineController')

const router = express.Router()

const validateRoutine = [
  body('name').trim().notEmpty().withMessage('Routine name is required'),
  body('type').isIn(['weightlifting', 'aerobic', 'flexibility', 'combination']).withMessage('Invalid routine type')
]

router.use(authMiddleware)

router.get('/', getRoutines)
router.post('/', validateRoutine, createRoutine)
router.get('/:id', getRoutine)
router.put('/:id', validateRoutine, updateRoutine)
router.delete('/:id', deleteRoutine)

module.exports = router
