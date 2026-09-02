'use client';

import { useEffect, useRef } from 'react';
import DeviceDemo from '@/components/demo/DeviceDemo';
import { getPhase, replay } from '@/components/demo/demoClock';

/**
 * The demo, on a slide.
 *
 * Scrolling away is the deck's equivalent of leaving the page, so the demo
 * goes back to its labelled hero rather than playing on to an empty room. The
 * threshold is deliberately low: a slide half out of view is already gone.
 */
export default function DeckDemo() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          // Already idle on first observation, which fires immediately on
          // mount: calling replay() then would publish a no-op state change
          // to every subscriber before the slide has been anywhere.
          if (!entry.isIntersecting && getPhase() !== 'idle') replay();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="deck-demo">
      <DeviceDemo className="demo-stage-slide" />
    </div>
  );
}
