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
import { END, HERO_LABELS, HERO_LABEL_STAGGER } from './timeline';

type Listener = (s: DemoState, phase: DemoPhase) => void;

/** How long the hero labels take to finish arriving. */
const IDLE_SETTLE = HERO_LABELS.length * HERO_LABEL_STAGGER;

function nowMs(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

let phase: DemoPhase = 'idle';
let lastPhase: DemoPhase = 'idle';
let t = 0;
/** Wall clock of the last tick, for accumulating elapsed time. */
let lastTick = 0;
/** When the idle state went up, for staggering the hero labels in. */
let idleStart = nowMs();
let settled = false;
let reduced = false;
let compact = false;
let raf = 0;

let state: DemoState = idleState(false, 0);
let key = discreteKey(state);
const listeners = new Set<Listener>();

function derive(): DemoState {
  return phase === 'idle'
    ? idleState(
        settled,
        // Reduced motion gets the finished drawing rather than a build.
        reduced ? Number.POSITIVE_INFINITY : (nowMs() - idleStart) / 1000,
        compact
      )
    : stateAt(t);
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
 * Runs the clock through the idle label stagger.
 *
 * Idle is otherwise a still frame with nothing to advance it, so without this
 * the first label would publish and the other four never would.
 */
function staggerIdle() {
  if (raf || phase !== 'idle' || reduced || compact) return;
  const step = () => {
    if (phase !== 'idle') {
      raf = 0;
      return;
    }
    publish();
    if ((nowMs() - idleStart) / 1000 >= IDLE_SETTLE) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

/**
 * Called once the scene has drawn its first frame.
 *
 * The stagger is timed from here rather than from module load: the model is
 * 2.8MB, so the labels would otherwise finish arriving before there is anything
 * for them to point at.
 */
export function markReady() {
  if (phase !== 'idle') return;
  idleStart = nowMs();
  staggerIdle();
}

/**
 * Live state, including continuous values. For the render loop.
 *
 * While idle the label stagger advances on wall clock rather than on `t`, so it
 * has to be re-derived. Once the labels are all in, the idle state is constant
 * and the cached object is handed back instead — no allocation per frame for a
 * scene that is not moving.
 */
export function read(): DemoState {
  if (phase === 'idle' && (nowMs() - idleStart) / 1000 < IDLE_SETTLE) {
    state = derive();
  }
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

/**
 * Below the breakpoint the device sits behind the phone with its labels hidden,
 * so the exploded hero has nothing to explain and is not shown.
 */
export function setCompact(value: boolean) {
  if (compact === value) return;
  compact = value;
  publish();
}

/** The hover reward: the leaf seats itself and the device shifts. */
export function setSettled(value: boolean) {
  if (settled === value || phase !== 'idle') return;
  settled = value;
  // `settled` only moves continuous values, so publish() would not notice it.
  state = derive();
  listeners.forEach(fn => fn(state, phase));
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
  settled = false;
  idleStart = nowMs();
  publish();
  staggerIdle();
}

/** Debug scrubbing. Parks the clock at `seconds` without running it. */
export function seek(seconds: number) {
  stop();
  t = Math.min(END, Math.max(0, seconds));
  phase = t >= END ? 'done' : 'playing';
  publish();
}

/** Runs on from wherever the clock was parked. */
export function resume() {
  if (phase === 'done' || raf) return;
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
  settled = false;
  reduced = false;
  idleStart = nowMs();
  state = idleState(false, 0);
  key = discreteKey(state);
}
