require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const path = require('path')
const passport = require('passport')

const authRoutes = require('./routes/auth')
const oidcRoutes = require('./routes/oidc')
const profileRoutes = require('./routes/profile')
const measurementRoutes = require('./routes/measurements')
const routineRoutes = require('./routes/routines')
const workoutRoutes = require('./routes/workouts')
const exerciseRoutes = require('./routes/exercises')
const setRoutes = require('./routes/sets')
const logRoutes = require('./routes/logs')
const templateRoutes = require('./routes/templates')
const scheduleRoutes = require('./routes/schedule')
const reportRoutes = require('./routes/reports')
const exportRoutes = require('./routes/export')
const adminRoutes = require('./routes/admin')
const passwordResetRoutes = require('./routes/passwordReset')
const emailVerificationRoutes = require('./routes/emailVerification')
const aiRoutes = require('./routes/ai')
const exerciseLimitRoutes = require('./routes/exerciseLimits')
const photoRoutes = require('./routes/photos')

const { configurePassport } = require('./utils/passport-config')
const { seedPrebuiltTemplates } = require('./controllers/templateController')

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

configurePassport(passport)

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/auth/oidc', oidcRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/measurements', measurementRoutes)
app.use('/api/routines', routineRoutes)
app.use('/api/routines/:routineId/workouts', workoutRoutes)
app.use('/api/workouts/:workoutId/exercises', exerciseRoutes)
app.use('/api/exercises/:exerciseId/sets', setRoutes)
app.use('/api/password-reset', passwordResetRoutes)
app.use('/api/email', emailVerificationRoutes)
app.use('/api', logRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/dashboard', reportRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/limits', exerciseLimitRoutes)
app.use('/api/photos', photoRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  try {
    await seedPrebuiltTemplates()
    console.log('Prebuilt templates seeded successfully')
  } catch (error) {
    console.error('Failed to seed prebuilt templates:', error.message)
  }
})
