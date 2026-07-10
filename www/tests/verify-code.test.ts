import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { sealPending, type PendingSession } from '../lib/pending-session';
import { hashCode } from '../lib/otp';
import { _resetForTests } from '../lib/rate-limit';

const crmMock = vi.fn().mockResolvedValue({ ok: true, status: 'created' });
vi.mock('../lib/crm', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/crm')>();
  return { ...actual, createCrmContact: (...a: unknown[]) => crmMock(...a) };
});

import { POST } from '../app/api/verify-code/route';

async function reqWithSession(
  code: string,
  session: PendingSession,
  headers: Record<string, string> = {}
) {
  const seal = await sealPending(session);
  return new NextRequest('http://localhost/api/verify-code', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `fi_pending=${seal}`,
      ...headers,
    },
    body: JSON.stringify({ code }),
  });
}

const baseSession = (
  overrides: Partial<PendingSession> = {}
): PendingSession => ({
  email: 'user@example.com',
  codeHash: hashCode('123456'),
  attempts: 0,
  expiresAt: Date.now() + 600_000,
  resendAt: Date.now(),
  source: 'g3d:family_intelligence:fundraising',
  ...overrides,
});

beforeEach(() => {
  _resetForTests();
  crmMock.mockClear();
  crmMock.mockResolvedValue({ ok: true, status: 'created' });
});

describe('POST /api/verify-code', () => {
  it('verifies the correct code and pushes to the CRM with the stored source', async () => {
    const res = await POST(await reqWithSession('123456', baseSession()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, verified: true });
    expect(crmMock).toHaveBeenCalledWith(
      'user@example.com',
      'g3d:family_intelligence:fundraising-viewed'
    );
    const setCookie = res.headers.get('set-cookie') || '';
    expect(setCookie).toContain('fi_pending=');
    expect(setCookie).toContain('Max-Age=0');
  });

  it('sets a 30-day fi_verified cookie for the verified email on success', async () => {
    const res = await POST(await reqWithSession('123456', baseSession()));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie') || '';
    const seal = /fi_verified=([^;,\s]+)/.exec(setCookie)?.[1];
    expect(seal).toBeTruthy();
    expect(setCookie).toContain('Max-Age=2592000');
    const { unsealVerified } = await import('../lib/verified-session');
    expect(await unsealVerified(decodeURIComponent(seal!))).toEqual({
      email: 'user@example.com',
    });
  });

  it('does not set fi_verified on a wrong code', async () => {
    const res = await POST(await reqWithSession('000000', baseSession()));
    expect(res.headers.get('set-cookie') || '').not.toContain('fi_verified=');
  });

  it('always tags with VIEWED_SOURCE even when the stored source is not fundraising', async () => {
    const res = await POST(
      await reqWithSession(
        '123456',
        baseSession({ source: 'g3d:family_intelligence' })
      )
    );
    expect(res.status).toBe(200);
    expect(crmMock).toHaveBeenCalledWith(
      'user@example.com',
      'g3d:family_intelligence:fundraising-viewed'
    );
  });

  it('rejects an absent pending cookie with 400', async () => {
    const req = new NextRequest('http://localhost/api/verify-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: '123456' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('rejects an expired code with 400', async () => {
    const res = await POST(
      await reqWithSession('123456', baseSession({ expiresAt: Date.now() - 1 }))
    );
    expect(res.status).toBe(400);
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('counts down attempts and locks after 5', async () => {
    for (let i = 0; i < 4; i++) {
      const res = await POST(
        await reqWithSession('000000', baseSession({ attempts: i }))
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ ok: true, verified: false });
    }
    const res = await POST(
      await reqWithSession('000000', baseSession({ attempts: 4 }))
    );
    expect(res.status).toBe(400); // locked, pending cookie cleared
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('rate-limits verify attempts per IP after 10 in 60s', async () => {
    const ip = '203.0.113.9';
    for (let i = 0; i < 10; i++) {
      const res = await POST(
        await reqWithSession('000000', baseSession(), { 'x-forwarded-for': ip })
      );
      expect(res.status).toBe(200);
    }
    const res = await POST(
      await reqWithSession('000000', baseSession(), { 'x-forwarded-for': ip })
    );
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      ok: false,
      error: 'Too many attempts. Please try again later.',
    });
    expect(crmMock).not.toHaveBeenCalled();
  });
});
