import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 4000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
const smtpPort = Number(process.env.SMTP_PORT) || 587
const smtpSecure = process.env.SMTP_SECURE === 'true' ? true : false
const enquiryTo = process.env.ENQUIRY_TO || smtpUser

if (!smtpUser || !smtpPass) {
  console.warn('SMTP_USER or SMTP_PASS not set. Email sending will fail until .env is configured.')
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
})

app.post('/api/enquiry', async (req, res) => {
  const { name, email, phone, destination, message, source } = req.body || {}

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const subject = `New travel enquiry from ${name}`
  const textBody = `New enquiry from Dakshin Trips website\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDestination: ${destination || '-'}\nSource: ${source || '-'}\n\nMessage:\n${message || '-'}\n`

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: enquiryTo,
      replyTo: email,
      subject,
      text: textBody,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Error sending enquiry email', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
})

app.listen(port, () => {
  console.log(`Dakshin Trips enquiry server listening on http://localhost:${port}`)
})
