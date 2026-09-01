/**
 * How big the phone can be drawn.
 *
 * The frame is always laid out at its true size and scaled, never reflowed:
 * everything inside is in iOS points, so narrowing the box squeezes the status
 * bar icons out and rewraps the copy. That makes "how much does it shrink" the
 * only sizing question, and this is the answer to it.
 */

/** iPhone logical points, 19.5:9. */
export const PHONE_W = 390;
export const PHONE_H = 844;

/**
 * The largest scale that fits the whole phone inside the given box.
 *
 * Both dimensions are considered, so the phone is never clipped whichever one
 * runs out first, and a single scale is returned so the aspect ratio is
 * preserved by construction rather than by remembering to. Never magnifies
 * past 1: the frame is drawn at its design size and blowing it up would only
 * soften it.
 */
export function fitScale(boxWidth: number, boxHeight: number): number {
  const scale = Math.min(1, boxWidth / PHONE_W, boxHeight / PHONE_H);
  // A zero or negative box (a collapsed viewport mid-rotation) would otherwise
  // hand back a scale that hides the phone and never recovers.
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

/**
 * How much of the visual viewport a hosted phone may fill.
 *
 * The host branch (a deck slide) fits the phone to whatever box the page
 * gives it, and nothing bounds that box itself — a slide can hand the demo
 * the whole stage, and the phone would grow to fill it and land flush against
 * the screen edges. This is pure breathing room against that: a host exactly
 * viewport-sized still leaves a visible gap at the physical screen edge.
 *
 * It used to also be doing a second job it could never actually finish:
 * standing in for `hostTop` below, which nothing subtracted anywhere. A
 * tolerance on the *viewport* cannot cancel an offset inside the *host* — the
 * two boxes differ by however much chrome sits around the host (the deck's
 * bar, its padding), so no single fraction of one bounds a fixed pixel
 * amount eaten from the other. `hostScaleFor` now subtracts hostTop directly
 * from the host leg's own budget, which is what actually fixed the overhang;
 * see the "keeps the dock inside the host" test in phoneFit.test.ts. This
 * constant is free to go back to being a plain, honest margin — including,
 * now, on the host leg itself: see hostScaleFor's own comment on why fitting
 * the offset-adjusted host exactly is not enough on its own.
 */
export const SCREEN_TOLERANCE = 0.85;

/** Matches the breakpoint the stylesheet and the clock's compact flag use. */
export const WIDE_FROM = 1024;

/**
 * The gap under the phone on a narrow viewport.
 *
 * It should read as sitting near the bottom edge, not welded to it — and on a
 * phone the very bottom is where the home indicator and the browser's own
 * chrome live. Declared here, ahead of `phoneScaleFor` below, because
 * `hostScaleFor` needs it too: `.phone-dock`'s narrow `bottom: 20px` rule
 * (globals.css) is unscoped, so it anchors the dock to the bottom of
 * whatever box it is in — the viewport on the homepage, a host box on a deck
 * slide — and both fits have to leave the same gap for it.
 */
export const COMPACT_BOTTOM_INSET = 20;

/**
 * The scale for a phone inside a host box, capped so the box can never grow
 * the phone past the screen.
 *
 * `hostTop` is how far down the dock's own `top` sits inside that host (see
 * `--demo-phone-top` in opportunity.css) — the dock's real bottom edge is
 * `hostTop + PHONE_H * scale`, not `PHONE_H * scale` alone, so it has to come
 * out of the host leg's budget before fitScale ever sees it. It only applies
 * at `viewportWidth >= WIDE_FROM`: below that breakpoint `.phone-dock`
 * anchors to the host's *bottom* edge instead (see globals.css), where a top
 * offset has nothing to do with where the dock actually sits.
 *
 * Below WIDE_FROM the same problem shows up from the other side: the dock's
 * real *top* edge is `hostHeight - COMPACT_BOTTOM_INSET - PHONE_H * scale`,
 * not `hostHeight - PHONE_H * scale`, and fitScale fills the box's whole
 * height whenever height is what binds. On a deck slide's device slide —
 * tall enough, with a phone strip wide enough, that height is what binds —
 * that put the dock's top 20px above `.demo-stage-slide`'s own top edge,
 * overlapping the copy above it at tablet widths (measured at 1023px: the
 * copy's own bottom edge and the phone's overhanging top edge landed 20px
 * apart, the wrong way). Homepage's `phoneScaleFor`/`phoneTopFor` already
 * budget for this the same way; this mirrors it for the host leg. Gated on
 * `viewportWidth > 0` so a collapsed or absent viewport (several existing
 * tests' and callers' shorthand for "no viewport data") keeps fitting the
 * host's raw height rather than being mistaken for an actual narrow phone.
 *
 * Whichever leg is tighter wins: fitting the (offset-adjusted) host, or
 * fitting the viewport shrunk by SCREEN_TOLERANCE. Both go through fitScale,
 * which is where the single-scale-for-both-axes guarantee lives, so taking
 * the min of two such scales still leaves one uniform number — the aspect
 * ratio can't drift either leg introduces on its own.
 *
 * The host leg gets its own SCREEN_TOLERANCE margin too, once `hostTop` is
 * actually supplied. fitScale always fills whichever dimension binds
 * exactly, so subtracting hostTop and stopping there fits the dock flush
 * against the host's bottom edge whenever the host leg is what binds — "not
 * overhanging" but with a margin of precisely zero, which reads as the same
 * bug from a glance at the render. Gated on `hostTop > 0` rather than
 * applied unconditionally, so every caller that never passed a real offset
 * (every existing test but the ones testing this) keeps fitting the host
 * exactly, as it always did. The narrow leg below deliberately skips this
 * same tolerance and only removes the bottom inset: the fix is for the
 * overhang, not for extra breathing room nobody asked for.
 */
export function hostScaleFor(
  hostWidth: number,
  hostHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  hostTop = 0
): number {
  const wideWithOffset = viewportWidth >= WIDE_FROM && hostTop > 0;
  const narrowBottomAnchored = viewportWidth > 0 && viewportWidth < WIDE_FROM;
  const budgetHeight = wideWithOffset
    ? (hostHeight - hostTop) * SCREEN_TOLERANCE
    : narrowBottomAnchored
      ? hostHeight - COMPACT_BOTTOM_INSET
      : hostHeight;
  const budgetWidth = wideWithOffset ? hostWidth * SCREEN_TOLERANCE : hostWidth;
  return Math.min(
    fitScale(budgetWidth, budgetHeight),
    fitScale(
      viewportWidth * SCREEN_TOLERANCE,
      viewportHeight * SCREEN_TOLERANCE
    )
  );
}

/** Page padding above and below the phone, from main's py-32 plus room to breathe. */
export const VIEWPORT_MARGIN = 190;

/** How much of a narrow viewport the phone may take, leaving the device its corner. */
export const COMPACT_FRACTION = 0.8;

/**
 * The scale for a given viewport.
 *
 * Narrow, the phone sits on the bottom edge inside a fraction of the screen,
 * with the rest of the top left for the device. Wide, it is bounded by the
 * page's vertical padding instead, and the width is never the binding
 * constraint at that size.
 */
export function phoneScaleFor(width: number, height: number): number {
  return width < WIDE_FROM
    ? fitScale(
        width * COMPACT_FRACTION,
        (height - COMPACT_BOTTOM_INSET) * COMPACT_FRACTION
      )
    : fitScale(width, height - VIEWPORT_MARGIN);
}

/**
 * Height of the device's corner box on a narrow viewport, as a fraction of it.
 *
 * Mirrors `.demo-scene`'s height in globals.css. The device is centred in
 * that box, so the box's middle has to stay above the phone's top edge —
 * otherwise the device's screen sits behind the conversation, which is exactly
 * what it looked like at 42dvh. `phoneTopFor` is the other half of that check.
 */
export const COMPACT_DEVICE_BOX_H = 0.26;

/** Where the phone's top edge lands on a narrow viewport, in pixels. */
export function phoneTopFor(width: number, height: number): number {
  return height - COMPACT_BOTTOM_INSET - PHONE_H * phoneScaleFor(width, height);
}

/**
 * Below WIDE_FROM, a deck slide's demo box splits left/right instead of
 * centring the phone over the device (see --slide-split in
 * opportunity.css's `.demo-stage-slide` rule). Mirrors that custom
 * property's value rather than reading it: percentages written into a
 * custom property don't resolve to a length getComputedStyle can hand back,
 * so there is nothing here to parse even by reading the host's computed
 * style, the way `hostTop` is below.
 */
export const SLIDE_PHONE_FRACTION = 0.42;

/**
 * Mirrors --slide-overlap in opportunity.css: how much of the box's width
 * the phone and device strips share, as a fraction of it. Each strip
 * extends half of this past --slide-split — the owner's ask was for the two
 * to overlap instead of sitting apart with a gap, so each can be drawn
 * bigger. A fraction, not a pixel gutter, because it is applied against the
 * box's own width the same way SLIDE_PHONE_FRACTION is, and the box's width
 * varies with the viewport.
 */
export const SLIDE_OVERLAP = 0.1;

/**
 * The phone's width budget inside a slide's narrow, split demo box.
 *
 * `hostWidth` is the *whole* box's width (`.demo-stage-slide`'s rect, same
 * as `.deck-demo`'s) — not yet narrowed to the phone's strip of it. Without
 * this, MessageThread's fit would keep handing hostScaleFor the whole box's
 * width, and since that box is usually wide enough that only its height
 * ever binds, the phone would render at its full height-bound size and spill
 * across the boundary into the device's strip beside it.
 *
 * The phone's strip runs from the box's left edge to --slide-split plus half
 * the overlap (see the CSS), so its share of the box is SLIDE_PHONE_FRACTION
 * plus half of SLIDE_OVERLAP — added, not subtracted, because the strip now
 * reaches past the boundary into the shared band rather than stopping short
 * of it for a gap.
 *
 * Only meaningful below WIDE_FROM, where the box actually splits; wide, the
 * phone gets the box's whole width as it always has, so callers must not
 * apply this there.
 */
export function slidePhoneWidthBudget(hostWidth: number): number {
  return hostWidth * (SLIDE_PHONE_FRACTION + SLIDE_OVERLAP / 2);
}
