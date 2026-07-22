'use client';

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, useGLTF } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  BODY_NAMES,
  cameraPose,
  explodeOffset,
  type BodyName,
} from './explodeTimeline';
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
  // Use the store's get() accessor so we access scene/gl inside the effect
  // without triggering react-hooks/immutability (React 19 compiler rule).
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
  const camera = useThree(s => s.camera);

  // Each body moves via a wrapper pivot, never its own node: loaders and
  // quantization may store meaningful transforms on the body nodes, and
  // setting their position directly would clobber those.
  //
  // useGLTF caches a singleton scene and StrictMode double-invokes useMemo,
  // so the wrapping must be idempotent: when a body already sits inside its
  // pivot, reuse that pivot (and re-collect its clay material for disposal
  // tracking) instead of nesting a second pivot and minting fresh materials.
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

  useFrame((state) => {
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
    // Vertical fov is fixed in three.js, so narrow aspects need extra camera
    // distance to keep the trunk horizontally framed.
    const { width, height } = state.size;
    const aspect = width / height;
    const REF_ASPECT = 1.6;
    const dolly = Math.min(1.8, Math.max(1, REF_ASPECT / aspect));
    const px = pose.target[0] + (pose.position[0] - pose.target[0]) * dolly;
    const py = pose.target[1] + (pose.position[1] - pose.target[1]) * dolly;
    const pz = pose.target[2] + (pose.position[2] - pose.target[2]) * dolly;
    camera.position.set(px, py, pz);
    camera.lookAt(...pose.target);
  });

  return <primitive object={gltfScene} />;
}

// A broken canvas must never break the fundraising flow: on any render
// error (WebGL unavailable, asset failure) the page falls back to copy
// on the sage background.
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error('TrunkCanvas failed to render:', error);
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
            <TrunkModel
              storyElementId={storyElementId}
              progressOverride={progressOverride}
            />
            {/* Plane sits below the UPS's fully-exploded rest position (y ≈ −0.137). */}
            <ContactShadows
              position={[0.09, -0.16, 0.085]}
              scale={0.8}
              blur={2.5}
              opacity={0.35}
              far={0.45}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
