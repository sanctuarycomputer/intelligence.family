import { NextRequest, NextResponse } from 'next/server';
import { consume } from '@/lib/rate-limit';
import { readVerifiedCookie } from '@/lib/verified-session';
import { createCrmContact, VIEWED_SOURCE } from '@/lib/crm';
import { clientIp } from '@/lib/client-ip';

const PING_LIMIT = 20;
const PING_WINDOW_MS = 60_000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await readVerifiedCookie(request);
  if (!session) {
    return NextResponse.json({ verified: false });
  }

  // Each verified page load logs a view in the CRM (source_events counts
  // repeats server-side). Over the ping limit we stop counting but never
  // block the unlock.
  if (consume(`gate-status:${clientIp(request)}`, PING_LIMIT, PING_WINDOW_MS)) {
    await createCrmContact(session.email, VIEWED_SOURCE);
  }
  return NextResponse.json({ verified: true });
}
