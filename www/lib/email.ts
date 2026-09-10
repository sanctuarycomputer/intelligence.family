import { Resend } from 'resend';
import type { ReserveOutcome } from './preorder';

export async function sendOtpEmail(
  email: string,
  code: string
): Promise<boolean> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const from =
      process.env.RESEND_FROM ??
      'Family Intelligence <invest@mail.intelligence.family>';
    const replyTo = process.env.REPLY_TO;

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
    });

    return !error;
  } catch {
    return false;
  }
}

export const RESERVATION_EMAIL: Record<
  ReserveOutcome,
  { subject: string; text: string }
> = {
  reserve: {
    subject: "You're in line for the Flagship",
    text: [
      "You're in line for one of 250 Flagship founder units.",
      '',
      "Here's how it works. When deposits open we'll email you a payment link for the $49 refundable deposit. Paying it confirms your unit and locks the $899 launch price. The $850 balance is due when your unit ships, in 2027, to the United States.",
      '',
      'Change your mind at any point before it ships and we refund the deposit in full.',
      '',
      'Reply to this email with any question. A person reads every one.',
    ].join('\n'),
  },
  waitlist: {
    subject: "You're on the Flagship waitlist",
    text: [
      "All 250 founder units are spoken for, and you're on the waitlist. If a unit frees up we'll email you first.",
      '',
      'Reply to this email with any question. A person reads every one.',
    ].join('\n'),
  },
};

export async function sendReservationEmail(
  email: string,
  outcome: ReserveOutcome
): Promise<boolean> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const from =
      process.env.RESEND_FROM ??
      'Family Intelligence <invest@mail.intelligence.family>';
    const replyTo = process.env.REPLY_TO;
    const { subject, text } = RESERVATION_EMAIL[outcome];

    const { error } = await resend.emails.send({
      from,
      to: email,
      ...(replyTo ? { replyTo } : {}),
      subject,
      text,
    });

    return !error;
  } catch {
    return false;
  }
}
