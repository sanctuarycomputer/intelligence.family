'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { BODY_NAMES, type BodyName } from './explodeTimeline';

// Clay brand tones for the shell bodies; the electronics keep their CAD
// colours but share the same toon treatment so the whole device reads as
// one cel-shaded object.
const CLAY_COLORS: Partial<Record<BodyName, string>> = {
  'enclosure-back': '#CAD4C6',
  'enclosure-front': '#B8C6B0',
  'enclosure-top': '#B8C6B0',
  leaf: '#5E7B29',
};

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
const OUTLINE_COLOR = '#596647';
// Outline thickness in world metres (device is ~0.185 m wide).
const OUTLINE_WORLD_THICKNESS = 0.0012;
const OUTLINE_SUFFIX = '-cel-outline';

// The hull offset happens in the mesh's local (quantised) space, so each
// body needs the world thickness divided by its own node scale. Distinct
// shader constants need distinct program cache keys.
function makeOutlineMaterial(localThickness: number): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: OUTLINE_COLOR,
    side: THREE.BackSide,
  });
  mat.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = position + normal * ${localThickness.toFixed(6)};`
    );
  };
  mat.customProgramCacheKey = () => `cel-outline-${localThickness.toFixed(6)}`;
  return mat;
}

// Shared stepped ramp for every MeshToonMaterial: three flat shading bands
// (fewer, harder steps keep each face of the wedge in a distinct band, so
// the case's contours stay legible).
// Module-level singleton (a few bytes; never disposed) so both canvases and
// StrictMode re-invocations reuse one texture.
let toonRamp: THREE.DataTexture | null = null;
function getToonRamp(): THREE.DataTexture {
  if (!toonRamp) {
    const steps = new Uint8Array([135, 195, 255]);
    toonRamp = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
    toonRamp.minFilter = THREE.NearestFilter;
    toonRamp.magFilter = THREE.NearestFilter;
    toonRamp.needsUpdate = true;
  }
  return toonRamp;
}

// Each body moves via a wrapper pivot, never its own node: loaders and
// quantization may store meaningful transforms on the body nodes, and
// setting their position directly would clobber those.
//
// useGLTF caches a singleton scene and StrictMode double-invokes useMemo,
// so the wrapping must be idempotent: when a body already sits inside its
// pivot, reuse that pivot (and re-collect its materials for disposal
// tracking) instead of nesting a second pivot and minting fresh materials.
// A mesh whose material is already MeshToonMaterial has been processed.
// Shared by TrunkCanvas (the gate view) and StackTourCanvas (the story),
// which mount the same cached scene at different times.
//
// NOTE: toon materials ignore the environment map; any canvas rendering
// this model needs real lights (ambient + directional) for the cel bands.
export function useTrunkPivots(gltfScene: THREE.Group): {
  pivots: Map<BodyName, THREE.Group>;
  clayMaterials: THREE.Material[];
} {
  const { pivots, clayMaterials } = useMemo(() => {
    const found = new Map<BodyName, THREE.Group>();
    const materials: THREE.Material[] = [];
    const ramp = getToonRamp();

    // Swap a body's materials for toon: one shared clay material when the
    // body has a clay colour, else per-material colour-preserving toon.
    // Outlined bodies also gain their inverted-hull silhouette mesh.
    const scaleScratch = new THREE.Vector3();
    const toonify = (obj: THREE.Object3D, name: BodyName) => {
      const clayColor = CLAY_COLORS[name];
      const clay = clayColor
        ? new THREE.MeshToonMaterial({ color: clayColor, gradientMap: ramp })
        : null;
      if (clay) materials.push(clay);
      obj.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        if (child.name.endsWith(OUTLINE_SUFFIX)) return;
        if (child.material instanceof THREE.MeshToonMaterial) return;
        if (clay) {
          child.material = clay;
        } else {
          const old = child.material as THREE.MeshStandardMaterial;
          const toon = new THREE.MeshToonMaterial({
            color: old.color?.clone() ?? new THREE.Color('#DDDDDD'),
            map: old.map ?? null,
            vertexColors: old.vertexColors ?? false,
            gradientMap: ramp,
          });
          materials.push(toon);
          child.material = toon;
        }
        if (OUTLINED.has(name)) {
          child.getWorldScale(scaleScratch);
          const outlineMat = makeOutlineMaterial(
            OUTLINE_WORLD_THICKNESS / (scaleScratch.x || 1)
          );
          materials.push(outlineMat);
          const hull = new THREE.Mesh(child.geometry, outlineMat);
          hull.name = `${name}${OUTLINE_SUFFIX}`;
          // Child of the body mesh: inherits the exact transform chain, so
          // the hull overlays the body without any bookkeeping.
          child.add(hull);
        }
      });
    };

    // Re-collect materials on re-invocation so disposal tracking survives
    // StrictMode without minting duplicates. Outline hulls count too.
    const collect = (obj: THREE.Object3D) => {
      obj.traverse(child => {
        if (
          child instanceof THREE.Mesh &&
          (child.material instanceof THREE.MeshToonMaterial ||
            child.name.endsWith(OUTLINE_SUFFIX)) &&
          !materials.includes(child.material as THREE.Material)
        ) {
          materials.push(child.material as THREE.Material);
        }
      });
    };

    for (const name of BODY_NAMES) {
      const obj = gltfScene.getObjectByName(name);
      if (!obj || !obj.parent) continue;
      if (obj.parent.name === `${name}-pivot`) {
        found.set(name, obj.parent as THREE.Group);
        collect(obj);
        continue;
      }
      const pivot = new THREE.Group();
      pivot.name = `${name}-pivot`;
      obj.parent.add(pivot);
      pivot.add(obj);
      found.set(name, pivot);
      toonify(obj, name);
    }
    return { pivots: found, clayMaterials: materials };
  }, [gltfScene]);

  // Free the created materials' GPU resources on unmount. dispose() only
  // drops GPU-side state, so a StrictMode cleanup/re-setup cycle stays
  // safe: three re-uploads the material on its next use.
  useEffect(() => {
    return () => {
      for (const material of clayMaterials) material.dispose();
    };
  }, [clayMaterials]);

  return { pivots, clayMaterials };
}
