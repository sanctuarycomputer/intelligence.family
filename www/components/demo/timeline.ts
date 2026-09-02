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

export type CardKind = 'record' | 'audio' | 'email' | 'basket';

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
  /* Narrow, the camera is not getting the device out of the way — it is
     bringing it on. So it starts on the instant and takes about as long as the
     phone's rise, on the same GLIDE curve the rise uses: the two are one
     movement, and the device lands as the conversation opens. */
  compactCameraStart: 0,
  compactCameraDur: 1.6,
  /* The phone starts the instant play is pressed, alongside the camera. Held
     back even slightly, it reads as waiting for the device to get out of the
     way before daring to appear. */
  phoneStart: 0,
  /* Mirrored by the .phone-rise transition in globals.css, which is what
     actually moves it. */
  phoneDur: 1.4,
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

  /* Only the commerce exchange uses these two. They live in BEAT rather than
     in CHECKOUT below because ENTRY_DUE looks every thread entry's beat up in
     this table, and a beat that is not here cannot schedule a bubble.
     Later than the spec's 6.6 and 7.2: the payment sheet is not fully gone
     until CHECKOUT.sheetDown (6.8) + sheetDur (0.45) = 7.25, so a "That's
     paid" reply any earlier would land while the sheet was still sliding off
     the phone — the reply and the sheet's own exit competing for the same
     moment. 7.4 lets the sheet finish first, with 0.15s to spare. */
  settled: 7.4,
  receipt: 8.0,
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
  /**
   * When this exchange's card flips to its finished state, as an offset from
   * the exchange's own start. Absent means the card never flips.
   *
   * On the exchange rather than matched off the card kind, because the last
   * card shown is not necessarily one that flips, and the park branch has to
   * be able to ask rather than assume.
   */
  sentAt?: number;
  /** What the card's label reads once it has flipped. */
  sentLabel?: string;
  /** Runs the CHECKOUT cues on top of the shared beats. */
  checkout?: true;
  /**
   * When this exchange's card drops, as an offset from the exchange's own
   * start. Defaults to BEAT.cardDown.
   *
   * The commerce exchange needs its own: BEAT.cardDown (5.7) lands while the
   * payment sheet is still up (CHECKOUT.sheetDown is 6.8, gone by 7.25) and
   * before the tracking bubble arrives (BEAT.receipt, 8.0). Dropping the
   * basket on the shared cue would slide it away mid-payment. Only the
   * exchange that needs a later exit sets this; everyone else takes the
   * shared one.
   */
  cardDownAt?: number;
};

/**
 * The checkout's own cues, offset from the commerce exchange's start.
 *
 * Separate from BEAT because these describe a sheet on the phone rather than
 * the five steps every exchange shares, and folding them in would put seven
 * numbers into a table three exchanges have no use for.
 */
export const CHECKOUT = {
  /**
   * A tap lands on the checkout link the box just sent.
   *
   * Must clear the link bubble's own arrival, not merely follow it. The bubble
   * is due at BEAT.trailing (3.4) and rides a 380ms `thread-in` entrance, so it
   * has only just stopped moving at 3.78. A tap at 3.4 landed on the same frame
   * the bubble mounted, which is worse than early: the element mounts already
   * carrying `is-tapped`, a CSS transition does not run on an initial computed
   * value, and the press reads backwards — the link appears pre-pressed and
   * then grows. 3.9 gives it a beat of stillness first.
   */
  linkTap: 3.9,
  /**
   * How long a tap ripple is visible — how long the `is-tapped` class is on.
   * Applied by MessageThread from this number; the CSS side (.thread-link and
   * .pay-button) only says how fast the scale gets there, not how long it
   * holds, so there is no duration to mirror.
   */
  tapDur: 0.35,
  sheetUp: 4.4,
  /**
   * Mirrored by the .pay-sheet transition in globals.css. One transition on
   * the base class, so it carries the sheet in both directions — the exit
   * takes this long too, and there is no separate down-duration to keep in
   * step with it.
   */
  sheetDur: 0.45,
  payTap: 5.9,
  paid: 6.3,
  sheetDown: 6.8,
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

/** The email card's header flips at this offset, and so does its label. */
export const SENT_AT = BEAT.trailing;
export const SENT_LABEL = 'gmail · sent';

export const EXCHANGES: Exchange[] = [
  {
    id: 'booklist',
    start: 2.0,
    duration: 10.0,
    card: 'basket',
    label: screenLabel('artifact-basket', 'instacart · basket'),
    checkout: true,
    // See the doc comment on cardDownAt: the shared BEAT.cardDown would pull
    // the basket away while the payment sheet is still on the phone.
    cardDownAt: 8.0,
  },
  {
    id: 'glaucoma',
    start: 12.0,
    duration: 6.5,
    card: 'record',
    label: screenLabel('artifact-record', 'gp-summary.pdf'),
  },
  {
    id: 'ballroom',
    start: 18.5,
    duration: 6.5,
    card: 'audio',
    label: screenLabel('artifact-audio', 'maire-1971.m4a'),
  },
  {
    id: 'teachers',
    start: 25.0,
    duration: 7.5,
    card: 'email',
    label: screenLabel('artifact-email', 'gmail · compose'),
    sentAt: SENT_AT,
    sentLabel: SENT_LABEL,
    // The last exchange now, so this is what the demo parks on: the sent
    // email rather than the basket.
    keepCard: true,
  },
];

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
 * Idle: the device sitting on the right, close and calm.
 *
 * Mutable on purpose. The ?debug=true panel writes to it so the ambient angle
 * can be tuned against the real scene, and its Copy button emits these values
 * to paste back here. Nothing outside that panel writes to it, and the numbers
 * committed below are what ships.
 */
export const HERO_POSE: CameraPose = {
  dir: [-0.29, 0.51, 0.81],
  dist: 1.24,
  offsetX: 0.92,
  offsetY: -0.04,
};

/** The committed values, for the panel's Reset. */
const HERO_POSE_DEFAULTS: CameraPose = {
  ...HERO_POSE,
  dir: [...HERO_POSE.dir],
};

export function setHeroPose(patch: Partial<CameraPose>) {
  Object.assign(HERO_POSE, patch);
}

export function resetHeroPose() {
  setHeroPose({ ...HERO_POSE_DEFAULTS, dir: [...HERO_POSE_DEFAULTS.dir] });
}

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

/**
 * Narrow viewports, before the camera arrives: high, wide and a way back, with
 * the device pushed up out of the top of its box.
 *
 * The device is not on screen on a phone until the demo runs, so it has to get
 * there somehow, and fading it in where it will end up says nothing about what
 * it is. Coming down and around into place does: the angle changes, the shell
 * turns, near edges move further than far ones, and the thing reads as an
 * object in a room rather than a picture of one. All three cues are here on
 * purpose — a pan alone would look like a sprite sliding.
 *
 * The pan is the one number tuned against the box rather than the model.
 * offsetY is negative, which lifts the device in frame; -0.34 radius is enough
 * to clear the top edge on the short 26dvh box without throwing it so far out
 * that the first third of the move is empty screen.
 */
export const COMPACT_START_POSE: CameraPose = {
  /* ~24 degrees of yaw and ~11 of pitch off COMPACT_POSE. Enough to see the
     shell turn; much more and the display swings edge-on and the lock screen
     is a bright sliver for the first half second. */
  dir: [-0.52, 0.67, 0.53],
  dist: 1.05,
  offsetX: 0,
  offsetY: -0.34,
};

/**
 * Narrow viewports: the device centred in its own corner of the screen.
 *
 * No pan at all. Below the breakpoint the scene's canvas is a small box pinned
 * to the top right by CSS, so the corner is a layout question and the camera
 * only has to fill the box it is given. Panning the device across a
 * full-viewport canvas instead would mean hand-tuning offsets against every
 * phone aspect ratio, which is exactly the sort of number that is right on the
 * device it was tuned on and wrong everywhere else.
 *
 * Where the compact camera comes to rest. It starts at COMPACT_START_POSE and
 * arrives here; nothing moves it afterwards.
 */
export const COMPACT_POSE: CameraPose = {
  dir: [-0.29, 0.51, 0.81],
  /* Closer than a plain fit. The framing fits the model's bounding sphere,
     which includes its depth, so a distance of 1 leaves a visible margin all
     round; 0.85 spends most of that on the device without clipping it. */
  dist: 0.85,
  offsetX: 0,
  offsetY: 0,
};
