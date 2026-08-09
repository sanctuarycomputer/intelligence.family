import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import Ref from '../components/Ref';
import {
  Band,
  CardsPage,
  StatTiles,
  Statement,
} from '../components/archetypes';
import { orderedReferences } from './references';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
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
    <p className="deck-caption-note deck-caption-note-table">
      The switch moves volume 0.6x / 1.0x / 1.7x, subscription attach 30% / 40%
      / 55%, licensing 0.3x / 1.0x / 1.5x, and the hiring plan with them. The
      flagship price holds at $899 in every case. Source: model v3.1, Scenario
      Summary.
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
    <Band>
      Everything left out of the model is upside. Everything hard about hardware
      is in it.
    </Band>
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
        <tr>
          <td>Revenue</td>
          <td>4.1</td>
          <td>14.7</td>
          <td>38.0</td>
          <td>74.7</td>
        </tr>
        <tr>
          <td>Gross margin</td>
          <td>36%</td>
          <td>43%</td>
          <td>46%</td>
          <td>53%</td>
        </tr>
        <tr>
          <td>EBITDA</td>
          <td>(4.9)</td>
          <td>(5.2)</td>
          <td>1.4</td>
          <td>18.8</td>
        </tr>
      </tbody>
    </table>
    <StatTiles
      tiles={[
        { value: '$74.7M', label: 'Year 5 revenue, base case' },
        { value: 'Year 4', label: 'EBITDA-positive on this round alone' },
        {
          value: '$0',
          label: 'Follow-on equity in the plan. Raising again is a choice.',
        },
      ]}
    />
    <p className="deck-caption-note">
      A $5M working-capital line backstops the inventory swing. Source: Family
      Intelligence model v3.1, base case.
    </p>
  </DeckPage>
);

const sourcesPage = (
  <DeckPage
    key={FIRST + 5}
    n={FIRST + 5}
    total={TOTAL}
  >
    <Statement title="A5 · Sources" sub="Every figure in this deck, linked." />
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
  sourcesPage,
];
