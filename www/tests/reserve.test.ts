import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { _resetForTests } from '../lib/rate-limit';

const crmMock = vi.fn();
vi.mock('../lib/crm', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/crm')>();
  return { ...actual, createCrmContact: (...a: unknown[]) => crmMock(...a) };
});

const emailMock = vi.fn();
vi.mock('../lib/email', () => ({
  sendReservationEmail: (...a: unknown[]) => emailMock(...a),
}));

// after() runs the callback once the response is sent; in tests, run it now.
vi.mock('next/server', async importOriginal => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: (fn: () => unknown) => fn() };
});

import { POST } from '../app/api/reserve/route';

function req(body: unknown, ip = '203.0.113.7') {
  return new NextRequest('http://localhost/api/reserve', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  _resetForTests();
  crmMock.mockReset();
  crmMock.mockResolvedValue({ ok: true, status: 'created' });
  emailMock.mockReset();
  emailMock.mockResolvedValue(true);
});

describe('POST /api/reserve', () => {
  it('rejects a bad email', async () => {
    const res = await POST(req({ email: 'nope', outcome: 'reserve' }));
    expect(res.status).toBe(400);
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('rejects a bad outcome', async () => {
    const res = await POST(req({ email: 'a@b.co', outcome: 'buy' }));
    expect(res.status).toBe(400);
  });

  it('rejects a malformed body', async () => {
    const r = new NextRequest('http://localhost/api/reserve', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.9' },
      body: 'not json',
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
  });

  it('writes an ads reservation with the ads source and emails', async () => {
    const res = await POST(
      req({ email: 'Parent@Example.com', src: 'ads', outcome: 'reserve' })
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true, status: 'reserve' });
    expect(crmMock).toHaveBeenCalledWith(
      'Parent@Example.com',
      'g3d:family_intelligence:preorder:ads'
    );
    expect(emailMock).toHaveBeenCalledWith('Parent@Example.com', 'reserve');
  });

  it('maps prolific and unknown src to the plain preorder source', async () => {
    await POST(req({ email: 'a@b.co', src: 'prolific', outcome: 'reserve' }));
    await POST(req({ email: 'c@d.co', src: 'zzz', outcome: 'reserve' }));
    await POST(req({ email: 'e@f.co', outcome: 'reserve' }));
    for (const call of crmMock.mock.calls) {
      expect(call[1]).toBe('g3d:family_intelligence:preorder');
    }
  });

  it('passes the waitlist outcome through to the email', async () => {
    const res = await POST(req({ email: 'a@b.co', outcome: 'waitlist' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true, status: 'waitlist' });
    expect(emailMock).toHaveBeenCalledWith('a@b.co', 'waitlist');
  });

  it('returns 500 and sends no email when Stacks fails', async () => {
    crmMock.mockResolvedValue({ ok: false, status: 'error' });
    const res = await POST(req({ email: 'a@b.co', outcome: 'reserve' }));
    expect(res.status).toBe(500);
    expect(emailMock).not.toHaveBeenCalled();
  });

  it('still returns 201 when the email fails', async () => {
    emailMock.mockResolvedValue(false);
    const res = await POST(req({ email: 'a@b.co', outcome: 'reserve' }));
    expect(res.status).toBe(201);
  });

  it('rate limits per IP after 20 requests in the window', async () => {
    for (let i = 0; i < 20; i++) {
      const res = await POST(
        req({ email: `u${i}@example.com`, outcome: 'reserve' }, '198.51.100.1')
      );
      expect(res.status).toBe(201);
    }
    const res = await POST(
      req({ email: 'u21@example.com', outcome: 'reserve' }, '198.51.100.1')
    );
    expect(res.status).toBe(429);
  });

  it('rate limits per email after 3 requests in the window', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await POST(
        req({ email: 'same@example.com', outcome: 'reserve' }, `10.0.0.${i}`)
      );
      expect(res.status).toBe(201);
    }
    const res = await POST(
      req({ email: 'Same@Example.com', outcome: 'reserve' }, '10.0.0.9')
    );
    expect(res.status).toBe(429);
  });
});
