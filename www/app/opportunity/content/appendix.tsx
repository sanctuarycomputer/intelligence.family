import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import {
  CardsPage,
  Ledger,
  Split,
  StatTiles,
  Statement,
} from '../components/archetypes';
import { orderedReferences } from './references';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
// Appendix pages continue the page ids past the core deck, but the footer
// counter stays unnumbered so nobody reads them as pages 27 of 26.
const FIRST = TOTAL + 1;
const STUB_BODY = 'Detail follows in the investor-ready revision.';

const splashPage = (
  <DeckPage key={FIRST} n={FIRST} total={TOTAL}>
    <Statement splash title="Appendix" />
  </DeckPage>
);

const movedUnitEconomics = (
  <DeckPage key={FIRST + 2} n={FIRST + 2} total={TOTAL}>
    <Ledger
      title="Unit economics"
      sub="82,385 devices by Year 5, a $9/month attach, margins ramping 36% to 53%."
      rows={[
        { label: 'Cumulative devices by Year 5', value: '82,385' },
        {
          label: 'Share of the 200M+ English-speaking households',
          value: '0.06%',
        },
        { label: 'Cloud subscription, optional', value: '$9 / month' },
        { label: 'Blended gross margin ramp', value: '36% → 53%' },
      ]}
    />
    <p className="deck-body">
      <strong>
        The device is the moat and the recurring layer is the business.
      </strong>{' '}
      Plaud reached about $250M in revenue at roughly 20% margin, on 1M+ devices
      and essentially no venture capital.
      <Ref k="plaud" />
    </p>
    <div className="mt-10">
      <FpoBox
        note="The simple math stack: 110k devices + $9/mo attach → revenue; margin-path bar prototype→scale"
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

const movedContext = (
  <DeckPage key={FIRST + 1} n={FIRST + 1} total={TOTAL}>
    <Split
      flip
      title="A context window for smart homes"
      sub="Inference for every IoT device on the network."
      media={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/opportunity/context-window-home.png"
          alt="A house cross-section: the Family Book hub on the coffee table, connected by glowing vines to the TV, thermostat, camera, laptop, phone, and speaker in every room"
          className="deck-slide-media"
        />
      }
    >
      The house knows who the plumber is and what the family is saving for.{' '}
      <strong>
        One local agent holds that memory: an MCP server on the LAN, a
        chat-completions endpoint, and local RAG.
      </strong>
      <br />
      <br />
      &rarr; US internet households already run 17 connected devices.
      <Ref k="parks-17-devices" /> Soon, they&rsquo;ll all need inference.
    </Split>
  </DeckPage>
);

const revenueModelPage = (
  <DeckPage key={FIRST + 3} n={FIRST + 3} total={TOTAL}>
    <Statement
      title="Six revenue lines, one stack underneath"
      sub="Devices carry the business through Year 3. Subscription and licensing carry the margin after it."
    />
    <table className="deck-plan-table">
      <thead>
        <tr>
          <th>Revenue line</th>
          <th>Price</th>
          <th>Starts</th>
          <th>Year 5 revenue</th>
          <th>% of Y5</th>
        </tr>
      </thead>
      <tbody>
        {[
          ['Flagship device', '$899', 'Oct 2027', '$38.2M', '51%'],
          ['Companion device', '$499', 'Oct 2028', '$7.4M', '10%'],
          ['Professional SKU', '$1,999', 'Oct 2029', '$6.3M', '8%'],
          ['Backup subscription', '$9 / mo', 'Oct 2027', '$3.0M', '4%'],
          [
            'Enterprise licensing + services',
            '$150K ACV',
            'Year 3',
            '$13.5M',
            '18%',
          ],
          ['OEM royalty', '$5 / device', 'Year 4', '$6.3M', '8%'],
          ['Total revenue', '', '', '$74.7M', '100%'],
        ].map(row => (
          <tr key={row[0]}>
            {row.map((cell, i) => (
              <td key={i}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <StatTiles
      tiles={[
        { value: '$54.9M', label: 'Year 5 revenue excluding licensing' },
        { value: '38,262', label: 'Active subscribers exiting Year 5' },
        { value: '$19.8M', label: 'Enterprise and OEM revenue in Year 5' },
      ]}
    />
    <p className="deck-caption-note">
      Source: Family Intelligence model v3.1, base case. A single switch zeroes
      both licensing lines for a devices-only view.
    </p>
  </DeckPage>
);

const scenariosPage = (
  <DeckPage key={FIRST + 4} n={FIRST + 4} total={TOTAL}>
    <Statement
      title="Scenarios"
      sub="One switch rescales volume, subscription attach, licensing and the hiring plan together."
    />
    <table className="deck-plan-table">
      <thead>
        <tr>
          <th>Year 5</th>
          <th>Conservative</th>
          <th>Base</th>
          <th>Aggressive</th>
        </tr>
      </thead>
      <tbody>
        {[
          ['Revenue', '$38.7M', '$74.7M', '$123.8M'],
          ['Gross margin', '51%', '53%', '53%'],
          ['EBITDA', '$6.5M', '$18.8M', '$36.2M'],
          ['EBITDA margin', '17%', '25%', '29%'],
          ['Year 4 EBITDA', '($1.0M)', '$1.4M', '$6.8M'],
        ].map(row => (
          <tr key={row[0]}>
            {row.map((cell, i) => (
              <td key={i}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <p className="deck-band-outline">
      Because staffing and licensing spend flex with the case, the downside is a
      smaller, later company, not a broken one.
    </p>
    <p className="deck-caption-note">
      The switch moves volume 0.6x / 1.0x / 1.7x, subscription attach 30% / 40%
      / 55%, licensing 0.3x / 1.0x / 1.5x, and the hiring plan with them. The
      flagship price holds at $899 in every case. Source: model v3.1, Scenario
      Summary.
    </p>
  </DeckPage>
);

const methodologyPage = (
  <DeckPage key={FIRST + 5} n={FIRST + 5} total={TOTAL}>
    <CardsPage
      columns={2}
      title="What the model does and does not include"
      sub="A 60-month, three-statement monthly build: 15 tabs, three scenarios, and a balance sheet that ties every month."
      cards={[
        {
          heading: 'Built into the model',
          body: (
            <ul className="deck-list">
              <li>
                MOQ-based inventory ordering with lead times, CM deposits and
                supplier advances
              </li>
              <li>
                Returns, payment processing and outbound shipping inside COGS
              </li>
              <li>
                A manufacturing scale-up drag and returns reserve that step down
                by production year
              </li>
              <li>Q4 seasonality: every launch lands in the gift quarter</li>
              <li>A $5M revolver that holds a $750K minimum cash balance</li>
              <li>
                Scenario-linked staffing, NOL carryforwards, and a 27% blended
                tax rate
              </li>
            </ul>
          ),
        },
        {
          heading: 'Deliberately excluded: upside, not gaps',
          body: (
            <ul className="deck-list">
              <li>
                Journalism, healthcare and family-office SKUs. Phase 2 is one
                Professional line
              </li>
              <li>Any Series A or B. The headline path is one equity round</li>
              <li>International revenue beyond the modelled ramp</li>
              <li>
                Multi-modal capture and artifact integration as separate revenue
              </li>
              <li>Genealogy platform distribution partnerships</li>
              <li>Heritage-retail channel revenue beyond DTC economics</li>
            </ul>
          ),
        },
      ]}
    />
    <p className="deck-band">
      Everything left out of the model is upside. Everything hard about hardware
      is in it.
    </p>
  </DeckPage>
);

const STUBS: Array<{ title: string; note: string }> = [
  {
    title: 'A1 · Stack deep-dive',
    note: 'TEE, zero-knowledge backup, mirroring, P2P gossip diagrams; ontology library (declare a schema, the model extracts it); Harness API surfaces (MCP, completions, RAG, ontology lookup)',
  },
  {
    title: 'A2 · Competition matrix',
    note: 'Cloud assistants, AI gadgets, DIY local stacks, genealogy platforms',
  },
  {
    title: 'A3 · Go-to-market detail',
    note: "Waitlist → Founder's Edition → broader pre-order; DTC + curated heritage retail; US-led rollout",
  },
];

const stubPages: ReactNode[] = STUBS.map((stub, i) => (
  <DeckPage key={FIRST + 6 + i} n={FIRST + 6 + i} total={TOTAL}>
    <Statement title={stub.title}>{STUB_BODY}</Statement>
    <div className="mt-10">
      <FpoBox note={stub.note} />
    </div>
  </DeckPage>
));

const sourcesPage = (
  <DeckPage
    key={FIRST + 6 + STUBS.length}
    n={FIRST + 6 + STUBS.length}
    total={TOTAL}
  >
    <Statement title="Sources" sub="Every figure in this deck, linked." />
    <ol className="deck-sources mt-10">
      {orderedReferences().map(([key, ref], i) => (
        <li key={key}>
          {i + 1}.{' '}
          <a
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            {ref.source} · {ref.date}
          </a>
        </li>
      ))}
    </ol>
  </DeckPage>
);

export const APPENDIX_PAGES: ReactNode[] = [
  splashPage,
  movedUnitEconomics,
  movedContext,
  revenueModelPage,
  scenariosPage,
  methodologyPage,
  ...stubPages,
  sourcesPage,
];
