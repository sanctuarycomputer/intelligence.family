import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { clientIp } from '../lib/client-ip';

describe('clientIp', () => {
  it('prefers x-real-ip when present', () => {
    const req = new NextRequest('http://localhost/api', {
      headers: { 'x-real-ip': '203.0.113.5', 'x-forwarded-for': '1.1.1.1' },
    });
    expect(clientIp(req)).toBe('203.0.113.5');
  });

  it('returns the LAST x-forwarded-for entry, ignoring a spoofed first', () => {
    const req = new NextRequest('http://localhost/api', {
      headers: { 'x-forwarded-for': 'spoofed, real' },
    });
    expect(clientIp(req)).toBe('real');
  });

  it('returns a single x-forwarded-for value', () => {
    const req = new NextRequest('http://localhost/api', {
      headers: { 'x-forwarded-for': '9.9.9.9' },
    });
    expect(clientIp(req)).toBe('9.9.9.9');
  });

  it('returns unknown when neither header is present', () => {
    const req = new NextRequest('http://localhost/api');
    expect(clientIp(req)).toBe('unknown');
  });
});
