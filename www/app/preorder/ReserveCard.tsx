'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { PreorderSrc, ReserveOutcome } from '@/lib/preorder';
import { RESERVE } from './content';
import { track } from './track';

export type ReserveState =
  | 'idle'
  | 'reserved'
  | 'waitlisted'
  | 'prolific-reserved'
  | 'prolific-declined';

const PROLIFIC_KEY = 'preorder:prolific';

function readProlificState(): ReserveState | null {
  try {
    const v = window.sessionStorage.getItem(PROLIFIC_KEY);
    return v === 'prolific-reserved' || v === 'prolific-declined' ? v : null;
  } catch {
    return null;
  }
}

function writeProlificState(s: ReserveState) {
  try {
    window.sessionStorage.setItem(PROLIFIC_KEY, s);
  } catch {
    /* private mode: the in-memory state still works for this page load */
  }
}

export default function ReserveCard({
  src,
  total,
  remaining,
  codes,
  state,
  onState,
}: {
  src: PreorderSrc;
  total: number;
  remaining: number;
  codes: { reserved: string | null; declined: string | null };
  state: ReserveState;
  onState: (s: ReserveState) => void;
}) {
  const soldOut = remaining === 0;
  const prolific = src === 'prolific';
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Rehydrate a Prolific outcome so a refresh shows the same code.
  useEffect(() => {
    if (!prolific) return;
    const stored = readProlificState();
    if (stored) onState(stored);
  }, [prolific, onState]);

  const filled =
    total === 0 ? 100 : Math.round(((total - remaining) / total) * 100);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const outcome: ReserveOutcome = soldOut ? 'waitlist' : 'reserve';
    track('reserve_click', { src, from: 'card', outcome });
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, src, outcome }),
      });
      const data = (await res.json()) as
        | { success: true; status: ReserveOutcome }
        | { success: false; message: string };
      if (res.ok && data.success) {
        track('reserved', { src, outcome });
        onState(outcome === 'reserve' ? 'reserved' : 'waitlisted');
      } else {
        setError(data.success ? null : data.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function choose(outcome: 'reserved' | 'declined') {
    const next: ReserveState = `prolific-${outcome}`;
    track('reserve_click', { src, from: 'card', outcome });
    if (outcome === 'reserved') track('reserved', { src, outcome: 'prolific' });
    writeProlificState(next);
    onState(next);
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* selection is still available via user-select: all */
    }
  }

  const progress = (
    <>
      <div
        className="po-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={total - remaining}
        aria-label="Founder units reserved"
      >
        <span style={{ width: `${filled}%` }} />
      </div>
      <p className="po-count">
        {soldOut ? (
          RESERVE.waitlist.count
        ) : (
          <>
            <span className="po-tabular">{remaining}</span> of{' '}
            <span className="po-tabular">{total}</span> founder units remaining
          </>
        )}
      </p>
    </>
  );

  if (state === 'prolific-reserved' || state === 'prolific-declined') {
    const code =
      state === 'prolific-reserved' ? codes.reserved : codes.declined;
    return (
      <div className="po-reserve" aria-live="polite">
        <h2 className="po-reserve-title">{"You're done."}</h2>
        {code ? (
          <>
            <p className="po-reserve-sub">{RESERVE.prolific.thanks}</p>
            <div className="po-code">
              <span>{code}</span>
              <button
                type="button"
                className="po-btn po-btn-quiet"
                onClick={() => copyCode(code)}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="po-small">Return to Prolific to finish.</p>
          </>
        ) : (
          <p className="po-reserve-sub">{RESERVE.prolific.noCode}</p>
        )}
      </div>
    );
  }

  if (state === 'reserved' || state === 'waitlisted') {
    const done = state === 'reserved' ? RESERVE.reserved : RESERVE.waitlisted;
    return (
      <div className="po-reserve" aria-live="polite">
        <h2 className="po-reserve-title">{done.title}</h2>
        <p className="po-reserve-sub">{done.body}</p>
        {progress}
        <p className="po-small">
          Check your inbox for a confirmation. Reply to it with any question.
        </p>
      </div>
    );
  }

  return (
    <div className="po-reserve">
      <h2 className="po-reserve-title">{RESERVE.title}</h2>
      <p className="po-reserve-sub">{RESERVE.sub}</p>
      {progress}
      <p className="po-ship">{RESERVE.ship}</p>
      {prolific ? (
        <div className="po-choice">
          <button
            type="button"
            className="po-btn"
            onClick={() => choose('reserved')}
          >
            {RESERVE.prolific.reserve}
          </button>
          <button
            type="button"
            className="po-btn po-btn-quiet"
            onClick={() => choose('declined')}
          >
            {RESERVE.prolific.decline}
          </button>
        </div>
      ) : (
        <form className="po-form" onSubmit={submit} noValidate>
          <label className="sr-only" htmlFor="reserve-email">
            Email address
          </label>
          <input
            id="reserve-email"
            className="po-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={busy}
          />
          <button type="submit" className="po-btn" disabled={busy}>
            {busy
              ? 'One moment'
              : soldOut
                ? RESERVE.waitlist.button
                : RESERVE.button}
          </button>
          {error && (
            <p className="po-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
      <p className="po-small">
        {soldOut ? RESERVE.waitlist.smallPrint : RESERVE.smallPrint}
      </p>
    </div>
  );
}
