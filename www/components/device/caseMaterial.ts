import * as THREE from 'three';

/**
 * Surface treatment for the enclosure.
 *
 * The GLB is a CAD export with no UVs, so there is nothing to map a texture
 * onto. Instead this patches MeshStandardMaterial's shader to derive a value
 * noise from world position — which needs no UVs, follows the curvature, and
 * never seams.
 *
 * The noise is squashed on one axis so the grain runs directionally, the way
 * wood or a moulded composite does. It perturbs roughness (so highlights break
 * up rather than sliding cleanly over the shell) and nudges the normal a touch
 * for tactile micro-relief. Deliberately not a pattern you can read as a
 * pattern: at rest it should just make the plastic look less synthetic.
 */

export type GrainUniforms = {
  uGrainScale: { value: number };
  uGrainRough: { value: number };
  uGrainBump: { value: number };
};

const NOISE_GLSL = /* glsl */ `
  varying vec3 vGrainPos;

  float grainHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float grainNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(grainHash(i + vec3(0,0,0)), grainHash(i + vec3(1,0,0)), f.x),
          mix(grainHash(i + vec3(0,1,0)), grainHash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(grainHash(i + vec3(0,0,1)), grainHash(i + vec3(1,0,1)), f.x),
          mix(grainHash(i + vec3(0,1,1)), grainHash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  /* Three octaves, stretched on Y so the grain runs along the shell. */
  float grainFbm(vec3 p) {
    vec3 g = p * vec3(1.0, 0.16, 1.0);
    return grainNoise(g) * 0.6
         + grainNoise(g * 2.7) * 0.28
         + grainNoise(g * 6.9) * 0.12;
  }
`;

/**
 * Patches a material in place and returns its grain uniforms so the caller can
 * tune them per frame.
 */
export function applyCaseGrain(
  material: THREE.MeshStandardMaterial,
  initial: { scale?: number; rough?: number; bump?: number } = {}
): GrainUniforms {
  const uniforms: GrainUniforms = {
    uGrainScale: { value: initial.scale ?? 420 },
    uGrainRough: { value: initial.rough ?? 0.34 },
    uGrainBump: { value: initial.bump ?? 0.05 },
  };

  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vGrainPos;`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vGrainPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uGrainScale;
         uniform float uGrainRough;
         uniform float uGrainBump;
         ${NOISE_GLSL}`
      )
      // Roughness first: this is what actually reads as surface quality.
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         float grain = grainFbm(vGrainPos * uGrainScale);
         roughnessFactor = clamp(
           roughnessFactor + (grain - 0.5) * uGrainRough, 0.06, 1.0);`
      )
      // Then a light normal nudge for micro-relief, sampled off-axis so it
      // isn't just the same field again.
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
         vec3 gN = vec3(
           grainFbm(vGrainPos * uGrainScale + 11.3),
           grainFbm(vGrainPos * uGrainScale + 27.7),
           grainFbm(vGrainPos * uGrainScale + 41.1)) - 0.5;
         normal = normalize(normal + gN * uGrainBump);`
      );
  };

  // Force a recompile if the material was already used.
  material.needsUpdate = true;
  return uniforms;
}
