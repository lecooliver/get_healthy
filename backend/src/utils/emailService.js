const nodemailer = require('nodemailer')
const { getSetting, KEYS } = require('./settingsService')

let transporter = null

const buildMailConfig = (host, port, secure, user, pass) => ({
  host,
  port: parseInt(port) || 587,
  secure: typeof secure === 'boolean' ? secure : String(secure) === 'true',
  requireTLS: typeof secure === 'boolean' ? secure : String(secure) === 'true',
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1'
  },
  auth: { user, pass }
})

const createTransporter = async () => {
  if (transporter) return transporter

  const envHost = process.env.SMTP_HOST
  const envUser = process.env.SMTP_USER
  const envPass = process.env.SMTP_PASS

  if (envHost && envUser && envPass) {
    transporter = nodemailer.createTransport(buildMailConfig(
      envHost,
      parseInt(process.env.SMTP_PORT) || 587,
      process.env.SMTP_SECURE === 'true',
      envUser,
      envPass
    ))
    return transporter
  }

  const smtp = await getSetting(KEYS.SMTP)
  if (smtp.host && smtp.user && smtp.pass) {
    transporter = nodemailer.createTransport(buildMailConfig(
      smtp.host,
      smtp.port,
      smtp.secure,
      smtp.user,
      smtp.pass
    ))
    return transporter
  }

  return null
}

const resolveFrom = async (smtp) => {
  let fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER
  let fromName = process.env.SMTP_FROM_NAME || 'Get Healthy'
  if (!fromAddress) {
    fromAddress = smtp?.from || smtp?.user
    fromName = smtp?.fromName || fromName
  }
  return { fromAddress, fromName }
}

const sendEmail = async ({ to, subject, text, html }) => {
  const transport = await createTransporter()
  const smtp = await getSetting(KEYS.SMTP)
  const { fromAddress, fromName } = await resolveFrom(smtp)

  if (!transport) {
    console.log(`[Email Mock] To: ${to}`)
    console.log(`[Email Mock] Subject: ${subject}`)
    console.log(`[Email Mock] Body: ${text}`)
    return { success: false, mock: true }
  }

  try {
    const info = await transport.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>')
    })
    console.log(`Email sent to ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message)
    return { success: false, error: error.message }
  }
}

const sendVerificationEmail = async (email, verificationUrl) => {
  return sendEmail({
    to: email,
    subject: 'Verifique seu e-mail - Get Healthy',
    text: `Boas-vindas ao Get Healthy!\n\nVerifique seu e-mail clicando no link abaixo:\n\n${verificationUrl}\n\nEste link expira em 24 horas.\n\nSe você não criou uma conta, ignore este e-mail.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Boas-vindas ao Get Healthy!</h1>
        <p>Verifique seu e-mail clicando no botão abaixo:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verificar e-mail
          </a>
        </p>
        <p>Ou copie este link e cole no navegador:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">Este link expira em 24 horas. Se você não criou uma conta, ignore este e-mail.</p>
      </div>
    `
  })
}

const sendPasswordResetEmail = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: 'Redefina sua senha - Get Healthy',
    text: `Você solicitou a redefinição da senha.\n\nClique no link abaixo para criar uma nova senha:\n\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não fez esta solicitação, ignore este e-mail.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Redefinição de senha</h1>
        <p>Você solicitou a redefinição da senha. Clique no botão abaixo para criar uma nova senha:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Redefinir senha
          </a>
        </p>
        <p>Ou copie este link e cole no navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">Este link expira em 1 hora. Se você não fez esta solicitação, ignore este e-mail.</p>
      </div>
    `
  })
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
}
