'use client';

import { useEffect, useState } from 'react';
import {
  getPhase,
  play,
  replay,
  setReducedMotion,
  subscribe,
} from './demoClock';
import type { DemoPhase } from './demoState';

/**
 * The way in, and the way back.
 *
 * Present from the first frame rather than appearing on hover: hover does not
 * exist on touch, and a visitor who never moves the pointer should not be
 * stranded on a still.
 */
export default function DemoControls() {
  const [phase, setPhase] = useState<DemoPhase>(() => getPhase());
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(motion.matches);
    sync();
    motion.addEventListener('change', sync);
    return () => motion.removeEventListener('change', sync);
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
        <button type="button" className="demo-play" onClick={play}>
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
