'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  SCREEN_W,
  SCREEN_H,
  drawScreen,
  loadScreenAssets,
  type ScreenAssets,
} from './screenTexture';
import { getDeviceControls, setDeviceControls } from './deviceControls';
import { applyCaseGrain, type GrainUniforms } from './caseMaterial';

/**
 * The Family Book device, live in WebGL.
 *
 * The lock screen is a CanvasTexture on the display mesh itself, so the depth
 * buffer occludes it with the bezel and it stays correct through any camera
 * move — which is what makes panning over to the device possible.
 *
 * The GLB is a CAD export with no UVs, so the display's are generated here by
 * projecting its vertices onto their own plane (see planarUVs).
 */

const MODEL = '/home/trunk.glb';

/**
 * The display panel's own plane: an orthonormal basis and the extent of the
 * mesh within it. The GLB is a CAD export with no UVs, so this is where they
 * come from. The basis is anchored to world up (the model is Y-up, bbox
 * 185 x 109 x 182mm) so the texture lands upright rather than in an arbitrary
 * rotation.
 */
type PanelPlane = {
  u: THREE.Vector3;
  v: THREE.Vector3;
  normal: THREE.Vector3;
  /** Plane offset along the normal. */
  d: number;
  minU: number;
  maxU: number;
  minV: number;
  maxV: number;
};

function panelPlane(mesh: THREE.Mesh): PanelPlane {
  const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
  const idx = mesh.geometry.index;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const world = mesh.matrixWorld;

  let bestArea = -1;
  const normal = new THREE.Vector3(0, 0, 1);
  const triCount = idx ? idx.count / 3 : pos.count / 3;
  for (let t = 0; t < triCount; t += 1) {
    const i0 = idx ? idx.getX(t * 3) : t * 3;
    const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0).applyMatrix4(world);
    b.fromBufferAttribute(pos, i1).applyMatrix4(world);
    c.fromBufferAttribute(pos, i2).applyMatrix4(world);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    const cross = ab.cross(ac);
    const area = cross.length();
    if (area > bestArea) {
      bestArea = area;
      normal.copy(cross).normalize();
    }
  }

  const worldUp = new THREE.Vector3(0, 1, 0);
  const v = worldUp
    .clone()
    .addScaledVector(normal, -worldUp.dot(normal))
    .normalize();
  if (!Number.isFinite(v.x) || v.lengthSq() < 1e-6) v.set(0, 0, 1);
  const u = new THREE.Vector3().crossVectors(v, normal).normalize();

  const p = new THREE.Vector3();
  let minU = Infinity,
    maxU = -Infinity,
    minV = Infinity,
    maxV = -Infinity,
    d = 0;
  for (let i = 0; i < pos.count; i += 1) {
    p.fromBufferAttribute(pos, i).applyMatrix4(world);
    const pu = p.dot(u);
    const pv = p.dot(v);
    d = p.dot(normal);
    if (pu < minU) minU = pu;
    if (pu > maxU) maxU = pu;
    if (pv < minV) minV = pv;
    if (pv > maxV) maxV = pv;
  }
  return { u, v, normal, d, minU, maxU, minV, maxV };
}

/**
 * The panel is larger than the hole it sits behind — roughly a third of it is
 * tucked under the bezel. Mapping the canvas to the whole panel therefore hides
 * whatever is drawn near the edges, which is where a lock screen puts things.
 *
 * So measure the opening: walk a line across the middle of the panel, fire a
 * ray at each step from well in front of the glass straight back at it, and see
 * whether the enclosure gets in the way first. The uncovered run is the
 * aperture. Doing it along the normal rather than from the camera keeps the
 * answer view-independent, and a centre scan is enough because the opening is a
 * rectangle.
 */
function apertureBounds(
  plane: PanelPlane,
  blockers: THREE.Object3D[]
): { uLo: number; uHi: number; vLo: number; vHi: number } {
  const span = Math.max(plane.maxU - plane.minU, plane.maxV - plane.minV);
  const standoff = span;

  // Which side of the panel faces out. The basis normal's sign is whatever the
  // largest triangle's winding gave us, and flipping it would mirror the
  // texture, so carry the side separately: outward points away from the bulk of
  // the enclosure.
  const bulk = new THREE.Box3();
  blockers.forEach(o => bulk.expandByObject(o));
  const panelCentre = new THREE.Vector3()
    .addScaledVector(plane.u, (plane.minU + plane.maxU) / 2)
    .addScaledVector(plane.v, (plane.minV + plane.maxV) / 2)
    .addScaledVector(plane.normal, plane.d);
  const away = panelCentre.clone().sub(bulk.getCenter(new THREE.Vector3()));
  const face = plane.normal
    .clone()
    .multiplyScalar(away.dot(plane.normal) < 0 ? -1 : 1);

  const ray = new THREE.Raycaster();
  // Stop just short of the glass: the ray would otherwise run on through the
  // back of the enclosure and report every sample as covered.
  ray.far = standoff - span * 1e-3;

  const clear = (pu: number, pv: number) => {
    const point = new THREE.Vector3()
      .addScaledVector(plane.u, pu)
      .addScaledVector(plane.v, pv)
      .addScaledVector(plane.normal, plane.d);
    ray.set(
      point.clone().addScaledVector(face, standoff),
      face.clone().negate()
    );
    return ray.intersectObjects(blockers, true).length === 0;
  };

  // Longest uncovered run along one axis, held at the other's midpoint.
  const scan = (lo: number, hi: number, at: number, alongU: boolean) => {
    const STEPS = 400;
    let bestA = lo;
    let bestB = hi;
    let bestLen = -1;
    let runStart: number | null = null;
    for (let i = 0; i <= STEPS; i += 1) {
      const t = lo + ((hi - lo) * i) / STEPS;
      const ok = alongU ? clear(t, at) : clear(at, t);
      if (ok && runStart === null) runStart = t;
      if ((!ok || i === STEPS) && runStart !== null) {
        const end = ok ? t : lo + ((hi - lo) * (i - 1)) / STEPS;
        if (end - runStart > bestLen) {
          bestLen = end - runStart;
          bestA = runStart;
          bestB = end;
        }
        runStart = null;
      }
    }
    return bestLen <= 0 ? [lo, hi] : [bestA, bestB];
  };

  const midV = (plane.minV + plane.maxV) / 2;
  const [uLo, uHi] = scan(plane.minU, plane.maxU, midV, true);
  const midU = (uLo + uHi) / 2;
  const [vLo, vHi] = scan(plane.minV, plane.maxV, midU, false);
  return { uLo, uHi, vLo, vHi };
}

/** Writes UVs that map the canvas onto just the given window of the panel. */
function writeUVs(
  mesh: THREE.Mesh,
  plane: PanelPlane,
  win: { uLo: number; uHi: number; vLo: number; vHi: number }
) {
  const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
  const p = new THREE.Vector3();
  const du = win.uHi - win.uLo || 1;
  const dv = win.vHi - win.vLo || 1;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i += 1) {
    p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    uv[i * 2] = (p.dot(plane.u) - win.uLo) / du;
    // v runs up the panel; the canvas runs down, so invert.
    uv[i * 2 + 1] = 1 - (p.dot(plane.v) - win.vLo) / dv;
  }
  mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

export default function DeviceScene({
  caseColor,
  thinking,
  className,
  onReady,
}: {
  /** Optional overrides. Omitted values leave DEVICE_DEFAULTS alone. */
  caseColor?: string;
  thinking?: boolean;
  className?: string;
  onReady?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);

  // Props feed the shared store, which the render loop reads each frame. That
  // keeps prop changes cheap (no WebGL teardown) and lets the debug panel and
  // the demo drive the same state.
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const patch: Parameters<typeof setDeviceControls>[0] = {};
    if (caseColor !== undefined) patch.caseColor = caseColor;
    if (thinking !== undefined) patch.thinking = thinking;
    if (Object.keys(patch).length) setDeviceControls(patch);
  }, [caseColor, thinking]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let raf = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    // RoomEnvironment is a bright white box. At full strength it floods the
    // shell and the case colour reads as cream whatever you set it to.
    scene.environmentIntensity = 0.4;

    // Deliberately restrained. Lit any harder, ACES rolls the shell off toward
    // white and the case colour stops reading as a colour at all.
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(3, 5, 4);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-4, 2, 2);
    scene.add(key, fill, new THREE.HemisphereLight(0xffffff, 0x9aa38c, 0.45));

    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 100);
    const target = new THREE.Vector3();
    let radius = 1;

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // No visibility gate: requestAnimationFrame already stops firing when the
    // tab is backgrounded, so anything extra only risks parking the loop for
    // good. An IntersectionObserver was especially wrong here — this layer is
    // fixed and full-viewport, so its intersection never changes and one false
    // reading is permanent.

    const canvas = document.createElement('canvas');
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    const ctx = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;

    const caseMats: THREE.MeshStandardMaterial[] = [];
    const caseGrain: GrainUniforms[] = [];
    let assets: ScreenAssets | null = null;
    const start = performance.now();

    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    Promise.all([loader.loadAsync(MODEL), loadScreenAssets()])
      .then(([gltf, a]) => {
        if (disposed) return;
        assets = a;
        const root = gltf.scene;

        // The internals belong to the exploded view, not the finished object.
        ['orin', 'ups'].forEach(n => {
          const o = root.getObjectByName(n);
          if (o) o.visible = false;
        });

        root.traverse(o => {
          if (!(o instanceof THREE.Mesh)) return;
          const isCase =
            o.name.startsWith('enclosure') ||
            (o.parent?.name ?? '').startsWith('enclosure');
          if (isCase) {
            // Ships as metalness 1, which reads as chrome rather than plastic.
            const m = (o.material as THREE.MeshStandardMaterial).clone();
            m.color = new THREE.Color(getDeviceControls().caseColor);
            m.metalness = 0;
            m.roughness = 0.62;
            const live = getDeviceControls();
            caseGrain.push(
              applyCaseGrain(m, {
                scale: live.grainScale,
                rough: live.grainRough,
                bump: live.grainBump,
              })
            );
            o.material = m;
            caseMats.push(m);
          }
        });

        scene.add(root);
        root.updateMatrixWorld(true);

        const display = root.getObjectByName('display');
        // Everything that could sit in front of the glass. The aperture scan
        // needs these as world-space geometry, hence after updateMatrixWorld.
        const blockers: THREE.Object3D[] = [];
        root.traverse(o => {
          if (!(o instanceof THREE.Mesh) || !o.visible) return;
          if (display && (o === display || display.getObjectById(o.id))) return;
          blockers.push(o);
        });

        display?.traverse(o => {
          if (!(o instanceof THREE.Mesh)) return;
          const plane = panelPlane(o);
          const win = apertureBounds(plane, blockers);
          writeUVs(o, plane, win);
          // Size the canvas to the opening so the design maps 1:1 rather than
          // being stretched to the panel's own proportions.
          const aspect = (win.uHi - win.uLo) / (win.vHi - win.vLo);
          const w = Math.round(SCREEN_H * aspect);
          if (w > 0 && w !== canvas.width) {
            canvas.width = w;
            texture.needsUpdate = true;
          }
          o.material = new THREE.MeshBasicMaterial({ map: texture });
        });

        const box = new THREE.Box3();
        root.traverse(o => {
          if (o instanceof THREE.Mesh && o.visible) box.expandByObject(o);
        });
        box.getCenter(target);
        radius = box.getSize(new THREE.Vector3()).length() / 2;
        resize();
        onReadyRef.current?.();
      })
      .catch(() => {
        /* the static poster underneath stays visible */
      });

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!assets) return;
      const time = (performance.now() - start) / 1000;
      const live = getDeviceControls();

      drawScreen(ctx, assets, { time, thinking: live.thinking, still });
      texture.needsUpdate = true;

      caseMats.forEach(m => m.color.set(live.caseColor));
      caseGrain.forEach(g => {
        // Cycles across the object, so the slider means the same thing
        // whatever units the GLB was exported in.
        g.uGrainScale.value = live.grainScale / Math.max(radius, 1e-6);
        g.uGrainRough.value = live.grainRough;
        g.uGrainBump.value = live.grainBump;
      });

      const dir = new THREE.Vector3(...live.dir).normalize();
      // Fit the bounding sphere to whichever viewport dimension is tighter, so
      // the device keeps its size across aspect ratios.
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const fit = radius / Math.sin(Math.min(vFov, hFov) / 2);

      // Shifting camera and look-at together slides the device across the
      // frame without rotating it — the canvas is full-viewport, so this is
      // what places it, and what a fly-around animates.
      const right = new THREE.Vector3()
        .crossVectors(dir, new THREE.Vector3(0, 1, 0))
        .normalize();
      const up = new THREE.Vector3().crossVectors(right, dir).normalize();
      const pan = right
        .multiplyScalar(live.offsetX * radius)
        .addScaledVector(up, live.offsetY * radius);

      camera.position
        .copy(target)
        .addScaledVector(dir, fit * live.dist)
        .add(pan);
      camera.lookAt(target.clone().add(pan));

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      texture.dispose();
      env.texture.dispose();
      pmrem.dispose();
      scene.traverse(o => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material;
          (Array.isArray(m) ? m : [m]).forEach(x => x.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} />;
}
