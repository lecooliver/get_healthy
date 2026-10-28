const express = require('express')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const {
  getUsers,
  updateUser,
  deleteUser,
  getStats
} = require('../controllers/adminController')
const {
  getSettings,
  updateOidcSettings,
  updateSmtpSettings,
  testSmtpSettings
} = require('../controllers/settingsController')

const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/users', getUsers)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.get('/stats', getStats)

router.get('/settings', getSettings)
router.put('/settings/oidc', updateOidcSettings)
router.put('/settings/smtp', updateSmtpSettings)
router.post('/settings/smtp/test', testSmtpSettings)

module.exports = router
