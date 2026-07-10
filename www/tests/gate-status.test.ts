import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { sealVerified } from '../lib/verified-session';
import { _resetForTests } from '../lib/rate-limit';

const crmMock = vi.fn().mockResolvedValue({ ok: true, status: 'created' });
vi.mock('../lib/crm', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/crm')>();
  return { ...actual, createCrmContact: (...a: unknown[]) => crmMock(...a) };
});

import { GET } from '../app/api/gate-status/route';

function req(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/gate-status', {
    method: 'GET',
    headers,
  });
}

async function verifiedReq(
  email: string,
  headers: Record<string, string> = {}
) {
  const seal = await sealVerified({ email });
  return req({ cookie: `fi_verified=${seal}`, ...headers });
}

beforeEach(() => {
  _resetForTests();
  crmMock.mockClear();
  crmMock.mockResolvedValue({ ok: true, status: 'created' });
});

describe('GET /api/gate-status', () => {
  it('reports unverified with no cookie and does not touch the CRM', async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ verified: false });
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('reports unverified for a tampered cookie and does not touch the CRM', async () => {
    const res = await GET(req({ cookie: 'fi_verified=garbage' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ verified: false });
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('reports verified and records a view for a valid cookie', async () => {
    const res = await GET(await verifiedReq('user@example.com'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ verified: true });
    expect(crmMock).toHaveBeenCalledWith(
      'user@example.com',
      'g3d:family_intelligence:fundraising-viewed'
    );
  });

  it('keeps unlocking but stops counting views past 20 pings per IP per minute', async () => {
    const ip = '203.0.113.7';
    for (let i = 0; i < 20; i++) {
      await GET(await verifiedReq('user@example.com', { 'x-forwarded-for': ip }));
    }
    expect(crmMock).toHaveBeenCalledTimes(20);

    const res = await GET(
      await verifiedReq('user@example.com', { 'x-forwarded-for': ip })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ verified: true });
    expect(crmMock).toHaveBeenCalledTimes(20);
  });
});
