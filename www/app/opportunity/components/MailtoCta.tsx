'use client';

const ADDRESS = 'invest@intelligence.family';
const HREF = `mailto:${ADDRESS}?subject=Family%20Intelligence%20Demo`;
const LABEL = 'opportunity_ask';

function trackEmailClick(label: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'email_click', {
      event_category: 'engagement',
      event_label: label,
      value: 1,
    });
  }
}

export default function MailtoCta() {
  return (
    <a
      href={HREF}
      className="underline hover:no-underline"
      onClick={() => trackEmailClick(LABEL)}
    >
      {ADDRESS}
    </a>
  );
}
