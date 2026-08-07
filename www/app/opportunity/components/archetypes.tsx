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
  children,
}: {
  stat: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div data-archetype="BigStat">
      <p style={statStyle}>{stat}</p>
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <Body>{children}</Body>
    </div>
  );
}

export function Split({
  title,
  sub,
  media,
  flip,
  children,
}: {
  title: ReactNode;
  sub?: ReactNode;
  media: ReactNode;
  flip?: boolean;
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
      <div className="grid md:grid-cols-3 gap-6 mt-10">
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
}: {
  title: ReactNode;
  sub?: ReactNode;
  rows: Array<{ label: ReactNode; value: ReactNode }>;
}) {
  return (
    <div data-archetype="Ledger">
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <div className="mt-10 max-w-2xl divide-y divide-fi-green-300">
        {rows.map((row, i) => (
          <div key={i} className="flex items-baseline justify-between py-4">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsPage({
  title,
  sub,
  cards,
  columns = 1,
}: {
  title: ReactNode;
  sub?: ReactNode;
  cards: Array<{ heading: string; body: ReactNode; art?: ReactNode }>;
  /** 3 lays the cards out as an equal-height grid instead of a stack. */
  columns?: 1 | 3;
}) {
  const tight = columns === 3;
  const grid = tight
    ? 'mt-10 grid md:grid-cols-3 auto-rows-fr gap-4'
    : 'mt-10 flex flex-col gap-6';
  return (
    <div data-archetype={tight ? 'Cards (3-col)' : 'Cards'}>
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <div className={grid}>
        {cards.map(card => (
          <div
            key={card.heading}
            className={`deck-card h-full rounded-[8px] bg-fi-green-200 ${tight ? 'p-5' : 'p-6'}`}
          >
            {card.art && <span className="deck-card-art">{card.art}</span>}
            <h4>{card.heading}</h4>
            <p className={tight ? 'deck-card-body-tight' : 'deck-card-body'}>
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
