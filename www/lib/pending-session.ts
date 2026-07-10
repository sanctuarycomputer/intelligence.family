import { NextRequest, NextResponse } from 'next/server'
import { sealData, unsealData } from 'iron-session'

export const PENDING_COOKIE = 'fi_pending'
export const PENDING_TTL_MS = 900_000 // 15 minutes

export type PendingSession = {
  email: string
  codeHash: string
  attempts: number
  expiresAt: number
  resendAt: number
  source: string
}

function password(): string {
  const pw = process.env.SESSION_SECRET
  if (!pw || pw.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters')
  }
  return pw
}

function isPendingSession(v: unknown): v is PendingSession {
  if (!v || typeof v !== 'object') return false
  const s = v as Record<string, unknown>
  return (
    typeof s.email === 'string' &&
    typeof s.codeHash === 'string' &&
    typeof s.attempts === 'number' &&
    typeof s.expiresAt === 'number' &&
    typeof s.resendAt === 'number' &&
    typeof s.source === 'string'
  )
}

export async function sealPending(session: PendingSession): Promise<string> {
  return sealData(session, { password: password() })
}

export async function unsealPending(seal: string): Promise<PendingSession | null> {
  try {
    const data = await unsealData(seal, { password: password() })
    return isPendingSession(data) ? data : null
  } catch {
    return null
  }
}

export async function readPendingCookie(req: NextRequest): Promise<PendingSession | null> {
  const seal = req.cookies.get(PENDING_COOKIE)?.value
  if (!seal) return null
  return unsealPending(seal)
}

export function setPendingCookie(res: NextResponse, seal: string): void {
  res.cookies.set({
    name: PENDING_COOKIE,
    value: seal,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(PENDING_TTL_MS / 1000),
  })
}

export function clearPendingCookie(res: NextResponse): void {
  res.cookies.set({ name: PENDING_COOKIE, value: '', path: '/', maxAge: 0 })
}
