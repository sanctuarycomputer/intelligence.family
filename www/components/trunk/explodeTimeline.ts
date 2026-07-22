// Pure math for the scroll-driven exploded view. No three.js imports so
// it stays trivially unit-testable. World units are meters; the model
// sits at roughly x 0..0.185, y -0.04..0.06, z 0..0.17.

export const BODY_NAMES = [
  'enclosure-back',
  'enclosure-front',
  'enclosure-top',
  'leaf',
  'display',
  'orin',
  'ups',
] as const;

export type BodyName = (typeof BODY_NAMES)[number];

export type Vec3 = [number, number, number];

// Hand-authored explode directions (approved in the spec): top lifts,
// leaf floats higher, front swings forward with the display layered
// behind it, orin slides out, ups drops beneath it, back recedes.
export const EXPLODE_VECTORS: Record<BodyName, Vec3> = {
  'enclosure-top': [0, 0.13, 0],
  leaf: [0, 0.2, 0],
  'enclosure-front': [0, 0, 0.16],
  display: [0, 0, 0.1],
  orin: [0.12, 0.02, 0],
  ups: [0.12, -0.1, 0],
  'enclosure-back': [0, 0, -0.14],
};

export interface StaggerWindow {
  start: number;
  end: number;
}

export const STAGGER: Record<BodyName, StaggerWindow> = {
  'enclosure-top': { start: 0.04, end: 0.18 },
  leaf: { start: 0.1, end: 0.26 },
  'enclosure-front': { start: 0.22, end: 0.4 },
  display: { start: 0.28, end: 0.46 },
  orin: { start: 0.42, end: 0.6 },
  ups: { start: 0.56, end: 0.74 },
  'enclosure-back': { start: 0.72, end: 0.9 },
};

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function bodyProgress(body: BodyName, t: number): number {
  const { start, end } = STAGGER[body];
  if (t <= start) return 0;
  if (t >= end) return 1;
  return smoothstep(start, end, t);
}

export function explodeOffset(body: BodyName, t: number): Vec3 {
  const p = bodyProgress(body, t);
  const v = EXPLODE_VECTORS[body];
  if (p === 0) return [0, 0, 0];
  if (p === 1) return v;
  return [v[0] * p, v[1] * p, v[2] * p];
}

export interface CameraPose {
  position: Vec3;
  target: Vec3;
}

// Opening three-quarter hero, swing left as the front comes off, drop to
// eye level for the orin/ups separation (the money shot), pull back high
// for the full exploded family portrait.
export const CAMERA_KEYFRAMES: { t: number; pose: CameraPose }[] = [
  { t: 0, pose: { position: [0.37, 0.17, 0.5], target: [0.09, 0.02, 0.085] } },
  { t: 0.35, pose: { position: [-0.25, 0.12, 0.45], target: [0.09, 0.03, 0.09] } },
  { t: 0.65, pose: { position: [0.45, -0.02, 0.3], target: [0.11, -0.03, 0.07] } },
  { t: 1, pose: { position: [0.42, 0.16, 0.55], target: [0.09, 0.02, 0.07] } },
];

function lerpVec(a: Vec3, b: Vec3, p: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
}

export function cameraPose(t: number): CameraPose {
  const kfs = CAMERA_KEYFRAMES;
  if (t <= kfs[0].t) return kfs[0].pose;
  if (t >= kfs[kfs.length - 1].t) return kfs[kfs.length - 1].pose;
  let i = 0;
  while (t > kfs[i + 1].t) i++;
  const a = kfs[i];
  const b = kfs[i + 1];
  const p = smoothstep(a.t, b.t, t);
  return {
    position: lerpVec(a.pose.position, b.pose.position, p),
    target: lerpVec(a.pose.target, b.pose.target, p),
  };
}
