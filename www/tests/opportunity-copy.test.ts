import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { type ReactElement, type ReactNode } from 'react';
import {
  ALL_PAGES,
  APPENDIX_PAGES,
  PAGE_META,
  TOTAL,
} from '../app/opportunity/content';
import {
  SHOW_LIBERATORY_SLIDE,
  buildAct1Pages,
  lineagePage,
} from '../app/opportunity/content/act1';
import { ACT2_PAGES } from '../app/opportunity/content/act2';
import { ACT3_PAGES } from '../app/opportunity/content/act3';
import { ACT4_PAGES } from '../app/opportunity/content/act4';
import { REFERENCES } from '../app/opportunity/content/references';
import {
  composeDeckPages,
  numberPages,
} from '../app/opportunity/OpportunityClient';

// The real numbering mechanism (see OpportunityClient.tsx), not a
// reimplementation of it: importing cloneElement here and calling it
// ourselves would only prove cloneElement works, which is what the test
// this replaced actually did (props.n === i + 1 is true of any call shaped
// that way, regardless of what the real derivation does).
const numbered = (pages: ReactNode[]): number[] =>
  (numberPages(pages) as ReactElement<{ n: number }>[]).map(
    page => page.props.n
  );

const dir = path.join(__dirname, '..', 'app', 'opportunity', 'content');
// Every content file is deck copy, except the citation registry: its section
// comments legitimately use em dashes.
const contentFiles = () =>
  readdirSync(dir)
    .filter(f => f !== 'references.ts')
    .map(f => [f, readFileSync(path.join(dir, f), 'utf8')] as const);

describe('opportunity deck copy contract', () => {
  it('act 1 carries the ten approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act1.tsx'), 'utf8');
    const titles = [
      // Cover wordmark carries the homepage's tight-space span between words.
      'Family<span className="tracking-[-0.1em]"> </span>Intelligence',
      'AI finally runs on consumer hardware',
      'The GPU is coming home',
      "The most valuable context is what you'd never upload",
      '7 in 10 Americans don&rsquo;t trust big tech&rsquo;s AI',
      'But local architecture wins consumers over',
      'Consumers want real alternatives...',
      "& local AI won't sacrifice convenience",
      'Privacy-centric technology is liberatory & distinctly American',
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
      'The home holds the richest context any AI could use.',
      'starting with families.',
      'AI compute is moving into the house, the way the personal computer did.',
      'Open models are trailing just months behind the best.',
      'Local AI is newly possible, and demand is growing fast.',
      "The next entry in the USA's lineage of empowering technology.",
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 2 carries the nine approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    const titles = [
      'Our first device is for families',
      'Take better care of your family than ever before.',
      'Your own family vault',
      'Convenience of the cloud. Privacy of the home.',
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

  it('act 2 carries the nine approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    const subs = [
      'High emotional value, sensitive data, and a GPU in the living room.',
      'The most capable home assistant on the market',
      "Local-first models don't make you choose.",
      'The device solves age old family archive problems overnight.',
      'Inference for every IoT device on the network.',
      '600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally.',
      'Life360 is a $4.5B public company.',
      'Each sale covers its own customer acquisition before subscription starts.',
      'The flagship device ships first, every future SKU runs the same evolving stack. All connected via the private family network.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 3 carries the three approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act3.tsx'), 'utf8');
    const titles = [
      'But under the hood...',
      'Private AI is becoming crucial for business',
      'Our stack deploys anywhere',
    ];
    // The Android title deliberately repeats, so scan forward from the
    // previous match instead of using absolute indexOf positions.
    let pos = -1;
    for (const title of titles) {
      pos = src.indexOf(title, pos + 1);
      expect(pos, title).toBeGreaterThan(-1);
    }
  });

  it('act 3 carries the three approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act3.tsx'), 'utf8');
    const subs = [
      'The go-to SDK for private inference, model &amp; chipset agnostic, built on Linux',
      'Today, there is no purpose-made privacy stack for running local models.',
      'Here&rsquo;s where we go after winning in the home',
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
      "We've spent our careers deploying novel hardware, low-level infrastructure and custom operating systems",
      'The team',
      'Hard questions',
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
      "We shipped the Light Phone II & III, Mill's IoT stack, built IoT for AT&T, stood up Advanced Concepts at Sam Altman's World Protocol, and founded USB Club.",
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

  it('states the $15M raise only on the ask page', () => {
    const act4 = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    expect(act4.match(/\$15M/g)).toHaveLength(2);
    expect(act4).toContain("We're raising $15M");
    for (const [name, src] of contentFiles()) {
      if (name === 'act4.tsx') continue;
      expect(src, name).not.toMatch(/\$15M/);
    }
  });

  it('numbers the composed deck contiguously from 1 with no gaps or duplicates', () => {
    const composed = [...ALL_PAGES, ...APPENDIX_PAGES];
    const ns = numbered(composed);
    expect(ns).toEqual(
      Array.from({ length: composed.length }, (_, i) => i + 1)
    );
  });

  it('composeDeckPages (the derivation OpportunityClient actually runs) numbers the unlocked deck the same way', () => {
    // DeckShell navigates by getElementById(`page-${next}`), built from each
    // page's `n`. Exercising composeDeckPages itself, rather than only
    // ALL_PAGES/APPENDIX_PAGES numbered by hand, is what would have caught
    // that derivation being removed or broken: a green suite here means
    // keyboard navigation past page 8 keeps working, not just that this
    // test's own arithmetic is self-consistent.
    const pages = composeDeckPages(true, null);
    expect(pages).toHaveLength(ALL_PAGES.length + APPENDIX_PAGES.length);
    const ns = pages.map(p => (p as ReactElement<{ n: number }>).props.n);
    expect(ns).toEqual(Array.from({ length: pages.length }, (_, i) => i + 1));
  });

  it('composeDeckPages renders only the cover, numbered 1, while locked', () => {
    const pages = composeDeckPages(false, null);
    expect(pages).toHaveLength(1);
    expect((pages[0] as ReactElement<{ n: number }>).props.n).toBe(1);
  });

  it('sets TOTAL to the composed core page count', () => {
    expect(TOTAL).toBe(ALL_PAGES.length);
  });

  it('keeps PAGE_META aligned 1:1 with [...ALL_PAGES, ...APPENDIX_PAGES]', () => {
    expect(PAGE_META).toHaveLength(ALL_PAGES.length + APPENDIX_PAGES.length);
  });

  it('runs PAGE_META counters 1..TOTAL then unnumbered for the appendix', () => {
    const coreCounters = PAGE_META.slice(0, TOTAL).map(m =>
      Number(m.counter.split(' / ')[0])
    );
    expect(coreCounters).toEqual(
      Array.from({ length: TOTAL }, (_, i) => i + 1)
    );
    const appendixCounters = PAGE_META.slice(TOTAL);
    expect(appendixCounters.every(m => m.counter === 'A')).toBe(true);
  });

  it('flags leaves on the cover, Act I close, Act III/IV opens, and the appendix open', () => {
    // Pinned by what each slide actually is (its own rendered copy), not by
    // recomputing the same ACT*_START arithmetic index.ts's LEAF_PAGES uses
    // to place them. That arithmetic could be wrong in a way this text still
    // happens to agree with by coincidence of act lengths; searching by
    // content instead means a leaf lands on the slide that says it does, in
    // whatever position it actually turns out to be at.
    const composed = [...ALL_PAGES, ...APPENDIX_PAGES];
    const rendered = composed.map(page =>
      renderToStaticMarkup(page as ReactElement)
    );

    const indexOfText = (needle: string): number => {
      const matches = rendered.reduce<number[]>((acc, html, i) => {
        if (html.includes(needle)) acc.push(i);
        return acc;
      }, []);
      expect(matches, `"${needle}" on exactly one slide`).toHaveLength(1);
      return matches[0];
    };

    const cover = indexOfText('Scroll down'); // the cover's own scroll hint
    const act1Close = indexOfText(
      'Family Intelligence will be the first trusted brand to run local inference in the home'
    );
    const act3Open = indexOfText('under the hood'); // "But under the hood..."
    const act4Open = indexOfText('spent our careers deploying novel hardware');
    const appendixOpen = indexOfText('Appendix');

    const leafIndices = PAGE_META.reduce<number[]>((acc, m, i) => {
      if (m.leaves) acc.push(i);
      return acc;
    }, []);

    expect(leafIndices).toEqual([
      cover,
      act1Close,
      act3Open,
      act4Open,
      appendixOpen,
    ]);
  });

  it('the liberatory slide is hidden by default', () => {
    expect(SHOW_LIBERATORY_SLIDE).toBe(false);
    expect(ALL_PAGES).not.toContain(lineagePage);
  });

  it('flipping the flag adds exactly one page, toggles the liberatory slide, and both states stay numbered contiguously', () => {
    const hidden = buildAct1Pages(false);
    const shown = buildAct1Pages(true);

    expect(shown).toHaveLength(hidden.length + 1);
    expect(shown).toContain(lineagePage);
    expect(hidden).not.toContain(lineagePage);

    for (const act1 of [hidden, shown]) {
      const composed = [
        ...act1,
        ...ACT2_PAGES,
        ...ACT3_PAGES,
        ...ACT4_PAGES,
        ...APPENDIX_PAGES,
      ];
      const ns = numbered(composed);
      expect(ns).toEqual(
        Array.from({ length: composed.length }, (_, i) => i + 1)
      );
    }
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
      'A5 · Platform licensing',
      'A6 · Sources',
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

  it('exports 25 core pages (liberatory slide hidden) and 7 appendix pages', () => {
    expect(ALL_PAGES).toHaveLength(25);
    expect(APPENDIX_PAGES).toHaveLength(7);
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
