'use client';

import { useEffect, useState } from 'react';
import { getTime, play, replay, resume, seek, subscribe } from './demoClock';
import {
  BEAT,
  END,
  EXCHANGES,
  HERO_POSE,
  resetHeroPose,
  setHeroPose,
} from './timeline';
import type { DemoPhase } from './demoState';
import { getViewDir, resetOrbit } from '@/components/device/orbit';

/**
 * ?debug=true stage scrubber and ambient framing.
 *
 * Waiting seventeen seconds to look at the email card is not a workflow, so
 * this parks the clock anywhere on the timeline. Seeking is just stateAt(t),
 * which is why it costs nothing: there is no sequence to fast-forward through.
 *
 * The second half sets where the ambient view starts. It is separate from the
 * device panel's camera sliders, which take the camera off the clock entirely
 * for material tuning; these change the pose the demo actually opens on and
 * drifts away from.
 */

type PoseKnob = {
  key: 'x' | 'y' | 'z' | 'dist' | 'offsetX' | 'offsetY';
  label: string;
  min: number;
  max: number;
};

const POSE_KNOBS: PoseKnob[] = [
  { key: 'x', label: 'cam x', min: -3, max: 3 },
  { key: 'y', label: 'cam y', min: -1.5, max: 2.5 },
  { key: 'z', label: 'cam z', min: -3, max: 3 },
  { key: 'dist', label: 'distance', min: 0.4, max: 3 },
  { key: 'offsetX', label: 'pan x', min: -3, max: 4 },
  { key: 'offsetY', label: 'pan y', min: -2.5, max: 2.5 },
];

export default function DemoDebugControls() {
  const [t, setT] = useState(() => getTime());
  const [phase, setPhase] = useState<DemoPhase>('idle');

  useEffect(
    () =>
      subscribe((_, p) => {
        setPhase(p);
        setT(getTime());
      }),
    []
  );

  // While the clock runs, follow it rather than fighting it.
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      setT(getTime());
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const jump = (seconds: number) => seek(seconds);

  /* Mirrors HERO_POSE, which the panel mutates. Kept in state so the sliders
     and readouts re-render; the scene reads the pose itself each frame. */
  const [pose, setPose] = useState(() => ({
    ...HERO_POSE,
    dir: [...HERO_POSE.dir] as [number, number, number],
  }));
  const [copied, setCopied] = useState(false);

  const syncPose = () => {
    setPose({
      ...HERO_POSE,
      dir: [...HERO_POSE.dir] as [number, number, number],
    });
    // The ambient pose is only visible while idle, so show what was changed.
    if (getTime() !== 0) replay();
  };

  const poseValue = (k: PoseKnob['key']) =>
    k === 'x'
      ? pose.dir[0]
      : k === 'y'
        ? pose.dir[1]
        : k === 'z'
          ? pose.dir[2]
          : pose[k];

  const setPoseValue = (k: PoseKnob['key'], v: number) => {
    if (k === 'x' || k === 'y' || k === 'z') {
      const dir: [number, number, number] = [...HERO_POSE.dir];
      dir[k === 'x' ? 0 : k === 'y' ? 1 : 2] = v;
      setHeroPose({ dir });
    } else {
      setHeroPose({ [k]: v });
    }
    syncPose();
  };

  /* Drag the device to an angle you like, then keep it. Far easier than
     finding the same view by pushing three direction sliders around. */
  const keepCurrentView = () => {
    const dir = getViewDir();
    // Nothing has rendered yet, so there is no view to keep.
    if (!dir) return;
    setHeroPose({ dir: dir.map(round) as [number, number, number] });
    resetOrbit();
    syncPose();
  };

  const copyPose = async () => {
    const body = [
      `  dir: [${pose.dir.map(round).join(', ')}],`,
      `  dist: ${round(pose.dist)},`,
      `  offsetX: ${round(pose.offsetX)},`,
      `  offsetY: ${round(pose.offsetY)},`,
    ].join('\n');
    await navigator.clipboard.writeText(
      `export const HERO_POSE: CameraPose = {\n${body}\n};`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="device-debug demo-debug" role="group" aria-label="Demo">
      <p className="device-debug-title">demo · {phase}</p>

      <label className="device-debug-row">
        <span className="device-debug-label">t</span>
        <input
          type="range"
          min={0}
          max={END}
          step={0.05}
          value={t}
          onChange={e => jump(Number(e.target.value))}
        />
        <span className="device-debug-value">{t.toFixed(2)}</span>
      </label>

      <div className="device-debug-actions">
        <button type="button" onClick={() => jump(0)}>
          intro
        </button>
        {EXCHANGES.map((ex, i) => (
          <button key={ex.id} type="button" onClick={() => jump(ex.start)}>
            {i + 1}
          </button>
        ))}
        <button type="button" onClick={() => jump(END)}>
          end
        </button>
      </div>

      <div className="device-debug-actions">
        <button type="button" onClick={play}>
          play
        </button>
        <button type="button" onClick={resume}>
          resume
        </button>
        <button type="button" onClick={replay}>
          reset
        </button>
      </div>

      <div className="device-debug-actions">
        {/* The two beats worth landing on exactly, per exchange. */}
        <button
          type="button"
          onClick={() => jump(EXCHANGES[0].start + BEAT.think + 0.2)}
          title="device thinking, phone not yet typing"
        >
          think
        </button>
        <button
          type="button"
          onClick={() => jump(EXCHANGES[0].start + BEAT.label + 0.2)}
          title="card up, label on"
        >
          card
        </button>
        <button
          type="button"
          onClick={() => jump(EXCHANGES[2].start + BEAT.trailing + 0.2)}
          title="email sent"
        >
          sent
        </button>
      </div>

      <p className="device-debug-title device-debug-title--gap">
        ambient camera
      </p>

      {POSE_KNOBS.map(k => (
        <label key={k.key} className="device-debug-row">
          <span className="device-debug-label">{k.label}</span>
          <input
            type="range"
            min={k.min}
            max={k.max}
            step={0.01}
            value={poseValue(k.key)}
            onChange={e => setPoseValue(k.key, Number(e.target.value))}
          />
          <span className="device-debug-value">
            {poseValue(k.key).toFixed(2)}
          </span>
        </label>
      ))}

      <div className="device-debug-actions">
        <button
          type="button"
          onClick={keepCurrentView}
          title="make the angle you have dragged to the one it starts at"
        >
          Keep view
        </button>
        <button type="button" onClick={copyPose}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => {
            resetHeroPose();
            resetOrbit();
            syncPose();
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/** Two decimals, matching how the poses are written in timeline.ts. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
