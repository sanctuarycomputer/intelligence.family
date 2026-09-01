import { describe, expect, it } from 'vitest';
import {
  COMPACT_BOTTOM_INSET,
  COMPACT_DEVICE_BOX_H,
  COMPACT_FRACTION,
  PHONE_H,
  PHONE_W,
  SCREEN_TOLERANCE,
  VIEWPORT_MARGIN,
  WIDE_FROM,
  fitScale,
  hostScaleFor,
  phoneScaleFor,
  phoneTopFor,
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

  /* Docked 20px up from the bottom, so the phone plus that gap still has to
     fit — otherwise the inset just pushes its top off the other edge. */
  it('never runs off the top once the bottom gap is taken', () => {
    for (const [w, h, name] of VIEWPORTS.filter(v => v[0] < WIDE_FROM)) {
      const drawn = PHONE_H * phoneScaleFor(w, h);
      expect(drawn + COMPACT_BOTTOM_INSET, name).toBeLessThanOrEqual(h + 0.001);
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
  it('is bounded by the fraction on a phone-shaped viewport', () => {
    const scale = phoneScaleFor(PHONE_W, PHONE_H);
    expect(scale).toBeLessThanOrEqual(COMPACT_FRACTION);
    // The bottom gap comes out of the height, so height is what binds.
    expect(PHONE_H * scale).toBeCloseTo(
      (PHONE_H - COMPACT_BOTTOM_INSET) * COMPACT_FRACTION,
      6
    );
  });
});

/* The device sits in a box pinned to the top right and is centred in it, so
   the box's middle is where the device actually is. At 42dvh that middle sat
   below the phone's top edge on every phone tested, which put the device's
   screen behind the conversation. */
describe('the device box on narrow viewports', () => {
  it('keeps the device above the phone', () => {
    for (const [w, h, name] of VIEWPORTS.filter(v => v[0] < WIDE_FROM)) {
      const boxCentre = (h * COMPACT_DEVICE_BOX_H) / 2;
      expect(boxCentre, `${name} box centre vs phone top`).toBeLessThan(
        phoneTopFor(w, h)
      );
    }
  });

  it('leaves the phone somewhere to be', () => {
    for (const [w, h, name] of VIEWPORTS.filter(v => v[0] < WIDE_FROM)) {
      expect(phoneTopFor(w, h), name).toBeGreaterThan(0);
    }
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

/* The deck slide now hands the demo its whole stage rather than a grid cell,
   so the host box alone can no longer be trusted to keep the phone off the
   screen edges — hostScaleFor is the cap that fixes that. */
describe('hostScaleFor', () => {
  it('fits the whole phone inside the screen at every viewport, even when the host is the whole thing', () => {
    for (const [w, h, name] of VIEWPORTS) {
      const scale = hostScaleFor(w, h, w, h);
      const drawn = { w: PHONE_W * scale, h: PHONE_H * scale };
      expect(drawn.w, `${name} width`).toBeLessThanOrEqual(w + 0.001);
      expect(drawn.h, `${name} height`).toBeLessThanOrEqual(h + 0.001);
    }
  });

  /* Both legs go through fitScale, which is where the single-scale guarantee
     lives — taking the min of two such scales must still leave one uniform
     number, even when the host and the viewport disagree about shape. */
  it('never distorts the phone', () => {
    const designed = PHONE_W / PHONE_H;
    for (const [w, h, name] of VIEWPORTS) {
      const scale = hostScaleFor(w, h * 1.5, w * 0.6, h);
      expect((PHONE_W * scale) / (PHONE_H * scale), name).toBeCloseTo(
        designed,
        10
      );
    }
  });

  it('never magnifies past 1', () => {
    expect(hostScaleFor(10000, 10000, 10000, 10000)).toBe(1);
  });

  /* The device-slide bug this exists to fix: a host bigger than the screen
     must be bound by the screen, not by its own oversized box. */
  it('is capped by the screen when the host is larger than it', () => {
    const scale = hostScaleFor(5000, 5000, 1280, 800);
    expect(scale).toBeCloseTo(
      fitScale(1280 * SCREEN_TOLERANCE, 800 * SCREEN_TOLERANCE),
      10
    );
  });

  /* A host smaller than the screen (a half-width grid cell, say — the layout
     this branch used before the slide got its own stage) is still bound by
     its own box: the screen cap must never loosen a tighter host fit. */
  it('is capped by the host when the host is smaller than the screen', () => {
    const scale = hostScaleFor(300, 500, 2560, 1440);
    expect(scale).toBeCloseTo(fitScale(300, 500), 10);
  });

  /* A collapsed host falls back to fitScale's degenerate case (1, "don't
     hide the phone"), but the screen leg still applies on top of that
     fallback — so a collapsed host with a real screen behind it lands on the
     screen's honest scale, not on the fallback itself. Only when *both* legs
     are degenerate does the fallback have nothing to be capped against. */
  it('survives a collapsed host or a collapsed viewport without hiding the phone', () => {
    expect(hostScaleFor(0, 0, 1280, 800)).toBeCloseTo(
      fitScale(1280 * SCREEN_TOLERANCE, 800 * SCREEN_TOLERANCE),
      10
    );
    expect(hostScaleFor(-100, 500, 1280, 800)).toBeGreaterThan(0);
    expect(hostScaleFor(1280, 800, 0, 0)).toBeCloseTo(fitScale(1280, 800), 10);
    expect(hostScaleFor(1280, 800, -100, 500)).toBeGreaterThan(0);
    expect(hostScaleFor(0, 0, 0, 0)).toBe(1);
  });

  /* The regression itself: a host exactly phone-shaped (so the host leg
     alone would happily hand back a full-size scale of 1) still has to give
     up some of that room to the screen cap. If this ever comes back 1, the
     cap has stopped doing anything. */
  it('gives up room to the screen cap even when the host fit alone would allow full size', () => {
    const k = 1.05;
    const host = { w: PHONE_W * k, h: PHONE_H * k };
    expect(fitScale(host.w, host.h)).toBe(1); // the host leg alone would not shrink it
    const scale = hostScaleFor(host.w, host.h, host.w, host.h);
    expect(scale).toBeLessThan(1);
    expect(scale).toBeCloseTo(
      fitScale(host.w * SCREEN_TOLERANCE, host.h * SCREEN_TOLERANCE),
      10
    );
  });
});
