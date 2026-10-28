const express = require('express')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const { register, login, logout, getMe } = require('../controllers/authController')

const router = express.Router()

const validateRegister = [
  body('displayName').trim().notEmpty().withMessage('Display name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]

router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/logout', logout)
router.get('/me', authMiddleware, getMe)

module.exports = router
