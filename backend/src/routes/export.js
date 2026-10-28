const express = require('express')
const authMiddleware = require('../middleware/auth')
const {
  exportJSON,
  exportCSV
} = require('../controllers/exportController')

const router = express.Router()

router.use(authMiddleware)

router.get('/json', exportJSON)
router.get('/csv', exportCSV)

module.exports = router
