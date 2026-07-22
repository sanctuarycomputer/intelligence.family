import type { NextRequest } from 'next/server';

export function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',');
    return parts[parts.length - 1]!.trim();
  }

  return 'unknown';
}
