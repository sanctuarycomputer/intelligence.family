import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import { Statement } from '../components/archetypes';
import { orderedReferences } from './references';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 24;
const ACT = 'A · For the Diligent Reader';
// Appendix pages continue the page ids past the core deck, but the footer
// counter stays unnumbered so nobody reads them as pages 25 of 24.
const FIRST = TOTAL + 1;
const COUNTER = 'A';
const STUB_BODY = 'Detail follows in the investor-ready revision.';

const STUBS: Array<{ title: string; note: string }> = [
  {
    title: 'A1 · Stack deep-dive',
    note: 'TEE, zero-knowledge backup, mirroring server, P2P gossip diagrams',
  },
  {
    title: 'A2 · Ontology library',
    note: 'Declare a schema, the model extracts it across every vertical',
  },
  {
    title: 'A3 · Home Harness API surfaces',
    note: 'MCP server, chat-completions endpoint, RAG, ontology lookup',
  },
  {
    title: 'A4 · Competition matrix',
    note: 'Cloud assistants, AI gadgets, DIY local stacks, genealogy platforms',
  },
  {
    title: 'A5 · Three-year pro-forma',
    note: 'Three-year pro-forma (in progress)',
  },
  {
    title: 'A6 · GTM detail',
    note: "Waitlist → Founder's Edition → broader pre-order; DTC + curated heritage retail; US-led rollout",
  },
  {
    title: 'A7 · Trust & risk register',
    note: "Irreversible trust violations list, consent-first capture, children's data, regulatory mechanics",
  },
  {
    title: 'A8 · Extended FAQ',
    note: 'Raise size, subscriptions, industrial design maturity, chip supply',
  },
  {
    title: 'A9 · Technical futures',
    note: 'Family podcast, multimodal capture, cross-generational Q&A, heirloom integration',
  },
  { title: 'A10 · Timeline', note: 'Phase timeline by quarter' },
];

const stubPages: ReactNode[] = STUBS.map((stub, i) => (
  <DeckPage
    key={FIRST + i}
    n={FIRST + i}
    total={TOTAL}
    act={ACT}
    counter={COUNTER}
  >
    <Statement title={stub.title}>{STUB_BODY}</Statement>
    <div className="mt-10">
      <FpoBox note={stub.note} />
    </div>
  </DeckPage>
));

const sourcesPage = (
  <DeckPage
    key={FIRST + STUBS.length}
    n={FIRST + STUBS.length}
    total={TOTAL}
    act={ACT}
    counter={COUNTER}
  >
    <Statement title="Sources" sub="Every figure in this deck, linked." />
    <ol className="mt-10 grid md:grid-cols-2 gap-x-10 gap-y-1 text-sm">
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

export const APPENDIX_PAGES: ReactNode[] = [...stubPages, sourcesPage];
