const express = require('express')
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const { verifyEmail, resendVerification } = require('../controllers/emailVerificationController')

const router = express.Router()

const validateVerifyEmail = [
  body('token').notEmpty().withMessage('Verification token is required')
]

router.post('/verify', validateVerifyEmail, verifyEmail)
router.post('/resend', authMiddleware, resendVerification)

module.exports = router
