import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import Ref from '../components/Ref';
import { Band, CardsPage, Ledger, Statement } from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
const ACT_CLASS = 'deck-act-3';

const page17 = (
  <DeckPage key={15} n={15} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      splash
      title="But under the hood... we're building the canonical stack for private AI inference"
    />
  </DeckPage>
);

const page19 = (
  <DeckPage key={16} n={16} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={2}
      title="Private AI is becoming crucial for businesses"
      sub="Today, there is no purpose made privacy stack for running local models."
      cards={[
        {
          heading: 'Local AI sidesteps impending regulation',
          art: (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/opportunity/icons/notebook.png"
              alt=""
              className="deck-icon-dark"
            />
          ),
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
          art: (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/opportunity/icons/tree.png"
              alt=""
              className="deck-icon-dark"
            />
          ),
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
          art: (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/opportunity/icons/battery.png"
              alt=""
              className="deck-icon-dark"
            />
          ),
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
          art: (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/opportunity/icons/lightning.png"
              alt=""
              className="deck-icon-dark"
            />
          ),
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
  </DeckPage>
);

const page18 = (
  <DeckPage key={17} n={17} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      variant="quote"
      title="Our stack"
      sub="The go-to SDK for private inference, built on Linux &amp; written in Rust."
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
  </DeckPage>
);

const page22 = (
  <DeckPage key={18} n={18} total={TOTAL} actClass={ACT_CLASS}>
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
      Anchors: ~438,000 US law firms and ~85,000 accounting firms (ABA, US
      Census, IBISWorld); ~900M connected home devices shipped annually (IDC).
      Detail in the appendix.
    </p>
  </DeckPage>
);

const platformPage = (
  <DeckPage key={19} n={19} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      title="Our platform is a compounding business"
      sub="We anticipate three key modes to help partners integrate our software."
    />
    <div className="grid md:grid-cols-2 gap-10 items-start">
      <table className="deck-plan-table">
        <thead>
          <tr>
            <th>Mode</th>
            <th>Pricing</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Enterprise deployment & implementation', '$150K ACV + $175K'],
            ['OEM embedded royalty', '$5 / device'],
            ['Forward-deployed engineering', 'Time & materials'],
          ].map(row => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <table className="deck-plan-table">
        <thead>
          <tr>
            <th>Modelled licensing build, $mm</th>
            <th>Y3</th>
            <th>Y4</th>
            <th>Y5</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Platform license', '0.4', '2.2', '6.5'],
            ['Implementation services', '0.9', '3.5', '7.0'],
            ['OEM royalty', '-', '0.6', '5.6'],
            ['Total licensing', '1.3', '6.3', '19.2'],
            ['% of total revenue', '8%', '16%', '24%'],
          ].map(row => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="deck-body">
      Licenses bill annually in advance, at a 90% margin; implementation
      services run through our agency partner at 20%. Android proves the shape
      at 3B+ active devices.
      <Ref k="android-3b" /> Qualcomm&rsquo;s licensing arm did $5.6B last year
      at a 72% pre-tax margin.
      <Ref k="qualcomm-qtl" />
    </p>
    <Band narrow>
      Sonos, Dyson, and LG will never build this stack - but they will want to
      license it.
    </Band>
  </DeckPage>
);

export const ACT3_PAGES: ReactNode[] = [
  page17,
  page19,
  page18,
  page22,
  platformPage,
];
