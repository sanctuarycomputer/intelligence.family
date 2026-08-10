import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import DeckVideo from '../components/DeckVideo';
import MailtoCta from '../components/MailtoCta';
import TimelineGantt from '../components/TimelineGantt';
import Ref from '../components/Ref';
import {
  Band,
  CardsPage,
  DiagramPage,
  Statement,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
const ACT_CLASS = 'deck-act-4';

const page22 = (
  <DeckPage key={20} n={20} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      splash
      title="We've spent our careers deploying novel hardware, low-level infrastructure and custom operating systems"
    />
  </DeckPage>
);

const page24 = (
  <DeckPage key={21} n={21} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      title="The team"
      sub="We shipped the Light Phone II & III, Mill's IoT stack, built IoT for AT&T, stood up Advanced Concepts at Sam Altman's World Protocol, and founded USB Club."
      cards={[
        {
          heading: 'Hugh Francis',
          photo: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/opportunity/team-hugh.jpg" alt="Hugh Francis" />
          ),
          body: (
            <>
              A computer scientist & patented inventor for architecting the
              operating system for Light Phone II and III, named among
              TIME&rsquo;s Best Inventions in 2019 and 2025.
              <Ref k="light-phone" /> In 2017, Hugh received the US Green Card
              of Extraordinary Ability based on the value of his open source
              contributions.
              <br />
              <br />
              Among other projects, Hugh architected Mill&rsquo;s IoT
              infrastructure (for the founders of Google&rsquo;s Nest), runs IoT
              projects for AT&amp;T, and led Sanctuary Computer, a 30+ person
              hard technology studio.
            </>
          ),
        },
        {
          heading: 'Yatú Pelaez-Espinosa',
          photo: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/opportunity/team-yatu.jpg" alt="Yatú Pelaez-Espinosa" />
          ),
          body: (
            <>
              Previously CEO &amp; Co-Founder of USB Club, acquired in 2026.
              Started their career in product management and design at IBM iX,
              developing new products for institutions including Morgan
              Stanley, JPMorgan Chase, Citigroup, and Bank of America.
              <br />
              <br />
              More recently, founded and led the Advanced Concepts team at
              World (formerly Worldcoin), creating new devices and product
              categories for World ID.
            </>
          ),
        },
        {
          heading: 'Norm O’Hagan',
          photo: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/opportunity/team-norm.jpg" alt="Norm O'Hagan" />
          ),
          body: (
            <>
              Previously CTO &amp; Co-Founder of USB Club (Acquired, 2026).
              Built their career in early startups after engineering at MongoDB
              and becoming the third Designer at Plaid.
              <br />
              <br />
              Led Developer Experience at Plaid before starting the Concepting
              team to accelerate product development across the org. Recently
              helped found the Advanced Concepts team at World (formerly
              Worldcoin) to design devices for World ID.
            </>
          ),
        },
      ]}
    />
    <div className="mt-6">
      <div className="deck-team-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/fundraising/signal-source.jpg"
          alt="USB Club Transport product poster"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/fundraising/family-together.webp"
          alt="On the factory floor with our contract manufacturing partners"
        />
        <DeckVideo
          src="/opportunity/moment-video-small.mp4"
          poster="/fundraising/moment-video-poster.jpg"
          label="Early prototype in use"
        />
        <DeckVideo
          src="/opportunity/proof-portal-close.mp4"
          label="The Proof portal device closing"
        />
        <DeckVideo
          src="/opportunity/sanctuary-work.mp4"
          label="Sanctuary Computer hardware work"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/opportunity/transport-lit.jpg"
          alt="The USB Club Transport device, lit"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/opportunity/talk-intro.jpg"
          alt="Speaking on stage about augmenting human thought"
        />
      </div>
    </div>
  </DeckPage>
);

const page23 = (
  <DeckPage key={22} n={22} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      title="Hard questions"
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
              We&rsquo;re building a full privacy-preserving software SDK and a
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
              of the box with no connectivity. Our encrypted sync is opt-in, for
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
              Our team holds direct relationships with Foxconn, Arima, and
              Coosea in Taipei and Shenzhen, and a tariff-aware manufacturing
              plan.
            </>
          ),
        },
      ]}
    />
  </DeckPage>
);

const page25 = (
  <DeckPage key={23} n={23} total={TOTAL} actClass={ACT_CLASS}>
    <DiagramPage
      title="Timeline"
      sub="Round closes, contract manufacturer in the room, shelves by Christmas 2027."
      media={<TimelineGantt />}
    />
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
      <Ref k="crunchbase-ai-half" /> This round takes us from design to a
      certified, manufactured, shipped product, and reaches operating
      profitability without a second equity round.
    </Statement>
    <Band narrow>
      No one owns this market today, and that window is closing fast.
    </Band>
    <div className="mt-8 max-w-xl divide-y divide-fi-green-300">
      {[
        ['Target raise', '$15.0M'],
        ['Capacity to', '$25.0M'],
        ['Instrument', 'Priced equity'],
        ['First shipment', 'Christmas 2027'],
        ['Follow-on equity modelled', 'None'],
      ].map(([label, value]) => (
        <div
          key={label}
          className="flex items-baseline justify-between py-2 text-[15px]"
        >
          <span className="deck-ledger-label">{label}</span>
          <span className="deck-ledger-value">{value}</span>
        </div>
      ))}
    </div>
    <p className="deck-body">
      If you&rsquo;d like a demo, email us at <MailtoCta />.
    </p>
  </DeckPage>
);

export const ACT4_PAGES: ReactNode[] = [page22, page24, page23, page25, page26];
