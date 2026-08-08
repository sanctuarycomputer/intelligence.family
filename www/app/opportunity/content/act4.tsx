import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import MailtoCta from '../components/MailtoCta';
import Ref from '../components/Ref';
import { CardsPage, DiagramPage, Statement } from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 26;
const ACT_CLASS = 'deck-act-4';

const page22 = (
  <DeckPage key={22} n={22} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      splash
      title="We've spent our careers deploying novel hardware and custom operating systems"
    />
  </DeckPage>
);

const teamPhoto = (label: string) => (
  <span className="deck-card-photo-fpo">{label}</span>
);

const page24 = (
  <DeckPage key={23} n={23} total={TOTAL} actClass={ACT_CLASS}>
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
                Light Phone II and III, named among TIME&rsquo;s Best Inventions
                in 2019 and 2025.
              </strong>
              <Ref k="light-phone" /> Among other projects, Hugh architected
              Mill&rsquo;s IoT infrastructure for the founders of Google&rsquo;s
              Nest, runs IoT projects for AT&amp;T, and led garden3d, a 30+
              person studio.
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
              World&rsquo;s Advanced Concepts team. Previously designed at early
              Plaid.
            </>
          ),
        },
      ]}
    />
    <div className="mt-10">
      <FpoBox
        note="Logo strip: Light Phone · Mill · USB Club · World · Mozilla · TIME"
        aspect="8/1"
      />
    </div>
  </DeckPage>
);

const page23 = (
  <DeckPage key={24} n={24} total={TOTAL} actClass={ACT_CLASS}>
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
  <DeckPage key={25} n={25} total={TOTAL} actClass={ACT_CLASS}>
    <DiagramPage
      title="Timeline"
      sub="Round closes, contract manufacturer in the room, shelves by Christmas 2027."
      media={
        <FpoBox
          note="Timeline bar: raise close → waitlist opens → CM engaged → EVT/DVT/PVT → Christmas 2027"
          aspect="6/1"
        />
      }
    >
      Hardware moves faster than it used to.{' '}
      <strong>Rabbit shipped four months after its Series A,</strong>
      <Ref k="rabbit-ship" /> and Plaud shipped in 18 months, bootstrapped.
      <Ref k="plaud" /> Christmas 2027 is the conservative end.
    </DiagramPage>
  </DeckPage>
);

const page26 = (
  <DeckPage key={26} n={26} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      title="We're raising $15M"
      sub="On shelves and ready to gift by Christmas 2027."
    >
      Our research found no funded local-first home hub, in a year when AI took
      roughly half of global venture funding.
      <Ref k="crunchbase-ai-half" />{' '}
      <strong>
        No one owns this market today, and that window is closing fast.
      </strong>
    </Statement>
    <p className="deck-body">
      If you&rsquo;d like a demo, email us at <MailtoCta />.
    </p>
  </DeckPage>
);

export const ACT4_PAGES: ReactNode[] = [page22, page24, page23, page25, page26];
