'use client';

import { useEffect, useState } from 'react';

/** Apple-style local nav that slides in once the hero is off screen. */
export default function StickyNav({
  remaining,
  total,
  reserved,
  onReserve,
}: {
  remaining: number;
  total: number;
  reserved: boolean;
  onReserve: () => void;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.po-hero');
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setOn(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`po-sticky ${on ? 'po-sticky-on' : ''}`} aria-hidden={!on}>
      <div className="po-container po-sticky-inner">
        <span className="po-sticky-name">Flagship</span>
        <div className="po-sticky-right">
          <span className="po-sticky-meta po-tabular">
            {reserved
              ? "You're in line"
              : remaining === 0
                ? `All ${total} founder units reserved`
                : `$49 deposit · ${remaining} of ${total} remaining`}
          </span>
          <button
            type="button"
            className="po-btn"
            onClick={onReserve}
            disabled={reserved}
            tabIndex={on ? 0 : -1}
          >
            {reserved ? 'Reserved' : remaining === 0 ? 'Waitlist' : 'Reserve'}
          </button>
        </div>
      </div>
    </div>
  );
}
