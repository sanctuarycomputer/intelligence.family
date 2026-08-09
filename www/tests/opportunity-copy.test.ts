import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ALL_PAGES, APPENDIX_PAGES } from '../app/opportunity/content';
import { REFERENCES } from '../app/opportunity/content/references';

const dir = path.join(__dirname, '..', 'app', 'opportunity', 'content');
// Every content file is deck copy, except the citation registry: its section
// comments legitimately use em dashes.
const contentFiles = () =>
  readdirSync(dir)
    .filter(f => f !== 'references.ts')
    .map(f => [f, readFileSync(path.join(dir, f), 'utf8')] as const);

describe('opportunity deck copy contract', () => {
  it('act 1 carries the seven approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act1.tsx'), 'utf8');
    const titles = [
      // Cover wordmark carries the homepage's tight-space span between words.
      'Family<span className="tracking-[-0.1em]"> </span>Intelligence',
      'Local AI (finally) runs on consumer hardware',
      'The GPU is coming home',
      "7 in 10 Americans don't trust big tech's AI",
      "The most valuable context is what you'll never upload",
      'Local architecture changes the story',
      'Family Intelligence will be the first trusted brand to run local inference in the home',
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 1 carries the approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act1.tsx'), 'utf8');
    const subs = [
      'AI that runs in your home, your office, your hand.',
      'The home holds the richest, longest-running, highest-signal context any AI could use.',
      'starting with families.',
      'AI compute is moving into the house, the way the personal computer did.',
      'Open models are just months behind the best.',
      "But today, there's no alternative.",
      'friend.com was panned',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 2 carries the seven approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    const titles = [
      'Our first device is for families',
      'Your own family vault',
      'A context window for smart homes',
      'One device becomes a family of them',
      'Home hubs are a proven category.',
      'Families already pay for this',
      'Paid back at point of sale',
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 2 carries the seven approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    const subs = [
      'High emotional value, sensitive data, and a GPU in the living room.',
      'Weekly check-ins, budgets, school, health, and stories.',
      'Inference for every IoT device on the network.',
      '600M+ Alexa devices sold, all of them cloud-dependent.',
      'tonies did €630M in revenue last year. Life360 is a $4.5B public company.',
      'Each flagship earns $418 of gross profit on an $899 price.',
      'The flagship device ships first, and every future SKU runs the same (evolving) stack.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 3 carries the five approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act3.tsx'), 'utf8');
    const titles = [
      "But under the hood... we're building the canonical stack for private AI inference",
      'Private AI is becoming crucial for businesses',
      'Our stack',
      'The Android OS for Local AI',
      'Our platform is a compounding business',
    ];
    // The Android title deliberately repeats, so scan forward from the
    // previous match instead of using absolute indexOf positions.
    let pos = -1;
    for (const title of titles) {
      pos = src.indexOf(title, pos + 1);
      expect(pos, title).toBeGreaterThan(-1);
    }
  });

  it('act 3 carries the five approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act3.tsx'), 'utf8');
    const subs = [
      'The go-to SDK for private inference, built on Linux',
      'Today, there is no purpose made privacy stack for running local models.',
      'We expect three key ways partners will integrate our software.',
      'Google bought Android in 2005 for ~$50 million.',
      'What will the canonical infrastructure for private AI be valued at',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 3 is labelled Under the Hood', () => {
    // The act label now lives in content/index.ts (PAGE_META), not act3.tsx.
    const src = readFileSync(path.join(dir, 'index.ts'), 'utf8');
    expect(src).toContain('III · Under the Hood');
    expect(src).not.toContain('What If It Works');
  });

  it('act 4 carries the five approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    const titles = [
      "We've spent our careers deploying novel hardware, low level infrastructure and custom operating systems",
      'The team',
      'The hard questions',
      'title="Timeline"',
      "We're raising $15M",
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 4 carries the four approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    const subs = [
      'Competition, model quality, hardware risk, consent, chips, and the raise.',
      "We shipped the Light Phone, Mill's IoT stack, and USB Club.",
      'Round closes, contract manufacturer in the room, shelves by Christmas 2027.',
      'Shipping out and ready to gift by Christmas 2027.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('lays the hard questions out as nine three-column cards', () => {
    const src = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    expect(src).toContain('columns={3}');
    for (const heading of [
      'Why this raise size?',
      'Consumers hate subscriptions.',
      'How will you compete for AI chips?',
    ]) {
      expect(src, heading).toContain(heading);
    }
  });

  it('asks for $15M exactly once across the deck, on the ask page', () => {
    const all = contentFiles()
      .map(([, s]) => s)
      .join('\n');
    expect(all.match(/\$15M/g)).toHaveLength(1);
    const act4 = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    expect(act4).toContain("We're raising $15M");
  });

  it('renders a sources page from the registry', () => {
    const src = readFileSync(path.join(dir, 'appendix.tsx'), 'utf8');
    expect(src).toContain('orderedReferences');
  });

  it('stubs every appendix page under the quiet act label', () => {
    const src = readFileSync(path.join(dir, 'appendix.tsx'), 'utf8');
    // The act label now lives in content/index.ts (PAGE_META), not appendix.tsx.
    const index = readFileSync(path.join(dir, 'index.ts'), 'utf8');
    expect(index).toContain('A · Appendix');
    for (const title of [
      'A1 · Revenue model',
      'A2 · Base case',
      'A3 · Scenarios',
      'A4 · Model methodology',
      'A5 · Stack deep-dive',
      'A6 · Competition matrix',
      'A7 · Go-to-market detail',
      'A8 · Sources',
    ]) {
      expect(src, title).toContain(title);
    }
    expect(src).toContain('Sources');
    expect(src).toContain('Every figure in this deck, linked.');
  });

  it('renders the sources list in three columns so it fits one viewport', () => {
    const src = readFileSync(path.join(dir, 'appendix.tsx'), 'utf8');
    expect(src).toContain('deck-sources');
    const css = readFileSync(
      path.join(__dirname, '..', 'app', 'opportunity', 'opportunity.css'),
      'utf8'
    );
    expect(css).toMatch(/\.deck-sources\s*\{[^}]*column-count/);
    expect(css).toContain('column-count: 3');
  });

  it('act 2 never states the raise amount', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    expect(src).not.toMatch(/\$15M/);
  });

  it('deck copy contains no em dashes', () => {
    for (const [name, src] of contentFiles()) {
      expect(src.includes('—'), name).toBe(false);
    }
  });

  it('exports 26 core pages and 6 appendix pages', () => {
    expect(ALL_PAGES).toHaveLength(24);
    expect(APPENDIX_PAGES).toHaveLength(9);
  });

  it('sets every chrome counter against 24 pages', () => {
    for (const [name, src] of contentFiles()) {
      expect(src, name).toMatch(/const TOTAL = 24;/);
    }
  });

  it('bolds one lead fragment per body', () => {
    for (const file of ['act1.tsx', 'act2.tsx', 'act3.tsx', 'act4.tsx']) {
      const src = readFileSync(path.join(dir, file), 'utf8');
      expect(src.includes('<strong>'), file).toBe(true);
    }
  });

  it('every cited reference key exists in the registry', () => {
    const pattern = /<Ref k="([a-z0-9-]+)"/g;
    for (const [name, src] of contentFiles()) {
      for (const match of src.matchAll(pattern)) {
        const key = match[1];
        expect(REFERENCES, `${name}: <Ref k="${key}" />`).toHaveProperty(key);
      }
    }
  });
});

describe('opportunity gate contract', () => {
  const client = () =>
    readFileSync(
      path.join(__dirname, '..', 'app', 'opportunity', 'OpportunityClient.tsx'),
      'utf8'
    );

  it('gates with the opportunity source constant and page slug', () => {
    expect(client()).toContain('OPPORTUNITY_GATE_SOURCE');
    expect(client()).toContain('page="opportunity"');
    expect(client()).toContain('fi_opportunity_unlocked_v1');
  });

  it('is noindexed', () => {
    const layout = readFileSync(
      path.join(__dirname, '..', 'app', 'opportunity', 'layout.tsx'),
      'utf8'
    );
    expect(layout).toMatch(/index:\s*false/);
  });
});
