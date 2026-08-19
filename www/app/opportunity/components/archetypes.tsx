import type { ReactNode } from 'react';

const titleStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(36px, 6vw, 64px)',
  fontWeight: 400,
} as const;

const splashTitleStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(40px, 7.5vw, 88px)',
  fontWeight: 400,
  lineHeight: 1.04,
} as const;

const subStyle = {
  fontSize: 'clamp(18px, 2.6vw, 26px)',
} as const;

const statStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(64px, 11vw, 132px)',
  fontWeight: 400,
  lineHeight: 0.9,
} as const;

function Title({
  children,
  splash,
}: {
  children: ReactNode;
  splash?: boolean;
}) {
  return (
    <h1
      className={splash ? 'deck-title deck-title-splash' : 'deck-title'}
      style={splash ? splashTitleStyle : titleStyle}
    >
      {children}
    </h1>
  );
}

function Sub({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <h2 className="mt-2" style={subStyle}>
      {children}
    </h2>
  );
}

function Body({ children, block }: { children?: ReactNode; block?: boolean }) {
  if (!children) return null;
  if (block) return <div className="deck-body">{children}</div>;
  return <p className="deck-body">{children}</p>;
}

export function Statement({
  title,
  sub,
  splash,
  children,
}: {
  title: ReactNode;
  sub?: ReactNode;
  /** Oversized, minimal treatment for the act-transition splash pages. */
  splash?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      data-archetype={splash ? 'Statement (splash)' : 'Statement'}
      className={splash ? 'max-w-5xl' : undefined}
    >
      <Title splash={splash}>{title}</Title>
      <Sub>{sub}</Sub>
      <Body>{children}</Body>
    </div>
  );
}

export function BigStat({
  stat,
  title,
  sub,
  band,
  children,
}: {
  stat: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  /** Accent-box callout rendered beneath the body copy, at its width. */
  band?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div data-archetype="BigStat">
      <p style={statStyle}>{stat}</p>
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <Body>{children}</Body>
      {band && <Band narrow>{band}</Band>}
    </div>
  );
}

export function Split({
  title,
  sub,
  media,
  flip,
  band,
  children,
}: {
  title: ReactNode;
  sub?: ReactNode;
  media: ReactNode;
  flip?: boolean;
  /** Accent-box callout rendered beneath the body copy. */
  band?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      data-archetype={flip ? 'Split (flipped)' : 'Split'}
      className="grid md:grid-cols-2 gap-10 items-center"
    >
      <div className={flip ? 'md:order-2' : undefined}>
        <Title>{title}</Title>
        <Sub>{sub}</Sub>
        <Body>{children}</Body>
        {band && <Band narrow>{band}</Band>}
      </div>
      <div className={flip ? 'md:order-1' : undefined}>{media}</div>
    </div>
  );
}

export function EvidenceGrid({
  title,
  sub,
  cards,
}: {
  title: ReactNode;
  sub?: ReactNode;
  cards: Array<{ heading: string; body: ReactNode }>;
}) {
  return (
    <div data-archetype="EvidenceGrid">
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <div
        className={`grid ${cards.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mt-10`}
      >
        {cards.map(card => (
          <div
            key={card.heading}
            className="deck-card rounded-[8px] bg-fi-green-200 p-6"
          >
            <h4>{card.heading}</h4>
            <p className="deck-card-body">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiagramPage({
  title,
  sub,
  media,
  caption,
  bodyBlock,
  children,
}: {
  title: ReactNode;
  sub?: ReactNode;
  media: ReactNode;
  caption?: ReactNode;
  /** Render the body as a div so block content (lists) is valid HTML. */
  bodyBlock?: boolean;
  children?: ReactNode;
}) {
  return (
    <div data-archetype="DiagramPage">
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <Body block={bodyBlock}>{children}</Body>
      <div className="mt-10">
        {media}
        {caption && <p className="caption">{caption}</p>}
      </div>
    </div>
  );
}

export function Ledger({
  title,
  sub,
  rows,
  wide,
}: {
  title: ReactNode;
  sub?: ReactNode;
  rows: Array<{ label: ReactNode; value: ReactNode }>;
  /** Full-width rows for rate-card style slides. */
  wide?: boolean;
}) {
  return (
    <div
      data-archetype="Ledger"
      className={wide ? 'deck-ledger-fill' : undefined}
    >
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <div
        className={`mt-10 divide-y divide-fi-green-300 ${wide ? 'deck-ledger-rows' : 'max-w-2xl'}`}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            className={
              wide
                ? 'deck-ledger-row flex items-center justify-between'
                : 'flex items-baseline justify-between py-4'
            }
          >
            <span className="deck-ledger-label">{row.label}</span>
            <span className="deck-ledger-value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingTiers({
  title,
  sub,
  tiers,
  closer,
  columns = 4,
}: {
  title: ReactNode;
  sub?: ReactNode;
  tiers: Array<{
    name: string;
    price: string;
    body: ReactNode;
    meta: string;
  }>;
  /** Cards per row on desktop; defaults to 4. */
  columns?: 3 | 4;
  /** Full-width takeaway band beneath the tiers. */
  closer?: ReactNode;
}) {
  return (
    <div data-archetype="PricingTiers">
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <div
        className={`mt-10 grid ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} auto-rows-fr gap-4`}
      >
        {tiers.map(tier => (
          <div key={tier.name} className="deck-tier">
            <div className="deck-tier-content">
              <h4 className="deck-tier-name">{tier.name}</h4>
              <p className="deck-tier-body">{tier.body}</p>
            </div>
            <div className="deck-tier-footer">
              <span className="deck-tier-price">{tier.price}</span>
              <span className="deck-tier-meta">{tier.meta}</span>
            </div>
          </div>
        ))}
      </div>
      {closer && <Band>{closer}</Band>}
    </div>
  );
}

/** Accent-box callout. The act theme sets the background via .deck-band;
 * the icon comes from the --deck-band-icon CSS variable (tree by default,
 * swappable live from the ?debug=true bar). */
export function Band({
  children,
  narrow,
}: {
  children: ReactNode;
  /** Cap the box at the .deck-body text width instead of full-bleed. */
  narrow?: boolean;
}) {
  return (
    <p className={narrow ? 'deck-band deck-band-narrow' : 'deck-band'}>
      <span className="deck-band-icon" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function StatTiles({
  tiles,
  stacked,
}: {
  tiles: Array<{ value: string; label: ReactNode }>;
  /** One tile per row instead of a horizontal strip. */
  stacked?: boolean;
}) {
  return (
    <div
      className={`deck-stat-tiles mt-6 grid ${stacked ? 'gap-3 deck-stat-tiles-stacked' : 'gap-4'}`}
      style={{
        gridTemplateColumns: stacked ? '1fr' : `repeat(${tiles.length}, 1fr)`,
      }}
    >
      {tiles.map((tile, i) => (
        <div key={`${tile.value}-${i}`} className="deck-stat-tile">
          <div className="deck-stat-tile-value">{tile.value}</div>
          <div className="deck-stat-tile-label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}

export function CardsPage({
  title,
  sub,
  cards,
  columns = 1,
  variant,
}: {
  title: ReactNode;
  sub?: ReactNode;
  cards: Array<{
    heading: string;
    body: ReactNode;
    art?: ReactNode;
    photo?: ReactNode;
    /** Footer tag rendered in the QuoteBox-style strip (quote variant). */
    meta?: string;
  }>;
  /** 2, 3 or 4 lays the cards out as an equal-height grid instead of a stack. */
  columns?: 1 | 2 | 3 | 4;
  /** 'quote' swaps the ragged fill for the homepage QuoteBox card shell. */
  variant?: 'quote';
}) {
  const tight = columns !== 1;
  const grid =
    columns === 4
      ? 'mt-10 grid md:grid-cols-4 auto-rows-fr gap-3'
      : columns === 3
        ? 'mt-10 grid md:grid-cols-3 auto-rows-fr gap-4'
        : columns === 2
          ? 'mt-10 grid md:grid-cols-2 auto-rows-fr gap-4'
          : 'mt-10 flex flex-col gap-6';
  return (
    <div data-archetype={tight ? 'Cards (3-col)' : 'Cards'}>
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <div className={grid}>
        {cards.map(card => (
          <div
            key={card.heading}
            className={`deck-card h-full rounded-[8px] bg-fi-green-200 ${
              variant === 'quote' ? 'deck-card-quote ' : ''
            }${columns === 4 ? 'p-4' : tight ? 'p-5' : 'p-6'}`}
          >
            <div
              className={
                variant === 'quote' ? 'deck-card-quote-main' : undefined
              }
            >
              {card.art && <span className="deck-card-icon">{card.art}</span>}
              {card.photo && (
                <span className="deck-card-photo">{card.photo}</span>
              )}
              <h4>{card.heading}</h4>
              <p className={tight ? 'deck-card-body-tight' : 'deck-card-body'}>
                {card.body}
              </p>
            </div>
            {variant === 'quote' && card.meta && (
              <div className="deck-tier-footer">
                <span className="deck-tier-meta">{card.meta}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
