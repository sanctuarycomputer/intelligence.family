import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import DeckVideo from '../components/DeckVideo';
import DeckDemo from '../components/DeckDemo';
import Ref from '../components/Ref';
import DemoControls from '@/components/demo/DemoControls';
import {
  Band,
  BigStat,
  CardsPage,
  PricingTiers,
  Split,
  Statement,
} from '../components/archetypes';

const ACT_CLASS = 'deck-act-2';

const page7 = (
  <DeckPage key={10} n={10} actClass={ACT_CLASS}>
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <Statement
        title="Our first device is for families"
        sub="High emotional value, sensitive data, and a GPU in the living room."
      >
        Stories, goals, birth certificates, wills, recipes, genetic histories:
        families keep records that deserve care.
        <br />
        <br />
        LLMs remove most of the friction of keeping an accurate family archive.{' '}
        <strong>
          But only if families feel safe sharing their most intimate data with
          the system.
        </strong>
      </Statement>
      <div>
        <div className="deck-mosaic">
          <span className="deck-video-frame">
            <DeckVideo
              src="/opportunity/device-playtest.mp4"
              poster="/opportunity/device-playtest-poster.jpg"
              label="A family play-testing the device prototype"
            />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/opportunity/device-photo.jpg"
            alt="A child touching the prototype's screen on a kitchen counter"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/opportunity/device-cad.jpg"
            alt="CAD render of the device enclosure: curved shell, tilted display, and the compute module with its cooler inside"
            className="deck-mosaic-wide"
          />
        </div>
        <p className="deck-media-caption">
          An early user testing prototype, dubbed the Family Trunk. Book a
          meeting with us to see it working IRL.
        </p>
      </div>
    </div>
  </DeckPage>
);

// prettier-ignore
const deviceDemoPage = (
  <DeckPage key={11} n={11} actClass={ACT_CLASS} bleed={<DeckDemo />}>
    <div className="deck-demo-copy">
      <Statement
        title="The best home assistant on the market"
        sub="Take better care of your family than ever before."
        titleAction={<DemoControls />}
      >
        <strong>
          Automate shopping and bill payments, balance the household budget,
          help the kids with homework and stay on top of the family calendar.
        </strong>
        <br />
        <br />
        It all works out of the box with no cloud subscription required.
      </Statement>
    </div>
  </DeckPage>
);

const page8 = (
  <DeckPage key={12} n={12} actClass={ACT_CLASS}>
    <Split
      flip
      title="Your own family vault"
      sub="The device solves age old family archive problems overnight."
      media={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/opportunity/family-vault.png"
          alt="The Family Book device surrounded by illustrated vault contents: a storybook, cookbook, document box, photo pile, calendar, piggy bank, and health folder"
          className="deck-slide-media"
        />
      }
    >
      <strong>Weekly check-ins, budgets, school, health, and stories.</strong>{' '}
      The trustworthy filing cabinet for documents often lost, the scribe (and
      fact checker) for Grandpa&rsquo;s bewildering tall stories (and history of
      glaucoma), the family cookbook, the home media server for photos and
      recordings often scattered across devices.
    </Split>
  </DeckPage>
);

const conveniencePage = (
  <DeckPage key={13} n={13} actClass={ACT_CLASS}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/opportunity/convenience-tunnel.png"
      alt="The O'Hagans Family Book device at center with a glowing brain inside; calendar, email, weather and web search clouds stream down into it, while padlocked links connect out to a phone and laptop, each sheltered under its own glass dome"
      className="deck-bg-art"
    />
    <div className="deck-bg-copy deck-bg-copy-narrow">
      <Statement
        title="Convenience of the cloud. Privacy of the home."
        sub="Local-first models don't make you choose."
      >
        <strong>
          Opt-in networking modes allow local AI agents to pull context from the
          public internet:
        </strong>{' '}
        connect your Google Calendar &amp; email, and access web search,
        weather, maps, and any resource on the internet.
        <br />
        <br />
        Our zero-knowledge subscription vault exposes a remote tunnel,
        connecting the web &amp; phone apps from outside the home, (just as the
        Claude or ChatGPT consumer apps do their server).
      </Statement>
      <Band narrow>
        Prompts, inference &amp; reasoning never leave the family&rsquo;s
        end-to-end encrypted network.
      </Band>
    </div>
  </DeckPage>
);

const contextPage = (
  <DeckPage key={14} n={14} actClass={ACT_CLASS}>
    <Split
      flip
      title="A context window for smart homes"
      sub="Inference for every IoT device on the network."
      band={
        <>
          US internet households already run 17 connected devices.
          <Ref k="parks-17-devices" /> Soon, they&rsquo;ll all need inference.
        </>
      }
      media={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/opportunity/context-window-home.png"
          alt="A house cross-section: the Family Book hub on the coffee table, connected by glowing vines to the TV, thermostat, camera, laptop, phone, and speaker in every room"
          className="deck-slide-media"
        />
      }
    >
      The house knows who the plumber is and what the family is saving for. As
      homes become smarter, single purpose devices will need access to shared
      inference that understands the home, and who lives there.
      <br />
      <br />
      <strong>
        One local agent holds that memory: an MCP server on the LAN, a
        chat-completions endpoint, and local RAG.
      </strong>
    </Split>
  </DeckPage>
);

const page12 = (
  <DeckPage key={15} n={15} actClass={ACT_CLASS}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/opportunity/device-family.png"
      alt="Three rounded devices posed together on a wooden sideboard like a family portrait: a large glowing yellow cube, a small matching one beside it, and a taller sage-green one, among books, a plant, and a framed picture of a house"
      className="deck-bg-art"
      style={{ width: 'clamp(440px, 46vw, 900px)' }}
    />
    {/* Half-weighted to the top: a fixed bottom margin lifts the centered
        block halfway toward the mb-auto position. */}
    <div
      className="deck-bg-copy"
      style={{ marginBottom: 'clamp(120px, 24dvh, 260px)' }}
    >
      <PricingTiers
        title="One device becomes a family of them"
        sub="The flagship device ships first, every future SKU runs the same evolving stack. All connected via the private family network."
        tiers={[
          {
            name: 'Flagship',
            price: '$899',
            body: (
              <>
                The whole-home device. Premium, heirloom-grade object carrying
                the inference runtime and the household graph.
              </>
            ),
            meta: 'Launch',
          },
          {
            name: 'Companion',
            price: '$499',
            body: (
              <>
                Smaller second unit for other rooms and less technical family.
                Syncs end-to-end with the flagship.
              </>
            ),
            meta: '+12 months',
          },
          {
            name: 'Professional',
            price: '$1,999',
            body: (
              <>
                Category-tuned for the workplace: array mics, multi-speaker
                separation, long sessions. Same runtime, different use case.
              </>
            ),
            meta: 'Phase 2',
          },
          {
            name: 'Backups & Family Network',
            price: '$9/mo',
            body: (
              <>
                Optional e2e encrypted archive we cannot open, plus apps for
                far-away family. 1Password and Proton run profitable
                subscriptions on the same promise.
                <Ref k="1password-arr" />
                <Ref k="proton-nonprofit" />
              </>
            ),
            meta: 'Attach ~40%',
          },
        ]}
      />
    </div>
  </DeckPage>
);

const page10 = (
  <DeckPage key={16} n={16} actClass={ACT_CLASS}>
    <BigStat
      stat="600M+"
      title="Home hubs are a proven category."
      sub="600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally."
      band="In 2026, you should be able to dim your lights without notifying Jeff Bezos. Home inference (finally) makes that possible."
    >
      The AI gadget graveyard is littered with attempts to find new ways to
      interact.{' '}
      <strong>
        Instead, we&rsquo;re entering a proven category with a new architecture
        consumers already want.
      </strong>
      <br />
      <br />
      Alexa have sold 600M+ units.
      <Ref k="alexa-600m" /> OpenAI paid $6.5B for Jony Ive&rsquo;s startup,
      <Ref k="openai-io" /> Amazon bought Bee,
      <Ref k="bee-amazon" /> Meta bought Limitless.
      <Ref k="limitless-meta" /> 800M+ Google Home units shipped.
      <Ref k="google-home-800m" /> All of them a soft-surveillance device
      running in someone else&rsquo;s cloud.
    </BigStat>
  </DeckPage>
);

const page11 = (
  <DeckPage key={17} n={17} actClass={ACT_CLASS}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/opportunity/family-shelf.png"
      alt="A warm home shelf still-life: a glowing audio box with toy figurines, a framed family tree, an open family memoir book, a phone showing a location map with glowing dots, and a child's drawing pinned to the wall"
      className="deck-bg-art"
      style={{
        width: 'clamp(600px, 65vw, 1248px)',
        right: 'auto',
        left: 'calc(var(--container-padding) * -0.5)',
        transform: 'scaleX(-1)',
      }}
    />
    <div
      className="deck-bg-copy"
      style={{ maxWidth: '700px', marginLeft: 'auto' }}
    >
      <CardsPage
        columns={1}
        title="Families already pay for this"
        sub={
          <>
            tonies did &euro;630M in revenue last year.
            <br />
            Life360 is a $4.5B public company.
          </>
        }
        cards={[
          {
            heading: 'tonies did €630M',
            body: (
              <>
                tonies grew revenue 31% to €630M in FY2025, on a box and its
                figurines.
                <Ref k="tonies-fy2025" />{' '}
                <strong>
                  Family hardware with a recurring layer is a public-company
                  business.
                </strong>
              </>
            ),
          },
          {
            heading: 'Life360 is worth $4.5B',
            body: (
              <>
                Life360 did $489.5M in FY2025 revenue across roughly 98M monthly
                users, and the market values it near $4.5B.
                <Ref k="life360-q1" />
              </>
            ),
          },
          {
            heading: 'Ancestry and StoryWorth',
            body: (
              <>
                Blackstone bought Ancestry for $4.7B in 2020.
                <Ref k="ancestry-blackstone" /> StoryWorth reports over 1M
                printed books, bootstrapped.
                <Ref k="storyworth" /> We unify the practice these products
                offer piecemeal.
              </>
            ),
          },
        ]}
      />
    </div>
  </DeckPage>
);

const unitEconomicsPage = (
  <DeckPage key={18} n={18} actClass={ACT_CLASS}>
    <BigStat
      stat="2.1x"
      title="Paid back at point of sale"
      sub="Each sale covers its own customer acquisition before subscription starts."
    >
      We budget $200 to acquire each customer, blended across paid social,
      creators &amp; retail placement.{' '}
      <strong>
        That&rsquo;s deliberately conservative: hardware gross profit alone
        recovers it 2.1 times over at the register.
      </strong>
      <br />
      <br />
      Plaud proved it first: ~$250M of ARR on 2M+ devices, with essentially no
      venture capital.
      <Ref k="plaud" />
    </BigStat>
    <p className="deck-caption-note deck-caption-note-left">
      The plan assumes 90,981 cumulative flagship devices by Year 5, 0.07% of US
      households. Source: Family Intelligence financial model, base case.
    </p>
  </DeckPage>
);

export const ACT2_PAGES: ReactNode[] = [
  page7,
  deviceDemoPage,
  page8,
  conveniencePage,
  contextPage,
  page12,
  page10,
  page11,
  unitEconomicsPage,
];
