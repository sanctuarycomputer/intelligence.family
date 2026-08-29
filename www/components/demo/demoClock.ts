/**
 * The demo's clock.
 *
 * A module store rather than React context, matching deviceControls.ts: the
 * WebGL render loop reads this every frame, and going through React to do that
 * would mean re-rendering the tree 60 times a second.
 *
 * So there are two ways in. `read()` is for the render loop and returns the
 * live state including everything continuous. `subscribe()` is for React and
 * fires only when the discrete part changes — a couple of dozen times across
 * the whole run rather than ~1,500.
 */

import {
  discreteKey,
  idleState,
  stateAt,
  type DemoPhase,
  type DemoState,
} from './demoState';
import { END } from './timeline';

type Listener = (s: DemoState, phase: DemoPhase) => void;

function nowMs(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

let phase: DemoPhase = 'idle';
let lastPhase: DemoPhase = 'idle';
let t = 0;
/** Wall clock of the last tick, for accumulating elapsed time. */
let lastTick = 0;
let reduced = false;
let raf = 0;

let state: DemoState = idleState();
let key = discreteKey(state);
const listeners = new Set<Listener>();

function derive(): DemoState {
  return phase === 'idle' ? idleState() : stateAt(t);
}

function publish() {
  state = derive();
  const next = discreteKey(state);
  if (next === key && phase === lastPhase) return;
  key = next;
  lastPhase = phase;
  listeners.forEach(fn => fn(state, phase));
}

/**
 * A backgrounded tab stops firing rAF, so time is accumulated per frame and
 * each step is clamped rather than read off the wall clock. Otherwise switching
 * away for a minute and coming back would snap the demo to its end, and the
 * visitor would never see the thing they pressed play for.
 */
const MAX_STEP = 1 / 15;

function tick() {
  const now = nowMs();
  t += Math.min((now - lastTick) / 1000, MAX_STEP);
  lastTick = now;
  if (t >= END) {
    t = END;
    phase = 'done';
    raf = 0;
    publish();
    return;
  }
  publish();
  raf = requestAnimationFrame(tick);
}

function stop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

/**
 * Live state, including continuous values. For the render loop.
 *
 * Idle is a constant, so the cached object is handed straight back rather than
 * rebuilt sixty times a second for a scene that is not changing.
 */
export function read(): DemoState {
  return state;
}

export function getPhase(): DemoPhase {
  return phase;
}

export function getTime(): number {
  return phase === 'idle' ? 0 : t;
}

/**
 * Set once the page knows whether motion is wanted. With reduced motion the
 * demo still runs; it just arrives rather than animating there.
 */
export function setReducedMotion(value: boolean) {
  if (reduced === value) return;
  reduced = value;
  publish();
}

export function play() {
  if (phase === 'playing') return;
  stop();
  if (reduced) {
    t = END;
    phase = 'done';
    publish();
    return;
  }
  phase = 'playing';
  lastTick = nowMs();
  t = 0;
  publish();
  raf = requestAnimationFrame(tick);
}

/** Back to the labelled hero, ready to be played again. */
export function replay() {
  stop();
  phase = 'idle';
  t = 0;
  publish();
}

/** Debug scrubbing. Parks the clock at `seconds` without running it. */
export function seek(seconds: number) {
  stop();
  t = Math.min(END, Math.max(0, seconds));
  phase = t >= END ? 'done' : 'playing';
  publish();
}

/** Runs on from wherever a seek parked the clock. */
export function resume() {
  if (phase !== 'playing' || raf) return;
  phase = 'playing';
  lastTick = nowMs();
  publish();
  raf = requestAnimationFrame(tick);
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  fn(read(), phase);
  return () => {
    listeners.delete(fn);
  };
}

/** Test seam. Puts the module back to a freshly loaded state. */
export function reset() {
  stop();
  phase = 'idle';
  lastPhase = 'idle';
  t = 0;
  reduced = false;
  state = idleState();
  key = discreteKey(state);
}
