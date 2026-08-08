import type { ReactNode } from 'react';
import LeafIcon from '@/components/LeafIcon';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import {
  EvidenceGrid,
  Split,
  Statement,
  DiagramPage,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 21;

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
      <div className="relative mb-auto max-w-3xl">
        <h1 className="relative inline-block">
          Family<span className="tracking-[-0.1em]"> </span>Intelligence
          <LeafIcon className="absolute leaf-animate" style={coverLeafStyle} />
        </h1>
        <p className="mt-4" style={coverSubStyle}>
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
        {gate}
      </div>
    </DeckPage>
  );
}

const page3 = (
  <DeckPage key={2} n={2} total={TOTAL}>
    <Split
      title="Local AI (finally) runs on consumer hardware"
      sub="Open-weight models are closing the gap with the frontier."
      media={
        <div className="deck-media-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/opportunity/prototype-photo.jpg"
            alt="Our prototype's compute board, held in one hand above a keyboard"
            className="deck-screenshot"
          />
          <span className="deck-media-caption">
            Mid 2025, running Qwen 2.5 on CPU. Holding a squishy representation
            of all of recorded human thought in the palm of my hand.
          </span>
        </div>
      }
    >
      Open weights keep closing on closed models.
      <Ref k="epoch-open-weights" /> Thinking Machines Lab released Inkling,
      975B parameters, Apache 2.0.
      <Ref k="inkling" />{' '}
      <strong>Every upstream advance lands in our stack for free.</strong>{' '}
      NPU-equipped AI PCs are roughly 59% of 2026 shipments.
      <Ref k="ai-pc-shipments" />
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
          src="/opportunity/compute-eras.png"
          alt="Six eras of compute: mainframe, home computer, and laptop above; on-prem server, cloud data center, and the home inference server (2027+) below"
          className="deck-slide-media"
        />
      }
    >
      Compute has made this trip before. The mainframe sat in a room you had to
      book.{' '}
      <strong>
        8% of US households owned a computer in 1984, and 89% did by 2016.
      </strong>
      <Ref k="census-computer-ownership" /> The datacenter is making the same
      move.
    </Split>
  </DeckPage>
);

const page4 = (
  <DeckPage key={4} n={4} total={TOTAL}>
    <Statement
      title="7 in 10 Americans don't trust big tech's AI"
      sub="There is no Signal or Mozilla of the home."
    >
      Pew measured that distrust in June 2026.
      <Ref k="pew-distrust" /> Amazon went the other way, removing the
      Echo&rsquo;s only local-processing option in March 2025.
      <Ref k="echo-local-removed" />
      <br />
      <br />
      <strong>
        Demand for AI is enormous &amp; trust is absent.
        <br />
        Our market is 70% of America.
      </strong>
    </Statement>
    <div className="mt-10">
      <FpoBox
        note={
          "Brand row: Signal · Mozilla · 1Password with an empty slot labeled 'the home'"
        }
        aspect="8/1"
      />
    </div>
  </DeckPage>
);

const page5 = (
  <DeckPage key={5} n={5} total={TOTAL}>
    <Split
      flip
      title="Local architecture wins consumer excitement"
      sub="Two AI listening devices. friend.com was panned, while Family Intelligence was loved ❤︎"
      media={
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
      }
    >
      Our device research, in partnership with the Mozilla Foundation, drew an
      overwhelmingly positive response across 28k+ impressions.
      <Ref k="mozilla-research" />
      <br />
      <br />
      Meanwhile... friend.com&rsquo;s always-listening pendant was vandalized on
      the NYC subway.
      <Ref k="friend-backlash" />
      <br />
      <br />
      <strong>
        Our privacy-preserving architecture is what wins customers over.
      </strong>
    </Split>
  </DeckPage>
);

const page7 = (
  <DeckPage key={6} n={6} total={TOTAL}>
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
  page5,
  page7,
];
