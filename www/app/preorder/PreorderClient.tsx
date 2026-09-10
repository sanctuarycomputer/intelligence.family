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
}: PreorderProps) {
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    track('preorder_view', { src });
  }, [src]);

  const scrollToReserve = useCallback(() => {
    track('reserve_click', { src, from: 'hero' });
    document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' });
  }, [src]);

  return (
    <main className="po-page">
      <Hero
        remaining={remaining}
        total={total}
        reserved={reserved}
        onReserve={scrollToReserve}
      />
      <Harness />
      <UseCases />
      <Kitchen />
      <Privacy />
      <ObjectSection />
      <section id="reserve" className="po-reserve-wrap">
        <div className="po-container">
          {/* Task 9 replaces this placeholder with ReserveCard. */}
          <div className="po-reserve">
            <button
              type="button"
              className="po-btn"
              onClick={() => setReserved(true)}
            >
              Reserve a founder unit
            </button>
          </div>
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
