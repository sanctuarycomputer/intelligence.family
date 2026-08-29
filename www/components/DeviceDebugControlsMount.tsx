'use client';

import { lazy, Suspense, useSyncExternalStore } from 'react';

// Lazily imported so the panels are their own chunk and never reach visitors.
const DeviceDebugControls = lazy(() => import('./DeviceDebugControls'));
const DemoDebugControls = lazy(() => import('./demo/DemoDebugControls'));

const emptySubscribe = () => () => {};
const readDebugFlag = () =>
  new URLSearchParams(window.location.search).get('debug') === 'true';
const serverSnapshot = () => false;

export default function DeviceDebugControlsMount() {
  const debug = useSyncExternalStore(
    emptySubscribe,
    readDebugFlag,
    serverSnapshot
  );
  if (!debug) return null;
  return (
    <Suspense fallback={null}>
      {/* One scrolling column. Pinning one panel to the top and the other to
          the bottom worked until a panel grew, and then the lower one silently
          covered the last rows of the upper one. */}
      <div className="debug-stack">
        <DemoDebugControls />
        <DeviceDebugControls />
      </div>
    </Suspense>
  );
}
