const express = require('express')
const multer = require('multer')
const path = require('path')
const { body, validationResult } = require('express-validator')
const authMiddleware = require('../middleware/auth')
const { getMeasurements, getMeasurementHistory, addMeasurement, deleteMeasurement, getLatestMeasurement } = require('../controllers/measurementController')

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

const validateMeasurement = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('waist').optional().isFloat({ min: 0 }).withMessage('Waist must be a positive number'),
  body('hips').optional().isFloat({ min: 0 }).withMessage('Hips must be a positive number'),
  body('chest').optional().isFloat({ min: 0 }).withMessage('Chest must be a positive number'),
  body('thighL').optional().isFloat({ min: 0 }).withMessage('Left thigh must be a positive number'),
  body('thighR').optional().isFloat({ min: 0 }).withMessage('Right thigh must be a positive number'),
  body('bicepL').optional().isFloat({ min: 0 }).withMessage('Left bicep must be a positive number'),
  body('bicepR').optional().isFloat({ min: 0 }).withMessage('Right bicep must be a positive number'),
  body('shoulderSpan').optional().isFloat({ min: 0 }).withMessage('Shoulder span must be a positive number'),
  body('calfL').optional().isFloat({ min: 0 }).withMessage('Left calf must be a positive number'),
  body('calfR').optional().isFloat({ min: 0 }).withMessage('Right calf must be a positive number'),
  body('backSpan').optional().isFloat({ min: 0 }).withMessage('Back span must be a positive number'),
  body('neck').optional().isFloat({ min: 0 }).withMessage('Neck must be a positive number'),
  body('bodyFatPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Body fat percentage must be between 0 and 100')
]

router.use(authMiddleware)

router.get('/', getMeasurements)
router.get('/latest', getLatestMeasurement)
router.get('/history', getMeasurementHistory)
router.post('/', validateMeasurement, addMeasurement)
router.delete('/:id', deleteMeasurement)

module.exports = router
