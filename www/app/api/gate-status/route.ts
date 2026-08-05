import { NextRequest, NextResponse, after } from 'next/server';
import { consume } from '@/lib/rate-limit';
import { readVerifiedCookie } from '@/lib/verified-session';
import { createCrmContact } from '@/lib/crm';
import { resolveViewedSource } from '@/lib/gate-page';
import { clientIp } from '@/lib/client-ip';

const PING_LIMIT = 20;
const PING_WINDOW_MS = 60_000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  // The real caller is a same-origin fetch from InlineEmailGate. Reject
  // cross-site requests so a third-party page can't drive a verified
  // visitor's browser here (sameSite=lax sends the cookie on top-level
  // navigations) and inflate their view count.
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') {
    return NextResponse.json({ verified: false });
  }

  const session = await readVerifiedCookie(request);
  if (!session) {
    return NextResponse.json({ verified: false });
  }

  const viewedSource = resolveViewedSource(
    request.nextUrl.searchParams.get('page')
  );
  // Each verified page load logs a view in the CRM (source_events counts
  // repeats server-side). Over the ping limit we stop counting but never
  // block the unlock.
  if (consume(`gate-status:${clientIp(request)}`, PING_LIMIT, PING_WINDOW_MS)) {
    after(() => createCrmContact(session.email, viewedSource));
  }
  return NextResponse.json({ verified: true });
}
