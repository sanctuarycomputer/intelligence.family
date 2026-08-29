/**
 * The iMessage thread, as data.
 *
 * Each entry names the exchange it belongs to and the beat within that exchange
 * when it appears. demoState.ts reveals entries by reading those tags, so the
 * copy and the timeline cannot drift apart: adding a bubble here schedules it,
 * and no count needs updating anywhere else.
 *
 * The O'Hagans are the synthetic seed family from fam-api/fixtures/seeds.
 */

/** Which beat of its exchange an entry appears on. See timeline.ts BEAT. */
export type Beat = 'question' | 'aside' | 'reply' | 'trailing';

export type ThreadEntry = {
  id: string;
  exchange: string;
  beat: Beat;
} & (
  | { kind: 'voiceNote'; duration: string }
  /** Apple's transcription, right-aligned under a voice note. */
  | { kind: 'transcript'; text: string }
  | { kind: 'out'; text: string }
  /** Small grey line under an outbound message. */
  | { kind: 'receipt'; text: string }
  | { kind: 'reply'; text: string; from: string }
  | { kind: 'audioSnippet'; name: string; duration: string }
);

export const THREAD: ThreadEntry[] = [
  /* --- 1. Asked by voice from a waiting room -------------------------- */
  {
    id: 'q1',
    exchange: 'glaucoma',
    beat: 'question',
    kind: 'voiceNote',
    duration: '0:06',
  },
  {
    id: 'q1-transcript',
    exchange: 'glaucoma',
    beat: 'aside',
    kind: 'transcript',
    text: 'At the doctor. Do we have family history of glaucoma?',
  },
  {
    id: 'a1',
    exchange: 'glaucoma',
    beat: 'reply',
    kind: 'reply',
    text: "Yes. Des has glaucoma in the left eye and he's on drops for it. It came up at his eye review with Mr Deasy.",
    from: 'GP summary, Des O’Hagan',
  },

  /* --- 2. Answered with the grandmother's own voice -------------------- */
  {
    id: 'q2',
    exchange: 'ballroom',
    beat: 'question',
    kind: 'out',
    text: 'Ali is asking how Granny & Grandad met?',
  },
  {
    id: 'a2',
    exchange: 'ballroom',
    beat: 'reply',
    kind: 'reply',
    text: 'At the Crystal Ballroom in Dublin, in 1971. She turned him down twice before she danced with him on the third ask.',
    from: 'Máire at the Crystal Ballroom',
  },
  {
    id: 'a2-audio',
    exchange: 'ballroom',
    beat: 'trailing',
    kind: 'audioSnippet',
    name: 'Máire',
    duration: '0:14',
  },

  /* --- 3. The box acts, rather than recalls ---------------------------- */
  {
    id: 'q3',
    exchange: 'teachers',
    beat: 'question',
    kind: 'out',
    text: "Can you email the kids' teachers and ask when the next parent-teacher meeting is?",
  },
  {
    id: 'q3-receipt',
    exchange: 'teachers',
    beat: 'aside',
    kind: 'receipt',
    text: 'Delivered to the box in your kitchen',
  },
  {
    id: 'a3',
    exchange: 'teachers',
    beat: 'reply',
    kind: 'reply',
    text: "Sent to Ms Boland and Mr Kavanagh. I'll tell you when they write back.",
    from: 'sent from your Gmail',
  },
];
