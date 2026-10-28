const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2'

const generateWorkoutSuggestion = async (userProfile, preferences) => {
  const prompt = buildWorkoutSuggestionPrompt(userProfile, preferences)
  return await callOllama(prompt)
}

const generateMealSuggestion = async (userGoals) => {
  const prompt = buildMealSuggestionPrompt(userGoals)
  return await callOllama(prompt)
}

const analyzeWorkoutForm = async (exercise, feedback) => {
  const prompt = buildFormAnalysisPrompt(exercise, feedback)
  return await callOllama(prompt)
}

const generateRecoverySuggestion = async (workoutData, limits) => {
  const prompt = buildRecoveryPrompt(workoutData, limits)
  return await callOllama(prompt)
}

const callOllama = async (prompt, systemPrompt = 'You are a helpful fitness and health assistant. Provide concise, actionable advice.') => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        system: systemPrompt,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      response: data.response
    }
  } catch (error) {
    console.error('Ollama integration error:', error.message)
    return {
      success: false,
      error: error.message,
      fallback: true,
      response: getFallbackResponse(prompt)
    }
  }
}

const buildWorkoutSuggestionPrompt = (userProfile, preferences) => {
  return `Suggest a personalized workout routine based on:
- Fitness level: ${userProfile.fitnessLevel || 'intermediate'}
- Goals: ${userProfile.goals || 'general fitness'}
- Available equipment: ${userProfile.equipment || 'basic'}
- Time available: ${preferences?.duration || 45} minutes
- Workout type preference: ${preferences?.type || 'strength'}

Provide a structured response with exercises, sets, reps, and rest periods.`
}

const buildMealSuggestionPrompt = (userGoals) => {
  return `Suggest a healthy meal plan based on:
- Calorie target: ${userGoals.calories || 2000}
- Dietary preferences: ${userGoals.preferences || 'balanced'}
- Macros goal: ${userGoals.macros || 'balanced'}

Provide meal suggestions with approximate macros.`
}

const buildFormAnalysisPrompt = (exercise, feedback) => {
  return `Analyze the following exercise form feedback:
Exercise: ${exercise}
Feedback: ${feedback}

Provide 2-3 specific tips to improve form.`
}

const buildRecoveryPrompt = (workoutData, limits) => {
  return `Based on this workout data:
- Exercise: ${workoutData.exercise}
- Weight used: ${workoutData.weight}
- Limits exceeded: ${limits?.exceeded ? 'Yes' : 'No'}

Suggest recovery tips including rest, nutrition, and mobility exercises.`
}

const getFallbackResponse = (prompt) => {
  if (prompt.includes('workout')) {
    return 'Based on your profile, aim for 3-4 workouts per week combining strength and cardio.'
  }
  if (prompt.includes('meal') || prompt.includes('nutrition')) {
    return 'Focus on balanced meals with lean protein, complex carbs, and vegetables.'
  }
  if (prompt.includes('form')) {
    return 'Focus on controlled movements and proper breathing throughout the exercise.'
  }
  return 'Stay consistent with your workouts and listen to your body for recovery needs.'
}

const isOllamaAvailable = async () => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`)
    return response.ok
  } catch {
    return false
  }
}

module.exports = {
  generateWorkoutSuggestion,
  generateMealSuggestion,
  analyzeWorkoutForm,
  generateRecoverySuggestion,
  isOllamaAvailable
}
