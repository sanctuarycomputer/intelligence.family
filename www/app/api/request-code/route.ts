import { NextRequest, NextResponse } from 'next/server';
import { generateCode, hashCode } from '@/lib/otp';
import { consume } from '@/lib/rate-limit';
import {
  sealPending,
  setPendingCookie,
  readPendingCookie,
  type PendingSession,
} from '@/lib/pending-session';
import { sendOtpEmail } from '@/lib/email';
import { createCrmContact, ALLOWED_SOURCES } from '@/lib/crm';
import { clientIp } from '@/lib/client-ip';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const EMAIL_RATE_LIMIT = 3;
const RESEND_COOLDOWN_MS = 60_000;
const DEFAULT_SOURCE = 'g3d:family_intelligence:fundraising';
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
    !consume(`request-code-email:${email}`, EMAIL_RATE_LIMIT, RATE_WINDOW_MS)
  ) {
    return NextResponse.json(
      { ok: true, error: RATE_LIMIT_ERROR },
      { status: 429 }
    );
  }

  const now = Date.now();
  const existing = await readPendingCookie(request);
  if (existing && now < existing.resendAt) {
    return NextResponse.json({ ok: true, resendAt: existing.resendAt });
  }

  const source =
    typeof body.source === 'string' &&
    (ALLOWED_SOURCES as readonly string[]).includes(body.source)
      ? body.source
      : DEFAULT_SOURCE;
  const code = generateCode();
  const session: PendingSession = {
    email,
    codeHash: hashCode(code),
    attempts: 0,
    expiresAt: now + 900_000,
    resendAt: now + RESEND_COOLDOWN_MS,
    source,
  };

  const sent = await sendOtpEmail(email, code);
  if (!sent) {
    return NextResponse.json(
      { ok: false, error: 'Could not send code. Please try again.' },
      { status: 500 }
    );
  }

  if (!existing) {
    await createCrmContact(email, source);
  }

  const seal = await sealPending(session);
  const res = NextResponse.json({ ok: true });
  setPendingCookie(res, seal);
  return res;
}
