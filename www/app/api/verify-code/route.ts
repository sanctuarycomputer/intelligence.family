import { NextRequest, NextResponse, after } from 'next/server';
import { verifyCode, isExpired } from '@/lib/otp';
import { consume } from '@/lib/rate-limit';
import {
  readPendingCookie,
  clearPendingCookie,
  sealPending,
  setPendingCookie,
  type PendingSession,
} from '@/lib/pending-session';
import { sealVerified, setVerifiedCookie } from '@/lib/verified-session';
import { createCrmContact, VIEWED_SOURCE } from '@/lib/crm';
import { clientIp } from '@/lib/client-ip';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = clientIp(request);
  if (!consume(`verify-code:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const session = await readPendingCookie(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'No pending code. Please request a new code.' },
      { status: 400 }
    );
  }

  // Per-email limit keyed on the sealed session email. The attempt counter
  // lives in a client-held cookie and is replayable, so this backstops the
  // per-IP limit against an attacker rotating IPs against one email.
  if (!consume(`verify-code-email:${session.email.toLowerCase()}`, 10, 60_000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }
  if (isExpired(session.expiresAt)) {
    const res = NextResponse.json(
      { ok: false, error: 'Code expired. Please request a new code.' },
      { status: 400 }
    );
    clearPendingCookie(res);
    return res;
  }

  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  if (!verifyCode(code, session.codeHash)) {
    const updated: PendingSession = {
      ...session,
      attempts: session.attempts + 1,
    };
    if (updated.attempts >= MAX_ATTEMPTS) {
      const res = NextResponse.json(
        { ok: false, error: 'Too many attempts. Please request a new code.' },
        { status: 400 }
      );
      clearPendingCookie(res);
      return res;
    }
    const seal = await sealPending(updated);
    const res = NextResponse.json({
      ok: true,
      verified: false,
      attemptsRemaining: MAX_ATTEMPTS - updated.attempts,
    });
    setPendingCookie(res, seal);
    return res;
  }

  after(() => createCrmContact(session.email, VIEWED_SOURCE));
  const res = NextResponse.json({ ok: true, verified: true });
  clearPendingCookie(res);
  setVerifiedCookie(res, await sealVerified({ email: session.email }));
  return res;
}
