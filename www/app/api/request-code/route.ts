import { NextRequest, NextResponse } from 'next/server'
import { generateCode, hashCode } from '@/lib/otp'
import { consume } from '@/lib/rate-limit'
import { sealPending, setPendingCookie, readPendingCookie, type PendingSession } from '@/lib/pending-session'
import { sendOtpEmail } from '@/lib/email'
import { createCrmContact } from '@/lib/crm'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000
const RESEND_COOLDOWN_MS = 60_000

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return 'unknown'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = clientIp(request)
  if (!consume(`request-code:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ ok: true }, { status: 429 })
  }

  let body: { email?: unknown; source?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const now = Date.now()
  const existing = await readPendingCookie(request)
  if (existing && now < existing.resendAt) {
    return NextResponse.json({ ok: true, resendAt: existing.resendAt })
  }

  const source = typeof body.source === 'string' ? body.source : 'g3d:family_intelligence'
  const code = generateCode()
  const session: PendingSession = {
    email,
    codeHash: hashCode(code),
    attempts: 0,
    expiresAt: now + 900_000,
    resendAt: now + RESEND_COOLDOWN_MS,
    source,
  }

  const sent = await sendOtpEmail(email, code)
  if (!sent) {
    return NextResponse.json({ ok: false, error: 'Could not send code. Please try again.' }, { status: 500 })
  }

  await createCrmContact(email, source)

  const seal = await sealPending(session)
  const res = NextResponse.json({ ok: true })
  setPendingCookie(res, seal)
  return res
}
