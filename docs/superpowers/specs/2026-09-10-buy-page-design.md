# /buy page design

Date: 2026-09-10
Status: approved in conversation, awaiting written review

## Purpose

An unlisted product detail page for the Flagship device that does two jobs:

1. Takes refundable-deposit reservations for 250 founder units, so cold ad
   traffic produces a countable demand signal.
2. Acts as the stimulus for a 1,000-person Prolific survey, so respondents
   can answer "what's the killer use case", "what could you not live
   without", and "what should we build" against a page that explains the
   product the way a buyer would meet it.

No money changes hands in this version. Stripe comes later.

## Decisions already made

- Commitment level: $49 refundable deposit against $899 at launch, applied
  to one of 250 founder units.
- Click behavior: capture email, record in Stacks, send a confirmation email
  via Resend. No charge.
- Prolific: the page is the stimulus and shows a completion code after the
  participant reserves or declines. Two codes, one per outcome, so Prolific
  counts the split.
- Visibility: unlisted. No nav link, `noindex`. Reached only by ad links,
  the survey link, and shared URLs.
- Lead promise: "Take better care of your family than ever before", with
  the home harness and "most capable AI assistant for the home" above the
  fold.
- Countdown source: a hand-set env var for this version. Prolific
  reservations do not consume founder units.

## Route and files

- `www/app/buy/page.tsx`: server component. Reads env for the countdown,
  reads `src` from search params, renders the page with `BuyClient` for the
  interactive parts.
- `www/app/buy/layout.tsx`: metadata (title, description, OG image) and
  `robots: { index: false, follow: false }`.
- `www/app/buy/BuyClient.tsx`: buy card, sticky bar, reserve form,
  confirmation and completion states.
- `www/app/buy/content.tsx`: all narrative copy and the use-case menu as
  data, so words change without touching components.
- `www/app/api/reserve/route.ts`: reservation endpoint.
- `www/lib/crm.ts`: three new allowed sources.
- `www/lib/email.ts`: `sendReservationEmail`.
- `www/lib/founder-units.ts`: countdown helper.
- `www/next.config.ts`: add `/api/reserve` to `outputFileTracingIncludes`.
- `www/.env.example`: new vars.

Nothing is added to `Navigation.tsx`.

## Page narrative, top to bottom

Same type, palette, and ragged bands as the fundraising page. Mobile first.

### 1. Hero

Left: video of the device on a countertop, ideally being spoken to and
answering. Falls back to `device-photo.jpg` until that video exists.

Right, verbatim:

> **Take better care of your family than ever before.**
>
> The Flagship is the most capable AI assistant you can put in a home. It
> remembers your family's stories, paperwork, and health. It helps run the
> household. It answers the kids. And nothing it hears ever leaves the
> house.
>
> Remembers your family · Runs your household · Stays at home
>
> $899 at launch. Reserve one of 250 founder units for $49, refundable any
> time.
> **Reserve a founder unit** · N of 250 remaining

### 2. The home harness

Heading: "An assistant that actually knows your home."

One local agent that holds the household's memory, runs scheduled jobs
(weekly check-ins, budgets, school, health), connects to calendar, email,
web search, and maps when the family opts in, and talks to devices already
on the network. Everything is local by default; the internet comes to your
data, not the other way around. Closer: this is why it is the most capable
assistant for a home. It has context no cloud assistant is allowed to have.

Media: `context-window-home.png` (the house cross-section).

### 3. What it does for your family

The use-case menu. Eight cards in three groups. Names are fixed because the
survey uses them verbatim. Media: `family-vault.png`.

**Remembers your family**

1. **Family stories.** Record grandparents while you still can, and find
   any story, recipe, or tradition later.
2. **The document vault.** Birth certificates, wills, insurance, school
   forms. Never lost again.
3. **The family health record.** Vaccines, allergies, medications, what
   runs in the family, for kids and aging parents alike.
4. **Photos and recordings.** One home for everything scattered across
   phones and drives.

**Runs your household**

5. **The shared family brain.** What the pediatrician said, when the
   permission slip is due, what's being saved for. Ask it instead of each
   other.
6. **Kid-safe AI.** Homework help and endless questions, with rules you
   set, and nothing about your kids leaving the house.
7. **Everyone's private assistant.** Writing, research, planning, at
   frontier quality, with no account and no one reading over your
   shoulder.

**Runs your home**

8. **The brain of the smart home.** One assistant that knows the house and
   talks to the devices in it. Tagged "coming later".

### 4. The kitchen shelf

The emotional beat, polished from the fundraising teaser: the Thanksgiving
story, your daughter's first words, the kids interviewing grandparents while
they still can. Media: `device-playtest.mp4` with its poster.

### 5. Nothing leaves the house

Prompts, inference, and reasoning stay on the box. Far-away family reach it
through apps over a tunnel we cannot read. Media: `walled-garden.png`.

### 6. The object

`device-cad.jpg` and `device-photo.jpg`. Plain-English specs: runs open
models locally, no subscription needed to use it, gets smarter over the air
as better open models ship.

### 7. Buy card

Same card as the hero: full price, deposit, "refundable any time", the
ship window ("Founder units ship in 2027", exact quarter to be confirmed by Hugh before launch), what happens next, countdown, button.

### 8. FAQ

Short answers: when you're charged, refund terms, what the deposit locks,
what the device needs at home, shipping regions, what a founder unit is.

### 9. Sticky bar

Appears once the hero buy card scrolls out of view. Device name, "$49
deposit", remaining count, button that scrolls to the buy card.

## Reservation flow

### Source tagging

`?src=` values and their Stacks sources:

| `src`          | Stacks source                                   | Consumes units |
| -------------- | ----------------------------------------------- | -------------- |
| `prolific`     | `g3d:family_intelligence:preorder:prolific`     | no             |
| `ads`          | `g3d:family_intelligence:preorder:ads`          | yes            |
| anything else  | `g3d:family_intelligence:preorder`              | yes            |

"Consumes units" is informational for now: the count is hand-set, so the
person updating it excludes Prolific contacts. Prolific's `PROLIFIC_PID`
param is accepted on the URL and passed through to the completion screen
but never stored.

### Reserve form

Email field, "Reserve a founder unit" button, small print: "No charge
today. We'll email you a payment link when deposits open. Refundable any
time."

### `POST /api/reserve`

Body: `{ email: string, src?: string }`.

1. Validate email with the same regex as `/api/subscribe`.
2. Rate limit by client IP using `lib/rate-limit.ts` (10 per 10 minutes).
3. Resolve `src` to a Stacks source. Unknown values resolve to the plain
   preorder source, never rejected.
4. `createCrmContact(email, source)`. On failure return 500 with a retry
   message.
5. `sendReservationEmail(email)`. On failure log and continue.
6. Return `{ success: true, status: 'reserved' }`.

### Confirmation email

From `RESEND_FROM`, reply-to `REPLY_TO`. Subject: "You're in line for the
Flagship." Plain text: what they reserved, $49 refundable deposit against
$899 at launch, one of 250 founder units, a payment link is coming, reply
with questions.

### Page states

- **Default.** Form as above.
- **Reserved.** Card swaps to "You're in line for the Flagship." Repeats
  deposit, full price, and what happens next.
- **Error.** Inline message "Something went wrong. Please try again." Email
  stays in the field.
- **Sold out.** When remaining is 0, the button reads "Join the waitlist",
  the countdown reads "All 250 founder units reserved", and the source
  falls back to the plain preorder source.

### Prolific mode (`src=prolific`)

- Buy card gains a quieter second button: "No thanks, I'm not interested."
- Reserve requires an email as usual.
- Both paths end on a completion screen: "Thanks. Your completion code is
  `CODE`. Return to Prolific to finish." Reserve shows
  `PROLIFIC_CODE_RESERVED`, decline shows `PROLIFIC_CODE_DECLINED`.
- If a code is missing from env the screen shows "Return to Prolific to
  finish the study" with no code, so a bad deploy never strands a
  participant.
- The sticky bar is hidden in Prolific mode so the decline button is never
  hidden behind it.

## Countdown

`lib/founder-units.ts` exports `remainingUnits(total, reserved)` which
returns `max(0, total - reserved)`. `page.tsx` reads
`FOUNDER_UNITS_TOTAL` (default 250) and `FOUNDER_UNITS_RESERVED` (default
0), both parsed as integers with non-numeric values treated as the default.
Rendered server-side on every request with `dynamic = 'force-dynamic'`.

## Environment

```
FOUNDER_UNITS_TOTAL=250
FOUNDER_UNITS_RESERVED=0
PROLIFIC_CODE_RESERVED=
PROLIFIC_CODE_DECLINED=
```

Existing `RESEND_*`, `REPLY_TO`, and `STACKS_API_KEY` are reused.

## Tests (Vitest)

- `reserve` route: rejects bad email (400); resolves `prolific`, `ads`,
  and unknown `src` to the right sources; returns 500 when Stacks fails;
  returns 201 when Stacks succeeds and Resend fails; rate limit returns
  429.
- `founder-units`: clamps at zero, handles missing and non-numeric env.
- `BuyClient`: reserved state renders after success; Prolific mode shows
  the decline button and the right completion code per outcome; missing
  code shows the fallback line; sold-out state swaps button text.

## Out of scope

Stripe, a live count from Stacks, a Meta pixel, a nav link, an admin view,
a deposit counter fed by the reserve route, and any survey questions on the
page itself. The survey lives in Prolific's tool and uses the eight
use-case names verbatim.

## Survey notes (not built here)

Randomize item order. Ask "which would you use in the first week" and
"which could you not live without" separately. Include "none of these".
Open text for "what should it do that isn't on this list". Ask the $49
reservation question after the list. Consider testing the headline against
"The first AI assistant that's actually yours."
