'use client';
import { useEffect, useState, type ReactNode } from 'react';
import DeckChrome from './DeckChrome';
import DriftingLeaves from './DriftingLeaves';

export default function DeckShell({
  pages,
  railActs,
  pageMeta,
}: {
  pages: ReactNode[];
  railActs: Array<{ page: number }>;
  pageMeta: Array<{ act: string; counter: string; dark?: boolean }>;
}) {
  const [current, setCurrent] = useState(1);

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

  useEffect(() => {
    const container = document.querySelector('.deck');
    if (!container) return;
    const sections = container.querySelectorAll('section[id^="page-"]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        let best: { page: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          const page = Number(id.replace('page-', ''));
          if (Number.isNaN(page)) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { page, ratio: entry.intersectionRatio };
          }
        }
        if (best) setCurrent(best.page);
      },
      { threshold: 0.6 }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [pages.length]);

  const actStarts = new Set(railActs.map(a => a.page));
  return (
    <div className="deck">
      <div className="deck-ambient" aria-hidden="true">
        <DriftingLeaves />
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
      <nav
        className={`deck-rail${pageMeta[current - 1]?.dark ? ' deck-rail-dark' : ''}`}
        aria-label="Deck pages"
      >
        {pages.map((_, i) => (
          <a
            key={i}
            href={`#page-${i + 1}`}
            aria-label={`Page ${i + 1}`}
            className={`${i + 1 === current ? 'active ' : ''}${actStarts.has(i + 1) ? 'act-start' : ''}`}
            onClick={() => setCurrent(i + 1)}
          />
        ))}
      </nav>
    </div>
  );
}
