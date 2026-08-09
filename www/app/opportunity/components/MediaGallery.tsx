'use client';

import { useState, type ReactNode } from 'react';

type Slide = {
  /** Null renders an FPO placeholder until the real photo lands. */
  src: string | null;
  alt: string;
  caption: ReactNode;
};

/** Framed photo with a thumbnail rail: clicking a thumb swaps the photo and
 * its caption together. */
export default function MediaGallery({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const current = slides[active];
  return (
    <div className="deck-gallery">
      <div className="deck-media-figure deck-gallery-main">
        <span className="deck-gallery-frame">
          {current.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.src} alt={current.alt} />
          ) : (
            <span className="deck-gallery-fpo">{current.alt}</span>
          )}
        </span>
        <span className="deck-media-caption">{current.caption}</span>
      </div>
      <div className="deck-gallery-thumbs" role="tablist" aria-label="Photos">
        {slides.map((slide, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={slide.alt}
            className={i === active ? 'active' : undefined}
            onClick={() => setActive(i)}
          >
            {slide.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.src} alt="" />
            ) : (
              <span>{i + 1}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
