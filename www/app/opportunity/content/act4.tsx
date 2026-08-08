import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import MailtoCta from '../components/MailtoCta';
import TimelineGantt from '../components/TimelineGantt';
import Ref from '../components/Ref';
import {
  CardsPage,
  DiagramPage,
  Ledger,
  StatTiles,
  Statement,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
const ACT_CLASS = 'deck-act-4';

const page22 = (
  <DeckPage key={19} n={19} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      splash
      title="We've spent our careers deploying novel hardware, low level infrastructure and custom operating systems"
    />
  </DeckPage>
);

const teamPhoto = (label: string) => (
  <span className="deck-card-photo-fpo">{label}</span>
);

const page24 = (
  <DeckPage key={20} n={20} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      title="The team"
      sub="We shipped the Light Phone, Mill's IoT stack, and USB Club."
      cards={[
        {
          heading: 'Hugh Francis',
          photo: teamPhoto('Hugh photo'),
          body: (
            <>
              <strong>
                A computer scientist & patented inventor for architecting the
                operating system for Light Phone II and III, named among
                TIME&rsquo;s Best Inventions in 2019 and 2025.
              </strong>
              <Ref k="light-phone" />
              <br />
              <br />
              Among other projects, Hugh architected Mill&rsquo;s IoT
              infrastructure (for the founders of Google&rsquo;s Nest), runs IoT
              projects for AT&amp;T, and led Sanctuary Computer, a 30+ hard
              technology studio.
            </>
          ),
        },
        {
          heading: 'Yatú Pelaez-Espinosa',
          photo: teamPhoto('Yatú photo'),
          body: (
            <>
              Co-founded USB Club, a hardware-enabled social network, and
              started the Advanced Concepts hardware team at Sam Altman&rsquo;s
              World. In an earlier life, designed at IBM.
            </>
          ),
        },
        {
          heading: 'Norm O’Hagan',
          photo: teamPhoto('Norm photo'),
          body: (
            <>
              Co-founded USB Club and built new hardware product experiences at
              World&rsquo;s Advanced Concepts team.
              <br />
              <br />
              Previously Norm was the 3rd design hire at Plaid.
            </>
          ),
        },
      ]}
    />
    <p className="deck-band">
      Before launch, roughly 90% of engineering runs through Sanctuary Computer
      at arm&rsquo;s length: a shipped-hardware team of 6 to 8 from day one,
      with no hiring cycle. The handoff completes by Year 4.
    </p>
    <div className="mt-6">
      <FpoBox
        note="Logo strip: Light Phone · Mill · USB Club · World · Mozilla · TIME"
        aspect="8/1"
      />
    </div>
  </DeckPage>
);

const page23 = (
  <DeckPage key={21} n={21} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      title="The hard questions"
      sub="Competition, model quality, hardware risk, consent, chips, and the raise."
      cards={[
        {
          heading: 'Why won’t Apple or Google do this?',
          body: (
            <>
              The Big Labs & Hyperscalers&rsquo; business depends on your data
              living in their cloud - they can&rsquo;t afford to compete. Local,
              encrypted inference is the moat. Google never tried to compete
              with Signal or Telegram for the same reason.
            </>
          ),
        },
        {
          heading: 'Won’t local models always lag the frontier?',
          body: (
            <>
              Yes, but the gap is narrowing (fast). Household tasks are narrow:
              transcription, extraction, RAG, classification. Open weights land
              every upstream advance in our stack for free.
              <Ref k="inkling" />
              <Ref k="nemotron3" />
            </>
          ),
        },
        {
          heading: 'What about OpenAI’s device?',
          body: (
            <>
              Like the failed friend.com, OpenAI&rsquo;s device is an
              always-listening home companion, tethered to the cloud.
              <Ref k="openai-io" /> HP switched Humane&rsquo;s servers off ten
              days after buying it.
              <Ref k="humane-hp" /> <strong>Ours cannot be revoked.</strong>
            </>
          ),
        },
        {
          heading: 'Why this raise size?',
          body: (
            <>
              No brand owns safe local AI yet, but that window is closing fast.
              We&rsquo;re building a full privacy preserving software SDK and a
              hardware device by Christmas 2027. The capital goes to hiring fast
              and securing a blue chip contract manufacturer.
            </>
          ),
        },
        {
          heading: 'Consumers hate subscriptions.',
          body: (
            <>
              The $9/month cloud backup is optional. Our family device works out
              of the box with no connectivity. Our encrypted sync opt-in for
              peace of mind.
            </>
          ),
        },
        {
          heading: 'How will you compete for AI chips?',
          body: (
            <>
              Our prototype was built to perform well on a previous-generation
              NVIDIA Orin dev kit, proving our product experience does not need
              bleeding-edge silicon.
            </>
          ),
        },
        {
          heading: 'Why dedicated hardware?',
          body: (
            <>
              The seven in ten Americans who distrust big tech&rsquo;s cloud AI
              are not hobbyists. We&rsquo;re giving them AI that&rsquo;s
              immediately useful out of the box - with no data center in the
              loop.
            </>
          ),
        },
        {
          heading: 'Recording consent and children’s data?',
          body: (
            <>
              Consent-first capture, no ambient listening, and regulated data
              classes kept on the device. What we never collect cannot be
              breached, subpoenaed, or sold.
            </>
          ),
        },
        {
          heading: 'Manufacturing and tariff risk?',
          body: (
            <>
              Our team hold direct relationships with Foxconn, Arima, and Coosea
              in Taipei and Shenzhen, and a tariff-aware manufacturing plan.
            </>
          ),
        },
      ]}
    />
  </DeckPage>
);

const page25 = (
  <DeckPage key={22} n={22} total={TOTAL} actClass={ACT_CLASS}>
    <DiagramPage
      title="Timeline"
      sub="Round closes, contract manufacturer in the room, shelves by Christmas 2027."
      media={<TimelineGantt />}
    />
  </DeckPage>
);

const baseCasePage = (
  <DeckPage key={23} n={23} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      title="The base case funds itself"
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
          label:
            'Follow-on equity in the plan. Raising again is a choice to accelerate, never a need',
        },
      ]}
    />
    <p className="deck-caption-note">
      A $5M working-capital line backstops the inventory swing. Source: Family
      Intelligence model v3.1, base case.
    </p>
  </DeckPage>
);

const page26 = (
  <DeckPage key={24} n={24} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      title="We're raising $15M"
      sub="Shipping out and ready to gift by Christmas 2027."
    >
      Our research found no funded local-first home hub, in a year when AI took
      roughly half of global venture funding.
      <Ref k="crunchbase-ai-half" />
      <br />
      <br />
      <strong>
        No one owns this market today, and that window is closing fast.
      </strong>
    </Statement>
    <div className="mt-8 max-w-xl divide-y divide-fi-green-300">
      {[
        ['Target raise', '$15.0M'],
        ['Capacity to', '$25.0M'],
        ['Instrument', 'Priced equity'],
        ['Working-capital line', '$5.0M, non-dilutive'],
        ['First shipment', 'Oct 2027'],
      ].map(([label, value]) => (
        <div
          key={label}
          className="flex items-baseline justify-between py-2 text-[15px]"
        >
          <span>{label}</span>
          <span className="deck-tam" style={{ fontSize: '17px' }}>
            {value}
          </span>
        </div>
      ))}
    </div>
    <p className="deck-body">
      If you&rsquo;d like a demo, email us at <MailtoCta />.
    </p>
  </DeckPage>
);

export const ACT4_PAGES: ReactNode[] = [
  page22,
  page24,
  page23,
  page25,
  baseCasePage,
  page26,
];
