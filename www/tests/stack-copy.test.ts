import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { TOUR_BEATS } from '@/components/stack-tour/stackTour';

const read = (rel: string) =>
  readFileSync(path.join(__dirname, '..', rel), 'utf8');

const page = read('app/fundraising/stack/page.tsx');
const layout = read('app/fundraising/stack/layout.tsx');
const tour = read('components/stack-tour/stackTour.ts');
const fundraisingPage = read('app/fundraising/page.tsx');

describe('stack page contract', () => {
  it('contains no em dashes in copy', () => {
    expect(page).not.toMatch(/—/);
    expect(layout).not.toMatch(/—/);
    expect(tour).not.toMatch(/—/);
  });

  it('covers all ten layer beats of the tour', () => {
    const titles = TOUR_BEATS.map(b => b.title);
    expect(titles).toEqual([
      'Application Runtime',
      'Agentic Harness (Pii)',
      'Ingestion & Encrypted Data Sink',
      'Knowledge & Blob Storage',
      'Cryptographic Core & Key Management',
      'OS & Platform Services',
      'TEE & Hardware Root of Trust',
      'Replication & P2P Gossip',
      'Opaque Mirror (Zero-Knowledge Sync Server)',
      'FOTA & Fleet Management',
    ]);
    expect(page).toContain('TOUR_BEATS');
  });

  it('is gated with the shared unlock key', () => {
    expect(page).toContain('FUNDRAISING_UNLOCK_KEY');
    expect(fundraisingPage).toContain('FUNDRAISING_UNLOCK_KEY');
    expect(fundraisingPage).not.toMatch(/const UNLOCK_KEY = 'fi_fundraising/);
  });

  it('stays out of search indexes', () => {
    expect(layout).toMatch(/index:\s*false/);
  });
});
