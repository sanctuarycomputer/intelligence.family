'use client';
import { useState, useSyncExternalStore } from 'react';
import InlineEmailGate from '@/components/InlineEmailGate';
import { OPPORTUNITY_GATE_SOURCE } from '@/lib/crm';
import DeckShell from './components/DeckShell';
import DebugCopyEditor from './components/DebugCopyEditor';
import { ALL_PAGES, APPENDIX_PAGES, PAGE_META } from './content';
import { coverPage } from './content/act1';
import './opportunity.css';

const UNLOCK_KEY = 'fi_opportunity_unlocked_v1';

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

  const pages = unlocked
    ? [coverPage(null), ...ALL_PAGES.slice(1), ...APPENDIX_PAGES]
    : [coverPage(gate)];

  return (
    <>
      <DeckShell pages={pages} pageMeta={PAGE_META} />
      {debug && (
        <DebugCopyEditor refreshKey={unlocked ? 'unlocked' : 'locked'} />
      )}
    </>
  );
}
