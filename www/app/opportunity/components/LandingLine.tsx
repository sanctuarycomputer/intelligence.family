import type { ReactNode } from 'react';

/**
 * "Stick the landing": a single mono line below a slide's body copy, carried
 * by the brand's hand-drawn underline. Use once per slide at most.
 */
export default function LandingLine({ children }: { children: ReactNode }) {
  return (
    <span className="deck-landing">
      {children}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/research/email-underline.png" alt="" aria-hidden="true" />
    </span>
  );
}
