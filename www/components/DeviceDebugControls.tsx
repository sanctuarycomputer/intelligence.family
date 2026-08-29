'use client';

import { useEffect, useState } from 'react';
import {
  DEVICE_DEFAULTS,
  setDeviceControls,
} from '@/components/device/deviceControls';
import { read as readDemo } from '@/components/demo/demoClock';

/**
 * ?debug=true panel for the homepage device.
 *
 * Every control writes to the shared store the WebGL loop reads each frame, so
 * changes land live without remounting the scene. The canvas is full-viewport
 * and the device is placed by the camera, so position is `offset` here rather
 * than CSS — the same values a fly-around will animate.
 *
 * Never reaches real visitors: the mount is gated on the debug flag and lazily
 * imported.
 */

type Knob = {
  key:
    | 'x'
    | 'y'
    | 'z'
    | 'dist'
    | 'offsetX'
    | 'offsetY'
    | 'grainScale'
    | 'grainRough'
    | 'grainBump';
  label: string;
  min: number;
  max: number;
  step: number;
};

const KNOBS: Knob[] = [
  { key: 'offsetX', label: 'pan x', min: -6, max: 6, step: 0.02 },
  { key: 'offsetY', label: 'pan y', min: -4, max: 4, step: 0.02 },
  { key: 'dist', label: 'distance', min: 0.25, max: 3, step: 0.01 },
  { key: 'x', label: 'cam x', min: -3, max: 3, step: 0.02 },
  { key: 'y', label: 'cam y', min: -1.5, max: 2.5, step: 0.02 },
  { key: 'z', label: 'cam z', min: -3, max: 3, step: 0.02 },
  { key: 'grainScale', label: 'grain', min: 80, max: 1400, step: 10 },
  { key: 'grainRough', label: 'rough', min: 0, max: 1, step: 0.01 },
  { key: 'grainBump', label: 'relief', min: 0, max: 0.3, step: 0.005 },
];

/* Sampled from the prototype photos in public/opportunity. */
const CASE_PRESETS = [
  { name: 'bone', hex: '#E9DCC0' },
  { name: 'sand', hex: '#DFCEA8' },
  { name: 'putty', hex: '#E4DDD0' },
  { name: 'oat', hex: '#F1E7D2' },
  { name: 'clay', hex: '#D8C3A5' },
  { name: 'white', hex: '#F6F4EF' },
];

export default function DeviceDebugControls() {
  /* Seeded from wherever the demo's camera actually is, not from the stored
     defaults. These sliders only take effect once Manual cam is on, and
     starting them anywhere else means flipping that switch jumps the device. */
  const [dir, setDir] = useState<[number, number, number]>(() => [
    ...readDemo().camera.dir,
  ]);
  const [dist, setDist] = useState(() => readDemo().camera.dist);
  const [offsetX, setOffsetX] = useState(() => readDemo().camera.offsetX);
  const [offsetY, setOffsetY] = useState(() => readDemo().camera.offsetY);
  const [grain, setGrain] = useState({
    grainScale: DEVICE_DEFAULTS.grainScale,
    grainRough: DEVICE_DEFAULTS.grainRough,
    grainBump: DEVICE_DEFAULTS.grainBump,
  });
  const [caseHex, setCaseHex] = useState(DEVICE_DEFAULTS.caseColor);
  /* The demo clock owns framing by default. Touching a camera slider takes it
     back, so tuning is possible without the timeline overwriting every frame. */
  const [cameraOverride, setCameraOverride] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setDeviceControls({
      caseColor: caseHex,
      cameraOverride,
      dir,
      dist,
      offsetX,
      offsetY,
      thinking,
      ...grain,
    });
  }, [caseHex, cameraOverride, dir, dist, offsetX, offsetY, thinking, grain]);

  const valueOf = (k: Knob['key']) => {
    if (k === 'x') return dir[0];
    if (k === 'y') return dir[1];
    if (k === 'z') return dir[2];
    if (k === 'dist') return dist;
    if (k === 'offsetX') return offsetX;
    if (k === 'offsetY') return offsetY;
    return grain[k];
  };

  const setValue = (k: Knob['key'], v: number) => {
    if (k !== 'grainScale' && k !== 'grainRough' && k !== 'grainBump') {
      setCameraOverride(true);
    }
    if (k === 'dist') return setDist(v);
    if (k === 'offsetX') return setOffsetX(v);
    if (k === 'offsetY') return setOffsetY(v);
    if (k === 'grainScale' || k === 'grainRough' || k === 'grainBump') {
      return setGrain(prev => ({ ...prev, [k]: v }));
    }
    const i = k === 'x' ? 0 : k === 'y' ? 1 : 2;
    setDir(prev => {
      const next: [number, number, number] = [...prev];
      next[i] = v;
      return next;
    });
  };

  const reset = () => {
    const live = readDemo().camera;
    setDir([...live.dir]);
    setDist(live.dist);
    setOffsetX(live.offsetX);
    setOffsetY(live.offsetY);
    setGrain({
      grainScale: DEVICE_DEFAULTS.grainScale,
      grainRough: DEVICE_DEFAULTS.grainRough,
      grainBump: DEVICE_DEFAULTS.grainBump,
    });
    setCaseHex(DEVICE_DEFAULTS.caseColor);
    setThinking(false);
    setCameraOverride(false);
  };

  /**
   * Emits the finish only, as lines to drop into DEVICE_DEFAULTS.
   *
   * Not the camera: those sliders are a viewing aid for checking the case at
   * any angle, and the panel seeds them from the demo's live camera, so a pose
   * copied from here would be a number that looks committed and does nothing.
   * The framing the demo opens on is the demo panel's ambient camera.
   */
  const copy = async () => {
    await navigator.clipboard.writeText(
      [
        `  caseColor: '${caseHex}',`,
        `  grainScale: ${grain.grainScale},`,
        `  grainRough: ${grain.grainRough},`,
        `  grainBump: ${grain.grainBump},`,
      ].join('\n')
    );
    setCopied('Copied');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="device-debug" role="group" aria-label="Device scene">
      <p className="device-debug-title">device</p>

      {KNOBS.map(k => (
        <label key={k.key} className="device-debug-row">
          <span className="device-debug-label">{k.label}</span>
          <input
            type="range"
            min={k.min}
            max={k.max}
            step={k.step}
            value={valueOf(k.key)}
            onChange={e => setValue(k.key, Number(e.target.value))}
          />
          <span className="device-debug-value">
            {valueOf(k.key).toFixed(2)}
          </span>
        </label>
      ))}

      <label className="device-debug-row">
        <span className="device-debug-label">case</span>
        <input
          type="color"
          value={caseHex}
          onChange={e => setCaseHex(e.target.value)}
        />
        <span className="device-debug-value">{caseHex}</span>
      </label>

      <div className="device-debug-swatches">
        {CASE_PRESETS.map(c => (
          <button
            key={c.hex}
            type="button"
            title={`${c.name} ${c.hex}`}
            aria-label={c.name}
            onClick={() => setCaseHex(c.hex)}
            style={{ background: c.hex }}
            className={caseHex === c.hex ? 'is-active' : undefined}
          />
        ))}
      </div>

      <div className="device-debug-actions">
        <button
          type="button"
          onClick={() => setThinking(t => !t)}
          className={thinking ? 'is-on' : undefined}
        >
          {thinking ? 'Thinking ✓' : 'Thinking'}
        </button>
        <button
          type="button"
          onClick={copy}
          title="the case finish, as lines for DEVICE_DEFAULTS. Camera lives in the demo panel."
        >
          {copied ?? 'Copy finish'}
        </button>
        <button
          type="button"
          onClick={() => setCameraOverride(v => !v)}
          className={cameraOverride ? 'is-on' : undefined}
          title="take the camera off the demo clock"
        >
          {cameraOverride ? 'Manual cam ✓' : 'Manual cam'}
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
