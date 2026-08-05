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
  it('act 1 carries the six approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act1.tsx'), 'utf8');
    const titles = [
      'Family Intelligence',
      'The GPU is coming home',
      'Local AI finally runs on consumer hardware',
      'No one is trusted with AI in the home',
      'Intentional technology is a proven market',
      'Family Intelligence will be the first trusted brand to run local compute in the home',
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 1 carries the approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act1.tsx'), 'utf8');
    const subs = [
      'Private intelligence for the home.',
      'AI compute is moving into the house, the way the personal computer did.',
      'Open-weight models are closing the gap with the frontier.',
      "7 in 10 Americans don't trust big tech's AI. There is no Signal or Mozilla of the home.",
      'Light Phone, Daylight, Remarkable and Yoto built profitable businesses on it.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 2 carries the ten approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    const titles = [
      'Our first device is for families',
      'A family practice',
      'Family data is too sensitive for the cloud',
      'Home hubs are a proven category',
      'Families already pay for this',
      '$899 flagship, $499 companions',
      'A privacy-conscious cloud subscription',
      'A context window for the home',
      'Our prototype already works',
      'Unit economics',
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 2 carries the ten approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    const subs = [
      'High emotional value, low-risk data, and a GPU in the living room.',
      'Weekly check-ins, budgets, school, health, and the family stories.',
      '23andMe centralized it. That ended in a breach and a bankruptcy.',
      '600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally.',
      'tonies did €630M in revenue last year. Life360 is a $4.5B public company.',
      "The Apple II cost $7,000 in today's dollars. Premium first, affordable next.",
      '$9/month, optional: zero-knowledge backup, sync, and remote access.',
      'One local agent every device on the network can use.',
      'Built on a previous-generation NVIDIA Orin, by choice.',
      '110,000 devices in five years, a $9/month attach, 40%+ blended margin.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 3 carries the six approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act3.tsx'), 'utf8');
    const titles = [
      "Under the hood, we're building a silicon-to-screen stack for privacy-preserving local inference",
      'The stack',
      'The industry is moving compute to the data',
      'Privacy law triggers when data leaves the device',
      'Licensing works like Android',
      'One stack, four markets',
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 3 carries the five approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act3.tsx'), 'utf8');
    const subs = [
      'Six generic primitives, built once, reused in every product.',
      'NVIDIA, Palantir and Cohere are betting on sovereign AI.',
      'Local-first architecture is ahead of the coming AI regulation.',
      'Every Snapdragon ships a tuned Android build. Partner devices ship a tuned Harness.',
      'Families, then homes, then offices, then enterprise hardware partners.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 3 is labelled Under the Hood', () => {
    const src = readFileSync(path.join(dir, 'act3.tsx'), 'utf8');
    expect(src).toContain('III · Under the Hood');
    expect(src).not.toContain('What If It Works');
  });

  it('act 4 carries the four approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    const titles = [
      'The hard questions',
      'The team',
      'Timeline',
      "We're raising $15M",
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 4 carries the four approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    const subs = [
      'Apple, model quality, hardware risk, consent, chips, and the raise.',
      "We shipped the Light Phone, Mill's IoT stack, and USB Club.",
      'Round closes, contract manufacturer in the room, shelves by Christmas 2027.',
      'On shelves and ready to gift by Christmas 2027.',
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
      'I hate subscriptions.',
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
    expect(src).toContain('A · Appendix');
    expect(src).toContain('For the diligent reader.');
    for (const title of [
      'A1 · Stack deep-dive',
      'A2 · Competition matrix',
      'A3 · Three-year pro-forma',
      'A4 · Go-to-market detail',
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
    expect(ALL_PAGES).toHaveLength(26);
    expect(APPENDIX_PAGES).toHaveLength(6);
  });

  it('sets every chrome counter against 26 pages', () => {
    for (const [name, src] of contentFiles()) {
      expect(src, name).toMatch(/const TOTAL = 26;/);
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
