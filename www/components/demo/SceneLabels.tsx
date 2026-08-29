'use client';

import { useEffect, useRef, useState } from 'react';
import { read, subscribe } from './demoClock';
import { getAnchor } from './sceneProjection';
import type { LabelSpec } from './timeline';

/**
 * The leader-line labels, in the DOM over the scene.
 *
 * One component covers both phases: it names hardware parts while the device is
 * exploded, and names the artifact on the device's screen once the demo runs.
 * Which labels exist at a given moment comes from the clock.
 *
 * React decides which labels are mounted. Where they sit is written straight to
 * the elements each frame from the projection store, because that changes every
 * frame and re-rendering for it would be absurd.
 */

/** Distance from anchor to label box, in pixels. */
const LEAD = 84;
const RISE = 38;
/** Length of the horizontal stub before the leader line turns. */
const ELBOW = 18;

export default function SceneLabels() {
  /* Deliberately empty for the first render. The idle label set depends on how
     long the scene has been up, so seeding it from the clock makes the server
     and the client disagree — and a hydration mismatch here regenerates the
     tree, which tears down the WebGL scene mid-load. subscribe() fills it on
     mount. */
  const [labels, setLabels] = useState<LabelSpec[]>([]);
  const hostRef = useRef<HTMLDivElement>(null);
  const boxes = useRef(new Map<string, HTMLDivElement>());
  const paths = useRef(new Map<string, SVGPathElement>());

  useEffect(() => subscribe(s => setLabels(s.labels)), []);

  useEffect(() => {
    // No labels, nothing to project. A page sitting at rest should not hold a
    // rAF loop open to reposition an empty set.
    if (labels.length === 0) {
      if (hostRef.current) hostRef.current.style.opacity = '0';
      return;
    }
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);

      const host = hostRef.current;
      if (!host) return;
      const opacity = read().labelOpacity;
      host.style.opacity = String(opacity);
      // Nothing worth positioning while the group is invisible.
      if (opacity < 0.01) return;

      boxes.current.forEach((box, id) => {
        const path = paths.current.get(id);
        const anchor = getAnchor(id);

        if (!anchor?.onScreen) {
          box.style.visibility = 'hidden';
          if (path) path.style.visibility = 'hidden';
          return;
        }
        box.style.visibility = 'visible';
        if (path) path.style.visibility = 'visible';

        const side = box.dataset.side === 'left' ? -1 : 1;
        const bx = anchor.x + side * LEAD;
        const by = anchor.y - RISE;
        box.style.transform = `translate3d(${bx}px, ${by}px, 0)`;

        // A stub out of the label, then a diagonal down to the part. Reads as
        // a drawing callout rather than a tooltip tail.
        if (path) {
          const elbow = bx - side * ELBOW;
          path.setAttribute(
            'd',
            `M ${bx} ${by} L ${elbow} ${by} L ${anchor.x} ${anchor.y}`
          );
        }
      });
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [labels]);

  return (
    <div ref={hostRef} className="scene-labels">
      <svg className="scene-labels-lines">
        {labels.map(l => (
          <path
            key={l.id}
            className="scene-label-line"
            ref={el => {
              if (el) paths.current.set(l.id, el);
              else paths.current.delete(l.id);
            }}
          />
        ))}
      </svg>

      {labels.map(l => (
        <div
          key={l.id}
          data-side={l.side}
          className="scene-label"
          ref={el => {
            if (el) boxes.current.set(l.id, el);
            else boxes.current.delete(l.id);
          }}
        >
          <span className={`scene-label-body scene-label-body--${l.side}`}>
            <span className="scene-label-text">{l.text}</span>
            {l.sub ? <span className="scene-label-sub">{l.sub}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
