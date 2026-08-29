/**
 * Shared, mutable state for the live device scene.
 *
 * DeviceScene reads this once per frame in its render loop, so writes take
 * effect immediately without re-running the WebGL setup effect or re-rendering
 * React. The ?debug=true panel writes to it; the demo will write to it too when
 * it drives the camera and the processing state.
 */

export type DeviceControls = {
  caseColor: string;
  /** Shows the processing dots, to pair with the phone's typing bubble. */
  thinking: boolean;
  /**
   * Takes the camera back off the demo clock. The clock owns framing during
   * normal use; the debug panel sets this the moment a camera slider moves, so
   * tuning is possible without the timeline fighting it.
   */
  cameraOverride: boolean;
  /** Camera direction from the device, normalised by the scene. */
  dir: [number, number, number];
  /** Multiplier on the fitted framing distance. */
  dist: number;
  /** Where the device sits in the frame, in radius units. Screen-space pan. */
  offsetX: number;
  offsetY: number;
  /** Surface treatment on the shell: grain frequency, roughness break-up,
      and micro-relief. Not a pattern, just a material quality. */
  grainScale: number;
  grainRough: number;
  grainBump: number;
};

export const DEVICE_DEFAULTS: DeviceControls = {
  caseColor: '#a28f6c',
  thinking: false,
  cameraOverride: false,
  /* Only read while cameraOverride is on. The debug panel seeds these from
     the demo's live camera when it mounts, so what is written here is never
     what you see — the demo's own framing lives in demo/timeline.ts. */
  dir: [-0.34, 0.46, 1.95],
  dist: 1.24,
  offsetX: 0.92,
  offsetY: -0.04,
  grainScale: 130,
  grainRough: 0.5,
  grainBump: 0.09,
};

const state: DeviceControls = { ...DEVICE_DEFAULTS };
const listeners = new Set<(s: DeviceControls) => void>();

export function getDeviceControls(): DeviceControls {
  return state;
}

export function setDeviceControls(patch: Partial<DeviceControls>) {
  Object.assign(state, patch);
  listeners.forEach(fn => fn(state));
}

export function resetDeviceControls() {
  setDeviceControls({ ...DEVICE_DEFAULTS });
}

export function subscribeDeviceControls(fn: (s: DeviceControls) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
