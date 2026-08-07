import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import {
  CardsPage,
  DiagramPage,
  EvidenceGrid,
  Ledger,
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

const stackArt = (label: string) => (
  <span className="deck-card-art-fpo">{label}</span>
);

const page18 = (
  <DeckPage key={17} n={17} total={TOTAL} actClass={ACT_CLASS}>
    <CardsPage
      columns={3}
      title="Our stack"
      sub="A general purpose software suite for running private inference hardware devices."
      cards={[
        {
          heading: 'Trusted execution environment',
          art: stackArt('TEE png'),
          body: (
            <>
              Keys and models run in hardware-isolated memory. Even a
              compromised OS cannot read them.
            </>
          ),
        },
        {
          heading: 'Family trust anchor',
          art: stackArt('anchor png'),
          body: (
            <>
              The flagship holds the family&rsquo;s root keys. Companions derive
              their trust from it, and nothing decrypts without it.
            </>
          ),
        },
        {
          heading: 'Zero-knowledge backup server',
          art: stackArt('vault png'),
          body: (
            <>
              Encrypted archives we cannot open. The keys never leave the home.
            </>
          ),
        },
        {
          heading: 'p2p gossip via LAN',
          art: stackArt('mesh png'),
          body: (
            <>
              Devices find and sync with each other over the local network, no
              cloud in the loop.
            </>
          ),
        },
        {
          heading: 'Generic ontology library',
          art: stackArt('graph png'),
          body: (
            <>
              Declare a schema and the model extracts it: people, places,
              recipes, goals.
            </>
          ),
        },
        {
          heading: 'Local inference runtime',
          art: stackArt('runtime png'),
          body: (
            <>
              Schedules models on the GPU and serves every app and device in the
              house.
            </>
          ),
        },
      ]}
    />
    <p className="deck-body">
      <strong>
        The go-to SDK for private inference, built on Linux &amp; written in
        Rust.
      </strong>
    </p>
  </DeckPage>
);

const page22 = (
  <DeckPage key={18} n={18} total={TOTAL} actClass={ACT_CLASS}>
    <Ledger
      wide
      title="Our stack, running everywhere"
      sub="Families, then homes, then offices, then enterprise hardware partners."
      rows={[
        {
          label: (
            <>
              <strong>Families & The Home</strong>
              <span className="deck-ledger-note">
                The wedge: one hub per household, companions on every shelf
              </span>
            </>
          ),
          value: <span className="deck-tam">~$130B</span>,
        },
        {
          label: (
            <>
              <strong>Office & On-Prem</strong>
              <span className="deck-ledger-note">
                Meeting capture and document intelligence that never leaves the
                building
              </span>
            </>
          ),
          value: <span className="deck-tam">~$40B</span>,
        },
        {
          label: (
            <>
              <strong>Healthcare & Clinics</strong>
              <span className="deck-ledger-note">
                Clinical scribes and dictation where patient data stays in the
                practice
              </span>
            </>
          ),
          value: <span className="deck-tam">~$30B</span>,
        },
        {
          label: (
            <>
              <strong>Biometrics & Wearables</strong>
              <span className="deck-ledger-note">
                Health signals inferred on the device, not in a vendor cloud
              </span>
            </>
          ),
          value: <span className="deck-tam">~$90B</span>,
        },
        {
          label: (
            <>
              <strong>Legal & Financial Back Office</strong>
              <span className="deck-ledger-note">
                Privileged review and reconciliation behind the firewall
              </span>
            </>
          ),
          value: <span className="deck-tam">~$25B</span>,
        },
        {
          label: (
            <>
              <strong>Government & Defense</strong>
              <span className="deck-ledger-note">
                Air-gapped inference for the people who cannot use cloud AI
              </span>
            </>
          ),
          value: <span className="deck-tam">~$50B</span>,
        },
        {
          label: (
            <>
              <strong>Agriculture & Industrial</strong>
              <span className="deck-ledger-note">
                Edge models on equipment, far from reliable connectivity
              </span>
            </>
          ),
          value: <span className="deck-tam">~$60B</span>,
        },
        {
          label: (
            <>
              <strong>Schools & Childcare</strong>
              <span className="deck-ledger-note">
                Learning tools that keep children&rsquo;s data inside the school
              </span>
            </>
          ),
          value: <span className="deck-tam">~$20B</span>,
        },
        {
          label: (
            <>
              <strong>Enterprise & Partnerships</strong>
              <span className="deck-ledger-note">
                Our stack licensed inside other brands&rsquo; hardware
              </span>
            </>
          ),
          value: <span className="deck-tam">~$95B</span>,
        },
      ]}
    />
    <p className="deck-caption-note">
      Directional market estimates; sourced detail in the appendix pro-forma.
    </p>
  </DeckPage>
);

const page19 = (
  <DeckPage key={19} n={19} total={TOTAL} actClass={ACT_CLASS}>
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
  <DeckPage key={20} n={20} total={TOTAL} actClass={ACT_CLASS}>
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
  <DeckPage key={21} n={21} total={TOTAL} actClass={ACT_CLASS}>
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

export const ACT3_PAGES: ReactNode[] = [
  page17,
  page18,
  page22,
  page19,
  page20,
  page21,
];
