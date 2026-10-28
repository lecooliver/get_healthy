const express = require('express')
const { body } = require('express-validator')
const { forgotPassword, resetPassword } = require('../controllers/passwordResetController')

const router = express.Router()

const validateForgotPassword = [
  body('email').isEmail().withMessage('Valid email is required')
]

const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

router.post('/forgot-password', validateForgotPassword, forgotPassword)
router.post('/reset-password', validateResetPassword, resetPassword)

module.exports = router
