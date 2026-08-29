'use client';

import { useEffect, useState } from 'react';
import { replay, subscribe } from './demoClock';

/**
 * Tap anywhere off the phone to stop the demo.
 *
 * Narrow viewports only. There the demo covers the page and the copy behind it
 * is at zero opacity, so a tap that misses the phone has nothing else it could
 * have meant. Wide, the page is still readable beside the demo and a tap
 * elsewhere is just a tap elsewhere.
 *
 * Sits above the page but below the phone, which takes its own pointer events
 * back on mobile — so tapping the conversation does not dismiss it. Covering
 * the control is deliberate and harmless: the control's own action while the
 * demo is running is this same reset.
 */
export default function DemoDismiss() {
  const [running, setRunning] = useState(false);

  useEffect(() => subscribe((_, phase) => setRunning(phase !== 'idle')), []);

  if (!running) return null;

  return (
    <div
      className="demo-dismiss"
      onPointerDown={replay}
      /* The button beneath is the accessible way out; this is a touch
         affordance duplicating it, so it stays out of the tree. */
      aria-hidden="true"
    />
  );
}
