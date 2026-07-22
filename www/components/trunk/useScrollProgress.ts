'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { computeProgress } from './scrollProgress';

// Returns a ref (not state) holding the latest 0..1 progress through the
// story element. TrunkCanvas polls it inside useFrame, so updating a ref
// avoids re-rendering React 60 times a second.
export function useScrollProgress(elementId: string): RefObject<number> {
  const progressRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(elementId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      progressRef.current = computeProgress(
        rect.top,
        rect.height,
        window.innerHeight
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [elementId]);

  return progressRef;
}
