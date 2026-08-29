'use client';

import { useEffect, useState } from 'react';
import {
  getPhase,
  play,
  replay,
  setCompact,
  setReducedMotion,
  setSettled,
  subscribe,
} from './demoClock';
import type { DemoPhase } from './demoState';

/**
 * The way in, and the way back.
 *
 * The play control is present from the first frame rather than appearing on
 * hover: hover does not exist on touch, and a visitor who never moves the
 * pointer should not be stranded on a poster. Hovering is a reward — the Leaf
 * seats itself and the device settles — not a gate.
 */
export default function DemoControls() {
  const [phase, setPhase] = useState<DemoPhase>(() => getPhase());
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      setReducedMotion(motion.matches);
      setCompact(!wide.matches);
    };
    sync();
    motion.addEventListener('change', sync);
    wide.addEventListener('change', sync);
    return () => {
      motion.removeEventListener('change', sync);
      wide.removeEventListener('change', sync);
    };
  }, []);

  useEffect(
    () =>
      subscribe((s, p) => {
        setPhase(p);
        setShowReplay(s.showReplay);
      }),
    []
  );

  if (phase === 'idle') {
    return (
      <div className="demo-controls">
        <button
          type="button"
          className="demo-play"
          onClick={play}
          onPointerEnter={() => setSettled(true)}
          onPointerLeave={() => setSettled(false)}
          onFocus={() => setSettled(true)}
          onBlur={() => setSettled(false)}
        >
          <span className="demo-play-glyph" aria-hidden="true" />
          See it answer
        </button>
      </div>
    );
  }

  if (!showReplay) return null;

  return (
    <div className="demo-controls">
      <button type="button" className="demo-replay" onClick={replay}>
        Replay
      </button>
    </div>
  );
}
