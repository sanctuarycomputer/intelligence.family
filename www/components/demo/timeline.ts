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

/**
 * The opening. Deliberately unhurried: the device is not doing anything yet, it
 * is getting out of the way, and the whole move should read as a drift rather
 * than a transition. The beats inside each exchange stay quick.
 */
export const INTRO = {
  cameraStart: 0.25,
  cameraDur: 3.4,
  phoneStart: 2.2,
  phoneDur: 1.3,
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
  /** Apple's transcription under a voice note. */
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
  // The card's top right corner, with the label out to its right. The left of
  // the screen is where the phone sits, and a label anchored there lands on
  // the conversation it is supposed to be corroborating.
  anchor: { kind: 'screen', u: 0.76, v: 0.38 },
  side: 'right',
});

export const EXCHANGES: Exchange[] = [
  {
    id: 'glaucoma',
    start: 4.2,
    duration: 6.5,
    card: 'record',
    label: screenLabel('artifact-record', 'gp-summary.pdf'),
  },
  {
    id: 'ballroom',
    start: 10.7,
    duration: 6.5,
    card: 'audio',
    label: screenLabel('artifact-audio', 'maire-1971.m4a'),
  },
  {
    id: 'teachers',
    start: 17.2,
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

/**
 * Idle: the device sitting on the right, close and calm, nothing else on
 * screen. It is a still object, not a diagram — the labels do the explaining.
 */
export const HERO_POSE: CameraPose = {
  dir: [-0.34, 0.46, 1.95],
  dist: 1.24,
  offsetX: 0.92,
  offsetY: -0.04,
};

/**
 * Playing: the device drifted back and further right, making room for the
 * phone. Still close enough that the artifact card reads, which is the whole
 * reason the card exists.
 */
export const RESTING_POSE: CameraPose = {
  dir: [-0.42, 0.58, 1.94],
  dist: 1.37,
  offsetX: 1.5,
  offsetY: -0.16,
};
