'use client';

import { useState } from 'react';

export type JumpItem = { page: number; numeral: string; title: string };

/**
 * Act-level jump navigation, adopted from the homepage sidebar nav: numerals
 * at rest, titles slide in staggered on hover, active act carries the dot.
 */
export default function DeckJumpNav({
  items,
  current,
  dark,
  onJump,
}: {
  items: JumpItem[];
  current: number;
  dark: boolean;
  onJump: (page: number) => void;
}) {
  const [hovered, setHovered] = useState(false);

  // The active act is the last one whose first page is at or before current.
  let activePage = items[0]?.page ?? 1;
  for (const item of items) {
    if (item.page <= current) activePage = item.page;
  }

  return (
    <nav
      className={`deck-jumpnav${dark ? ' deck-jumpnav-dark' : ''}`}
      aria-label="Deck sections"
    >
      <div
        className="deck-jumpnav-inner"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="deck-jumpnav-divider"
          style={{ width: hovered ? '170px' : '24px' }}
        />
        <ul>
          {items.map((item, i) => (
            <li
              key={item.page}
              className={item.page === activePage ? 'active' : undefined}
            >
              <span className="deck-jumpnav-dot" aria-hidden="true" />
              <a
                href={`#page-${item.page}`}
                onClick={e => {
                  e.preventDefault();
                  onJump(item.page);
                }}
              >
                <span>{item.numeral}</span>
                <span
                  className="deck-jumpnav-title"
                  style={{
                    transition: `opacity 300ms ease-in-out ${i * 50}ms, max-width 300ms ease-in-out ${i * 50}ms, margin-left 300ms ease-in-out ${i * 50}ms, transform 300ms ease-in-out ${i * 50}ms`,
                    opacity: hovered ? 1 : 0,
                    maxWidth: hovered ? '200px' : '0px',
                    marginLeft: hovered ? '0.4rem' : '0',
                    transform: hovered ? 'translateX(0)' : 'translateX(-5px)',
                  }}
                >
                  {item.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
