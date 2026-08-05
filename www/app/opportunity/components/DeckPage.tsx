import type { ReactNode } from 'react';

export default function DeckPage({
  n,
  actClass = '',
  children,
}: {
  n: number;
  // Chrome (and the counter it renders) now lives in DeckChrome, driven by
  // PAGE_META; total is kept on the type so call sites can keep passing it
  // unchanged without an excess-property error.
  total: number;
  actClass?: string;
  children: ReactNode;
}) {
  return (
    <section id={`page-${n}`} className={`deck-page ${actClass}`}>
      <div className="deck-well flex-1 flex flex-col justify-center">
        {children}
      </div>
    </section>
  );
}
