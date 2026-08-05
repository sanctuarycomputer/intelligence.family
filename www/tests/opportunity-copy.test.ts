import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = path.join(__dirname, '..', 'app', 'opportunity', 'content');
const contentFiles = () =>
  readdirSync(dir)
    .filter(f => f.endsWith('.tsx') || f === 'index.ts')
    .map(f => [f, readFileSync(path.join(dir, f), 'utf8')] as const);

describe('opportunity deck copy contract', () => {
  it('act 1 carries the seven approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act1.tsx'), 'utf8');
    const titles = [
      'Family Intelligence',
      'The GPU is coming home',
      'Local AI now runs on consumer hardware',
      'The industry is moving compute to the data',
      'Privacy law triggers when data leaves the device',
      'Nobody owns this category',
      'People pay for intentional technology',
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 2 carries the nine approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    const titles = [
      'Our first device is for families',
      'A family practice',
      'Families already pay for this',
      'Family data is too sensitive for the cloud',
      'Home hubs are a proven category',
      '$899 flagship, $499 companions',
      'A privacy-conscious cloud subscription',
      'The prototype already works',
      'Unit economics',
    ];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 2 carries the nine approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act2.tsx'), 'utf8');
    const subs = [
      'High emotional value, low-risk data, and a GPU in the living room.',
      'Weekly check-ins, budgets, school, health, and the family stories.',
      'tonies did €630M in revenue last year. Life360 is a $4.5B public company.',
      '23andMe centralized it. That ended in a breach and a bankruptcy.',
      '600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally.',
      "The Apple II cost $7,000 in today's dollars. Premium first, affordable next.",
      '$9/month, optional: zero-knowledge backup, sync, and remote access.',
      'Built on a previous-generation NVIDIA Orin, by choice.',
      'An $899 device, a $9/month subscription, 110,000 devices in five years.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 3 carries the five approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act3.tsx'), 'utf8');
    const titles = [
      'A context window for the home',
      'The Home Harness',
      'The stack',
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
      'The house keeps its own memory: people, maintenance, money, goals.',
      'One local agent every device on the network can use.',
      'Six generic primitives, built once, reused in every product.',
      'Every Snapdragon ships a tuned Android build. Partner devices ship a tuned Harness.',
      'Families, then homes, then offices, then enterprise hardware partners.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
    }
  });

  it('act 4 carries the three approved titles in order', () => {
    const src = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    const titles = ['The hard questions', 'The team', "We're raising $15M"];
    const idx = titles.map(t => src.indexOf(t));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('act 4 carries the three approved subtitles', () => {
    const src = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
    const subs = [
      'Apple, model quality, hardware risk, and consent.',
      "We shipped the Light Phone, Mill's IoT stack, and USB Club.",
      'On shelves and ready to gift by Christmas 2027.',
    ];
    for (const sub of subs) {
      expect(src, sub).toContain(sub);
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
    expect(src).toContain('A · For the Diligent Reader');
    for (const title of [
      'A1 · Stack deep-dive',
      'A2 · Ontology library',
      'A3 · Home Harness API surfaces',
      'A4 · Competition matrix',
      'A5 · Three-year pro-forma',
      'A6 · GTM detail',
      'A7 · Trust & risk register',
      'A8 · Extended FAQ',
      'A9 · Technical futures',
      'A10 · Timeline',
    ]) {
      expect(src, title).toContain(title);
    }
    expect(src).toContain('Sources');
    expect(src).toContain('Every figure in this deck, linked.');
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

  it('cover carries the traction strip', () => {
    const src = readFileSync(path.join(dir, 'act1.tsx'), 'utf8');
    expect(src).toContain('Working prototype');
    expect(src).toContain('Published research with Mozilla');
    expect(src).toContain('Direct Foxconn relationships');
  });
});
