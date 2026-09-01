import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import Ref from '../components/Ref';
import { Band, CardsPage, Statement } from '../components/archetypes';

const ACT_CLASS = 'deck-act-3';

const page17 = (
  <DeckPage key={19} n={19} actClass={ACT_CLASS}>
    <Statement
      splash
      title={
        <>
          But under the hood... we&rsquo;re building the canonical stack for
          private inference.
          <br />
          <br />
          Here&rsquo;s where we go after winning in the home
        </>
      }
    />
  </DeckPage>
);

const INDUSTRIES = [
  [
    'Families & The Home',
    'One hub per household, companions on every shelf',
    '~$130B',
  ],
  [
    'Office, Legal, & On-Prem',
    'Meeting capture, privileged review, and document intelligence that never leaves the building',
    '~$65B',
  ],
  [
    'Healthcare & Clinics',
    'Scribes, dictation, and records that stay inside the practice',
    '~$30B',
  ],
  [
    'Biometrics & Wearables',
    'Health signals inferred on the device, not in a vendor cloud',
    '~$90B',
  ],
  [
    'Government & Defense',
    'Air-gapped inference for the people who cannot use cloud AI',
    '~$20B',
  ],
  [
    'Agriculture & Industrial',
    'Edge models on equipment, far from reliable connectivity',
    '~$35B',
  ],
  [
    'Schools & Childcare',
    'Learning tools that keep children\u2019s data inside the school',
    '~$10B',
  ],
  [
    'Enterprise & Partnerships',
    'Our stack licensed inside other brands\u2019 hardware',
    '~$95B',
  ],
];

const page19 = (
  <DeckPage key={20} n={20} actClass={ACT_CLASS}>
    <CardsPage
      columns={2}
      title="Private AI is becoming crucial for business"
      sub="Today, there is no purpose-made privacy stack for running local models."
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
          heading: 'Enterprises won’t risk leaking their IP',
          body: (
            <>
              What a company asks AI reveals its roadmap: the deals being
              modeled, the products being spec&rsquo;d, the people being
              evaluated. Even with &ldquo;we don&rsquo;t train on your
              data&rdquo; promises, you&rsquo;re trusting a counterparty&rsquo;s
              policy rather than an architecture. Local AI means the query
              stream never leaves the office.
            </>
          ),
        },
        {
          heading:
            'Low connectivity scenarios will require protected inference',
          body: (
            <>
              Agents acting in the physical world (home, car, robotics,
              industrial) can&rsquo;t tolerate round trips or outages. When the
              model is on-device, the product works in rural areas, on planes,
              during provider incidents, and at millisecond speeds.
            </>
          ),
        },
        {
          heading: 'Inference economics invert at scale',
          body: (
            <>
              Cloud AI makes every query a billable event. Local inference flips
              this: hardware is a one-time cost, and usage becomes free at the
              margin. Any product with high-frequency, always-on AI (ambient
              assistants, monitoring, agents) becomes untenable on cloud rails.
            </>
          ),
        },
      ]}
    />
    <div className="mt-6 grid md:grid-cols-2 gap-x-12">
      {[INDUSTRIES.slice(0, 4), INDUSTRIES.slice(4)].map((column, i) => (
        <div key={i} className="divide-y divide-fi-green-300">
          {column.map(([label, note, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-1.5"
            >
              <span className="deck-ledger-label">
                <strong>{label}</strong>
                <span className="deck-ledger-note">{note}</span>
              </span>
              <span className="deck-tam">{value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </DeckPage>
);

const page18 = (
  <DeckPage key={21} n={21} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      variant="quote"
      title="Our stack deploys anywhere"
      sub="The go-to SDK for private inference, model &amp; chipset agnostic, built on Linux &amp; written in Rust."
      cards={[
        {
          heading: 'Trusted Execution Environment (TEE)',
          meta: 'Silicon',
          body: (
            <>
              Keys and models run in hardware-isolated memory. Even a
              compromised OS cannot read them.
            </>
          ),
        },
        {
          heading: 'Hardware Root Certificate Authority',
          meta: 'Trust',
          body: (
            <>
              The leader device bootstraps the network as the root certificate.
              Follower devices &amp; apps derive their own keys from it.
            </>
          ),
        },
        {
          heading: 'Zero-knowledge Sync Server',
          meta: 'Cloud',
          body: (
            <>
              Encrypted archives we cannot open. The keys never leave the device
              fleet. Our server can only see cipher text.
            </>
          ),
        },
        {
          heading: 'Model Over The Air (MOTA)',
          meta: 'Fleet',
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
          meta: 'Apps',
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
          meta: 'Agents',
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
    <Band narrow>
      After the stack is hardened in the home, we deploy it to any device that
      runs local inference against sensitive data.
    </Band>
  </DeckPage>
);

export const ACT3_PAGES: ReactNode[] = [page17, page19, page18];
