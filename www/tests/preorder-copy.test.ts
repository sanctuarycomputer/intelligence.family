import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { HERO, USE_CASE_GROUPS, FAQ, RESERVE } from '../app/preorder/content';
import { RESERVATION_EMAIL } from '../lib/email';

const contentSrc = readFileSync(
  path.join(__dirname, '..', 'app', 'preorder', 'content.tsx'),
  'utf8'
);

describe('preorder copy contract', () => {
  it('carries the approved hero copy', () => {
    expect(HERO.headline).toBe(
      'Take better care of your family than ever before.'
    );
    expect(HERO.body).toBe(
      "The Flagship is the most capable AI assistant you can put in a home. It remembers your family's stories, paperwork, and health. It helps run the household. It answers the kids. And nothing it hears ever leaves the house."
    );
    expect(HERO.pillars).toEqual([
      'Remembers your family',
      'Runs your household',
      'Nothing leaves the house',
    ]);
    expect(HERO.offer).toBe(
      '$899 at launch. Hold one of 250 founder units with a $49 refundable deposit.'
    );
  });

  it('carries the eight use cases in order under two group headers', () => {
    expect(USE_CASE_GROUPS.map(g => g.header)).toEqual([
      'Remembers your family',
      'Runs your household',
    ]);
    const items = USE_CASE_GROUPS.flatMap(g => g.items);
    expect(items.map(i => i.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(items.map(i => i.name)).toEqual([
      'Family stories',
      'The document vault',
      'The family health record',
      'Photos and recordings',
      'The shared family brain',
      'Kid-safe AI',
      "Everyone's private assistant",
      'The brain of the smart home',
    ]);
    expect(items[7].later).toBe(true);
    expect(items.slice(0, 7).every(i => !i.later)).toBe(true);
  });

  it('carries the six FAQ questions', () => {
    expect(FAQ.map(f => f.q)).toEqual([
      'When am I charged?',
      'Can I get my deposit back?',
      'What does a founder unit get me?',
      'What does it need at home?',
      'Where do you ship?',
      'When does it ship?',
    ]);
  });

  it('says no charge today next to the reserve button', () => {
    expect(RESERVE.button).toBe('Reserve a founder unit');
    expect(RESERVE.smallPrint).toContain('No charge today.');
  });

  it('has no em dashes in page copy or email copy', () => {
    expect(contentSrc).not.toContain('—');
    for (const { subject, text } of Object.values(RESERVATION_EMAIL)) {
      expect(subject).not.toContain('—');
      expect(text).not.toContain('—');
    }
  });
});
