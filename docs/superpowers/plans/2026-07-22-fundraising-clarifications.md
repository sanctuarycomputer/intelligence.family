# Fundraising Clarifications Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a markdown-driven "Clarifications" accordion (Section VI) to `/fundraising`, answering four investor objections, extensible by editing one md file.

**Architecture:** `app/fundraising/page.tsx` becomes a thin server component that reads `app/fundraising/clarifications.md` at build time and parses it with a small `lib/clarifications.ts` module (marked under the hood). The existing client page moves wholesale to `app/fundraising/FundraisingClient.tsx` and gains a `clarifications` prop, rendered as native `<details>` accordions via a new `ClarificationItem` component.

**Tech Stack:** Next.js 16 (app router), React 19, Tailwind 4, vitest, `marked` (new dependency).

## Global Constraints

- All commands run from the `www/` directory of the worktree.
- Answer copy in `clarifications.md` is placeholder until Hugh drafts it; placeholders must be visibly marked (italic "*Placeholder …*" lead).
- `clarifications.md` must never contain the string `$15M` (the page's copy contract asserts it appears exactly once, in The Ask).
- No em dashes in any copy, including placeholders.
- Hairline dividers use the existing token `border-fi-green-500/50` (same green as SectionHeader's rgba(94, 123, 41, 0.5)).
- The Clarifications section lives inside the email-gated region (after the grandma-text figure that ends Section V).
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: Markdown parser (`lib/clarifications.ts`)

**Files:**
- Create: `lib/clarifications.ts`
- Test: `tests/clarifications.test.ts`
- Modify: `package.json` (add `marked`)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `interface Clarification { question: string; answerHtml: string }` and `function parseClarifications(md: string): Clarification[]`, both exported from `lib/clarifications.ts`. Tasks 3 and 4 import both via `@/lib/clarifications`.

- [ ] **Step 1: Install marked**

Run: `npm install marked`
Expected: added to `dependencies` in `package.json`, no errors.

- [ ] **Step 2: Write the failing tests**

Create `tests/clarifications.test.ts`:

```ts
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/clarifications.test.ts`
Expected: FAIL — cannot resolve `@/lib/clarifications` (module does not exist).

- [ ] **Step 4: Write the implementation**

Create `lib/clarifications.ts`:

```ts
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
  return md
    .split(/^## +/m)
    .slice(1)
    .map(chunk => {
      const newline = chunk.indexOf('\n');
      const question = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
      const body = newline === -1 ? '' : chunk.slice(newline + 1).trim();
      if (!question || !body) {
        throw new Error(
          `clarifications.md: item "${question}" is missing its question or answer`
        );
      }
      return {
        question,
        answerHtml: decorate(marked.parse(body, { async: false })),
      };
    });
}
```

Note: `marked.parse(body, { async: false })` is typed `string` when `async: false` is passed literally. If the installed marked version types it as `string | Promise<string>`, append `as string`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/clarifications.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/clarifications.ts tests/clarifications.test.ts
git commit -m "Add markdown parser for fundraising clarifications

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Content file with placeholder copy

**Files:**
- Create: `app/fundraising/clarifications.md`
- Modify: `tests/fundraising-copy.test.ts` (append a new describe block; do not touch existing tests in this task)

**Interfaces:**
- Consumes: nothing (content only; the md format is defined by Task 1's parser: `## ` question lines, markdown answer bodies).
- Produces: `app/fundraising/clarifications.md`, read by Task 4's server component.

- [ ] **Step 1: Write the failing content-contract test**

Append to `tests/fundraising-copy.test.ts` (after the existing describe block):

```ts
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
```

- [ ] **Step 2: Run tests to verify the new block fails**

Run: `npx vitest run tests/fundraising-copy.test.ts`
Expected: FAIL — `read` throws ENOENT for `app/fundraising/clarifications.md`. Existing tests unaffected.

- [ ] **Step 3: Create the content file**

Create `app/fundraising/clarifications.md`:

```md
## Isn't $899 too expensive?

*Placeholder, Hugh to draft.* Why the premium price point is the right
position for this device.

## I hate subscriptions.

*Placeholder, Hugh to draft.* Why the subscription is optional and fair:
what the device does fully on its own, and what the encrypted backup adds.

## Isn't memory too narrow a use case?

*Placeholder, Hugh to draft.* Memory is the wedge, not the ceiling: the
niche is the entry point for the family practice and the platform beyond it.

## The industrial design doesn't wow me.

*Placeholder, Hugh to draft.* Where the industrial design is today, and
where it goes between now and shipping.
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/fundraising-copy.test.ts`
Expected: PASS (all existing tests plus the 2 new ones).

- [ ] **Step 5: Commit**

```bash
git add app/fundraising/clarifications.md tests/fundraising-copy.test.ts
git commit -m "Add clarifications content file with placeholder copy

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `ClarificationItem` component

**Files:**
- Create: `components/ClarificationItem.tsx`

**Interfaces:**
- Consumes: `Clarification` type from `@/lib/clarifications` (Task 1).
- Produces: default export `ClarificationItem`, props `{ question: string; answerHtml: string }`. Task 4 renders it inside `FundraisingClient`.

- [ ] **Step 1: Write the component**

There is no component-render test infrastructure in this repo (vitest runs in a node environment and existing tests assert against source text), so this task is verified by the type checker here and by the copy-contract tests plus `next build` in Task 4/5.

Create `components/ClarificationItem.tsx`:

```tsx
import type { Clarification } from '@/lib/clarifications';

// Native <details> keeps this zero-state: keyboard/screen-reader accessible,
// inert-able by the email gate, and `name` groups the items so opening one
// closes the others (older browsers just allow multiple open).
export default function ClarificationItem({
  question,
  answerHtml,
}: Clarification) {
  return (
    <details
      name="clarifications"
      className="group border-t border-fi-green-500/50"
    >
      <summary className="cursor-pointer list-none py-5 flex items-baseline gap-3 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="text-fi-green-500 transition-transform duration-200 group-open:rotate-90"
        >
          &#9656;
        </span>
        <span className="text-lg md:text-xl font-bold">{question}</span>
      </summary>
      {/* Paragraph rhythm comes from globals.css (p.large + p.large), which
          the parser's class stamping opts these paragraphs into. */}
      <div
        className="pb-6 pl-6"
        dangerouslySetInnerHTML={{ __html: answerHtml }}
      />
    </details>
  );
}
```

Notes for the implementer:
- `name` on `<details>` is a standard HTML attribute supported by React 19's types. If `tsc` rejects it, do NOT cast to `any`; check the React version instead (this repo uses react 19.2.3, which supports it).
- `text-lg md:text-xl` is 18px/20px, deliberately matching `p.large`'s responsive sizing in `app/globals.css`.
- `&#9656;` is ▸ (rotates to point down when open via `group-open:rotate-90`).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (pre-existing errors, if any, must be noted and not introduced by this file).

- [ ] **Step 3: Commit**

```bash
git add components/ClarificationItem.tsx
git commit -m "Add ClarificationItem accordion component

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Server/client split and Section VI

**Files:**
- Rename: `app/fundraising/page.tsx` → `app/fundraising/FundraisingClient.tsx` (git mv, then edit)
- Create: `app/fundraising/page.tsx` (new server component)
- Modify: `tests/fundraising-copy.test.ts` (retarget the `page` read; extend two existing tests)

**Interfaces:**
- Consumes: `parseClarifications` + `Clarification` from `@/lib/clarifications` (Task 1); `ClarificationItem` from `@/components/ClarificationItem` (Task 3); `app/fundraising/clarifications.md` (Task 2).
- Produces: route `/fundraising` rendering identical to before, plus Section VI inside the gate.

- [ ] **Step 1: Update the failing copy-contract tests first**

In `tests/fundraising-copy.test.ts`, change the `page` source (near the top):

```ts
const page = read('app/fundraising/FundraisingClient.tsx');
```

In the `follows the pitch arc section order` test, extend the order array:

```ts
const order = [
  'The Context',
  'Our First Device',
  'Why This Wins',
  'Who We Are',
  'The Ask',
  'Clarifications',
];
```

In the `gates from Our First Device onward; The Context is public` test, add one assertion at the end:

```ts
expect(page.indexOf('title="Clarifications"')).toBeGreaterThan(gateStart);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/fundraising-copy.test.ts`
Expected: FAIL — ENOENT reading `app/fundraising/FundraisingClient.tsx`.

- [ ] **Step 3: Move the client page**

```bash
git mv app/fundraising/page.tsx app/fundraising/FundraisingClient.tsx
```

Then edit `app/fundraising/FundraisingClient.tsx`:

1. Add imports (with the existing component imports at the top):

```tsx
import ClarificationItem from '@/components/ClarificationItem';
import type { Clarification } from '@/lib/clarifications';
```

2. Change the component signature from:

```tsx
export default function Fundraising() {
```

to:

```tsx
export default function FundraisingClient({
  clarifications,
}: {
  clarifications: Clarification[];
}) {
```

3. Insert Section VI immediately after the grandma-text `</figure>` (the figure whose `figcaption` reads "A real text message from an early user tester."), still inside the gated `space-y-6` div:

```tsx
{/* ===== VI. CLARIFICATIONS ===== */}
<div className="pt-8">
  <SectionHeader label="VI" title="Clarifications" />
</div>

<div className="border-b border-fi-green-500/50">
  {clarifications.map(item => (
    <ClarificationItem
      key={item.question}
      question={item.question}
      answerHtml={item.answerHtml}
    />
  ))}
</div>
```

(The wrapping div's bottom border closes the list; each item carries its own top border.)

- [ ] **Step 4: Create the server page**

Create `app/fundraising/page.tsx`:

```tsx
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseClarifications } from '@/lib/clarifications';
import FundraisingClient from './FundraisingClient';

// This route is fully static, so the md read and parse run at build time.
// In dev, edits to clarifications.md show up on refresh.
export default function Fundraising() {
  const md = readFileSync(
    path.join(process.cwd(), 'app', 'fundraising', 'clarifications.md'),
    'utf8'
  );
  const clarifications = parseClarifications(md);
  if (clarifications.length === 0) {
    throw new Error(
      'app/fundraising/clarifications.md contains no "## " items'
    );
  }
  return <FundraisingClient clarifications={clarifications} />;
}
```

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS — all pre-existing tests (now reading `FundraisingClient.tsx`), the extended section-order and gating tests, the clarifications parser tests, and the content-contract tests.

- [ ] **Step 6: Commit**

```bash
git add app/fundraising/page.tsx app/fundraising/FundraisingClient.tsx tests/fundraising-copy.test.ts
git commit -m "Render Clarifications section VI from clarifications.md

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Full verification

**Files:** none created; fixes only if verification fails.

**Interfaces:** none.

- [ ] **Step 1: Test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Lint and format**

Run: `npm run lint && npm run format:check`
Expected: clean. If prettier flags the new files, run `npm run format` and re-check. Note: `dangerouslySetInnerHTML` in `ClarificationItem` must not trip eslint; if it does, the content is build-time repo markdown, so a targeted `// eslint-disable-next-line` with that justification is acceptable.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds; `/fundraising` prerenders statically (this exercises the md read + parse at build time).

- [ ] **Step 4: Visual smoke check**

Run: `npm run dev` (background), then load `http://localhost:3000/fundraising`.
Verify: page renders as before; after passing the email gate (or temporarily setting `localStorage.fi_fundraising_unlocked_v2 = '1'`), Section VI "Clarifications" appears after the grandma-text figure with four accordion rows; opening one closes the others; links inside answers are underlined and open in new tabs. Stop the dev server after.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "Fix verification findings for Clarifications section

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Skip this commit if verification produced no changes.)
