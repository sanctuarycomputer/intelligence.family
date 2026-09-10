'use client';

import { useEffect, useState } from 'react';
import { RESERVE } from './content';

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
    <div className={`po-sticky ${on ? 'po-sticky-on' : ''}`} inert={!on}>
      <div className="po-container po-sticky-inner">
        <span className="po-sticky-name">Flagship</span>
        <div className="po-sticky-right">
          <span className="po-sticky-meta">
            {reserved ? (
              "You're in line"
            ) : remaining === 0 ? (
              RESERVE.waitlist.count
            ) : (
              <>
                $49 deposit · <span className="po-tabular">{remaining}</span> of{' '}
                <span className="po-tabular">{total}</span> remaining
              </>
            )}
          </span>
          <button
            type="button"
            className="po-btn"
            onClick={onReserve}
            disabled={reserved}
          >
            {reserved ? 'Reserved' : remaining === 0 ? 'Waitlist' : 'Reserve'}
          </button>
        </div>
      </div>
    </div>
  );
}
