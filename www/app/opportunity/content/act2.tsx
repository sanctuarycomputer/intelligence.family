import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import DeckVideo from '../components/DeckVideo';
import Ref from '../components/Ref';
import {
  BigStat,
  EvidenceGrid,
  PricingTiers,
  Split,
  Statement,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
const ACT_CLASS = 'deck-act-2';

const page7 = (
  <DeckPage key={8} n={8} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      title="Our first device is for families"
      sub="High emotional value, sensitive data, and a GPU in the living room."
    >
      Rich in stories, goals, birth certificates, wills, recipes and genetic
      histories - families hold rich and precious records worth holding
      carefully.
      <br />
      <br />
      Today, LLMs can greatly reduce the massive friction to maintaining an
      accurate family archive.{' '}
      <strong>
        But only if families feel safe sharing their most intimate data with the
        system.
      </strong>
    </Statement>
    <div className="mt-10 deck-media-row">
      <span className="deck-video-portrait deck-video-frame">
        <DeckVideo
          src="/opportunity/device-playtest.mp4"
          label="A family play-testing the device prototype"
        />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/opportunity/device-cad.jpg"
        alt="CAD render of the device enclosure: curved shell, tilted display, and the compute module with its cooler inside"
        className="deck-video-landscape"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/opportunity/device-photo.jpg"
        alt="A child touching the prototype's screen on a kitchen counter"
        className="deck-video-portrait"
      />
    </div>
  </DeckPage>
);

const page8 = (
  <DeckPage key={9} n={9} total={TOTAL} actClass={ACT_CLASS}>
    <Split
      flip
      title="Your own family vault"
      sub="Weekly check-ins, budgets, school, health, and stories."
      media={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/opportunity/family-vault.webp"
          alt="The Family Book device surrounded by illustrated vault contents: a storybook, cookbook, document box, photo pile, calendar, piggy bank, and health folder"
          className="deck-slide-media"
        />
      }
    >
      <strong>
        The device solves age old family archive problems overnight.
      </strong>{' '}
      The trustworthy filing cabinet for documents often lost, the scribe (and
      fact checker) for Grandpa&rsquo;s bewildering tall stories (and history of
      glaucoma), the family cookbook, the home media server for photos and
      recordings often scattered across devices.
    </Split>
  </DeckPage>
);

const contextPage = (
  <DeckPage key={10} n={10} total={TOTAL} actClass={ACT_CLASS}>
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
      homes become smarter, single purpose devices will need access to global
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
  <DeckPage key={11} n={11} total={TOTAL} actClass={ACT_CLASS}>
    <PricingTiers
      title="One device becomes a family of them"
      sub="The flagship device ships first, and every future SKU runs the same (evolving) stack."
      tiers={[
        {
          name: 'Flagship',
          price: '$899',
          body: (
            <>
              The whole-home device. Premium, heirloom-grade object carrying the
              inference runtime and the household graph.
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
              far-away family. 1Password and Proton run profitable subscriptions
              on the same promise.
              <Ref k="1password-arr" />
              <Ref k="proton-nonprofit" />
            </>
          ),
          meta: 'Attach ~40%',
        },
      ]}
    />
  </DeckPage>
);

const page10 = (
  <DeckPage key={12} n={12} total={TOTAL} actClass={ACT_CLASS}>
    <BigStat
      stat="600M+"
      title="Home hubs are a proven category."
      sub="600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally."
      band="In 2026, you should be able to dim your lights without notifying Jeff Bezos. Home inference (finally) makes that possible."
    >
      The AI gadget graveyard is littered with attempts to find new ways to
      interact.{' '}
      <strong>
        Instead, we&rsquo;re entering a proven category with a novel new
        architecture - already proven compelling to consumers.
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
  <DeckPage key={13} n={13} total={TOTAL} actClass={ACT_CLASS}>
    <EvidenceGrid
      title="Families already pay for this"
      sub="tonies did €630M in revenue last year. Life360 is a $4.5B public company."
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
              <Ref k="ancestry-blackstone" /> StoryWorth reports over 1M printed
              books, bootstrapped.
              <Ref k="storyworth" /> We unify the practice these products offer
              piecemeal.
            </>
          ),
        },
      ]}
    />
  </DeckPage>
);

const unitEconomicsPage = (
  <DeckPage key={14} n={14} total={TOTAL} actClass={ACT_CLASS}>
    <BigStat
      stat="2.1x"
      title="Paid back at point of sale"
      sub="Each sale covers its own customer acquisition before subscription starts."
      band="We don't rely on years of subscription to recover costs. We recover cost when the box sells."
    >
      The $200 blended cost of acquiring a customer is recovered 2.1 times over
      at the register from hardware gross profit alone. Our own plan spends less
      than that: implied acquisition cost falls from $183 in Year 2 to $137 in
      Year 5 as the installed base compounds.
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
  page8,
  contextPage,
  page12,
  page10,
  page11,
  unitEconomicsPage,
];
