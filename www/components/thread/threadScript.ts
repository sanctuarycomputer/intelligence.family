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
export type Beat =
  | 'question'
  | 'aside'
  | 'reply'
  | 'trailing'
  /* The commerce exchange only. Its reply arrives, a link follows, and the
     receipt lands after the sheet has been and gone. */
  | 'settled'
  | 'receipt';

export type ThreadEntry = {
  id: string;
  exchange: string;
  beat: Beat;
} & (
  | { kind: 'voiceNote'; duration: string }
  /** Apple's transcription, right-aligned under a voice note. */
  | { kind: 'transcript'; text: string }
  | { kind: 'out'; text: string }
  /**
   * `source` renders as a citation — from "GP summary" — and is what a recalled
   * answer carries. `action` renders plain, because a receipt for something the
   * box did is not a quotation of anything.
   */
  | {
      kind: 'reply';
      text: string;
      attribution: string;
      attributionKind: 'source' | 'action';
    }
  | { kind: 'audioSnippet'; name: string; duration: string }
  /** A tappable checkout link, the way iMessage renders a rich link preview. */
  | {
      kind: 'checkoutLink';
      merchant: string;
      summary: string;
      total: string;
    }
  | { kind: 'trackingLink'; label: string; detail: string }
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
    attribution: 'GP summary, Des O’Hagan',
    attributionKind: 'source',
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
    attribution: 'Máire at the Crystal Ballroom',
    attributionKind: 'source',
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
    id: 'a3',
    exchange: 'teachers',
    beat: 'reply',
    kind: 'reply',
    text: "Sent to Ms Boland and Mr Kavanagh. I'll tell you when they write back.",
    attribution: 'Sent from your Gmail',
    attributionKind: 'action',
  },

  /* --- 4. The box spends, once it is told to -------------------------- */
  {
    id: 'q4',
    exchange: 'booklist',
    beat: 'question',
    kind: 'out',
    text: "Have we ordered everything for the kids' school?",
  },
  {
    id: 'a4',
    exchange: 'booklist',
    beat: 'reply',
    kind: 'reply',
    text: "Not yet. I've put Ali's and Tom's lists into one basket. Here's a checkout link.",
    attribution: 'St Brigid’s supply list',
    attributionKind: 'source',
  },
  {
    id: 'a4-link',
    exchange: 'booklist',
    beat: 'trailing',
    kind: 'checkoutLink',
    merchant: 'Instacart',
    summary: '6 items · Back to school',
    total: '$87.40',
  },
  {
    id: 'a4-paid',
    exchange: 'booklist',
    beat: 'settled',
    kind: 'reply',
    text: "That's paid. It arrives tomorrow before 6pm.",
    attribution: 'Paid with Apple Pay',
    attributionKind: 'action',
  },
  {
    id: 'a4-tracking',
    exchange: 'booklist',
    beat: 'receipt',
    kind: 'trackingLink',
    label: 'Track your order',
    detail: 'Instacart · #IC-4471028',
  },
];

/**
 * Each reply's position among the replies, by entry id.
 *
 * The demo reveals attributions as a running count, so a reply needs to know
 * which number it is. Computed once here rather than by a counter mutated
 * during render, which is impure and makes the list order load-bearing in a
 * way React does not guarantee.
 */
export const REPLY_ORDINAL: ReadonlyMap<string, number> = new Map(
  THREAD.filter(e => e.kind === 'reply').map((e, i) => [e.id, i])
);
