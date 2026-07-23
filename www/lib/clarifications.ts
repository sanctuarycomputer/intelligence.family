import { marked } from 'marked';

export interface Clarification {
  question: string;
  answerHtml: string;
}

// Content is repo-controlled (trusted input), so plain string substitution
// is enough to stamp the page's typography onto marked's bare output:
// globals.css gates paragraph sizing on `p.large`, and answer links should
// match the page's new-tab underlined style.
function decorate(html: string): string {
  return html
    .replaceAll('<p>', '<p class="large">')
    .replaceAll(
      '<a href=',
      '<a target="_blank" rel="noopener noreferrer" class="underline hover:no-underline" href='
    );
}

// Each `## ` heading is a question; everything until the next `## ` is its
// answer, in plain markdown. See app/fundraising/clarifications.md.
export function parseClarifications(md: string): Clarification[] {
  const chunks = md.split(/^## +/m);

  if (chunks.length > 1 && chunks[0].trim() !== '') {
    throw new Error(
      'clarifications.md: content must not appear before the first ## heading'
    );
  }

  const seenQuestions = new Set<string>();

  return chunks.slice(1).map(chunk => {
    const newline = chunk.indexOf('\n');
    const question = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
    const body = newline === -1 ? '' : chunk.slice(newline + 1).trim();
    if (!question || !body) {
      throw new Error(
        `clarifications.md: item "${question}" is missing its question or answer`
      );
    }

    if (seenQuestions.has(question)) {
      throw new Error(`clarifications.md: duplicate question "${question}"`);
    }
    seenQuestions.add(question);

    return {
      question,
      answerHtml: decorate(marked.parse(body, { async: false })),
    };
  });
}
