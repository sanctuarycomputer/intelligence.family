'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PreorderSrc } from '@/lib/preorder';
import './preorder.css';
import { track } from './track';
import {
  Hero,
  Harness,
  UseCases,
  Kitchen,
  Privacy,
  ObjectSection,
  Faq,
} from './sections';
import ReserveCard, { type ReserveState } from './ReserveCard';
import StickyNav from './StickyNav';

export type PreorderProps = {
  src: PreorderSrc;
  total: number;
  remaining: number;
  codes: { reserved: string | null; declined: string | null };
};

export default function PreorderClient({
  src,
  total,
  remaining,
  codes,
}: PreorderProps) {
  const [state, setState] = useState<ReserveState>('idle');
  const prolific = src === 'prolific';
  // A Prolific decline leaves the hero button live; the card shows the code.
  const reserved =
    state === 'reserved' ||
    state === 'waitlisted' ||
    state === 'prolific-reserved';

  useEffect(() => {
    track('preorder_view', { src });
  }, [src]);

  const scrollToReserve = useCallback(
    (from: 'hero' | 'sticky') => {
      track('reserve_click', { src, from });
      document
        .getElementById('reserve')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [src]
  );

  return (
    <main className="po-page">
      {!prolific && (
        <StickyNav
          remaining={remaining}
          total={total}
          reserved={reserved}
          onReserve={() => scrollToReserve('sticky')}
        />
      )}
      <Hero
        remaining={remaining}
        total={total}
        reserved={reserved}
        onReserve={() => scrollToReserve('hero')}
      />
      <Harness />
      <UseCases />
      <Kitchen />
      <Privacy />
      <ObjectSection />
      <section id="reserve" className="po-reserve-wrap">
        <div className="po-container">
          <ReserveCard
            src={src}
            total={total}
            remaining={remaining}
            codes={codes}
            state={state}
            onState={setState}
          />
        </div>
      </section>
      <Faq />
      <footer className="po-footer">
        <div className="po-container">
          Family Intelligence. Designed and engineered in San Francisco and New
          York City.
        </div>
      </footer>
    </main>
  );
}
