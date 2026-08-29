/**
 * Easing curves for the demo.
 *
 * Everything used to run on a single smoothstep, which is symmetrical and reads
 * as machinery: things left and arrived at the same rate. These are the same
 * cubic-beziers CSS takes, so a motion driven from the clock and a motion driven
 * from a stylesheet can be given the identical curve and actually match.
 *
 * All of them stay inside 0..1. An overshoot would look good on the card rising
 * up the device screen and then leave a strip of lock screen showing beneath it,
 * because the card is positioned by its own height.
 */

/**
 * Solves a CSS-style cubic-bezier, whose first and last control points are
 * fixed at (0,0) and (1,1).
 *
 * Newton-Raphson on x, falling back to bisection where the curve is too flat
 * for the derivative to be useful. Returns a function, so the per-frame cost is
 * the solve alone.
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): (t: number) => number {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1;
  const c = (a1: number) => 3 * a1;

  const curve = (t: number, p1: number, p2: number) =>
    ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
  const slope = (t: number, p1: number, p2: number) =>
    3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    let guess = t;
    for (let i = 0; i < 5; i += 1) {
      const d = slope(guess, x1, x2);
      if (d === 0) break;
      guess -= (curve(guess, x1, x2) - t) / d;
    }

    // Bisect if Newton wandered outside the domain, which it can where the
    // curve is nearly flat.
    if (guess < 0 || guess > 1) {
      let lo = 0;
      let hi = 1;
      guess = t;
      for (let i = 0; i < 20; i += 1) {
        const x = curve(guess, x1, x2);
        if (Math.abs(x - t) < 1e-5) break;
        if (x < t) lo = guess;
        else hi = guess;
        guess = (lo + hi) / 2;
      }
    }

    return curve(guess, y1, y2);
  };
}

/**
 * Named curves. The CSS comment beside each is the literal value to use in a
 * stylesheet for the same motion, so the two never drift apart by hand.
 */

/** Leaves fast, arrives slowly and settles hard. The dramatic one. */
export const SETTLE = cubicBezier(0.16, 1, 0.3, 1);
/* css: cubic-bezier(0.16, 1, 0.3, 1) */

/** Weighted both ends: for something with mass closing itself up. */
export const ASSEMBLE = cubicBezier(0.65, 0, 0.35, 1);
/* css: cubic-bezier(0.65, 0, 0.35, 1) */

/** Accelerates away. For things leaving, which should not linger. */
export const EXIT = cubicBezier(0.55, 0, 0.85, 0.35);
/* css: cubic-bezier(0.55, 0, 0.85, 0.35) */

/** Gentle and quick, for opacity, where a dramatic curve reads as a flicker. */
export const FADE = cubicBezier(0.4, 0, 0.2, 1);
/* css: cubic-bezier(0.4, 0, 0.2, 1) */
