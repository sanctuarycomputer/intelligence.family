import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return {
      emails: { send: sendMock },
    };
  }),
}));

import {
  sendOtpEmail,
  sendReservationEmail,
  RESERVATION_EMAIL,
} from '../lib/email';

beforeEach(() => {
  sendMock.mockReset();
  delete process.env.REPLY_TO;
});

describe('sendOtpEmail', () => {
  it('sends the code and returns true on success', async () => {
    const prev = process.env.RESEND_FROM;
    delete process.env.RESEND_FROM;
    sendMock.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
    const ok = await sendOtpEmail('user@example.com', '123456');
    process.env.RESEND_FROM = prev;
    expect(ok).toBe(true);
    expect(sendMock).toHaveBeenCalledOnce();
    const payload = sendMock.mock.calls[0][0];
    expect(payload.to).toBe('user@example.com');
    expect(payload.from).toContain('invest@mail.intelligence.family');
    expect(payload.text).toContain('123456');
  });

  it('includes replyTo when REPLY_TO is set', async () => {
    process.env.REPLY_TO = 'invest@intelligence.family';
    sendMock.mockResolvedValue({ data: { id: 'msg_2' }, error: null });
    await sendOtpEmail('user@example.com', '123456');
    const payload = sendMock.mock.calls[0][0];
    expect(payload.replyTo).toBe('invest@intelligence.family');
  });

  it('omits replyTo when REPLY_TO is unset', async () => {
    delete process.env.REPLY_TO;
    sendMock.mockResolvedValue({ data: { id: 'msg_3' }, error: null });
    await sendOtpEmail('user@example.com', '123456');
    const payload = sendMock.mock.calls[0][0];
    expect(payload.replyTo).toBeUndefined();
  });

  it('returns false on error', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const ok = await sendOtpEmail('user@example.com', '123456');
    expect(ok).toBe(false);
  });

  it('returns false when the SDK throws, instead of rejecting', async () => {
    sendMock.mockRejectedValue(new Error('network boom'));
    const ok = await sendOtpEmail('user@example.com', '123456');
    expect(ok).toBe(false);
  });
});

describe('sendReservationEmail', () => {
  it('sends the reserve email with the in-line subject', async () => {
    sendMock.mockResolvedValue({ data: { id: 'msg_r1' }, error: null });
    const ok = await sendReservationEmail('parent@example.com', 'reserve');
    expect(ok).toBe(true);
    const payload = sendMock.mock.calls[0][0];
    expect(payload.to).toBe('parent@example.com');
    expect(payload.subject).toBe("You're in line for the Flagship");
    expect(payload.text).toContain(
      "You're in line for one of 250 Flagship founder units."
    );
    expect(payload.text).toContain('$49 refundable deposit');
    expect(payload.text).toContain('$850 balance');
  });

  it('sends the waitlist email with the waitlist subject', async () => {
    sendMock.mockResolvedValue({ data: { id: 'msg_w1' }, error: null });
    await sendReservationEmail('parent@example.com', 'waitlist');
    const payload = sendMock.mock.calls[0][0];
    expect(payload.subject).toBe("You're on the Flagship waitlist");
    expect(payload.text).toContain('All 250 founder units are spoken for');
  });

  it('includes replyTo when REPLY_TO is set', async () => {
    process.env.REPLY_TO = 'invest@intelligence.family';
    sendMock.mockResolvedValue({ data: { id: 'msg_r2' }, error: null });
    await sendReservationEmail('parent@example.com', 'reserve');
    expect(sendMock.mock.calls[0][0].replyTo).toBe(
      'invest@intelligence.family'
    );
  });

  it('returns false on error and when the SDK throws', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await sendReservationEmail('a@b.co', 'reserve')).toBe(false);
    sendMock.mockRejectedValue(new Error('network'));
    expect(await sendReservationEmail('a@b.co', 'reserve')).toBe(false);
  });

  it('exports copy with no em dashes', () => {
    for (const { subject, text } of Object.values(RESERVATION_EMAIL)) {
      expect(subject).not.toContain('—');
      expect(text).not.toContain('—');
    }
  });
});
