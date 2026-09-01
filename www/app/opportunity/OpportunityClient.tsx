'use client';
import { cloneElement, useState, useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';
import InlineEmailGate from '@/components/InlineEmailGate';
import { OPPORTUNITY_GATE_SOURCE } from '@/lib/crm';
import DeckShell from './components/DeckShell';
import DebugCopyEditor from './components/DebugCopyEditor';
import { ALL_PAGES, APPENDIX_PAGES, PAGE_META } from './content';
import { coverPage } from './content/act1';
import './opportunity.css';

const UNLOCK_KEY = 'fi_opportunity_unlocked_v1';

/**
 * Overrides each page's authored `n` placeholder (see act1.tsx's comment)
 * with its position in `pages`. Exported so tests can renumber an arbitrary
 * composed list — e.g. act1 built both with and without the liberatory
 * slide — through the same mechanism `composeDeckPages` uses below, rather
 * than reimplementing the cloneElement call themselves.
 */
export function numberPages(pages: ReactNode[]): ReactNode[] {
  return pages.map((page, i) =>
    cloneElement(page as ReactElement<{ n: number }>, { n: i + 1 })
  );
}

/**
 * The deck's actual page list, numbered.
 *
 * Each content file authors its own `n` (see act1.tsx and friends), but that
 * value is only ever a placeholder: it is overridden here from the page's
 * actual position, which is what DeckShell/DeckPage rely on for the `page-N`
 * scroll anchors and PAGE_META alignment. Composing the list first and
 * numbering it by index means hiding or adding a page anywhere upstream
 * never requires touching a number by hand.
 *
 * Exported (rather than kept as a closure inside the component) so tests can
 * exercise the real derivation directly instead of re-implementing it
 * against ALL_PAGES/APPENDIX_PAGES themselves — see opportunity-copy.test.ts.
 */
export function composeDeckPages(
  unlocked: boolean,
  gate: ReactNode
): ReactNode[] {
  const composed = unlocked
    ? [coverPage(null), ...ALL_PAGES.slice(1), ...APPENDIX_PAGES]
    : [coverPage(gate)];
  return numberPages(composed);
}

// Client-only reads, expressed as external stores so hydration stays clean
// (server snapshot false) without a setState-in-effect cascade. Reading
// window.location instead of useSearchParams keeps the page statically
// prerenderable (no Suspense boundary required).
const emptySubscribe = () => () => {};
const readStoredUnlock = () => {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
};
const readDebugFlag = () =>
  new URLSearchParams(window.location.search).get('debug') === 'true';
const serverSnapshot = () => false;

export default function OpportunityClient() {
  const storedUnlock = useSyncExternalStore(
    emptySubscribe,
    readStoredUnlock,
    serverSnapshot
  );
  const debug = useSyncExternalStore(
    emptySubscribe,
    readDebugFlag,
    serverSnapshot
  );
  const [unlockedNow, setUnlockedNow] = useState(false);
  const unlocked = unlockedNow || storedUnlock;

  const handleUnlock = () => {
    try {
      localStorage.setItem(UNLOCK_KEY, '1');
    } catch {}
    setUnlockedNow(true);
  };

  const gate = unlocked ? null : (
    <InlineEmailGate
      onSuccess={handleUnlock}
      source={OPPORTUNITY_GATE_SOURCE}
      page="opportunity"
      prompt="Enter your email to view the deck"
    />
  );

  const pages = composeDeckPages(unlocked, gate);

  return (
    <>
      <DeckShell pages={pages} pageMeta={PAGE_META} />
      {debug && (
        <DebugCopyEditor refreshKey={unlocked ? 'unlocked' : 'locked'} />
      )}
    </>
  );
}
