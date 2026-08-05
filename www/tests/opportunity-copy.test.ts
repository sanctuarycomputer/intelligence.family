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
