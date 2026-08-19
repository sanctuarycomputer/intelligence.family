import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import Ref from '../components/Ref';
import { Band, CardsPage, StatTiles, Statement } from '../components/archetypes';
import { orderedReferences } from './references';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 25;
// Appendix pages continue the page ids past the core deck, but the footer
// counter stays unnumbered so nobody reads them as pages 27 of 26.
const FIRST = TOTAL + 1;

const splashPage = (
  <DeckPage key={FIRST} n={FIRST} total={TOTAL}>
    <Statement splash title="Appendix" />
  </DeckPage>
);

const revenueModelPage = (
  <DeckPage key={FIRST + 1} n={FIRST + 1} total={TOTAL}>
    <Statement
      title="A1 · Revenue model"
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
          ['Flagship device', '$899', 'Oct 2027', '$42.7M', '54%'],
          ['Companion device', '$499', 'Oct 2028', '$7.4M', '9%'],
          ['Professional SKU', '$1,999', 'Oct 2029', '$6.3M', '8%'],
          ['Backup subscription', '$9 / mo', 'Oct 2027', '$3.2M', '4%'],
          [
            'Enterprise licensing + services',
            '$150K ACV',
            'Year 3',
            '$13.5M',
            '17%',
          ],
          ['OEM royalty', '$5 / device', 'Year 4', '$5.6M', '7%'],
          ['Total revenue', '', '', '$78.8M', '100%'],
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
        { value: '$59.6M', label: 'Year 5 revenue excluding licensing' },
        { value: '41,036', label: 'Active subscribers exiting Year 5' },
        { value: '$19.2M', label: 'Enterprise and OEM revenue in Year 5' },
      ]}
    />
    <p className="deck-caption-note">
      Source: Family Intelligence financial model, base case. A single switch
      zeroes both licensing lines for a devices-only view.
    </p>
  </DeckPage>
);

const scenariosPage = (
  <DeckPage key={FIRST + 3} n={FIRST + 3} total={TOTAL}>
    <Statement
      title="A3 · Scenarios"
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
          ['Revenue', '$41.3M', '$78.8M', '$131.0M'],
          ['Gross margin', '51%', '52%', '52%'],
          ['EBITDA', '$7.7M', '$20.4M', '$38.9M'],
          ['EBITDA margin', '19%', '26%', '30%'],
          ['Year 4 EBITDA', '$0.3M', '$3.0M', '$9.2M'],
          ['Cash trough', '$2.7M', '$2.2M', '$1.1M'],
        ].map(row => (
          <tr key={row[0]}>
            {row.map((cell, i) => (
              <td key={i}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <p className="deck-caption-note deck-caption-note-table">
      Every case crosses into EBITDA-positive in Year 4, and every case funds
      itself on this round. The switch moves volume 0.6x / 1.0x / 1.7x,
      subscription attach 30% / 40% / 55%, licensing 0.3x / 1.0x / 1.5x, and the
      hiring plan with them. The flagship price holds at $899 in every case.
      Source: Family Intelligence financial model, scenario summary.
    </p>
  </DeckPage>
);

const methodologyPage = (
  <DeckPage key={FIRST + 4} n={FIRST + 4} total={TOTAL}>
    <CardsPage
      columns={2}
      title="A4 · Model methodology"
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
              <li>
                Customer pre-order deposits, with the deposit window closing as
                capacity catches up
              </li>
              <li>
                Enterprise licenses billed annually in advance, with a half-year
                convention on new signings
              </li>
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
              <li>
                Any drawn debt. The plan funds itself on the equity round alone
              </li>
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
  </DeckPage>
);

const baseCasePage = (
  <DeckPage key={FIRST + 2} n={FIRST + 2} total={TOTAL}>
    <Statement
      title="A2 · Base case"
      sub="EBITDA-positive in Year 4 on this round alone. The platform upside is what you're pricing."
    />
    <table className="deck-plan-table">
      <thead>
        <tr>
          <th>$mm</th>
          <th>Y2</th>
          <th>Y3</th>
          <th>Y4</th>
          <th>Y5</th>
        </tr>
      </thead>
      <tbody>
        {[
          ['Revenue', '4.1', '15.4', '40.0', '78.8'],
          ['Gross margin', '36%', '43%', '45%', '52%'],
          ['EBITDA', '(4.8)', '(3.7)', '3.0', '20.4'],
          ['Headcount, year end', '8', '26', '36', '44'],
          ['Cash, year end', '6.7', '5.5', '2.9', '24.2'],
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
        { value: '$78.8M', label: 'Year 5 revenue, base case' },
        { value: 'Year 4', label: 'EBITDA-positive on this round alone' },
        {
          value: '$0',
          label: 'Follow-on equity in the plan. Raising again is a choice.',
        },
      ]}
    />
    <p className="deck-caption-note">
      The plan never runs out of cash: it bottoms at $2.15M in month 42, a
      working-capital low point, not a burn low point. No debt facility is drawn
      in any scenario. Source: Family Intelligence financial model, base case.
    </p>
  </DeckPage>
);

const platformLicensingPage = (
  <DeckPage key={FIRST + 5} n={FIRST + 5} total={TOTAL}>
    <Statement
      title="A5 · Platform licensing"
      sub="Our platform is a compounding business. We anticipate three key modes to help partners integrate our software."
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
      services run through our agency partner at 20%. Android proves this thesis
      at 3B+ active devices.
      <Ref k="android-3b" /> Qualcomm&rsquo;s licensing arm did $5.6B last year
      at a 72% pre-tax margin.
      <Ref k="qualcomm-qtl" />
    </p>
    <Band narrow>
      Sonos, Dyson, and LG would never build this stack... but they will need to
      license it.
    </Band>
  </DeckPage>
);

const sourcesPage = (
  <DeckPage key={FIRST + 6} n={FIRST + 6} total={TOTAL}>
    <Statement title="A6 · Sources" sub="Every figure in this deck, linked." />
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
  revenueModelPage,
  baseCasePage,
  scenariosPage,
  methodologyPage,
  platformLicensingPage,
  sourcesPage,
];
