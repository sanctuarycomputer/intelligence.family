'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

// three.js and the 2.8MB model are a separate chunk, fetched only when the
// scene is actually going to be shown.
const DeviceScene = lazy(() => import('./DeviceScene'));

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
  poster,
}: {
  caseColor?: string;
  thinking?: boolean;
  className?: string;
  /** Shown until the scene is up, and left in place if it never is. */
  poster?: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      setEnabled(!!(c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      setEnabled(false);
    }
  }, []);

  return (
    <>
      {!ready && poster}
      {enabled && (
        <Suspense fallback={null}>
          <DeviceScene
            caseColor={caseColor}
            thinking={thinking}
            className={className}
            onReady={() => setReady(true)}
          />
        </Suspense>
      )}
    </>
  );
}
