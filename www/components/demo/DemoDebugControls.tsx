'use client';

import { useEffect, useState } from 'react';
import { getTime, play, replay, resume, seek, subscribe } from './demoClock';
import { BEAT, END, EXCHANGES } from './timeline';
import type { DemoPhase } from './demoState';

/**
 * ?debug=true stage scrubber.
 *
 * Waiting sixteen seconds to look at the email card is not a workflow, so this
 * parks the clock anywhere on the timeline. Seeking is just stateAt(t), which
 * is why it costs nothing: there is no sequence to fast-forward through.
 */
export default function DemoDebugControls() {
  const [t, setT] = useState(() => getTime());
  const [phase, setPhase] = useState<DemoPhase>('idle');

  useEffect(
    () =>
      subscribe((_, p) => {
        setPhase(p);
        setT(getTime());
      }),
    []
  );

  // While the clock runs, follow it rather than fighting it.
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      setT(getTime());
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const jump = (seconds: number) => seek(seconds);

  return (
    <div className="device-debug demo-debug" role="group" aria-label="Demo">
      <p className="device-debug-title">demo · {phase}</p>

      <label className="device-debug-row">
        <span className="device-debug-label">t</span>
        <input
          type="range"
          min={0}
          max={END}
          step={0.05}
          value={t}
          onChange={e => jump(Number(e.target.value))}
        />
        <span className="device-debug-value">{t.toFixed(2)}</span>
      </label>

      <div className="device-debug-actions">
        <button type="button" onClick={() => jump(0)}>
          intro
        </button>
        {EXCHANGES.map((ex, i) => (
          <button key={ex.id} type="button" onClick={() => jump(ex.start)}>
            {i + 1}
          </button>
        ))}
        <button type="button" onClick={() => jump(END)}>
          end
        </button>
      </div>

      <div className="device-debug-actions">
        <button type="button" onClick={play}>
          play
        </button>
        <button type="button" onClick={resume}>
          resume
        </button>
        <button type="button" onClick={replay}>
          reset
        </button>
      </div>

      <div className="device-debug-actions">
        {/* The two beats worth landing on exactly, per exchange. */}
        <button
          type="button"
          onClick={() => jump(EXCHANGES[0].start + BEAT.think + 0.2)}
          title="device thinking, phone not yet typing"
        >
          think
        </button>
        <button
          type="button"
          onClick={() => jump(EXCHANGES[0].start + BEAT.label + 0.2)}
          title="card up, label on"
        >
          card
        </button>
        <button
          type="button"
          onClick={() => jump(EXCHANGES[2].start + BEAT.trailing + 0.2)}
          title="email sent"
        >
          sent
        </button>
      </div>
    </div>
  );
}
