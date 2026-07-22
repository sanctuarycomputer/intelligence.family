# /fundraising/stack Annotated Layer Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder scroll story on `/fundraising/stack` with a ten-beat annotated layer tour: the trunk re-frames per beat on the sage card, paper-thin "layer" sheets build over the Orin for the software layers, and hairline technical-drawing callouts label each layer.

**Architecture:** A pure timeline module (`stackTour.ts`, unit-tested, no three.js) drives everything: beat windows/copy, camera keyframes, the open/close explode track, sheet and slab tracks, callout opacities, and model-space anchor points. `StackTourCanvas` (r3f) renders trunk + sheets and projects anchors to card-space pixels into a shared ref; `CalloutLayer` (DOM/SVG) renders hairlines, labels, and static line-art (silhouettes, Mirror rectangle, FOTA path) from that ref. The page maps `TOUR_BEATS` into the existing 8/4 sticky-card grid.

**Tech Stack:** Next.js 16 / React 19 (react-compiler lint rules), @react-three/fiber 9, drei, three 0.185, Tailwind 4, vitest.

## Global Constraints

- No em dashes anywhere in `stackTour.ts` or `page.tsx` (enforced by `tests/stack-copy.test.ts`).
- Copy is verbatim from the spec (Descent voice); never edit it.
- The locked branch of `page.tsx` (gate + h1 + fundraising copy) must not change.
- Per-frame three.js property writes must go through module-level helper functions (`mutate.ts` pattern) or method calls / component-local refs; the `react-hooks/immutability` and `react-hooks/refs` lint rules are errors. Never write `ref.current = x` during render.
- All new code passes `npx prettier --check`, `npx eslint`, `npx tsc --noEmit`, `npx vitest run` from `www/`.
- All commands run from `www/`. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Model-space facts (measured from `public/fundraising/trunk.glb`): orin center `(0.0821, 0.0075, 0.0575)` size `(0.0895, 0.0339, 0.100)`; display center `(0.0860, 0.0075, 0.1158)`; enclosure-front center `(0.0895, 0.0079, 0.1205)`; device spans x 0..0.185, y -0.04..0.06, z 0..0.17. Explode vectors come from `components/trunk/explodeTimeline.ts` (`EXPLODE_VECTORS`).

---

### Task 1: Extract `useTrunkPivots` shared hook

**Files:**
- Create: `www/components/trunk/useTrunkPivots.ts`
- Modify: `www/components/trunk/TrunkCanvas.tsx`

**Interfaces:**
- Produces: `useTrunkPivots(gltfScene: THREE.Group): { pivots: Map<BodyName, THREE.Group>; clayMaterials: THREE.MeshStandardMaterial[] }` — idempotent pivot wrapping + clay material swap + disposal effect. Task 5 consumes this.

- [ ] **Step 1: Create the hook** — move the `useMemo` pivot-wrapping block, `CLAY_COLORS`, and the disposal `useEffect` out of `TrunkCanvas.tsx` verbatim:

```ts
// www/components/trunk/useTrunkPivots.ts
'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { BODY_NAMES, type BodyName } from './explodeTimeline';

// Mixed treatment: clay brand tones on the shell bodies, original CAD
// materials on the electronics so they read as real hardware.
const CLAY_COLORS: Partial<Record<BodyName, string>> = {
  'enclosure-back': '#CAD4C6',
  'enclosure-front': '#B8C6B0',
  'enclosure-top': '#B8C6B0',
  leaf: '#5E7B29',
};

// Each body moves via a wrapper pivot, never its own node: loaders and
// quantization may store meaningful transforms on the body nodes, and
// setting their position directly would clobber those.
//
// useGLTF caches a singleton scene and StrictMode double-invokes useMemo,
// so the wrapping must be idempotent: when a body already sits inside its
// pivot, reuse that pivot (and re-collect its clay material for disposal
// tracking) instead of nesting a second pivot and minting fresh materials.
// Shared by TrunkCanvas (the gate view) and StackTourCanvas (the story),
// which mount the same cached scene at different times.
export function useTrunkPivots(gltfScene: THREE.Group): {
  pivots: Map<BodyName, THREE.Group>;
  clayMaterials: THREE.MeshStandardMaterial[];
} {
  const { pivots, clayMaterials } = useMemo(() => {
    const found = new Map<BodyName, THREE.Group>();
    const materials: THREE.MeshStandardMaterial[] = [];
    const collectClay = (obj: THREE.Object3D) => {
      obj.traverse(child => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial &&
          !materials.includes(child.material)
        ) {
          materials.push(child.material);
        }
      });
    };
    for (const name of BODY_NAMES) {
      const obj = gltfScene.getObjectByName(name);
      if (!obj || !obj.parent) continue;
      if (obj.parent.name === `${name}-pivot`) {
        found.set(name, obj.parent as THREE.Group);
        if (CLAY_COLORS[name]) collectClay(obj);
        continue;
      }
      const pivot = new THREE.Group();
      pivot.name = `${name}-pivot`;
      obj.parent.add(pivot);
      pivot.add(obj);
      found.set(name, pivot);
      if (CLAY_COLORS[name]) {
        const clay = new THREE.MeshStandardMaterial({
          color: CLAY_COLORS[name],
          roughness: 0.85,
          metalness: 0,
        });
        materials.push(clay);
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) child.material = clay;
        });
      }
    }
    return { pivots: found, clayMaterials: materials };
  }, [gltfScene]);

  // Free the clay materials' GPU resources on unmount. dispose() only drops
  // GPU-side state, so a StrictMode cleanup/re-setup cycle stays safe: three
  // re-uploads the material on its next use.
  useEffect(() => {
    return () => {
      for (const material of clayMaterials) material.dispose();
    };
  }, [clayMaterials]);

  return { pivots, clayMaterials };
}
```

- [ ] **Step 2: Refactor `TrunkCanvas.tsx`** — delete the moved code; in `TrunkModel` replace the memo with `const { pivots } = useTrunkPivots(gltfScene);` and add `import { useTrunkPivots } from './useTrunkPivots';`. Remove now-unused imports (`useMemo`, `BODY_NAMES`, `type BodyName` — keep `cameraPose`, `explodeOffset`). Everything else byte-identical.

- [ ] **Step 3: Verify**

Run: `npx prettier --write components/trunk && npx tsc --noEmit && npx eslint components/trunk && npx vitest run`
Expected: all pass, 94 tests.

- [ ] **Step 4: Commit**

```bash
git add components/trunk
git commit -m "Extract useTrunkPivots hook from TrunkCanvas for reuse by the stack tour"
```

---

### Task 2: `stackTour.ts` — beats, copy, windows

**Files:**
- Create: `www/components/stack-tour/stackTour.ts`
- Test: `www/tests/stack-tour.test.ts`

**Interfaces:**
- Produces: `TOUR_BEATS: TourBeat[]` (`{ id, label, title, paragraphs, center }`), `BEAT_COUNT = 10`, `beatCenter(i) = i / 9`, `beatIndexAt(t)`, `beatWindow(i): { start; end }` (edges at midpoints between neighbouring centers, clamped to [0,1]), `clamp01`, re-export of `smoothstep` from `../trunk/explodeTimeline`.

- [ ] **Step 1: Write failing tests**

```ts
// www/tests/stack-tour.test.ts
import { describe, it, expect } from 'vitest';
import {
  TOUR_BEATS,
  BEAT_COUNT,
  beatCenter,
  beatIndexAt,
  beatWindow,
} from '@/components/stack-tour/stackTour';

describe('tour beats', () => {
  it('has ten beats labelled LAYER 01..LAYER 10 in order', () => {
    expect(TOUR_BEATS).toHaveLength(BEAT_COUNT);
    TOUR_BEATS.forEach((b, i) => {
      expect(b.label).toBe(`LAYER ${String(i + 1).padStart(2, '0')}`);
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.paragraphs.length).toBeGreaterThan(0);
    });
  });

  it('centres beat i at i/9 and tiles windows without gaps', () => {
    expect(beatCenter(0)).toBe(0);
    expect(beatCenter(9)).toBe(1);
    expect(beatWindow(0).start).toBe(0);
    expect(beatWindow(9).end).toBe(1);
    for (let i = 1; i < BEAT_COUNT; i++) {
      expect(beatWindow(i).start).toBeCloseTo(beatWindow(i - 1).end, 10);
    }
  });

  it('maps beat centres back to their beat index', () => {
    for (let i = 0; i < BEAT_COUNT; i++) {
      expect(beatIndexAt(beatCenter(i))).toBe(i);
    }
    expect(beatIndexAt(-1)).toBe(0);
    expect(beatIndexAt(2)).toBe(9);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/stack-tour.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// www/components/stack-tour/stackTour.ts
// Pure data and math for the /fundraising/stack annotated layer tour. No
// three.js imports so it stays trivially unit-testable.
//
// NOTE: this file is covered by the em-dash lint in tests/stack-copy.test.ts.
// Keep comments and copy free of em dashes.
import { smoothstep } from '../trunk/explodeTimeline';

export { smoothstep };

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export interface TourBeat {
  id: string;
  label: string;
  title: string;
  paragraphs: string[];
}

// Copy is the approved Descent-script voice, verbatim (Hardware beat cut;
// layers renumbered 01..10). If layout needs trims, cut whole sentences.
export const TOUR_BEATS: TourBeat[] = [
  {
    id: 'runtime',
    label: 'LAYER 01',
    title: 'Application Runtime',
    paragraphs: [
      'Products are apps on a governed runtime: scrapbook, radio, archive browser. The runtime exposes a query and subscription API over the knowledge layer and enforces capability boundaries per app.',
      'Apps read derived data. They get no access to raw audio, key material, or the network.',
    ],
  },
  {
    id: 'harness',
    label: 'LAYER 02',
    title: 'Agentic Harness (Pii)',
    paragraphs: [
      'Pii orchestrates all on-device inference. Work decomposes into atomic tasks with declared contracts; each task runs against a fresh context; state lives in the plan, not the model. This is what makes small local models predictable.',
      'The model sits behind a single adapter interface: llama.cpp, ONNX Runtime, TensorRT-class runtimes. Weights ship as versioned fleet artifacts. Nothing above this layer changes when they do. No inference leaves the device.',
    ],
  },
  {
    id: 'ingestion',
    label: 'LAYER 03',
    title: 'Ingestion & Encrypted Data Sink',
    paragraphs: [
      'Capture writes through an encrypt-on-write, append-only sink. Plaintext never reaches disk, including across crashes. The sink accepts sealed chunks, acknowledges durability, and does nothing else.',
      'Transform stages run as scheduled background jobs: diarization, transcription, entity and relation extraction. Sealed input, sealed output, at every stage. Every extracted fact carries provenance back to its source chunk.',
    ],
  },
  {
    id: 'knowledge',
    label: 'LAYER 04',
    title: 'Knowledge & Blob Storage',
    paragraphs: [
      'Three stores behind one storage service. A property graph with an application-defined ontology (Person, Event, Location; RELATES_TO, HAPPENED_AT, ATTENDED). A content-addressed blob store for raw and derived media, immutable by construction. Vector and full-text indexes for retrieval.',
      'The storage service is the only path to disk. It enforces encryption at rest and emits an ordered change log, which is the input to replication.',
    ],
  },
  {
    id: 'crypto',
    label: 'LAYER 05',
    title: 'Cryptographic Core & Key Management',
    paragraphs: [
      'One key hierarchy: hardware-rooted device identity, storage keys for encryption at rest, a family keyset for group E2EE across enrolled devices, per-object content keys. Enrollment is a physical ceremony between devices. Revocation rotates the family keyset and expels the device identity.',
      'No vendor escrow exists. Recovery is a quorum of surviving devices or a printed recovery code. Lost keys are unrecoverable by design.',
    ],
  },
  {
    id: 'os',
    label: 'LAYER 06',
    title: 'OS & Platform Services',
    paragraphs: [
      'Read-only embedded Linux with a verified boot chain and dm-verity system partitions. Every service is sandboxed; parsers that handle untrusted media run in the tightest cells. A resource governor arbitrates the NPU between interactive inference and background pipelines.',
      'The disconnect switch cuts microphone power in hardware. Software can observe its state. Software cannot override it.',
    ],
  },
  {
    id: 'tee',
    label: 'LAYER 07',
    title: 'TEE & Hardware Root of Trust',
    paragraphs: [
      'Boot chain: immutable ROM, secure boot, measured boot, remote attestation. Root keys are generated inside the TEE and never leave it; the rich OS handles ciphertext and key handles only. Biometric material, voiceprints and speaker embeddings, can be sealed here as well.',
      'Attestation is the proof layer. The device demonstrates cryptographically what code it booted, to the fleet, to its peer devices, and to its owner.',
    ],
  },
  {
    id: 'gossip',
    label: 'LAYER 08',
    title: 'Replication & P2P Gossip',
    paragraphs: [
      'Every device holds a full replica. The change log replicates via CRDTs: add-wins sets for graph edges, register semantics for scalar properties, content-addressed immutable blobs. Any subset of devices that can exchange packets converges. No coordinator.',
      'Transport is anti-entropy gossip: mDNS discovery on the LAN, rendezvous over a private mesh, version-vector exchange, delta sync. It works when the VPN is up and the network behind it is not. Semantic conflicts, such as two extractions of the same person, surface as proposed, revertible merges.',
    ],
  },
  {
    id: 'mirror',
    label: 'LAYER 09',
    title: 'Opaque Mirror (Zero-Knowledge Sync Server)',
    paragraphs: [
      'Store-and-forward sync for devices that never overlap in time, plus off-site durability. The Mirror holds sealed log entries and padded blobs against opaque handles. It stores no keys, no device identities, no cleartext family state. Its complete queryable knowledge: ciphertext of certain sizes at certain times.',
      "The design follows Signal's server model: sealed-sender-style envelopes, anonymous credentials for membership proofs, attested enclaves where the server must compute. The residual leak is traffic metadata, and the threat model says so.",
    ],
  },
  {
    id: 'fota',
    label: 'LAYER 10',
    title: 'FOTA & Fleet Management',
    paragraphs: [
      'Signed A/B image updates with automatic rollback. OS images and model weights ship as separate artifact channels; after one device receives an artifact, it propagates device-to-device over the gossip transport. Fleet enrollment is gated on hardware attestation.',
      "Telemetry is health only: boot status, storage, thermals, update state. The control plane can replace a device's software. It cannot read a device's data.",
    ],
  },
];

export const BEAT_COUNT = TOUR_BEATS.length;

// Ten one-viewport sections: computeProgress spans (height - viewport), so
// section i sits vertically centred at t = i / 9.
export function beatCenter(i: number): number {
  return i / (BEAT_COUNT - 1);
}

export function beatWindow(i: number): { start: number; end: number } {
  const start = i === 0 ? 0 : (beatCenter(i - 1) + beatCenter(i)) / 2;
  const end =
    i === BEAT_COUNT - 1 ? 1 : (beatCenter(i) + beatCenter(i + 1)) / 2;
  return { start, end };
}

export function beatIndexAt(t: number): number {
  const c = clamp01(t);
  for (let i = 0; i < BEAT_COUNT; i++) {
    if (c < beatWindow(i).end) return i;
  }
  return BEAT_COUNT - 1;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/stack-tour.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/stack-tour/stackTour.ts tests/stack-tour.test.ts
git commit -m "Stack tour: beat data, copy, and scroll windows"
```

---

### Task 3: `stackTour.ts` — motion tracks (open, sheets, slab, art opacities)

**Files:**
- Modify: `www/components/stack-tour/stackTour.ts` (append)
- Test: `www/tests/stack-tour.test.ts` (append)

**Interfaces:**
- Produces: `openFactor(t): number`; `SHEET_COUNT = 4`; `SHEET_X = 0.082`, `SHEET_Z = 0.0575`, `SHEET_SLOT_Y: number[]` (`[0.115, 0.09, 0.065, 0.04]`), `SLAB_Y = 0.032`; `sheetState(i, t): { y: number; opacity: number }`; `slabOpacity(t): number`; `calloutPhase(beat: number, t: number): { opacity: number; draw: number }`; `silhouetteOpacity(t)`, `mirrorArtOpacity(t)`, `fotaArtOpacity(t)`.

- [ ] **Step 1: Append failing tests**

```ts
// append to www/tests/stack-tour.test.ts
import {
  openFactor,
  sheetState,
  slabOpacity,
  calloutPhase,
  silhouetteOpacity,
  mirrorArtOpacity,
  fotaArtOpacity,
  SHEET_COUNT,
  SHEET_SLOT_Y,
  SLAB_Y,
} from '@/components/stack-tour/stackTour';

describe('motion tracks', () => {
  it('opens for beats 02-07 and closes again by beat 08', () => {
    expect(openFactor(beatCenter(0))).toBe(0);
    for (let i = 1; i <= 6; i++) expect(openFactor(beatCenter(i))).toBe(1);
    expect(openFactor(beatCenter(7))).toBe(0);
    expect(openFactor(1)).toBe(0);
  });

  it('materializes each sheet at its own beat and not before', () => {
    for (let s = 0; s < SHEET_COUNT; s++) {
      const beat = s + 1; // sheet s belongs to beat index s+1 (LAYER 02..05)
      expect(sheetState(s, beatCenter(beat)).opacity).toBe(1);
      expect(sheetState(s, beatCenter(beat)).y).toBeCloseTo(SHEET_SLOT_Y[s], 6);
      expect(sheetState(s, beatCenter(beat - 1)).opacity).toBe(0);
    }
  });

  it('earlier sheets dim once their beat has passed', () => {
    const atCrypto = sheetState(0, beatCenter(4));
    expect(atCrypto.opacity).toBeGreaterThan(0);
    expect(atCrypto.opacity).toBeLessThan(1);
  });

  it('consolidates sheets into the slab at beat 06 and dissipates by 07', () => {
    const osT = beatCenter(5);
    for (let s = 0; s < SHEET_COUNT; s++) {
      expect(sheetState(s, osT).y).toBeCloseTo(SLAB_Y, 6);
      expect(sheetState(s, osT).opacity).toBe(0);
    }
    expect(slabOpacity(osT)).toBe(1);
    expect(slabOpacity(beatCenter(6))).toBe(0);
    for (let s = 0; s < SHEET_COUNT; s++) {
      expect(sheetState(s, beatCenter(6)).opacity).toBe(0);
    }
  });

  it('callout phases peak inside their own beat and are dark outside', () => {
    for (let i = 0; i < BEAT_COUNT; i++) {
      expect(calloutPhase(i, beatCenter(i)).opacity).toBe(1);
      expect(calloutPhase(i, beatCenter(i)).draw).toBe(1);
      if (i > 0) expect(calloutPhase(i, beatCenter(i - 1)).opacity).toBe(0);
      if (i < 9) expect(calloutPhase(i, beatCenter(i + 1)).opacity).toBe(0);
    }
  });

  it('static art tracks belong to their beats', () => {
    expect(silhouetteOpacity(beatCenter(7))).toBe(1);
    expect(silhouetteOpacity(beatCenter(6))).toBe(0);
    expect(silhouetteOpacity(beatCenter(8))).toBe(0);
    expect(mirrorArtOpacity(beatCenter(8))).toBe(1);
    expect(mirrorArtOpacity(beatCenter(7))).toBe(0);
    expect(fotaArtOpacity(beatCenter(9))).toBe(1);
    expect(fotaArtOpacity(beatCenter(8))).toBe(0);
  });
});
```

(Merge the import block with the existing one at the top of the test file.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/stack-tour.test.ts`
Expected: FAIL (exports missing).

- [ ] **Step 3: Implement** — append to `stackTour.ts`:

```ts
// ---------- Motion tracks ----------
// Beat centres for reference: 01 at 0, 02 at 0.111, 03 at 0.222, 04 at
// 0.333, 05 at 0.444, 06 at 0.556, 07 at 0.667, 08 at 0.778, 09 at 0.889,
// 10 at 1.

// Top, leaf, front, and display travel along their EXPLODE_VECTORS by this
// factor: the trunk opens on the way into beat 02 and closes again on the
// way into beat 08.
export function openFactor(t: number): number {
  return smoothstep(0.06, 0.105, t) * (1 - smoothstep(0.7, 0.75, t));
}

export const SHEET_COUNT = 4;
export const SHEET_X = 0.082;
export const SHEET_Z = 0.0575;
// Slots above the orin (top of module at y 0.0245), highest first: the
// stack grows downward, toward silicon.
export const SHEET_SLOT_Y = [0.115, 0.09, 0.065, 0.04];
export const SLAB_Y = 0.032;

// A dim step once a sheet's own beat has passed.
const SHEET_DIM = 0.45;
// Consolidation completes just before beat 06's centre (0.556), so the
// slab is whole while its copy is up.
const CONSOLIDATE_START = 0.49;
const CONSOLIDATE_END = 0.545;
// The slab dissipates early in beat 07's window.
const DISSIPATE_START = 0.6;
const DISSIPATE_END = 0.645;

export function sheetState(
  sheet: number,
  t: number
): { y: number; opacity: number } {
  const beat = sheet + 1; // sheet 0 belongs to LAYER 02 (index 1)
  const c = beatCenter(beat);
  // Materialize: fade in with a small settle from above the slot.
  const appear = smoothstep(c - 0.06, c - 0.015, t);
  const settle = SHEET_SLOT_Y[sheet] + 0.03 * (1 - appear);
  // Dim once the next beat's centre arrives.
  const dim = smoothstep(beatCenter(beat) + 0.02, beatCenter(beat + 1), t);
  // Consolidate: glide to the slab position and hand off to the slab mesh.
  const consolidate = smoothstep(CONSOLIDATE_START, CONSOLIDATE_END, t);
  const y = settle + (SLAB_Y - settle) * consolidate;
  const opacity =
    appear * (1 - dim * (1 - SHEET_DIM)) * (1 - consolidate);
  return { y, opacity: clamp01(opacity) };
}

export function slabOpacity(t: number): number {
  return (
    smoothstep(CONSOLIDATE_START + 0.03, CONSOLIDATE_END, t) *
    (1 - smoothstep(DISSIPATE_START, DISSIPATE_END, t))
  );
}

// Hairline callouts: draw in just before the beat centre, fade out toward
// the window edges.
export function calloutPhase(
  beat: number,
  t: number
): { opacity: number; draw: number } {
  const c = beatCenter(beat);
  const rise =
    beat === 0 ? 1 : smoothstep(c - 0.05, c - 0.02, t);
  const fall =
    beat === BEAT_COUNT - 1 ? 1 : 1 - smoothstep(c + 0.02, c + 0.05, t);
  const opacity = clamp01(Math.min(rise, fall));
  const draw = beat === 0 ? 1 : smoothstep(c - 0.055, c - 0.005, t);
  return { opacity, draw: clamp01(Math.min(draw, fall > 0 ? 1 : 0)) };
}

// Static line-art opacities, one per fabric beat.
function beatArt(beat: number, t: number): number {
  const c = beatCenter(beat);
  const rise = smoothstep(c - 0.05, c - 0.02, t);
  const fall =
    beat === BEAT_COUNT - 1 ? 1 : 1 - smoothstep(c + 0.02, c + 0.05, t);
  return clamp01(Math.min(rise, fall));
}

export function silhouetteOpacity(t: number): number {
  return beatArt(7, t);
}
export function mirrorArtOpacity(t: number): number {
  return beatArt(8, t);
}
export function fotaArtOpacity(t: number): number {
  return beatArt(9, t);
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/stack-tour.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/stack-tour/stackTour.ts tests/stack-tour.test.ts
git commit -m "Stack tour: open, sheet, slab, and callout motion tracks"
```

---

### Task 4: `stackTour.ts` — camera, anchors, callout definitions

**Files:**
- Modify: `www/components/stack-tour/stackTour.ts` (append)
- Test: `www/tests/stack-tour.test.ts` (append)

**Interfaces:**
- Produces: `TourPose { position: Vec3; target: Vec3 }`; `tourCameraPose(t): TourPose`; `AnchorId` union; `anchorWorld(id: AnchorId, t: number): Vec3` (accounts for explode offsets and sheet y); `AnchorScreenPoint { x; y; visible }`; `AnchorScreenMap = Partial<Record<AnchorId, AnchorScreenPoint>>`; `TourCallout { beat; anchor; label; dx; dy }`; `TOUR_CALLOUTS: TourCallout[]`.

- [ ] **Step 1: Append failing tests**

```ts
// append to www/tests/stack-tour.test.ts
import {
  tourCameraPose,
  anchorWorld,
  TOUR_CALLOUTS,
} from '@/components/stack-tour/stackTour';

describe('camera and anchors', () => {
  it('returns finite poses with no cuts anywhere', () => {
    let prev = tourCameraPose(0);
    for (let t = 0.001; t <= 1.0001; t += 0.001) {
      const pose = tourCameraPose(Math.min(1, t));
      for (const v of [...pose.position, ...pose.target]) {
        expect(Number.isFinite(v)).toBe(true);
      }
      const jump = Math.hypot(
        pose.position[0] - prev.position[0],
        pose.position[1] - prev.position[1],
        pose.position[2] - prev.position[2]
      );
      expect(jump).toBeLessThan(0.02);
      prev = pose;
    }
  });

  it('dives closest at the TEE beat', () => {
    const dist = (t: number) => {
      const p = tourCameraPose(t);
      return Math.hypot(
        p.position[0] - p.target[0],
        p.position[1] - p.target[1],
        p.position[2] - p.target[2]
      );
    };
    const teeDist = dist(beatCenter(6));
    for (const i of [0, 1, 2, 3, 4, 5, 7, 8, 9]) {
      expect(teeDist).toBeLessThan(dist(beatCenter(i)));
    }
  });

  it('anchors move with the open factor and sheet tracks', () => {
    // Display carries its explode offset when open (beat 02) and returns
    // home when closed (beat 08).
    const open = anchorWorld('display', beatCenter(1));
    const closed = anchorWorld('display', beatCenter(7));
    expect(open[2]).toBeCloseTo(0.1158 + 0.1, 3);
    expect(closed[2]).toBeCloseTo(0.1158, 3);
    // Sheet anchors ride their slots.
    expect(anchorWorld('sheet0', beatCenter(1))[1]).toBeCloseTo(0.115, 3);
    expect(anchorWorld('slab', beatCenter(5))[1]).toBeCloseTo(0.032, 3);
  });

  it('every callout points at a defined anchor within a valid beat', () => {
    for (const c of TOUR_CALLOUTS) {
      expect(c.beat).toBeGreaterThanOrEqual(0);
      expect(c.beat).toBeLessThan(BEAT_COUNT);
      expect(c.label.length).toBeGreaterThan(0);
      expect(() => anchorWorld(c.anchor, 0.5)).not.toThrow();
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/stack-tour.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement** — append to `stackTour.ts`:

```ts
// ---------- Camera ----------
import { EXPLODE_VECTORS, type Vec3 } from '../trunk/explodeTimeline';

export interface TourPose {
  position: Vec3;
  target: Vec3;
}

// Time-keyed keyframes at beat centres (native model coordinates; device
// centre is roughly [0.09, 0.02, 0.085]). Eased with smoothstep between
// neighbours; the aspect dolly in the canvas keeps narrow screens framed.
const CAMERA_KEYFRAMES: { t: number; pose: TourPose }[] = [
  // 01 hero: assembled, front three-quarter, screen prominent.
  { t: 0, pose: { position: [0.34, 0.16, 0.46], target: [0.09, 0.02, 0.085] } },
  // 02 over the opened cavity: orin + the first sheet.
  {
    t: 1 / 9,
    pose: { position: [0.1, 0.17, 0.29], target: [0.082, 0.07, 0.058] },
  },
  // 03 orbit right, slightly closer.
  {
    t: 2 / 9,
    pose: { position: [0.21, 0.14, 0.24], target: [0.082, 0.065, 0.058] },
  },
  // 04 orbit to the left side.
  {
    t: 3 / 9,
    pose: { position: [-0.03, 0.13, 0.22], target: [0.082, 0.06, 0.058] },
  },
  // 05 lower and closer: the lowest sheet, just off the silicon.
  {
    t: 4 / 9,
    pose: { position: [0.09, 0.1, 0.2], target: [0.082, 0.045, 0.058] },
  },
  // 06 pull back wide enough to include the floated front panel.
  {
    t: 5 / 9,
    pose: { position: [0.14, 0.13, 0.42], target: [0.085, 0.05, 0.1] },
  },
  // 07 the dive: orin fills the card.
  {
    t: 6 / 9,
    pose: { position: [0.11, 0.05, 0.14], target: [0.082, 0.0075, 0.0575] },
  },
  // 08 reassembled; target shifted +x so the trunk sits left-of-card.
  {
    t: 7 / 9,
    pose: { position: [0.4, 0.14, 0.52], target: [0.14, 0.02, 0.085] },
  },
  // 09 small and low: target above the device pushes it down-frame.
  {
    t: 8 / 9,
    pose: { position: [0.42, 0.2, 0.62], target: [0.09, 0.1, 0.085] },
  },
  // 10 settled hero.
  { t: 1, pose: { position: [0.36, 0.16, 0.48], target: [0.09, 0.02, 0.085] } },
];

function lerpVec(a: Vec3, b: Vec3, p: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * p,
    a[1] + (b[1] - a[1]) * p,
    a[2] + (b[2] - a[2]) * p,
  ];
}

export function tourCameraPose(t: number): TourPose {
  const c = clamp01(t);
  if (c >= 1) return CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].pose;
  let i = 0;
  while (c >= CAMERA_KEYFRAMES[i + 1].t) i++;
  const a = CAMERA_KEYFRAMES[i];
  const b = CAMERA_KEYFRAMES[i + 1];
  const p = smoothstep(a.t, b.t, c);
  return {
    position: lerpVec(a.pose.position, b.pose.position, p),
    target: lerpVec(a.pose.target, b.pose.target, p),
  };
}

// ---------- Anchors and callouts ----------

export type AnchorId =
  | 'display'
  | 'orin'
  | 'front'
  | 'trunk'
  | 'slab'
  | 'sheet0'
  | 'sheet1'
  | 'sheet2'
  | 'sheet3';

// Measured body centres (see the optimize script's world-baked geometry).
const DISPLAY_CENTER: Vec3 = [0.086, 0.0075, 0.1158];
const FRONT_CENTER: Vec3 = [0.0895, 0.0079, 0.1205];
const ORIN_CENTER: Vec3 = [0.0821, 0.0075, 0.0575];
const TRUNK_CENTER: Vec3 = [0.09, 0.01, 0.085];

export function anchorWorld(id: AnchorId, t: number): Vec3 {
  const open = openFactor(t);
  switch (id) {
    case 'display': {
      const v = EXPLODE_VECTORS.display;
      return [
        DISPLAY_CENTER[0] + v[0] * open,
        DISPLAY_CENTER[1] + v[1] * open,
        DISPLAY_CENTER[2] + v[2] * open,
      ];
    }
    case 'front': {
      const v = EXPLODE_VECTORS['enclosure-front'];
      return [
        FRONT_CENTER[0] + v[0] * open,
        FRONT_CENTER[1] + v[1] * open,
        FRONT_CENTER[2] + v[2] * open,
      ];
    }
    case 'orin':
      return ORIN_CENTER;
    case 'trunk':
      return TRUNK_CENTER;
    case 'slab':
      return [SHEET_X, SLAB_Y, SHEET_Z];
    default: {
      const sheet = Number(id.slice(5));
      return [SHEET_X, sheetState(sheet, t).y, SHEET_Z];
    }
  }
}

export interface AnchorScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}
export type AnchorScreenMap = Partial<Record<AnchorId, AnchorScreenPoint>>;

export interface TourCallout {
  beat: number;
  anchor: AnchorId;
  label: string;
  // Label offset from the projected anchor, in card px.
  dx: number;
  dy: number;
}

export const TOUR_CALLOUTS: TourCallout[] = [
  { beat: 0, anchor: 'display', label: 'VOICE · TACTILE · SCREEN', dx: -170, dy: -90 },
  { beat: 1, anchor: 'sheet0', label: 'PII · LOCAL INFERENCE ONLY', dx: 150, dy: -70 },
  { beat: 2, anchor: 'sheet1', label: 'CAPTURE → SEALED CHUNKS', dx: -190, dy: -80 },
  { beat: 3, anchor: 'sheet2', label: 'GRAPH · BLOBS · INDEXES', dx: 150, dy: -70 },
  { beat: 4, anchor: 'sheet3', label: 'KEYS ARE MINTED HERE. THEY NEVER LEAVE.', dx: 130, dy: -90 },
  { beat: 5, anchor: 'slab', label: 'ONE GOVERNED IMAGE · VERIFIED BOOT', dx: -200, dy: -70 },
  { beat: 5, anchor: 'front', label: 'DISCONNECT SWITCH · HARDWARE TRUTH', dx: 120, dy: 80 },
  { beat: 6, anchor: 'orin', label: 'ROOT OF TRUST', dx: -150, dy: -110 },
  { beat: 7, anchor: 'trunk', label: 'VERSION VECTORS · NO COORDINATOR', dx: -140, dy: 120 },
  { beat: 9, anchor: 'trunk', label: 'SIGNED A/B IMAGES · MODEL WEIGHTS', dx: -160, dy: -120 },
];
```

Note: `import` lines must live at the top of the file with the existing import; move the `EXPLODE_VECTORS, type Vec3` names into the first import from `'../trunk/explodeTimeline'`.

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/stack-tour.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify module hygiene**

Run: `npx prettier --write components/stack-tour tests/stack-tour.test.ts && npx eslint components/stack-tour tests/stack-tour.test.ts && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add components/stack-tour/stackTour.ts tests/stack-tour.test.ts
git commit -m "Stack tour: camera keyframes, anchor projection data, callout definitions"
```

---

### Task 5: `StackTourCanvas` + `mutate.ts`

**Files:**
- Create: `www/components/stack-tour/mutate.ts`
- Create: `www/components/stack-tour/StackTourCanvas.tsx`

**Interfaces:**
- Consumes: `useTrunkPivots` (Task 1); everything from `stackTour.ts` (Tasks 2-4).
- Produces: `StackTourCanvas({ storyElementId, reducedMotion, anchorsRef }: { storyElementId: string; reducedMotion: boolean; anchorsRef: RefObject<AnchorScreenMap> })` default export. Writes projected anchor positions into `anchorsRef.current` every frame. Task 7 consumes.

- [ ] **Step 1: Create `mutate.ts`**

```ts
// www/components/stack-tour/mutate.ts
// Imperative per-frame writes to three.js objects, kept in module-level
// helpers: the react-hooks/immutability rule (correctly) forbids mutating
// memoized values inside hook callbacks, and r3f frame loops are the
// sanctioned exception. Funnelling the writes through here keeps the rule
// meaningful everywhere else.
export function assign<T extends object>(target: T, patch: Partial<T>): void {
  Object.assign(target, patch);
}

export function setVisible(
  object: { visible: boolean } | null,
  visible: boolean
): void {
  if (object) object.visible = visible;
}
```

- [ ] **Step 2: Create `StackTourCanvas.tsx`**

```tsx
// www/components/stack-tour/StackTourCanvas.tsx
'use client';

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EXPLODE_VECTORS } from '../trunk/explodeTimeline';
import { useScrollProgress } from '../trunk/useScrollProgress';
import { useTrunkPivots } from '../trunk/useTrunkPivots';
import {
  anchorWorld,
  beatCenter,
  beatIndexAt,
  openFactor,
  sheetState,
  slabOpacity,
  tourCameraPose,
  SHEET_COUNT,
  SHEET_X,
  SHEET_Z,
  SLAB_Y,
  type AnchorId,
  type AnchorScreenMap,
} from './stackTour';
import { assign } from './mutate';

const MODEL_URL = '/fundraising/trunk.glb';
const SMOOTHING = 0.08;

const OPEN_BODIES = [
  'enclosure-top',
  'leaf',
  'enclosure-front',
  'display',
] as const;

const ANCHOR_IDS: AnchorId[] = [
  'display',
  'orin',
  'front',
  'trunk',
  'slab',
  'sheet0',
  'sheet1',
  'sheet2',
  'sheet3',
];

// Procedural environment lighting: no network fetch, unlike drei's
// <Environment preset>, which pulls HDRs from a CDN.
function ProceduralEnvironment() {
  const get = useThree(s => s.get);
  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      scene.environment = null;
      tex.dispose();
      pmrem.dispose();
    };
  }, [get]);
  return null;
}

function TourScene({
  storyElementId,
  reducedMotion,
  anchorsRef,
}: {
  storyElementId: string;
  reducedMotion: boolean;
  anchorsRef: RefObject<AnchorScreenMap>;
}) {
  const { scene: gltfScene } = useGLTF(MODEL_URL);
  const { pivots } = useTrunkPivots(gltfScene);
  const progressRef = useScrollProgress(storyElementId);
  const smoothed = useRef(0);
  const camera = useThree(s => s.camera);
  const sheetRefs = useRef<(THREE.Group | null)[]>([]);
  const slabRef = useRef<THREE.Group>(null);

  // Paper-thin frosted sheets plus their hairline edges. One material pair
  // per sheet so opacities animate independently.
  const sheetMats = useMemo(
    () =>
      Array.from({ length: SHEET_COUNT }, () => ({
        face: new THREE.MeshPhysicalMaterial({
          color: '#EDF1EA',
          roughness: 0.7,
          transmission: 0.35,
          thickness: 0.002,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
        edge: new THREE.LineBasicMaterial({
          color: '#596647',
          transparent: true,
          opacity: 0,
        }),
      })),
    []
  );
  const slabMats = useMemo(
    () => ({
      face: new THREE.MeshPhysicalMaterial({
        color: '#EDF1EA',
        roughness: 0.7,
        transmission: 0.35,
        thickness: 0.004,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      edge: new THREE.LineBasicMaterial({
        color: '#596647',
        transparent: true,
        opacity: 0,
      }),
    }),
    []
  );
  const sheetGeo = useMemo(() => new THREE.BoxGeometry(0.1, 0.001, 0.085), []);
  const sheetEdgeGeo = useMemo(() => new THREE.EdgesGeometry(sheetGeo), [sheetGeo]);
  const slabGeo = useMemo(() => new THREE.BoxGeometry(0.1, 0.004, 0.085), []);
  const slabEdgeGeo = useMemo(() => new THREE.EdgesGeometry(slabGeo), [slabGeo]);
  const projScratch = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    return () => {
      for (const m of sheetMats) {
        m.face.dispose();
        m.edge.dispose();
      }
      slabMats.face.dispose();
      slabMats.edge.dispose();
      sheetGeo.dispose();
      sheetEdgeGeo.dispose();
      slabGeo.dispose();
      slabEdgeGeo.dispose();
    };
  }, [sheetMats, slabMats, sheetGeo, sheetEdgeGeo, slabGeo, slabEdgeGeo]);

  useFrame(state => {
    const raw = progressRef.current;
    const target = reducedMotion ? beatCenter(beatIndexAt(raw)) : raw;
    smoothed.current = reducedMotion
      ? target
      : smoothed.current + (target - smoothed.current) * SMOOTHING;
    const t = smoothed.current;
    const time = state.clock.elapsedTime;

    // Open and close the shell.
    const open = openFactor(t);
    for (const name of OPEN_BODIES) {
      const pivot = pivots.get(name);
      if (!pivot) continue;
      const v = EXPLODE_VECTORS[name];
      pivot.position.set(v[0] * open, v[1] * open, v[2] * open);
    }

    // Sheets and slab.
    const bob = reducedMotion ? 0 : Math.sin(time * 1.1) * 0.0015;
    for (let s = 0; s < SHEET_COUNT; s++) {
      const g = sheetRefs.current[s];
      if (!g) continue;
      const st = sheetState(s, t);
      g.position.set(SHEET_X, st.y + bob * (1 + s * 0.3), SHEET_Z);
      g.visible = st.opacity > 0.001;
      assign(sheetMats[s].face, { opacity: st.opacity * 0.85 });
      assign(sheetMats[s].edge, { opacity: st.opacity });
    }
    const slab = slabRef.current;
    const slabO = slabOpacity(t);
    if (slab) {
      slab.position.set(SHEET_X, SLAB_Y + bob, SHEET_Z);
      slab.visible = slabO > 0.001;
    }
    assign(slabMats.face, { opacity: slabO * 0.9 });
    assign(slabMats.edge, { opacity: slabO });

    // Camera: keyframed pose with the aspect dolly from TrunkCanvas.
    const pose = tourCameraPose(t);
    const { width, height } = state.size;
    const aspect = width / height;
    const REF_ASPECT = 1.6;
    const dolly = Math.min(1.8, Math.max(1, REF_ASPECT / aspect));
    const px = pose.target[0] + (pose.position[0] - pose.target[0]) * dolly;
    const py = pose.target[1] + (pose.position[1] - pose.target[1]) * dolly;
    const pz = pose.target[2] + (pose.position[2] - pose.target[2]) * dolly;
    camera.position.set(px, py, pz);
    camera.lookAt(...pose.target);

    // Project anchors into card-space pixels for the callout layer.
    const map = anchorsRef.current;
    if (map) {
      for (const id of ANCHOR_IDS) {
        const [wx, wy, wz] = anchorWorld(id, t);
        projScratch.set(wx, wy, wz).project(camera);
        const sx = (projScratch.x * 0.5 + 0.5) * width;
        const sy = (1 - (projScratch.y * 0.5 + 0.5)) * height;
        const visible =
          projScratch.z < 1 &&
          sx >= -40 &&
          sx <= width + 40 &&
          sy >= -40 &&
          sy <= height + 40;
        // Both branches funnel through assign(): map hangs off a prop ref,
        // and the immutability rule rejects direct writes through it.
        const entry = map[id];
        if (entry) {
          assign(entry, { x: sx, y: sy, visible });
        } else {
          assign(map, { [id]: { x: sx, y: sy, visible } });
        }
      }
    }
  });

  return (
    <group>
      <primitive object={gltfScene} />
      {Array.from({ length: SHEET_COUNT }, (_, s) => (
        <group
          key={s}
          visible={false}
          ref={g => {
            sheetRefs.current[s] = g;
          }}
        >
          <mesh geometry={sheetGeo} material={sheetMats[s].face} />
          <lineSegments geometry={sheetEdgeGeo} material={sheetMats[s].edge} />
        </group>
      ))}
      <group ref={slabRef} visible={false}>
        <mesh geometry={slabGeo} material={slabMats.face} />
        <lineSegments geometry={slabEdgeGeo} material={slabMats.edge} />
      </group>
    </group>
  );
}

// A broken canvas must never break the fundraising flow: on any render
// error the copy column still reads on the sage card.
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error('StackTourCanvas failed to render:', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function StackTourCanvas({
  storyElementId,
  reducedMotion,
  anchorsRef,
}: {
  storyElementId: string;
  reducedMotion: boolean;
  anchorsRef: RefObject<AnchorScreenMap>;
}) {
  return (
    // Fills the positioned viewer card, exactly like TrunkCanvas.
    <div className="absolute inset-0" aria-hidden="true">
      <CanvasErrorBoundary>
        <Canvas
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
          camera={{ fov: 35, near: 0.01, far: 10 }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
          }}
        >
          <Suspense fallback={null}>
            <ProceduralEnvironment />
            <TourScene
              storyElementId={storyElementId}
              reducedMotion={reducedMotion}
              anchorsRef={anchorsRef}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
```

- [ ] **Step 3: Verify**

Run: `npx prettier --write components/stack-tour && npx tsc --noEmit && npx eslint components/stack-tour`
Expected: clean. If `react-hooks/immutability` flags `g.visible = ...` or `slab.visible = ...` (component-local refs are normally allowed), route those two writes through `setVisible` from `./mutate` instead.

- [ ] **Step 4: Commit**

```bash
git add components/stack-tour
git commit -m "Stack tour: r3f canvas with sheets, slab, camera, and anchor projection"
```

---

### Task 6: `CalloutLayer`

**Files:**
- Create: `www/components/stack-tour/CalloutLayer.tsx`

**Interfaces:**
- Consumes: `TOUR_CALLOUTS`, `calloutPhase`, `silhouetteOpacity`, `mirrorArtOpacity`, `fotaArtOpacity`, `beatCenter`, `beatIndexAt`, `AnchorScreenMap` from `stackTour.ts`; `useScrollProgress`.
- Produces: `CalloutLayer({ storyElementId, reducedMotion, anchorsRef })` default export: absolutely-positioned overlay inside the card.

- [ ] **Step 1: Create the component**

```tsx
// www/components/stack-tour/CalloutLayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useScrollProgress } from '../trunk/useScrollProgress';
import {
  beatCenter,
  beatIndexAt,
  calloutPhase,
  fotaArtOpacity,
  mirrorArtOpacity,
  silhouetteOpacity,
  TOUR_CALLOUTS,
  type AnchorScreenMap,
} from './stackTour';

const SMOOTHING = 0.08;
const INK = '#313131';

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontVariationSettings: "'MONO' 100",
  fontSize: '11px',
  letterSpacing: '0.12em',
  color: INK,
  whiteSpace: 'nowrap',
};

// A simple side-profile trunk wedge for the line-art silhouettes.
const WEDGE_PATH = 'M10 62 L24 16 Q25 12 30 12 L82 12 Q87 12 88 17 L91 62 Q91 67 85 67 L15 67 Q10 67 10 62 Z';

// Hairline callouts and static technical-drawing art, drawn over the
// canvas. Anchor positions arrive per-frame from StackTourCanvas through
// anchorsRef; everything else is percent-positioned static SVG.
export default function CalloutLayer({
  storyElementId,
  reducedMotion,
  anchorsRef,
}: {
  storyElementId: string;
  reducedMotion: boolean;
  anchorsRef: React.RefObject<AnchorScreenMap>;
}) {
  const progressRef = useScrollProgress(storyElementId);
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let raf = 0;
    let smoothed = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const raw = progressRef.current;
      const target = reducedMotion ? beatCenter(beatIndexAt(raw)) : raw;
      smoothed = reducedMotion
        ? target
        : smoothed + (target - smoothed) * SMOOTHING;
      const t = smoothed;
      const map = anchorsRef.current ?? {};

      TOUR_CALLOUTS.forEach((c, i) => {
        const group = groupRefs.current[i];
        const line = lineRefs.current[i];
        const label = labelRefs.current[i];
        if (!group || !line || !label) return;
        const phase = calloutPhase(c.beat, t);
        const anchor = map[c.anchor];
        const on = phase.opacity > 0.01 && !!anchor?.visible;
        group.style.opacity = on ? String(phase.opacity) : '0';
        if (!on || !anchor) return;
        // Elbow: anchor -> horizontal step -> label edge.
        const lx = anchor.x + c.dx;
        const ly = anchor.y + c.dy;
        const elbowX = anchor.x + c.dx * 0.55;
        line.setAttribute(
          'points',
          `${anchor.x},${anchor.y} ${elbowX},${ly} ${lx},${ly}`
        );
        const len = Math.hypot(elbowX - anchor.x, ly - anchor.y) + Math.abs(lx - elbowX);
        line.style.strokeDasharray = String(len);
        line.style.strokeDashoffset = String(len * (1 - phase.draw));
        label.style.transform = `translate(${lx + (c.dx >= 0 ? 8 : -8)}px, ${ly}px) translate(${c.dx >= 0 ? '0' : '-100%'}, -50%)`;
      });

      const arts: [string, number][] = [
        ['silhouette', silhouetteOpacity(t)],
        ['mirror', mirrorArtOpacity(t)],
        ['fota', fotaArtOpacity(t)],
      ];
      for (const [key, opacity] of arts) {
        const el = artRefs.current[key];
        if (el) el.style.opacity = String(opacity);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, anchorsRef, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Projected hairline callouts. */}
      {TOUR_CALLOUTS.map((c, i) => (
        <div
          key={`${c.beat}-${c.anchor}`}
          ref={el => {
            groupRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ opacity: 0 }}
        >
          <svg className="absolute inset-0 h-full w-full">
            <polyline
              ref={el => {
                lineRefs.current[i] = el;
              }}
              fill="none"
              stroke={INK}
              strokeWidth="1"
              points="0,0"
            />
          </svg>
          <div
            ref={el => {
              labelRefs.current[i] = el;
            }}
            className="absolute left-0 top-0"
            style={LABEL_STYLE}
          >
            {c.label}
          </div>
        </div>
      ))}

      {/* Beat 08: two line-art trunk silhouettes + gossip arcs. */}
      <div
        ref={el => {
          artRefs.current.silhouette = el;
        }}
        className="absolute inset-0"
        style={{ opacity: 0 }}
      >
        <svg
          className="absolute"
          style={{ right: '8%', top: '30%', width: '34%', height: '40%' }}
          viewBox="0 0 240 120"
          fill="none"
        >
          <g stroke={INK} strokeWidth="1">
            <g transform="translate(20 10) scale(0.9)">
              <path d={WEDGE_PATH} />
            </g>
            <g transform="translate(140 40) scale(0.75)">
              <path d={WEDGE_PATH} />
            </g>
            {/* Gossip arcs, both directions. */}
            <path d="M-40 70 Q30 8 48 42" strokeDasharray="3 4" />
            <path d="M96 46 Q140 18 168 62" strokeDasharray="3 4" />
            <path d="M-30 95 Q90 130 160 100" strokeDasharray="3 4" />
          </g>
        </svg>
      </div>

      {/* Beat 09: the Mirror rectangle, one-way line rising. */}
      <div
        ref={el => {
          artRefs.current.mirror = el;
        }}
        className="absolute inset-0"
        style={{ opacity: 0 }}
      >
        <svg
          className="absolute"
          style={{ left: '34%', top: '6%', width: '32%', height: '66%' }}
          viewBox="0 0 200 300"
          fill="none"
        >
          <g stroke={INK} strokeWidth="1">
            <rect x="70" y="8" width="60" height="84" rx="4" />
            <path d="M100 292 L100 108" strokeDasharray="3 4" />
            <path d="M94 116 L100 104 L106 116" />
          </g>
        </svg>
        <div
          className="absolute"
          style={{ ...LABEL_STYLE, left: '52%', top: '4%' }}
        >
          THE MIRROR · CIPHERTEXT ONLY
        </div>
      </div>

      {/* Beat 10: FOTA path in from the card edge, faint return tick. */}
      <div
        ref={el => {
          artRefs.current.fota = el;
        }}
        className="absolute inset-0"
        style={{ opacity: 0 }}
      >
        <svg
          className="absolute"
          style={{ left: 0, top: '34%', width: '40%', height: '32%' }}
          viewBox="0 0 300 160"
          fill="none"
        >
          <g stroke={INK} strokeWidth="1">
            <path d="M0 60 H180 Q200 60 210 78 L232 112" />
            <path d="M224 100 L232 112 L218 112" />
            <path d="M210 130 Q120 150 0 120" strokeDasharray="2 5" opacity="0.5" />
          </g>
        </svg>
        <div
          className="absolute"
          style={{ ...LABEL_STYLE, left: '3%', top: '30%' }}
        >
          SIGNED A/B IMAGES · MODEL WEIGHTS
        </div>
        <div
          className="absolute"
          style={{ ...LABEL_STYLE, left: '3%', top: '64%', opacity: 0.6 }}
        >
          HEALTH ONLY
        </div>
      </div>
    </div>
  );
}
```

Note: the `beat 9` projected callout in `TOUR_CALLOUTS` and the fota static labels overlap in intent; the projected one carries the label to the trunk, the static art carries the path. Keep both; the visual pass may drop one.

- [ ] **Step 2: Verify**

Run: `npx prettier --write components/stack-tour && npx tsc --noEmit && npx eslint components/stack-tour`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/stack-tour/CalloutLayer.tsx
git commit -m "Stack tour: hairline callout layer with silhouettes, Mirror, and FOTA art"
```

---

### Task 7: Page integration + copy-contract test update

**Files:**
- Modify: `www/app/fundraising/stack/page.tsx`
- Modify: `www/tests/stack-copy.test.ts`

**Interfaces:**
- Consumes: `StackTourCanvas`, `CalloutLayer`, `TOUR_BEATS`, `AnchorScreenMap`.

- [ ] **Step 1: Update the copy-contract test first**

Replace the `covers all seven hardware beats` and `marks placeholder beats` tests; extend the em-dash rule to the tour module:

```ts
// www/tests/stack-copy.test.ts  (full file)
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { TOUR_BEATS } from '@/components/stack-tour/stackTour';

const read = (rel: string) =>
  readFileSync(path.join(__dirname, '..', rel), 'utf8');

const page = read('app/fundraising/stack/page.tsx');
const layout = read('app/fundraising/stack/layout.tsx');
const tour = read('components/stack-tour/stackTour.ts');
const fundraisingPage = read('app/fundraising/page.tsx');

describe('stack page contract', () => {
  it('contains no em dashes in copy', () => {
    expect(page).not.toMatch(/—/);
    expect(layout).not.toMatch(/—/);
    expect(tour).not.toMatch(/—/);
  });

  it('covers all ten layer beats of the tour', () => {
    const titles = TOUR_BEATS.map(b => b.title);
    expect(titles).toEqual([
      'Application Runtime',
      'Agentic Harness (Pii)',
      'Ingestion & Encrypted Data Sink',
      'Knowledge & Blob Storage',
      'Cryptographic Core & Key Management',
      'OS & Platform Services',
      'TEE & Hardware Root of Trust',
      'Replication & P2P Gossip',
      'Opaque Mirror (Zero-Knowledge Sync Server)',
      'FOTA & Fleet Management',
    ]);
    expect(page).toContain('TOUR_BEATS');
  });

  it('is gated with the shared unlock key', () => {
    expect(page).toContain('FUNDRAISING_UNLOCK_KEY');
    expect(fundraisingPage).toContain('FUNDRAISING_UNLOCK_KEY');
    expect(fundraisingPage).not.toMatch(/const UNLOCK_KEY = 'fi_fundraising/);
  });

  it('stays out of search indexes', () => {
    expect(layout).toMatch(/index:\s*false/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/stack-copy.test.ts`
Expected: FAIL (`page` does not contain `TOUR_BEATS`).

- [ ] **Step 3: Rewrite the unlocked branch of `page.tsx`**

Keep the locked branch and all hooks EXACTLY as they are. Delete the `BEATS` array, `BEAT_HEADING_STYLE`, and `BEAT_BODY_STYLE`. Add imports and the anchors ref:

```tsx
// imports to add near the top:
import { useEffect, useRef, useState } from 'react';
import CalloutLayer from '@/components/stack-tour/CalloutLayer';
import { TOUR_BEATS, type AnchorScreenMap } from '@/components/stack-tour/stackTour';

const StackTourCanvas = dynamic(
  () => import('@/components/stack-tour/StackTourCanvas'),
  { ssr: false }
);
```

Inside the component add `const anchorsRef = useRef<AnchorScreenMap>({});` and add these styles beside `CARD_CLASS`:

```tsx
const BEAT_TITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(20px, 1.8vw, 26px)',
  fontWeight: 500,
  lineHeight: 1.25,
  letterSpacing: '-0.01em',
  margin: 0,
};

const BEAT_LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontVariationSettings: "'MONO' 100",
  fontSize: '12px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#7B8F5E',
  marginBottom: '0.9em',
};

const BEAT_BODY_STYLE: React.CSSProperties = {
  fontSize: 'clamp(16px, 1.25vw, 19px)',
  lineHeight: 1.45,
};
```

Replace the unlocked `return` with:

```tsx
  return (
    <main>
      {/* The story element's own height is the scroll track useScrollProgress
          reads: one viewport per beat, so beat i centres at t = i/9. */}
      <div
        id={STORY_ID}
        className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-10 px-4 lg:px-8"
      >
        {/* Narrow screens pin the card to the top of the viewport; on lg+ it
            rides along as a sticky pane inside its own column. */}
        <div className="fixed inset-x-4 top-4 z-10 h-[42svh] lg:static lg:inset-auto lg:z-auto lg:h-auto lg:col-span-8">
          <div className="h-full lg:sticky lg:top-0 lg:h-svh lg:py-8">
            <div className={CARD_CLASS}>
              <StackTourCanvas
                storyElementId={STORY_ID}
                reducedMotion={reducedMotion}
                anchorsRef={anchorsRef}
              />
              <CalloutLayer
                storyElementId={STORY_ID}
                reducedMotion={reducedMotion}
                anchorsRef={anchorsRef}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          {TOUR_BEATS.map(beat => (
            <section
              key={beat.id}
              className="min-h-svh flex items-end pb-[10svh] lg:items-center lg:pb-0 lg:pr-4"
            >
              <div className="text-fi-black-900 text-pretty">
                <p style={BEAT_LABEL_STYLE}>{beat.label}</p>
                <h2 style={BEAT_TITLE_STYLE}>{beat.title}</h2>
                {beat.paragraphs.map(p => (
                  <p key={p.slice(0, 24)} className="mt-4" style={BEAT_BODY_STYLE}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
```

(Note `mt-4` works on these paragraphs because the global `p` rule sets no margin classes that conflict; the global `p + p { margin-top: 1em }` also applies and the larger of the two wins visually. Keep `mt-4`.)

- [ ] **Step 4: Full verification**

Run: `npx prettier --write app/fundraising/stack/page.tsx tests/stack-copy.test.ts && npx tsc --noEmit && npx eslint app/fundraising/stack/page.tsx && npx vitest run`
Expected: all green.

- [ ] **Step 5: Smoke-check the route**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/fundraising/stack`
Expected: `200` (dev server runs as background task bc4oz2ij7).

- [ ] **Step 6: Commit**

```bash
git add app/fundraising/stack/page.tsx tests/stack-copy.test.ts
git commit -m "Stack tour: wire ten-beat layer tour into /fundraising/stack"
```

---

### Task 8 (orchestrator, not a subagent): visual verification pass

Headless Chrome CDP rig (established this session): reduced-motion emulation, unlock via localStorage, screenshot each beat centre `i/9` at 1440×900 and 1024×900. Review every frame for: camera framing per the spec's beat map, sheet legibility against clay, callout label collisions with the copy column or card edges, silhouette/Mirror/FOTA art placement. Tune numbers in `stackTour.ts` (camera keyframes, callout `dx/dy`, art percentages) and re-shoot until clean. Then run the full check suite one final time and commit tuning as `Stack tour: visual pass tuning`.
