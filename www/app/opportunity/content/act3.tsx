import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import {
  DiagramPage,
  EvidenceGrid,
  Split,
  Statement,
} from '../components/archetypes';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 26;
const ACT_CLASS = 'deck-act-3';

const page17 = (
  <DeckPage key={16} n={16} total={TOTAL} actClass={ACT_CLASS}>
    <Statement
      splash
      title="But under the hood... we're building the software stack for private AI inference"
    />
  </DeckPage>
);

const page18 = (
  <DeckPage key={17} n={17} total={TOTAL} actClass={ACT_CLASS}>
    <DiagramPage
      title="Our stack"
      sub="A general purpose software suite for running private inference hardware devices."
      media={
        <FpoBox note="Exploded stack: TEE, local runtime, ZK backup, mirroring, P2P gossip, ontology library as lifted layers" />
      }
      bodyBlock
    >
      <p>Our core components include:</p>
      <ul className="deck-list">
        <li>Trusted execution environment (TEE)</li>
        <li>Hardware root of trust</li>
        <li>Zero-knowledge backup server</li>
        <li>p2p gossip via LAN</li>
        <li>A generic ontology library</li>
        <li>A local inference application runtime</li>
      </ul>
      <p>
        <strong>
          The go-to SDK for private inference, built on Linux &amp; written in
          Rust.
        </strong>
      </p>
    </DiagramPage>
  </DeckPage>
);

const page19 = (
  <DeckPage key={18} n={18} total={TOTAL} actClass={ACT_CLASS}>
    <EvidenceGrid
      title="The industry is moving compute to the data"
      sub="NVIDIA, Palantir and Cohere are betting on sovereign AI."
      cards={[
        {
          heading: 'NVIDIA and Palantir',
          body: (
            <>
              In October 2025 they partnered to run models where enterprise data
              sits,
              <Ref k="nvidia-palantir" /> then shipped an air-gapped
              architecture so data never leaves the building.
              <Ref k="palantir-sovereign-aios" />
            </>
          ),
        },
        {
          heading: '€10B for seven gigafactories',
          body: (
            <>
              The EU opened its call for seven sovereign AI gigafactories on
              July 30, 2026.
              <Ref k="eu-gigafactories" /> Cohere sells the same sovereignty to
              governments.
              <Ref k="cohere-sovereign" />
            </>
          ),
        },
        {
          heading: '93% of enterprises',
          body: (
            <>
              Cloudian found them repatriating or evaluating on-prem AI
              workloads in March 2026.
              <Ref k="cloudian-onprem" />{' '}
              <strong>
                The household is the last sovereign unit nobody serves.
              </strong>
            </>
          ),
        },
      ]}
    />
    <div className="mt-10">
      <FpoBox
        note="Deal timeline Oct 2025→Jul 2026 with NVIDIA/Palantir/Cohere/EU marks and dollar figures"
        aspect="6/1"
      />
    </div>
  </DeckPage>
);

const page20 = (
  <DeckPage key={19} n={19} total={TOTAL} actClass={ACT_CLASS}>
    <DiagramPage
      title="Local AI side-steps future regulation"
      sub="The cloud providers will be regulated, but our architecture is immune."
      media={
        <FpoBox note="House with a drawn trust-boundary line; HIPAA/COPPA/GDPR arrows triggering only where data crosses it" />
      }
    >
      COPPA turns on gathering a child&rsquo;s information.
      <Ref k="coppa-definition" /> GDPR exempts a family&rsquo;s own use of its
      data.
      <Ref k="gdpr-household" />{' '}
      <strong>Data that never leaves the device rarely triggers either.</strong>{' '}
      The wall keeps rising: COPPA compliance April 2026,
      <Ref k="coppa-amended" /> EU AI Act transparency August 2026,
      <Ref k="eu-ai-act-enforcement" /> California age signals by 2027.
      <Ref k="ab1043" />
    </DiagramPage>
  </DeckPage>
);

const page21 = (
  <DeckPage key={20} n={20} total={TOTAL} actClass={ACT_CLASS}>
    <Split
      flip
      title="Licensing works like Android"
      sub="Every Snapdragon ships a tuned Android build. Partner devices ship a tuned Harness."
      media={
        <FpoBox note="Snapdragon→tuned Android build ∥ partner device→tuned Harness build; margin cards QTL 72% · Dolby 88% · Arm ~$250B" />
      }
    >
      Partners pay a royalty per device. Android proves the shape at 3B+ active
      devices.
      <Ref k="android-3b" /> Qualcomm&rsquo;s licensing arm did $5.6B at a 72%
      pre-tax margin.
      <Ref k="qualcomm-qtl" />{' '}
      <strong>Sonos, Dyson, and LG will never build this stack.</strong>
    </Split>
  </DeckPage>
);

const page22 = (
  <DeckPage key={21} n={21} total={TOTAL} actClass={ACT_CLASS}>
    <DiagramPage
      title="Our stack, running everywhere"
      sub="Families, then homes, then offices, then enterprise hardware partners."
      media={
        <FpoBox note="Four-rung staircase (families → homes → offices → enterprise) with a bottoms-up number per rung and the shared stack drawn underneath all four" />
      }
    >
      This is one consumer hardware company and the stack underneath it.{' '}
      <strong>
        Office and licensing are earned upside, gated behind the first device
        shipping.
      </strong>{' '}
      Every device we ship hardens the stack and grows the fleet a partner can
      point at.
    </DiagramPage>
  </DeckPage>
);

export const ACT3_PAGES: ReactNode[] = [
  page17,
  page18,
  page19,
  page20,
  page21,
  page22,
];
