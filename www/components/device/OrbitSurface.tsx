'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribe } from '@/components/demo/demoClock';
import { DRAG_SPEED, addOrbit } from './orbit';

/**
 * Lets the visitor turn the device while it is sitting there.
 *
 * This is a separate element rather than listeners on the scene itself because
 * the scene canvas is behind the page content and takes no pointer events. It
 * covers only the right of the viewport, where the device is, so dragging
 * across the About column still selects text rather than spinning a model.
 *
 * Present only while the demo is idle. Once it is running the camera is the
 * script's, and a surface that quietly swallowed drags over a playing demo
 * would be worse than no surface at all.
 */
export default function OrbitSurface() {
  const [idle, setIdle] = useState(false);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => subscribe((_, phase) => setIdle(phase === 'idle')), []);

  if (!idle) return null;

  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    // Dragging right turns the device's near side toward you, which is what
    // grabbing the object itself would do.
    addOrbit(-dx * DRAG_SPEED, -dy * DRAG_SPEED);
  };

  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className="device-orbit"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      aria-hidden="true"
    />
  );
}
