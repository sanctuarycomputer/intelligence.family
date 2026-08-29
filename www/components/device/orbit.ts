/**
 * The angle the visitor has turned the device to.
 *
 * A module store for the same reason as deviceControls: the render loop reads
 * it every frame, and the surface that captures the drag is a separate element
 * in a different part of the tree. React never needs to know about it.
 *
 * Held as an offset from whatever the camera would otherwise be doing, rather
 * than as an absolute pose, so the demo's own framing stays in charge and this
 * only leans on top of it.
 */

export type Orbit = { yaw: number; pitch: number };

/**
 * How far the device can be turned, in radians — roughly 43 degrees of yaw and
 * 17 of pitch.
 *
 * Bounded by legibility rather than by geometry: past this the screen is
 * foreshortened enough that the lock screen stops reading, and pitching much
 * further approaches the pole, where the up vector degenerates and the device
 * starts to roll.
 */
const YAW_LIMIT = 0.75;
const PITCH_LIMIT = 0.3;

/**
 * Radians per pixel dragged. Slow enough that crossing the device takes a
 * deliberate sweep rather than a flick — at the first setting a casual 120px
 * drag spun it most of the way to the stop.
 */
export const DRAG_SPEED = 0.0032;

const orbit: Orbit = { yaw: 0, pitch: 0 };

export function getOrbit(): Orbit {
  return orbit;
}

/** Adds a drag delta, clamped. Returns the result for callers that want it. */
export function addOrbit(dYaw: number, dPitch: number): Orbit {
  orbit.yaw = clamp(orbit.yaw + dYaw, YAW_LIMIT);
  orbit.pitch = clamp(orbit.pitch + dPitch, PITCH_LIMIT);
  return orbit;
}

export function resetOrbit() {
  orbit.yaw = 0;
  orbit.pitch = 0;
}

function clamp(value: number, limit: number): number {
  return Math.min(limit, Math.max(-limit, value));
}

/**
 * The framing the scene is actually rendering, orbit and manual override
 * included.
 *
 * Published by the render loop and read by the debug panel's "keep view",
 * which is how a framing arrived at by dragging — or by pushing the device
 * panel's camera sliders around — becomes the committed ambient pose. All four
 * values, not just the angle: a view found by moving the distance and the pan
 * is not reproducible from its direction alone.
 *
 * Plain numbers rather than a vector type. orbit.ts is imported by the pointer
 * surface, which must not pull three.js into the main bundle.
 */
export type ViewPose = {
  dir: [number, number, number];
  dist: number;
  offsetX: number;
  offsetY: number;
};

let viewPose: ViewPose | null = null;

export function setViewPose(pose: ViewPose) {
  viewPose = pose;
}

/**
 * Null until the scene has actually drawn a frame — no WebGL, or the model
 * still loading. Callers must handle that rather than capture a placeholder
 * and overwrite a good pose with it.
 */
export function getViewPose(): ViewPose | null {
  return viewPose;
}
