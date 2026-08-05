import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import { DiagramPage, Split } from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
const ACT = 'III · What If It Works';
const ACT_CLASS = 'deck-act-3';

const page17 = (
  <DeckPage key={17} n={17} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Split
      title="A context window for the home"
      sub="The house keeps its own memory: people, maintenance, money, goals."
      media={
        <FpoBox note="House cross-section with memory callouts: plumber, filter dates, life stages, vacation fund" />
      }
    >
      The house knows who the plumber is, when the filters were last changed,
      where each person is in life, and what the family is saving for. Today
      that memory sits in a dozen apps and one person&rsquo;s head. We keep it
      in one place, on hardware the family owns, so nobody has to hold it all. A
      home that remembers is infrastructure, not a gadget.
    </Split>
  </DeckPage>
);

const page18 = (
  <DeckPage key={18} n={18} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <DiagramPage
      title="The Home Harness"
      sub="One local agent every device on the network can use."
      media={
        <FpoBox note="Network map: hub centered, doorbell/thermostat/laptop ringed, endpoints labeled MCP · completions · RAG · ontology" />
      }
    >
      The Home Harness is the house&rsquo;s inference provider: an MCP server on
      the local network, a chat-completions endpoint, local RAG, and ontology
      lookup. The doorbell, the thermostat, and the kids&rsquo; laptop each tap
      it over Wi-Fi instead of phoning a different datacenter. The average US
      internet household already runs 17 connected devices.
      <Ref k="parks-17-devices" /> 1,200+ device types are Matter-certified.
      <Ref k="matter-1200" /> Embedded-AI chip shipments reach 4.1B a year by
      2031.
      <Ref k="abi-tinyml" /> None of them should need their own cloud.
    </DiagramPage>
  </DeckPage>
);

const page19 = (
  <DeckPage key={19} n={19} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <DiagramPage
      title="The stack"
      sub="Six generic primitives, built once, reused in every product."
      media={
        <FpoBox note="Exploded stack: TEE, local runtime, ZK backup, mirroring, P2P gossip, ontology library as lifted layers" />
      }
    >
      Six primitives sit under every product we make: a trusted execution
      environment, a zero-knowledge backup server, a mirroring server,
      peer-to-peer gossip between devices on the local network, a local
      inference runtime, and a generic ontology library. Declare a schema and
      the model extracts it, so the same stack serves families, firms, clinics,
      and newsrooms without a rewrite. We build it once and charge for it many
      times.
    </DiagramPage>
  </DeckPage>
);

const page20 = (
  <DeckPage key={20} n={20} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <Split
      flip
      title="Licensing works like Android"
      sub="Every Snapdragon ships a tuned Android build. Partner devices ship a tuned Harness."
      media={
        <FpoBox note="Snapdragon→tuned Android build ∥ partner device→tuned Harness build; margin cards QTL 72% · Dolby 88% · Arm ~$250B" />
      }
    >
      Partners ship a Home Harness distribution tuned to their silicon and form
      factor, and pay a royalty per device. Android proves the shape at 3B+
      active devices.
      <Ref k="android-3b" /> Qualcomm&rsquo;s licensing arm did $5.6B at a 72%
      pre-tax margin in FY2025.
      <Ref k="qualcomm-qtl" /> Dolby licenses at roughly 88% gross margin.
      <Ref k="dolby-licensing" /> Arm collects pennies per chip across 350B+
      chips and is worth about $250B.
      <Ref k="arm-royalty" /> Sonos, Dyson, and LG want private intelligence
      inside their devices and will never build this stack.
    </Split>
  </DeckPage>
);

const page21 = (
  <DeckPage key={21} n={21} total={TOTAL} act={ACT} actClass={ACT_CLASS}>
    <DiagramPage
      title="One stack, four markets"
      sub="Families, then homes, then offices, then enterprise hardware partners."
      media={
        <FpoBox note="Four-rung staircase (families → homes → offices → enterprise) with a bottoms-up number per rung and the shared stack drawn underneath all four" />
      }
    >
      This is one consumer hardware company and the stack underneath it, applied
      in sequence. Families first, then the whole home, then offices that need
      on-prem transcription and meeting capture, then hardware partners paying a
      royalty. Office and licensing are earned upside, gated behind the first
      device shipping. Every device we ship hardens the stack, deepens the
      ontology library, and grows the fleet a partner can point at.
    </DiagramPage>
  </DeckPage>
);

export const ACT3_PAGES: ReactNode[] = [page17, page18, page19, page20, page21];
