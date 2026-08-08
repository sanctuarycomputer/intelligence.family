import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import {
  CardsPage,
  DiagramPage,
  EvidenceGrid,
  Ledger,
  Split,
  Statement,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 22;
const ACT_CLASS = 'deck-act-3';

const page17 = (
  <DeckPage key={12} n={12} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      splash
      title="But under the hood... we're building the canonical stack for private AI inference"
    />
  </DeckPage>
);

const stackArt = (label: string) => (
  <span className="deck-card-art-fpo">{label}</span>
);

const page18 = (
  <DeckPage key={13} n={13} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      title="Our stack"
      sub="The go-to SDK for private inference, built on Linux &amp; written in Rust."
      cards={[
        {
          heading: 'Trusted Execution Environment (TEE)',
          art: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/opportunity/stack-tee.png" alt="" />
          ),
          body: (
            <>
              Keys and models run in hardware-isolated memory. Even a
              compromised OS cannot read them.
            </>
          ),
        },
        {
          heading: 'Hardware Root Certificate Authority',
          art: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/opportunity/stack-cert.png" alt="" />
          ),
          body: (
            <>
              The leader device bootstraps the network as the root certificate.
              Follower devices &amp; apps derive their own keys from it.
            </>
          ),
        },
        {
          heading: 'Zero-knowledge Sync Server',
          art: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/opportunity/stack-cloud.png" alt="" />
          ),
          body: (
            <>
              Encrypted archives we cannot open. The keys never leave the device
              fleet. Our server can only see cipher text.
            </>
          ),
        },
        {
          heading: 'Model Over The Air (MOTA)',
          art: stackArt('mota png'),
          body: (
            <>
              Fleet management, firmware and seamless model upgrades provided
              over the air: private AI devices that get smarter as newer open
              source models are released.
            </>
          ),
        },
        {
          heading: 'Generic Ontology, RAG & App Runtime',
          art: stackArt('ontology png'),
          body: (
            <>
              Declare a schema for your use case and the model extracts &amp;
              references it: people, places, recipes, goals... or leads, deals,
              contacts &amp; agreements. All ready for binding into UI.
            </>
          ),
        },
        {
          heading: 'Customizable Agentic Harness',
          art: stackArt('harness png'),
          body: (
            <>
              Tool calling, job scheduling, context isolation and session
              handling. Built for coding, general assistance and deep research
              against your local data.
            </>
          ),
        },
      ]}
    />
    <p className="deck-body">
      <strong>
        A general purpose software suite for private inference hardware devices.
      </strong>
    </p>
  </DeckPage>
);

const page22 = (
  <DeckPage key={14} n={14} total={TOTAL} actClass={ACT_CLASS}>
    <Ledger
      wide
      title="The Android OS for Local AI"
      sub={
        <>
          Google bought Android in 2005 for ~$50 million.
          <br />
          What will the canonical infrastructure for private AI be valued at in
          2030?
        </>
      }
      rows={[
        {
          label: (
            <>
              <strong>Families & The Home</strong>
              <span className="deck-ledger-note">
                The wedge: one hub per household, companions on every shelf
              </span>
            </>
          ),
          value: <span className="deck-tam">~$130B</span>,
        },
        {
          label: (
            <>
              <strong>Office & On-Prem</strong>
              <span className="deck-ledger-note">
                Meeting capture and document intelligence that never leaves the
                building
              </span>
            </>
          ),
          value: <span className="deck-tam">~$40B</span>,
        },
        {
          label: (
            <>
              <strong>Healthcare & Clinics</strong>
              <span className="deck-ledger-note">
                Clinical scribes and dictation where patient data stays in the
                practice
              </span>
            </>
          ),
          value: <span className="deck-tam">~$30B</span>,
        },
        {
          label: (
            <>
              <strong>Biometrics & Wearables</strong>
              <span className="deck-ledger-note">
                Health signals inferred on the device, not in a vendor cloud
              </span>
            </>
          ),
          value: <span className="deck-tam">~$90B</span>,
        },
        {
          label: (
            <>
              <strong>Legal & Financial Back Office</strong>
              <span className="deck-ledger-note">
                Privileged review and reconciliation behind the firewall
              </span>
            </>
          ),
          value: <span className="deck-tam">~$25B</span>,
        },
        {
          label: (
            <>
              <strong>Government & Defense</strong>
              <span className="deck-ledger-note">
                Air-gapped inference for the people who cannot use cloud AI
              </span>
            </>
          ),
          value: <span className="deck-tam">~$50B</span>,
        },
        {
          label: (
            <>
              <strong>Agriculture & Industrial</strong>
              <span className="deck-ledger-note">
                Edge models on equipment, far from reliable connectivity
              </span>
            </>
          ),
          value: <span className="deck-tam">~$60B</span>,
        },
        {
          label: (
            <>
              <strong>Schools & Childcare</strong>
              <span className="deck-ledger-note">
                Learning tools that keep children&rsquo;s data inside the school
              </span>
            </>
          ),
          value: <span className="deck-tam">~$20B</span>,
        },
        {
          label: (
            <>
              <strong>Enterprise & Partnerships</strong>
              <span className="deck-ledger-note">
                Our stack licensed inside other brands&rsquo; hardware
              </span>
            </>
          ),
          value: <span className="deck-tam">~$95B</span>,
        },
      ]}
    />
    <p className="deck-caption-note">
      Directional market estimates; sourced detail in the appendix pro-forma.
    </p>
  </DeckPage>
);

const page19 = (
  <DeckPage key={15} n={15} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={2}
      title="Private AI will be crucial for businesses"
      sub="But today, there's no general purpose software stack to support local deployments."
      cards={[
        {
          heading: 'Local AI sidesteps impending regulation',
          body: (
            <>
              COPPA turns on gathering a child&rsquo;s information.
              <Ref k="coppa-definition" /> GDPR exempts a family&rsquo;s own use
              of its data.
              <Ref k="gdpr-household" /> Data that never leaves the device
              rarely triggers either. The wall keeps rising: COPPA compliance
              April 2026,
              <Ref k="coppa-amended" /> EU AI Act transparency August 2026,
              <Ref k="eu-ai-act-enforcement" /> California age signals by 2027.
              <Ref k="ab1043" />
            </>
          ),
        },
        {
          heading: 'Enterprises can’t risk leaking their IP',
          body: (
            <>
              What a company asks AI reveals its roadmap: the deals being
              modeled, the products being spec&rsquo;d, the people being
              evaluated. Even with &ldquo;we don&rsquo;t train on your
              data&rdquo; promises, you&rsquo;re trusting a counterparty&rsquo;s
              policy rather than an architecture. Local AI means your query
              stream (the metadata layer of your thinking) never exists outside
              the building.
            </>
          ),
        },
        {
          heading: 'Low connectivity scenarios will require inference',
          body: (
            <>
              Agents acting in the physical world (home, car, robotics,
              industrial) can&rsquo;t tolerate round trips or outages. When the
              model is on-device, the product works in rural areas, on planes,
              during provider incidents, and at millisecond speeds. Reliability
              becomes a property you own rather than an SLA you rent.
            </>
          ),
        },
        {
          heading: 'Inference economics invert at scale',
          body: (
            <>
              Cloud AI makes every query a billable event, so margins erode as
              engagement grows. Local inference flips this: hardware is a
              one-time cost, and usage becomes free at the margin. Any product
              with high-frequency, always-on AI (ambient assistants, monitoring,
              agents) is structurally unprofitable on cloud rails.
            </>
          ),
        },
      ]}
    />
  </DeckPage>
);

const page20 = (
  <DeckPage key={16} n={16} total={TOTAL} actClass={ACT_CLASS}>
    <DiagramPage
      title="Local AI side-steps future regulation"
      sub="The cloud providers will be regulated, but our architecture is immune."
      media={
        <FpoBox note="House with a drawn trust-boundary line; HIPAA/COPPA/GDPR arrows triggering only where data crosses it" />
      }
    >
      COPPA turns on gathering a child&rsquo;s information.
      <Ref k="coppa-definition" /> GDPR exempts a family&rsquo;s own use of its
      data.
      <Ref k="gdpr-household" />{' '}
      <strong>Data that never leaves the device rarely triggers either.</strong>{' '}
      The wall keeps rising: COPPA compliance April 2026,
      <Ref k="coppa-amended" /> EU AI Act transparency August 2026,
      <Ref k="eu-ai-act-enforcement" /> California age signals by 2027.
      <Ref k="ab1043" />
    </DiagramPage>
  </DeckPage>
);

const page21 = (
  <DeckPage key={17} n={17} total={TOTAL} actClass={ACT_CLASS}>
    <Split
      flip
      title="The Android of Local AI"
      sub="Every Snapdragon ships a tuned Android build. Partner devices ship a tuned Harness."
      media={
        <FpoBox note="Snapdragon→tuned Android build ∥ partner device→tuned Harness build; margin cards QTL 72% · Dolby 88% · Arm ~$250B" />
      }
    >
      Partners pay a royalty per device. Android proves the shape at 3B+ active
      devices.
      <Ref k="android-3b" /> Qualcomm&rsquo;s licensing arm did $5.6B at a 72%
      pre-tax margin.
      <Ref k="qualcomm-qtl" />{' '}
      <strong>Sonos, Dyson, and LG will never build this stack.</strong>
    </Split>
  </DeckPage>
);

export const ACT3_PAGES: ReactNode[] = [
  page17,
  page18,
  page22,
  page19,
  page20,
  page21,
];
