'use client';

import { lazy, Suspense, useSyncExternalStore } from 'react';

// Lazily imported so the editor is its own chunk: the homepage stays
// zero-JS-of-consequence for real visitors, and the tool is fetched only
// when ?debug=true is actually present.
const DebugCopyEditor = lazy(() => import('./DebugCopyEditor'));

// Client-only read, expressed as an external store so hydration stays clean
// (server snapshot false) without a setState-in-effect cascade. Reading
// window.location instead of useSearchParams keeps the page statically
// prerenderable (no Suspense boundary required).
const emptySubscribe = () => () => {};
const readDebugFlag = () =>
  new URLSearchParams(window.location.search).get('debug') === 'true';
const serverSnapshot = () => false;

export default function DebugCopyEditorMount({
  scope,
  pageName,
}: {
  scope?: string;
  pageName?: string;
}) {
  const debug = useSyncExternalStore(
    emptySubscribe,
    readDebugFlag,
    serverSnapshot
  );
  if (!debug) return null;
  return (
    <Suspense fallback={null}>
      <DebugCopyEditor scope={scope} pageName={pageName} />
    </Suspense>
  );
}
