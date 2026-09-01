/**
 * The whole demo as a pure function of time.
 *
 * Nothing here reads a clock, touches the DOM or holds state. Given `t`, it
 * returns everything on screen at that instant. That is what makes the device's
 * thinking indicator and the phone's typing bubble impossible to desynchronise:
 * both are derived from the same number in the same frame, not from two timers
 * that agree at first.
 *
 * It also means seeking is free. Replay is stateAt(0), reduced motion is
 * stateAt(END), and the debug scrubber is stateAt(anything).
 */

import {
  BEAT,
  CHECKOUT,
  END,
  EXCHANGES,
  HERO_POSE,
  INTRO,
  REPLAY_AT,
  COMPACT_POSE,
  COMPACT_START_POSE,
  RESTING_POSE,
  type CameraPose,
  type CardKind,
  type LabelSpec,
} from './timeline';
import { THREAD } from '../thread/threadScript';
import { EXIT, GLIDE, SETTLE } from './easing';

export type DemoPhase = 'idle' | 'playing' | 'done';

export type DemoState = {
  /* --- continuous: read per frame by the render loop, never by React --- */
  camera: CameraPose;
  /** 0 = card offscreen below, 1 = settled. */
  cardY: number;
  /**
   * How far through the opening drift, 0..1. The scene fades the visitor's own
   * orbit out against this, so letting go of the device and pressing play do
   * not fight over the camera.
   */
  cameraProgress: number;
  /**
   * Whether the phone is up. Deliberately a boolean, not a position: the rise
   * is a CSS transition, so it eases out on replay as well as in, and nothing
   * has to write a transform every frame to achieve it.
   */
  phoneUp: boolean;

  /* --- discrete: React re-renders only when one of these changes --- */
  thinking: boolean;
  card: CardKind | null;
  cardSent: boolean;
  labels: LabelSpec[];
  /** How many entries of THREAD are on screen. They reveal in order. */
  visibleMessages: number;
  /** How many replies have had their attribution line arrive. */
  attributed: number;
  typing: boolean;
  showReplay: boolean;
  /**
   * The payment sheet is up. A boolean rather than a position, for the same
   * reason phoneUp is: a CSS transition carries it, so it eases out on the way
   * down too, and nothing has to write a transform every frame.
   */
  sheetUp: boolean;
  /** The Apple Pay button has been pressed. */
  sheetPaid: boolean;
  /** Which element is showing a tap ripple, if any. */
  tap: 'checkout' | 'pay' | null;
};

/**
 * Progress through a window starting at `start` and lasting `dur`, shaped by
 * `curve`. Each cue names its own curve: a camera settling and a card leaving
 * should not move the same way.
 */
function progress(
  t: number,
  start: number,
  dur: number,
  curve: (x: number) => number = SETTLE
): number {
  if (dur <= 0) return t >= start ? 1 : 0;
  return curve(Math.min(1, Math.max(0, (t - start) / dur)));
}

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

function lerpPose(a: CameraPose, b: CameraPose, k: number): CameraPose {
  return {
    dir: [
      lerp(a.dir[0], b.dir[0], k),
      lerp(a.dir[1], b.dir[1], k),
      lerp(a.dir[2], b.dir[2], k),
    ],
    dist: lerp(a.dist, b.dist, k),
    offsetX: lerp(a.offsetX, b.offsetX, k),
    offsetY: lerp(a.offsetY, b.offsetY, k),
  };
}

/**
 * When each thread entry is due, in absolute seconds.
 *
 * Derived from the entry's own beat tag rather than from a per-exchange count,
 * so the copy and the timeline stay in step: a bubble added to threadScript is
 * scheduled by the fact of being there.
 */
const ENTRY_DUE: number[] = THREAD.map(entry => {
  const ex = EXCHANGES.find(e => e.id === entry.exchange);
  if (!ex) {
    throw new Error(
      `threadScript entry "${entry.id}" names unknown exchange "${entry.exchange}"`
    );
  }
  return ex.start + BEAT[entry.beat];
});

/**
 * Entries are listed in the order they appear, so the visible set is always a
 * prefix. Asserted at module load rather than trusted: an out-of-order entry
 * would otherwise pop in silently at the wrong moment.
 */
for (let i = 1; i < ENTRY_DUE.length; i += 1) {
  if (ENTRY_DUE[i] < ENTRY_DUE[i - 1]) {
    throw new Error(
      `threadScript is out of order: "${THREAD[i].id}" is due before "${THREAD[i - 1].id}"`
    );
  }
}

/**
 * How long after a reply lands its attribution line arrives.
 *
 * Read off the shared beat table rather than written twice, so the gap stays
 * one number. Applied per reply rather than per exchange: the commerce
 * exchange sends two, and an exchange-level count could only ever light the
 * first one's citation.
 */
export const ATTRIBUTION_LAG = BEAT.attribution - BEAT.reply;

/**
 * When each reply's attribution line is due, in absolute seconds.
 *
 * Replies appear in thread order, so this is ascending and `attributed` stays
 * a prefix count — which is exactly what REPLY_ORDINAL indexes against.
 */
const ATTRIBUTION_DUE: number[] = THREAD.flatMap((entry, i) =>
  entry.kind === 'reply' ? [ENTRY_DUE[i] + ATTRIBUTION_LAG] : []
);

/**
 * The idle state, before play is pressed: the device sitting still on the
 * right, nothing on screen but the leaves drifting across its own display and
 * whatever angle the visitor has turned it to.
 */
export function idleState(compact = false): DemoState {
  return {
    camera: compact ? COMPACT_START_POSE : HERO_POSE,
    cardY: 0,
    cameraProgress: 0,
    phoneUp: false,
    thinking: false,
    card: null,
    cardSent: false,
    labels: [],
    visibleMessages: 0,
    attributed: 0,
    typing: false,
    showReplay: false,
    sheetUp: false,
    sheetPaid: false,
    tap: null,
  };
}

/**
 * The world at time `t` seconds after play. Clamped to [0, END].
 *
 * `compact` is the narrow-viewport layout: the device flies into its own corner
 * of the screen and stops there, rather than drifting aside to make room for
 * the phone — on a phone there is nowhere to drift to, and it was not on screen
 * to begin with.
 */
export function stateAt(t: number, compact = false): DemoState {
  const now = Math.min(END, Math.max(0, t));

  // GLIDE rather than SETTLE at both widths, for opposite reasons. Wide, the
  // device is drifting out of the way, and an expo-out over three and a half
  // seconds reads as a lurch then a crawl. Narrow, it is arriving, and SETTLE
  // is three quarters done in 320ms — the whole move would happen underneath
  // the layer's fade and the thing would look like it had faded in after all.
  // GLIDE is 17% along when the fade ends, so the travel is the part you see.
  const camK = compact
    ? progress(now, INTRO.compactCameraStart, INTRO.compactCameraDur, GLIDE)
    : progress(now, INTRO.cameraStart, INTRO.cameraDur, GLIDE);

  // The thread is a prefix: entries are listed in the order they arrive, so
  // "how many are showing" is just how many are due.
  let visibleMessages = 0;
  while (
    visibleMessages < ENTRY_DUE.length &&
    now >= ENTRY_DUE[visibleMessages]
  ) {
    visibleMessages += 1;
  }

  // Same shape as visibleMessages, and for the same reason: attributions are
  // ordered, so "how many have arrived" is just how many are due.
  let attributed = 0;
  while (
    attributed < ATTRIBUTION_DUE.length &&
    now >= ATTRIBUTION_DUE[attributed]
  ) {
    attributed += 1;
  }

  let thinking = false;
  let card: CardKind | null = null;
  let cardSent = false;
  let cardY = 0;
  let typing = false;
  let sheetUp = false;
  let sheetPaid = false;
  let tap: DemoState['tap'] = null;
  const labels: LabelSpec[] = [];

  for (const ex of EXCHANGES) {
    if (now < ex.start) break;

    // Cue times are compared as absolutes rather than as `now - ex.start`.
    // Subtracting first loses the boundary: 9.1 + 2.75 - 9.1 is 2.7499999996,
    // so a cue would fire a frame late on one exchange and on time on another.
    const at = (beat: number) => ex.start + beat;

    // The exchange holding the current moment drives the device. Once the next
    // one starts it takes over, except for the last, handled below.
    if (now >= ex.start + ex.duration) continue;

    thinking = now >= at(BEAT.think) && now < at(BEAT.cardUp);
    typing = now >= at(BEAT.typing) && now < at(BEAT.reply);

    if (now >= at(BEAT.cardUp)) {
      card = ex.card;
      const up = progress(now, at(BEAT.cardUp), BEAT.cardDur, SETTLE);
      const down = ex.keepCard
        ? 0
        : progress(
            now,
            at(ex.cardDownAt ?? BEAT.cardDown),
            BEAT.cardDownDur,
            EXIT
          );
      cardY = Math.max(0, up - down);
      cardSent = ex.sentAt !== undefined && now >= at(ex.sentAt);
    }

    // The label waits for the card to be most of the way up, so it never
    // points at empty screen.
    if (now >= at(BEAT.label) && cardY > 0.5) {
      labels.push(
        cardSent && ex.sentLabel
          ? { ...ex.label, text: ex.sentLabel }
          : ex.label
      );
    }

    if (ex.checkout) {
      sheetUp = now >= at(CHECKOUT.sheetUp) && now < at(CHECKOUT.sheetDown);
      // Held for the rest of the exchange rather than until the sheet is
      // down: flipping back to unpaid while it is still sliding away would
      // read as the payment being undone.
      sheetPaid = now >= at(CHECKOUT.paid);
      if (
        now >= at(CHECKOUT.linkTap) &&
        now < at(CHECKOUT.linkTap + CHECKOUT.tapDur)
      ) {
        tap = 'checkout';
      } else if (
        now >= at(CHECKOUT.payTap) &&
        now < at(CHECKOUT.payTap + CHECKOUT.tapDur)
      ) {
        tap = 'pay';
      }
    }
  }

  // Past the last exchange the demo parks rather than resetting: its card stays
  // on the screen beside the thread it produced.
  const lastEx = EXCHANGES[EXCHANGES.length - 1];
  if (lastEx.keepCard && now >= lastEx.start + lastEx.duration) {
    card = lastEx.card;
    cardY = 1;
    cardSent = lastEx.sentAt !== undefined;
    labels.push(
      cardSent && lastEx.sentLabel
        ? { ...lastEx.label, text: lastEx.sentLabel }
        : lastEx.label
    );
  }

  return {
    camera: compact
      ? lerpPose(COMPACT_START_POSE, COMPACT_POSE, camK)
      : lerpPose(HERO_POSE, RESTING_POSE, camK),
    cardY,
    cameraProgress: camK,
    phoneUp: now >= INTRO.phoneStart,
    thinking,
    card,
    cardSent,
    labels,
    visibleMessages,
    attributed,
    typing,
    showReplay: now >= REPLAY_AT,
    sheetUp,
    sheetPaid,
    tap,
  };
}

/**
 * The part of the state React cares about, as a comparable string.
 *
 * The clock ticks every frame but only notifies subscribers when this changes,
 * which across the whole run is a dozen or so renders rather than ~1,500.
 * Continuous values are deliberately excluded: they belong to the render loop.
 */
export function discreteKey(s: DemoState): string {
  return [
    s.thinking ? 1 : 0,
    s.card ?? '-',
    s.cardSent ? 1 : 0,
    s.visibleMessages,
    s.attributed,
    s.phoneUp ? 1 : 0,
    s.typing ? 1 : 0,
    s.showReplay ? 1 : 0,
    s.sheetUp ? 1 : 0,
    s.sheetPaid ? 1 : 0,
    s.tap ?? '-',
    s.labels.map(l => `${l.id}:${l.text}`).join(','),
  ].join('|');
}
