import type { ReactNode } from 'react';

export default function DeckPage({
  n,
  total,
  act,
  actClass = '',
  chrome = true,
  counter,
  children,
}: {
  n: number;
  total: number;
  act: string;
  actClass?: string;
  chrome?: boolean;
  /** Overrides the "NN / total" footer counter; appendix pages pass "A". */
  counter?: string;
  children: ReactNode;
}) {
  return (
    <section id={`page-${n}`} className={`deck-page ${actClass}`}>
      {chrome && (
        <header className="deck-chrome-header">
          <span>Family Intelligence</span>
          <span>{act}</span>
        </header>
      )}
      <div className="flex-1 flex flex-col justify-center">{children}</div>
      {chrome && (
        <footer className="deck-chrome-footer">
          <span>{counter ?? `${String(n).padStart(2, '0')} / ${total}`}</span>
          <span>Investor Preview · August 2026</span>
          <span>intelligence.family</span>
        </footer>
      )}
    </section>
  );
}
