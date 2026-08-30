'use client';

import { useEffect, useState } from 'react';
import {
  getPhase,
  play,
  replay,
  setCompact,
  setReducedMotion,
  subscribe,
} from './demoClock';
import type { DemoPhase } from './demoState';

/**
 * The way in, and the way back.
 *
 * Sits in the flow under the wordmark rather than floating over the scene. The
 * demo is the page's one action, so it belongs with the masthead rather than in
 * a control layer laid over the device.
 *
 * One button through all three states. Swapping it for a different control at
 * the end would move the target out from under the pointer that just watched
 * the whole thing.
 */

/** The play mark from the research page's audio player. */
function PlayGlyph() {
  return (
    <svg
      width="10"
      height="11"
      viewBox="0 0 22 25"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M20.25 9.49967C22.25 10.6544 22.25 13.5411 20.25 14.6958L4.5 23.7891C2.5 24.9438 -1.00947e-07 23.5004 0 21.191L7.94957e-07 3.00447C8.95904e-07 0.69507 2.5 -0.7483 4.5 0.4064L20.25 9.49967Z"
        fill="currentColor"
      />
    </svg>
  );
}

const LABEL: Record<DemoPhase, string> = {
  idle: 'Demo',
  playing: 'Playing…',
  done: 'Replay',
};

export default function DemoControls() {
  const [phase, setPhase] = useState<DemoPhase>(() => getPhase());

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = window.matchMedia('(max-width: 1023px)');
    const sync = () => {
      setReducedMotion(motion.matches);
      setCompact(narrow.matches);
    };
    sync();
    motion.addEventListener('change', sync);
    narrow.addEventListener('change', sync);
    return () => {
      motion.removeEventListener('change', sync);
      narrow.removeEventListener('change', sync);
    };
  }, []);

  useEffect(
    () =>
      subscribe((_, p) => {
        setPhase(p);
        /* Published to the document so CSS can respond to it. Narrow viewports
           keep the device and the phone off screen until the demo runs, and
           that is a presentation concern rather than another subscription. */
        document.documentElement.dataset.demo = p;
      }),
    []
  );

  return (
    <button
      type="button"
      className="demo-play"
      // Nothing to do while it runs — play() ignores the click anyway, and
      // disabling it would grey the row out mid-demo.
      onClick={phase === 'done' ? replay : play}
      aria-label={
        phase === 'playing' ? 'Demo playing' : `${LABEL[phase]} the demo`
      }
    >
      <PlayGlyph />
      {LABEL[phase]}
    </button>
  );
}
