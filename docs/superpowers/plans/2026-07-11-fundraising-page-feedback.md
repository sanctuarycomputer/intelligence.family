# /fundraising Page Feedback Revision — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revise `www/app/fundraising/page.tsx` per the investor-feedback spec: single $15M ask below proof, "Investor Preview" retitle, named team block, section reorder to the standard pitch arc, verified category proof, stage-1 economics facts, and a three-phase trajectory diagram.

**Architecture:** All changes live in one Next.js client page (`www/app/fundraising/page.tsx`), its layout metadata, one new presentational component (`TrajectoryDiagram`), and one copy-contract vitest file that asserts invariants against the page source text (no DOM test lib exists in this repo; source-text assertions are the cheapest regression guard for copy).

**Tech Stack:** Next.js 16 / React 19, Tailwind 4, vitest 4 (existing `www/tests/` node-side suite).

**Spec:** `docs/superpowers/specs/2026-07-11-fundraising-page-feedback-design.md`

## Global Constraints

- The string "$15M" must appear **exactly once** on the page (the Ask section). No "$25M" or ranges anywhere, including `layout.tsx` metadata.
- No dateline anywhere ("August · September 2026" must not appear).
- H1 is "Investor Preview". The mailto subject stays `Investor%20Memo%20Request` (the email requests the full memo — intentional).
- Preserve: `InlineEmailGate` mechanics (scrim, `localStorage` key `fi_fundraising_unlocked`, reveal timing), all existing `gtag`/`trackOutbound` calls and citation links, `AnimatedElement`/`QuoteBox`/`MediaRow`/`SectionHeader` usage patterns.
- Gate boundary after reorder: hero + Section I (The Context) ungated; Sections II–V gated.
- No model-derived figures (margins, LTV:CAC, breakeven month) on the page — stage 2 is blocked on the $15M re-model review.
- All commands run from `www/`. Test with `npm run test`, lint with `npm run lint`, build with `npm run build`.

---

### Task 1: P1 mechanical fixes — hero, title, metadata

**Files:**
- Modify: `www/app/fundraising/page.tsx` (hero header, lines ~72–118; opening QuoteBox, lines ~133–151)
- Modify: `www/app/fundraising/layout.tsx:3-5`
- Test: `www/tests/fundraising-copy.test.ts` (create)

**Interfaces:**
- Produces: `www/tests/fundraising-copy.test.ts` with a `read(file)` helper later tasks extend.

- [ ] **Step 1: Write the failing copy-contract test**

Create `www/tests/fundraising-copy.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const read = (rel: string) =>
  readFileSync(path.join(__dirname, '..', rel), 'utf8')

const page = read('app/fundraising/page.tsx')
const layout = read('app/fundraising/layout.tsx')

describe('fundraising page copy contract', () => {
  it('has no dateline', () => {
    expect(page).not.toMatch(/August · September/)
  })

  it('is titled Investor Preview (mailto subject may still say Investor Memo)', () => {
    expect(page).toContain('Investor Preview')
    // Plain-text "Investor Memo" (with a space) is gone; the mailto subject
    // uses "Investor%20Memo", which this regex cannot match.
    expect(page).not.toMatch(/Investor Memo/)
  })

  it('has no $25M or raise range anywhere', () => {
    expect(page).not.toMatch(/25M/)
    expect(layout).not.toMatch(/25M/)
  })

  it('hero contains no raise ask', () => {
    const hero = page.slice(page.indexOf('<header'), page.indexOf('</header>'))
    expect(hero).not.toMatch(/raising/i)
    expect(hero).not.toMatch(/\$1?5M/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts`
Expected: FAIL — dateline, "Investor Memo", "$15M&ndash;$25M" all still present.

- [ ] **Step 3: Edit the hero in `page.tsx`**

Replace the entire block between `<header className="pt-40 ...">`'s inner column div (currently: dateline byline → H1 → H2 → ask byline) with:

```tsx
            <div className="col-span-12 flex flex-col items-center text-center">
              {/* H1 Title with Leaf */}
              <AnimatedElement delay={0} className="relative inline-block">
                <h1 className="relative inline-block" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 9vw, 64px)', fontWeight: 400 }}>
                  Investor Preview
                  <LeafIcon
                    className="absolute leaf-animate"
                    style={{
                      width: '0.35em',
                      height: '0.4em',
                      top: '-0.05em',
                      right: '-0.4em',
                    }}
                  />
                </h1>
              </AnimatedElement>

              {/* H2 Subtitle */}
              <AnimatedElement delay={100}>
                <h2 className="mt-2 text-balance max-w-2xl" style={{ fontSize: 'clamp(20px, 4vw, 28px)' }}>
                  We're building a consumer hardware business and software platform for private intelligence.
                </h2>
              </AnimatedElement>
            </div>
```

(The H2 copy is rewritten in Task 4 — this task only deletes the dateline byline and the "$15M–$25M" ask byline, including its `email-underline.png` decoration.)

- [ ] **Step 4: De-ask the opening QuoteBox**

In the same file, change the opening QuoteBox `quote` prop from the "We're raising $15M–$25M to design, manufacture, and ship…" sentence to the thesis-only version:

```tsx
                        quote={<><strong>We&apos;re building the first device in a new category</strong>: beautiful consumer hardware running a fully local AI stack, where your most intimate data is understood, agentified, inferred against... <strong>but never exposed to the cloud</strong>.</>}
```

(All other QuoteBox props — `source`, `actionLabel`, `href`, `onClick` gtag — stay unchanged.)

- [ ] **Step 5: Fix `layout.tsx` metadata**

Replace lines 3–5 with:

```ts
const title = "Fundraising · Family Intelligence";
const description =
  "The first device in a new category: beautiful consumer hardware running a fully local AI stack — private intelligence, never exposed to the cloud.";
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 7: Run the full suite and commit**

Run: `cd www && npm run test && npm run lint`
Expected: all existing tests still pass, no lint errors.

```bash
git add www/app/fundraising/ www/tests/fundraising-copy.test.ts
git commit -m "P1: drop dateline, retitle to Investor Preview, remove ask from hero + metadata"
```

---

### Task 2: Named team block

**Files:**
- Modify: `www/app/fundraising/page.tsx` — the "Our Experience" section paragraph (currently the `<p className="large">` beginning `<strong>We&apos;re patented inventors</strong>`)
- Test: `www/tests/fundraising-copy.test.ts` (extend)

**Interfaces:**
- Consumes: `read()` helper and `page` constant from Task 1's test file.

- [ ] **Step 1: Add failing tests**

Append to the `describe` block in `www/tests/fundraising-copy.test.ts`:

```ts
  it('names the team', () => {
    expect(page).toContain('Hugh Francis')
    expect(page).toContain('Yatú Pelaez-Espinosa')
    // Source uses an HTML entity for the apostrophe (O&rsquo;Hagan)
    expect(page).toMatch(/Norm O.{0,8}Hagan/)
  })

  it('does not claim the agency in past tense', () => {
    expect(page).not.toMatch(/\bran\b.*agency/i)
    expect(page).toMatch(/oversees/)
  })
```

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts` — Expected: FAIL (names absent).

- [ ] **Step 2: Replace the anonymous experience paragraph**

Replace the single `<p className="large">` beginning `<strong>We&apos;re patented inventors</strong>…` with two paragraphs (no titles, per spec):

```tsx
                    <p className="large">
                      <strong>The three of us have spent our careers building intimate, human-centric hardware.</strong>{" "}
                      <strong>Hugh Francis</strong> founded <a href="https://garden3d.net" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('garden3d')}>garden3d</a> and Sanctuary Computer, and oversees a $6mm+ design & development studio. He&apos;s a patented inventor for architecting <a href="https://www.sanctuary.computer/work/light-three" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('light_phone')}>The Light Phone II & III</a> (named among TIME Magazine&apos;s Best Inventions in 2019 and 2025), architected <a href="https://www.sanctuary.computer/work/mill" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('mill')}>Mill&apos;s IoT infrastructure</a> (from the founders of Google&apos;s Nest), and <strong>holds direct relationships in Taipei and Shenzhen with Foxconn</strong>, Arima, Coosea, and other top-tier contract manufacturers.
                    </p>

                    <p className="large">
                      <strong>Yatú Pelaez-Espinosa & Norm O&rsquo;Hagan</strong> are a product duo with 10+ years of creative collaboration: they founded <a href="https://usb.club/about" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('usb_club')}>USB Club</a>, a hardware-enabled social network, founded the Advanced Concepts hardware team at <a href="https://www.recordsofthought.com/proof" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('world')}>Sam Altman&apos;s World</a>, researched new educational models at Other Internet, and in past lives designed at IBM and early Plaid.
                    </p>
```

Note: this intentionally consumes the `light_phone`, `usb_club`, `world`, and `mill` links from the deleted paragraph — no citation is lost. The AT&T mention is dropped (weakest credential, per the tighter memo bios).

- [ ] **Step 3: Run tests, lint, commit**

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts && npm run lint`
Expected: PASS.

```bash
git add www/app/fundraising/page.tsx www/tests/fundraising-copy.test.ts
git commit -m "P1: named team block — Hugh + Yatú & Norm, no titles, present-tense agency"
```

---

### Task 3: Section reorder to the pitch arc + Ask section + gate boundary

**Files:**
- Modify: `www/app/fundraising/page.tsx` (whole gated region)
- Test: `www/tests/fundraising-copy.test.ts` (extend)

**Interfaces:**
- Produces: five `SectionHeader` sections — "The Context" (I), "The Device" (II), "Why This Wins" (III), "Who We Are" (IV), "The Ask" (V). Task 4 inserts copy into I–III; Task 5 inserts the diagram into III.

- [ ] **Step 1: Add failing tests**

Append:

```ts
  it('follows the pitch arc section order', () => {
    const order = ['The Context', 'The Device', 'Why This Wins', 'Who We Are', 'The Ask']
    const idx = order.map((t) => page.indexOf(`title="${t}"`))
    expect(idx.every((i) => i >= 0)).toBe(true)
    expect([...idx].sort((a, b) => a - b)).toEqual(idx)
    expect(page).not.toContain('Business Concept')
    expect(page).not.toContain('Our Experience')
  })

  it('asks for $15M exactly once, in The Ask section', () => {
    expect(page.match(/\$15M/g)).toHaveLength(1)
    expect(page.indexOf('$15M')).toBeGreaterThan(page.indexOf('title="The Ask"'))
  })

  it('gates from The Device onward; The Context is public', () => {
    const gateStart = page.indexOf('/* ===== Email gate')
    expect(page.indexOf('title="The Context"')).toBeLessThan(gateStart)
    expect(page.indexOf('title="The Device"')).toBeGreaterThan(gateStart)
  })
```

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts` — Expected: FAIL.

- [ ] **Step 2: Restructure the page body**

This is a **move-only** step: existing JSX blocks are relocated verbatim (identified below by their bold lead-ins and current line ranges from the pre-task-1 file); the only *new* JSX is the Ask section (full code below). Target skeleton inside `<section id="fundraising" className="mb-10">`:

```tsx
                  {/* ===== I. THE CONTEXT — public teaser ===== */}
                  <SectionHeader label="I" title="The Context" />
                  <div className="mt-8 space-y-6">
                    <div className="mb-10">
                      {/* KEEP: opening thesis QuoteBox (de-asked in Task 1) */}
                    </div>
                    {/* MOVE HERE (out of the gated div): <p> beginning
                        "We're starting with families, then branching out"
                        (Pew 70% + Instagram/Mozilla links) */}
                    {/* MOVE HERE: <p> beginning "From there, the same stack extends"
                        (open-models + chipsets links, "AI as an offline appliance") */}

                    {/* ===== Email gate: everything below fades until verified ===== */}
                    <div className="relative">
                    <div
                      className={`space-y-6 ${locked ? 'select-none' : ''}`}
                      aria-hidden={locked}
                      inert={locked}
                      style={gatedStyle}
                    >

                    {/* ===== II. THE DEVICE ===== */}
                    <div className="pt-8">
                      <SectionHeader label="II" title="The Device" />
                    </div>
                    {/* MOVE HERE: MediaRow with moment-1 / family-together / moment-3
                        ("Play tests for our early industrial designs.") */}
                    {/* Task 4 adds the lived-experience paragraph above the MediaRow */}

                    {/* ===== III. WHY THIS WINS ===== */}
                    <div className="pt-8">
                      <SectionHeader label="III" title="Why This Wins" />
                    </div>
                    {/* MOVE HERE: <p> beginning "Big AI labs can't afford to compete"
                        (Signal/Telegram moat argument) */}
                    {/* MOVE HERE: <p> beginning "The device will be sold at a premium" */}
                    {/* MOVE HERE: QuoteBox "This is a proven model" (Signal backups) */}
                    {/* MOVE HERE: <p> beginning "Our stack is licensable, too" (balena) */}

                    {/* ===== IV. WHO WE ARE ===== */}
                    <div className="pt-8">
                      <SectionHeader label="IV" title="Who We Are" />
                    </div>
                    {/* MOVE HERE: the two team paragraphs from Task 2 */}
                    {/* MOVE HERE: MediaRow with signal-source / family-together.webp /
                        moment-video ("We've built and scaled...") */}
                    {/* MOVE HERE: <p> beginning "We've built a working prototype"
                        — but strip its trailing ask/email sentence; keep prototype,
                        full-memo, and NYC/SF sentences. The email CTA moves to V. */}

                    {/* ===== V. THE ASK ===== */}
                    <div className="pt-8">
                      <SectionHeader label="V" title="The Ask" />
                    </div>

                    <div className="my-10">
                      <QuoteBox
                        large
                        quote={<><strong>We&apos;re raising $15M</strong> to design, manufacture, and ship the first device in this category &mdash; and to prove the stack that every private-intelligence product after it will run on.</>}
                        showQuotes={false}
                        source="Email us for the full memo & a demo"
                        actionLabel="invest@intelligence.family"
                        href="mailto:invest@intelligence.family?subject=Investor%20Memo%20Request"
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.gtag) {
                            window.gtag('event', 'email_click', {
                              event_category: 'engagement',
                              event_label: 'investor_memo_request_ask',
                              value: 1,
                            });
                          }
                        }}
                      />
                    </div>

                    </div>{/* /gated content */}
                    {/* KEEP: scrim + InlineEmailGate block exactly as-is */}
                    </div>{/* /email gate wrapper */}
                  </div>
```

Rules for the move:
- Move blocks **verbatim** — do not touch copy, links, or `trackOutbound` labels in this task.
- The old "Our Prototype & Memo" paragraph loses only its final sentence (`<strong>If you&apos;d like a demo, please email us</strong> at …` through the underlined mailto span) — that CTA is superseded by the Ask QuoteBox. Keep "please" politeness in the Ask QuoteBox `source` line implicitly ("Email us for the full memo & a demo").
- The scrim `<div>` (GATE_SCRIM background, `InlineEmailGate` at `top: 400`) and all state logic (`unlocked`, `revealing`, `handleUnlock`, `GATE_LOCKED_STYLE`) are unchanged.

- [ ] **Step 3: Run tests to verify pass**

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts`
Expected: PASS.

- [ ] **Step 4: Visual smoke-check the gate**

Run: `cd www && npm run dev` and open `http://localhost:3000/fundraising` (clear the `fi_fundraising_unlocked` localStorage key + `fi_verified` cookie first).
Expected: hero + The Context fully readable; content fades into the scrim just after "The Device" header; email form sits in the fade; reveal animation still smooth after entering a code (or temporarily set `localStorage.fi_fundraising_unlocked = '1'` to check the unlocked layout). Adjust `GATE_LOCKED_STYLE.maxHeight` / gate `top` **only if** the teaser clip looks wrong (e.g. cuts mid-image); keep changes minimal.

- [ ] **Step 5: Lint, full suite, commit**

Run: `cd www && npm run test && npm run lint`

```bash
git add www/app/fundraising/page.tsx www/tests/fundraising-copy.test.ts
git commit -m "P2: reorder to pitch arc (Context/Device/Why/Who/Ask), single \$15M ask, gate from The Device"
```

---

### Task 4: New narrative copy — hero lane, lived-experience, category proof, stage-1 economics

**Files:**
- Modify: `www/app/fundraising/page.tsx`
- Test: `www/tests/fundraising-copy.test.ts` (extend)

**Interfaces:**
- Consumes: section skeleton from Task 3 (insertion points named there).

- [ ] **Step 1: Add failing tests**

```ts
  it('opens on the category-creation lane', () => {
    expect(page).toContain('new category of computing')
  })

  it('cites verified category proof', () => {
    expect(page).toMatch(/tonies/i)
    expect(page).toContain('Yoto')
    expect(page).toContain('630')
    expect(page).toContain('86%')
  })

  it('has stage-1 economics only (no model outputs)', () => {
    expect(page).toContain('$899')
    expect(page).toContain('$9/month')
    expect(page).toContain('110,000')
    expect(page).not.toMatch(/52\.5|2\.7x|LTV/)
  })
```

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts` — Expected: FAIL.

- [ ] **Step 2: Rewrite the hero H2**

```tsx
                <h2 className="mt-2 text-balance max-w-2xl" style={{ fontSize: 'clamp(20px, 4vw, 28px)' }}>
                  Private intelligence is a new category of computing: AI that lives in your home, works offline, and answers to no one. We&apos;re starting with the family.
                </h2>
```

- [ ] **Step 3: Add the lived-experience paragraph**

Insert in Section II (The Device), above the play-test MediaRow:

```tsx
                    <p className="large">
                      <strong>The device is a living archive of your family.</strong> It sits on the kitchen shelf, and when you invite it into the conversation it can resurface the story your grandfather told last Thanksgiving, find the recording of your daughter&apos;s first words, and help your kids interview their grandparents while they still can. Everything it hears and remembers <strong>stays inside the house</strong>. That&apos;s the unlock: an AI families actually welcome at the dinner table, because it works for them and no one else.
                    </p>
```

- [ ] **Step 4: Add the category-proof sentence**

Insert in Section III (Why This Wins), directly after the "premium consumer price point / encrypted backup" paragraph:

```tsx
                    <p className="large">
                      <strong>Family-focused hardware plus subscription is a proven category</strong>: <a href="https://www.mynewsdesk.com/us/tonies/pressreleases/tonies-reaches-upper-end-of-fy-2025-guidance-portfolio-expansion-and-internationalization-drive-profitable-growth-with-record-adjusted-ebitda-margin-3430792" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('tonies_proof')}>tonies built a public company on it</a> (&euro;630M revenue in FY2025, up 31%, at a record EBITDA margin), and <a href="https://musically.com/2025/08/27/childrens-speakers-startup-yoto-saw-sales-grow-by-86-in-2024/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('yoto_proof')}>Yoto grew 86% last year to &pound;95M</a> with backing from the Chan Zuckerberg Initiative.
                    </p>
```

- [ ] **Step 5: Add the stage-1 economics line**

Insert in Section III, after the licensing/balena paragraph (last content before Section IV):

```tsx
                    <p className="large">
                      <strong>The math is simple</strong>: an $899 device, a $9/month end-to-end encrypted backup subscription, and a five-year plan built on ~110,000 devices &mdash; roughly 0.05% of the 200M+ English-speaking households we&apos;re selling into.
                    </p>
```

(Stage 2 — margin, LTV:CAC, breakeven — is added only after the $15M re-model is reviewed. See spec item 9.)

- [ ] **Step 6: Tests, lint, commit**

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts && npm run lint`
Expected: PASS.

```bash
git add www/app/fundraising/page.tsx www/tests/fundraising-copy.test.ts
git commit -m "P2: category-lane hero, lived-experience beat, tonies/Yoto proof, stage-1 economics"
```

---

### Task 5: Trajectory diagram component

**Files:**
- Create: `www/components/TrajectoryDiagram.tsx`
- Modify: `www/app/fundraising/page.tsx` (import + render in Section V, above the Ask QuoteBox)
- Test: `www/tests/fundraising-copy.test.ts` (extend)

**Interfaces:**
- Produces: `export default function TrajectoryDiagram(): JSX.Element` — no props, self-contained, fi-green palette.

- [ ] **Step 1: Add failing test**

```ts
  it('renders the trajectory diagram', () => {
    expect(page).toContain('<TrajectoryDiagram')
    const diagram = read('components/TrajectoryDiagram.tsx')
    expect(diagram).toContain('One product, one market')
    expect(diagram).toContain('every hardware company')
  })
```

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts` — Expected: FAIL (file missing).

- [ ] **Step 2: Create the component**

`www/components/TrajectoryDiagram.tsx` — three phase panels over a shared stack bar; pure Tailwind/JSX so it inherits the site palette and stays crisp at every size:

```tsx
const PHASES = [
  {
    label: 'Phase 1',
    title: 'One product, one market',
    detail: 'Family device + subscription · 200M+ households',
  },
  {
    label: 'Phase 2',
    title: 'One stack, many markets',
    detail: 'Legal · journalism · healthcare SKUs',
  },
  {
    label: 'Phase 3',
    title: 'One stack, every hardware company',
    detail: 'Platform licensing + fleet management',
  },
];

export default function TrajectoryDiagram() {
  return (
    <figure className="my-10">
      <div className="flex flex-col md:flex-row items-stretch gap-2">
        {PHASES.map((phase, i) => (
          <div key={phase.label} className="flex-1 flex items-stretch gap-2">
            <div className="flex-1 border border-fi-green-500/50 rounded p-4 flex flex-col gap-1 bg-fi-green-500/5">
              <span className="label">{phase.label}</span>
              <span className="font-sans text-sm font-medium text-fi-black-900">{phase.title}</span>
              <span className="font-sans text-sm text-fi-black-900/70">{phase.detail}</span>
            </div>
            {i < PHASES.length - 1 && (
              <span aria-hidden className="hidden md:flex items-center text-fi-green-500">→</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 border border-fi-green-500 rounded px-4 py-3 text-center bg-fi-green-500/10">
        <span className="font-sans text-sm font-medium text-fi-black-900">
          The private intelligence stack, built once: local inference · e2e-encrypted sync · zero-knowledge fleet tooling
        </span>
      </div>
      <figcaption className="byline mt-3 text-center">
        Phase 1&apos;s fleet is Phase 3&apos;s reference customer.
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 3: Render it in the page**

In `page.tsx`: add `import TrajectoryDiagram from "@/components/TrajectoryDiagram";` and render `<TrajectoryDiagram />` in Section V, between the "The Ask" `SectionHeader` and the $15M QuoteBox (the ask lands immediately after the reader sees how it compounds).

- [ ] **Step 4: Visual check + tests + commit**

Run: `cd www && npx vitest run tests/fundraising-copy.test.ts` — Expected: PASS.
Run dev server; confirm the diagram reads correctly at mobile width (panels stack vertically, arrows hidden) and desktop. Confirm `fi-green` classes exist in the Tailwind theme (they're used by QuoteBox with `border-fi-green-500/50`, so they do — if a class variant is missing, borrow the exact classes QuoteBox uses).

```bash
git add www/components/TrajectoryDiagram.tsx www/app/fundraising/page.tsx www/tests/fundraising-copy.test.ts
git commit -m "P3: three-phase trajectory diagram with shared stack bar"
```

---

### Task 6: Full verification

**Files:** none new.

- [ ] **Step 1: Full test suite** — `cd www && npm run test` → all pass (copy-contract + existing OTP/CRM suites).
- [ ] **Step 2: Lint + format** — `cd www && npm run lint && npm run format:check` (run `npm run format` if check fails, re-stage).
- [ ] **Step 3: Production build** — `cd www && npm run build` → succeeds with no type errors.
- [ ] **Step 4: Manual walkthrough** — dev server, fresh profile (no cookie/localStorage):
  - Hero: "Investor Preview", category H2, no date, no ask.
  - Public: thesis QuoteBox + The Context readable; gate fade starts after "The Device" header.
  - Complete a real OTP flow (or set the localStorage key) → reveal animation → all five sections in order → single $15M ask at the bottom with diagram above it.
  - Link previews: view page source, confirm `og:description` has no dollar figure.
- [ ] **Step 5: Commit any fixups; report status** — including test output — before merging/PR (use superpowers:finishing-a-development-branch).
```
