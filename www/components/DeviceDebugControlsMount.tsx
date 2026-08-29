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
      <DemoDebugControls />
      <DeviceDebugControls />
    </Suspense>
  );
}
