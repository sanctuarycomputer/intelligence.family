import type { ReactNode } from 'react';
import DeckPage from '../components/DeckPage';
import FpoBox from '../components/FpoBox';
import { Statement } from '../components/archetypes';
import { orderedReferences } from './references';

// Kept local so this module never imports ./index (which imports this file).
const TOTAL = 26;
// Appendix pages continue the page ids past the core deck, but the footer
// counter stays unnumbered so nobody reads them as pages 27 of 26.
const FIRST = TOTAL + 1;
const STUB_BODY = 'Detail follows in the investor-ready revision.';

const splashPage = (
  <DeckPage key={FIRST} n={FIRST} total={TOTAL}>
    <Statement splash title="Appendix" sub="For the diligent reader." />
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
  <DeckPage key={FIRST + 1 + i} n={FIRST + 1 + i} total={TOTAL}>
    <Statement title={stub.title}>{STUB_BODY}</Statement>
    <div className="mt-10">
      <FpoBox note={stub.note} />
    </div>
  </DeckPage>
));

const sourcesPage = (
  <DeckPage
    key={FIRST + 1 + STUBS.length}
    n={FIRST + 1 + STUBS.length}
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
  ...stubPages,
  sourcesPage,
];
