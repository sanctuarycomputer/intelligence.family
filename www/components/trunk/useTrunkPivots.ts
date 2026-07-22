'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { BODY_NAMES, type BodyName } from './explodeTimeline';
import {
  getRenderSettings,
  materialSliceKey,
  subscribeRenderSettings,
  type RenderSettings,
} from '../stack-tour/renderSettings';

// Inverted-hull cel outlines on the broad shapes only (the shell bodies):
// a BackSide copy of each shell, pushed out along its normals, draws a
// clean silhouette line. Electronics stay outline-free; hulling a joined
// circuit board would read as noise.
const OUTLINED: ReadonlySet<string> = new Set([
  'enclosure-back',
  'enclosure-front',
  'enclosure-top',
  'leaf',
]);
const OUTLINE_SUFFIX = '-cel-outline';

// One registry entry per body mesh: everything needed to (re)build its
// material under any settings, captured once at wrap time.
interface TrunkMeshEntry {
  mesh: THREE.Mesh;
  body: BodyName;
  baseColor: THREE.Color;
  map: THREE.Texture | null;
  vertexColors: boolean;
  // Node scale, for converting world outline thickness to the mesh's
  // quantised local space.
  localScale: number;
}

const registries = new WeakMap<THREE.Group, TrunkMeshEntry[]>();

// Materials and textures owned by the most recent applyTrunkMaterials run.
let ownedMaterials: THREE.Material[] = [];
let ownedRamp: THREE.DataTexture | null = null;

function makeRamp(steps: number[]): THREE.DataTexture {
  const data = new Uint8Array(steps.map(v => Math.max(0, Math.min(255, v))));
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

// The hull offset happens in the mesh's local (quantised) space, so each
// body needs the world thickness divided by its own node scale. Distinct
// shader constants need distinct program cache keys.
function makeOutlineMaterial(
  color: string,
  localThickness: number
): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  mat.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = position + normal * ${localThickness.toFixed(6)};`
    );
  };
  mat.customProgramCacheKey = () => `cel-outline-${localThickness.toFixed(6)}`;
  return mat;
}

function buildBodyMaterial(
  s: RenderSettings,
  entry: TrunkMeshEntry,
  ramp: THREE.DataTexture
): THREE.Material {
  const clayColor =
    s.enclosure[entry.body as keyof RenderSettings['enclosure']];
  const color = clayColor
    ? new THREE.Color(clayColor)
    : entry.baseColor.clone();
  const common = {
    color,
    map: entry.map,
    vertexColors: entry.vertexColors,
  };
  switch (s.shading.mode) {
    case 'toon':
      return new THREE.MeshToonMaterial({ ...common, gradientMap: ramp });
    case 'lambert':
      return new THREE.MeshLambertMaterial(common);
    default:
      return new THREE.MeshStandardMaterial({
        ...common,
        roughness: s.shading.roughness,
        metalness: s.shading.metalness,
      });
  }
}

// Rebuild every registered body's material (and outline hull) from the
// current render settings. Runs on mount and whenever the material slice
// of the settings changes.
function applyTrunkMaterials(gltfScene: THREE.Group): void {
  const registry = registries.get(gltfScene);
  if (!registry) return;
  for (const m of ownedMaterials) m.dispose();
  ownedMaterials = [];
  if (ownedRamp) {
    ownedRamp.dispose();
    ownedRamp = null;
  }
  const s = getRenderSettings();
  const ramp = makeRamp(s.shading.rampSteps);
  ownedRamp = ramp;
  for (const entry of registry) {
    // Drop any previous hull before rebuilding.
    for (const child of [...entry.mesh.children]) {
      if (child.name.endsWith(OUTLINE_SUFFIX)) entry.mesh.remove(child);
    }
    const mat = buildBodyMaterial(s, entry, ramp);
    ownedMaterials.push(mat);
    entry.mesh.material = mat;
    if (s.outline.enabled && OUTLINED.has(entry.body)) {
      const outlineMat = makeOutlineMaterial(
        s.outline.color,
        s.outline.thickness / (entry.localScale || 1)
      );
      ownedMaterials.push(outlineMat);
      const hull = new THREE.Mesh(entry.mesh.geometry, outlineMat);
      hull.name = `${entry.body}${OUTLINE_SUFFIX}`;
      // Child of the body mesh: inherits the exact transform chain, so the
      // hull overlays the body without any bookkeeping.
      entry.mesh.add(hull);
    }
  }
}

function disposeTrunkMaterials(): void {
  for (const m of ownedMaterials) m.dispose();
  ownedMaterials = [];
  if (ownedRamp) {
    ownedRamp.dispose();
    ownedRamp = null;
  }
}

// Each body moves via a wrapper pivot, never its own node: loaders and
// quantization may store meaningful transforms on the body nodes, and
// setting their position directly would clobber those.
//
// useGLTF caches a singleton scene and StrictMode double-invokes useMemo,
// so wrapping and registration must be idempotent: when a body already
// sits inside its pivot, reuse the pivot and the existing registry.
// Shared by TrunkCanvas (the gate view) and StackTourCanvas (the story),
// which mount the same cached scene at different times.
//
// NOTE: toon/lambert materials ignore the environment map; any canvas
// rendering this model needs real lights (ambient + directional).
export function useTrunkPivots(gltfScene: THREE.Group): {
  pivots: Map<BodyName, THREE.Group>;
} {
  const pivots = useMemo(() => {
    const found = new Map<BodyName, THREE.Group>();
    const registry: TrunkMeshEntry[] = registries.get(gltfScene) ?? [];
    const scaleScratch = new THREE.Vector3();
    for (const name of BODY_NAMES) {
      const obj = gltfScene.getObjectByName(name);
      if (!obj || !obj.parent) continue;
      if (obj.parent.name === `${name}-pivot`) {
        found.set(name, obj.parent as THREE.Group);
        continue;
      }
      const pivot = new THREE.Group();
      pivot.name = `${name}-pivot`;
      obj.parent.add(pivot);
      pivot.add(obj);
      found.set(name, pivot);
      obj.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        if (child.name.endsWith(OUTLINE_SUFFIX)) return;
        const original = child.material as THREE.MeshStandardMaterial;
        child.getWorldScale(scaleScratch);
        registry.push({
          mesh: child,
          body: name,
          baseColor: original.color?.clone() ?? new THREE.Color('#DDDDDD'),
          map: original.map ?? null,
          vertexColors: original.vertexColors ?? false,
          localScale: scaleScratch.x,
        });
      });
    }
    registries.set(gltfScene, registry);
    return found;
  }, [gltfScene]);

  // Apply materials on mount and (debounced) when the material slice of
  // the settings changes. dispose() only drops GPU-side state, so a
  // StrictMode cleanup/re-setup cycle stays safe: three re-uploads on the
  // next use.
  useEffect(() => {
    applyTrunkMaterials(gltfScene);
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastKey = materialSliceKey(getRenderSettings());
    const unsubscribe = subscribeRenderSettings(() => {
      const key = materialSliceKey(getRenderSettings());
      if (key === lastKey) return;
      lastKey = key;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => applyTrunkMaterials(gltfScene), 120);
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
      disposeTrunkMaterials();
    };
  }, [gltfScene]);

  return { pivots };
}
