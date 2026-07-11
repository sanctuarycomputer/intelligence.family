import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const crmMock = vi.fn().mockResolvedValue({ ok: true, status: 'created' });
vi.mock('../lib/crm', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/crm')>();
  return { ...actual, createCrmContact: (...a: unknown[]) => crmMock(...a) };
});

import { POST } from '../app/api/subscribe/route';

function req(body: unknown) {
  return new NextRequest('http://localhost/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  crmMock.mockClear();
  crmMock.mockResolvedValue({ ok: true, status: 'created' });
});

describe('POST /api/subscribe', () => {
  it('subscribes a valid email via the shared CRM client', async () => {
    const res = await POST(req({ email: 'New@Example.com' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ success: true, status: 'subscribed' });
    expect(crmMock).toHaveBeenCalledWith('New@Example.com', undefined);
  });

  it('forwards a provided source to the CRM client', async () => {
    const res = await POST(
      req({ email: 'user@example.com', source: 'g3d:family_intelligence:fundraising' })
    );
    expect(res.status).toBe(201);
    expect(crmMock).toHaveBeenCalledWith(
      'user@example.com',
      'g3d:family_intelligence:fundraising'
    );
  });

  it('surfaces a rejected source as an error', async () => {
    crmMock.mockResolvedValue({ ok: false, status: 'rejected_source' });
    const res = await POST(req({ email: 'user@example.com', source: 'evil' }));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ success: false, status: 'error' });
  });

  it('rejects an invalid email without touching the CRM', async () => {
    const res = await POST(req({ email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ success: false, status: 'error' });
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('returns an error when the CRM write fails', async () => {
    crmMock.mockResolvedValue({ ok: false, status: 'error' });
    const res = await POST(req({ email: 'user@example.com' }));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ success: false, status: 'error' });
  });
});
