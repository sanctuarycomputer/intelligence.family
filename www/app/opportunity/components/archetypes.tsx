import type { ReactNode } from 'react';

const titleStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(36px, 6vw, 64px)',
  fontWeight: 400,
} as const;

const subStyle = {
  fontSize: 'clamp(18px, 2.6vw, 26px)',
} as const;

const statStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(80px, 15vw, 180px)',
  fontWeight: 400,
  lineHeight: 0.9,
} as const;

function Title({ children }: { children: ReactNode }) {
  return <h1 style={titleStyle}>{children}</h1>;
}

function Sub({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <h2 className="mt-3" style={subStyle}>
      {children}
    </h2>
  );
}

function Body({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="large mt-6 max-w-2xl">{children}</p>;
}

export function Statement({
  title,
  sub,
  children,
}: {
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div>
      <Title>{title}</Title>
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
    <div>
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
    <div className="grid md:grid-cols-2 gap-10 items-center">
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
    <div>
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {cards.map(card => (
          <div key={card.heading} className="rounded-[8px] bg-fi-green-200 p-6">
            <h4>{card.heading}</h4>
            <p className="mt-3">{card.body}</p>
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
  children,
}: {
  title: ReactNode;
  sub?: ReactNode;
  media: ReactNode;
  caption?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div>
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <Body>{children}</Body>
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
    <div>
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
}: {
  title: ReactNode;
  sub?: ReactNode;
  cards: Array<{ heading: string; body: ReactNode }>;
}) {
  return (
    <div>
      <Title>{title}</Title>
      <Sub>{sub}</Sub>
      <div className="mt-10 flex flex-col gap-6">
        {cards.map(card => (
          <div key={card.heading} className="rounded-[8px] bg-fi-green-200 p-6">
            <h4>{card.heading}</h4>
            <p className="mt-3">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
