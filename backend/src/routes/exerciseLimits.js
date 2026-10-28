const express = require('express')
const { body, validationResult } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const { getLimits, getLimitsByExercise, setLimit, deleteLimit, checkLimitViolation } = require('../controllers/exerciseLimitController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', getLimits)
router.get('/exercise/:exerciseName', getLimitsByExercise)
router.post('/', setLimit)
router.post('/check', checkLimitViolation)
router.delete('/:id', deleteLimit)

module.exports = router
