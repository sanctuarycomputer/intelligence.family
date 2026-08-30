'use client';

import { lazy, Suspense, useSyncExternalStore } from 'react';

// three.js and the 2.8MB model are a separate chunk, fetched only when the
// scene is actually going to be shown.
const DeviceScene = lazy(() => import('./DeviceScene'));

const neverChanges = () => () => {};

/** Probed once. Support does not change for the life of the document. */
let webglSupport: boolean | null = null;
function hasWebGL(): boolean {
  if (webglSupport === null) {
    try {
      const c = document.createElement('canvas');
      webglSupport = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/**
 * Mounts the live device wherever WebGL can draw it.
 *
 * There is no viewport gate: below the breakpoint the device sits dimmed behind
 * the phone rather than beside it, which is a CSS concern, not a reason to skip
 * the scene. Without WebGL nothing mounts, nothing downloads, and the page is
 * the text column and the phone — which is also what happens if the model or
 * the screen assets fail to load.
 */
export default function DeviceSceneMount({
  caseColor,
  thinking,
  className,
}: {
  caseColor?: string;
  thinking?: boolean;
  className?: string;
}) {
  // Read as an external fact rather than set from an effect: whether this
  // browser can draw is not React state, and probing it in an effect costs a
  // second render on every visit.
  const enabled = useSyncExternalStore(neverChanges, hasWebGL, () => false);
  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <DeviceScene
        caseColor={caseColor}
        thinking={thinking}
        className={className}
      />
    </Suspense>
  );
}
