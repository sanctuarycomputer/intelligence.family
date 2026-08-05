'use client';
import { useEffect, useState } from 'react';
import InlineEmailGate from '@/components/InlineEmailGate';
import { OPPORTUNITY_GATE_SOURCE } from '@/lib/crm';
import DeckShell from './components/DeckShell';
import DebugCopyEditor from './components/DebugCopyEditor';
import { ALL_PAGES, APPENDIX_PAGES, ACT_STARTS, PAGE_META } from './content';
import { coverPage } from './content/act1';
import './opportunity.css';

const UNLOCK_KEY = 'fi_opportunity_unlocked_v1';

export default function OpportunityClient() {
  const [unlocked, setUnlocked] = useState(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(UNLOCK_KEY) === '1') setUnlocked(true);
    } catch {}
    // window.location instead of useSearchParams keeps the page statically
    // prerenderable (no Suspense boundary required).
    setDebug(
      new URLSearchParams(window.location.search).get('debug') === 'true'
    );
  }, []);

  const handleUnlock = () => {
    try {
      localStorage.setItem(UNLOCK_KEY, '1');
    } catch {}
    setUnlocked(true);
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
      <DeckShell
        pages={pages}
        railActs={unlocked ? ACT_STARTS : []}
        pageMeta={PAGE_META}
      />
      {debug && (
        <DebugCopyEditor refreshKey={unlocked ? 'unlocked' : 'locked'} />
      )}
    </>
  );
}
