const { getSetting, setSetting, getAllSettings, KEYS } = require('../utils/settingsService')
const nodemailer = require('nodemailer')

const getSettings = async (req, res) => {
  const settings = await getAllSettings()
  res.json(settings)
}

const updateOidcSettings = async (req, res) => {
  const saved = await setSetting(KEYS.OIDC, req.body)
  if (saved) {
    res.json({ message: 'OIDC settings saved' })
  } else {
    res.status(500).json({ error: 'Failed to save settings' })
  }
}

const updateSmtpSettings = async (req, res) => {
  const saved = await setSetting(KEYS.SMTP, req.body)
  if (saved) {
    res.json({ message: 'SMTP settings saved' })
  } else {
    res.status(500).json({ error: 'Failed to save settings' })
  }
}

const testSmtpSettings = async (req, res) => {
  const smtp = await getSetting(KEYS.SMTP)

  if (!smtp.host || !smtp.user || !smtp.pass) {
    return res.status(400).json({ error: 'SMTP settings not configured' })
  }

  try {
    const port = parseInt(smtp.port) || 587
    const secure = typeof smtp.secure === 'boolean' ? smtp.secure : String(smtp.secure) === 'true'

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port,
      secure,
      requireTLS: secure,
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1'
      },
      auth: {
        user: smtp.user,
        pass: smtp.pass
      }
    })

    await transporter.verify()

    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    const adminUser = await prisma.user.findFirst({ where: { id: req.userId } })

    if (adminUser && adminUser.email) {
      await transporter.sendMail({
        from: `"${smtp.fromName || 'Get Healthy'}" <${smtp.from || smtp.user}>`,
        to: adminUser.email,
        subject: 'Test Email from Get Healthy',
        text: 'This is a test email to verify your SMTP settings are working correctly.'
      })
    }

    res.json({ message: 'Test email sent successfully' })
  } catch (error) {
    console.error('SMTP test failed:', { host: smtp.host, port: smtp.port, secure: smtp.secure, error: error.message })
    res.status(500).json({ error: `SMTP test failed: ${error.message}` })
  }
}

module.exports = {
  getSettings,
  updateOidcSettings,
  updateSmtpSettings,
  testSmtpSettings
}
