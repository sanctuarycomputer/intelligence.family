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
  END,
  EXCHANGES,
  HERO_LABELS,
  HERO_LABEL_STAGGER,
  HERO_POSE,
  INTRO,
  REPLAY_AT,
  RESTING_POSE,
  SENT_AT,
  SENT_LABEL,
  type CameraPose,
  type CardKind,
  type LabelSpec,
} from './timeline';
import { THREAD } from '../thread/threadScript';

export type DemoPhase = 'idle' | 'playing' | 'done';

export type DemoState = {
  /* --- continuous: read per frame by the render loop, never by React --- */
  /** 1 = exploded hero, 0 = assembled. */
  explode: number;
  camera: CameraPose;
  /** 0 = card offscreen below, 1 = settled. */
  cardY: number;
  /** How far the phone has risen. 0 = below the fold, 1 = settled. */
  phoneY: number;
  /** Fades the hero labels as a group during the camera move. */
  labelOpacity: number;

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
};

/** Smoothstep. Every transition in the demo uses it; nothing eases in twice. */
function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Progress through a window starting at `start` and lasting `dur`. */
function progress(t: number, start: number, dur: number): number {
  if (dur <= 0) return t >= start ? 1 : 0;
  return ease((t - start) / dur);
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
 * The idle state, before play is pressed.
 *
 * `settled` is the hover reward: the Leaf drops onto the trunk and the device
 * shifts, but the labels stay and the Orin stays out. Pressing play is what
 * assembles it.
 */
export function idleState(
  settled: boolean,
  elapsed: number,
  compact = false
): DemoState {
  // Labels arrive staggered so the drawing builds itself rather than appearing
  // all at once. On a seek or a reduced-motion load, elapsed is large and they
  // are simply all there.
  const shown = HERO_LABELS.filter((_, i) => elapsed >= i * HERO_LABEL_STAGGER);
  return {
    // Compact viewports hide the labels, and an exploded device with nothing
    // naming its parts is a broken machine rather than a drawing. So below the
    // breakpoint it simply sits assembled.
    explode: compact ? 0 : settled ? 0.55 : 1,
    camera: HERO_POSE,
    cardY: 0,
    phoneY: 0,
    labelOpacity: 1,
    thinking: false,
    card: null,
    cardSent: false,
    labels: compact ? [] : shown,
    visibleMessages: 0,
    attributed: 0,
    typing: false,
    showReplay: false,
  };
}

/** The world at time `t` seconds after play. Clamped to [0, END]. */
export function stateAt(t: number): DemoState {
  const now = Math.min(END, Math.max(0, t));

  const assembled = progress(now, INTRO.assembleStart, INTRO.assembleDur);
  const camK = progress(now, INTRO.cameraStart, INTRO.cameraDur);
  const phoneY = progress(now, INTRO.phoneStart, INTRO.phoneDur);

  /* The hero labels have to survive briefly into the run so they can fade
     rather than vanish the instant play is pressed. Once they are gone the
     group returns to full opacity, because the artifact labels share the
     overlay and must not inherit the fade that retired the hero ones. */
  const heroFade = 1 - progress(now, INTRO.labelsOutStart, INTRO.labelsOutDur);
  const labelOpacity = heroFade > 0 ? heroFade : 1;

  // The thread is a prefix: entries are listed in the order they arrive, so
  // "how many are showing" is just how many are due.
  let visibleMessages = 0;
  while (
    visibleMessages < ENTRY_DUE.length &&
    now >= ENTRY_DUE[visibleMessages]
  ) {
    visibleMessages += 1;
  }

  let thinking = false;
  let card: CardKind | null = null;
  let cardSent = false;
  let cardY = 0;
  let typing = false;
  let attributed = 0;
  const labels: LabelSpec[] = heroFade > 0 ? [...HERO_LABELS] : [];

  for (const ex of EXCHANGES) {
    if (now < ex.start) break;

    // Cue times are compared as absolutes rather than as `now - ex.start`.
    // Subtracting first loses the boundary: 9.1 + 2.75 - 9.1 is 2.7499999996,
    // so a cue would fire a frame late on one exchange and on time on another.
    const at = (beat: number) => ex.start + beat;

    if (now >= at(BEAT.attribution)) attributed += 1;

    // The exchange holding the current moment drives the device. Once the next
    // one starts it takes over, except for the last, handled below.
    if (now >= ex.start + ex.duration) continue;

    thinking = now >= at(BEAT.think) && now < at(BEAT.cardUp);
    typing = now >= at(BEAT.typing) && now < at(BEAT.reply);

    if (now >= at(BEAT.cardUp)) {
      card = ex.card;
      const up = progress(now, at(BEAT.cardUp), BEAT.cardDur);
      const down = ex.keepCard
        ? 0
        : progress(now, at(BEAT.cardDown), BEAT.cardDownDur);
      cardY = Math.max(0, up - down);
      cardSent = ex.card === 'email' && now >= at(SENT_AT);
    }

    // The label waits for the card to be most of the way up, so it never
    // points at empty screen.
    if (now >= at(BEAT.label) && cardY > 0.5) {
      labels.push(cardSent ? { ...ex.label, text: SENT_LABEL } : ex.label);
    }
  }

  // Past the last exchange the demo parks rather than resetting: its card stays
  // on the screen beside the thread it produced.
  const lastEx = EXCHANGES[EXCHANGES.length - 1];
  if (lastEx.keepCard && now >= lastEx.start + lastEx.duration) {
    card = lastEx.card;
    cardY = 1;
    cardSent = true;
    labels.push({ ...lastEx.label, text: SENT_LABEL });
  }

  return {
    explode: 1 - assembled,
    camera: lerpPose(HERO_POSE, RESTING_POSE, camK),
    cardY,
    phoneY,
    labelOpacity,
    thinking,
    card,
    cardSent,
    labels,
    visibleMessages,
    attributed,
    typing,
    showReplay: now >= REPLAY_AT,
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
    s.typing ? 1 : 0,
    s.showReplay ? 1 : 0,
    s.labels.map(l => `${l.id}:${l.text}`).join(','),
  ].join('|');
}
