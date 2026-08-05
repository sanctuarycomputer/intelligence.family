import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import DriftingLeaves from '../components/DriftingLeaves';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import {
  BigStat,
  DiagramPage,
  EvidenceGrid,
  Split,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
const ACT = 'I · The Category';

const coverTitleStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(48px, 9vw, 96px)',
  fontWeight: 400,
  lineHeight: 1.02,
} as const;

const coverSubStyle = {
  fontSize: 'clamp(20px, 3.2vw, 34px)',
} as const;

const coverDecorationStyle = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: 'min(70vw, 632px)',
  pointerEvents: 'none',
} as const;

const TRACTION_STRIP =
  'Working prototype · Published research with Mozilla · Direct Foxconn relationships';

/**
 * Page 1, the cover. Takes the gate slot so OpportunityClient can render the
 * email gate beneath the traction strip (null on the server-side page list).
 */
export function coverPage(gate: ReactNode): ReactNode {
  return (
    <DeckPage key={1} n={1} total={TOTAL} act={ACT} chrome={false}>
      <DriftingLeaves />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/opportunity/cover-decoration.png"
        alt=""
        aria-hidden="true"
        style={coverDecorationStyle}
      />
      <div className="relative mb-auto max-w-3xl">
        <h1 style={coverTitleStyle}>Family Intelligence</h1>
        <p className="mt-4" style={coverSubStyle}>
          Private intelligence for the home.
        </p>
        <p className="mt-10">{TRACTION_STRIP}</p>
        {gate}
      </div>
    </DeckPage>
  );
}

const page2 = (
  <DeckPage key={2} n={2} total={TOTAL} act={ACT}>
    <DiagramPage
      title="The GPU is coming home"
      sub="AI compute is moving into the house, the way the personal computer did."
      media={
        <FpoBox note="Two-era timeline: mainframe→home computer above, datacenter→home GPU below, mirrored" />
      }
    >
      Compute has made this trip before. The mainframe sat in a room you had to
      book, and then it moved into the house: 8% of US households owned a
      computer in 1984, and 89% did by 2016.
      <Ref k="census-computer-ownership" /> The datacenter is making the same
      move. The first wave is a GPU in the living room, so a household runs its
      own intelligence instead of renting someone else&rsquo;s.
    </DiagramPage>
  </DeckPage>
);

const page3 = (
  <DeckPage key={3} n={3} total={TOTAL} act={ACT}>
    <Split
      title="Local AI now runs on consumer hardware"
      sub="Open-weight models are closing the gap with the frontier."
      media={
        <FpoBox note="Epoch open-vs-closed capability-gap chart; inset photo of the Orin prototype board" />
      }
    >
      Our prototype runs on a previous-generation NVIDIA Orin, by choice. The
      capability curve did the work: open weights keep closing on closed models
      <Ref k="epoch-open-weights" />, Thinking Machines Lab released Inkling at
      975B parameters under Apache 2.0 in July 2026
      <Ref k="inkling" />, and NVIDIA&rsquo;s Nemotron 3 family ships
      permissively licensed with its training data
      <Ref k="nemotron3" />. NPU-equipped AI PCs are roughly 59% of 2026 PC
      shipments
      <Ref k="ai-pc-shipments" />, and Ollama has 8.9M monthly developers
      <Ref k="ollama" />. We inherit every upstream advance for free.
    </Split>
  </DeckPage>
);

const page4 = (
  <DeckPage key={4} n={4} total={TOTAL} act={ACT}>
    <EvidenceGrid
      title="The industry is moving compute to the data"
      sub="NVIDIA, Palantir and Cohere are betting on sovereign AI."
      cards={[
        {
          heading: 'NVIDIA and Palantir',
          body: (
            <>
              In October 2025 they partnered to run models where enterprise data
              already sits
              <Ref k="nvidia-palantir" />, and in June 2026 they shipped an
              air-gapped sovereign architecture built so data can never leave
              the building
              <Ref k="palantir-sovereign-aios" />.
            </>
          ),
        },
        {
          heading: '€10B for seven gigafactories',
          body: (
            <>
              The EU opened its call for seven sovereign AI gigafactories on
              July 30, 2026
              <Ref k="eu-gigafactories" />.
            </>
          ),
        },
        {
          heading: '93% of enterprises',
          body: (
            <>
              Cloudian found them repatriating or evaluating on-prem AI
              workloads in March 2026
              <Ref k="cloudian-onprem" />. Governments and enterprises pay for
              the property we give families, and the household is the last
              sovereign unit nobody serves.
            </>
          ),
        },
      ]}
    />
    <div className="mt-10">
      <FpoBox
        note="Deal timeline Oct 2025→Jul 2026 with NVIDIA/Palantir/Cohere/EU marks and dollar figures"
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

const page5 = (
  <DeckPage key={5} n={5} total={TOTAL} act={ACT}>
    <DiagramPage
      title="Privacy law triggers when data leaves the device"
      sub="Local-first architecture is ahead of the coming AI regulation."
      media={
        <FpoBox note="House with a drawn trust-boundary line; HIPAA/COPPA/GDPR arrows triggering only where data crosses it" />
      }
    >
      Collection is the trigger. COPPA turns on gathering information from a
      child
      <Ref k="coppa-definition" />, GDPR exempts household processing
      <Ref k="gdpr-household" />, and HIPAA binds only entities handling records
      for covered entities
      <Ref k="hipaa-ftc" />. Data that never leaves the device rarely pulls
      those triggers. The server-side wall keeps rising: full COPPA compliance
      in April 2026
      <Ref k="coppa-amended" />, EU AI Act transparency duties in August 2026
      <Ref k="eu-ai-act-enforcement" />, California age signals by 2027
      <Ref k="ab1043" />, a 99 to 1 Senate vote keeping the patchwork
      <Ref k="senate-moratorium" />. Avoiding collection is the compliance
      strategy that scales everywhere at once.
    </DiagramPage>
  </DeckPage>
);

const page6 = (
  <DeckPage key={6} n={6} total={TOTAL} act={ACT}>
    <BigStat
      stat="7 in 10"
      title="Nobody owns this category"
      sub="7 in 10 Americans don't trust big tech's AI. There is no Signal or Mozilla of the home."
    >
      Pew puts distrust of big tech&rsquo;s AI at roughly 70%
      <Ref k="pew-distrust" />, and 72% of smart home owners worry about the
      data their devices collect
      <Ref k="parks-72" />. The incumbents went the other way: on March 28, 2025
      Amazon removed the Echo&rsquo;s only local-processing option
      <Ref k="echo-local-removed" />. Signal&rsquo;s president calls cloud AI
      agents surveillance infrastructure in disguise
      <Ref k="whittaker" />, and we are building the version she could endorse.
      Today no one owns this market, but that window is closing fast.
    </BigStat>
    <div className="mt-10">
      <FpoBox
        note={
          'Giant "7 in 10"; beneath, a brand row (Signal · Mozilla · 1Password) with an empty slot labeled "the home"'
        }
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

const page7 = (
  <DeckPage key={7} n={7} total={TOTAL} act={ACT}>
    <EvidenceGrid
      title="People pay for intentional technology"
      sub="Light Phone, Daylight, Remarkable and Yoto built profitable businesses on it."
      cards={[
        {
          heading: 'Yoto grew 86%',
          body: (
            <>
              Children&rsquo;s audio, no screen, no feed. Sales grew 86% in 2024
              <Ref k="yoto-growth" />.
            </>
          ),
        },
        {
          heading: 'The Light Phone',
          body: (
            <>
              We designed and built Light Phone II and III, sold to people who
              wanted less phone
              <Ref k="light-phone" />.
            </>
          ),
        },
        {
          heading: 'Privacy is a purchase',
          body: (
            <>
              The same buyers turn on Signal&rsquo;s encrypted backups
              <Ref k="signal-backups" /> and Apple&rsquo;s Advanced Data
              Protection
              <Ref k="apple-adp" />. The convenience argument fails where the
              data is intimate, and these buyers pay for the alternative.
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

export const ACT1_PAGES: ReactNode[] = [
  coverPage(null),
  page2,
  page3,
  page4,
  page5,
  page6,
  page7,
];
