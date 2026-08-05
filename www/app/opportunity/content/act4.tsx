import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import MailtoCta from '../components/MailtoCta';
import Ref from '../components/Ref';
import { CardsPage, Statement } from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
const ACT = 'IV · The Ask';
const ACT_CLASS = 'deck-act-4';

const page22 = (
  <DeckPage key={22} n={22} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <CardsPage
      title="The hard questions"
      sub="Apple, model quality, hardware risk, and consent."
      cards={[
        {
          heading: 'Why won’t Apple or Google do this?',
          body: (
            <>
              Their business depends on your data living in their cloud, so a
              private stack works against them. Amazon killed the Echo&rsquo;s
              local option in 2025.
              <Ref k="echo-local-removed" /> Truly local, encrypted inference is
              the real moat; the industrial design is just the part they could
              copy.
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
              It normalizes the always-listening home companion, and it is
              tethered to the cloud.
              <Ref k="openai-io" /> Every buyer it creates who reads a privacy
              policy is our buyer. HP switched Humane&rsquo;s servers off within
              ten days of buying the assets.
              <Ref k="humane-hp" /> Ours cannot be revoked.
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

const page23 = (
  <DeckPage key={23} n={23} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <CardsPage
      title="The team"
      sub="We shipped the Light Phone, Mill's IoT stack, and USB Club."
      cards={[
        {
          heading: 'Hugh Francis',
          body: (
            <>
              A patented inventor for architecting the Light Phone II and III,
              named among TIME&rsquo;s Best Inventions in 2019 and 2025.
              <Ref k="light-phone" /> Built Mill&rsquo;s IoT infrastructure for
              the founders of Google&rsquo;s Nest. Holds direct relationships
              with Foxconn, Arima, and Coosea in Taipei and Shenzhen. Runs
              garden3d, a 30+ person studio.
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
              The first hire this raise buys is an ML-systems lead. Builders who
              care about privacy join missions like this the way they join
              Signal and Mozilla, and our published research is how they find
              us.
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

const page24 = (
  <DeckPage key={24} n={24} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Statement
      title="We're raising $15M"
      sub="On shelves and ready to gift by Christmas 2027."
    >
      We are building this either way. The round sets the speed: a team hired
      fast enough to ship by Christmas 2027, a contract manufacturer in the room
      on day one, and the stack every product after this one runs on. AI took
      roughly half of global venture funding in 2025, and our research found no
      funded local-first home hub.
      <Ref k="crunchbase-ai-half" /> No one owns this market today, and that
      window is closing fast.
    </Statement>
    <p className="large mt-10 max-w-2xl">
      If you&rsquo;d like a demo, email us at <MailtoCta />.
    </p>
    <div className="mt-10">
      <FpoBox
        note="Timeline bar: round closes → waitlist opens → CM engaged → Christmas 2027; contact block"
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

export const ACT4_PAGES: ReactNode[] = [page22, page23, page24];
