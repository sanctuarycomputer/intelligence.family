# Agentic Commerce Slide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth exchange to the homepage demo in which the device assembles a back-to-school basket and the family pays for it from the phone with Apple Pay, and make the demo a reusable block so the same device, phone and clock run inside a new investor-deck slide.

**Architecture:** The demo is already one pure function of time (`demoState.stateAt`) driving a module clock (`demoClock`). Nothing here changes that. Three refactors make room (per-reply attribution, exchange-owned card flips, a positioning stage), then the fourth exchange is added as data, then a new deck slide hosts the extracted block.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind v4, three.js (WebGL scene), Canvas 2D (device screen), Vitest.

**Spec:** `docs/superpowers/specs/2026-08-31-device-commerce-slide-design.md`

## Global Constraints

- **Run every command from `www/`.** The repo root has no `package.json`.
- **Tests:** `npm test` (vitest). Single file: `npx vitest run tests/demo-state.test.ts`.
- **Lint and format before every commit:** `npm run lint && npm run format:check`. If format:check fails, run `npm run format`.
- **Deck copy contains no em dashes.** `tests/opportunity-copy.test.ts` asserts this over every file in `app/opportunity/content/`. Use a comma, a colon, or a full stop.
- **Deck copy uses HTML entities for apostrophes and ampersands** in JSX text: `&rsquo;` and `&amp;`. Follow the surrounding file.
- **Never add positive `letter-spacing`** in any style in this codebase.
- **Every act file body needs at least one `<strong>` lead fragment.** Asserted by `tests/opportunity-copy.test.ts`.
- **The family is the O'Hagans, Irish-American.** Grandparents met in Dublin in 1971. Children Ali (5th grade) and Tom (2nd grade) at St Brigid's School. Prices in US dollars.
- **Do not use `git stash`.** This is a worktree sharing a stash stack with other sessions. Use a WIP commit if you must set work aside.
- **Comments explain why, not what.** Match the density and voice of the file you are editing. These files are heavily commented with reasoning; a bare implementation with no rationale will be rejected at review.

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `components/demo/DeviceDemo.tsx` | The reusable stage: scene, labels, orbit surface, phone |
| `components/thread/PaymentSheet.tsx` | The Apple Pay sheet that slides up over the thread |
| `app/opportunity/components/DeckDemo.tsx` | Deck-side host: mounts `DeviceDemo`, resets it when the slide leaves the viewport |

**Modified:**

| File | Change |
|---|---|
| `components/demo/timeline.ts` | `CHECKOUT` table, two new `BEAT` entries, the `booklist` exchange, `sentAt`/`sentLabel` on `Exchange` |
| `components/demo/demoState.ts` | Per-reply attribution, exchange-owned flips, sheet and tap state |
| `components/thread/threadScript.ts` | Two new `Beat` names, two new entry kinds, five new entries |
| `components/thread/bubbles.tsx` | `CheckoutLink` and `TrackingLink` bubbles |
| `components/MessageThread.tsx` | Renders the two new kinds and the payment sheet |
| `components/device/screenCards.ts` | `basket` card kind and `drawBasket` |
| `app/page.tsx` | Renders `DeviceDemo` instead of four loose children |
| `app/globals.css` | `.demo-stage`, `fixed` becomes `absolute`, `--demo-phone-left` |
| `app/opportunity/content/act2.tsx` | The new slide, page numbers |
| `app/opportunity/content/{act1,act3,act4,appendix}.tsx`, `content/index.ts` | `TOTAL`, page numbers, `PAGE_META` |
| `app/opportunity/opportunity.css` | Slide layout for the demo cell |
| `tests/demo-state.test.ts` | Updated and extended |
| `tests/opportunity-copy.test.ts` | 26 pages, nine act 2 titles and subtitles |

---

### Task 1: Attribution becomes a per-reply fact

`stateAt` increments `attributed` once per **exchange**. Exchange four will have two replies, so the second would never get its attribution line. Rewrite the derivation without changing any existing behaviour.

**Files:**
- Modify: `components/demo/demoState.ts`
- Test: `tests/demo-state.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `attributed: number` keeps its meaning (how many replies have had their attribution line arrive, always a prefix of the replies on screen). `ATTRIBUTION_LAG: number` exported from `demoState.ts`, equal to `BEAT.attribution - BEAT.reply`.

- [ ] **Step 1: Write the characterisation test that pins today's behaviour**

Add to `tests/demo-state.test.ts`, inside the existing `describe('stateAt')`:

```ts
  /* Attribution is about to stop being an exchange-level fact and become a
     per-reply one, because the commerce exchange has two replies. These are
     the exact seconds it fires on today. They must survive that rewrite
     untouched: if this test needs editing to pass, the rewrite is wrong. */
  it('attributes each reply 0.3s after it lands', () => {
    const lag = BEAT.attribution - BEAT.reply;
    expect(lag).toBeCloseTo(0.3, 10);

    for (const [i, ex] of EXCHANGES.entries()) {
      const due = ex.start + BEAT.reply + lag;
      expect(stateAt(due - EPS).attributed, ex.id).toBe(i);
      expect(stateAt(due).attributed, ex.id).toBe(i + 1);
    }
  });
```

- [ ] **Step 2: Run it to be sure it passes against the current code**

Run: `npx vitest run tests/demo-state.test.ts -t "attributes each reply"`
Expected: PASS. This test describes what the code already does. If it fails, stop and report — the premise of this task is wrong.

- [ ] **Step 3: Commit the characterisation test on its own**

```bash
git add tests/demo-state.test.ts
git commit -m "test: pin attribution timing before generalising it"
```

- [ ] **Step 4: Rewrite the derivation**

In `components/demo/demoState.ts`, just below the existing `ENTRY_DUE` block, add:

```ts
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
const ATTRIBUTION_DUE: number[] = THREAD.map((entry, i) =>
  entry.kind === 'reply' ? ENTRY_DUE[i] + ATTRIBUTION_LAG : Infinity
).filter(due => due !== Infinity);
```

Inside `stateAt`, delete the `if (now >= at(BEAT.attribution)) attributed += 1;` line from the exchange loop and remove `attributed` from that loop's `let` declarations. Replace it with a count derived the same way `visibleMessages` is, placed immediately after the `visibleMessages` while-loop:

```ts
  // Same shape as visibleMessages, and for the same reason: attributions are
  // ordered, so "how many have arrived" is just how many are due.
  let attributed = 0;
  while (
    attributed < ATTRIBUTION_DUE.length &&
    now >= ATTRIBUTION_DUE[attributed]
  ) {
    attributed += 1;
  }
```

- [ ] **Step 5: Run the whole demo suite**

Run: `npx vitest run tests/demo-state.test.ts`
Expected: PASS, all tests, with no edits to any of them.

- [ ] **Step 6: Lint, format, commit**

```bash
npm run lint && npm run format:check
git add components/demo/demoState.ts
git commit -m "refactor: attribute replies individually rather than per exchange"
```

---

### Task 2: The card flip belongs to the exchange, not to the word "email"

Two places hard-code that the email card is the only one that flips and the last one shown. The basket card is about to be last and never flips.

**Files:**
- Modify: `components/demo/timeline.ts`, `components/demo/demoState.ts`
- Test: `tests/demo-state.test.ts`

**Interfaces:**
- Consumes: Task 1's `demoState.ts`.
- Produces: `Exchange` gains `sentAt?: number` (offset from the exchange's own start) and `sentLabel?: string`. `SENT_AT` and `SENT_LABEL` remain exported from `timeline.ts` so existing tests keep compiling.

- [ ] **Step 1: Write the failing test**

Add to `tests/demo-state.test.ts`:

```ts
  /* The flip is a property of the exchange that does it, not of a card kind
     matched by name. The commerce card is about to be the last one up and it
     never flips, so an unconditional `cardSent = true` in the park branch
     would light a "sent" label on a basket. */
  it('only flips a card whose exchange says when', () => {
    for (const ex of EXCHANGES) {
      const settled = stateAt(ex.start + BEAT.label + EPS);
      if (ex.sentAt === undefined) {
        expect(settled.cardSent, ex.id).toBe(false);
        expect(stateAt(ex.start + ex.duration - EPS).cardSent, ex.id).toBe(
          false
        );
      } else {
        expect(stateAt(ex.start + ex.sentAt - EPS).cardSent, ex.id).toBe(false);
        expect(stateAt(ex.start + ex.sentAt).cardSent, ex.id).toBe(true);
      }
    }
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/demo-state.test.ts -t "only flips a card"`
Expected: FAIL — `Property 'sentAt' does not exist on type 'Exchange'`.

- [ ] **Step 3: Put the flip on the exchange**

In `components/demo/timeline.ts`, extend the `Exchange` type:

```ts
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
};
```

Give the `teachers` entry `sentAt: SENT_AT` and `sentLabel: SENT_LABEL`. Both constants are declared below `EXCHANGES` today, so move their two declarations **above** the `EXCHANGES` array — a `const` is not hoisted and the array is evaluated at module load. Leave the exports themselves in place:

```ts
/** The email card's header flips at this offset, and so does its label. */
export const SENT_AT = BEAT.trailing;
export const SENT_LABEL = 'gmail · sent';

export const EXCHANGES: Exchange[] = [
  /* … glaucoma, ballroom unchanged … */
  {
    id: 'teachers',
    start: 15.0,
    duration: 7.5,
    card: 'email',
    label: screenLabel('artifact-email', 'gmail · compose'),
    keepCard: true,
    sentAt: SENT_AT,
    sentLabel: SENT_LABEL,
  },
];
```

- [ ] **Step 4: Read the flip from the exchange**

In `components/demo/demoState.ts`, inside the exchange loop, replace

```ts
      cardSent = ex.card === 'email' && now >= at(SENT_AT);
```

with

```ts
      cardSent = ex.sentAt !== undefined && now >= at(ex.sentAt);
```

and replace the label push

```ts
      labels.push(cardSent ? { ...ex.label, text: SENT_LABEL } : ex.label);
```

with

```ts
      labels.push(
        cardSent && ex.sentLabel
          ? { ...ex.label, text: ex.sentLabel }
          : ex.label
      );
```

Then fix the park branch at the bottom of the function:

```ts
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
```

Remove the now-unused `SENT_AT` and `SENT_LABEL` imports from `demoState.ts`.

- [ ] **Step 5: Run the whole demo suite**

Run: `npx vitest run tests/demo-state.test.ts`
Expected: PASS, all tests including the two that name the email explicitly.

- [ ] **Step 6: Lint, format, commit**

```bash
npm run lint && npm run format:check
git add components/demo/timeline.ts components/demo/demoState.ts tests/demo-state.test.ts
git commit -m "refactor: let each exchange declare when its card flips"
```

---

### Task 3: The basket card

**Files:**
- Modify: `components/demo/timeline.ts` (the `CardKind` union), `components/device/screenCards.ts`
- Test: none. This is Canvas 2D drawing with no return value; it is verified by eye in Task 8's manual pass. Do not write a test that asserts `fillText` call counts — it would pin the drawing, not the behaviour.

**Interfaces:**
- Consumes: Task 2's `timeline.ts`.
- Produces: `CardKind` gains `'basket'`. `drawCard` renders it.

- [ ] **Step 1: Widen the union**

In `components/demo/timeline.ts`:

```ts
export type CardKind = 'record' | 'audio' | 'email' | 'basket';
```

- [ ] **Step 2: Draw the basket**

In `components/device/screenCards.ts`, add above `drawCard`:

```ts
/**
 * The basket the box assembled, priced and ready to pay for.
 *
 * Six items is a constraint, not a preference: the card box is 1088x480 in
 * screen space and the header eats the first 124px of it, so six rows plus the
 * total rule is 326px of the 356px left. A seventh line would draw past the
 * bottom edge.
 */
const BASKET: Array<[string, string]> = [
  ['Composition books x 8', '$12.00'],
  ['Highlighters x 2', '$8.50'],
  ['Reading log', '$6.90'],
  ['Pencil case x 2', '$14.00'],
  ['Lunchbox x 2', '$16.00'],
  ['Sneakers, Tom', '$30.00'],
];

const BASKET_TOTAL = '$87.40';

function drawBasket(ctx: CanvasRenderingContext2D, b: Box) {
  let y = header(ctx, b, 'Basket', 'Instacart');
  const left = b.x + 44;
  const right = b.x + b.w - 44;
  const max = b.w - 88 - 140;

  for (const [item, price] of BASKET) {
    ctx.font = "400 30px 'Roobert', sans-serif";
    ctx.fillStyle = 'rgba(26, 26, 26, 0.78)';
    ctx.fillText(fit(ctx, item, max), left, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = INK;
    ctx.fillText(price, right, y);
    ctx.textAlign = 'left';

    y += 44;
  }

  y += 16;
  ctx.strokeStyle = CARD_EDGE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.stroke();

  y += 40;
  ctx.font = "500 30px 'Roobert', sans-serif";
  ctx.fillStyle = MUTED;
  ctx.fillText(`${BASKET.length} items`, left, y);

  ctx.textAlign = 'right';
  ctx.font = "600 34px 'Roobert', sans-serif";
  ctx.fillStyle = SAGE;
  ctx.fillText(BASKET_TOTAL, right, y);
  ctx.textAlign = 'left';
}
```

- [ ] **Step 3: Dispatch to it**

At the bottom of `drawCard`, replace the three-way chain with an exhaustive one:

```ts
  if (card.kind === 'record') drawRecord(ctx, b);
  else if (card.kind === 'audio') drawAudio(ctx, b, card.time);
  else if (card.kind === 'email') drawEmail(ctx, b, card.sent);
  else drawBasket(ctx, b);
```

- [ ] **Step 4: Verify it compiles and nothing regressed**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors, 172+ tests passing.

- [ ] **Step 5: Lint, format, commit**

```bash
npm run lint && npm run format:check
git add components/demo/timeline.ts components/device/screenCards.ts
git commit -m "feat: a basket card for the device screen"
```

---

### Task 4: The fourth exchange, as timing

The sheet's own cues, the exchange itself, and the state the phone will read. No thread copy yet, no components yet — this task is the clock.

**Files:**
- Modify: `components/demo/timeline.ts`, `components/demo/demoState.ts`
- Test: `tests/demo-state.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces:
  - `CHECKOUT` exported from `timeline.ts`: `{ linkTap, tapDur, sheetUp, sheetDur, payTap, paid, sheetDown, sheetDownDur }`, all numbers.
  - `BEAT` gains `settled: 6.6` and `receipt: 7.2`.
  - `DemoState` gains `sheetUp: boolean`, `sheetPaid: boolean`, `tap: 'checkout' | 'pay' | null`.
  - `EXCHANGES` gains `{ id: 'booklist', start: 22.5, duration: 10.0, card: 'basket', keepCard: true, checkout: true }`; `teachers` loses `keepCard`.

- [ ] **Step 1: Write the failing tests**

Add to `tests/demo-state.test.ts`. Import `CHECKOUT` alongside the existing timeline imports.

```ts
describe('the commerce exchange', () => {
  const ex = () => EXCHANGES.find(e => e.id === 'booklist')!;
  const at = (offset: number) => ex().start + offset;

  it('is the last exchange, and the one the demo parks on', () => {
    expect(EXCHANGES[EXCHANGES.length - 1].id).toBe('booklist');
    expect(ex().keepCard).toBe(true);
    expect(EXCHANGES.find(e => e.id === 'teachers')!.keepCard).toBeUndefined();
  });

  it('parks on the basket, unflipped', () => {
    const parked = stateAt(END);
    expect(parked.card).toBe('basket');
    expect(parked.cardSent).toBe(false);
    expect(parked.cardY).toBe(1);
    expect(parked.sheetUp).toBe(false);
  });

  it('raises the sheet only between its cues', () => {
    expect(stateAt(at(CHECKOUT.sheetUp) - EPS).sheetUp).toBe(false);
    expect(stateAt(at(CHECKOUT.sheetUp)).sheetUp).toBe(true);
    expect(stateAt(at(CHECKOUT.sheetDown) - EPS).sheetUp).toBe(true);
    expect(stateAt(at(CHECKOUT.sheetDown)).sheetUp).toBe(false);
  });

  it('pays partway through, and stays paid while the sheet leaves', () => {
    expect(stateAt(at(CHECKOUT.paid) - EPS).sheetPaid).toBe(false);
    expect(stateAt(at(CHECKOUT.paid)).sheetPaid).toBe(true);
    // Still paid as it slides away: flipping back mid-exit reads as a refund.
    expect(stateAt(at(CHECKOUT.sheetDown) + EPS).sheetPaid).toBe(true);
  });

  /* The taps are the only thing standing in for a finger. Each is a brief
     window, and they never overlap: two ripples at once reads as a glitch. */
  it('ripples once on the link and once on the pay button', () => {
    expect(stateAt(at(CHECKOUT.linkTap) - EPS).tap).toBe(null);
    expect(stateAt(at(CHECKOUT.linkTap)).tap).toBe('checkout');
    expect(stateAt(at(CHECKOUT.linkTap) + CHECKOUT.tapDur).tap).toBe(null);
    expect(stateAt(at(CHECKOUT.payTap)).tap).toBe('pay');
    expect(stateAt(at(CHECKOUT.payTap) + CHECKOUT.tapDur).tap).toBe(null);
  });

  it('taps the link before the sheet arrives, and pays before it leaves', () => {
    expect(CHECKOUT.linkTap).toBeLessThan(CHECKOUT.sheetUp);
    expect(CHECKOUT.sheetUp + CHECKOUT.sheetDur).toBeLessThan(CHECKOUT.payTap);
    expect(CHECKOUT.payTap).toBeLessThan(CHECKOUT.paid);
    expect(CHECKOUT.paid).toBeLessThan(CHECKOUT.sheetDown);
    expect(CHECKOUT.sheetDown + CHECKOUT.sheetDownDur).toBeLessThan(
      ex().duration
    );
  });

  it('never raises the sheet during any other exchange', () => {
    for (let t = 0; t < ex().start; t += 0.02) {
      expect(stateAt(t).sheetUp, `t=${t.toFixed(2)}`).toBe(false);
      expect(stateAt(t).tap, `t=${t.toFixed(2)}`).toBe(null);
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/demo-state.test.ts -t "commerce exchange"`
Expected: FAIL — `CHECKOUT` is not exported.

- [ ] **Step 3: Add the beats**

In `components/demo/timeline.ts`, add to `BEAT`, after `trailing`:

```ts
  /* Only the commerce exchange uses these two. They live in BEAT rather than
     in CHECKOUT below because ENTRY_DUE looks every thread entry's beat up in
     this table, and a beat that is not here cannot schedule a bubble. */
  settled: 6.6,
  receipt: 7.2,
```

Then, after the `Exchange` type, add:

```ts
/**
 * The checkout's own cues, offset from the commerce exchange's start.
 *
 * Separate from BEAT because these describe a sheet on the phone rather than
 * the five steps every exchange shares, and folding them in would put seven
 * numbers into a table three exchanges have no use for.
 */
export const CHECKOUT = {
  /** A tap lands on the checkout link the box just sent. */
  linkTap: 3.4,
  /** How long a tap ripple is visible. Mirrored by .tap-ripple in globals.css. */
  tapDur: 0.35,
  sheetUp: 3.9,
  /** Mirrored by the .pay-sheet transition in globals.css. */
  sheetDur: 0.45,
  payTap: 5.4,
  paid: 5.8,
  sheetDown: 6.3,
  sheetDownDur: 0.4,
};
```

Add `checkout?: true` to the `Exchange` type, documented as "Runs the CHECKOUT cues on top of the shared beats."

Append the exchange to `EXCHANGES` and drop `keepCard` from `teachers`:

```ts
  {
    id: 'booklist',
    start: 22.5,
    duration: 10.0,
    card: 'basket',
    label: screenLabel('artifact-basket', 'instacart · basket'),
    keepCard: true,
    checkout: true,
  },
```

- [ ] **Step 4: Derive the new state**

In `components/demo/demoState.ts`, add to the `DemoState` type, in the discrete block:

```ts
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
```

Add `sheetUp: false, sheetPaid: false, tap: null` to `idleState`'s return.

In `stateAt`, declare `let sheetUp = false; let sheetPaid = false; let tap: DemoState['tap'] = null;` beside the other loop-local declarations, and inside the exchange loop, after the label push, add:

```ts
    if (ex.checkout) {
      sheetUp =
        now >= at(CHECKOUT.sheetUp) && now < at(CHECKOUT.sheetDown);
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
```

Return all three, and add them to `discreteKey`:

```ts
    s.sheetUp ? 1 : 0,
    s.sheetPaid ? 1 : 0,
    s.tap ?? '-',
```

Import `CHECKOUT` from `./timeline`.

- [ ] **Step 5: Fix the two existing tests the new exchange invalidates**

In `tests/demo-state.test.ts`:

- `'shows the whole thread by the end and nothing at the start'` asserts `stateAt(END).attributed` is `EXCHANGES.length`. There are now more replies than exchanges. Change that line to:

```ts
    expect(stateAt(END).attributed).toBe(
      THREAD.filter(e => e.kind === 'reply').length
    );
```

- `'parks on the sent email'` is superseded by `'parks on the basket, unflipped'`. Delete it, and delete `SENT_LABEL` from the imports if nothing else uses it. Keep `'renames the email label when it sends'` — the email still flips, it just no longer stays up.

- [ ] **Step 6: Run the whole suite**

Run: `npm test`
Expected: PASS. Note the demo now ends at 34.0s: assert it once, in the commerce describe block, so the number is written down somewhere.

```ts
  it('runs 34 seconds', () => {
    expect(END).toBeCloseTo(34, 10);
  });
```

- [ ] **Step 7: Lint, format, commit**

```bash
npm run lint && npm run format:check
git add components/demo/timeline.ts components/demo/demoState.ts tests/demo-state.test.ts
git commit -m "feat: time the commerce exchange and its payment sheet"
```

---

### Task 5: The thread copy, and two new bubbles

**Files:**
- Modify: `components/thread/threadScript.ts`, `components/thread/bubbles.tsx`, `components/MessageThread.tsx`
- Test: `tests/demo-state.test.ts`

**Interfaces:**
- Consumes: Task 4's `BEAT.settled` and `BEAT.receipt`.
- Produces:
  - `Beat` gains `'settled' | 'receipt'`.
  - `ThreadEntry` gains `{ kind: 'checkoutLink'; merchant: string; summary: string; total: string }` and `{ kind: 'trackingLink'; label: string; detail: string }`.
  - `bubbles.tsx` exports `CheckoutLink({ merchant, summary, total, tapped }: { …; tapped: boolean })` and `TrackingLink({ label, detail })`.

- [ ] **Step 1: Write the failing test**

Add to `tests/demo-state.test.ts`, inside `describe('the commerce exchange')`:

```ts
  it('sends a checkout link, then a receipt, in that order', () => {
    const ids = THREAD.filter(e => e.exchange === 'booklist').map(e => e.id);
    expect(ids).toEqual(['q4', 'a4', 'a4-link', 'a4-paid', 'a4-tracking']);

    const kinds = THREAD.filter(e => e.exchange === 'booklist').map(
      e => e.kind
    );
    expect(kinds).toEqual([
      'out',
      'reply',
      'checkoutLink',
      'reply',
      'trackingLink',
    ]);
  });

  /* The link has to be on screen before a tap lands on it, and the receipt
     must not arrive until the sheet has gone. */
  it('sequences the bubbles around the sheet', () => {
    const due = (id: string) => {
      const i = THREAD.findIndex(e => e.id === id);
      return EXCHANGES.find(e => e.id === 'booklist')!.start + BEAT[THREAD[i].beat];
    };
    expect(due('a4-link')).toBeLessThanOrEqual(at(CHECKOUT.linkTap));
    expect(due('a4-paid')).toBeGreaterThan(
      at(CHECKOUT.sheetDown + CHECKOUT.sheetDownDur) - 0.2
    );
    expect(due('a4-tracking')).toBeGreaterThan(due('a4-paid'));
  });

  it('cites the supply list, then reports the payment as an action', () => {
    const first = THREAD.find(e => e.id === 'a4')!;
    const second = THREAD.find(e => e.id === 'a4-paid')!;
    expect(first.kind === 'reply' && first.attributionKind).toBe('source');
    expect(second.kind === 'reply' && second.attributionKind).toBe('action');
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/demo-state.test.ts -t "commerce exchange"`
Expected: FAIL — the entries do not exist.

- [ ] **Step 3: Write the copy**

In `components/thread/threadScript.ts`, widen the two types:

```ts
export type Beat =
  | 'question'
  | 'aside'
  | 'reply'
  | 'trailing'
  /* The commerce exchange only. Its reply arrives, a link follows, and the
     receipt lands after the sheet has been and gone. */
  | 'settled'
  | 'receipt';
```

```ts
  /** A tappable checkout link, the way iMessage renders a rich link preview. */
  | {
      kind: 'checkoutLink';
      merchant: string;
      summary: string;
      total: string;
    }
  | { kind: 'trackingLink'; label: string; detail: string }
```

Append to `THREAD`:

```ts
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
```

- [ ] **Step 4: Draw the two bubbles**

In `components/thread/bubbles.tsx`, append:

```ts
/**
 * The checkout link, drawn the way iMessage draws a rich link preview: a card
 * rather than a line of blue text.
 *
 * `tapped` is the demo's stand-in for a finger. Nothing here is clickable, so
 * the press has to be visible or the sheet appears to open by itself.
 */
export function CheckoutLink({
  merchant,
  summary,
  total,
  tapped,
}: {
  merchant: string;
  summary: string;
  total: string;
  tapped: boolean;
}) {
  return (
    <Entry>
      <div
        className={`mr-auto w-[86%] overflow-hidden rounded-[15px]${tapped ? ' is-tapped' : ''} thread-link`}
        style={{ background: IN }}
      >
        <div className="flex items-center justify-between px-[13px] pb-[9px] pt-[10px]">
          <span className="flex flex-col gap-[2px]">
            <span className="text-[13px] font-medium leading-none text-black">
              {merchant}
            </span>
            <span className="text-[11px] leading-none text-black/45">
              {summary}
            </span>
          </span>
          <span className="text-[15px] font-medium tabular-nums text-black">
            {total}
          </span>
        </div>
        <div
          className="px-[13px] py-[7px] text-center text-[12.5px] font-medium"
          style={{ background: 'rgba(0,0,0,0.05)', color: OUT }}
        >
          Check out
        </div>
      </div>
    </Entry>
  );
}

/** The receipt's tail: where the order can be followed. */
export function TrackingLink({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  return (
    <Entry>
      <div
        className="mr-auto flex max-w-[86%] flex-col gap-[2px] rounded-[15px] px-[13px] py-[9px]"
        style={{ background: IN }}
      >
        <span className="text-[13px] font-medium leading-none" style={{ color: OUT }}>
          {label}
        </span>
        <span className="text-[11px] leading-none text-black/45">{detail}</span>
      </div>
    </Entry>
  );
}
```

- [ ] **Step 5: Render them**

In `components/MessageThread.tsx`, import `CheckoutLink` and `TrackingLink`, add `tap` to the state read from `subscribe` (a `useState<'checkout' | 'pay' | null>(null)` beside `typing`), and add two cases to the switch:

```tsx
                  case 'checkoutLink':
                    return (
                      <CheckoutLink
                        key={entry.id}
                        merchant={entry.merchant}
                        summary={entry.summary}
                        total={entry.total}
                        tapped={tap === 'checkout'}
                      />
                    );
                  case 'trackingLink':
                    return (
                      <TrackingLink
                        key={entry.id}
                        label={entry.label}
                        detail={entry.detail}
                      />
                    );
```

- [ ] **Step 6: Add the tap style**

In `app/globals.css`, under the thread section:

```css
/* The demo's stand-in for a finger. Duration mirrors CHECKOUT.tapDur in
   components/demo/timeline.ts, which is what actually decides how long the
   class is on. */
.thread-link {
  transition: transform 140ms cubic-bezier(0.4, 0, 0.2, 1);
}

.thread-link.is-tapped {
  transform: scale(0.97);
}
```

- [ ] **Step 7: Run everything**

Run: `npx tsc --noEmit && npm test`
Expected: PASS.

- [ ] **Step 8: Lint, format, commit**

```bash
npm run lint && npm run format:check
git add components/thread/threadScript.ts components/thread/bubbles.tsx components/MessageThread.tsx app/globals.css tests/demo-state.test.ts
git commit -m "feat: checkout and tracking bubbles for the commerce exchange"
```

---

### Task 6: The payment sheet

**Files:**
- Create: `components/thread/PaymentSheet.tsx`
- Modify: `components/MessageThread.tsx`, `app/globals.css`
- Test: none. This is presentation driven entirely by state Task 4 already tests; a render test would assert markup, not behaviour. Verified by eye in Task 8.

**Interfaces:**
- Consumes: `DemoState.sheetUp`, `DemoState.sheetPaid`, `DemoState.tap` from Task 4.
- Produces: `PaymentSheet({ up, paid, tapped }: { up: boolean; paid: boolean; tapped: boolean })`, default export.

- [ ] **Step 1: Write the component**

Create `components/thread/PaymentSheet.tsx`:

```tsx
/**
 * The Apple Pay sheet, sliding up over the thread.
 *
 * Positioned inside the phone frame rather than over the whole dock, because
 * on iOS the sheet is a card the app presents, not a system overlay: it stops
 * short of the status bar and leaves the thread dimmed behind it.
 *
 * Stateless on purpose. `up` and `paid` come from the demo clock, and the
 * slide is a CSS transition off `up` so it eases out on replay the way the
 * phone itself does.
 */

import { OUT } from './bubbles';

const ITEMS: Array<[string, string]> = [
  ['Composition books x 8', '$12.00'],
  ['Highlighters x 2', '$8.50'],
  ['Reading log', '$6.90'],
  ['Pencil case x 2', '$14.00'],
  ['Lunchbox x 2', '$16.00'],
  ['Sneakers, Tom', '$30.00'],
];

function AppleMark() {
  return (
    <svg width="13" height="16" viewBox="0 0 13 16" fill="none" aria-hidden="true">
      <path
        d="M10.6 8.5c0-1.8 1.4-2.6 1.5-2.7-.8-1.2-2.1-1.4-2.6-1.4-1.1-.1-2.1.6-2.7.6-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.8 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1 0 1.3.6 2.3.5 1 0 1.6-.8 2.2-1.7.7-1 .9-1.9 1-2-.1 0-1.9-.7-1.9-2.7ZM8.9 3.2c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.7 2.2.8 0 1.6-.4 2.1-1.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" aria-hidden="true">
      <path
        d="M1.5 6.8 5.6 11 14.5 1.8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PaymentSheet({
  up,
  paid,
  tapped,
}: {
  up: boolean;
  paid: boolean;
  tapped: boolean;
}) {
  return (
    <>
      {/* The thread dims behind the sheet, as it does behind any iOS sheet. */}
      <div
        className={`pay-scrim${up ? ' is-up' : ''}`}
        aria-hidden="true"
      />
      <div
        className={`pay-sheet${up ? ' is-up' : ''}`}
        role="group"
        aria-label="Apple Pay"
        aria-hidden={up ? undefined : true}
      >
        <span className="mx-auto mt-[8px] block h-[5px] w-[36px] rounded-full bg-black/20" />

        <div className="flex items-center justify-between px-[18px] pb-[10px] pt-[14px]">
          <span className="text-[15px] font-semibold text-black">Instacart</span>
          <span className="text-[11.5px] text-black/45">6 items · Back to school</span>
        </div>

        <div className="border-t border-black/[0.08] px-[18px] pt-[8px]">
          {ITEMS.map(([item, price]) => (
            <div key={item} className="flex items-center justify-between py-[4px]">
              <span className="text-[12.5px] text-black/70">{item}</span>
              <span className="text-[12.5px] tabular-nums text-black">{price}</span>
            </div>
          ))}
        </div>

        <div className="mt-[6px] flex items-center justify-between border-t border-black/[0.08] px-[18px] py-[10px]">
          <span className="text-[13px] font-medium text-black/55">Total</span>
          <span className="text-[17px] font-semibold tabular-nums text-black">
            $87.40
          </span>
        </div>

        <div className="px-[18px] pb-[16px]">
          <div
            className={`pay-button${tapped ? ' is-tapped' : ''}`}
            style={{ background: paid ? OUT : 'var(--fi-black-900)' }}
          >
            {paid ? (
              <CheckMark />
            ) : (
              <>
                <AppleMark />
                <span className="text-[15px] font-medium leading-none">Pay</span>
              </>
            )}
          </div>
          <p className="pt-[8px] text-center text-[10.5px] leading-none text-black/35">
            Double-click to pay
          </p>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Style it**

In `app/globals.css`, after the thread section:

```css
/* ---- the payment sheet ---- */

/* Sits inside the phone's screen, not over the whole dock: an iOS sheet is a
   card the app presents, so it stops short of the status bar. */
.pay-scrim {
  position: absolute;
  inset: 0;
  z-index: 25;
  background: rgba(0, 0, 0, 0.28);
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.pay-scrim.is-up {
  opacity: 1;
}

/* Driven by a class rather than a per-frame transform, so it eases back down
   as well as up. Duration mirrors CHECKOUT.sheetDur in
   components/demo/timeline.ts. */
.pay-sheet {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 26;
  border-radius: 22px 22px 46px 46px;
  background: #f7f7f8;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.18);
  transform: translate3d(0, 100%, 0);
  transition: transform 450ms cubic-bezier(0.32, 0.72, 0, 1);
}

.pay-sheet.is-up {
  transform: none;
}

.pay-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border-radius: 22px;
  color: #fff;
  transition:
    transform 140ms cubic-bezier(0.4, 0, 0.2, 1),
    background 220ms cubic-bezier(0.4, 0, 0.2, 1);
}

.pay-button.is-tapped {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .pay-scrim,
  .pay-sheet,
  .pay-button,
  .thread-link {
    transition: none;
  }
}
```

- [ ] **Step 3: Mount it**

In `components/MessageThread.tsx`, add `sheetUp` and `sheetPaid` to the subscribed state, and render the sheet as the last child of the inner screen div (the one with `borderRadius: '46px'`), after the input bar:

```tsx
            <PaymentSheet
              up={sheetUp}
              paid={sheetPaid}
              tapped={tap === 'pay'}
            />
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm test`
Expected: PASS.

- [ ] **Step 5: Look at it**

Run: `npm run dev`, open `http://localhost:3000`, press Demo, and watch from 22s. Confirm: the link bubble presses in, the sheet rises over a dimmed thread, the pay button presses and turns blue with a check, the sheet falls, and the receipt and tracking bubbles land after it has gone. Nothing should be clipped by the phone's rounded corners.

- [ ] **Step 6: Lint, format, commit**

```bash
npm run lint && npm run format:check
git add components/thread/PaymentSheet.tsx components/MessageThread.tsx app/globals.css
git commit -m "feat: an Apple Pay sheet on the phone"
```

---

### Task 7: The demo becomes a block

Three elements are `position: fixed` with offsets hard-coded to the homepage's column widths. Make them lay out inside a host-provided box instead. **Nothing about the homepage may change visually.**

**Files:**
- Create: `components/demo/DeviceDemo.tsx`
- Modify: `app/page.tsx`, `app/globals.css`
- Test: none automatable — this is CSS positioning. Verified by the before/after screenshot comparison in Step 5.

**Interfaces:**
- Consumes: everything above.
- Produces: `DeviceDemo({ className }: { className?: string })`, default export, rendering `.demo-stage` with the scene, labels, orbit surface and phone inside it.

- [ ] **Step 1: Capture the before**

Run `npm run dev`, open the homepage at 1440x900, and screenshot the idle state and the state at roughly 20s. Keep both. Step 5 compares against them.

- [ ] **Step 2: Write the component**

Create `components/demo/DeviceDemo.tsx`:

```tsx
import DeviceSceneMount from '@/components/device/DeviceSceneMount';
import OrbitSurface from '@/components/device/OrbitSurface';
import MessageThread from '@/components/MessageThread';
import SceneLabels from './SceneLabels';

/**
 * The whole demo, in one box.
 *
 * Everything inside positions itself absolutely, so the block fills whatever
 * the host gives it: a fixed full-viewport layer on the homepage, a grid cell
 * on a deck slide. The camera already fits the model to its canvas, so a
 * smaller box needs no new numbers.
 *
 * The play control deliberately stays outside. It belongs with the host's own
 * copy, under the wordmark on the homepage and under the subtitle on a slide,
 * rather than floating over the device.
 *
 * One per page. demoClock is a module store, so two of these would drive the
 * same clock and fight over it.
 */
export default function DeviceDemo({ className }: { className?: string }) {
  return (
    <div className={`demo-stage${className ? ` ${className}` : ''}`}>
      <DeviceSceneMount className="demo-scene" />
      <SceneLabels />
      <OrbitSurface />
      <MessageThread />
    </div>
  );
}
```

- [ ] **Step 3: Move the positioning off the viewport**

In `app/globals.css`:

- Rename `.device-layer` to `.demo-scene` everywhere it appears (the base rule near line 694 and the `max-width: 1023px` override near line 965), and change `position: fixed` to `position: absolute`.
- Change `.scene-labels` from `position: fixed` to `position: absolute`.
- Change `.phone-dock` from `position: fixed` to `position: absolute`, and in the `min-width: 1024px` block replace the hard-coded left with the variable:

```css
@media (min-width: 1024px) {
  .phone-dock {
    top: var(--demo-phone-top, 95px);
    bottom: auto;
    /* The homepage's own geometry: its 80px padding, the 620px text column
       and the row's 96px gap. A host with a different layout sets its own. */
    left: var(--demo-phone-left, calc(80px + 620px + 96px));
    transform: none;
  }
}
```

- Change `.device-orbit` inside its `min-width: 1024px` block from `position: fixed` to `position: absolute`.
- Add the stage itself:

```css
/* ---- the demo's box ---- */

/* No positioning of its own: the host decides where the demo lives, and
   everything inside lays out against this box rather than the viewport.
   Needs a containing block, hence the relative — an absolutely positioned
   child would otherwise escape all the way to the initial containing block. */
.demo-stage {
  position: relative;
}

/* The homepage's host: the same full-viewport layer the demo had before this
   was a component at all. */
.demo-stage-page {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

/* Except the orbit surface and, on mobile, the phone, which take pointers. */
.demo-stage-page .device-orbit,
.demo-stage-page .phone-dock {
  pointer-events: auto;
}
```

Note: `.phone-dock` sets `pointer-events: none` on itself and `auto` only under `max-width: 1023px`. The rule above would override that. Instead, drop `.phone-dock` from that selector and leave the dock's own rules untouched; only `.device-orbit` needs re-enabling.

- [ ] **Step 4: Use it on the homepage**

In `app/page.tsx`, replace the four loose children and the `<MessageThread />` further down:

```tsx
      <DeviceDemo className="demo-stage-page" />
      <DemoDismiss />
```

Delete the now-unused imports (`DeviceSceneMount`, `SceneLabels`, `OrbitSurface`, `MessageThread`) and add `DeviceDemo`. The `<MessageThread />` inside the flex row goes; it was never in flow, being fixed-positioned.

Update the comment above it so it still describes what is there.

- [ ] **Step 5: Compare against the before**

Run `npm run dev` and screenshot the same two moments at 1440x900. The device, the labels and the phone must be in the same places as Step 1. Then check 375x812: the device sits in its corner box above the phone, the masthead fades, and a tap off the phone still stops the demo.

If anything moved, fix the CSS rather than adjusting the pose constants — the poses are tuned and are not the problem.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm test && npm run lint && npm run format:check`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/demo/DeviceDemo.tsx app/page.tsx app/globals.css
git commit -m "refactor: make the demo a block a host can place"
```

---

### Task 8: The slide

**Files:**
- Create: `app/opportunity/components/DeckDemo.tsx`
- Modify: `app/opportunity/content/act2.tsx`, `app/opportunity/content/{act1,act3,act4,appendix}.tsx`, `app/opportunity/content/index.ts`, `app/opportunity/opportunity.css`
- Test: `tests/opportunity-copy.test.ts`

**Interfaces:**
- Consumes: Task 7's `DeviceDemo`.
- Produces: nothing later depends on this.

- [ ] **Step 1: Write the failing tests**

In `tests/opportunity-copy.test.ts`:

- Rename `'act 2 carries the eight approved titles in order'` to `'act 2 carries the nine approved titles in order'` and insert `'The best home assistant on the market'` immediately after `'Our first device is for families'`.
- Rename the subtitles test to `'nine'` and add `'Take better care of your family than ever before.'`.
- In `'exports 25 core pages and 7 appendix pages'`, change the name and both the expectation and the title to 26.
- In `'sets every chrome counter against 25 pages'`, change to 26 in both the name and the regex.
- In `'numbers core pages 1..25 contiguously in export order'`, change the name and the `length: 25` to 26.

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/opportunity-copy.test.ts`
Expected: FAIL on the new title, the new subtitle, the page count, the TOTAL regex and the contiguity check.

- [ ] **Step 3: Write the deck host**

Create `app/opportunity/components/DeckDemo.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import DeviceDemo from '@/components/demo/DeviceDemo';
import { getPhase, replay } from '@/components/demo/demoClock';

/**
 * The demo, on a slide.
 *
 * Scrolling away is the deck's equivalent of leaving the page, so the demo
 * goes back to its labelled hero rather than playing on to an empty room. The
 * threshold is deliberately low: a slide half out of view is already gone.
 */
export default function DeckDemo() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          // Already idle on first observation, which fires immediately on
          // mount: calling replay() then would publish a no-op state change
          // to every subscriber before the slide has been anywhere.
          if (!entry.isIntersecting && getPhase() !== 'idle') replay();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="deck-demo">
      <DeviceDemo className="demo-stage-slide" />
    </div>
  );
}
```

**Use `replay()`, not `reset()`.** `demoClock.reset()` is a test seam: it clears the `reduced` and `compact` flags and deliberately does not publish, so calling it from a component would strip the viewport and motion settings and leave React showing stale state. `replay()` is the documented "back to the labelled hero" path and publishes correctly.

- [ ] **Step 4: Style the slide's cell**

In `app/opportunity/opportunity.css`:

```css
/* The demo's cell on the device slide. Given a height rather than letting the
   stage collapse: everything inside it is absolutely positioned, so the box
   has nothing of its own to be as tall as. */
.deck-demo {
  position: relative;
  min-height: 60vh;
}

.demo-stage-slide {
  position: absolute;
  inset: 0;
  /* The phone centres in the cell instead of sitting at the homepage's
     column offset. */
  --demo-phone-left: 50%;
  --demo-phone-top: 0px;
}

.demo-stage-slide .phone-dock {
  transform: translateX(-50%) scale(1);
}
```

If the phone's own `--phone-scale` transform conflicts, set the dock's position with `left: 50%` and let `MessageThread`'s existing scale handling stand; do not stack two transforms on the same element.

- [ ] **Step 5: Write the slide**

In `app/opportunity/content/act2.tsx`, add after `page7`:

```tsx
const deviceDemoPage = (
  <DeckPage key={11} n={11} total={TOTAL} actClass={ACT_CLASS}>
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <Statement
        title="The best home assistant on the market"
        sub="Take better care of your family than ever before."
      >
        <strong>
          It answers from your own records, and it acts on them.
        </strong>{' '}
        It finds the eye review buried in a GP summary, plays back a
        grandmother telling the story in her own voice, emails the school, and
        fills a basket for the new term that you approve with your thumb.
        <br />
        <br />
        None of it leaves the house until you say so.
      </Statement>
      <DeckDemo />
    </div>
  </DeckPage>
);
```

Import `DeckDemo` at the top. Add `deviceDemoPage` to `ACT2_PAGES` between `page7` and `page8`.

Then bump `key`/`n` on every page from the old 11 onward, in `act2.tsx`, `act3.tsx`, `act4.tsx` and `appendix.tsx`. Work from the highest number down so no two pages transiently share an `n`.

- [ ] **Step 6: Renumber the chrome**

Set `const TOTAL = 26;` in all six files: `act1.tsx`, `act2.tsx`, `act3.tsx`, `act4.tsx`, `appendix.tsx`, `index.ts`.

In `app/opportunity/content/index.ts`:

```ts
export const PAGE_META: PageMeta[] = [
  ...actRun(9, 'I · The Category', 1),
  ...actRun(9, 'II · Our First Device', 10, { bg: 'green-200' }),
  ...actRun(3, 'III · Under the Hood', 19, { dark: true }),
  ...actRun(5, 'IV · The Ask', 22, { bg: 'green-200' }),
  ...APPENDIX_META,
];

const LEAF_PAGES = [1, 9, 19, 22, TOTAL + 1]; // cover + act splashes + appendix splash
```

- [ ] **Step 7: Run the tests**

Run: `npm test`
Expected: PASS, all files.

- [ ] **Step 8: Look at the slide**

Run `npm run dev` and open `http://localhost:3000/opportunity`. The deck is gated: unlock it the way the gate expects, then scroll to page 11. Confirm the labelled hero is up, the Play control runs the full demo in the slide's right half, the counter reads `11 / 26`, the act label reads `II · Our First Device`, and scrolling to page 12 and back returns the demo to its hero.

Then check the slides either side still snap, and that the counters run `01 / 26` to `26 / 26` with no gap.

- [ ] **Step 9: Lint, format, commit**

```bash
npm run lint && npm run format:check
git add app/opportunity tests/opportunity-copy.test.ts
git commit -m "feat: a device slide running the live demo"
```

---

### Task 9: Reduced motion, and the whole thing end to end

**Files:**
- Modify: whichever of the above need it.
- Test: `tests/demo-state.test.ts`

- [ ] **Step 1: Check the reduced-motion path**

`demoClock` jumps to `stateAt(END)` when reduced motion is set. At `END` the sheet is down and the basket card is up, which is correct. Verify in a browser with `prefers-reduced-motion: reduce` forced (Chrome DevTools, Rendering panel): the phone shows the full five-bubble thread including the tracking link, the device shows the basket, and no sheet is visible.

- [ ] **Step 2: Add the assertion that pins it**

```ts
  it('leaves nothing mid-animation at the end', () => {
    const parked = stateAt(END);
    expect(parked.sheetUp).toBe(false);
    expect(parked.tap).toBe(null);
    expect(parked.typing).toBe(false);
    expect(parked.thinking).toBe(false);
  });
```

- [ ] **Step 3: Full sweep**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run format:check && npm run build`
Expected: all pass, including a clean production build.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: pin the demo's resting state"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| §1 the slide | 8 |
| §1 the fourth exchange script | 4, 5, 6 |
| §1 the basket | 3, 6 |
| §2 the demo becomes reusable | 7 |
| §3.1 a longer script | 4 |
| §3.2 a second beat table | 4 |
| §3.3 attribution generalises | 1 |
| §3.4 cardSent stops meaning email | 2 |
| §3.5 new entry kinds and beats | 5 |
| §3.6 the payment sheet | 6 |
| §3.7 the basket card | 3 |
| §4 slide and renumbering | 8 |
| §5 testing | throughout, plus 9 |

**Known deviation from the spec:** §3.5 says the two new beats are added to `Beat`; the plan additionally puts their offsets in `BEAT` rather than `CHECKOUT`, because `ENTRY_DUE` resolves every entry's beat against `BEAT` and a beat missing from that table cannot schedule a bubble. Task 4 Step 3 documents the reason inline.
