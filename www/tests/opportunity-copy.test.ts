import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = path.join(__dirname, '..', 'app', 'opportunity', 'content');
const contentFiles = () =>
  readdirSync(dir)
    .filter(f => f.endsWith('.tsx'))
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
