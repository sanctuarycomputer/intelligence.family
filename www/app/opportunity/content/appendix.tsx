import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import Ref from '../components/Ref';
import { Ledger, Split, Statement } from '../components/archetypes';
import { orderedReferences } from './references';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 21;
// Appendix pages continue the page ids past the core deck, but the footer
// counter stays unnumbered so nobody reads them as pages 27 of 26.
const FIRST = TOTAL + 1;
const STUB_BODY = 'Detail follows in the investor-ready revision.';

const splashPage = (
  <DeckPage key={FIRST} n={FIRST} total={TOTAL}>
    <Statement splash title="Appendix" />
  </DeckPage>
);

const movedUnitEconomics = (
  <DeckPage key={FIRST + 2} n={FIRST + 2} total={TOTAL}>
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
    <p className="deck-body">
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

const movedContext = (
  <DeckPage key={FIRST + 1} n={FIRST + 1} total={TOTAL}>
    <Split
      flip
      title="A context window for smart homes"
      sub="Inference for every IoT device on the network."
      media={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/opportunity/context-window-home.png"
          alt="A house cross-section: the Family Book hub on the coffee table, connected by glowing vines to the TV, thermostat, camera, laptop, phone, and speaker in every room"
          className="deck-slide-media"
        />
      }
    >
      The house knows who the plumber is and what the family is saving for.{' '}
      <strong>
        One local agent holds that memory: an MCP server on the LAN, a
        chat-completions endpoint, and local RAG.
      </strong>
      <br />
      <br />
      &rarr; US internet households already run 17 connected devices.
      <Ref k="parks-17-devices" /> Soon, they&rsquo;ll all need inference.
    </Split>
  </DeckPage>
);

const STUBS: Array<{ title: string; note: string }> = [
  {
    title: 'A1 · Stack deep-dive',
    note: 'TEE, zero-knowledge backup, mirroring, P2P gossip diagrams; ontology library (declare a schema, the model extracts it); Harness API surfaces (MCP, completions, RAG, ontology lookup)',
  },
  {
    title: 'A2 · Competition matrix',
    note: 'Cloud assistants, AI gadgets, DIY local stacks, genealogy platforms',
  },
  {
    title: 'A3 · Three-year pro-forma',
    note: 'Three-year revenue and margin ranges; detail lands when the pro-forma does',
  },
  {
    title: 'A4 · Go-to-market detail',
    note: "Waitlist → Founder's Edition → broader pre-order; DTC + curated heritage retail; US-led rollout",
  },
];

const stubPages: ReactNode[] = STUBS.map((stub, i) => (
  <DeckPage key={FIRST + 3 + i} n={FIRST + 3 + i} total={TOTAL}>
    <Statement title={stub.title}>{STUB_BODY}</Statement>
    <div className="mt-10">
      <FpoBox note={stub.note} />
    </div>
  </DeckPage>
));

const sourcesPage = (
  <DeckPage
    key={FIRST + 3 + STUBS.length}
    n={FIRST + 3 + STUBS.length}
    total={TOTAL}
  >
    <Statement title="Sources" sub="Every figure in this deck, linked." />
    <ol className="deck-sources mt-10">
      {orderedReferences().map(([key, ref], i) => (
        <li key={key}>
          {i + 1}.{' '}
          <a
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            {ref.source} · {ref.date}
          </a>
        </li>
      ))}
    </ol>
  </DeckPage>
);

export const APPENDIX_PAGES: ReactNode[] = [
  splashPage,
  movedUnitEconomics,
  movedContext,
  ...stubPages,
  sourcesPage,
];
