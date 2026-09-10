import { NextRequest, NextResponse, after } from 'next/server';
import { createCrmContact } from '@/lib/crm';
import { sendReservationEmail } from '@/lib/email';
import { resolvePreorderSource, type ReserveOutcome } from '@/lib/preorder';
import { consume } from '@/lib/rate-limit';
import { clientIp } from '@/lib/client-ip';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 600_000;
const IP_LIMIT = 20;
const EMAIL_LIMIT = 3;
const RATE_LIMIT_ERROR =
  'Too many requests. Please wait a few minutes and try again.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

type ReserveResponse =
  | { success: true; status: ReserveOutcome }
  | { success: false; message: string };

function fail(message: string, status: number) {
  return NextResponse.json<ReserveResponse>(
    { success: false, message },
    { status }
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReserveResponse>> {
  const ip = clientIp(request);
  if (!consume(`reserve:${ip}`, IP_LIMIT, WINDOW_MS)) {
    return fail(RATE_LIMIT_ERROR, 429);
  }

  let body: { email?: unknown; src?: unknown; outcome?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body.', 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    return fail('Please enter a valid email address.', 400);
  }

  const outcome = body.outcome;
  if (outcome !== 'reserve' && outcome !== 'waitlist') {
    return fail('Invalid request body.', 400);
  }

  if (
    !consume(`reserve-email:${email.toLowerCase()}`, EMAIL_LIMIT, WINDOW_MS)
  ) {
    return fail(RATE_LIMIT_ERROR, 429);
  }

  const source = resolvePreorderSource(
    typeof body.src === 'string' ? body.src : undefined
  );

  const result = await createCrmContact(email, source);
  if (!result.ok) {
    return fail(GENERIC_ERROR, 500);
  }

  after(async () => {
    const sent = await sendReservationEmail(email, outcome);
    if (!sent) console.error('Reservation email failed for', email);
  });

  return NextResponse.json<ReserveResponse>(
    { success: true, status: outcome },
    { status: 201 }
  );
}
