# /fundraising/stack — Scroll-Driven Exploded Hardware View

**Date:** 2026-07-21
**Status:** Approved by Hugh (design conversation, 2026-07-21)

## Purpose

A new gated page at `/fundraising/stack` that tells the hardware story of the
family trunk ("family-book-box v43") through a scroll-driven exploded 3D view.
As the visitor scrolls, the device separates into its discrete bodies and each
part gets a copy beat. The Orin Nano / UPS module separation is the
centerpiece: it shows real, local AI hardware inside a sculptural enclosure.

## Source model

`family-trunk-all-again.glb` (Fusion 360 v43 → Blender → glTF 2.0).
Raw: 28MB, 787k triangles, 2,290 sub-meshes, 75 materials.

Seven discrete top-level bodies (sizes in mm):

| Body | Size | Role |
|---|---|---|
| `Enclosure-Back` | 185 × 101 × 173 | Main shell |
| `Enclosure-Front` | 185 × 109 × 91 | Front panel |
| `Enclosure-Top` | 185 × 39 × 90 | Lid |
| `leaf` | 67 × 19 × 37 | Decorative leaf |
| `1118 v1:1` | 166 × 104 × 91 | Waveshare display |
| `Orin Nano …ENVELOPE v1:1` | 89 × 35 × 100 | NVIDIA Orin Nano dev kit |
| `UPS-Power-Module-C v1:1` | 85 × 33 × 100 | UPS power board (sits under the Orin) |

Leaf meshes are all named `Body1.xxx`; the discrete-body names live on the
group nodes, so the explode rig keys off the 7 top-level group nodes.

## Decisions made

- **Destination:** `www/app/fundraising/stack/page.tsx` (React + three.js in
  the existing Next.js 16 site). No standalone prototype.
- **Interaction:** scroll-driven explosion with copy beats. No slider, no
  autoplay.
- **Gating:** same email gate as `/fundraising` — reuse `InlineEmailGate` and
  the same localStorage unlock key (`fi_fundraising_unlocked_v2`, currently
  declared in `app/fundraising/page.tsx`; extract to a shared constant so both
  pages stay in sync when the suffix is bumped).
- **Visual treatment:** Mixed — clay/brand-tone overrides on the enclosure
  bodies and leaf; original CAD materials on the display, Orin Nano, and UPS
  module so the electronics read as real hardware.
- **Copy:** placeholder copy beats per part, written to be replaced by Hugh's
  own words. Do not invent final marketing copy.
- **Approach:** react-three-fiber + drei, native page scroll (Approach A).
  Explicitly rejected: drei `ScrollControls` (hijacks scroll, fights the gate
  and page layout), GSAP/Theatre.js (second animation system for one scalar),
  vanilla three.js (more imperative plumbing than the codebase wants).
- **Dependencies:** the site runs React 19 / Next 16, so pin
  `@react-three/fiber@^9` and `@react-three/drei@^10` (v8/v9 respectively do
  not support React 19). `three` at the version those two peer on.
- **Raw model is not committed.** The 28MB source GLB stays outside the repo;
  the optimizer script takes the input path as a CLI argument (current source:
  `~/Downloads/family-trunk-again/family-trunk-all-again.glb`). Only the
  optimized `public/fundraising/trunk.glb` is committed.

## Architecture

### Page structure

- `app/fundraising/stack/layout.tsx` — metadata (noindex like `/fundraising`),
  re-declared share card per the existing pattern.
- `app/fundraising/stack/page.tsx` — client page: gate check, scroll sections,
  and a `next/dynamic` (`ssr: false`) import of the canvas component so the
  page shell and copy still render on the server.
- `components/trunk/TrunkCanvas.tsx` — the R3F scene (client only).
- `components/trunk/useScrollProgress.ts` — maps document scroll through the
  section stack to a 0–1 timeline value.
- `components/trunk/explodeTimeline.ts` — pure functions: per-body explode
  vectors, stagger windows, camera keyframes. Unit-testable, no three.js
  imports beyond vector math.

The canvas is `position: fixed`, full viewport, behind the DOM content.
Eight scroll sections (intro + 7 beats, some parts may share a beat if pacing
reads better) are ordinary DOM with Windsor Pro / Roobert typography; each
section's copy fades in as its part separates (IntersectionObserver, same
spirit as the existing `PageAnimations` component).

### Scroll → animation

- `useScrollProgress` returns target progress 0–1 across the scrollable story.
- Each frame (`useFrame`), current progress lerps toward target with smoothing
  factor ~0.08 — fluid, not 1:1 with the wheel.
- Progress drives (a) per-body explode offset via stagger windows and
  (b) camera position/lookAt interpolated between per-section keyframes.
- `prefers-reduced-motion`: skip the animation entirely; render the fully
  exploded state as a static view, copy sections still readable.

### Explode rig

At load, wrap each of the 7 top-level bodies in a pivot group. Hand-authored
explode vectors (not centroid-derived), staggered in this order along the
timeline:

1. `Enclosure-Top` lifts up
2. `leaf` floats higher above it
3. `Enclosure-Front` swings forward, with the Waveshare display (`1118`)
   tracking just behind it as a second layer
4. Orin Nano slides out
5. UPS module drops below the Orin — camera drops to eye level here
   (the money shot: compute + power stack separated vertically)
6. `Enclosure-Back` recedes

Exact vector magnitudes tuned by eye during implementation; the stagger and
direction table lives in `explodeTimeline.ts`.

### Asset pipeline

One-time `gltf-transform` script at `www/scripts/optimize-trunk.mjs`
(re-runnable for v44+), output committed to `public/fundraising/trunk.glb`:

1. Flatten the deep Fusion node tree, **preserving the 7 body boundaries**
2. Join meshes per body (draw calls: ~2,290 → roughly material count, ~75)
3. Weld, then `simplify` the electronics internals (ECAD fillets tolerate
   heavy decimation at screen size)
4. Quantize + meshopt compression

Budget: **≤ 4MB on disk, ≤ 300k triangles.** If simplify can't hit the
triangle budget without visible artifacts on the hero parts, decimate the
UPS/Orin internal components harder before touching the enclosure or the
boards' visible faces. Loaded via drei `useGLTF` with meshopt decoder.

The explode rig keys off the 7 body node names, so the script must end with a
verification step: assert all 7 names exist in the output scene graph (fail
loudly if flatten/join renamed them), and print final size, triangle count,
and draw-call estimate.

### Materials & lighting

- Clay override (sage-adjacent + ink tones from the site palette) applied by
  node name to the four enclosure/leaf bodies.
- CAD materials kept on display/Orin/UPS.
- drei `Environment` (soft studio preset) + gentle contact shadow; background
  transparent so the site's `--fi-green-100` shows through.

## Error handling

- GLB fetch failure or WebGL unavailable: the canvas quietly renders nothing
  and the copy sections remain fully readable on the sage background — the
  page never breaks the fundraising flow. (A pre-captured static render as a
  richer fallback is a follow-up, not part of this build.)
- Canvas load is behind the gate, so the 4MB asset only downloads after
  unlock.

## Testing

- Vitest: `explodeTimeline.ts` (stagger windows, vector interpolation,
  clamping at 0/1) and `useScrollProgress` mapping math.
- Manual: gate flow (locked → unlock → revisit), reduced-motion, mobile
  Safari scroll behavior.
- Lighthouse via existing `lighthouserc.js` — the page must not tank the
  site's scores (canvas is deferred, asset gated).

## Out of scope

- Final copy (Hugh writes it; placeholders ship first)
- Exploding the UPS module's 100 PCB components or the Orin dev kit
  internals — both move as rigid units
- Reusing the render on `/fundraising` proper or the homepage
