import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  COMPACT_BOTTOM_INSET,
  COMPACT_DEVICE_BOX_H,
  COMPACT_FRACTION,
  PHONE_H,
  PHONE_W,
  SCREEN_TOLERANCE,
  SLIDE_OVERLAP,
  SLIDE_PHONE_FRACTION,
  VIEWPORT_MARGIN,
  WIDE_FROM,
  fitScale,
  hostScaleFor,
  phoneScaleFor,
  phoneTopFor,
  slidePhoneWidthBudget,
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

  /* The bug a scale-only assertion cannot see: `.phone-dock`'s `top` sits
     `hostTop` px down inside its host (see --demo-phone-top in
     opportunity.css), so the dock's actual bottom edge is hostTop + the
     drawn phone height, not the drawn height alone. A prior version of this
     suite only ever asserted PHONE_H * scale <= hostHeight — true even while
     the dock hung 17-32px past the slide's own bottom edge on real deck
     viewports, because nothing here ever added hostTop back in.

     The host here is deliberately smaller than the raw viewport passed
     alongside it — exactly the real shape of the deck: `.demo-stage-slide`'s
     rect excludes the chrome bar and the slide's own padding, while
     visualViewport stays full-size. That gap is what let the old code look
     safe: the viewport*SCREEN_TOLERANCE leg could still be the tighter of
     the two scales and yet, once hostTop is added back on top of it, still
     overrun a host that never got its own share of the budget. */
  it('keeps the dock inside the host once its own top offset is added back in', () => {
    const hostTop = 95;
    for (const [w, h, name] of VIEWPORTS.filter(v => v[0] >= WIDE_FROM)) {
      const hostHeight = h - 80; // stands in for the chrome bar + slide padding
      const scale = hostScaleFor(w, hostHeight, w, h, hostTop);
      const dockBottom = hostTop + PHONE_H * scale;
      expect(dockBottom, name).toBeLessThanOrEqual(hostHeight + 0.001);
    }
  });

  /* Inside is not enough on its own: fitScale always fills whichever leg
     binds exactly, so a hostTop subtraction with nothing else keeps the dock
     inside the host by fitting it flush against the bottom edge — a margin
     of exactly zero, indistinguishable from the overhang bug to a glance at
     the render. Once hostTop is supplied (a real caller, not a test default
     of 0), the host leg has to leave the same visible breathing room the
     viewport leg already does. */
  it('leaves visible breathing room under the dock, not just a non-overlapping fit', () => {
    const hostTop = 95;
    for (const [w, h, name] of VIEWPORTS.filter(v => v[0] >= WIDE_FROM)) {
      const hostHeight = h - 80;
      const scale = hostScaleFor(w, hostHeight, w, h, hostTop);
      const dockBottom = hostTop + PHONE_H * scale;
      expect(hostHeight - dockBottom, name).toBeGreaterThan(10);
    }
  });

  /* Below the breakpoint the dock anchors to the host's bottom edge instead
     (`.phone-dock`'s narrow rule), so hostTop describes an offset that does
     not apply there — passing it must not shrink the phone on top of the
     fraction narrow layouts already budget for. */
  it('ignores hostTop below the breakpoint, where the dock is bottom-anchored, not top-anchored', () => {
    const [w, h] = [800, 700];
    expect(hostScaleFor(w, h, w, h, 95)).toBe(hostScaleFor(w, h, w, h, 0));
  });

  /* The bug this exists to fix: below WIDE_FROM `.phone-dock` anchors to the
     host's *bottom* edge via a fixed `bottom: 20px` (COMPACT_BOTTOM_INSET),
     but the old code fit the phone to the host's raw height, so whenever
     height was the binding leg the drawn phone came out exactly host-height
     tall — plus the 20px the dock sits up off the bottom, its top landed
     20px above the host's own top edge. Measured for real at 1023px on the
     opportunity deck's device slide (host height 480, the report's own
     numbers): the copy above the demo box and the phone's overhanging top
     edge came out 20px into each other, not apart. The real host width here
     (`.deck-demo`'s own rect) is always well above the ~547px where height
     starts binding for these box heights, at every width this box actually
     renders at (768-1023px viewports, both container-padding tiers), so the
     whole HOST_WIDTHS/host-height-480 range below is the bug's live range,
     not a cherry-picked case. */
  it('keeps a bottom-anchored dock from overhanging the top of a narrow host', () => {
    const hostHeight = 480; // .deck-demo's own height: min(62dvh, 480px)
    for (const hostWidth of [608, 720, 863]) {
      // 768px, ~900px and 1023px viewports' real .deck-demo widths.
      const budget = slidePhoneWidthBudget(hostWidth);
      const scale = hostScaleFor(budget, hostHeight, hostWidth, 1024);
      const dockTop = hostHeight - COMPACT_BOTTOM_INSET - PHONE_H * scale;
      expect(dockTop, `hostWidth=${hostWidth}`).toBeGreaterThanOrEqual(-0.001);
    }
  });
});

/* The deck slide's device slide splits its box left/right below WIDE_FROM
   (see --slide-split in opportunity.css's `.demo-stage-slide`) instead of
   centring the phone over the device. slidePhoneWidthBudget is the phone's
   share of that split MessageThread hands to hostScaleFor as its width leg. */
describe('slidePhoneWidthBudget', () => {
  /* Real `.deck-demo` box widths at the report's three viewports: 342px at
     390 (24px container padding each side), 382px at 430, and 608px at 768
     (80px padding either side of that breakpoint). */
  const HOST_WIDTHS: Array<[number, string]> = [
    [342, '390px viewport'],
    [382, '430px viewport'],
    [608, '768px viewport'],
  ];

  /* Pinned against numbers computed by hand, once, from the current
     constants — not against `hostWidth * (SLIDE_PHONE_FRACTION +
     SLIDE_OVERLAP / 2)` re-typed here, which is just the function's own body
     copied into the test and can't fail for any change that keeps the
     formula self-consistent with itself, wrong formula included. A golden
     number has something independent to disagree with. */
  it("computes the report's three real .deck-demo box widths to their pinned budgets", () => {
    const golden: Array<[number, number, string]> = [
      [342, 160.74, '390px viewport'],
      [382, 179.54, '430px viewport'],
      [608, 285.76, '768px viewport'],
    ];
    for (const [hostWidth, expected, name] of golden) {
      expect(slidePhoneWidthBudget(hostWidth), name).toBeCloseTo(expected, 6);
    }
  });

  /* The device's own width and left offset per the CSS split (`calc((1 -
     split + overlap / 2) * 100%)` and `calc((split - overlap / 2) * 100%)`)
     are distinct formulas from the phone's, derived independently here
     rather than by subtraction from the phone's share (which would prove
     nothing about the overlap itself — any two numbers "overlap" by
     whatever is left over once you define it that way). The phone strip
     runs from the box's left edge to its own share, so that share doubles as
     the strip's right edge; checking it against the device's independently
     computed left edge catches a phone-share formula that drifts from what
     the CSS split actually implies — a sign flipped, the overlap applied
     twice, added instead of halved. */
  it('overlaps the device strip by exactly --slide-overlap of the box width', () => {
    for (const [hostWidth, name] of HOST_WIDTHS) {
      const phoneRight = slidePhoneWidthBudget(hostWidth); // phone strip starts at 0
      const deviceLeft = hostWidth * (SLIDE_PHONE_FRACTION - SLIDE_OVERLAP / 2);
      expect(phoneRight - deviceLeft, name).toBeCloseTo(
        hostWidth * SLIDE_OVERLAP,
        6
      );
    }
  });

  /* The two strips' widths, added, must equal the whole box plus exactly the
     shared band once each side's own independent formula is used — this is
     the other side of the same geometry the test above checks from the
     boundary's point of view. */
  it('together spans the box plus the overlap, not the box alone', () => {
    for (const [hostWidth, name] of HOST_WIDTHS) {
      const phoneShare = slidePhoneWidthBudget(hostWidth);
      const deviceShare =
        hostWidth * (1 - SLIDE_PHONE_FRACTION + SLIDE_OVERLAP / 2);
      expect(phoneShare + deviceShare, name).toBeCloseTo(
        hostWidth * (1 + SLIDE_OVERLAP),
        6
      );
    }
  });

  /* Not just "less than the device's share" (below) but comfortably more
     than a token strip: the device is what this slide exists to show, so a
     usable width for it means noticeably more than a fifth of the box. */
  it('leaves the device a usable share of the box, not a sliver', () => {
    for (const [hostWidth, name] of HOST_WIDTHS) {
      const deviceShare =
        hostWidth * (1 - SLIDE_PHONE_FRACTION + SLIDE_OVERLAP / 2);
      expect(deviceShare, name).toBeGreaterThan(hostWidth * 0.3);
    }
  });

  /* Bigger boxes should hand the phone a bigger strip, roughly in step with
     the box rather than flat or runaway — the fixed gap is the only thing
     that keeps it from being exactly proportional. */
  it('scales sensibly across host widths', () => {
    const widths = [...HOST_WIDTHS.map(([w]) => w)].sort((a, b) => a - b);
    for (let i = 1; i < widths.length; i++) {
      expect(
        slidePhoneWidthBudget(widths[i]),
        `${widths[i]} > ${widths[i - 1]}`
      ).toBeGreaterThan(slidePhoneWidthBudget(widths[i - 1]));
    }
    const narrow = slidePhoneWidthBudget(300);
    const wide = slidePhoneWidthBudget(600);
    expect(wide, 'doubling the box roughly doubles the strip').toBeGreaterThan(
      narrow * 1.8
    );
    expect(wide).toBeLessThan(narrow * 2.2);
  });

  /* A collapsed or nonsensical box (mid-rotation, or a host that hasn't laid
     out yet) must not hand back something the rest of the pipeline can't
     recover from — NaN, Infinity, or a budget so large hostScaleFor draws an
     absurdly oversized phone. slidePhoneWidthBudget itself has no floor (a
     tiny or negative hostWidth can produce a negative raw budget), so this
     checks what actually matters: the same hostScaleFor pipeline the phone
     dock runs through still lands on a sane, on-screen scale. */
  it('does not send an absurd result downstream for a degenerate host width', () => {
    for (const hostWidth of [0, -50, 5]) {
      const budget = slidePhoneWidthBudget(hostWidth);
      expect(Number.isFinite(budget), `hostWidth=${hostWidth}`).toBe(true);
      const scale = hostScaleFor(budget, 480, Math.max(hostWidth, 0), 844);
      expect(scale, `hostWidth=${hostWidth}`).toBeGreaterThan(0);
      expect(scale, `hostWidth=${hostWidth}`).toBeLessThanOrEqual(1);
    }
  });

  /* The whole reason this exists: leave the device more than a sliver.
     SLIDE_PHONE_FRACTION is under a half and SLIDE_OVERLAP adds the same
     half-overlap to both shares, so the phone's strip should never be the
     larger of the two. */
  it('leaves the device the larger share of the box', () => {
    for (const [hostWidth, name] of HOST_WIDTHS) {
      const phoneShare = slidePhoneWidthBudget(hostWidth);
      const deviceShare =
        hostWidth * (1 - SLIDE_PHONE_FRACTION + SLIDE_OVERLAP / 2);
      expect(phoneShare, name).toBeLessThan(deviceShare);
    }
  });

  /* Feeding the budget through the same fit the phone dock actually uses:
     the drawn phone must never spill past its strip into the device's. */
  it('keeps the phone inside its strip once fed through hostScaleFor', () => {
    for (const [hostWidth, name] of HOST_WIDTHS) {
      const budget = slidePhoneWidthBudget(hostWidth);
      const scale = hostScaleFor(budget, 480, hostWidth, 844);
      expect(PHONE_W * scale, name).toBeLessThanOrEqual(budget + 0.001);
    }
  });
});

/* SLIDE_PHONE_FRACTION, SLIDE_OVERLAP and COMPACT_DEVICE_BOX_H all exist because
   a CSS value can't be read back out of a percentage written into a custom
   property (see their own comments in phoneFit.ts) — so each one mirrors a
   literal in a stylesheet by hand instead. Nothing but this describe block
   ties the two sides together: edit either one alone and every test above
   still passes, since they only exercise phoneFit.ts's own arithmetic, never
   the CSS it's supposed to match. Reading the stylesheets' source, the way
   tests/opportunity-copy.test.ts already does for deck copy, is the only way
   to catch that drift. */
describe('CSS mirror constants', () => {
  const globalsCss = () =>
    readFileSync(path.join(__dirname, '..', 'app', 'globals.css'), 'utf8');
  const opportunityCss = () =>
    readFileSync(
      path.join(__dirname, '..', 'app', 'opportunity', 'opportunity.css'),
      'utf8'
    );

  it("COMPACT_DEVICE_BOX_H matches .demo-scene's height in globals.css's max-width: 1023px block", () => {
    const css = globalsCss();
    const match = css.match(/\.demo-scene\s*\{[^}]*height:\s*([\d.]+)dvh/);
    expect(
      match,
      'app/globals.css: .demo-scene { height: N dvh } not found'
    ).not.toBeNull();
    const cssFraction = Number(match![1]) / 100;
    expect(
      COMPACT_DEVICE_BOX_H,
      `components/thread/phoneFit.ts's COMPACT_DEVICE_BOX_H (${COMPACT_DEVICE_BOX_H}) must match app/globals.css's .demo-scene height (${match![1]}dvh)`
    ).toBeCloseTo(cssFraction, 10);
  });

  it('SLIDE_PHONE_FRACTION matches --slide-split in opportunity.css', () => {
    const css = opportunityCss();
    const match = css.match(/--slide-split:\s*([\d.]+);/);
    expect(
      match,
      'app/opportunity/opportunity.css: --slide-split not found'
    ).not.toBeNull();
    expect(
      SLIDE_PHONE_FRACTION,
      `components/thread/phoneFit.ts's SLIDE_PHONE_FRACTION (${SLIDE_PHONE_FRACTION}) must match app/opportunity/opportunity.css's --slide-split (${match![1]})`
    ).toBeCloseTo(Number(match![1]), 10);
  });

  it('SLIDE_OVERLAP matches --slide-overlap in opportunity.css', () => {
    const css = opportunityCss();
    const match = css.match(/--slide-overlap:\s*([\d.]+);/);
    expect(
      match,
      'app/opportunity/opportunity.css: --slide-overlap not found'
    ).not.toBeNull();
    expect(
      SLIDE_OVERLAP,
      `components/thread/phoneFit.ts's SLIDE_OVERLAP (${SLIDE_OVERLAP}) must match app/opportunity/opportunity.css's --slide-overlap (${match![1]})`
    ).toBeCloseTo(Number(match![1]), 10);
  });
});
