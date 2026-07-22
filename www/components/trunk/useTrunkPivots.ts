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

// Shared stepped ramp for every MeshToonMaterial: four flat shading bands.
// Module-level singleton (a few bytes; never disposed) so both canvases and
// StrictMode re-invocations reuse one texture.
let toonRamp: THREE.DataTexture | null = null;
function getToonRamp(): THREE.DataTexture {
  if (!toonRamp) {
    const steps = new Uint8Array([152, 196, 228, 255]);
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
    const toonify = (obj: THREE.Object3D, clayColor?: string) => {
      const clay = clayColor
        ? new THREE.MeshToonMaterial({ color: clayColor, gradientMap: ramp })
        : null;
      if (clay) materials.push(clay);
      obj.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        if (child.material instanceof THREE.MeshToonMaterial) return;
        if (clay) {
          child.material = clay;
          return;
        }
        const old = child.material as THREE.MeshStandardMaterial;
        const toon = new THREE.MeshToonMaterial({
          color: old.color?.clone() ?? new THREE.Color('#DDDDDD'),
          map: old.map ?? null,
          vertexColors: old.vertexColors ?? false,
          gradientMap: ramp,
        });
        materials.push(toon);
        child.material = toon;
      });
    };

    // Re-collect materials on re-invocation so disposal tracking survives
    // StrictMode without minting duplicates.
    const collect = (obj: THREE.Object3D) => {
      obj.traverse(child => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshToonMaterial &&
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
        collect(obj);
        continue;
      }
      const pivot = new THREE.Group();
      pivot.name = `${name}-pivot`;
      obj.parent.add(pivot);
      pivot.add(obj);
      found.set(name, pivot);
      toonify(obj, CLAY_COLORS[name]);
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
