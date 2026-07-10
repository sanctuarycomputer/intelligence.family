import { Resend } from 'resend'

export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const from = process.env.RESEND_FROM ?? 'Family Intelligence <invest@intelligence.family>'
  const replyTo = process.env.REPLY_TO

  const { error } = await resend.emails.send({
    from,
    to: email,
    ...(replyTo ? { replyTo } : {}),
    subject: `Your Family Intelligence code: ${code}`,
    text: [
      'Welcome to Family Intelligence.',
      '',
      `Your verification code is ${code}.`,
      'It expires in 15 minutes.',
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
  })

  return !error
}
