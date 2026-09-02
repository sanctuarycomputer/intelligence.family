# Agentic commerce: a fourth exchange, and the demo on a deck slide

Two things, one build.

The homepage demo gains a fourth exchange in which the box assembles a
back-to-school basket and the family pays for it from the phone with Apple Pay.
And the demo itself becomes a reusable block, so the same device, phone and
clock can be dropped into a slide in the investor deck without a second
implementation.

The new slide is page 11 of the deck, directly after "Our first device is for
families".

---

## 1. What the visitor sees

### The slide

| | |
|---|---|
| Title | The best home assistant on the market |
| Subtitle | Take better care of your family than ever before. |
| Left column | Title, subtitle, a short body paragraph, and the Play control |
| Right column | The live demo: the device in 3D, the phone beside it |

Behaviour is identical to the homepage. The slide opens on the labelled
hardware hero (Family Leaf, Family Trunk, On-board GPU, Speaker, Touchscreen),
waits for a press, and runs the full four-exchange script. Scrolling away from
the slide stops the demo and returns it to the hero.

### The fourth exchange

The family is the O'Hagans, unchanged from the three exchanges that ship today:
Irish-American, grandparents who met in Dublin in 1971, two children, Ali and
Tom, at St Brigid's School. Prices are in US dollars.

```
0.00  out       "Have we ordered everything for the kids' school?"
0.55  device    thinking indicator replaces the activity chip
0.95  phone     typing bubble
2.00  card      BASKET · Instacart slides up on the device screen
2.45  label     "instacart · basket"
2.75  reply     "Not yet. I've put Ali's and Tom's lists into one basket.
                 Here's a checkout link."
3.05  attrib      from "St Brigid's supply list"
3.40  bubble    [ Instacart · 6 items · $87.40 ]        <- checkout link
3.40  ripple    a tap lands on the link
3.90  sheet     payment sheet slides up over the thread
5.40  ripple    a tap lands on the Apple Pay button
5.80  sheet     button fills, a check mark replaces the label
6.30  sheet     dismisses
6.60  reply     "That's paid. It arrives tomorrow before 6pm."
6.90  attrib      Paid with Apple Pay
7.20  bubble    [ Track your order · Instacart #IC-4471028 ]
10.00 end       the basket card stays up, the demo parks
```

Every tap is scripted. Nothing waits for the visitor, so the beat cannot stall
during a live pitch and behaves identically on both surfaces.

### The basket

Shown on the device screen, and again in the payment sheet on the phone.

| Item | |
|---|---|
| Composition books × 8 | $12.00 |
| Highlighters × 2 | $8.50 |
| Reading log | $6.90 |
| Pencil case × 2 | $14.00 |
| Lunchbox × 2 | $16.00 |
| Sneakers, Tom | $30.00 |
| **6 items** | **$87.40** |

---

## 2. The demo becomes reusable

### The problem

Three elements are `position: fixed` with offsets hard-coded to the homepage's
column widths:

| Element | Today |
|---|---|
| `.device-layer` | `position: fixed; inset: 0` |
| `.scene-labels` | `position: fixed; inset: 0` |
| `.phone-dock` | `position: fixed; left: calc(80px + 620px + 96px); top: 95px` |

None of that survives a move into a deck slide, which is one scroll-snapped
section among twenty-six.

### The shape

A new component, `components/demo/DeviceDemo.tsx`:

```tsx
export default function DeviceDemo() {
  return (
    <div className="demo-stage">
      <DeviceSceneMount className="demo-scene" />
      <SceneLabels />
      <OrbitSurface />
      <MessageThread />
    </div>
  );
}
```

Its four children become `position: absolute`, so they lay out inside whatever
box the stage is given. `.demo-stage` carries no positioning of its own; the
host decides:

| Host | `.demo-stage` |
|---|---|
| Homepage | `position: fixed; inset: 0` — the same full-viewport layer as today |
| Deck slide | `position: absolute; inset: 0` in the slide's right-hand cell |

The phone's hard-coded left offset becomes `var(--demo-phone-left)`, set by each
host. On the slide the phone centres in the stage instead.

`SceneLabels` needs no change to its maths. `sceneProjection` already documents
its points as "viewport pixels, relative to the scene canvas", so the labels
follow the canvas into a smaller box for free.

`DemoControls` stays **outside** the stage, in each host's own copy column: on
the homepage under the wordmark, on the slide under the subtitle. `DemoDismiss`
stays a homepage concern — it exists for the mobile tap-off, which the deck does
not have.

### Known limit

`demoClock` is a module singleton. This is one demo per page. The homepage and
the deck slide each have exactly one, so it holds today, but two on a page would
fight over the same clock. Not solved here; recorded so the next person knows.

---

## 3. What has to change in the demo's internals

### 3.1 A longer script

`EXCHANGES` gains a fourth entry:

```ts
{
  id: 'booklist',
  start: 22.5,
  duration: 10.0,
  card: 'basket',
  label: screenLabel('artifact-basket', 'instacart · basket'),
  keepCard: true,
}
```

`keepCard` moves here from `teachers`, which now lets its card fall. `END` goes
from 24.0s to 34.0s and `REPLAY_AT` from 23.0s to 33.0s, both derived as they
already are.

### 3.2 A second beat table

`BEAT` is shared by all four exchanges and describes the common five steps. The
commerce exchange has cues the others do not, so they live in their own table
rather than bloating the shared one:

```ts
/** Offsets from the commerce exchange's own start. */
export const CHECKOUT = {
  linkTap: 3.4,
  sheetUp: 3.9,
  sheetDur: 0.45,
  payTap: 5.4,
  paid: 5.8,
  sheetDown: 6.3,
  sheetDownDur: 0.4,
};
```

The `Exchange` type gains an optional `checkout?: true`. Only the exchange
carrying that flag reads `CHECKOUT`.

### 3.3 Attribution timing has to generalise

`demoState.stateAt` currently increments `attributed` once per **exchange**, at
`ex.start + BEAT.attribution`. Exchange four has two replies, so that model
breaks: the second reply would never get its attribution line.

Replace it with a per-entry derivation. Each reply entry's attribution is due at
its own `ENTRY_DUE` time plus the gap the shared table already encodes
(`BEAT.attribution - BEAT.reply`, which is 0.3s). Exchanges one to three keep
byte-identical behaviour; exchange four works.

This is the one change in this build that alters existing behaviour rather than
adding to it, so it carries the heaviest test burden. See §5.

### 3.4 `cardSent` has to stop meaning "email"

Two hard-codings assume the email card is both the only card that flips and the
last card shown:

```ts
cardSent = ex.card === 'email' && now >= at(SENT_AT);   // in the exchange loop
cardSent = true;                                         // in the park branch
```

The basket card never flips, and it is now the last card. Move the flip onto the
exchange itself — an optional `sentAt` and `sentLabel` on `Exchange` — so the
park branch can read `lastEx.sentAt !== undefined` instead of assuming.

### 3.5 New thread entry kinds and beats

`Beat` gains `settled` and `receipt`. `ThreadEntry` gains two kinds:

```ts
| { kind: 'checkoutLink'; merchant: string; summary: string; total: string }
| { kind: 'trackingLink'; label: string; detail: string }
```

Both render as link bubbles in `components/thread/bubbles.tsx`, following the
pattern `AudioSnippet` already establishes.

The `reply` kind's `attribution` stays required. The first reply of exchange
four cites `St Brigid's supply list` as a `source`; the second reports
`Paid with Apple Pay` as an `action`.

### 3.6 The payment sheet

`components/thread/PaymentSheet.tsx`, absolutely positioned inside
`.phone-frame`, sliding up over the thread from the bottom edge. Driven by the
clock like everything else: it takes a 0-to-1 position and a paid boolean, and
holds no state.

Contents, top to bottom: a grabber, the Instacart mark, `6 items · Back to
school`, the six line items, a rule, the total, and the Apple Pay pill. On
`paid` the pill's label is replaced by a check mark.

Instacart and Apple Pay marks are third-party trademarks appearing in a
mockup, the same way the iMessage thread already is. Recorded as a knowing
choice, not an oversight.

### 3.7 The basket card

`drawBasket` in `components/device/screenCards.ts`, using the same vocabulary as
the three cards already there: `header('Basket', 'Instacart')`, six rows, a
rule, a total row.

The fit is tight and worth stating. The card box is 1088 × 480 in screen space,
content starts 124px down, leaving 356px. Six rows at 44px is 264px, plus a
16px gap, a 2px rule and a 44px total row: 326px. Roughly 30px of headroom. A
seventh item would not fit, so the basket is six items by construction, not by
preference.

---

## 4. The slide, and the renumbering

### The slide

A new page between `page7` and `page8` in `app/opportunity/content/act2.tsx`,
laid out as a two-column grid: `Statement` on the left, the demo stage on the
right. It follows the conventions the deck's own tests enforce — no em dashes in
the copy, and one `<strong>` lead fragment in the body.

The slide's stage is bounded by an element in the grid cell, and an
`IntersectionObserver` on that element resets the demo to idle when the slide
leaves the viewport.

### The renumbering

Act II goes from eight pages to nine, and the deck from 25 to 26.

| What | From | To |
|---|---|---|
| `const TOTAL` in six content files | 25 | 26 |
| `DeckPage n` for every page after 10 | n | n + 1 |
| `actRun(9, 'I · The Category', 1)` | unchanged | unchanged |
| `actRun(8, 'II · Our First Device', 10, …)` | 8 | 9 |
| `actRun(3, 'III · Under the Hood', 18, …)` | start 18 | start 19 |
| `actRun(5, 'IV · The Ask', 21, …)` | start 21 | start 22 |
| `LEAF_PAGES` | `[1, 9, 18, 21, TOTAL + 1]` | `[1, 9, 19, 22, TOTAL + 1]` |

`tests/opportunity-copy.test.ts` pins all of it and must move with it: the page
count, the `const TOTAL = 26` regex, the contiguous 1..26 numbering, and act 2's
title and subtitle lists, which grow from eight to nine.

---

## 5. Testing

`demoState.stateAt` is a pure function of `t`, so the demo is testable without a
browser. That is where the weight goes.

**Regression, and the reason this section exists.** §3.3 changes how every
existing attribution is timed. Before touching it, pin the current behaviour:
for each of the three replies that ship today, assert the exact second at which
`attributed` increments. Those assertions must still pass, unchanged, after the
rewrite. If they need editing to pass, the rewrite is wrong.

**The new exchange.** Assert `stateAt` at each cue, in absolute seconds: the
basket card is up at 24.5s, the sheet is fully up at 26.85s, paid at 28.3s,
starting to leave at 28.8s, fully gone at 29.2s, and the run parks on the
basket card with `cardSent` false at `END` (34.0s).

**Ordering.** `demoState` already throws at module load if `threadScript` is out
of order. The two new beats must keep that assertion satisfied, which is a
compile-time guarantee for free.

**The deck.** The copy contract updated to 26 pages, with the new title and
subtitle in their approved positions.

**By hand.** Both surfaces in a browser, at desktop and mobile widths, and with
`prefers-reduced-motion` set. The reduced-motion path shows the finished state
with no animation, so the sheet must be down and the basket card up.

---

## 6. Decisions taken, for the record

| Question | Decision |
|---|---|
| What is bought | School supplies for the new term |
| Where the checkout happens | The phone, in an Apple Pay sheet, not the device screen |
| Who taps | Nobody. Every tap is scripted |
| Merchant | Instacart |
| Device card | The assembled basket, with the Instacart mark |
| Family | The O'Hagans, unchanged. Irish-American, US dollars |
| Where the exchange goes | Fourth, after the email. The demo runs 34s instead of 24s |
| How the slide starts | Labelled hero, waits for a press, exactly like the homepage |
| Slide position | Page 11, after "Our first device is for families" |

## 7. Flagged, and accepted

1. **The homepage demo grows from 24s to 34s**, a 40% increase, immediately
   after four commits spent tightening its pacing. Raised before approval and
   accepted; timing gets reviewed once the whole pitch is assembled.
2. **Third-party marks in an investor deck.** Instacart and Apple Pay appear in
   a mockup. Raised before approval and accepted.
