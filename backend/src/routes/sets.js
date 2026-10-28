const express = require('express')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const {
  getSets,
  createSet,
  updateSet,
  deleteSet
} = require('../controllers/setController')

const router = express.Router({ mergeParams: true })

const validateSet = [
  body('reps').optional().isInt({ min: 0 }).withMessage('Reps must be a positive integer'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('rpe').optional().isInt({ min: 1, max: 10 }).withMessage('RPE must be between 1 and 10')
]

router.use(authMiddleware)

router.get('/', getSets)
router.post('/', validateSet, createSet)
router.put('/:id', updateSet)
router.delete('/:id', deleteSet)

module.exports = router
