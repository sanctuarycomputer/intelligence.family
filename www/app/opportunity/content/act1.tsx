import type { ReactNode } from 'react';
import LeafIcon from '@/components/LeafIcon';
import DeckPage from '../components/DeckPage';
import Ref from '../components/Ref';
import MediaGallery from '../components/MediaGallery';
import {
  Band,
  CardsPage,
  Split,
  Statement,
  StatTiles,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 25;

const coverLeafStyle = {
  width: '0.35em',
  height: '0.4em',
  top: '-0.05em',
  right: '-0.4em',
} as const;

const coverSubStyle = {
  // The floor tracks viewport width so the first line never wraps on phones.
  fontSize: 'clamp(12px, 3.2vw, 34px)',
  whiteSpace: 'nowrap',
} as const;

/**
 * Page 1, the cover. Takes the gate slot so OpportunityClient can render the
 * email gate beneath the subtitle (null on the server-side page list).
 */
export function coverPage(gate: ReactNode): ReactNode {
  return (
    <DeckPage key={1} n={1} total={TOTAL}>
      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="relative inline-block">
          Family<span className="tracking-[-0.1em]"> </span>Intelligence
          <LeafIcon className="absolute leaf-animate" style={coverLeafStyle} />
        </h1>
        <p style={coverSubStyle}>
          AI that runs in your home, your office, your hand.
          <br />
          <span className="relative inline-block">
            We&rsquo;re starting with families.
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/research/email-underline.png"
              alt=""
              aria-hidden="true"
              className="absolute left-0 -bottom-1 w-full h-auto pointer-events-none"
              style={{ transform: 'translateY(50%)' }}
            />
          </span>
        </p>
        {gate && <div className="mx-auto mt-20 w-full max-w-md">{gate}</div>}
      </div>
      {!gate && (
        <div className="deck-scroll-hint" aria-hidden="true">
          Scroll down
          <span className="deck-scroll-hint-arrow">&darr;</span>
        </div>
      )}
    </DeckPage>
  );
}

const page3 = (
  <DeckPage key={2} n={2} total={TOTAL}>
    <Split
      title="AI finally runs on consumer hardware"
      sub="Open models are trailing just months behind the best."
      band="Open models already rival the frontier. Soon they'll be indistinguishable."
      media={
        <MediaGallery
          slides={[
            {
              src: '/research/family-together.png',
              alt: 'Illustration of a family gathered together around the Family Book device',
              caption:
                'We partnered with Mozilla Foundation to publish our research in February 2026. It was received with overwhelmingly positive reception on social media - at a time when AI devices were a focus of vitriol online.',
            },
            {
              src: '/opportunity/good-screens.webp',
              alt: "The cover of It's Nice That's Good Screens report, set in bold type on black",
              caption: (
                <>
                  Our concept was featured in{' '}
                  <a
                    href="https://www.itsnicethat.com/features/good-screens-report-its-nice-that-insights-120826"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    It&rsquo;s Nice That&rsquo;s Good Screens report
                  </a>
                  , August 2026: a survey of the screens doing right by their
                  users.
                </>
              ),
            },
            {
              src: '/opportunity/prototype-photo.jpg',
              alt: "Our prototype's compute board, held in one hand above a keyboard",
              caption:
                'Mid 2025, running Qwen 2.5 on CPU. Holding a squishy representation of all of recorded human thought in the palm of my hand.',
            },
            {
              src: '/opportunity/snapdragon-x-elite.jpg',
              alt: 'A Snapdragon X Elite chip mounted in a clear acrylic block, lying on grass',
              caption:
                'Snapdragon X Elite: newly released consumer silicon capable of running local models',
            },
          ]}
        />
      }
    >
      Open weights keep closing on closed models.
      <Ref k="epoch-open-weights" /> Thinking Machines Lab released Inkling,
      975B parameters, Apache 2.0.
      <Ref k="inkling" /> Z.ai&rsquo;s founder predicts a Fable quality open
      model before Q1 2027.
      <Ref k="zai-fable-prediction" />
    </Split>
  </DeckPage>
);

const page2 = (
  <DeckPage key={3} n={3} total={TOTAL}>
    <Split
      flip
      title="The GPU is coming home"
      sub="AI compute is moving into the house, the way the personal computer did."
      media={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/opportunity/gpu-coming-home.png"
          alt="A family carries a small glowing compute cube through their front door at golden hour, their daughter holding the door open, while a cold blue datacenter sits small and distant on the horizon behind them"
          className="deck-slide-media"
        />
      }
    >
      Compute has made this trip before.{' '}
      <strong>
        8% of US households owned a computer in 1984, and 89% did by 2016.
      </strong>
      <Ref k="census-computer-ownership" /> As the home gets smarter and
      smarter, the datacenter will make the same move.
    </Split>
  </DeckPage>
);

const LINEAGE_CARDS = [
  {
    heading: 'PGP',
    meta: '1991 · Boulder, Colorado',
    body: (
      <>
        Phil Zimmermann put private mail in civilian hands, then beat the US
        export case against it: code is protected American speech. PGP later
        sold for <strong>$300M</strong>.
        <Ref k="pgp-symantec" />
      </>
    ),
  },
  {
    heading: 'Mozilla',
    meta: '2004 · Mountain View, California',
    body: (
      <>
        Firefox broke Microsoft&rsquo;s browser monopoly and took the user-first
        web mainstream: roughly <strong>a third of the web</strong> at its peak,
        and nearly <strong>half a billion users</strong>.
        <Ref k="firefox-users" />
      </>
    ),
  },
  {
    heading: 'Signal',
    meta: '2014 · San Francisco',
    body: (
      <>
        Started by Moxie Marlinspike in SF, Signal made private conversation the
        default for <strong>hundreds of millions</strong>.
        <Ref k="signal-protocol-docs" />
      </>
    ),
  },
  {
    heading: 'Family Intelligence',
    meta: '2027 · San Francisco & New York City',
    body: (
      <>
        <strong>Private memory &amp; inference</strong> for the household,
        office and beyond. Designed &amp; engineered in SF &amp; NYC.
      </>
    ),
  },
];

const problemPage = (
  <DeckPage key={4} n={4} total={TOTAL}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/opportunity/home-at-dusk.png"
      alt="A family home at dusk, windows glowing warm: someone reads in bed upstairs while two people talk over the kitchen table below"
      className="deck-bg-art"
      style={{ width: 'clamp(546px, 60vw, 1144px)' }}
    />
    <div className="deck-bg-copy" style={{ maxWidth: '700px' }}>
      <CardsPage
        columns={1}
        title="The most valuable context is what you'd never upload"
        sub="The home holds the richest context any AI could use."
        cards={[
          {
            heading: 'What households want',
            art: (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/opportunity/icons/heart.png"
                alt=""
                className="deck-icon-small"
              />
            ),
            body: (
              <ul className="deck-list">
                <li>A system that actually knows the household</li>
                <li>Memory that spans years, not sessions</li>
                <li>Answers grounded in what was really said</li>
                <li>Something the least technical person can use</li>
              </ul>
            ),
          },
          {
            heading: 'But families will resist',
            art: (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/opportunity/icons/close.png"
                alt=""
                className="deck-icon-small"
              />
            ),
            body: (
              <ul className="deck-list">
                <li>
                  Sending intimate stories &amp; household audio to a
                  third-party cloud
                </li>
                <li>
                  Trusting a business who intends to monetize or train on their
                  data
                </li>
                <li>
                  Accepting a privacy policy they&rsquo;ll never read and hope
                  for the best
                </li>
                <li>Needing connectivity for a device in their kitchen</li>
              </ul>
            ),
          },
        ]}
      />
    </div>
  </DeckPage>
);

const vsTitleStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(28px, 3.8vw, 52px)',
  fontWeight: 400,
  lineHeight: 1.05,
} as const;

const sentimentPage = (
  <DeckPage key={5} n={5} total={TOTAL}>
    <div className="deck-vs">
      <div className="deck-vs-row">
        <div className="deck-vs-text">
          <h1 className="deck-title" style={vsTitleStyle}>
            7 in 10 Americans don&rsquo;t trust big tech&rsquo;s AI
          </h1>
          <p className="deck-body">
            Pew measured America&rsquo;s growing disdain for big tech&rsquo;s AI
            in June 2026.
            <Ref k="pew-distrust" /> Amazon went the other way, removing the
            Echo&rsquo;s only local-processing option in March 2025.
            <Ref k="echo-local-removed" />{' '}
            <strong>
              friend.com&rsquo;s always-listening pendant was vandalized on the
              NYC subway.
            </strong>
            <Ref k="friend-backlash" />
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/opportunity/friend-poster.webp"
          alt="friend.com's subway poster defaced in red marker: 'Go make real friends', 'THIS IS SURVEILLANCE'"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/opportunity/friend-comments.png"
          alt="Instagram comments on friend.com's pendant: 'AI IS NOT YOUR FRIEND', 'Disgusting', 'This Black Mirror type product. Ew'"
        />
      </div>
      <div className="deck-vs-row deck-vs-row-flip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/opportunity/family-book-shelf.png"
          alt="The Family Book prototype held open like a leather folio on a bookshelf, showing the Add to Family Tree screen"
          style={{ objectPosition: 'center' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/opportunity/fi-comments.png"
          alt="Instagram comments on the Family Intelligence research: 'LOVE THIS!', 'Brilliant idea', 'Small local AI is the future!'"
        />
        <div className="deck-vs-text deck-vs-text-right">
          <h1 className="deck-title" style={vsTitleStyle}>
            But local architecture wins consumers over
          </h1>
          <p className="deck-body">
            Our research, in partnership with the Mozilla Foundation, drew an{' '}
            <strong>overwhelmingly positive response</strong> across 28k+
            impressions.
            <Ref k="mozilla-research" /> Our concept was featured in It&rsquo;s
            Nice That&rsquo;s Good Screens report.
            <Ref k="its-nice-that" />
          </p>
        </div>
      </div>
    </div>
  </DeckPage>
);

const demandPage = (
  <DeckPage key={6} n={6} total={TOTAL}>
    <Statement
      title="Consumers happily pay for privacy..."
      sub="Local AI is newly possible, and demand is growing fast."
    />
    <StatTiles
      stacked
      tiles={[
        {
          value: '~9M',
          label: (
            <>
              People running models locally with Ollama, the hard way
              <Ref k="ollama" />
            </>
          ),
        },
        {
          value: 'Sold out',
          label: (
            <>
              NVIDIA&rsquo;s $3,999 DGX Spark hobbyist AI machine sold out in
              hours
              <Ref k="dgx-spark-soldout" />
            </>
          ),
        },
        {
          value: '10M+',
          label: (
            <>
              Users on Proton Lumo, the private ChatGPT alternative, within a
              year of launch
              <Ref k="lumo-10m" />
            </>
          ),
        },
        {
          value: '100M+',
          label: (
            <>
              Proton accounts across mail, VPN, and storage
              <Ref k="proton-nonprofit" />
            </>
          ),
        },
        {
          value: '$438M',
          label: (
            <>
              1Password ARR, up 32% year over year
              <Ref k="1password-arr" />
            </>
          ),
        },
        {
          value: '$61B+',
          label: (
            <>
              Global consumer VPN market, billed monthly to ordinary households
              <Ref k="vpn-market" />
            </>
          ),
        },
      ]}
    />
    <Band narrow>
      As the gap between frontier and open-weight models narrows, privacy stops
      being a tradeoff.
    </Band>
  </DeckPage>
);

const routingPage = (
  <DeckPage key={7} n={7} total={TOTAL}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/opportunity/walled-garden.png"
      alt="A hedge-walled garden with the glowing Family Book at its center, speech bubbles looping to it along golden paths; one wooden gate sits ajar, where a single dotted thread reaches out to a distant datacenter in a cloud and returns carrying a small parcel"
      className="deck-bg-art"
      style={{ width: 'clamp(500px, 52vw, 1040px)' }}
    />
    <div className="deck-bg-copy" style={{ maxWidth: '700px' }}>
      <CardsPage
        columns={1}
        title="& local AI won't sacrifice convenience"
        sub="Enterprises already route AI by sensitivity: we're bringing similar patterns to consumer."
        cards={[
          {
            heading: 'Prompt routing is well studied',
            body: (
              <>
                UC Berkeley&rsquo;s RouteLLM keeps{' '}
                <strong>~95% of frontier quality</strong> while sending only a
                quarter of requests to the big model.
                <Ref k="routellm" /> Stanford&rsquo;s FrugalGPT matched GPT-4 at
                up to 98% lower cost.
                <Ref k="frugalgpt" /> Most requests never needed the cloud.
              </>
            ),
          },
          {
            heading: "It's how business runs AI now",
            body: (
              <>
                Sensitive data stays local by default, and only hard tasks
                escalate. Enterprises route to cut cost and meet compliance rules: sending
              everything to the cloud burns money on tasks small
                models handle fine.
              </>
            ),
          },
          {
            heading: 'Local by default, internet by opt-in',
            body: (
              <>
                We&rsquo;re a pure trust brand, so our default is a harder
                policy line: all inference is local. Prompts, data &amp;
                reasoning never leave the box. Our users can{' '}
                <strong>
                  opt-in to allow local AI agents to pull context down from the
                  public internet, providing the best of both worlds.
                </strong>
              </>
            ),
          },
        ]}
      />
    </div>
  </DeckPage>
);

const lineagePage = (
  <DeckPage key={8} n={8} total={TOTAL}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/opportunity/american-porch.png"
      alt="A clapboard front porch at sunset: an American flag on the post, a mailbox holding a wax-sealed letter, a rocking chair with a quilt, and the Family Book glowing on the porch table"
      className="deck-bg-art"
      style={{ width: 'clamp(440px, 46vw, 900px)' }}
    />
    {/* Half-weighted to the top: a fixed bottom margin lifts the centered
        block halfway toward the mb-auto position. */}
    <div
      className="deck-bg-copy"
      style={{ marginBottom: 'clamp(120px, 24dvh, 260px)' }}
    >
      <Statement
        title="Privacy-centric technology is liberatory & distinctly American"
        sub="The next entry in the USA's lineage of empowering technology."
      />
      <div className="mt-10">
        <div className="grid md:grid-cols-4 auto-rows-fr gap-3">
          {LINEAGE_CARDS.map(card => (
            <div
              key={card.heading}
              className="deck-card deck-card-opaque h-full rounded-[8px] bg-fi-green-200 deck-card-quote p-4"
            >
              <div className="deck-card-quote-main">
                <h4>{card.heading}</h4>
                <p className="deck-card-body-tight">{card.body}</p>
              </div>
              <div className="deck-tier-footer">
                <span className="deck-tier-meta">{card.meta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Band narrow>
        <em>
          &ldquo;The right of the people to be secure in their&hellip; houses,
          papers, and effects.&rdquo;
        </em>{' '}
        The Fourth Amendment, 1791.
      </Band>
    </div>
  </DeckPage>
);

const page7 = (
  <DeckPage key={9} n={9} total={TOTAL}>
    <Statement
      splash
      title="Family Intelligence will be the first trusted brand to run local inference in the home"
    />
  </DeckPage>
);

export const ACT1_PAGES: ReactNode[] = [
  coverPage(null),
  page3,
  page2,
  problemPage,
  sentimentPage,
  demandPage,
  routingPage,
  lineagePage,
  page7,
];
