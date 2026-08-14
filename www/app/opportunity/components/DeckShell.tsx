'use client';
import { useEffect, useState, type ReactNode } from 'react';
import DeckChrome from './DeckChrome';
import DriftingLeaves from './DriftingLeaves';

export default function DeckShell({
  pages,
  pageMeta,
}: {
  pages: ReactNode[];
  pageMeta: Array<{
    act: string;
    counter: string;
    dark?: boolean;
    leaves?: boolean;
    bg?: string;
  }>;
}) {
  const [current, setCurrent] = useState(1);
  const [noSnap, setNoSnap] = useState(false);

  // Snapping only works when every slide fits the viewport; the moment any
  // slide runs taller (small screens), snap turns off entirely. Slides can
  // grow after mount (fonts, images, reflow), so each one is watched with a
  // ResizeObserver rather than only re-measuring on window resize.
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      'section[id^="page-"]'
    );
    const measure = () => {
      const vh = window.innerHeight;
      const deck = document.querySelector('.deck');
      const barH = deck
        ? parseFloat(
            getComputedStyle(deck).getPropertyValue('--deck-bar-h')
          ) || 0
        : 0;
      let tall = false;
      sections.forEach((section, i) => {
        // Every slide but the full-bleed cover reserves the chrome bar's
        // height, so that's each slide's fit target. Taller than its
        // target (small screens, where slides grow), or clipping its
        // content (wider screens, where slides are fixed-height with
        // hidden overflow) — either way the deck must scroll freely and
        // let slides run their full height.
        const target = i === 0 ? vh : vh - barH;
        if (
          section.offsetHeight > target + 1 ||
          section.scrollHeight > section.offsetHeight + 8
        ) {
          tall = true;
        }
      });
      setNoSnap(tall);
    };
    measure();
    const observer = new ResizeObserver(measure);
    sections.forEach(section => observer.observe(section));
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pages.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      const next = Math.min(
        Math.max(current + (e.key === 'ArrowDown' ? 1 : -1), 1),
        pages.length
      );
      document
        .getElementById(`page-${next}`)
        ?.scrollIntoView({ behavior: 'smooth' });
      setCurrent(next);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, pages.length]);

  // The current page is whichever slide sits under the viewport midpoint.
  // (An IntersectionObserver ratio contest looks simpler, but its callbacks
  // only see the slides that crossed a threshold, so mid-scroll it flaps
  // between neighbours and lags transitions; the midpoint rule flips
  // exactly once per boundary.)
  useEffect(() => {
    const container = document.querySelector('.deck');
    if (!container) return;
    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('section[id^="page-"]')
    );
    if (sections.length === 0) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const midY = window.innerHeight / 2;
      const index = sections.findIndex(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= midY && rect.bottom > midY;
      });
      if (index !== -1) setCurrent(index + 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pages.length]);

  return (
    <div className={`deck${noSnap ? ' deck-no-snap' : ''}`}>
      <div className="deck-ambient" aria-hidden="true">
        <div
          className={`deck-leaves${pageMeta[current - 1]?.leaves ? '' : ' deck-leaves-hidden'}${pageMeta[current - 1]?.dark ? ' deck-leaves-dark' : ''}`}
        >
          <DriftingLeaves />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/opportunity/cover-decoration.png"
          alt=""
          className={`deck-tree${current > 1 ? ' deck-tree-hidden' : ''}`}
        />
      </div>
      <DeckChrome
        meta={pageMeta[current - 1]}
        hidden={current === 1}
        dark={pageMeta[current - 1]?.dark === true}
      />
      {pages}
    </div>
  );
}
