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
const TOTAL = 26;
const ACT = 'II · The Wedge';
const ACT_CLASS = 'deck-act-2';

const page7 = (
  <DeckPage key={7} n={7} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Statement
      title="Our first device is for families"
      sub="High emotional value, low-risk data, and a GPU in the living room."
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
  <DeckPage key={8} n={8} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Split
      flip
      title="A family practice"
      sub="Weekly check-ins, budgets, school, health, and the family stories."
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

const page9 = (
  <DeckPage key={9} n={9} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Split
      title="Family data is too sensitive for the cloud"
      sub="23andMe centralized it. That ended in a breach and a bankruptcy."
      media={
        <FpoBox note="23andMe collapse timeline ($6B → breach → Chapter 11 → $305M); inset: Jan 2026 court-order headline" />
      }
    >
      23andMe went from a $6B peak to Chapter 11, and its database sold for
      $305M.
      <Ref k="23andme-sale" /> A breach had already exposed 6.9M people&rsquo;s
      genetic data.
      <Ref k="23andme-breach" />{' '}
      <strong>No backend to misconfigure, no log to subpoena.</strong>
    </Split>
  </DeckPage>
);

const page10 = (
  <DeckPage key={10} n={10} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <BigStat
      stat="600M+"
      title="Home hubs are a proven category"
      sub="600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally."
    >
      The AI gadget graveyard died inventing new ways to interact.{' '}
      <strong>We enter a proven category with a different architecture.</strong>{' '}
      Alexa is at that number.
      <Ref k="alexa-600m" /> OpenAI paid $6.5B for Jony Ive&rsquo;s startup,
      <Ref k="openai-io" /> Amazon bought Bee,
      <Ref k="bee-amazon" /> Meta bought Limitless,
      <Ref k="limitless-meta" /> all of it in someone else&rsquo;s cloud.
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
  <DeckPage key={11} n={11} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
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
              <Ref k="storyworth" /> We unify the practice these products serve
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
  <DeckPage key={12} n={12} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Ledger
      title="$899 flagship, $499 companions"
      sub="The Apple II cost $7,000 in today's dollars. Premium first, affordable next."
      rows={[
        {
          label: 'Apple II, 1977',
          value: (
            <>
              $1,298 new, about $7,000 today
              <Ref k="apple2-price" />
            </>
          ),
        },
        {
          label: 'A usable IBM PC, 1981',
          value: (
            <>
              roughly $11,000 today
              <Ref k="ibm-pc-price" />
            </>
          ),
        },
        {
          label: 'Macintosh, 1984',
          value: (
            <>
              $2,495 new, about $8,000 today
              <Ref k="mac-price" />
            </>
          ),
        },
        { label: 'Our flagship, with GPU and home server', value: '$899' },
        { label: 'Companion devices', value: '$499' },
      ]}
    />
    <p className="mt-14 max-w-2xl">
      Premium entry prices did not cap the personal computer, they funded it.
      Companions join the flagship hub-and-spoke, and later spokes without GPUs
      bring the entry price down.{' '}
      <strong>It works out of the box, offline, with no account.</strong>
    </p>
    <div className="mt-10">
      <FpoBox
        note="Price ladder: Apple II ~$7,000 → Mac ~$8,000 → flagship $899 → companion $499 → future spokes, inflation-adjusted"
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

const page13 = (
  <DeckPage key={13} n={13} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <DiagramPage
      title="A privacy-conscious cloud subscription"
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

const page14 = (
  <DeckPage key={14} n={14} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <DiagramPage
      title="A context window for the home"
      sub="One local agent every device on the network can use."
      media={
        <FpoBox note="Network map: hub centered, doorbell/thermostat/laptop ringed, endpoints labeled MCP · completions · RAG · ontology" />
      }
    >
      The house knows who the plumber is and what the family is saving for.{' '}
      <strong>
        One local agent holds that memory: an MCP server on the LAN, a
        chat-completions endpoint, and local RAG.
      </strong>{' '}
      US internet households already run 17 connected devices.
      <Ref k="parks-17-devices" />
    </DiagramPage>
  </DeckPage>
);

const page15 = (
  <DeckPage key={15} n={15} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Split
      flip
      title="Our prototype already works"
      sub="Built on a previous-generation NVIDIA Orin, by choice."
      media={
        <FpoBox
          note="Prototype photo strip: device on bench, play-test stills"
          aspect="8/1"
        />
      }
    >
      Our research with Mozilla is published, with 28k+ impressions.
      <Ref k="mozilla-research" /> A tester texted us:{' '}
      <strong>
        &ldquo;So my grandma beat the odds and lived. So if y&rsquo;all can
        speed it up on the family intelligence that would be greatly
        appreciated.&rdquo;
      </strong>
    </Split>
  </DeckPage>
);

const page16 = (
  <DeckPage key={16} n={16} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Ledger
      title="Unit economics"
      sub="110,000 devices in five years, a $9/month attach, 40%+ blended margin."
      rows={[
        { label: 'Devices in five years', value: '110,000' },
        {
          label: 'Share of the 200M+ English-speaking households',
          value: '0.05%',
        },
        { label: 'Cloud subscription, optional', value: '$9 / month' },
        { label: 'Blended gross margin at scale', value: '40%+' },
      ]}
    />
    <p className="mt-14 max-w-2xl">
      <strong>
        The device is the moat and the recurring layer is the business.
      </strong>{' '}
      Plaud reached about $250M in revenue at roughly 20% margin, on 1M+ devices
      and essentially no venture capital.
      <Ref k="plaud" />
    </p>
    <div className="mt-10">
      <FpoBox
        note="The simple math stack: 110k devices + $9/mo attach → revenue; margin-path bar prototype→scale"
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

export const ACT2_PAGES: ReactNode[] = [
  page7,
  page8,
  page9,
  page10,
  page11,
  page12,
  page13,
  page14,
  page15,
  page16,
];
