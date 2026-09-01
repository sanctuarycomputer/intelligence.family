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
 * the screen edges.
 *
 * 0.92 was the opening bid, but the real render on the device slide showed it
 * wasn't tight enough: `.phone-dock`'s `top` is a fixed 95px (from
 * `--demo-phone-top`), a positioning offset neither this function nor the
 * plain `fitScale(rect.width, rect.height)` it replaces has ever known about.
 * A tolerance alone cannot fully cancel a fixed-pixel offset — as the
 * viewport shrinks, 95px eats a growing share of it — but 0.85 clears that
 * offset with a visible margin at every viewport this was checked against
 * (ordinary laptop heights and up), where 0.92 did not. Below roughly 650px
 * of height the margin thins out; below roughly 630px it goes negative again.
 * That residual gap is a positioning problem, not a scale one, and is out of
 * this function's reach — see the phoneFit test file and the phone-cap task
 * report for the fuller account.
 */
export const SCREEN_TOLERANCE = 0.85;

/**
 * The scale for a phone inside a host box, capped so the box can never grow
 * the phone past the screen.
 *
 * Whichever leg is tighter wins: fitting the host, or fitting the viewport
 * shrunk by SCREEN_TOLERANCE. Both go through fitScale, which is where the
 * single-scale-for-both-axes guarantee lives, so taking the min of two such
 * scales still leaves one uniform number — the aspect ratio can't drift
 * either leg introduces on its own.
 */
export function hostScaleFor(
  hostWidth: number,
  hostHeight: number,
  viewportWidth: number,
  viewportHeight: number
): number {
  return Math.min(
    fitScale(hostWidth, hostHeight),
    fitScale(
      viewportWidth * SCREEN_TOLERANCE,
      viewportHeight * SCREEN_TOLERANCE
    )
  );
}

/** Page padding above and below the phone, from main's py-32 plus room to breathe. */
export const VIEWPORT_MARGIN = 190;

/** Matches the breakpoint the stylesheet and the clock's compact flag use. */
export const WIDE_FROM = 1024;

/** How much of a narrow viewport the phone may take, leaving the device its corner. */
export const COMPACT_FRACTION = 0.8;

/**
 * The gap under the phone on a narrow viewport.
 *
 * It should read as sitting near the bottom edge, not welded to it — and on a
 * phone the very bottom is where the home indicator and the browser's own
 * chrome live.
 */
export const COMPACT_BOTTOM_INSET = 20;

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
