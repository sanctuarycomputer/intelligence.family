import { NextRequest, NextResponse } from 'next/server'
import { verifyCode, isExpired } from '@/lib/otp'
import { consume } from '@/lib/rate-limit'
import {
  readPendingCookie,
  clearPendingCookie,
  sealPending,
  setPendingCookie,
  type PendingSession,
} from '@/lib/pending-session'
import { createCrmContact } from '@/lib/crm'

const MAX_ATTEMPTS = 5

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return 'unknown'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = clientIp(request)
  if (!consume(`verify-code:${ip}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  const session = await readPendingCookie(request)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'No pending code. Please request a new code.' }, { status: 400 })
  }
  if (isExpired(session.expiresAt)) {
    const res = NextResponse.json({ ok: false, error: 'Code expired. Please request a new code.' }, { status: 400 })
    clearPendingCookie(res)
    return res
  }

  let body: { code?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }
  const code = typeof body.code === 'string' ? body.code.trim() : ''

  if (!verifyCode(code, session.codeHash)) {
    const updated: PendingSession = { ...session, attempts: session.attempts + 1 }
    if (updated.attempts >= MAX_ATTEMPTS) {
      const res = NextResponse.json(
        { ok: false, error: 'Too many attempts. Please request a new code.' },
        { status: 400 }
      )
      clearPendingCookie(res)
      return res
    }
    const seal = await sealPending(updated)
    const res = NextResponse.json({
      ok: true,
      verified: false,
      attemptsRemaining: MAX_ATTEMPTS - updated.attempts,
    })
    setPendingCookie(res, seal)
    return res
  }

  await createCrmContact(session.email, `${session.source}-viewed`)
  const res = NextResponse.json({ ok: true, verified: true })
  clearPendingCookie(res)
  return res
}
