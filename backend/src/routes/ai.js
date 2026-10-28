const express = require('express')
const authMiddleware = require('../middleware/auth')
const {
  generateWorkoutSuggestion,
  generateMealSuggestion,
  analyzeWorkoutForm,
  generateRecoverySuggestion,
  isOllamaAvailable
} = require('../utils/aiIntegration')

const router = express.Router()

router.get('/status', async (req, res) => {
  const available = await isOllamaAvailable()
  res.json({
    available,
    provider: available ? 'ollama' : 'fallback'
  })
})

router.post('/workout-suggestion', authMiddleware, async (req, res) => {
  try {
    const { userProfile, preferences } = req.body
    const result = await generateWorkoutSuggestion(userProfile, preferences)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate workout suggestion' })
  }
})

router.post('/meal-suggestion', authMiddleware, async (req, res) => {
  try {
    const { userGoals } = req.body
    const result = await generateMealSuggestion(userGoals)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate meal suggestion' })
  }
})

router.post('/form-analysis', authMiddleware, async (req, res) => {
  try {
    const { exercise, feedback } = req.body
    const result = await analyzeWorkoutForm(exercise, feedback)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze form' })
  }
})

router.post('/recovery-suggestion', authMiddleware, async (req, res) => {
  try {
    const { workoutData, limits } = req.body
    const result = await generateRecoverySuggestion(workoutData, limits)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recovery suggestion' })
  }
})

module.exports = router
