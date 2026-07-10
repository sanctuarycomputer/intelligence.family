import { NextRequest, NextResponse } from 'next/server'
import { verifyCode, isExpired } from '@/lib/otp'
import {
  readPendingCookie,
  clearPendingCookie,
  sealPending,
  setPendingCookie,
  type PendingSession,
} from '@/lib/pending-session'
import { createCrmContact } from '@/lib/crm'

const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  await createCrmContact(session.email, session.source)
  const res = NextResponse.json({ ok: true, verified: true })
  clearPendingCookie(res)
  return res
}
