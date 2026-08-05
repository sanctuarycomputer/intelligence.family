'use client';
import { useEffect, useState, type ReactNode } from 'react';

export default function DeckShell({
  pages,
  railActs,
}: {
  pages: ReactNode[];
  railActs: Array<{ page: number }>;
}) {
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
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

  const actStarts = new Set(railActs.map(a => a.page));
  return (
    <div className="deck">
      {pages}
      <nav className="deck-rail" aria-label="Deck pages">
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
