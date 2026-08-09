import { describe, it, expect } from 'vitest';
import {
  sealPending,
  unsealPending,
  PENDING_TTL_MS,
} from '../lib/pending-session';

const session = {
  email: 'a@b.com',
  codeHash: 'deadbeef',
  attempts: 0,
  expiresAt: 123,
  resendAt: 456,
  source: 'g3d:family_intelligence',
};

describe('pending session seal round-trip', () => {
  it('round-trips the session', async () => {
    const seal = await sealPending(session);
    expect(typeof seal).toBe('string');
    const back = await unsealPending(seal);
    expect(back).toEqual(session);
  });
  it('returns null for a tampered seal', async () => {
    const seal = await sealPending(session);
    const tampered = seal.slice(0, -2) + 'XX';
    expect(await unsealPending(tampered)).toBeNull();
  });
  it('exposes the 15-minute TTL', () => {
    expect(PENDING_TTL_MS).toBe(900_000);
  });
});
