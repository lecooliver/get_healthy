const express = require('express')
const authMiddleware = require('../middleware/auth')
const {
  getTemplates,
  getPublicTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createFromWorkout,
  startFromTemplate
} = require('../controllers/templateController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', getTemplates)
router.get('/public', getPublicTemplates)
router.post('/', createTemplate)
router.post('/from-workout/:workoutId', createFromWorkout)
router.get('/:id', getTemplate)
router.put('/:id', updateTemplate)
router.delete('/:id', deleteTemplate)
router.post('/:id/start', startFromTemplate)

module.exports = router
