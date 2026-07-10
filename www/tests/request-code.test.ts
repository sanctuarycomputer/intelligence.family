import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { _resetForTests as resetRateLimit } from '../lib/rate-limit';
import { sealPending } from '../lib/pending-session';
import { hashCode } from '../lib/otp';

const sendOtp = vi.fn().mockResolvedValue(true);
vi.mock('../lib/email', () => ({
  sendOtpEmail: (e: string, c: string) => sendOtp(e, c),
}));

const crmMock = vi.fn().mockResolvedValue({ ok: true, status: 'created' });
vi.mock('../lib/crm', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/crm')>();
  return {
    ...actual,
    createCrmContact: (...a: unknown[]) => crmMock(...a),
  };
});

import { POST } from '../app/api/request-code/route';
import { GATE_SOURCE } from '../lib/crm';

function req(body: unknown, ip = '1.2.3.4', cookie?: string) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-forwarded-for': ip,
  };
  if (cookie) headers.cookie = cookie;
  return new NextRequest('http://localhost/api/request-code', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetRateLimit();
  sendOtp.mockReset();
  sendOtp.mockResolvedValue(true);
  crmMock.mockClear();
  crmMock.mockResolvedValue({ ok: true, status: 'created' });
});

describe('POST /api/request-code', () => {
  it('emails a code, sets the pending cookie, returns ok', async () => {
    const res = await POST(
      req({
        email: 'user@example.com',
        source: 'g3d:family_intelligence:fundraising',
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
    expect(sendOtp).toHaveBeenCalledWith(
      'user@example.com',
      expect.stringMatching(/^\d{6}$/)
    );
    expect(crmMock).toHaveBeenCalledWith(
      'user@example.com',
      'g3d:family_intelligence:fundraising'
    );
    expect(res.headers.get('set-cookie') || '').toContain('fi_pending=');
  });

  it('returns 400 for a malformed email and does not mail', async () => {
    const res = await POST(req({ email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect(sendOtp).not.toHaveBeenCalled();
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('falls back to the default allowlisted source for a disallowed source', async () => {
    await POST(req({ email: 'user@example.com', source: 'evil' }));
    expect(crmMock).toHaveBeenCalledWith(
      'user@example.com',
      'g3d:family_intelligence:fundraising'
    );
  });

  it('ignores a client-supplied allowlisted source and always tags with GATE_SOURCE', async () => {
    await POST(
      req({ email: 'user@example.com', source: 'g3d:family_intelligence' })
    );
    expect(crmMock).toHaveBeenCalledWith('user@example.com', GATE_SOURCE);
  });

  it('rate-limits repeated requests from one IP', async () => {
    for (let i = 0; i < 5; i++) await POST(req({ email: `u${i}@example.com` }));
    const res = await POST(req({ email: 'u9@example.com' }));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      ok: true,
      error: 'Too many requests. Please wait a minute and try again.',
    });
    expect(sendOtp).toHaveBeenCalledTimes(5);
    expect(crmMock).toHaveBeenCalledTimes(5);
  });

  it('keys the IP rate limit on the LAST x-forwarded-for entry (no spoof escape)', async () => {
    const spoofed = [
      '1.1.1.1',
      '2.2.2.2',
      '3.3.3.3',
      '4.4.4.4',
      '5.5.5.5',
      '6.6.6.6',
    ];
    for (let i = 0; i < 5; i++) {
      await POST(req({ email: `s${i}@example.com` }, `${spoofed[i]}, 9.9.9.9`));
    }
    const res = await POST(
      req({ email: 's9@example.com' }, `7.7.7.7, 9.9.9.9`)
    );
    expect(res.status).toBe(429);
    expect(sendOtp).toHaveBeenCalledTimes(5);
  });

  it('per-email rate-limits one address across distinct IPs after 3 in 60s', async () => {
    const ips = ['10.0.0.1', '10.0.0.2', '10.0.0.3', '10.0.0.4'];
    for (let i = 0; i < 3; i++) {
      const res = await POST(req({ email: 'victim@example.com' }, ips[i]));
      expect(res.status).toBe(200);
    }
    const res = await POST(req({ email: 'victim@example.com' }, ips[3]));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      ok: true,
      error: 'Too many requests. Please wait a minute and try again.',
    });
  });

  it('still returns ok=shape even when email send fails (no enumeration), HTTP 500', async () => {
    sendOtp.mockResolvedValue(false);
    const res = await POST(req({ email: 'user@example.com' }));
    expect(res.status).toBe(500);
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('skips the CRM write on a resend (cookie already present)', async () => {
    const seal = await sealPending({
      email: 'user@example.com',
      codeHash: hashCode('000000'),
      attempts: 0,
      expiresAt: Date.now() + 600_000,
      resendAt: Date.now() - 1_000,
      source: 'g3d:family_intelligence:fundraising',
    });
    const res = await POST(
      req({ email: 'user@example.com' }, '1.2.3.4', `fi_pending=${seal}`)
    );
    expect(res.status).toBe(200);
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('does not apply the resend cooldown to a different email', async () => {
    const seal = await sealPending({
      email: 'a@x.com',
      codeHash: hashCode('000000'),
      attempts: 0,
      expiresAt: Date.now() + 600_000,
      resendAt: Date.now() + 60_000,
      source: 'g3d:family_intelligence:fundraising',
    });
    const res = await POST(
      req({ email: 'b@x.com' }, '5.6.7.8', `fi_pending=${seal}`)
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
    expect(sendOtp).toHaveBeenCalledWith(
      'b@x.com',
      expect.stringMatching(/^\d{6}$/)
    );
  });
});
