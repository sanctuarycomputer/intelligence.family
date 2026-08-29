'use client';

import { lazy, Suspense, useSyncExternalStore } from 'react';

// Lazily imported so the panel is its own chunk and never reaches real visitors.
const DeviceDebugControls = lazy(() => import('./DeviceDebugControls'));

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
      <DeviceDebugControls />
    </Suspense>
  );
}
