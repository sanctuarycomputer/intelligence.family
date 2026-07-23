# Fundraising Page: Clarifications Section (VI)

**Date:** 2026-07-22
**Branch:** worktree-fundraising-clarifications (off main @ 0912c39)

## Purpose

Add a "Clarifications" FAQ-style section to `/fundraising` that answers real
objections raised by investors (source: Reginald's iMessage feedback). Four
initial items, built to be easy to extend: content lives in a hand-editable
markdown file, so adding an item is writing a new `##` heading and a
paragraph. No code changes needed to extend.

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

Question phrasing and answer copy are drafted by Hugh directly in the
markdown file; Claude polishes (no em dashes, no AI-isms). Until drafts land,
the file ships with clearly marked placeholder copy behind the structure.

Copy constraint: "$15M" may appear once in the md, only as a question
heading ("Why $15M?"); answer bodies must never restate the ask. The
copy-contract tests enforce this.

## Content: `app/fundraising/clarifications.md`

Colocated with the page. As simple as markdown gets:

```md
## Isn't $899 too expensive?

Answer in plain markdown. **Bold** and [links](https://example.com)
supported. Multiple paragraphs fine.

## I hate subscriptions.

Next answer…
```

Convention: each `##` heading is a question; everything until the next `##`
is its answer. Nothing else — no frontmatter, no labels, no comments.

## Architecture

### Server/client split

`app/fundraising/page.tsx` is currently a client component and cannot read
files. It becomes:

- `app/fundraising/page.tsx` (new, server component): reads
  `clarifications.md` from disk, parses it into
  `{ question: string; answerHtml: string }[]`, renders
  `<FundraisingClient clarifications={items} />`. With static rendering this
  happens at build; in dev, md edits show on refresh.
- `app/fundraising/FundraisingClient.tsx`: the existing page component moved
  wholesale (still `'use client'`), now accepting the `clarifications` prop
  and rendering Section VI from it.

### Markdown parsing (server-side)

Split the md on `##` headings; convert each answer body to HTML with
`marked` (new dependency, zero-dep, widely used). Custom renderer so links
emit `target="_blank" rel="noopener noreferrer"` and the page's underline
classes. Content is repo-controlled, so this is trusted input; no
sanitization layer needed.

### `components/ClarificationItem.tsx` (new)

A thin wrapper over native `<details>`/`<summary>`:

- Props: `question: string`, `answerHtml: string`.
- `<details name="clarifications">` gives exclusive-open grouping natively
  (one item expanded at a time; degrades to multi-open in older browsers),
  keyboard and screen-reader accessible with zero state management.
- Marker: `▸` rotating to `▾` on open via the `group`/`group-open:` Tailwind
  pattern; no custom JS.
- Styling: question bold in the page's body type; answer rendered via
  `dangerouslySetInnerHTML` in the page's `p.large` rhythm; hairline top
  border in `rgba(94, 123, 41, 0.5)` to match SectionHeader dividers so the
  stack reads as a quiet list.
- No analytics.

### Section VI in `FundraisingClient.tsx`

Maps `clarifications` prop over `ClarificationItem`. Extending the FAQ is
editing the md file only.

## Interaction Notes

- Native `<details>` works with the gate: while locked the region is `inert`,
  so items cannot be toggled or tabbed into.
- No animation beyond the marker rotation in v1; content snaps open.

## Error Handling

- Missing or empty md file: build fails loudly (throw in the server
  component) rather than silently rendering an empty section.
- No other cases: no network, no persisted state.

## Testing

- New parser unit test: md in → `{question, answerHtml}[]` out, covering
  multi-paragraph answers, bold, and links.
- Extend `tests/fundraising-copy.test.ts`:
  - Add `Clarifications` to the section-order test (checks
    `FundraisingClient.tsx` after the move; update the file reads
    accordingly).
  - The Clarifications section sits inside the gated region.
  - `clarifications.md` contains at least 4 questions covering the four
    objections (match on stable keywords, not exact phrasing).
- Verify existing copy-contract assertions still pass against the moved
  file ($15M exactly once, $899 present, no LTV/model outputs).

## Out of Scope

- Analytics on clarification opens or answer links.
- Other Reginald feedback handled elsewhere: showing more shipped hardware
  (Who We Are media row) and the "what's the result / family practice"
  narrative are separate tweaks, not part of this section.
- Accordion height animation.
