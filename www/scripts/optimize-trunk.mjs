// Bakes the raw Fusion 360 GLB export down to a web-ready asset:
// 7 flat body nodes (canonical names), world-space geometry, joined
// primitives, simplified, quantized, meshopt-compressed.
//
// Usage: node scripts/optimize-trunk.mjs <path-to-raw.glb>
import { NodeIO } from '@gltf-transform/core';
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
const sceneRoots = scene.listChildren();
if (sceneRoots.length !== 1) {
  throw new Error(
    `Expected exactly 1 root node in the scene, found ${sceneRoots.length}: ` +
    `[${sceneRoots.map((n) => `"${n.getName()}"`).join(', ')}]`,
  );
}
const [fusionRoot] = sceneRoots;

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
const keptMeshes = new Set();
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
    // joinPrimitives copies data into a fresh primitive; dispose the
    // intermediate baked clones it consumed so they don't linger as
    // orphans in the document.
    if (prims.length > 1) for (const prim of prims) prim.dispose();
  }
  keptMeshes.add(joinedMesh);

  const bodyNode = doc.createNode(slug).setMesh(joinedMesh);
  scene.addChild(bodyNode);
}

// Drop the original Fusion tree, then clean up. dispose() removes the
// nodes but NOT their meshes, so explicitly dispose every mesh that is
// not one of the 7 joined body meshes (prune() does not collect them).
fusionRoot.dispose();
for (const mesh of doc.getRoot().listMeshes()) {
  if (!keptMeshes.has(mesh)) mesh.dispose();
}
const meshCount = doc.getRoot().listMeshes().length;
if (meshCount !== BODY_MAP.length) {
  throw new Error(`Expected exactly ${BODY_MAP.length} meshes after cleanup, found ${meshCount}`);
}

await doc.transform(
  prune(),
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.18, error: 0.0018 }),
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

const outMeshCount = check.getRoot().listMeshes().length;
if (outMeshCount !== BODY_MAP.length) {
  console.error(`FAIL: expected exactly ${BODY_MAP.length} meshes in output document, found ${outMeshCount} (orphaned geometry?)`);
  process.exit(1);
}

// Count only geometry actually referenced by the scene graph.
let tris = 0;
let drawCalls = 0;
checkScene.traverse((node) => {
  const mesh = node.getMesh();
  if (!mesh) return;
  for (const prim of mesh.listPrimitives()) {
    drawCalls += 1;
    const indices = prim.getIndices();
    const count = indices ? indices.getCount() : prim.getAttribute('POSITION').getCount();
    tris += count / 3;
  }
});
const bytes = statSync(outPath).size;
console.log(`bodies:     ${names.join(', ')}`);
console.log(`meshes:     ${outMeshCount}`);
console.log(`size:       ${(bytes / 1024 / 1024).toFixed(2)} MB (budget 4.00 MB)`);
console.log(`triangles:  ${Math.round(tris).toLocaleString()} (budget 300,000)`);
console.log(`draw calls: ${drawCalls}`);
if (bytes > SIZE_BUDGET_BYTES || tris > TRI_BUDGET) {
  console.error('FAIL: over budget. Increase simplify() aggressiveness (lower ratio, raise error) and re-run.');
  process.exit(1);
}
console.log('OK: trunk.glb within budget.');
