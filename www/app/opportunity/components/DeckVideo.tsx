'use client';

import { useEffect, useRef } from 'react';

/** Ambient looping video that only plays while its slide is on screen, so
 * off-screen slides cost no decode work. */
export default function DeckVideo({
  src,
  className,
  label,
}: {
  src: string;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  );
}
