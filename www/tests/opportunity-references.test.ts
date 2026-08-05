import { describe, it, expect } from 'vitest';
import {
  REFERENCES,
  refNumber,
  orderedReferences,
} from '../app/opportunity/content/references';

describe('opportunity reference registry', () => {
  it('every entry has a source, an ISO-ish date, and an https url', () => {
    for (const [key, ref] of Object.entries(REFERENCES)) {
      expect(ref.source, key).toBeTruthy();
      expect(ref.date, key).toMatch(/^\d{4}(-\d{2})?(-\d{2})?$/);
      expect(ref.url, key).toMatch(/^https:\/\//);
    }
  });

  it('numbers references stably from 1 in insertion order', () => {
    const entries = orderedReferences();
    expect(entries.length).toBeGreaterThanOrEqual(30);
    expect(refNumber(entries[0][0])).toBe(1);
    expect(refNumber(entries[entries.length - 1][0])).toBe(entries.length);
  });

  it('throws on an unknown key so a typo fails tests, not renders', () => {
    expect(() => refNumber('not-a-real-key')).toThrow();
  });
});
