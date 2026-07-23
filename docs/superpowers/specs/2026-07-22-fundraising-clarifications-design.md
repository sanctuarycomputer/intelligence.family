# Fundraising Page: Clarifications Section (VI)

**Date:** 2026-07-22
**Branch:** worktree-fundraising-clarifications (off main @ 0912c39)

## Purpose

Add a "Clarifications" FAQ-style section to `/fundraising` that answers real
objections raised by investors (source: Reginald's iMessage feedback). Four
initial items, built to be easy to extend as more objections come in.

## Placement

Section VI, headed with `SectionHeader label="VI" title="Clarifications"`,
placed after the grandma-text figure that closes Section V (The Ask). It lives
inside the email-gated region, so it inherits the gate's `inert`/`aria-hidden`
behavior while locked.

## Initial Items

Four clarifications, one per objection:

1. Price point too high ($899)
2. "I hate subscriptions" ($9/mo backup)
3. Use case too narrow / too niche on memory
4. The industrial design doesn't wow me

Question phrasing and answer copy are drafted by Hugh; Claude polishes
(no em dashes, no AI-isms) and typesets. Until drafts land, the section ships
with clearly marked placeholder copy behind the structure.

Copy constraint: answers must not add a second "$15M" or extra "$899"
occurrences without updating the copy-contract tests (see Testing).

## Architecture

### `components/ClarificationItem.tsx` (new)

A thin wrapper over native `<details>`/`<summary>`:

- Props: `question: string`, `analyticsLabel: string`, `children: ReactNode`
  (answer JSX, so answers can carry links and `<strong>` like the rest of the
  page).
- `<details name="clarifications">` gives exclusive-open grouping natively
  (one item expanded at a time), keyboard and screen-reader accessible with
  zero state management.
- Marker: `▸` rotating to `▾` on open via the `group`/`group-open:` Tailwind
  pattern; no custom JS for visuals.
- Styling: question bold in the page's body type; answer content in the
  page's `p.large` rhythm; hairline top border in `rgba(94, 123, 41, 0.5)`
  to match SectionHeader dividers so the stack reads as a quiet list.
- Analytics: on `toggle`, when opening only, fire
  `gtag('event', 'clarification_open', { event_category: 'engagement',
  event_label: analyticsLabel, value: 1 })`, matching the page's existing
  tracking helpers. Which objections investors expand is useful raise signal.

### Data-driven list in `app/fundraising/page.tsx`

The section maps over a `CLARIFICATIONS` array defined near the top of the
page file:

```tsx
const CLARIFICATIONS: {
  question: string;
  analyticsLabel: string;
  answer: ReactNode;
}[] = [
  { question: '…', analyticsLabel: 'price', answer: <>…</> },
  // append here to extend
];
```

Adding a fifth item is appending one entry. No component changes needed.

## Interaction Notes

- Native `<details>` works with the gate: while locked the region is `inert`,
  so items cannot be toggled or tabbed into.
- No animation beyond the marker rotation in v1; content snaps open. (Height
  animation of `<details>` is possible later with `interpolate-size` or a
  grid transition, out of scope now.)

## Error Handling

None required: no network, no persisted state. `gtag` calls are already
guarded by the page's existing `typeof window !== 'undefined' && window.gtag`
pattern.

## Testing

Extend `tests/fundraising-copy.test.ts`:

- Add `Clarifications` to the section-order test array after `The Ask`.
- New test: the Clarifications section sits inside the gated region (its
  `title="Clarifications"` index is greater than the email-gate marker index).
- New test: `CLARIFICATIONS` array has at least 4 entries with the expected
  `analyticsLabel`s (price, subscriptions, use case, industrial design), so
  the copy contract tracks the objection coverage rather than exact phrasing.
- Verify existing assertions still pass ($15M exactly once, $899 present,
  no LTV/model outputs). If polished answer copy needs to repeat a guarded
  figure, update the corresponding test deliberately in the same commit.

## Out of Scope

- Other Reginald feedback handled elsewhere: showing more shipped hardware
  (Who We Are media row) and the "what's the result / family practice"
  narrative are separate tweaks, not part of this section.
- Answer copy authorship (Hugh drafts; polish pass happens on his text).
- Accordion height animation.
