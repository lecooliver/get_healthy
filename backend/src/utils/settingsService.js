const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const KEYS = {
  SMTP: 'smtp',
  OIDC: 'oidc'
}

const getSetting = async (key) => {
  try {
    const record = await prisma.appSetting.findUnique({ where: { key } })
    return record ? JSON.parse(record.value) : {}
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error)
    return {}
  }
}

const setSetting = async (key, value) => {
  try {
    await prisma.appSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) }
    })
    return true
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error)
    return false
  }
}

const getAllSettings = async () => {
  const [oidc, smtp] = await Promise.all([
    getSetting(KEYS.OIDC),
    getSetting(KEYS.SMTP)
  ])
  return { oidc, smtp }
}

module.exports = {
  getSetting,
  setSetting,
  getAllSettings,
  KEYS
}
