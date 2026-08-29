import { describe, expect, it } from 'vitest';
import {
  COMPACT_FRACTION,
  PHONE_H,
  PHONE_W,
  VIEWPORT_MARGIN,
  WIDE_FROM,
  fitScale,
  phoneScaleFor,
} from '@/components/thread/phoneFit';

/** A spread of real viewports, plus a few awkward ones. */
const VIEWPORTS: Array<[number, number, string]> = [
  [320, 568, 'iPhone SE, the smallest still worth supporting'],
  [375, 667, 'iPhone 8'],
  [390, 844, 'iPhone 14, exactly the frame the design is drawn at'],
  [393, 852, 'iPhone 15 Pro'],
  [430, 932, 'iPhone 15 Pro Max'],
  [360, 800, 'a common Android'],
  [844, 390, 'a phone on its side'],
  [768, 1024, 'a tablet in portrait'],
  [1023, 700, 'one pixel below the breakpoint'],
  [1024, 700, 'one pixel above it'],
  [1280, 800, 'a small laptop'],
  [1470, 728, 'the laptop this was built on'],
  [2560, 1440, 'a desktop display'],
  [300, 300, 'absurdly square'],
];

describe('phoneScaleFor', () => {
  /* The whole phone, always. Clipping it is the one outcome the sizing exists
     to prevent, so assert it everywhere rather than on the case last looked at. */
  it('fits the entire phone on screen at every viewport', () => {
    for (const [w, h, name] of VIEWPORTS) {
      const scale = phoneScaleFor(w, h);
      const drawn = { w: PHONE_W * scale, h: PHONE_H * scale };
      expect(drawn.w, `${name} width`).toBeLessThanOrEqual(w + 0.001);
      expect(drawn.h, `${name} height`).toBeLessThanOrEqual(h + 0.001);
    }
  });

  /* One scale for both axes, so the aspect cannot drift no matter what the
     viewport does. Checked as a ratio rather than trusted from the call site. */
  it('never distorts the phone', () => {
    const designed = PHONE_W / PHONE_H;
    for (const [w, h, name] of VIEWPORTS) {
      const scale = phoneScaleFor(w, h);
      expect((PHONE_W * scale) / (PHONE_H * scale), name).toBeCloseTo(
        designed,
        10
      );
    }
  });

  it('is always a usable scale', () => {
    for (const [w, h, name] of VIEWPORTS) {
      const scale = phoneScaleFor(w, h);
      expect(scale, name).toBeGreaterThan(0);
      expect(scale, name).toBeLessThanOrEqual(1);
    }
  });

  it('leaves the device its corner on narrow viewports', () => {
    for (const [w, h, name] of VIEWPORTS.filter(v => v[0] < WIDE_FROM)) {
      const scale = phoneScaleFor(w, h);
      expect(PHONE_H * scale, `${name} height`).toBeLessThanOrEqual(
        h * COMPACT_FRACTION + 0.001
      );
      expect(PHONE_W * scale, `${name} width`).toBeLessThanOrEqual(
        w * COMPACT_FRACTION + 0.001
      );
    }
  });

  it('clears the page padding on wide viewports', () => {
    for (const [w, h, name] of VIEWPORTS.filter(v => v[0] >= WIDE_FROM)) {
      expect(PHONE_H * phoneScaleFor(w, h), name).toBeLessThanOrEqual(
        h - VIEWPORT_MARGIN + 0.001
      );
    }
  });

  it('grows and shrinks with the space it is given', () => {
    // Short and narrow: height binds, so more of it helps.
    expect(phoneScaleFor(390, 600)).toBeLessThan(phoneScaleFor(390, 844));
    expect(phoneScaleFor(1280, 600)).toBeLessThan(phoneScaleFor(1280, 1100));
  });

  /* On a viewport the same shape as the phone the two constraints coincide, so
     the fraction applies to both dimensions at once — which is what "80% of the
     width and the height" means on an actual phone. */
  it('takes the full fraction of both axes on a phone-shaped viewport', () => {
    const scale = phoneScaleFor(PHONE_W, PHONE_H);
    expect(scale).toBeCloseTo(COMPACT_FRACTION, 10);
    expect(PHONE_W * scale).toBeCloseTo(PHONE_W * COMPACT_FRACTION, 10);
    expect(PHONE_H * scale).toBeCloseTo(PHONE_H * COMPACT_FRACTION, 10);
  });
});

describe('fitScale', () => {
  it('takes whichever dimension runs out first', () => {
    // Height-bound: plenty of width, not enough height.
    expect(fitScale(10000, PHONE_H / 2)).toBeCloseTo(0.5, 10);
    // Width-bound: the reverse.
    expect(fitScale(PHONE_W / 4, 10000)).toBeCloseTo(0.25, 10);
  });

  it('does not magnify past the design size', () => {
    expect(fitScale(10000, 10000)).toBe(1);
  });

  /* A viewport can report zero mid-rotation, and a zero scale would hide the
     phone with nothing to bring it back. */
  it('survives a collapsed viewport', () => {
    expect(fitScale(0, 0)).toBe(1);
    expect(fitScale(-100, 500)).toBe(1);
    expect(fitScale(Number.NaN, 500)).toBe(1);
  });
});
