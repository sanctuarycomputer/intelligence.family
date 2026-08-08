import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import {
  BigStat,
  DiagramPage,
  EvidenceGrid,
  Ledger,
  Split,
  Statement,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 21;
const ACT_CLASS = 'deck-act-2';

const page7 = (
  <DeckPage key={7} n={7} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      title="Our first device is for families"
      sub="High emotional value, sensitive data, and a GPU in the living room."
    >
      Families hold the memories worth keeping, and what a household records
      carries none of the risk a clinic or a payroll system does.{' '}
      <strong>One device, one market.</strong>
    </Statement>
    <div className="mt-10">
      <FpoBox note="Play-test photo (existing /research/moment-*.png assets)" />
    </div>
  </DeckPage>
);

const page8 = (
  <DeckPage key={8} n={8} total={TOTAL} actClass={ACT_CLASS}>
    <Split
      flip
      title="Your own family vault"
      sub="Weekly check-ins, budgets, school, health, and stories."
      media={
        <FpoBox
          note={
            "Week-strip vignette: Sunday check-in → school log → vacation fund → grandmother's story at dinner"
          }
        />
      }
    >
      <strong>The device earns its place by being useful every week.</strong>{' '}
      Then at dinner a grandmother tells the story again, and the house keeps
      her voice and her accent. The archive is one beloved feature, never the
      whole premise.
    </Split>
  </DeckPage>
);

const page10 = (
  <DeckPage key={9} n={9} total={TOTAL} actClass={ACT_CLASS}>
    <BigStat
      stat="600M+"
      title="Home hubs are a proven category."
      sub="600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally."
    >
      The AI gadget graveyard died trying inventing new ways to interact.{' '}
      <strong>
        Instead, we&rsquo;re entering a proven category with a novel new
        architecture.
      </strong>{' '}
      Alexa is at that number.
      <Ref k="alexa-600m" /> OpenAI paid $6.5B for Jony Ive&rsquo;s startup,
      <Ref k="openai-io" /> Amazon bought Bee,
      <Ref k="bee-amazon" /> Meta bought Limitless,
      <Ref k="limitless-meta" /> all of it in someone else&rsquo;s cloud.
      <br />
      <br />
      In 2026, you should be able to dim your lights without notifying Jeff
      Bezos. Home inference (finally) makes that possible.
    </BigStat>
    <div className="mt-10">
      <FpoBox
        note={
          "Install-base bars (600M Alexa / 800M Google Home); strip beneath: io $6.5B · Bee→Amazon · Limitless→Meta, all marked 'cloud'"
        }
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

const page11 = (
  <DeckPage key={10} n={10} total={TOTAL} actClass={ACT_CLASS}>
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
    <div className="mt-10">
      <FpoBox
        note="Comp cards: tonies €630M · Life360 $4.5B · Ancestry $4.7B · StoryWorth 1M books"
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

const page12 = (
  <DeckPage key={11} n={11} total={TOTAL} actClass={ACT_CLASS}>
    <DiagramPage
      title="Subscribe for peace of mind"
      sub="$9/month, optional: zero-knowledge backup, sync, and remote access."
      media={
        <FpoBox note="Hub-and-spoke sync: home devices ↔ zero-knowledge vault ↔ remote family via tunnel; $9/mo card; hotspot + private-network modes labeled" />
      }
    >
      The cloud does one thing well: encrypted backup where we hold none of the
      keys. <strong>The device works forever without it.</strong> 1Password runs
      $400M ARR.
      <Ref k="1password-arr" /> Proton is profitable on subscriptions alone.
      <Ref k="proton-nonprofit" />
    </DiagramPage>
  </DeckPage>
);

export const ACT2_PAGES: ReactNode[] = [page7, page8, page10, page11, page12];
