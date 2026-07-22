'use client';

import { useEffect, useRef } from 'react';
import {
  calloutPhase,
  fotaArtOpacity,
  mirrorArtOpacity,
  silhouetteOpacity,
  TOUR_CALLOUTS,
  type AnchorScreenMap,
} from './stackTour';

// Hairline ink: the QuoteBox outline green (fi-green-500).
const INK = '#5E7B29';

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontVariationSettings: "'MONO' 100",
  fontSize: '11px',
  letterSpacing: '0.03em',
  color: '#D7DDD4',
  whiteSpace: 'nowrap',
  backgroundColor: INK,
  padding: '3px 8px',
  borderRadius: '4px',
};

// A simple side-profile trunk wedge for the line-art silhouettes.
const WEDGE_PATH =
  'M10 62 L24 16 Q25 12 30 12 L82 12 Q87 12 88 17 L91 62 Q91 67 85 67 L15 67 Q10 67 10 62 Z';

// Hairline callouts and static technical-drawing art, drawn over the
// canvas. Both the anchor pixels AND the timeline value arrive per-frame
// from StackTourCanvas through shared refs: the canvas is the single
// source of truth for t, so callouts can never disagree with the scene.
export default function CalloutLayer({
  anchorsRef,
  tRef,
}: {
  anchorsRef: React.RefObject<AnchorScreenMap>;
  tRef: React.RefObject<number>;
}) {
  const lineRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const jointRefs = useRef<(SVGCircleElement | null)[]>([]);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = tRef.current ?? 0;
      const map = anchorsRef.current ?? {};

      TOUR_CALLOUTS.forEach((c, i) => {
        const group = groupRefs.current[i];
        const line = lineRefs.current[i];
        const label = labelRefs.current[i];
        if (!group || !line || !label) return;
        const phase = calloutPhase(c.beat, t);
        const anchor = map[c.anchor];
        const on = phase.opacity > 0.01 && !!anchor?.visible;
        group.style.opacity = on ? String(phase.opacity) : '0';
        if (!on || !anchor) return;
        // Elbow: anchor -> horizontal step -> label edge.
        const lx = anchor.x + c.dx;
        const ly = anchor.y + c.dy;
        const elbowX = anchor.x + c.dx * 0.55;
        line.setAttribute(
          'points',
          `${anchor.x},${anchor.y} ${elbowX},${ly} ${lx},${ly}`
        );
        const len =
          Math.hypot(elbowX - anchor.x, ly - anchor.y) + Math.abs(lx - elbowX);
        line.style.strokeDasharray = String(len);
        line.style.strokeDashoffset = String(len * (1 - phase.draw));
        // Terminal nodes: one on the anchor tail, one at the label junction.
        const dot = dotRefs.current[i];
        if (dot) {
          dot.setAttribute('cx', String(anchor.x));
          dot.setAttribute('cy', String(anchor.y));
        }
        const joint = jointRefs.current[i];
        if (joint) {
          joint.setAttribute('cx', String(lx));
          joint.setAttribute('cy', String(ly));
        }
        label.style.transform = `translate(${lx + (c.dx >= 0 ? 8 : -8)}px, ${ly}px) translate(${c.dx >= 0 ? '0' : '-100%'}, -50%)`;
      });

      const arts: [string, number][] = [
        ['silhouette', silhouetteOpacity(t)],
        ['mirror', mirrorArtOpacity(t)],
        ['fota', fotaArtOpacity(t)],
      ];
      for (const [key, opacity] of arts) {
        const el = artRefs.current[key];
        if (el) el.style.opacity = String(opacity);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tRef, anchorsRef]);

  return (
    // aria-hidden: the labels echo concepts the flow copy already carries;
    // the right column is the authoritative, accessible text.
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Projected hairline callouts. */}
      {TOUR_CALLOUTS.map((c, i) => (
        <div
          key={`${c.beat}-${c.anchor}`}
          ref={el => {
            groupRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ opacity: 0 }}
        >
          <svg className="absolute inset-0 h-full w-full">
            <polyline
              ref={el => {
                lineRefs.current[i] = el;
              }}
              fill="none"
              stroke={INK}
              strokeWidth="1"
              points="0,0"
            />
            <circle
              ref={el => {
                dotRefs.current[i] = el;
              }}
              r="2.5"
              fill={INK}
              cx="-10"
              cy="-10"
            />
            <circle
              ref={el => {
                jointRefs.current[i] = el;
              }}
              r="2.5"
              fill={INK}
              cx="-10"
              cy="-10"
            />
          </svg>
          <div
            ref={el => {
              labelRefs.current[i] = el;
            }}
            className="absolute left-0 top-0"
            style={LABEL_STYLE}
          >
            {c.label}
          </div>
        </div>
      ))}

      {/* Beat 08: two line-art trunk silhouettes + gossip arcs. */}
      <div
        ref={el => {
          artRefs.current.silhouette = el;
        }}
        className="absolute inset-0"
        style={{ opacity: 0 }}
      >
        <svg
          className="absolute"
          style={{ right: '8%', top: '30%', width: '34%', height: '40%' }}
          viewBox="0 0 240 120"
          fill="none"
        >
          <g stroke={INK} strokeWidth="1">
            <g transform="translate(20 10) scale(0.9)">
              <path d={WEDGE_PATH} />
            </g>
            <g transform="translate(140 40) scale(0.75)">
              <path d={WEDGE_PATH} />
            </g>
            {/* Gossip arcs, both directions. */}
            <path d="M-40 70 Q30 8 48 42" strokeDasharray="3 4" />
            <path d="M96 46 Q140 18 168 62" strokeDasharray="3 4" />
            <path d="M-30 95 Q90 130 160 100" strokeDasharray="3 4" />
          </g>
        </svg>
      </div>

      {/* Beat 09: the Mirror rectangle, one-way line rising. */}
      <div
        ref={el => {
          artRefs.current.mirror = el;
        }}
        className="absolute inset-0"
        style={{ opacity: 0 }}
      >
        <svg
          className="absolute"
          style={{ left: '34%', top: '6%', width: '32%', height: '66%' }}
          viewBox="0 0 200 300"
          fill="none"
        >
          <g stroke={INK} strokeWidth="1">
            <rect x="70" y="8" width="60" height="84" rx="4" />
            <path d="M100 292 L100 108" strokeDasharray="3 4" />
            <path d="M94 116 L100 104 L106 116" />
          </g>
        </svg>
        <div
          className="absolute"
          style={{ ...LABEL_STYLE, left: '52%', top: '4%' }}
        >
          THE MIRROR · CIPHERTEXT ONLY
        </div>
      </div>

      {/* Beat 10: FOTA path in from the card edge, faint return tick. */}
      <div
        ref={el => {
          artRefs.current.fota = el;
        }}
        className="absolute inset-0"
        style={{ opacity: 0 }}
      >
        <svg
          className="absolute"
          style={{ left: 0, top: '34%', width: '40%', height: '32%' }}
          viewBox="0 0 300 160"
          fill="none"
        >
          <g stroke={INK} strokeWidth="1">
            <path d="M0 60 H180 Q200 60 210 78 L232 112" />
            <path d="M224 100 L232 112 L218 112" />
            <path
              d="M210 130 Q120 150 0 120"
              strokeDasharray="2 5"
              opacity="0.5"
            />
          </g>
        </svg>
        {/* The delivery label rides the projected trunk callout; only the
            return tick is labelled here. */}
        <div
          className="absolute"
          style={{ ...LABEL_STYLE, left: '3%', top: '64%', opacity: 0.6 }}
        >
          HEALTH ONLY
        </div>
      </div>
    </div>
  );
}
