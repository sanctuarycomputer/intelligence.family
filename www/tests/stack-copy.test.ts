import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) =>
  readFileSync(path.join(__dirname, '..', rel), 'utf8');

const page = read('app/fundraising/stack/page.tsx');
const layout = read('app/fundraising/stack/layout.tsx');
const fundraisingPage = read('app/fundraising/page.tsx');

describe('stack page contract', () => {
  it('contains no em dashes in copy', () => {
    expect(page).not.toMatch(/—/);
  });

  it('covers all seven hardware beats', () => {
    for (const part of ['Lid', 'Leaf', 'Front', 'Display', 'Orin', 'Power', 'Shell']) {
      expect(page).toContain(part);
    }
  });

  it('is gated with the shared unlock key', () => {
    expect(page).toContain('FUNDRAISING_UNLOCK_KEY');
    expect(fundraisingPage).toContain('FUNDRAISING_UNLOCK_KEY');
    expect(fundraisingPage).not.toMatch(/const UNLOCK_KEY = 'fi_fundraising/);
  });

  it('stays out of search indexes', () => {
    expect(layout).toMatch(/index:\s*false/);
  });

  it('marks placeholder beats for Hugh to replace', () => {
    expect(page).toMatch(/PLACEHOLDER/);
  });
});
