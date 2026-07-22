# /fundraising/stack Exploded Hardware View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A gated page at `/fundraising/stack` where the family trunk 3D model explodes into its 7 discrete bodies as the visitor scrolls, with a copy beat per part.

**Architecture:** A one-time `gltf-transform` script bakes the 28MB Fusion export down to ≤4MB with 7 flat, renamed body nodes. A fixed react-three-fiber canvas sits behind normal DOM scroll sections; a pure-math timeline module maps scroll progress to per-body explode offsets and camera keyframes, lerped each frame.

**Tech Stack:** Next.js 16, React 19, three + @react-three/fiber@^9 + @react-three/drei@^10, @gltf-transform (core/functions/extensions) + meshoptimizer, Tailwind 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-21-fundraising-stack-exploded-view-design.md`

## Global Constraints

- All app work happens in `www/` (run npm commands from `/Users/hhff/Documents/Code/intelligence.family/www`).
- Dependency pins: `@react-three/fiber@^9`, `@react-three/drei@^10` (older majors do not support React 19). `three` at whatever those peer on.
- The raw 28MB GLB is NEVER committed. Source path (CLI arg): `/Users/hhff/Downloads/family-trunk-again/family-trunk-all-again.glb`. Only `www/public/fundraising/trunk.glb` is committed.
- Optimized asset budget: **≤ 4MB on disk, ≤ 300k triangles**, all 7 canonical body names present.
- Canonical body names (set by the optimizer, used by all runtime code): `enclosure-back`, `enclosure-front`, `enclosure-top`, `leaf`, `display`, `orin`, `ups`.
- Placeholder copy must contain NO em dashes (Hugh's voice rule) and must be clearly replaceable (each beat marked with a `PLACEHOLDER` code comment, not in visible text).
- No drei `ScrollControls`, no GSAP/Theatre.js, no network-fetched environment maps (use three's `RoomEnvironment`, which is procedural).
- Do not modify `/fundraising` page behavior except extracting the unlock-key constant.
- Model/world units are meters. The assembled model occupies roughly x 0..0.185, y −0.04..0.06, z 0..0.17; visual center ≈ (0.09, 0.005, 0.085).

---

### Task 1: Asset optimizer script + committed trunk.glb

**Files:**
- Create: `www/scripts/optimize-trunk.mjs`
- Create: `www/public/fundraising/trunk.glb` (script output)
- Modify: `www/package.json` (devDependencies + `optimize:trunk` script)

**Interfaces:**
- Produces: `public/fundraising/trunk.glb` whose scene contains exactly 7 top-level nodes named `enclosure-back`, `enclosure-front`, `enclosure-top`, `leaf`, `display`, `orin`, `ups`. Geometry is baked to world space (meters), but the body nodes carry KHR_mesh_quantization decode transforms (translation + uniform scale), NOT identity — quantized positions cannot coexist with identity nodes. Downstream code MUST animate via wrapper pivots or deltas and never set a body node's own transform (Task 4's pivot groups exist for exactly this reason). Runtime draw calls: 84 (74 materials across orin/ups is genuine source BOM). Meshopt-compressed (EXT_meshopt_compression).

- [ ] **Step 1: Install dev dependencies**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npm install -D @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions meshoptimizer
```

- [ ] **Step 2: Write the script**

Create `www/scripts/optimize-trunk.mjs`:

```js
// Bakes the raw Fusion 360 GLB export down to a web-ready asset:
// 7 flat body nodes (canonical names), world-space geometry, joined
// primitives, simplified, quantized, meshopt-compressed.
//
// Usage: node scripts/optimize-trunk.mjs <path-to-raw.glb>
import { NodeIO, Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import {
  prune, dedup, weld, simplify, quantize, transformPrimitive, joinPrimitives,
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE_BUDGET_BYTES = 4 * 1024 * 1024;
const TRI_BUDGET = 300_000;

// Raw child-node name prefix -> canonical body name
const BODY_MAP = [
  ['Enclosure-Back', 'enclosure-back'],
  ['Enclosure-Front', 'enclosure-front'],
  ['Enclosure-Top', 'enclosure-top'],
  ['leaf', 'leaf'],
  ['1118', 'display'],
  ['Orin', 'orin'],
  ['UPS', 'ups'],
];

const srcPath = process.argv[2];
if (!srcPath) {
  console.error('Usage: node scripts/optimize-trunk.mjs <path-to-raw.glb>');
  process.exit(1);
}
const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'fundraising', 'trunk.glb',
);

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
await MeshoptSimplifier.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
    'meshopt.decoder': MeshoptDecoder,
  });

const doc = await io.read(srcPath);
const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
const [fusionRoot] = scene.listChildren();
if (!fusionRoot) throw new Error('Scene has no root node');

// three.js sanitizes node names (spaces/colons), so we bake canonical
// slugs here instead of trusting the Fusion names to survive loading.
const bodies = [];
for (const child of fusionRoot.listChildren()) {
  const raw = child.getName();
  const entry = BODY_MAP.find(([prefix]) => raw.startsWith(prefix));
  if (!entry) throw new Error(`Unmapped top-level body: "${raw}"`);
  bodies.push({ node: child, slug: entry[1] });
}
if (bodies.length !== BODY_MAP.length) {
  throw new Error(`Expected ${BODY_MAP.length} bodies, found ${bodies.length}`);
}

// Bake each body subtree to world space and join primitives per
// material+attribute signature, so each body becomes one flat node.
for (const { node, slug } of bodies) {
  const groups = new Map(); // signature -> { material, prims: [] }
  node.traverse((n) => {
    const mesh = n.getMesh();
    if (!mesh) return;
    const world = n.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      const baked = prim.clone();
      // clone() shares accessors; the Fusion export instances meshes
      // (e.g. the four standoffs), so transforming shared vertex data
      // in place would double-transform later instances. Deep-copy.
      for (const semantic of baked.listSemantics()) {
        baked.setAttribute(semantic, baked.getAttribute(semantic).clone());
      }
      if (baked.getIndices()) baked.setIndices(baked.getIndices().clone());
      transformPrimitive(baked, world);
      const material = baked.getMaterial();
      const semantics = baked.listSemantics().sort().join('|');
      const key = `${material ? doc.getRoot().listMaterials().indexOf(material) : -1}:${semantics}:${baked.getMode()}`;
      if (!groups.has(key)) groups.set(key, { material, prims: [] });
      groups.get(key).prims.push(baked);
    }
  });

  const joinedMesh = doc.createMesh(slug);
  for (const { material, prims } of groups.values()) {
    const joined = prims.length === 1 ? prims[0] : joinPrimitives(prims);
    joined.setMaterial(material);
    joinedMesh.addPrimitive(joined);
  }

  const bodyNode = doc.createNode(slug).setMesh(joinedMesh);
  scene.addChild(bodyNode);
}

// Drop the original Fusion tree, then clean up.
fusionRoot.dispose();

await doc.transform(
  prune(),
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.25, error: 0.001 }),
  quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }),
);

doc.createExtension(EXTMeshoptCompression).setRequired(true);
await io.write(outPath, doc);

// ---- Verification (the explode rig keys off these names) ----
const check = await io.read(outPath);
const checkScene = check.getRoot().getDefaultScene() ?? check.getRoot().listScenes()[0];
const names = checkScene.listChildren().map((n) => n.getName()).sort();
const expected = BODY_MAP.map(([, slug]) => slug).sort();
const missing = expected.filter((n) => !names.includes(n));
if (missing.length) {
  console.error(`FAIL: missing body nodes in output: ${missing.join(', ')} (got: ${names.join(', ')})`);
  process.exit(1);
}

let tris = 0;
let drawCalls = 0;
for (const mesh of check.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    drawCalls += 1;
    const indices = prim.getIndices();
    const count = indices ? indices.getCount() : prim.getAttribute('POSITION').getCount();
    tris += count / 3;
  }
}
const bytes = statSync(outPath).size;
console.log(`bodies:     ${names.join(', ')}`);
console.log(`size:       ${(bytes / 1024 / 1024).toFixed(2)} MB (budget 4.00 MB)`);
console.log(`triangles:  ${Math.round(tris).toLocaleString()} (budget 300,000)`);
console.log(`draw calls: ${drawCalls}`);
if (bytes > SIZE_BUDGET_BYTES || tris > TRI_BUDGET) {
  console.error('FAIL: over budget. Increase simplify() aggressiveness (lower ratio, raise error) and re-run.');
  process.exit(1);
}
console.log('OK: trunk.glb within budget.');
```

- [ ] **Step 3: Add npm script**

In `www/package.json` `scripts`, add:

```json
"optimize:trunk": "node scripts/optimize-trunk.mjs"
```

- [ ] **Step 4: Run it against the raw export**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npm run optimize:trunk -- "/Users/hhff/Downloads/family-trunk-again/family-trunk-all-again.glb"
```

Expected: prints the 7 body names, size ≤ 4.00 MB, triangles ≤ 300,000, exits 0 with `OK: trunk.glb within budget.`

If over budget: edit `simplify({ ... ratio: 0.25, error: 0.001 })` toward `ratio: 0.15, error: 0.002` and re-run until it passes. If `joinPrimitives` throws on incompatible primitives, the signature grouping above is wrong for that pair; include the sorted semantics list AND the presence of indices in the key.

- [ ] **Step 5: Commit**

```bash
cd /Users/hhff/Documents/Code/intelligence.family
git add www/scripts/optimize-trunk.mjs www/public/fundraising/trunk.glb www/package.json www/package-lock.json
git commit -m "Add trunk GLB optimizer and web-ready asset (7 named bodies, meshopt)"
```

---

### Task 2: Explode timeline math (pure module, TDD)

**Files:**
- Create: `www/components/trunk/explodeTimeline.ts`
- Test: `www/tests/explode-timeline.test.ts`

**Interfaces:**
- Produces (consumed by Task 4's `TrunkCanvas.tsx`):
  - `BODY_NAMES: readonly BodyName[]` where `BodyName = 'enclosure-back' | 'enclosure-front' | 'enclosure-top' | 'leaf' | 'display' | 'orin' | 'ups'`
  - `explodeOffset(body: BodyName, t: number): [number, number, number]` — world-space meters, zero at/below window start, full vector at/above window end, smoothstepped between
  - `cameraPose(t: number): { position: [number, number, number]; target: [number, number, number] }` — piecewise smoothstep between keyframes, clamped at the ends

- [ ] **Step 1: Write the failing tests**

Create `www/tests/explode-timeline.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  BODY_NAMES,
  EXPLODE_VECTORS,
  STAGGER,
  explodeOffset,
  cameraPose,
  CAMERA_KEYFRAMES,
} from '@/components/trunk/explodeTimeline';

describe('explodeOffset', () => {
  it('is zero for every body at t=0 and below', () => {
    for (const body of BODY_NAMES) {
      expect(explodeOffset(body, 0)).toEqual([0, 0, 0]);
      expect(explodeOffset(body, -1)).toEqual([0, 0, 0]);
    }
  });

  it('equals the full vector for every body at t=1 and above', () => {
    for (const body of BODY_NAMES) {
      expect(explodeOffset(body, 1)).toEqual(EXPLODE_VECTORS[body]);
      expect(explodeOffset(body, 2)).toEqual(EXPLODE_VECTORS[body]);
    }
  });

  it('is strictly between zero and full at the window midpoint', () => {
    for (const body of BODY_NAMES) {
      const { start, end } = STAGGER[body];
      const mid = explodeOffset(body, (start + end) / 2);
      const full = EXPLODE_VECTORS[body];
      const midLen = Math.hypot(...mid);
      const fullLen = Math.hypot(...full);
      expect(midLen).toBeGreaterThan(0);
      expect(midLen).toBeLessThan(fullLen);
    }
  });

  it('is monotonically non-decreasing in magnitude across the window', () => {
    for (const body of BODY_NAMES) {
      let prev = -1;
      for (let t = 0; t <= 1.0001; t += 0.01) {
        const len = Math.hypot(...explodeOffset(body, t));
        expect(len).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = len;
      }
    }
  });

  it('staggers in the approved order: top, leaf, front, display, orin, ups, back', () => {
    const order: (keyof typeof STAGGER)[] = [
      'enclosure-top', 'leaf', 'enclosure-front', 'display', 'orin', 'ups', 'enclosure-back',
    ];
    for (let i = 1; i < order.length; i++) {
      expect(STAGGER[order[i]].start).toBeGreaterThan(STAGGER[order[i - 1]].start);
    }
  });
});

describe('cameraPose', () => {
  it('returns the first keyframe at t<=0 and the last at t>=1', () => {
    expect(cameraPose(0)).toEqual(CAMERA_KEYFRAMES[0].pose);
    expect(cameraPose(-0.5)).toEqual(CAMERA_KEYFRAMES[0].pose);
    const last = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];
    expect(cameraPose(1)).toEqual(last.pose);
    expect(cameraPose(1.5)).toEqual(last.pose);
  });

  it('hits every keyframe exactly at its t', () => {
    for (const kf of CAMERA_KEYFRAMES) {
      const pose = cameraPose(kf.t);
      for (let i = 0; i < 3; i++) {
        expect(pose.position[i]).toBeCloseTo(kf.pose.position[i], 10);
        expect(pose.target[i]).toBeCloseTo(kf.pose.target[i], 10);
      }
    }
  });

  it('interpolates between keyframes', () => {
    const [a, b] = CAMERA_KEYFRAMES;
    const mid = cameraPose((a.t + b.t) / 2);
    expect(mid.position[0]).not.toBe(a.pose.position[0]);
    expect(mid.position[0]).not.toBe(b.pose.position[0]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npx vitest run tests/explode-timeline.test.ts
```

Expected: FAIL (cannot resolve `@/components/trunk/explodeTimeline`).

- [ ] **Step 3: Write the implementation**

Create `www/components/trunk/explodeTimeline.ts`:

```ts
// Pure math for the scroll-driven exploded view. No three.js imports so
// it stays trivially unit-testable. World units are meters; the model
// sits at roughly x 0..0.185, y -0.04..0.06, z 0..0.17.

export const BODY_NAMES = [
  'enclosure-back',
  'enclosure-front',
  'enclosure-top',
  'leaf',
  'display',
  'orin',
  'ups',
] as const;

export type BodyName = (typeof BODY_NAMES)[number];

export type Vec3 = [number, number, number];

// Hand-authored explode directions (approved in the spec): top lifts,
// leaf floats higher, front swings forward with the display layered
// behind it, orin slides out, ups drops beneath it, back recedes.
export const EXPLODE_VECTORS: Record<BodyName, Vec3> = {
  'enclosure-top': [0, 0.13, 0],
  leaf: [0, 0.2, 0],
  'enclosure-front': [0, 0, 0.16],
  display: [0, 0, 0.1],
  orin: [0.12, 0.02, 0],
  ups: [0.12, -0.1, 0],
  'enclosure-back': [0, 0, -0.14],
};

export interface StaggerWindow {
  start: number;
  end: number;
}

export const STAGGER: Record<BodyName, StaggerWindow> = {
  'enclosure-top': { start: 0.04, end: 0.18 },
  leaf: { start: 0.1, end: 0.26 },
  'enclosure-front': { start: 0.22, end: 0.4 },
  display: { start: 0.28, end: 0.46 },
  orin: { start: 0.42, end: 0.6 },
  ups: { start: 0.56, end: 0.74 },
  'enclosure-back': { start: 0.72, end: 0.9 },
};

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function bodyProgress(body: BodyName, t: number): number {
  const { start, end } = STAGGER[body];
  if (t <= start) return 0;
  if (t >= end) return 1;
  return smoothstep(start, end, t);
}

export function explodeOffset(body: BodyName, t: number): Vec3 {
  const p = bodyProgress(body, t);
  const v = EXPLODE_VECTORS[body];
  if (p === 0) return [0, 0, 0];
  if (p === 1) return v;
  return [v[0] * p, v[1] * p, v[2] * p];
}

export interface CameraPose {
  position: Vec3;
  target: Vec3;
}

// Opening three-quarter hero, swing left as the front comes off, drop to
// eye level for the orin/ups separation (the money shot), pull back high
// for the full exploded family portrait.
export const CAMERA_KEYFRAMES: { t: number; pose: CameraPose }[] = [
  { t: 0, pose: { position: [0.37, 0.17, 0.5], target: [0.09, 0.02, 0.085] } },
  { t: 0.35, pose: { position: [-0.25, 0.12, 0.45], target: [0.09, 0.03, 0.09] } },
  { t: 0.65, pose: { position: [0.45, -0.02, 0.3], target: [0.11, -0.03, 0.07] } },
  { t: 1, pose: { position: [0.42, 0.16, 0.55], target: [0.09, 0.02, 0.07] } },
];

function lerpVec(a: Vec3, b: Vec3, p: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
}

export function cameraPose(t: number): CameraPose {
  const kfs = CAMERA_KEYFRAMES;
  if (t <= kfs[0].t) return kfs[0].pose;
  if (t >= kfs[kfs.length - 1].t) return kfs[kfs.length - 1].pose;
  let i = 0;
  while (t > kfs[i + 1].t) i++;
  const a = kfs[i];
  const b = kfs[i + 1];
  const p = smoothstep(a.t, b.t, t);
  return {
    position: lerpVec(a.pose.position, b.pose.position, p),
    target: lerpVec(a.pose.target, b.pose.target, p),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/explode-timeline.test.ts
```

Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/hhff/Documents/Code/intelligence.family
git add www/components/trunk/explodeTimeline.ts www/tests/explode-timeline.test.ts
git commit -m "Add explode timeline math for /fundraising/stack"
```

---

### Task 3: Scroll progress (pure mapping + hook, TDD)

**Files:**
- Create: `www/components/trunk/scrollProgress.ts` (pure function)
- Create: `www/components/trunk/useScrollProgress.ts` (client hook)
- Test: `www/tests/scroll-progress.test.ts`

**Interfaces:**
- Produces:
  - `computeProgress(rectTop: number, rectHeight: number, viewportHeight: number): number` — 0 when the story element's top is at/below the viewport top, 1 when its bottom has reached the viewport bottom, linear between, always clamped to [0, 1].
  - `useScrollProgress(elementId: string): React.RefObject<number>` — a ref whose `.current` is the latest target progress (updated on scroll/resize via passive listeners). Consumed by `TrunkCanvas` inside `useFrame`, hence a ref rather than state (no re-renders at 60fps).

- [ ] **Step 1: Write the failing tests**

Create `www/tests/scroll-progress.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeProgress } from '@/components/trunk/scrollProgress';

describe('computeProgress', () => {
  // Story element: 4000px tall, viewport 800px. Scrollable span = 3200px.
  it('is 0 before the story reaches the top of the viewport', () => {
    expect(computeProgress(0, 4000, 800)).toBe(0);
    expect(computeProgress(500, 4000, 800)).toBe(0);
  });

  it('is 1 once the story bottom reaches the viewport bottom', () => {
    expect(computeProgress(-3200, 4000, 800)).toBe(1);
    expect(computeProgress(-5000, 4000, 800)).toBe(1);
  });

  it('is linear in between', () => {
    expect(computeProgress(-1600, 4000, 800)).toBeCloseTo(0.5, 10);
    expect(computeProgress(-800, 4000, 800)).toBeCloseTo(0.25, 10);
  });

  it('returns 0 for degenerate sizes instead of NaN/Infinity', () => {
    expect(computeProgress(-100, 800, 800)).toBe(0);
    expect(computeProgress(-100, 400, 800)).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npx vitest run tests/scroll-progress.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Write the pure function**

Create `www/components/trunk/scrollProgress.ts`:

```ts
// Maps the story element's viewport position to a 0..1 timeline value.
// Kept free of DOM access so it runs under vitest's node environment.
export function computeProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
): number {
  const span = rectHeight - viewportHeight;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, -rectTop / span));
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/scroll-progress.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write the hook**

Create `www/components/trunk/useScrollProgress.ts`:

```ts
'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { computeProgress } from './scrollProgress';

// Returns a ref (not state) holding the latest 0..1 progress through the
// story element. TrunkCanvas polls it inside useFrame, so updating a ref
// avoids re-rendering React 60 times a second.
export function useScrollProgress(elementId: string): RefObject<number> {
  const progressRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(elementId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      progressRef.current = computeProgress(rect.top, rect.height, window.innerHeight);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [elementId]);

  return progressRef;
}
```

- [ ] **Step 6: Run the full test suite and lint**

```bash
npm test && npm run lint
```

Expected: all tests pass, no lint errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/hhff/Documents/Code/intelligence.family
git add www/components/trunk/scrollProgress.ts www/components/trunk/useScrollProgress.ts www/tests/scroll-progress.test.ts
git commit -m "Add scroll progress mapping and hook for /fundraising/stack"
```

---

### Task 4: TrunkCanvas R3F scene

**Files:**
- Create: `www/components/trunk/TrunkCanvas.tsx`
- Modify: `www/package.json` (runtime deps)

**Interfaces:**
- Consumes: `explodeOffset`, `cameraPose`, `BODY_NAMES` from `./explodeTimeline`; `useScrollProgress` from `./useScrollProgress`; `/fundraising/trunk.glb` with the 7 canonical node names (Task 1).
- Produces: `export default function TrunkCanvas({ storyElementId, progressOverride }: { storyElementId: string; progressOverride?: number })` — a fixed full-viewport canvas. `progressOverride` (used for reduced motion) pins the timeline to a constant value and disables camera/offset animation smoothing.

- [ ] **Step 1: Install runtime dependencies**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npm install three @react-three/fiber@^9 @react-three/drei@^10
npm install -D @types/three
```

Verify: `npm ls three @react-three/fiber @react-three/drei` shows fiber 9.x and drei 10.x with no peer warnings against React 19.

- [ ] **Step 2: Write the component**

Create `www/components/trunk/TrunkCanvas.tsx`:

```tsx
'use client';

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, useGLTF } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BODY_NAMES, cameraPose, explodeOffset, type BodyName } from './explodeTimeline';
import { useScrollProgress } from './useScrollProgress';

const MODEL_URL = '/fundraising/trunk.glb';
const SMOOTHING = 0.08;

// Mixed treatment: clay brand tones on the shell bodies, original CAD
// materials on the electronics so they read as real hardware.
const CLAY_COLORS: Partial<Record<BodyName, string>> = {
  'enclosure-back': '#CAD4C6',
  'enclosure-front': '#B8C6B0',
  'enclosure-top': '#B8C6B0',
  leaf: '#5E7B29',
};

// Procedural environment lighting: no network fetch, unlike drei's
// <Environment preset>, which pulls HDRs from a CDN.
function ProceduralEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      scene.environment = null;
      tex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function TrunkModel({
  storyElementId,
  progressOverride,
}: {
  storyElementId: string;
  progressOverride?: number;
}) {
  const { scene: gltfScene } = useGLTF(MODEL_URL);
  const progressRef = useScrollProgress(storyElementId);
  const smoothed = useRef(progressOverride ?? 0);
  const camera = useThree((s) => s.camera);

  // Each body moves via a wrapper pivot, never its own node: loaders and
  // quantization may store meaningful transforms on the body nodes, and
  // setting their position directly would clobber those.
  const pivots = useMemo(() => {
    const found = new Map<BodyName, THREE.Group>();
    for (const name of BODY_NAMES) {
      const obj = gltfScene.getObjectByName(name);
      if (!obj || !obj.parent) continue;
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
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) child.material = clay;
        });
      }
    }
    return found;
  }, [gltfScene]);

  useFrame(() => {
    const target = progressOverride ?? progressRef.current;
    smoothed.current =
      progressOverride !== undefined
        ? target
        : smoothed.current + (target - smoothed.current) * SMOOTHING;
    const t = smoothed.current;

    for (const [name, pivot] of pivots) {
      const [x, y, z] = explodeOffset(name, t);
      pivot.position.set(x, y, z);
    }

    const pose = cameraPose(t);
    camera.position.set(...pose.position);
    camera.lookAt(...pose.target);
  });

  return <primitive object={gltfScene} />;
}

// A broken canvas must never break the fundraising flow: on any render
// error (WebGL unavailable, asset failure) the page falls back to copy
// on the sage background.
class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function TrunkCanvas({
  storyElementId,
  progressOverride,
}: {
  storyElementId: string;
  progressOverride?: number;
}) {
  return (
    <div className="fixed inset-0" aria-hidden="true">
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
            <TrunkModel storyElementId={storyElementId} progressOverride={progressOverride} />
            <ContactShadows position={[0.09, -0.05, 0.085]} scale={0.8} blur={2.5} opacity={0.35} far={0.3} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
```

- [ ] **Step 3: Verify it type-checks and builds**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npx tsc --noEmit && npm run lint
```

Expected: no errors. (The component isn't routed yet; the build check comes in Task 5.)

If `three/examples/jsm/environments/RoomEnvironment.js` fails to resolve types, import from `three/addons/environments/RoomEnvironment.js` instead (both are published; pick whichever resolves).

- [ ] **Step 4: Commit**

```bash
cd /Users/hhff/Documents/Code/intelligence.family
git add www/components/trunk/TrunkCanvas.tsx www/package.json www/package-lock.json
git commit -m "Add TrunkCanvas R3F scene with clay/CAD mixed treatment"
```

---

### Task 5: Route, gate wiring, copy beats, copy tests

**Files:**
- Create: `www/lib/fundraising-gate.ts`
- Modify: `www/app/fundraising/page.tsx` (only the `UNLOCK_KEY` constant moves)
- Create: `www/app/fundraising/stack/layout.tsx`
- Create: `www/app/fundraising/stack/page.tsx`
- Test: `www/tests/stack-copy.test.ts`

**Interfaces:**
- Consumes: `TrunkCanvas` (Task 4, via `next/dynamic` with `ssr: false`), `InlineEmailGate` (`onSuccess: () => void; source?: string; prompt?: string`).
- Produces: `FUNDRAISING_UNLOCK_KEY = 'fi_fundraising_unlocked_v2'` exported from `lib/fundraising-gate.ts`, imported by both fundraising pages.

- [ ] **Step 1: Write the failing copy tests**

Create `www/tests/stack-copy.test.ts` (same source-assertion style as `tests/fundraising-copy.test.ts`):

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) =>
  readFileSync(path.join(__dirname, '..', rel), 'utf8');

const page = read('app/fundraising/stack/page.tsx');
const layout = read('app/fundraising/stack/layout.tsx');
const fundraisingPage = read('app/fundraising/page.tsx');

describe('stack page contract', () => {
  it('contains no em dashes in copy', () => {
    expect(page).not.toMatch(/—/);
  });

  it('covers all seven hardware beats', () => {
    for (const part of ['Lid', 'Leaf', 'Front', 'Display', 'Orin', 'Power', 'Shell']) {
      expect(page).toContain(part);
    }
  });

  it('is gated with the shared unlock key', () => {
    expect(page).toContain('FUNDRAISING_UNLOCK_KEY');
    expect(fundraisingPage).toContain('FUNDRAISING_UNLOCK_KEY');
    expect(fundraisingPage).not.toMatch(/const UNLOCK_KEY = 'fi_fundraising/);
  });

  it('stays out of search indexes', () => {
    expect(layout).toMatch(/index:\s*false/);
  });

  it('marks placeholder beats for Hugh to replace', () => {
    expect(page).toMatch(/PLACEHOLDER/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npx vitest run tests/stack-copy.test.ts
```

Expected: FAIL (files don't exist yet).

- [ ] **Step 3: Extract the shared unlock key**

Create `www/lib/fundraising-gate.ts`:

```ts
// Shared between /fundraising and /fundraising/stack so bumping the
// suffix re-gates both pages at once.
export const FUNDRAISING_UNLOCK_KEY = 'fi_fundraising_unlocked_v2';
```

In `www/app/fundraising/page.tsx`:
- Add import: `import { FUNDRAISING_UNLOCK_KEY } from '@/lib/fundraising-gate';`
- Delete the lines (including the comment above them):

```ts
// Bump the suffix to force all returning visitors back through the gate.
const UNLOCK_KEY = 'fi_fundraising_unlocked_v2';
```

- Replace both remaining usages of `UNLOCK_KEY` in that file with `FUNDRAISING_UNLOCK_KEY` (they are at the `localStorage.getItem` and `localStorage.setItem` call sites, near lines 54 and 60).

- [ ] **Step 4: Create the layout**

Create `www/app/fundraising/stack/layout.tsx`:

```tsx
import type { Metadata } from 'next';

const title = 'The Stack · Family Intelligence';
const description =
  'An exploded view of the family trunk: local AI hardware inside a sculptural enclosure.';

// Next.js replaces the parent openGraph/twitter wholesale (images do not
// merge down), so re-declare the shared card here, matching /fundraising.
const shareImage = '/research/fam-og-image.png';

export const metadata: Metadata = {
  title,
  description,
  // Semi-private page: keep it out of search indexes
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [{ url: shareImage }] },
  twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
};

export default function StackLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
```

- [ ] **Step 5: Create the page**

Create `www/app/fundraising/stack/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import InlineEmailGate from '@/components/InlineEmailGate';
import { FUNDRAISING_UNLOCK_KEY } from '@/lib/fundraising-gate';

const TrunkCanvas = dynamic(() => import('@/components/trunk/TrunkCanvas'), {
  ssr: false,
});

const STORY_ID = 'stack-story';

// PLACEHOLDER copy throughout: every beat below is scaffolding for Hugh
// to replace with his own words. Structure and part names are real.
const BEATS: { heading: string; body: string }[] = [
  {
    heading: 'One object, whole',
    body: 'The family trunk arrives as a single sculptural object. Scroll to open it up.',
  },
  {
    heading: 'The Lid',
    body: 'The top lifts away. Nothing about this device asks to live in a server closet.',
  },
  {
    heading: 'The Leaf',
    body: 'A small signature. Every trunk carries one.',
  },
  {
    heading: 'The Front, and the Display',
    body: 'The front panel carries a Waveshare display: the face your family actually talks to.',
  },
  {
    heading: 'The Orin',
    body: 'An NVIDIA Jetson Orin Nano runs the entire intelligence stack locally. No cloud, no subscription to a stranger.',
  },
  {
    heading: 'The Power',
    body: 'A UPS module sits beneath the compute, so a blackout never takes your family offline.',
  },
  {
    heading: 'The Shell',
    body: 'The back shell closes around all of it. This is the whole machine: yours, at home.',
  },
];

export default function Stack() {
  const [unlocked, setUnlocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(FUNDRAISING_UNLOCK_KEY) === '1') setUnlocked(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const unlock = () => {
    localStorage.setItem(FUNDRAISING_UNLOCK_KEY, '1');
    setUnlocked(true);
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center text-balance">
          The Stack
        </h1>
        <InlineEmailGate
          onSuccess={unlock}
          source="fundraising_stack"
          prompt="Enter your email to see inside the trunk."
        />
      </main>
    );
  }

  return (
    <main>
      <TrunkCanvas
        storyElementId={STORY_ID}
        progressOverride={reducedMotion ? 1 : undefined}
      />
      <div id={STORY_ID} className="relative z-10">
        {BEATS.map((beat, i) => (
          <section
            key={beat.heading}
            className="min-h-[120vh] flex items-center px-6 md:px-20"
          >
            <div
              className={`max-w-sm ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}
            >
              <h2 className="font-serif text-3xl md:text-4xl mb-4">{beat.heading}</h2>
              <p className="text-lg leading-relaxed text-fi-black-900">{beat.body}</p>
            </div>
          </section>
        ))}
        <section className="min-h-[60vh] flex items-center justify-center">
          <p className="font-serif text-2xl md:text-3xl text-center text-balance px-6">
            The whole stack, in one trunk.
          </p>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Run all tests, lint, and build**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npm test && npm run lint && npm run build
```

Expected: all tests pass (including `stack-copy.test.ts` and the pre-existing `fundraising-copy.test.ts`, which must still pass after the key extraction), lint clean, production build succeeds with the `/fundraising/stack` route listed.

Note: `next/dynamic` with `ssr: false` inside a client component is correct here; if Next 16 warns about it, move the `dynamic()` call as-is into a tiny `'use client'` wrapper only if the build actually fails, not preemptively.

- [ ] **Step 7: Commit**

```bash
cd /Users/hhff/Documents/Code/intelligence.family
git add www/lib/fundraising-gate.ts www/app/fundraising/page.tsx www/app/fundraising/stack/ www/tests/stack-copy.test.ts
git commit -m "Add gated /fundraising/stack page with scroll-driven exploded trunk"
```

---

### Task 6: Full verification pass

**Files:**
- No new files. Runs checks, fixes anything broken, pushes the branch.

**Interfaces:**
- Consumes: everything above.
- Produces: a green branch `feat/fundraising-stack-exploded-view` pushed to origin.

- [ ] **Step 1: Full suite from clean state**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npm test && npm run lint && npm run format:check && npm run build
```

Expected: all pass. If `format:check` fails, run `npm run format` and include the changes in the fix commit.

Lighthouse: the existing `lighthouserc.js` config is unchanged and runs where it already runs (CI / manual `npm run lighthouse`); do not add the gated stack page to it in this task.

- [ ] **Step 2: Smoke-test the running page**

```bash
cd /Users/hhff/Documents/Code/intelligence.family/www
npm run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/fundraising/stack   # expect 200
curl -s -o /dev/null -w "%{http_code} %{size_download}" http://localhost:3000/fundraising/trunk.glb  # expect 200 and ≤ 4194304 bytes
kill %1
```

Expected: both 200; asset within budget.

- [ ] **Step 3: Commit any fixes and push**

```bash
cd /Users/hhff/Documents/Code/intelligence.family
git status   # confirm clean or commit fixes with a descriptive message
git push -u origin feat/fundraising-stack-exploded-view
```

Do NOT open a PR in this task; the main session does that after visual review with Hugh (explode magnitudes and camera keyframes are tuned by eye per the spec).
