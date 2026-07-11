import { NextRequest, NextResponse } from 'next/server'
import { sealData, unsealData } from 'iron-session'
import { sessionSecret } from './session-secret'

export const VERIFIED_COOKIE = 'fi_verified'
export const VERIFIED_TTL_MS = 2_592_000_000 // 30 days

export type VerifiedSession = {
  email: string
}

function isVerifiedSession(v: unknown): v is VerifiedSession {
  if (!v || typeof v !== 'object') return false
  return typeof (v as Record<string, unknown>).email === 'string'
}

export async function sealVerified(session: VerifiedSession): Promise<string> {
  return sealData(session, {
    password: sessionSecret(),
    ttl: VERIFIED_TTL_MS / 1000,
  })
}

export async function unsealVerified(seal: string): Promise<VerifiedSession | null> {
  try {
    const data = await unsealData(seal, {
      password: sessionSecret(),
      ttl: VERIFIED_TTL_MS / 1000,
    })
    return isVerifiedSession(data) ? data : null
  } catch {
    return null
  }
}

export async function readVerifiedCookie(req: NextRequest): Promise<VerifiedSession | null> {
  const seal = req.cookies.get(VERIFIED_COOKIE)?.value
  if (!seal) return null
  return unsealVerified(seal)
}

export function setVerifiedCookie(res: NextResponse, seal: string): void {
  res.cookies.set({
    name: VERIFIED_COOKIE,
    value: seal,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(VERIFIED_TTL_MS / 1000),
  })
}
