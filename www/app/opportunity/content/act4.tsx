import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import MailtoCta from '../components/MailtoCta';
import Ref from '../components/Ref';
import { CardsPage, DiagramPage, Statement } from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 26;
const ACT = 'IV · The Ask';
const ACT_CLASS = 'deck-act-4';

const page23 = (
  <DeckPage key={23} n={23} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      title="The hard questions"
      sub="Apple, model quality, hardware risk, consent, chips, and the raise."
      cards={[
        {
          heading: 'Why won’t Apple or Google do this?',
          body: (
            <>
              Their business depends on your data living in their cloud. Amazon
              killed the Echo&rsquo;s local option in 2025.
              <Ref k="echo-local-removed" /> Local, encrypted inference is the
              moat; the industrial design is copyable.
            </>
          ),
        },
        {
          heading: 'Won’t local models always lag the frontier?',
          body: (
            <>
              Yes, and household tasks are narrow: transcription, extraction,
              RAG, classification. Open weights like Inkling and Nemotron 3 land
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
              It normalizes the always-listening home companion, tethered to the
              cloud.
              <Ref k="openai-io" /> HP switched Humane&rsquo;s servers off ten
              days after buying the assets.
              <Ref k="humane-hp" /> <strong>Ours cannot be revoked.</strong>
            </>
          ),
        },
        {
          heading: 'Why this raise size?',
          body: (
            <>
              No brand owns safe local AI yet. The money goes straight to a
              contract manufacturer and a team that ships by Christmas 2027, not
              to incremental rounds.
            </>
          ),
        },
        {
          heading: 'I hate subscriptions.',
          body: (
            <>
              The $9/month cloud backup is optional. The device works out of the
              box with no connectivity. Encrypted sync is opt-in, for families
              who want the stories safe if hardware breaks.
            </>
          ),
        },
        {
          heading: 'How will you compete for AI chips?',
          body: (
            <>
              We built the prototype on a previous-generation NVIDIA Orin on
              purpose. The experience does not need bleeding-edge silicon, and
              cheap components keep getting better.
            </>
          ),
        },
        {
          heading: 'Why dedicated hardware?',
          body: (
            <>
              The seven in ten who distrust cloud AI are not hobbyists. The
              trust boundary has to be physical, legible to the oldest person in
              the family.
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
              Direct relationships with Foxconn, Arima, and Coosea in Taipei and
              Shenzhen, and a tariff-aware manufacturing plan.
            </>
          ),
        },
      ]}
    />
  </DeckPage>
);

const page24 = (
  <DeckPage key={24} n={24} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <CardsPage
      title="The team"
      sub="We shipped the Light Phone, Mill's IoT stack, and USB Club."
      cards={[
        {
          heading: 'Hugh Francis',
          body: (
            <>
              <strong>
                A patented inventor for architecting the Light Phone II and III,
                named among TIME&rsquo;s Best Inventions in 2019 and 2025.
              </strong>
              <Ref k="light-phone" /> Built Mill&rsquo;s IoT infrastructure for
              the founders of Google&rsquo;s Nest. Holds direct relationships
              with Foxconn, Arima, and Coosea. Runs garden3d, a 30+ person
              studio.
            </>
          ),
        },
        {
          heading: 'Yatú Pelaez-Espinosa and Norm O’Hagan',
          body: (
            <>
              A product duo of ten years. They founded USB Club, a
              hardware-enabled social network, and started the Advanced Concepts
              hardware team at Sam Altman&rsquo;s World. Earlier they designed
              at IBM and early Plaid.
            </>
          ),
        },
        {
          heading: 'Who this raise hires',
          body: (
            <>
              The first hire is an ML-systems lead. Builders who care about
              privacy join missions like this the way they join Signal and
              Mozilla, and our published research is how they find us.
            </>
          ),
        },
      ]}
    />
    <div className="mt-10">
      <FpoBox
        note="Three founder columns with photos; logo strip: Light Phone · Mill · USB Club · World · Mozilla · TIME"
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

const page25 = (
  <DeckPage key={25} n={25} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
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
      <Ref k="rabbit-ship" /> Plaud shipped in 18 months, bootstrapped,
      <Ref k="plaud" /> and tonies launched Toniebox 2 in September and took 80%
      of its Q4 sales.
      <Ref k="tonies-fy2025" /> We have shipped hardware before. Christmas 2027
      is the conservative end.
    </DiagramPage>
  </DeckPage>
);

const page26 = (
  <DeckPage key={26} n={26} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Statement
      title="We're raising $15M"
      sub="On shelves and ready to gift by Christmas 2027."
    >
      We are building this either way. The round sets the speed: a team hired
      fast enough to ship by Christmas 2027 and a contract manufacturer in the
      room on day one. Our research found no funded local-first home hub, in a
      year when AI took roughly half of global venture funding.
      <Ref k="crunchbase-ai-half" />{' '}
      <strong>
        No one owns this market today, and that window is closing fast.
      </strong>
    </Statement>
    <p className="large mt-10 max-w-2xl">
      If you&rsquo;d like a demo, email us at <MailtoCta />.
    </p>
  </DeckPage>
);

export const ACT4_PAGES: ReactNode[] = [page23, page24, page25, page26];
