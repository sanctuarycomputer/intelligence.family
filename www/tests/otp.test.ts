import { describe, it, expect } from 'vitest';
import { generateCode, hashCode, verifyCode, isExpired } from '../lib/otp';

describe('generateCode', () => {
  it('returns 6 digits', () => {
    for (let i = 0; i < 50; i++) {
      const c = generateCode();
      expect(c).toMatch(/^\d{6}$/);
    }
  });
});

describe('hashCode / verifyCode', () => {
  it('verifies the correct code', () => {
    const hash = hashCode('123456');
    expect(verifyCode('123456', hash)).toBe(true);
  });
  it('rejects a wrong code', () => {
    const hash = hashCode('123456');
    expect(verifyCode('123457', hash)).toBe(false);
  });
  it('does not throw on length mismatch', () => {
    const hash = hashCode('123456');
    expect(verifyCode('short', hash)).toBe(false);
  });
});

describe('isExpired', () => {
  it('expires after the deadline', () => {
    const now = 10_000;
    expect(isExpired(9_000, now)).toBe(true);
    expect(isExpired(11_000, now)).toBe(false);
  });
});

describe('hashCode secret guard', () => {
  it('throws when SESSION_SECRET is missing rather than hashing with an empty secret', () => {
    const saved = process.env.SESSION_SECRET;
    delete process.env.SESSION_SECRET;
    try {
      expect(() => hashCode('123456')).toThrow(/SESSION_SECRET/);
    } finally {
      process.env.SESSION_SECRET = saved;
    }
  });
});
