# /fundraising/stack — Annotated Layer Tour

**Date:** 2026-07-22
**Status:** Approved by Hugh (brainstorming session, 2026-07-22)
**Supersedes:** the placeholder hardware beats in the unlocked story. The
locked frame (gate + h1 + fundraising copy) is untouched.

## Purpose

Replace the placeholder scroll story on `/fundraising/stack` with a ten-beat
walk through the stack architecture
(`docs/architecture/2026-07-22-the-stack-v2.md`). The visitor scrolls; the
trunk re-frames per beat; each layer gets a title and copy in the right
column, and hairline technical-drawing callouts annotate the scene.

Design constraints, from the session:

- Copy voice is the approved Descent-script copy, verbatim, minus the
  Hardware beat (removed). Layers renumber cleanly to 01-10.
- Everything stays on the site's sage/clay system: the existing 8/4 grid,
  sage card, hairline borders. No dark background, no invented solid shapes.
- The only abstract geometry is the "layer cake": paper-thin sheets hovering
  over the Orin during beats 02-06, grounded on real hardware.
- The trunk anchors every beat.

## The beat map

One viewport of scroll per beat, copy in normal document flow (as the
placeholder beats are today). `t` spans 0..1 across the story element.

| # | Layer | Trunk / scene state | Callout(s) |
|---|-------|--------------------|------------|
| 01 | Application Runtime | Assembled, front three-quarter hero. Screen prominent. | Display → `VOICE · TACTILE · SCREEN` |
| 02 | Agentic Harness (Pii) | Top, leaf, front, and display lift away (existing explode vectors, factor 1); camera settles on the revealed Orin. Sheet 1 materializes above it. | Sheet 1 → `PII · LOCAL INFERENCE ONLY` |
| 03 | Ingestion & Encrypted Data Sink | Sheet 2 materializes below sheet 1. The stack grows downward, toward silicon. | Sheet 2 → `CAPTURE → SEALED CHUNKS` |
| 04 | Knowledge & Blob Storage | Sheet 3 materializes below sheet 2. | Sheet 3 → `GRAPH · BLOBS · INDEXES` |
| 05 | Cryptographic Core & Key Management | Sheet 4 materializes, lowest, hovering just off the Orin. | Sheet 4 → `KEYS ARE MINTED HERE. THEY NEVER LEAVE.` |
| 06 | OS & Platform Services | The four sheets consolidate into one thin slab settling just above the Orin. | Slab → `ONE GOVERNED IMAGE · VERIFIED BOOT`; front panel → `DISCONNECT SWITCH · HARDWARE TRUTH` |
| 07 | TEE & Hardware Root of Trust | Slab dissipates; camera dives; the Orin fills the card. | `ROOT OF TRUST` |
| 08 | Replication & P2P Gossip | Trunk reassembles and shifts left-of-card; two hairline line-art trunk silhouettes appear beside it. | Arcs between the three → `VERSION VECTORS · NO COORDINATOR` |
| 09 | Opaque Mirror (Zero-Knowledge Sync Server) | Trunk small and low; generous empty sage above; one one-way hairline rises to a small outlined rectangle near the card top. | Rectangle → `THE MIRROR · CIPHERTEXT ONLY` (arrowhead up; nothing descends) |
| 10 | FOTA & Fleet Management | Trunk assembled hero, settled. A hairline path enters from the card edge and meets it; a faint return tick leaves it. | `SIGNED A/B IMAGES · MODEL WEIGHTS` / `HEALTH ONLY` |

Narrative arc: opened by 02, progressively deeper through 07 (the sheets
descending toward the silicon set up the TEE dive without any dark-frame
trick), closed again for the fabric beats 08-10.

## Copy

Verbatim from the approved Descent script (no em dashes anywhere in copy or
in the beats module). Titles render as a mono layer label plus a title line:

- Label: `LAYER 02` (Roobert, `'MONO' 100`, 12px, uppercase, 0.14em
  tracking)
- Title: `Agentic Harness (Pii)` (Roobert medium, clamp(20px, 1.8vw, 26px),
  `fi-black-900`; inline style, since the unlayered global h2 rule beats
  Tailwind utilities)
- Body: the beat's paragraphs at `p.large`-adjacent sizing, `fi-black-900`.

The ten copy blocks, keyed by beat id: `runtime`, `harness`, `ingestion`,
`knowledge`, `crypto`, `os`, `tee`, `gossip`, `mirror`, `fota` (paragraphs
exactly as in the Descent script; the Hardware beat's copy is dropped).

## The sheets

- Real geometry, barely: thin boxes (~0.09 × 0.001 × 0.07 in model units)
  hovering over the Orin in the opened cavity.
- Material: frosted white/sage (MeshPhysicalMaterial, high roughness, slight
  transmission), hairline edge (EdgesGeometry line overlay), reading as
  paper against the clay.
- Slots: four fixed heights above the Orin; sheet for beat `i` materializes
  (fade + small downward settle) at the slot below the previous sheet.
  Active sheet full opacity; earlier sheets dim a step.
- Beat 06: all four lerp to a single slab position just above the Orin and
  merge (cross-fade into one slightly thicker slab).
- Beat 07: slab fades out entirely; no sheets exist from 07 on.
- Gentle idle hover (small sinusoidal bob, disabled under reduced motion).

## Architecture

New directory `www/components/stack-tour/`:

- **`stackTour.ts`** — pure data + math, no three.js imports, unit-tested:
  - `TOUR_BEATS`: id, label, title, paragraphs, start/end windows. With ten
    one-viewport sections, section `i` is vertically centred when
    `t = i / 9` (computeProgress spans height minus one viewport), so beat
    `i`'s window is centred on `i / 9` with edges at the midpoints between
    neighbouring centres.
  - Camera keyframes (time-keyed poses at beat midpoints, smoothstep eased;
    aspect-dolly correction as in `TrunkCanvas`).
  - `openFactor(t)`: 0..1 track driving top/leaf/front/display along their
    existing `EXPLODE_VECTORS` (open by beat 02, closed again for beat 08).
  - Sheet tracks: per-sheet opacity and y-position (materialize slots,
    consolidation lerp, dissipation).
  - Hairline tracks: per-callout opacity/draw progress; silhouette, mirror
    rectangle, and FOTA path opacities.
  - Anchor points in model space (display center, Orin center, sheet slots,
    front-panel switch area) for callout projection.
- **`StackTourCanvas.tsx`** — r3f canvas, sage/alpha like `TrunkCanvas`
  (same gl config, environment, error boundary, dpr cap). Renders the trunk
  (via shared pivot hook), the sheets, and per-frame: applies open factors,
  sheet states, camera pose; projects anchor points to card-space pixels and
  writes them into a shared mutable ref for the callout layer. Per-frame
  three.js mutations live behind module-level helpers (the
  react-hooks/immutability pattern established this session).
- **`CalloutLayer.tsx`** — absolutely-positioned DOM/SVG inside the card:
  hairlines (thin `fi-black-900` strokes, stroke-dash draw-in keyed to beat
  progress), mono labels (real DOM text, selectable), the two line-art trunk
  silhouettes, the Mirror rectangle, and the FOTA path. Reads projected
  anchor positions from the shared ref on rAF; static art positioned in
  percentages of the card.
- **`components/trunk/useTrunkPivots.ts`** — re-extract the idempotent
  pivot-wrapping + clay-material logic from `TrunkCanvas` so both canvases
  share it (the same extraction validated earlier this session).

`app/fundraising/stack/page.tsx`: unlocked branch keeps its exact grid
(fixed card on narrow screens, sticky `lg:` card, `min-h-svh` copy
sections) but maps over `TOUR_BEATS` and renders `StackTourCanvas` +
`CalloutLayer` in the card. Locked branch untouched.

## Behaviour details

- **Scroll**: `useScrollProgress` against the story element, exactly as
  today. Ten sections, one viewport each.
- **Reduced motion**: `t` snaps to the active beat's midpoint (no smoothing,
  no idle hover). Copy scrolls normally.
- **Mobile**: existing pinned-card layout; callout labels drop to ~10px.
- **Fallback**: canvas error boundary leaves copy + sage card readable.
- **Numbering note**: the architecture doc has 11 layers; the page shows 10
  because the Hardware beat was cut. Page numbering is self-contained
  (01-10) and does not claim to mirror the doc's indices.

## Testing

- `tests/stack-tour.test.ts` (new, pure-module):
  - Beat windows tile [0,1]; labels run `LAYER 01`..`LAYER 10` in order.
  - Camera pose finite everywhere; no per-step jump exceeding a small bound
    (no dark frames exist to hide cuts, so the camera must be continuous
    everywhere).
  - `openFactor` 0 at beat 01, 1 across 02-07, 0 again by 08's midpoint.
  - Sheet tracks: zero before their beat, active sheet at full opacity at
    its midpoint, all zero at beat 07 midpoint and beyond; consolidation
    positions converge at 06.
  - Callout opacity: each callout peaks inside its own beat, dark outside.
- `tests/stack-copy.test.ts` updated: no em dashes (page + tour module),
  all ten titles present, gate key intact, robots noindex intact. The
  PLACEHOLDER assertion is removed (copy is final).
- Visual verification: headless Chrome CDP rig at each beat midpoint under
  reduced-motion emulation, 1440×900 and one narrow width.

## Out of scope

- The locked frame, gate flow, and CRM logging.
- The full seven-body explosion (kept in `explodeTimeline.ts`, unused here).
- Any copy changes to the Descent voice.
