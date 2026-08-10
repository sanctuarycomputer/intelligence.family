import type { ReactNode } from 'react';
import LeafIcon from '@/components/LeafIcon';
import DeckPage from '../components/DeckPage';
import Ref from '../components/Ref';
import MediaGallery from '../components/MediaGallery';
import { Band, CardsPage, Split, Statement } from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;

const coverLeafStyle = {
  width: '0.35em',
  height: '0.4em',
  top: '-0.05em',
  right: '-0.4em',
} as const;

const coverSubStyle = {
  fontSize: 'clamp(20px, 3.2vw, 34px)',
} as const;

/**
 * Page 1, the cover. Takes the gate slot so OpportunityClient can render the
 * email gate beneath the subtitle (null on the server-side page list).
 */
export function coverPage(gate: ReactNode): ReactNode {
  return (
    <DeckPage key={1} n={1} total={TOTAL}>
      <div
        className={
          gate
            ? 'relative mx-auto max-w-3xl text-center'
            : 'relative mb-auto max-w-3xl'
        }
      >
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
    </DeckPage>
  );
}

const page3 = (
  <DeckPage key={2} n={2} total={TOTAL}>
    <Split
      title="Local AI (finally) runs on consumer hardware"
      sub="Open models are trailing just months behind the best."
      media={
        <MediaGallery
          slides={[
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
                'Snapdragon X Elite: NPU-equipped consumer silicon like this now ships in most new PCs.',
            },
            {
              src: null,
              alt: 'FPO: photo 3',
              caption: 'FPO caption 3',
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
      <br />
      <br />
      <strong>
        Open models already rival the frontier. Soon they&rsquo;ll be
        indistinguishable.
      </strong>
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
        <div className="deck-media-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/opportunity/compute-eras.png"
            alt="Six eras of compute: mainframe, home computer, and laptop above; on-prem server, cloud data center, and the home inference server (2027+) below"
            className="deck-slide-media"
          />
        </div>
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

const page4 = (
  <DeckPage key={4} n={4} total={TOTAL}>
    <Statement
      title="7 in 10 Americans don't trust big tech's AI"
      sub="But today, there's no alternative."
    >
      Pew measured America&rsquo;s growing disdain for big tech&rsquo;s AI in
      June 2026.
      <Ref k="pew-distrust" /> Amazon went the other way, removing the
      Echo&rsquo;s only local-processing option in March 2025.
      <Ref k="echo-local-removed" />
      <br />
      <br />
      Today, the datacenter backlash has arrived at a tenor that won&rsquo;t
      subside, solidifying as a cultural phenomenon like climate dread. America
      wants an alternative.
    </Statement>
    <Band narrow>
      Demand for private AI is enormous.
      <br />
      Our market is 70% of America.
    </Band>
  </DeckPage>
);

const problemPage = (
  <DeckPage key={5} n={5} total={TOTAL}>
    <CardsPage
      columns={2}
      title="The most valuable context is what you'll never upload"
      sub="The home holds the richest, longest-running, highest-signal context any AI could use."
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
                Sending intimate stories &amp; household audio to a third-party
                cloud
              </li>
              <li>
                Trusting a business who intends to monetize or train on their
                data
              </li>
              <li>
                Accepting a privacy policy they&rsquo;ll never read and hope for
                the best
              </li>
              <li>Needing connectivity for a device in their kitchen</li>
            </ul>
          ),
        },
      ]}
    />
  </DeckPage>
);

const page5 = (
  <DeckPage key={6} n={6} total={TOTAL}>
    <Split
      flip
      title="Local architecture wins consumer sentiment"
      sub="Privacy-preserving architecture wins customers over."
      media={
        <div>
          <div className="grid grid-cols-2 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/opportunity/friend-comments.png"
              alt="Instagram comments on friend.com's pendant: 'AI IS NOT YOUR FRIEND', 'Disgusting', 'This Black Mirror type product. Ew'"
              className="deck-screenshot"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/opportunity/fi-comments.png"
              alt="Instagram comments on the Family Intelligence research: 'LOVE THIS!', 'Brilliant idea', 'Small local AI is the future!'"
              className="deck-screenshot"
            />
          </div>
          <span className="deck-media-caption">
            Two AI listening devices. friend.com was panned, while Family
            Intelligence was praised.
          </span>
        </div>
      }
    >
      Our research, in partnership with the Mozilla Foundation, drew an
      overwhelmingly positive response across 28k+ impressions.
      <Ref k="mozilla-research" />
      <br />
      <br />
      Meanwhile... friend.com&rsquo;s always-listening pendant was vandalized on
      the NYC subway.
      <Ref k="friend-backlash" />
    </Split>
  </DeckPage>
);

const page7 = (
  <DeckPage key={7} n={7} total={TOTAL}>
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
  page4,
  problemPage,
  page5,
  page7,
];
