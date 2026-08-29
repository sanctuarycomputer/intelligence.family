import { describe, expect, it } from 'vitest';
import {
  ASSEMBLE,
  EXIT,
  FADE,
  SETTLE,
  cubicBezier,
} from '@/components/demo/easing';

const CURVES = { SETTLE, ASSEMBLE, EXIT, FADE };

describe('cubicBezier', () => {
  it('pins both ends and clamps beyond them', () => {
    for (const [name, curve] of Object.entries(CURVES)) {
      expect(curve(0), name).toBe(0);
      expect(curve(1), name).toBe(1);
      expect(curve(-1), name).toBe(0);
      expect(curve(2), name).toBe(1);
    }
  });

  it('rises without going backwards', () => {
    for (const [name, curve] of Object.entries(CURVES)) {
      let last = 0;
      for (let x = 0; x <= 1; x += 0.01) {
        const y = curve(x);
        expect(y, `${name} at ${x.toFixed(2)}`).toBeGreaterThanOrEqual(
          last - 1e-6
        );
        last = y;
      }
    }
  });

  /* An overshoot on the card rising up the device screen would leave a strip of
     lock screen showing beneath it, because the card is placed by its height. */
  it('never leaves 0..1', () => {
    for (const [name, curve] of Object.entries(CURVES)) {
      for (let x = 0; x <= 1; x += 0.005) {
        expect(curve(x), name).toBeGreaterThanOrEqual(0);
        expect(curve(x), name).toBeLessThanOrEqual(1);
      }
    }
  });

  it('matches linear when the control points are on the diagonal', () => {
    const linear = cubicBezier(1 / 3, 1 / 3, 2 / 3, 2 / 3);
    for (let x = 0.1; x < 1; x += 0.1) {
      expect(linear(x)).toBeCloseTo(x, 3);
    }
  });

  /* The point of SETTLE: most of the distance is covered early, so the motion
     arrives and settles rather than sliding at a constant rate. */
  it('front-loads SETTLE and back-loads EXIT', () => {
    expect(SETTLE(0.3)).toBeGreaterThan(0.7);
    expect(EXIT(0.3)).toBeLessThan(0.2);
    // ASSEMBLE is weighted at both ends, so it is near the middle at halfway.
    expect(ASSEMBLE(0.5)).toBeCloseTo(0.5, 1);
  });
});
