'use client';

import { useEffect, useRef } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/** Plays only while on screen and never under reduced motion, so those
 * users see the poster. No autoplay attribute: play() is the only path. */
export default function HeroVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCED).matches) return;
    const io = new IntersectionObserver(
      entries => {
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  );
}
