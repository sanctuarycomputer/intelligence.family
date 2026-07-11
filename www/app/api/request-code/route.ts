import { NextRequest, NextResponse, after } from 'next/server';
import { generateCode, hashCode } from '@/lib/otp';
import { consume } from '@/lib/rate-limit';
import {
  sealPending,
  setPendingCookie,
  readPendingCookie,
  type PendingSession,
} from '@/lib/pending-session';
import { sendOtpEmail } from '@/lib/email';
import { createCrmContact, GATE_SOURCE } from '@/lib/crm';
import { clientIp } from '@/lib/client-ip';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const EMAIL_RATE_LIMIT = 3;
const RESEND_COOLDOWN_MS = 60_000;
const RATE_LIMIT_ERROR =
  'Too many requests. Please wait a minute and try again.';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = clientIp(request);
  if (!consume(`request-code:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { ok: true, error: RATE_LIMIT_ERROR },
      { status: 429 }
    );
  }

  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  if (
    !consume(
      `request-code-email:${email.toLowerCase()}`,
      EMAIL_RATE_LIMIT,
      RATE_WINDOW_MS
    )
  ) {
    return NextResponse.json(
      { ok: true, error: RATE_LIMIT_ERROR },
      { status: 429 }
    );
  }

  const now = Date.now();
  const existing = await readPendingCookie(request);
  if (existing && existing.email === email && now < existing.resendAt) {
    return NextResponse.json({ ok: true, resendAt: existing.resendAt });
  }

  const code = generateCode();
  const session: PendingSession = {
    email,
    codeHash: hashCode(code),
    attempts: 0,
    expiresAt: now + 900_000,
    resendAt: now + RESEND_COOLDOWN_MS,
    source: GATE_SOURCE,
  };

  const sent = await sendOtpEmail(email, code);
  if (!sent) {
    return NextResponse.json(
      { ok: false, error: 'Could not send code. Please try again.' },
      { status: 500 }
    );
  }

  if (!existing) {
    after(() => createCrmContact(email, GATE_SOURCE));
  }

  const seal = await sealPending(session);
  const res = NextResponse.json({ ok: true });
  setPendingCookie(res, seal);
  return res;
}
