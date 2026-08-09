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
  }>;
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

  // One jump item per act: the first page whose act label differs from the
  // previous page's.
  const jumpItems: JumpItem[] = [];
  pageMeta.forEach((meta, i) => {
    if (i > 0 && meta.act === pageMeta[i - 1].act) return;
    const [numeral, ...rest] = meta.act.split(' \u00b7 ');
    jumpItems.push({
      page: i + 1,
      numeral: `${numeral}.`,
      title: rest.join(' \u00b7 '),
    });
  });
  return (
    <div className="deck">
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
