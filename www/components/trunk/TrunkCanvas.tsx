'use client';

import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, useGLTF } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { cameraPose, explodeOffset } from './explodeTimeline';
import { useScrollProgress } from './useScrollProgress';
import { useTrunkPivots } from './useTrunkPivots';

const MODEL_URL = '/fundraising/trunk.glb';
const SMOOTHING = 0.08;

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

  const { pivots } = useTrunkPivots(gltfScene);

  useFrame(state => {
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
    // Fills its positioned parent (the viewer card), not the viewport: the
    // page pins the card itself, so the canvas must not escape its corners.
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
            {/* Toon materials ignore the environment map: the cel bands come
                from these lights. */}
            <ambientLight intensity={1.35} />
            <directionalLight position={[1.5, 2.5, 2]} intensity={1.3} />
            <directionalLight position={[-2, 1, -1]} intensity={0.45} />
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
