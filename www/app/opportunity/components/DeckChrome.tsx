'use client';
import { useEffect, useState } from 'react';

/**
 * Slot-machine value: the old value fades up and out while the new value
 * fades up and in, from the same baseline. `key`s on both spans force the
 * animation to retrigger on every change.
 */
function RollingValue({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const [leaving, setLeaving] = useState<string | null>(null);

  useEffect(() => {
    if (value === display) return;
    setLeaving(display);
    setDisplay(value);
    const timer = setTimeout(() => setLeaving(null), 260);
    return () => clearTimeout(timer);
    // display is intentionally excluded: it's set by this same effect, and
    // including it would fire the effect a second, redundant time per change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className="deck-chrome-slot">
      <span key={display} className="deck-chrome-value deck-chrome-in">
        {display}
      </span>
      {leaving !== null && (
        <span
          key={leaving}
          className="deck-chrome-value deck-chrome-leaving deck-chrome-out"
        >
          {leaving}
        </span>
      )}
    </span>
  );
}

/**
 * Counters shaped like "07 / 26" roll only the page half; the total is
 * static. Anything else (the appendix's "A") rolls whole.
 */
function Counter({ value }: { value: string }) {
  const match = value.match(/^(\S+)( \/ \d+)$/);
  if (!match) return <RollingValue value={value} />;
  return (
    <>
      <RollingValue value={match[1]} />
      {match[2]}
    </>
  );
}

export default function DeckChrome({
  meta,
  hidden = false,
  dark = false,
}: {
  meta?: { act: string; counter: string };
  hidden?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={`deck-chrome${hidden ? ' deck-chrome-hidden' : ''}${dark ? ' deck-chrome-dark' : ''}`}
    >
      <span className="deck-chrome-corner deck-chrome-tr">
        {meta && <RollingValue value={meta.act} />}
      </span>
      <span className="deck-chrome-corner deck-chrome-bl">
        Investor Preview
      </span>
      <span className="deck-chrome-corner deck-chrome-br">
        {meta && <Counter value={meta.counter} />}
      </span>
    </div>
  );
}
