'use client';

import { useEffect, useRef } from 'react';

/** Ambient looping video that only plays while its slide is on screen, so
 * off-screen slides cost no decode work. */
export default function DeckVideo({
  src,
  className,
  label,
  poster,
}: {
  src: string;
  className?: string;
  label: string;
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (entry.isIntersecting) {
          // Let the scroll snap settle before decode starts.
          timer = setTimeout(() => {
            el.play().catch(() => {});
          }, 250);
        } else {
          el.pause();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
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
