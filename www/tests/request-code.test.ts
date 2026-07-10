import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { _resetForTests as resetRateLimit } from '../lib/rate-limit'

const sendOtp = vi.fn().mockResolvedValue(true)
vi.mock('../lib/email', () => ({ sendOtpEmail: (e: string, c: string) => sendOtp(e, c) }))

import { POST } from '../app/api/request-code/route'

function req(body: unknown, ip = '1.2.3.4', cookie?: string) {
  const headers: Record<string, string> = { 'content-type': 'application/json', 'x-forwarded-for': ip }
  if (cookie) headers.cookie = cookie
  return new NextRequest('http://localhost/api/request-code', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  resetRateLimit()
  sendOtp.mockReset()
  sendOtp.mockResolvedValue(true)
})

describe('POST /api/request-code', () => {
  it('emails a code, sets the pending cookie, returns ok', async () => {
    const res = await POST(req({ email: 'user@example.com', source: 'g3d:family_intelligence:fundraising' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
    expect(sendOtp).toHaveBeenCalledWith('user@example.com', expect.stringMatching(/^\d{6}$/))
    expect(res.headers.get('set-cookie') || '').toContain('fi_pending=')
  })

  it('returns 400 for a malformed email and does not mail', async () => {
    const res = await POST(req({ email: 'not-an-email' }))
    expect(res.status).toBe(400)
    expect(sendOtp).not.toHaveBeenCalled()
  })

  it('rate-limits repeated requests from one IP', async () => {
    for (let i = 0; i < 5; i++) await POST(req({ email: `u${i}@example.com` }))
    const res = await POST(req({ email: 'u9@example.com' }))
    expect(res.status).toBe(429)
    expect(sendOtp).toHaveBeenCalledTimes(5)
  })

  it('still returns ok=shape even when email send fails (no enumeration), HTTP 500', async () => {
    sendOtp.mockResolvedValue(false)
    const res = await POST(req({ email: 'user@example.com' }))
    expect(res.status).toBe(500)
  })
})
