import { describe, it, expect } from 'vitest';
import { NextResponse } from 'next/server';
import {
  sealVerified,
  unsealVerified,
  setVerifiedCookie,
  VERIFIED_TTL_MS,
} from '../lib/verified-session';

const session = { email: 'a@b.com' };

describe('verified session seal round-trip', () => {
  it('round-trips the session', async () => {
    const seal = await sealVerified(session);
    expect(typeof seal).toBe('string');
    expect(await unsealVerified(seal)).toEqual(session);
  });

  it('returns null for a tampered seal', async () => {
    const seal = await sealVerified(session);
    const tampered = seal.slice(0, -2) + 'XX';
    expect(await unsealVerified(tampered)).toBeNull();
  });

  it('exposes the 30-day TTL', () => {
    expect(VERIFIED_TTL_MS).toBe(2_592_000_000);
  });

  it('sets an httpOnly lax cookie with the 30-day max-age', async () => {
    const res = NextResponse.json({});
    setVerifiedCookie(res, await sealVerified(session));
    const cookie = res.headers.get('set-cookie') || '';
    expect(cookie).toContain('fi_verified=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie.toLowerCase()).toContain('samesite=lax');
    expect(cookie).toContain('Max-Age=2592000');
    expect(cookie).toContain('Path=/');
  });
});
