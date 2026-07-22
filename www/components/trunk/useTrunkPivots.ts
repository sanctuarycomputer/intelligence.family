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
