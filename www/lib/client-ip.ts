import type { NextRequest } from 'next/server';

export function clientIp(req: NextRequest): string {
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();

  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',');
    return parts[parts.length - 1]!.trim();
  }

  return 'unknown';
}
