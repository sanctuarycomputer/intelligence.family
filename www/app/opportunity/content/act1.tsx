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
const TOTAL = 26;

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
          Private intelligence for the home.
        </p>
        {gate}
      </div>
    </DeckPage>
  );
}

const page2 = (
  <DeckPage key={2} n={2} total={TOTAL}>
    <DiagramPage
      title="The GPU is coming home"
      sub="AI compute is moving into the house, the way the personal computer did."
      media={
        <FpoBox note="Two-era timeline: mainframe→home computer above, datacenter→home GPU below, mirrored" />
      }
    >
      Compute has made this trip before. The mainframe sat in a room you had to
      book.{' '}
      <strong>
        8% of US households owned a computer in 1984, and 89% did by 2016.
      </strong>
      <Ref k="census-computer-ownership" /> The datacenter is making the same
      move.
    </DiagramPage>
  </DeckPage>
);

const page3 = (
  <DeckPage key={3} n={3} total={TOTAL}>
    <Split
      title="Local AI (finally) runs on consumer hardware"
      sub="Open-weight models are closing the gap with the frontier."
      media={
        <FpoBox note="Epoch open-vs-closed capability-gap chart; inset photo of the Orin prototype board" />
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

const page4 = (
  <DeckPage key={4} n={4} total={TOTAL}>
    <Statement
      title="7 in 10 Americans don't trust big tech's AI"
      sub="There is no Signal or Mozilla of the home."
    >
      Pew measured that distrust in June 2026.
      <Ref k="pew-distrust" /> Amazon went the other way, removing the
      Echo&rsquo;s only local-processing option in March 2025.
      <Ref k="echo-local-removed" />{' '}
      <strong>
        Demand is enormous, trust is absent, and that gap is the market.
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
      title="Local architecture makes all the difference"
      sub={
        <>
          Two listening devices...
          <br />
          friend.com was panned
          <br />
          Family Intelligence was loved
        </>
      }
      media={
        <FpoBox note="Side-by-side: Mozilla research reception vs friend.com backlash (Instagram sentiment)" />
      }
    >
      Our device research, in partnership with the Mozilla Foundation, drew an
      overwhelmingly positive response across 28k+ impressions.
      <Ref k="mozilla-research" /> Meanwhile... friend.com&rsquo;s
      always-listening pendant was vandalized on the NYC subway.
      <Ref k="friend-backlash" />
      <br />
      <br />
      <strong>
        Our privacy-preserving architecture is what wins customers over.
      </strong>
    </Split>
  </DeckPage>
);

const page6 = (
  <DeckPage key={6} n={6} total={TOTAL}>
    <EvidenceGrid
      title="Intentional technology is a proven market"
      sub="Light Phone, Daylight, Remarkable and Yoto built profitable businesses on it."
      cards={[
        {
          heading: 'Yoto grew 86%',
          body: (
            <>
              Children&rsquo;s audio, no screen, no feed.{' '}
              <strong>Sales grew 86% in 2024.</strong>
              <Ref k="yoto-growth" />
            </>
          ),
        },
        {
          heading: 'Light Phone and reMarkable',
          body: (
            <>
              We designed and built Light Phone II and III for people who wanted
              less phone.
              <Ref k="light-phone" /> reMarkable reached profitability at $300M
              revenue.
              <Ref k="remarkable-profitable" />
            </>
          ),
        },
        {
          heading: 'Privacy is a purchase',
          body: (
            <>
              The same buyers turn on Signal&rsquo;s encrypted backups and
              Apple&rsquo;s Advanced Data Protection.
              <Ref k="signal-backups" />
              <Ref k="apple-adp" /> Convenience loses where the data is
              intimate.
            </>
          ),
        },
      ]}
    />
    <div className="mt-10">
      <FpoBox
        note="Product cards: Light Phone, Daylight, Remarkable, Yoto (+86%)"
        aspect="6/1"
      />
    </div>
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
  page2,
  page3,
  page4,
  page5,
  page6,
  page7,
];
