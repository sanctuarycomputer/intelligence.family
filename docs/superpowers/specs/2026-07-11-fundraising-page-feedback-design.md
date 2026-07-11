# /fundraising Page — Investor Feedback Revision

**Date:** 2026-07-11
**Target:** `www/app/fundraising/page.tsx`
**Source feedback:** Notion "Feedback" doc (Leyna Chiang, Toby Shorin, Delana Tran), evaluated against the live page from an investor's perspective.

## Context & Decisions

The page is a public teaser that will spread beyond warm intros, so it is designed
for the least-context (cold) reader. Decisions made during brainstorming:

| Decision | Choice |
|---|---|
| Audience | Mixed / will spread — treat as cold |
| Raise ask | Single figure: **$15M** (range removed). Controller re-models the seed at $15M targeting 24+ months post-launch runway; page ships with $15M regardless since the model is being rebuilt to match. |
| Team framing | Named, no titles: Hugh + Yatú & Norm ("the three of us") |
| Opening lane | Category creation ("private intelligence is a new category of computing"), immediately backed by traction |
| Scale math on page | Qualitative + unit-economics proof only after Hugh reviews the re-modeled financials; no projections on the public page |

### Feedback explicitly ignored (with reasons)

- Leyna's "please" copy nit — already addressed on the page; she retracted it.
- Leyna's "traditional memo with projections" — resolved by retitling to "Investor Preview"; projections stay in the gated full memo.
- Toby's time-to-profitability graph — comparable-company profitability data is unverifiable; replaced by a cited category-proof sentence.
- Delana's data room (Docsend/Papermark) — superseded by the email-OTP verification work (`feat/email-otp-verification`).
- Domain whitelisting on the email gate — Hugh is handling in another branch.

## P1 — Red-flag removal (mechanical, do first)

1. **Delete the dateline.** Remove "August · September 2026" byline (both hero
   occurrences). No replacement on the public page.
2. **Retitle** "Investor Memo" → **"Investor Preview"** (hero H1). The mailto
   subject "Investor Memo Request" stays as-is — the email requests the full
   memo, which remains a memo; only the page is a preview.
3. **Single ask, below proof.** Remove "$15M–$25M" from the hero byline and from
   the opening QuoteBox. The ask appears exactly once — "$15M" — in a QuoteBox in
   the final section (after team/traction), with the `invest@intelligence.family`
   CTA. The opening QuoteBox becomes the category thesis statement (no dollar figure).
4. **Named team block.** Replace the anonymous "We're patented inventors" paragraph
   with named bios, no titles:
   - **Hugh Francis** — founded garden3d, Sanctuary Computer, Index Space; oversees
     a $6mm+ design & development agency (present tense — he still runs it);
     patented for architecting The Light Phone II & III (TIME Best Inventions 2019
     & 2025); architected Mill's IoT infrastructure; direct CM relationships
     (Foxconn, Arima, Coosea); conversational business/engineering Chinese.
   - **Yatú Pelaez-Espinosa & Norm O'Hagan** — product duo with 10+ years of
     collaboration; founded USB Club (raised $1.2mm); founded the Advanced
     Concepts team at World (a Sam Altman company); researchers at Other
     Internet; previously designed at IBM and early Plaid.

## P2 — Narrative restructure

5. **Full section reorder** per the standard pitch arc (problem → solution →
   momentum → ask):
   - **Hero** — category thesis, no ask, no date
   - **I. The Context** — the problem: ~70% of Americans distrust Big AI with
     their data yet use AI daily (existing Pew link); why now: open models trail
     frontier by months, consumer chips can run them (existing links)
   - **II. The Device** — the solution: lived-experience beat + play-test images
   - **III. Why This Wins** — moat (Signal argument), business model (encrypted
     backup subscription + licensing), category proof
   - **IV. Who We Are** — team block (P1.4), Light Phone/Mill/World credentials,
     traction (working prototype, Mozilla research 28k+ impressions, CM
     relationships)
   - **V. The Ask** — $15M, once, email CTA
   - Section names/numerals updated accordingly ("Business Concept" no longer exists).
6. **Rewrite hero H2** to the category-creation lane. Direction: "Private
   intelligence is a new category of computing" — AI that lives in your home,
   works offline, answers to no one — starting with the family. The first gated
   paragraph must immediately back the ambition with the Mozilla research traction.
7. **Lived-experience beat.** One paragraph in section II painting the
   living-wiki moment (device at the dinner table, resurfacing family memories
   and stories) fused with the privacy thesis — bridging "distrusts Big AI" →
   "wants this in my home."
8. **Category-proof sentence** in section III, with source links, matching the
   page's cited-claim style:
   > Family-focused hardware + subscription is a proven category: Tonies built a
   > public company doing €630M/yr on it (FY2025, +31%, record adjusted EBITDA);
   > Yoto grew 86% last year to £95M.
   - Sources: tonies FY2025 press release (mynewsdesk/EQS); Music Ally Yoto 2024
     revenue article. Tin Can may be cited as a demand signal only (no numbers),
     or omitted.
9. **Unit-economics proof line** (gated section) — BLOCKED until the controller
   re-models at $15M and Hugh reviews. Candidate copy: 52.5% net hardware gross
   margin, 2.7x LTV:CAC, path to positive EBITDA on ~110k devices — a rounding
   error of the 200M+ English-speaking household market. Ship everything else
   without waiting for this.

## P3 — Diagram

10. **Three-phase trajectory diagram** (also fills the "Business Trajectory
    Expansion Graphic" placeholder in the Notion memo). Composition:
    - Three phase panels left → right: Phase 1 "One product, one market"
      (family device + subscription, 200M households) → Phase 2 "One stack,
      many markets" (legal · journalism · healthcare SKUs) → Phase 3 "One
      stack, every hardware company" (platform licensing + fleet management).
    - A shared foundation bar under all three: "The private intelligence stack
      (built once): local inference · e2e-encrypted sync · zero-knowledge fleet
      tooling." This bar is the load-bearing idea — built once, monetized three ways.
    - Caption: "Phase 1's fleet is Phase 3's reference customer."
    - Lives in section III or V; must match the page's existing visual language
      (fi-green palette, serif headings).

## Out of scope (tracked elsewhere)

- Controller brief: re-model seed at $15M (24+ months post-launch runway), add
  tariff/duty line to unit COGS, pressure-test churn (1.5%/mo), CAC ($250 flat),
  returns reserve (3%), and reconcile pre-money/dilution ($15M at $25M pre =
  ~37.5% dilution; a ~$45M pre implies ~25%).
- Email gate domain whitelisting (Hugh, separate branch).
- Full memo (Notion) edits.

## Implementation notes

- All changes are within `www/app/fundraising/page.tsx` (plus any new image asset
  for the diagram under `www/public/fundraising/`).
- Preserve: email gate mechanics (`InlineEmailGate`, scrim, localStorage),
  gtag tracking calls (update `event_label`s where copy changes meaning),
  existing citation links, `AnimatedElement` usage, QuoteBox/MediaRow/
  SectionHeader components.
- The gate boundary may shift with the reorder: the hero + section I (The
  Context) should read as the ungated teaser; gate from section II onward.
  Keep the teaser clip height (`GATE_LOCKED_STYLE.maxHeight`) visually correct
  after reordering.
- Verify with the running app that the locked/reveal states still render
  correctly after the restructure.
