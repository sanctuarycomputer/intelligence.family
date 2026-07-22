import { describe, it, expect } from 'vitest';
import {
  TOUR_BEATS,
  BEAT_COUNT,
  beatCenter,
  beatIndexAt,
  beatWindow,
} from '@/components/stack-tour/stackTour';

describe('tour beats', () => {
  it('has ten beats labelled LAYER 01..LAYER 10 in order', () => {
    expect(TOUR_BEATS).toHaveLength(BEAT_COUNT);
    TOUR_BEATS.forEach((b, i) => {
      expect(b.label).toBe(`LAYER ${String(i + 1).padStart(2, '0')}`);
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.paragraphs.length).toBeGreaterThan(0);
    });
  });

  it('centres beat i at i/9 and tiles windows without gaps', () => {
    expect(beatCenter(0)).toBe(0);
    expect(beatCenter(9)).toBe(1);
    expect(beatWindow(0).start).toBe(0);
    expect(beatWindow(9).end).toBe(1);
    for (let i = 1; i < BEAT_COUNT; i++) {
      expect(beatWindow(i).start).toBeCloseTo(beatWindow(i - 1).end, 10);
    }
  });

  it('maps beat centres back to their beat index', () => {
    for (let i = 0; i < BEAT_COUNT; i++) {
      expect(beatIndexAt(beatCenter(i))).toBe(i);
    }
    expect(beatIndexAt(-1)).toBe(0);
    expect(beatIndexAt(2)).toBe(9);
  });
});
