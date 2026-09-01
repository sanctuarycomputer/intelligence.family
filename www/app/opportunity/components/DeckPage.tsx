import type { ReactNode } from 'react';

export default function DeckPage({
  n,
  actClass = '',
  bleed,
  children,
}: {
  n: number;
  // Chrome (and the counter it renders) now lives in DeckChrome, driven by
  // PAGE_META; total is kept on the type so call sites can keep passing it
  // unchanged without an excess-property error.
  total: number;
  actClass?: string;
  // A direct child of the section, rendered before .deck-well rather than
  // inside it, so it can be full-bleed across the whole slide (the demo
  // stage needs the section's full proportions, not the well's centred
  // column) while still sitting behind .deck-well in the stacking order.
  bleed?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={`page-${n}`} className={`deck-page ${actClass}`}>
      {bleed}
      <div className="deck-well flex-1 flex flex-col justify-center">
        {children}
      </div>
    </section>
  );
}
