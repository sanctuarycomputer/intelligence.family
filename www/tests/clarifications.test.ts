import { describe, it, expect } from 'vitest';
import { parseClarifications } from '@/lib/clarifications';

describe('parseClarifications', () => {
  it('splits ## headings into question/answer items', () => {
    const items = parseClarifications(
      '## First question?\n\nFirst answer.\n\n## Second question?\n\nSecond answer.\n'
    );
    expect(items).toHaveLength(2);
    expect(items[0].question).toBe('First question?');
    expect(items[0].answerHtml).toContain('First answer.');
    expect(items[1].question).toBe('Second question?');
  });

  it('renders answer paragraphs with the page typography class', () => {
    const [item] = parseClarifications('## Q?\n\nPara one.\n\nPara two.\n');
    expect(item.answerHtml.match(/<p class="large">/g)).toHaveLength(2);
    expect(item.answerHtml).not.toContain('<p>');
  });

  it('renders links opening in a new tab with underline styling', () => {
    const [item] = parseClarifications(
      '## Q?\n\nSee [Signal](https://signal.org).\n'
    );
    expect(item.answerHtml).toContain('href="https://signal.org"');
    expect(item.answerHtml).toContain('target="_blank"');
    expect(item.answerHtml).toContain('rel="noopener noreferrer"');
    expect(item.answerHtml).toContain('class="underline hover:no-underline"');
  });

  it('renders bold text', () => {
    const [item] = parseClarifications('## Q?\n\nA **strong** point.\n');
    expect(item.answerHtml).toContain('<strong>strong</strong>');
  });

  it('returns an empty array when there are no ## headings', () => {
    expect(parseClarifications('Just prose, no headings.\n')).toEqual([]);
  });

  it('throws when an item has a question but no answer body', () => {
    expect(() => parseClarifications('## Lonely question?\n')).toThrow(
      /missing/
    );
  });
});
