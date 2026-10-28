const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getMeasurements = async (req, res) => {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
    take: 30
  })

  res.json(measurements)
}

const getMeasurementHistory = async (req, res) => {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'asc' }
  })

  res.json(measurements)
}

const addMeasurement = async (req, res) => {
  const {
    date,
    weight,
    waist,
    hips,
    chest,
    thighL,
    thighR,
    bicepL,
    bicepR,
    shoulderSpan,
    calfL,
    calfR,
    backSpan,
    neck,
    bodyFatPercentage
  } = req.body

  const measurement = await prisma.bodyMeasurement.create({
    data: {
      userId: req.userId,
      date: new Date(date),
      weight: weight ? parseFloat(weight) : null,
      waist: waist ? parseFloat(waist) : null,
      hips: hips ? parseFloat(hips) : null,
      chest: chest ? parseFloat(chest) : null,
      thighL: thighL ? parseFloat(thighL) : null,
      thighR: thighR ? parseFloat(thighR) : null,
      bicepL: bicepL ? parseFloat(bicepL) : null,
      bicepR: bicepR ? parseFloat(bicepR) : null,
      shoulderSpan: shoulderSpan ? parseFloat(shoulderSpan) : null,
      calfL: calfL ? parseFloat(calfL) : null,
      calfR: calfR ? parseFloat(calfR) : null,
      backSpan: backSpan ? parseFloat(backSpan) : null,
      neck: neck ? parseFloat(neck) : null,
      bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : null
    }
  })

  res.status(201).json(measurement)
}

const deleteMeasurement = async (req, res) => {
  const { id } = req.params

  const measurement = await prisma.bodyMeasurement.findFirst({
    where: { id, userId: req.userId }
  })

  if (!measurement) {
    return res.status(404).json({ error: 'Measurement not found' })
  }

  await prisma.bodyMeasurement.delete({
    where: { id }
  })

  res.json({ message: 'Measurement deleted successfully' })
}

const getLatestMeasurement = async (req, res) => {
  const measurement = await prisma.bodyMeasurement.findFirst({
    where: { userId: req.userId },
    orderBy: { date: 'desc' }
  })

  res.json(measurement)
}

module.exports = {
  getMeasurements,
  getMeasurementHistory,
  addMeasurement,
  deleteMeasurement,
  getLatestMeasurement
}
