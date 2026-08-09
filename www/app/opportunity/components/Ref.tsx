'use client';
import { REFERENCES, refNumber } from '../content/references';

function trackOutbound(label: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'outbound_click', {
      event_category: 'engagement',
      event_label: label,
      value: 1,
    });
  }
}

export default function Ref({ k }: { k: string }) {
  const ref = REFERENCES[k];
  if (!ref) throw new Error(`Unknown reference key: ${k}`);
  return (
    <a
      className="deck-ref"
      href={ref.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${ref.source} · ${ref.date}`}
      onClick={() => trackOutbound(`ref:${k}`)}
    >
      {refNumber(k)}
    </a>
  );
}
