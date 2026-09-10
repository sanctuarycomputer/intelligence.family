'use client';

import HeroVideo from './HeroVideo';
import { Reveal } from './useReveal';
import {
  HERO,
  HERO_MEDIA,
  HARNESS,
  USE_CASE_GROUPS,
  USE_CASES_IMAGE,
  KITCHEN,
  PRIVACY,
  OBJECT,
  FAQ,
} from './content';

/* eslint-disable @next/next/no-img-element */

export function Hero({
  remaining,
  total,
  reserved,
  onReserve,
}: {
  remaining: number;
  total: number;
  reserved: boolean;
  onReserve: () => void;
}) {
  const portrait = HERO_MEDIA.orientation === 'portrait';
  return (
    <section
      className={`po-hero ${portrait ? 'po-hero-portrait' : 'po-hero-landscape'}`}
      aria-label="The Flagship"
    >
      <div className="po-hero-media">
        <HeroVideo
          src={HERO_MEDIA.src}
          poster={HERO_MEDIA.poster}
          label={HERO_MEDIA.label}
          className="po-hero-video"
        />
        <div className="po-hero-scrim" aria-hidden="true" />
      </div>
      <div className="po-container po-hero-copy">
        <h1>{HERO.headline}</h1>
        <p className="po-hero-body">{HERO.body}</p>
        <ul className="po-pillars">
          {HERO.pillars.map(p => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="po-hero-offer">
          {reserved ? "You're in line for the Flagship." : HERO.offer}
        </p>
        <div className="po-hero-cta">
          <button
            type="button"
            className="po-btn po-btn-light"
            onClick={onReserve}
            disabled={reserved}
          >
            {reserved ? "You're in line" : 'Reserve a founder unit'}
          </button>
          <span className="po-hero-count po-tabular">
            {remaining === 0
              ? `All ${total} founder units reserved`
              : `${remaining} of ${total} remaining`}
          </span>
        </div>
      </div>
      <div className="po-scroll-cue" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}

function Chapter({
  line,
  image,
  alt,
}: {
  line: string;
  image: string;
  alt: string;
}) {
  return (
    <div className="po-chapter">
      <img src={image} alt={alt} loading="lazy" />
      <div className="po-container">
        <Reveal as="p" className="po-chapter-line">
          {line}
        </Reveal>
      </div>
    </div>
  );
}

export function Harness() {
  return (
    <section aria-labelledby="harness-h">
      <Chapter line={HARNESS.line} image={HARNESS.image} alt={HARNESS.alt} />
      <div className="po-section">
        <div className="po-container">
          <Reveal>
            <h2 id="harness-h" className="po-h2">
              One local agent, for the whole house.
            </h2>
            <p className="po-prose">{HARNESS.body}</p>
            <p className="po-prose po-closer">{HARNESS.closer}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function UseCases() {
  return (
    <section className="po-section po-section-tint" aria-labelledby="uses-h">
      <div className="po-container">
        <div className="po-split">
          <Reveal>
            <h2 id="uses-h" className="po-h2">
              What it does for your family.
            </h2>
            <p className="po-prose">
              Eight jobs a household already has. One assistant that does them
              without leaving the house.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <img
              src={USE_CASES_IMAGE.src}
              alt={USE_CASES_IMAGE.alt}
              loading="lazy"
            />
          </Reveal>
        </div>
        {USE_CASE_GROUPS.map(group => (
          <div key={group.header} className="po-group">
            <h3 className="po-group-header">{group.header}</h3>
            <ul className="po-cards">
              {group.items.map((item, i) => (
                <Reveal as="li" key={item.n} className="po-card" delay={i * 60}>
                  <div className="po-card-n">
                    {String(item.n).padStart(2, '0')}
                  </div>
                  <h4>
                    {item.name}
                    {item.later && (
                      <span className="po-later">Coming later</span>
                    )}
                  </h4>
                  <p>{item.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Kitchen() {
  return (
    <section aria-label="The kitchen shelf">
      <Chapter line={KITCHEN.line} image={KITCHEN.image} alt={KITCHEN.alt} />
      <div className="po-section">
        <div className="po-container">
          <Reveal>
            <p className="po-prose">{KITCHEN.body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Privacy() {
  return (
    <section aria-label="Nothing leaves the house">
      <Chapter line={PRIVACY.line} image={PRIVACY.image} alt={PRIVACY.alt} />
      <div className="po-section">
        <div className="po-container">
          <Reveal>
            <p className="po-prose">{PRIVACY.body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ObjectSection() {
  return (
    <section className="po-section" aria-labelledby="object-h">
      <div className="po-container">
        <div className="po-object">
          <Reveal>
            <img src={OBJECT.cad} alt={OBJECT.cadAlt} loading="lazy" />
          </Reveal>
          <div>
            <Reveal>
              <h2 id="object-h" className="po-h2">
                The object.
              </h2>
            </Reveal>
            <ul className="po-specs po-tabular">
              {OBJECT.specs.map((spec, i) => (
                <Reveal as="li" key={spec} delay={120 + i * 90}>
                  {spec}
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
        <div className="po-split po-split-flip" style={{ marginTop: 64 }}>
          <Reveal>
            <p className="po-prose">{OBJECT.body}</p>
          </Reveal>
          <Reveal delay={100}>
            <img src={OBJECT.photo} alt={OBJECT.photoAlt} loading="lazy" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="po-section" aria-labelledby="faq-h">
      <div className="po-container">
        <Reveal>
          <h2 id="faq-h" className="po-h2">
            Questions.
          </h2>
        </Reveal>
        <ul className="po-faq">
          {FAQ.map((item, i) => (
            <Reveal as="li" key={item.q} className="po-card" delay={i * 50}>
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
