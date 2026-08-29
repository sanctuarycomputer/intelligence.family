/**
 * The demo script, as data.
 *
 * Everything here is absolute seconds from the moment play is pressed. Nothing
 * in the demo schedules itself; the clock advances one number and demoState.ts
 * derives the whole world from it. Editing the pacing means editing this file
 * and nothing else.
 *
 * The narrative version, with the reasoning behind each beat, is
 * docs/homepage-demo-script.md.
 */

export type CardKind = 'record' | 'audio' | 'email';

/** Where a label points. */
export type LabelAnchor =
  /** A node in the GLB, optionally nudged in world units. */
  | { kind: 'part'; node: string; offset?: [number, number, number] }
  /** A point in the device screen's own UV space, 0..1 from its top left. */
  | { kind: 'screen'; u: number; v: number };

export type LabelSpec = {
  id: string;
  text: string;
  sub?: string;
  anchor: LabelAnchor;
  /** Which side of the anchor the label box sits on. */
  side: 'left' | 'right';
};

/* ------------------------------------------------------------------ */
/* Intro                                                               */
/* ------------------------------------------------------------------ */

export const INTRO = {
  /** The Orin retracting into the trunk. */
  assembleStart: 0,
  assembleDur: 0.6,
  labelsOutStart: 0.1,
  labelsOutDur: 0.2,
  cameraStart: 0.6,
  cameraDur: 1.4,
  phoneStart: 1.3,
  phoneDur: 0.7,
};

/* ------------------------------------------------------------------ */
/* Exchanges                                                           */
/* ------------------------------------------------------------------ */

/**
 * Offsets from an exchange's own start. Shared by all three so the rhythm is
 * identical and only the contents change.
 *
 * `think` before `typing` is the load-bearing ordering: the box is working
 * before the phone admits anything is happening. Do not close that gap.
 */
export const BEAT = {
  question: 0,
  /** Apple's transcription under a voice note, or the delivery receipt. */
  aside: 0.3,
  think: 0.55,
  typing: 0.95,
  cardUp: 2.0,
  cardDur: 0.45,
  label: 2.45,
  reply: 2.75,
  attribution: 3.05,
  /** Audio snippet bubble, or the email flipping to sent. */
  trailing: 3.4,
  /* The card must be fully down before the exchange ends, or the next
     question arrives while the last artifact is still on screen. */
  cardDown: 5.7,
  cardDownDur: 0.4,
};

export type Exchange = {
  id: string;
  start: number;
  duration: number;
  card: CardKind;
  /** Label naming the artifact, once the card has landed. */
  label: LabelSpec;
  /** Exchange 3 leaves its card up: the demo parks on it. */
  keepCard?: boolean;
};

const screenLabel = (id: string, text: string): LabelSpec => ({
  id,
  text,
  // Anchored to the top left of the card, which sits in the lower two thirds
  // of the screen. Leader line runs up and out to the left.
  anchor: { kind: 'screen', u: 0.18, v: 0.42 },
  side: 'left',
});

export const EXCHANGES: Exchange[] = [
  {
    id: 'glaucoma',
    start: 2.6,
    duration: 6.5,
    card: 'record',
    label: screenLabel('artifact-record', 'gp-summary.pdf'),
  },
  {
    id: 'ballroom',
    start: 9.1,
    duration: 6.5,
    card: 'audio',
    label: screenLabel('artifact-audio', 'maire-1971.m4a'),
  },
  {
    id: 'teachers',
    start: 15.6,
    duration: 7.5,
    card: 'email',
    label: screenLabel('artifact-email', 'gmail · compose'),
    keepCard: true,
  },
];

/** The email card's header flips at this offset, and so does its label. */
export const SENT_AT = BEAT.trailing;
export const SENT_LABEL = 'gmail · sent';

/* ------------------------------------------------------------------ */
/* Ending                                                              */
/* ------------------------------------------------------------------ */

const last = EXCHANGES[EXCHANGES.length - 1];

export const REPLAY_AT = last.start + last.duration + 0.5;
export const END = last.start + last.duration + 1.5;

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

export type CameraPose = {
  /** Direction from the device to the camera. Normalised by the scene. */
  dir: [number, number, number];
  /** Multiplier on the fitted framing distance. */
  dist: number;
  /** Screen-space pan, in radius units. */
  offsetX: number;
  offsetY: number;
};

/** Idle: the device large and centred, nothing else on screen. */
export const HERO_POSE: CameraPose = {
  dir: [-0.16, 0.42, 1.94],
  dist: 0.82,
  offsetX: 0,
  offsetY: -0.06,
};

/** Playing: the device settled at the top right, phone to its left. */
export const RESTING_POSE: CameraPose = {
  dir: [-0.52, 0.7, 1.92],
  dist: 1.59,
  offsetX: 2.3,
  offsetY: -0.5,
};

/* ------------------------------------------------------------------ */
/* Idle labels                                                         */
/* ------------------------------------------------------------------ */

/**
 * The labelled drawing. Five parts, staggered in.
 *
 * There is no speaker mesh — the speaker is the perforated grille on the front
 * face — so its label is anchored to enclosure-front and nudged down to the
 * grille rather than to a part of its own.
 */
export const HERO_LABELS: LabelSpec[] = [
  {
    id: 'leaf',
    text: 'Family Leaf',
    sub: 'microphone, lifts out and travels',
    anchor: { kind: 'part', node: 'leaf' },
    side: 'left',
  },
  {
    id: 'trunk',
    text: 'Family Trunk',
    sub: 'the body',
    anchor: { kind: 'part', node: 'enclosure-front', offset: [-0.5, -0.3, 0] },
    side: 'left',
  },
  {
    id: 'gpu',
    text: 'On-board GPU',
    sub: 'answers are computed here',
    anchor: { kind: 'part', node: 'orin' },
    side: 'right',
  },
  {
    id: 'speaker',
    text: 'Speaker',
    anchor: { kind: 'part', node: 'enclosure-front', offset: [0, -0.42, 0.1] },
    side: 'right',
  },
  {
    id: 'screen',
    text: 'Touchscreen',
    anchor: { kind: 'screen', u: 0.72, v: 0.3 },
    side: 'right',
  },
];

/** Each hero label lands this many seconds after the one before it. */
export const HERO_LABEL_STAGGER = 0.12;
