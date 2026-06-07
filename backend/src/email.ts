import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(to: string, token: string) {
  return resend.emails.send({
    from: 'noreply@vodkeo.com',
    to,
    subject: 'Reset your Vodkeo password',
    html: `
      <p>You requested a password reset.</p>
      <p>Your reset token is: <strong>${token}</strong></p>
      <p>Enter this token on the password reset page. It expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  })
}

export async function sendEmailChangeEmail(to: string, token: string) {
  return resend.emails.send({
    from: 'noreply@vodkeo.com',
    to,
    subject: 'Confirm your Vodkeo email change',
    html: `
      <p>You requested an email change.</p>
      <p>Your confirmation token is: <strong>${token}</strong></p>
      <p>Enter this token to confirm the change. It expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  })
}