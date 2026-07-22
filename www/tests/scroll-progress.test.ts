import { describe, it, expect } from 'vitest';
import { computeProgress } from '@/components/trunk/scrollProgress';

describe('computeProgress', () => {
  // Story element: 4000px tall, viewport 800px. Scrollable span = 3200px.
  it('is 0 before the story reaches the top of the viewport', () => {
    expect(computeProgress(0, 4000, 800)).toBe(0);
    expect(computeProgress(500, 4000, 800)).toBe(0);
  });

  it('is 1 once the story bottom reaches the viewport bottom', () => {
    expect(computeProgress(-3200, 4000, 800)).toBe(1);
    expect(computeProgress(-5000, 4000, 800)).toBe(1);
  });

  it('is linear in between', () => {
    expect(computeProgress(-1600, 4000, 800)).toBeCloseTo(0.5, 10);
    expect(computeProgress(-800, 4000, 800)).toBeCloseTo(0.25, 10);
  });

  it('returns 0 for degenerate sizes instead of NaN/Infinity', () => {
    expect(computeProgress(-100, 800, 800)).toBe(0);
    expect(computeProgress(-100, 400, 800)).toBe(0);
  });
});
