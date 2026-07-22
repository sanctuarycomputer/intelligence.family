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
  const sheetEdgeGeo = useMemo(
    () => new THREE.EdgesGeometry(sheetGeo),
    [sheetGeo]
  );
  const slabGeo = useMemo(() => new THREE.BoxGeometry(0.1, 0.004, 0.085), []);
  const slabEdgeGeo = useMemo(
    () => new THREE.EdgesGeometry(slabGeo),
    [slabGeo]
  );
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
