'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/** Adds .po-in when the element enters the viewport. Under reduced motion
 * the class is added immediately so nothing is ever hidden. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'p';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((el: HTMLElement | null) => {
    ref.current = el;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCED).matches) {
      el.classList.add('po-in');
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          el.classList.add('po-in');
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={setRef}
      className={`po-reveal ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
