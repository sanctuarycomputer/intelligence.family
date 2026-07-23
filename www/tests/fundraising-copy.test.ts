import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) =>
  readFileSync(path.join(__dirname, '..', rel), 'utf8');

const page = read('app/fundraising/FundraisingClient.tsx');
const layout = read('app/fundraising/layout.tsx');

describe('fundraising page copy contract', () => {
  it('has no dateline', () => {
    expect(page).not.toMatch(/August · September/);
  });

  it('is titled Investor Preview (mailto subject may still say Investor Memo)', () => {
    expect(page).toContain('Investor Preview');
    // Plain-text "Investor Memo" (with a space) is gone; the mailto subject
    // uses "Investor%20Memo", which this regex cannot match.
    expect(page).not.toMatch(/Investor Memo/);
  });

  it('has no $25M or raise range anywhere', () => {
    expect(page).not.toMatch(/25M/);
    expect(layout).not.toMatch(/25M/);
  });

  it('hero contains no raise ask', () => {
    expect(page.indexOf('<header')).toBeGreaterThan(-1);
    const hero = page.slice(page.indexOf('<header'), page.indexOf('</header>'));
    expect(hero).not.toMatch(/raising/i);
    expect(hero).not.toMatch(/\$1?5M/);
  });

  it('names the team', () => {
    expect(page).toContain('Hugh Francis');
    expect(page).toContain('Yatú Pelaez-Espinosa');
    // Source uses an HTML entity for the apostrophe (O&rsquo;Hagan)
    expect(page).toMatch(/Norm O.{0,8}Hagan/);
  });

  it('does not claim the agency in past tense', () => {
    expect(page).not.toMatch(/\bran\b.*agency/i);
    expect(page).toMatch(/oversees/);
  });

  it('follows the pitch arc section order', () => {
    const order = [
      'The Context',
      'Our First Device',
      'Why This Wins',
      'Who We Are',
      'The Ask',
      'Clarifications',
    ];
    const idx = order.map(t => page.indexOf(`title="${t}"`));
    expect(idx.every(i => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(page).not.toContain('Business Concept');
    expect(page).not.toContain('Our Experience');
  });

  it('asks for $15M exactly once, in The Ask section', () => {
    expect(page.match(/\$15M/g)).toHaveLength(1);
    expect(page.indexOf('$15M')).toBeGreaterThan(
      page.indexOf('title="The Ask"')
    );
  });

  it('gates from Our First Device onward; The Context is public', () => {
    const gateStart = page.indexOf('/* ===== Email gate');
    expect(page.indexOf('title="The Context"')).toBeLessThan(gateStart);
    expect(page.indexOf('title="Our First Device"')).toBeGreaterThan(gateStart);
    expect(page.indexOf('title="Clarifications"')).toBeGreaterThan(gateStart);
  });

  it('opens on the category-creation lane', () => {
    expect(page).toMatch(/newly possible category of\s+computing/);
  });

  it('cites verified category proof', () => {
    expect(page).toMatch(/tonies/i);
    expect(page).toContain('Yoto');
    expect(page).toContain('630');
    expect(page).toContain('86%');
    expect(page).toContain('95M');
    expect(page).toContain('in 2024');
  });

  it('has stage-1 economics only (no model outputs)', () => {
    expect(page).toContain('$899');
    expect(page).toContain('$9/month');
    expect(page).toContain('110,000');
    expect(page).not.toMatch(/52\.5|2\.7x|LTV/);
  });

  it('renders the trajectory diagram as a Figma embed', () => {
    expect(page).toContain(
      'https://embed.figma.com/board/CXl5xhLZOzBHkGiz8CgCUh'
    );
    expect(page).toMatch(/loading="lazy"/);
  });
});

describe('clarifications content contract', () => {
  const md = read('app/fundraising/clarifications.md');

  it('covers the four investor objections', () => {
    const questions = md.match(/^## .+$/gm) ?? [];
    expect(questions.length).toBeGreaterThanOrEqual(4);
    expect(md).toMatch(/\$899|price/i);
    expect(md).toMatch(/subscription/i);
    expect(md).toMatch(/narrow|niche|memory/i);
    expect(md).toMatch(/industrial design/i);
  });

  it('never repeats the raise ask', () => {
    expect(md).not.toContain('$15M');
  });
});
