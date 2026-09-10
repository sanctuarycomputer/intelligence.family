# /preorder page design

Date: 2026-09-10
Status: approved in conversation, revised after adversarial review

## Purpose

An unlisted product detail page for the Flagship device that does two jobs:

1. Takes founder-unit reservations, so cold ad traffic produces a countable
   demand signal.
2. Acts as the stimulus for a 1,000-person Prolific survey, so respondents
   can answer "what's the killer use case", "what could you not live
   without", and "what should we build" against a page that explains the
   product the way a buyer would meet it.

No money changes hands in this version. Stripe comes later. The page says
so plainly wherever a visitor might assume otherwise.

## Decisions already made

- Offer: 250 founder units. $899 at launch. A $49 refundable deposit holds
  one. In this version the page takes the reservation and tells the
  visitor the deposit link comes later.
- Click behavior (public traffic): capture email, record in Stacks, send a
  confirmation email via Resend. No charge.
- Prolific: the page is the stimulus. Participants choose "reserve" or "no
  thanks" and get a completion code per outcome. No email is collected
  from Prolific participants (see Prolific mode).
- Visibility: unlisted. No nav link, `noindex`. Reached only by ad links,
  the survey link, and shared URLs.
- Lead promise: "Take better care of your family than ever before", with
  the home harness and "most capable AI assistant for the home" above the
  fold.
- Countdown source: a hand-set number in the hosting dashboard for this
  version. Prolific choices never consume founder units.
- Hero: full-screen video of the device in a domestic setting.

## Owner decisions to confirm before launch

These are written into the copy below with defaults. Hugh confirms or
changes them before the page goes to ads or Prolific.

| Decision                | Default in this spec                              |
| ----------------------- | ------------------------------------------------- |
| Product name on page    | "the Flagship"                                    |
| Ship window             | "Founder units ship in 2027"                      |
| Shipping regions        | United States only for founder units              |
| Refund terms            | Full refund of the deposit any time before it ships |
| When the deposit is taken | "Not today. We email a payment link when deposits open." |
| Balance                 | "$850 balance due when your unit ships"           |

## Route and files

- `www/app/preorder/page.tsx`: server component. Awaits `searchParams`
  (a Promise in Next 16) for `src`, reads the countdown and Prolific codes
  from env, and renders the page. Reading `searchParams` already makes the
  route dynamic.
- `www/app/preorder/layout.tsx`: metadata (title, description, share image
  `/research/fam-og-image.png`) and `robots: { index: false, follow: false }`.
- `www/app/preorder/PreorderClient.tsx`: sticky local nav, reserve card,
  reserve form, reserved, waitlist and completion states, analytics
  events.
- `www/app/preorder/content.tsx`: all narrative copy, the use-case menu,
  the FAQ, and the hero media constants as data.
- `www/app/preorder/preorder.css`: page-scoped styles (hero layouts,
  chapter openers, progress bar), following `opportunity.css`.
- `www/app/preorder/useReveal.ts`: one small IntersectionObserver hook
  for fade-and-rise on scroll entry, honoring `prefers-reduced-motion`.
- `www/app/preorder/HeroVideo.tsx`: client video component following the
  `DeckVideo` pattern (no `autoplay` attribute, `preload="metadata"`,
  IntersectionObserver calls `.play()`, guarded by a
  `prefers-reduced-motion` check so reduced-motion users see the poster).
- `www/app/api/reserve/route.ts`: reservation endpoint.
- `www/lib/preorder.ts`: pure helpers: `remainingUnits`,
  `readFounderUnits`, `resolvePreorderSource`, `completionCode`.
- `www/lib/crm.ts`: three new allowed sources.
- `www/lib/email.ts`: `sendReservationEmail(email, outcome)`.
- `www/next.config.ts`: add `/api/reserve` to `outputFileTracingIncludes`.
- `www/public/preorder/`: home for the future landscape hero clip and
  poster, and for the WebP conversions of the illustrations this page
  uses.

Nothing is added to `Navigation.tsx`. `EmailGateWrapper` is disabled
globally and stays that way.

## Page narrative, top to bottom

Same type, palette, and ragged bands as the fundraising page. Mobile first.

### 1. Hero: full-screen video

The first moment of beauty. It fills the first viewport (`100svh`) with
video of the device in a domestic setting, and the copy sits on top of it.

**Media.** `HeroVideo` renders a `<video muted loop playsinline
preload="metadata">` with a poster and no controls, `object-fit: cover`.
The source is a constant in `content.tsx`:

- Today: `/opportunity/device-playtest.mp4` (portrait, 720x1280, 11s, the
  device on a coffee table) with `/opportunity/device-playtest-poster.jpg`.
- Later: a landscape clip shot for this page at `/preorder/hero.mp4` with
  `/preorder/hero-poster.jpg`.

Because today's clip is portrait, the hero has two layouts driven by a
`HERO_ORIENTATION` constant:

- `portrait` (now): on phones the video covers the viewport under a
  bottom gradient scrim (transparent to `--fi-black-900` at 85%) so white
  type passes contrast on both the video and the poster alone. On desktop
  the viewport is a `--fi-black-900` ground; the copy sits in the left
  half and the video stands in the right half at full viewport height,
  edges softened by a vignette so it reads as a window into the room.
- `landscape` (later): the video covers the viewport on every screen, the
  same scrim applies, and the copy sits bottom-left.

**Copy.** Windsor Pro for the headline, Roobert for the rest, white on the
dark ground, verbatim:

> **Take better care of your family than ever before.**
>
> The Flagship is the most capable AI assistant you can put in a home. It
> remembers your family's stories, paperwork, and health. It helps run the
> household. It answers the kids. And nothing it hears ever leaves the
> house.
>
> Remembers your family · Runs your household · Nothing leaves the house
>
> $899 at launch. Hold one of 250 founder units with a $49 refundable
> deposit.
> **Reserve a founder unit** · N of 250 remaining

The button in the hero scrolls to the full reserve card. Once the visitor
has reserved, the hero offer line and button read "You're in line" and the
button is disabled. A small "scroll" cue sits at the bottom edge, matching
the deck's hint.

### 2. The home harness

Chapter opener: `context-window-home` illustration full-bleed with the
line "An assistant that knows your home." Then an editorial two-column
band, heading left and prose right:

One local agent holds the household's memory. It runs the jobs a family
never gets to: weekly check-ins, budgets, school, health. When you allow
it, it reaches out to your calendar, email, web search, and maps, and it
talks to the devices already on your network. Everything stays local by
default. The internet comes to your data, not the other way around.
Closer: that's why it's the most capable assistant you can put in a home.
It has context no cloud assistant is allowed to have.

### 3. What it does for your family

The use-case menu. Eight cards in two groups. Names are fixed because the
survey uses them verbatim. Media: `family-vault.webp`.

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
7. **Everyone's private assistant.** Writing, research, planning, as good
   as the best cloud assistants, with no account and no one reading over
   your shoulder.
8. **The brain of the smart home.** One assistant that knows the house and
   talks to the devices in it. Tagged "coming later".

### 4. The kitchen shelf

Chapter opener and the second moment of beauty: `device-photo.jpg` (the
child's hand on the device) full-bleed with one line, "Some stories you
only get to record once." Then a centered statement paragraph, set large,
polished from the fundraising teaser: the Thanksgiving story, your daughter's first words,
the kids interviewing grandparents. When the landscape hero clip exists,
the playtest video moves here as a tall panel beside the paragraph.

### 5. Nothing leaves the house

Chapter opener: `walled-garden` illustration full-bleed with the line
"Nothing leaves the house." Then a centered statement paragraph: prompts, inference, and
reasoning stay on the box. Far-away family reach it through apps over a
tunnel we cannot read. You can dim the lights without telling anyone.

### 6. The object

Third moment of beauty. A dark chapter on `--fi-black-900`: `device-cad.jpg`
large with rounded corners and four spec callouts in light type that fade
in as they scroll into view:

- Runs open models locally. Nothing to sign in to.
- No subscription needed to use it.
- Gets smarter over the air as better open models ship.
- Sits on a shelf. Plugs into the wall. That's the setup.

Then the coffee-table still (`device-table.jpg`) beside a short paragraph
on the object as an heirloom-grade thing you'd want on the counter.

### 7. Reserve card

The full card, centered on a green-200 ground, section id `reserve`:

- "The Flagship. $899 at launch."
- "Hold a founder unit with a $49 refundable deposit."
- Progress bar and "N of 250 founder units remaining" in tabular figures.
- "Founder units ship in 2027. United States only."
- Email field, button "Reserve a founder unit".
- Small print: "No charge today. We'll email you a payment link when
  deposits open. Full refund any time before your unit ships."

### 8. FAQ

Six items, deck card treatment, answers verbatim:

- **When am I charged?** Not today. When deposits open we email you a
  payment link for the $49 deposit. The $850 balance is due when your unit
  ships.
- **Can I get my deposit back?** Yes. Full refund any time before your
  unit ships, no questions asked.
- **What does a founder unit get me?** One of the first 250 devices, the
  $899 launch price locked in, and a direct line to the team while we
  build it.
- **What does it need at home?** A shelf, a power outlet, and Wi-Fi for
  the family's phones and laptops to reach it. It works with the internet
  off.
- **Where do you ship?** Founder units ship to the United States. Other
  countries come later.
- **When does it ship?** Founder units ship in 2027. We'll send updates as
  we go, and you can leave the line at any time.

### 9. Sticky local nav

Apple's pattern. Once the hero scrolls out, a slim bar (64px, under the
80px `scroll-margin-top` on sections) fixes to the top: "Flagship" in
Windsor Pro on the left, "$49 deposit · N of 250 remaining" and a
"Reserve" button on the right. The button scrolls to the reserve card.
Page background at 90% with a backdrop blur and a hairline bottom border.
After a reservation it reads "You're in line" with the button disabled.
Hidden in Prolific mode so the survey stimulus has one reserve prompt,
not two.

## Layout language

Borrowed from the reference pages and kept deliberately simple: one page,
one column, four layout types, three moments of beauty.

**Reference pages and what we take from each.**

- Apple product pages: the sticky local nav with product name and buy
  button, and the chapter rhythm where every section opens with a
  full-bleed image and a big headline before feature detail.
- Daylight: warm full-bleed photography, a three-item value strip under
  the hero, short copy, honesty about stock and shipping next to the CTA.
- Light Phone: product on a plain ground, vertical clips used as tall
  panels, big whitespace, specs as a quiet list.
- Truffle: batch language (founder units), numbers in tabular figures, a
  preorder that feels like joining something rather than shopping.

**Section types.**

- *Chapter opener*: full-bleed illustration or photo at 70 to 100vh with a
  single big line of Windsor Pro over a scrim. Sections 2, 4, 5.
- *Editorial band*: heading in the left column, prose in the right.
  Section 2.
- *Statement*: one centered paragraph set large. Sections 4 and 5.
- *Split*: text on one side, media on the other. Section 6.
- *Card grid*: the eight use-case cards with the deck's ragged-band card
  treatment, two group headers, numbered. Section 3 and the FAQ.
- *Reserve card*: a single centered card on a green-200 ground. Section 7,
  echoed in compact form in the hero.

**Three moments of beauty.** The hero video. The kitchen-shelf chapter
opener with one line and nothing else on screen. The object in a dark
chapter with specs fading in.

**Motion.** `useReveal` adds a class when an element enters the viewport;
CSS does a fade and 16px rise over 500ms. Under `prefers-reduced-motion`
elements render visible with no transition, and the hero video does not
play.

**Media weight.** The three illustrations are PNGs near 3MB each in the
deck. This page uses WebP conversions at 1536 wide committed to
`public/preorder/` (`family-vault.webp` already exists in
`public/opportunity/`). `device-photo.jpg` and `device-cad.jpg` are
resized to at most 1600 on the long edge. Video uses
`preload="metadata"`. Target under 4MB transferred on first load on a
phone, excluding the video which streams.

**Countdown treatment.** The remaining count appears three times, always
the same number: hero offer line, sticky nav, reserve card. In the reserve
card it also renders as a thin progress bar filled to the reserved share,
with "N of 250 founder units remaining" beneath it. At zero the bar is
full and the copy switches to the waitlist state.

**Type scale.** Hero headline `clamp(40px, 6vw, 88px)`. Chapter lines
`clamp(32px, 5vw, 72px)`. Body 18px on desktop, 16px on mobile. Container
and padding tokens come from `globals.css`.

**Analytics.** Google Analytics is already on every page. Fire three
events with `gtag`: `preorder_view` with `src`, `reserve_click`, and
`reserved` with `src` and `outcome`. This gives the ad funnel numbers
without a Meta pixel. Prolific study URLs are configured without
participant parameters, so no participant IDs reach analytics.

## Reservation flow

### Source tagging

`?src=` values and their Stacks sources:

| `src`         | Stacks source                                |
| ------------- | -------------------------------------------- |
| `prolific`    | never written (Prolific mode collects no email) |
| `ads`         | `g3d:family_intelligence:preorder:ads`       |
| anything else | `g3d:family_intelligence:preorder`           |

`g3d:family_intelligence:preorder:prolific` is still added to the allowed
list so the source exists if a later version collects emails with
consent, but nothing writes it in this version. `src` is held in client
state for the life of the page so it survives scrolling and the hero
button.

### `POST /api/reserve`

Body: `{ email: string, src?: string, outcome: 'reserve' | 'waitlist' }`.

1. Validate email with the same regex as `/api/subscribe`. Validate
   `outcome` is one of the two values, else 400.
2. Rate limit with `lib/rate-limit.ts` and `lib/client-ip.ts`: 20 per 10
   minutes per IP, and 3 per 10 minutes per email. Over either returns
   429.
3. Resolve `src` with `resolvePreorderSource`. `prolific` and unknown
   values resolve to the plain preorder source, never rejected.
4. `createCrmContact(email, source)`. On failure return 500 with a retry
   message.
5. Queue `sendReservationEmail(email, outcome)` with `after()` as
   `request-code` does, so the response does not wait on Resend. Failures
   are logged.
6. Return 201 `{ success: true, status: outcome }`.

Stacks accepts a repeat email as ok. The client disables the form after
success so a repeat needs a reload, and repeats are accepted.

### Confirmation emails

From `RESEND_FROM`, reply-to `REPLY_TO`. Plain text.

Reserve, subject "You're in line for the Flagship":

> You're in line for one of 250 Flagship founder units.
>
> Here's how it works. When deposits open we'll email you a payment link
> for the $49 refundable deposit. Paying it confirms your unit and locks
> the $899 launch price. The $850 balance is due when your unit ships,
> in 2027, to the United States.
>
> Change your mind at any point before it ships and we refund the deposit
> in full.
>
> Reply to this email with any question. A person reads every one.

Waitlist, subject "You're on the Flagship waitlist":

> All 250 founder units are spoken for, and you're on the waitlist. If a
> unit frees up we'll email you first.
>
> Reply to this email with any question. A person reads every one.

### Page states

- **Default.** Reserve card as in section 7.
- **Reserved.** Card swaps to "You're in line for the Flagship." with the
  same three sentences as the email's first paragraph. Hero offer line and
  sticky nav mirror the state.
- **Error.** Inline message "Something went wrong. Please try again." Email
  stays in the field.
- **Waitlist (sold out).** When remaining is 0: the progress bar is full,
  the count reads "All 250 founder units reserved", the button reads
  "Join the waitlist", small print reads "We'll email you if a unit frees
  up", and the client sends `outcome: 'waitlist'`. Source attribution is
  unchanged.

### Prolific mode (`src=prolific`)

Prolific's participant terms restrict collecting personal data beyond the
study's needs, so this mode collects nothing.

- The reserve card replaces the email field with two buttons: "Reserve a
  founder unit" and a quieter "No thanks, I'm not interested." Neither
  calls the API, writes to Stacks, or sends email.
- Both end on a completion screen: "Thanks. Your completion code is
  `CODE`. Return to Prolific to finish." Reserve shows
  `PROLIFIC_CODE_RESERVED`, decline shows `PROLIFIC_CODE_DECLINED`. The
  code is in a selectable element with a copy button.
- The outcome is stored in `sessionStorage` under `preorder:prolific`
  and rehydrated on load, so a refresh or a back-navigation shows the
  same completion screen with the same code.
- If a code is missing from env the screen shows "Return to Prolific to
  finish the study" with no code, so a bad deploy never strands a
  participant.
- Sold out in Prolific mode: the card still offers the two buttons with
  the same labels, and reserve maps to `PROLIFIC_CODE_RESERVED`. The
  survey runs before sell-out, so this is a safety net, not a design.
- The sticky nav is hidden. `reserve_click` and `reserved` still fire so
  analytics agrees with Prolific's counts.

## Countdown

`lib/preorder.ts` exports `remainingUnits(total, reserved)` returning
`max(0, total - reserved)` and `readFounderUnits(env)` returning
`{ total, reserved }` from `FOUNDER_UNITS_TOTAL` (default 250) and
`FOUNDER_UNITS_RESERVED` (default 0), treating missing or non-numeric
values as the default. `page.tsx` reads them on every request.

## Environment

`instrumentation.ts` decrypts the committed `.env` with `overload: true`,
so any key present in `.env` overrides the hosting dashboard. The four
new variables therefore live only in the hosting dashboard and are never
added to `.env`. `.env.example` gets a comment block naming them and
saying so. Changing the count is a dashboard edit, no deploy.

```
# Dashboard only, never in .env (instrumentation overloads .env values):
# FOUNDER_UNITS_TOTAL=250
# FOUNDER_UNITS_RESERVED=0
# PROLIFIC_CODE_RESERVED=
# PROLIFIC_CODE_DECLINED=
```

Existing `RESEND_*`, `REPLY_TO`, and `STACKS_API_KEY` are reused.

## Tests (Vitest, node environment, `tests/**/*.test.ts`)

The suite runs in node with no DOM, so components are not rendered in
tests. Logic that needs testing lives in `lib/preorder.ts`, and copy is
checked the way the deck's copy contract tests do it, by reading source.

- `tests/reserve.test.ts`: rejects bad email and bad outcome (400);
  resolves `ads`, `prolific`, and unknown `src` to the right Stacks
  sources; returns 500 when Stacks fails; returns 201 when Stacks succeeds
  and Resend fails; passes `outcome` to the email helper; 429 after the
  per-IP limit (with `x-forwarded-for` set and `_resetForTests()` in
  `beforeEach`) and after the per-email limit.
- `tests/preorder.test.ts`: `remainingUnits` clamps at zero;
  `readFounderUnits` handles missing and non-numeric values;
  `resolvePreorderSource` mapping; `completionCode` returns the right
  code per outcome and `null` when unset.
- `tests/email.test.ts`: extend with `sendReservationEmail` for both
  outcomes, checking subject and the first body line, mirroring the OTP
  email test.
- `tests/crm.test.ts`: update the exact `ALLOWED_SOURCES` assertion to
  include the three new sources.
- `tests/preorder-copy.test.ts`: `content.tsx` carries the hero headline,
  the hero paragraph, the eight use-case names in order, the two group
  headers, the six FAQ questions, and no em dashes. The em-dash check also
  covers the reservation email text in `lib/email.ts`.

## Out of scope

Stripe, a live count from Stacks, a Meta pixel, a nav link, an admin view,
a deposit counter fed by the reserve route, collecting emails from Prolific
participants, and any survey questions on the page itself. The survey
lives in Prolific's tool and uses the eight use-case names verbatim.

## Survey notes (not built here)

Randomize item order. Ask "which would you use in the first week" and
"which could you not live without" separately. Include "none of these".
Open text for "what should it do that isn't on this list". Ask the $49
reservation question after the list. Consider testing the headline against
"The first AI assistant that's yours."
