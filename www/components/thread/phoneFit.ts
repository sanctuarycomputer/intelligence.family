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
 * Mirrors `.device-layer`'s height in globals.css. The device is centred in
 * that box, so the box's middle has to stay above the phone's top edge —
 * otherwise the device's screen sits behind the conversation, which is exactly
 * what it looked like at 42dvh. `phoneTopFor` is the other half of that check.
 */
export const COMPACT_DEVICE_BOX_H = 0.26;

/** Where the phone's top edge lands on a narrow viewport, in pixels. */
export function phoneTopFor(width: number, height: number): number {
  return height - COMPACT_BOTTOM_INSET - PHONE_H * phoneScaleFor(width, height);
}
