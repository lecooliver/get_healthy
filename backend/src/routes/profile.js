const express = require('express')
const multer = require('multer')
const path = require('path')
const authMiddleware = require('../middleware/auth')
const { getProfile, updateProfile, uploadAvatar, deleteAllData } = require('../controllers/profileController')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    }
    cb(new Error('Only image files are allowed'))
  }
})

router.use(authMiddleware)

router.get('/', getProfile)
router.put('/', updateProfile)
router.post('/avatar', upload.single('avatar'), uploadAvatar)
router.delete('/', deleteAllData)

module.exports = router
