import { describe, it, expect, vi, beforeEach } from 'vitest'

const sendMock = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return {
      emails: { send: sendMock },
    }
  }),
}))

import { sendOtpEmail } from '../lib/email'

beforeEach(() => {
  sendMock.mockReset()
  delete process.env.REPLY_TO
})

describe('sendOtpEmail', () => {
  it('sends the code and returns true on success', async () => {
    const prev = process.env.RESEND_FROM
    delete process.env.RESEND_FROM
    sendMock.mockResolvedValue({ data: { id: 'msg_1' }, error: null })
    const ok = await sendOtpEmail('user@example.com', '123456')
    process.env.RESEND_FROM = prev
    expect(ok).toBe(true)
    expect(sendMock).toHaveBeenCalledOnce()
    const payload = sendMock.mock.calls[0][0]
    expect(payload.to).toBe('user@example.com')
    expect(payload.from).toContain('invest@mail.intelligence.family')
    expect(payload.text).toContain('123456')
  })

  it('includes replyTo when REPLY_TO is set', async () => {
    process.env.REPLY_TO = 'invest@intelligence.family'
    sendMock.mockResolvedValue({ data: { id: 'msg_2' }, error: null })
    await sendOtpEmail('user@example.com', '123456')
    const payload = sendMock.mock.calls[0][0]
    expect(payload.replyTo).toBe('invest@intelligence.family')
  })

  it('omits replyTo when REPLY_TO is unset', async () => {
    delete process.env.REPLY_TO
    sendMock.mockResolvedValue({ data: { id: 'msg_3' }, error: null })
    await sendOtpEmail('user@example.com', '123456')
    const payload = sendMock.mock.calls[0][0]
    expect(payload.replyTo).toBeUndefined()
  })

  it('returns false on error', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const ok = await sendOtpEmail('user@example.com', '123456')
    expect(ok).toBe(false)
  })
})
