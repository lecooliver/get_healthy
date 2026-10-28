const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const exportJSON = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      profile: true,
      routines: {
        include: {
          workouts: {
            include: {
              exercises: {
                include: {
                  sets: true,
                  aerobicLog: true,
                  flexibilityLog: true
                }
              }
            }
          }
        }
      }
    }
  })

  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'asc' }
  })

  const data = {
    exportDate: new Date().toISOString(),
    user: {
      displayName: user.displayName,
      email: user.email,
      profile: user.profile
    },
    routines: user.routines,
    measurements
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', 'attachment; filename=get_healthy_export.json')
  res.json(data)
}

const exportCSV = async (req, res) => {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'asc' }
  })

  const headers = [
    'Date',
    'Weight',
    'Body Fat %',
    'Waist',
    'Hips',
    'Chest',
    'Left Bicep',
    'Right Bicep',
    'Left Thigh',
    'Right Thigh',
    'Left Calf',
    'Right Calf',
    'Shoulder Span',
    'Back Span',
    'Neck'
  ]

  const rows = measurements.map(m => [
    m.date,
    m.weight,
    m.bodyFatPercentage,
    m.waist,
    m.hips,
    m.chest,
    m.bicepL,
    m.bicepR,
    m.thighL,
    m.thighR,
    m.calfL,
    m.calfR,
    m.shoulderSpan,
    m.backSpan,
    m.neck
  ])

  const csv = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=measurements_export.csv')
  res.send(csv)
}

module.exports = {
  exportJSON,
  exportCSV
}
