'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

// three.js and the 2.8MB model are a separate chunk, fetched only when the
// scene is actually going to be shown.
const DeviceScene = lazy(() => import('./DeviceScene'));

/**
 * Mounts the live device only where it earns its weight: wide viewports, with
 * WebGL available and reduced-motion not requested. Everywhere else the static
 * shell render underneath stays as-is, and nothing extra is downloaded.
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
    const wide = window.matchMedia('(min-width: 1024px)');
    const check = () => {
      let webgl = false;
      try {
        const c = document.createElement('canvas');
        webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        webgl = false;
      }
      setEnabled(wide.matches && webgl);
    };
    check();
    wide.addEventListener('change', check);
    return () => wide.removeEventListener('change', check);
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
