# /preorder Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an unlisted `/preorder` product page that takes founder-unit reservations (email only, no payment) and doubles as the Prolific survey stimulus with per-outcome completion codes.

**Architecture:** A Next.js 16 App Router route under `www/app/preorder/` with a server `page.tsx` that reads env and `?src=`, and a client tree (`PreorderClient` composing static sections, a `ReserveCard`, and a `StickyNav`). Pure logic lives in `www/lib/preorder.ts`. Reservations POST to `www/app/api/reserve/route.ts`, which writes to the Stacks CRM and queues a Resend email with `after()`.

**Tech Stack:** Next.js 16.1.1 (App Router, React 19), TypeScript, Tailwind v4 (utility classes plus a page-scoped CSS file), Vitest 4 (node environment), Resend SDK, existing Stacks CRM helper.

Spec: `docs/superpowers/specs/2026-09-10-preorder-page-design.md`.

## Global Constraints

- All paths below are relative to `www/` unless they start with `docs/`.
- Run every command from `www/` (`cd /Users/hhff/Documents/Code/intelligence.family/www`).
- Tests: `npm test` runs `vitest run` in the node environment against `tests/**/*.test.ts`. There is no DOM; do not add jsdom or render components in tests.
- Copy rules: no em dashes anywhere (`—`), no en dashes as em-dash substitutes, plain English. The copy below is approved verbatim; do not rewrite it.
- Use-case names, group headers, FAQ questions, and the hero copy are a contract with the survey. Copy them exactly.
- Do not add anything to `components/Navigation.tsx`. The page is unlisted and `noindex`.
- `searchParams` in Next 16 page components is a `Promise`; always `await` it.
- Env vars `FOUNDER_UNITS_TOTAL`, `FOUNDER_UNITS_RESERVED`, `PROLIFIC_CODE_RESERVED`, `PROLIFIC_CODE_DECLINED` are never added to `.env` (the committed encrypted file overloads the dashboard). Only a comment goes in `.env.example`.
- Prettier is configured (`npm run format`); match the existing style (single quotes, semicolons, 2-space indent). Run `npx prettier --write <files>` on files you create before committing.
- Commit after every task with the trailer:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D
  ```

## File structure

| File | Responsibility |
| --- | --- |
| `lib/preorder.ts` | Pure helpers: countdown math, env parsing, `src` parsing, Stacks source resolution, Prolific completion code lookup. |
| `lib/crm.ts` | Add the three preorder Stacks sources to the allowlist. |
| `lib/email.ts` | Add `sendReservationEmail(email, outcome)` and export its copy. |
| `app/api/reserve/route.ts` | Validate, rate limit, write to Stacks, queue email, respond. |
| `next.config.ts` | Trace `.env` into the reserve function bundle. |
| `.env.example` | Comment block naming the dashboard-only vars. |
| `public/preorder/` | WebP illustrations and resized photos for this page. |
| `app/preorder/content.tsx` | Every string on the page as data, plus hero media constants. |
| `app/preorder/preorder.css` | Page-scoped styles: hero layouts, chapters, cards, reserve card, sticky nav, reveal. |
| `app/preorder/useReveal.tsx` | IntersectionObserver `<Reveal>` wrapper. |
| `app/preorder/HeroVideo.tsx` | Client video that plays when visible and respects reduced motion. |
| `app/preorder/sections.tsx` | Static sections: Hero, Harness, UseCases, Kitchen, Privacy, ObjectSection, Faq. |
| `app/preorder/ReserveCard.tsx` | The reserve form and its reserved, waitlist, and Prolific states. |
| `app/preorder/StickyNav.tsx` | The Apple-style local nav. |
| `app/preorder/PreorderClient.tsx` | Holds page state, analytics, and composes the sections. |
| `app/preorder/page.tsx` | Server component: env, `searchParams`, renders `PreorderClient`. |
| `app/preorder/layout.tsx` | Metadata and `noindex`. |
| `tests/preorder.test.ts` | Tests for `lib/preorder.ts`. |
| `tests/reserve.test.ts` | Tests for the reserve route. |
| `tests/preorder-copy.test.ts` | Copy contract for `content.tsx` and the email text. |
| `tests/crm.test.ts`, `tests/email.test.ts` | Extended. |

---

### Task 1: Pure helpers in `lib/preorder.ts`

**Files:**
- Create: `lib/preorder.ts`
- Test: `tests/preorder.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const FOUNDER_UNITS_DEFAULT_TOTAL = 250;
  export type PreorderSrc = 'prolific' | 'ads' | 'direct';
  export type ReserveOutcome = 'reserve' | 'waitlist';
  export type ProlificOutcome = 'reserved' | 'declined';
  export function remainingUnits(total: number, reserved: number): number;
  export function readFounderUnits(env: Record<string, string | undefined>): { total: number; reserved: number };
  export function parseSrc(value: string | string[] | undefined): PreorderSrc;
  export function resolvePreorderSource(src: string | undefined): string;
  export function completionCode(outcome: ProlificOutcome, env: Record<string, string | undefined>): string | null;
  ```
- Consumes: nothing. (Task 2 adds the source constants to `lib/crm.ts`; this task hard-codes the strings and Task 2 switches it to import them.)

- [ ] **Step 1: Write the failing tests**

Create `tests/preorder.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  FOUNDER_UNITS_DEFAULT_TOTAL,
  remainingUnits,
  readFounderUnits,
  parseSrc,
  resolvePreorderSource,
  completionCode,
} from '../lib/preorder';

describe('remainingUnits', () => {
  it('subtracts reserved from total', () => {
    expect(remainingUnits(250, 33)).toBe(217);
  });

  it('never goes below zero', () => {
    expect(remainingUnits(250, 900)).toBe(0);
  });

  it('never goes above total', () => {
    expect(remainingUnits(250, -5)).toBe(250);
  });
});

describe('readFounderUnits', () => {
  it('defaults to 250 total and 0 reserved when env is empty', () => {
    expect(readFounderUnits({})).toEqual({
      total: FOUNDER_UNITS_DEFAULT_TOTAL,
      reserved: 0,
    });
  });

  it('parses integers from env', () => {
    expect(
      readFounderUnits({
        FOUNDER_UNITS_TOTAL: '300',
        FOUNDER_UNITS_RESERVED: '12',
      })
    ).toEqual({ total: 300, reserved: 12 });
  });

  it('treats non-numeric values as the default', () => {
    expect(
      readFounderUnits({
        FOUNDER_UNITS_TOTAL: 'lots',
        FOUNDER_UNITS_RESERVED: '',
      })
    ).toEqual({ total: 250, reserved: 0 });
  });

  it('treats negative values as the default', () => {
    expect(readFounderUnits({ FOUNDER_UNITS_RESERVED: '-4' })).toEqual({
      total: 250,
      reserved: 0,
    });
  });
});

describe('parseSrc', () => {
  it('recognizes prolific and ads', () => {
    expect(parseSrc('prolific')).toBe('prolific');
    expect(parseSrc('ads')).toBe('ads');
  });

  it('falls back to direct for anything else', () => {
    expect(parseSrc(undefined)).toBe('direct');
    expect(parseSrc('')).toBe('direct');
    expect(parseSrc('newsletter')).toBe('direct');
    expect(parseSrc(['ads', 'prolific'])).toBe('direct');
  });

  it('is case-insensitive', () => {
    expect(parseSrc('Prolific')).toBe('prolific');
  });
});

describe('resolvePreorderSource', () => {
  it('maps ads to the ads source', () => {
    expect(resolvePreorderSource('ads')).toBe(
      'g3d:family_intelligence:preorder:ads'
    );
  });

  it('maps prolific and unknown values to the plain preorder source', () => {
    expect(resolvePreorderSource('prolific')).toBe(
      'g3d:family_intelligence:preorder'
    );
    expect(resolvePreorderSource(undefined)).toBe(
      'g3d:family_intelligence:preorder'
    );
    expect(resolvePreorderSource('anything')).toBe(
      'g3d:family_intelligence:preorder'
    );
  });
});

describe('completionCode', () => {
  const env = {
    PROLIFIC_CODE_RESERVED: 'RES123',
    PROLIFIC_CODE_DECLINED: 'DEC456',
  };

  it('returns the reserved code for reserved', () => {
    expect(completionCode('reserved', env)).toBe('RES123');
  });

  it('returns the declined code for declined', () => {
    expect(completionCode('declined', env)).toBe('DEC456');
  });

  it('returns null when the code is unset or blank', () => {
    expect(completionCode('reserved', {})).toBeNull();
    expect(completionCode('declined', { PROLIFIC_CODE_DECLINED: '  ' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/preorder.test.ts`
Expected: FAIL with "Failed to resolve import "../lib/preorder"".

- [ ] **Step 3: Write the implementation**

Create `lib/preorder.ts`:

```ts
export const FOUNDER_UNITS_DEFAULT_TOTAL = 250;

export type PreorderSrc = 'prolific' | 'ads' | 'direct';
export type ReserveOutcome = 'reserve' | 'waitlist';
export type ProlificOutcome = 'reserved' | 'declined';

// Stacks sources. Task 2 moves these into lib/crm.ts's allowlist.
const PREORDER_SOURCE = 'g3d:family_intelligence:preorder';
const PREORDER_ADS_SOURCE = 'g3d:family_intelligence:preorder:ads';

export function remainingUnits(total: number, reserved: number): number {
  return Math.min(total, Math.max(0, total - reserved));
}

function readNonNegativeInt(
  value: string | undefined,
  fallback: number
): number {
  if (value === undefined) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

export function readFounderUnits(env: Record<string, string | undefined>): {
  total: number;
  reserved: number;
} {
  return {
    total: readNonNegativeInt(
      env.FOUNDER_UNITS_TOTAL,
      FOUNDER_UNITS_DEFAULT_TOTAL
    ),
    reserved: readNonNegativeInt(env.FOUNDER_UNITS_RESERVED, 0),
  };
}

export function parseSrc(value: string | string[] | undefined): PreorderSrc {
  if (typeof value !== 'string') return 'direct';
  const v = value.trim().toLowerCase();
  if (v === 'prolific' || v === 'ads') return v;
  return 'direct';
}

/** Stacks source for a reservation. Prolific never reaches here in this
 * version (Prolific mode collects no email), so it maps to the plain
 * source rather than being rejected. */
export function resolvePreorderSource(src: string | undefined): string {
  return parseSrc(src) === 'ads' ? PREORDER_ADS_SOURCE : PREORDER_SOURCE;
}

export function completionCode(
  outcome: ProlificOutcome,
  env: Record<string, string | undefined>
): string | null {
  const raw =
    outcome === 'reserved'
      ? env.PROLIFIC_CODE_RESERVED
      : env.PROLIFIC_CODE_DECLINED;
  const code = raw?.trim();
  return code ? code : null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/preorder.test.ts`
Expected: PASS, 15 tests.

- [ ] **Step 5: Commit**

```bash
npx prettier --write lib/preorder.ts tests/preorder.test.ts
git add lib/preorder.ts tests/preorder.test.ts
git commit -m "Preorder helpers: countdown, src parsing, Stacks source, Prolific codes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 2: Preorder sources in the CRM allowlist

**Files:**
- Modify: `lib/crm.ts:1-14`
- Modify: `lib/preorder.ts` (import the constants instead of hard-coding)
- Test: `tests/crm.test.ts:17-27`

**Interfaces:**
- Produces from `lib/crm.ts`:
  ```ts
  export const PREORDER_SOURCE = 'g3d:family_intelligence:preorder';
  export const PREORDER_ADS_SOURCE = 'g3d:family_intelligence:preorder:ads';
  export const PREORDER_PROLIFIC_SOURCE = 'g3d:family_intelligence:preorder:prolific';
  ```
  and `ALLOWED_SOURCES` now contains all three.

- [ ] **Step 1: Update the exact allowlist assertion in the test**

In `tests/crm.test.ts`, replace the `ALLOWED_SOURCES` block (lines 17-27) with:

```ts
describe('ALLOWED_SOURCES', () => {
  it('matches the spec allowlist', () => {
    expect(ALLOWED_SOURCES).toEqual([
      'g3d:family_intelligence',
      'g3d:family_intelligence:fundraising',
      'g3d:family_intelligence:fundraising-viewed',
      'g3d:family_intelligence:opportunity',
      'g3d:family_intelligence:opportunity-viewed',
      'g3d:family_intelligence:preorder',
      'g3d:family_intelligence:preorder:ads',
      'g3d:family_intelligence:preorder:prolific',
    ]);
  });

  it('exports the preorder sources by name', async () => {
    const crm = await import('../lib/crm');
    expect(crm.PREORDER_SOURCE).toBe('g3d:family_intelligence:preorder');
    expect(crm.PREORDER_ADS_SOURCE).toBe(
      'g3d:family_intelligence:preorder:ads'
    );
    expect(crm.PREORDER_PROLIFIC_SOURCE).toBe(
      'g3d:family_intelligence:preorder:prolific'
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/crm.test.ts`
Expected: FAIL on "matches the spec allowlist" (array has 5 entries, expected 8) and on the named exports.

- [ ] **Step 3: Add the sources**

In `lib/crm.ts`, replace lines 1-14 with:

```ts
export const PREORDER_SOURCE = 'g3d:family_intelligence:preorder';
export const PREORDER_ADS_SOURCE = 'g3d:family_intelligence:preorder:ads';
export const PREORDER_PROLIFIC_SOURCE =
  'g3d:family_intelligence:preorder:prolific';

export const ALLOWED_SOURCES = [
  'g3d:family_intelligence',
  'g3d:family_intelligence:fundraising',
  'g3d:family_intelligence:fundraising-viewed',
  'g3d:family_intelligence:opportunity',
  'g3d:family_intelligence:opportunity-viewed',
  PREORDER_SOURCE,
  PREORDER_ADS_SOURCE,
  PREORDER_PROLIFIC_SOURCE,
] as const;

export const GATE_SOURCE = 'g3d:family_intelligence:fundraising';
export const VIEWED_SOURCE = 'g3d:family_intelligence:fundraising-viewed';
export const OPPORTUNITY_GATE_SOURCE = 'g3d:family_intelligence:opportunity';
export const OPPORTUNITY_VIEWED_SOURCE =
  'g3d:family_intelligence:opportunity-viewed';

```

(Keep the blank line before the existing `const DEFAULT_SOURCE` line.)
Prettier will also reformat `next.config.ts` to single quotes in Task 4;
that churn is expected.

Then in `lib/preorder.ts`, delete the two local `const PREORDER_*` lines and their comment, and add at the top:

```ts
import { PREORDER_SOURCE, PREORDER_ADS_SOURCE } from './crm';
```

- [ ] **Step 4: Run both test files**

Run: `npx vitest run tests/crm.test.ts tests/preorder.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
npx prettier --write lib/crm.ts lib/preorder.ts tests/crm.test.ts
git add lib/crm.ts lib/preorder.ts tests/crm.test.ts
git commit -m "CRM: allowlist the three preorder sources

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 3: Reservation email

**Files:**
- Modify: `lib/email.ts` (append)
- Test: `tests/email.test.ts` (append)

**Interfaces:**
- Consumes: `ReserveOutcome` from `lib/preorder.ts`.
- Produces:
  ```ts
  export const RESERVATION_EMAIL: Record<ReserveOutcome, { subject: string; text: string }>;
  export function sendReservationEmail(email: string, outcome: ReserveOutcome): Promise<boolean>;
  ```

- [ ] **Step 1: Write the failing tests**

Append to `tests/email.test.ts` (keep the existing imports and mocks; add `sendReservationEmail` and `RESERVATION_EMAIL` to the import from `../lib/email`):

```ts
describe('sendReservationEmail', () => {
  it('sends the reserve email with the in-line subject', async () => {
    sendMock.mockResolvedValue({ data: { id: 'msg_r1' }, error: null });
    const ok = await sendReservationEmail('parent@example.com', 'reserve');
    expect(ok).toBe(true);
    const payload = sendMock.mock.calls[0][0];
    expect(payload.to).toBe('parent@example.com');
    expect(payload.subject).toBe("You're in line for the Flagship");
    expect(payload.text).toContain(
      "You're in line for one of 250 Flagship founder units."
    );
    expect(payload.text).toContain('$49 refundable deposit');
    expect(payload.text).toContain('$850 balance');
  });

  it('sends the waitlist email with the waitlist subject', async () => {
    sendMock.mockResolvedValue({ data: { id: 'msg_w1' }, error: null });
    await sendReservationEmail('parent@example.com', 'waitlist');
    const payload = sendMock.mock.calls[0][0];
    expect(payload.subject).toBe("You're on the Flagship waitlist");
    expect(payload.text).toContain('All 250 founder units are spoken for');
  });

  it('includes replyTo when REPLY_TO is set', async () => {
    process.env.REPLY_TO = 'invest@intelligence.family';
    sendMock.mockResolvedValue({ data: { id: 'msg_r2' }, error: null });
    await sendReservationEmail('parent@example.com', 'reserve');
    expect(sendMock.mock.calls[0][0].replyTo).toBe(
      'invest@intelligence.family'
    );
  });

  it('returns false on error and when the SDK throws', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await sendReservationEmail('a@b.co', 'reserve')).toBe(false);
    sendMock.mockRejectedValue(new Error('network'));
    expect(await sendReservationEmail('a@b.co', 'reserve')).toBe(false);
  });

  it('exports copy with no em dashes', () => {
    for (const { subject, text } of Object.values(RESERVATION_EMAIL)) {
      expect(subject).not.toContain('—');
      expect(text).not.toContain('—');
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/email.test.ts`
Expected: FAIL, `sendReservationEmail is not a function` (or missing export).

- [ ] **Step 3: Implement**

Append to `lib/email.ts`:

```ts
import type { ReserveOutcome } from './preorder';

export const RESERVATION_EMAIL: Record<
  ReserveOutcome,
  { subject: string; text: string }
> = {
  reserve: {
    subject: "You're in line for the Flagship",
    text: [
      "You're in line for one of 250 Flagship founder units.",
      '',
      "Here's how it works. When deposits open we'll email you a payment link for the $49 refundable deposit. Paying it confirms your unit and locks the $899 launch price. The $850 balance is due when your unit ships, in 2027, to the United States.",
      '',
      'Change your mind at any point before it ships and we refund the deposit in full.',
      '',
      'Reply to this email with any question. A person reads every one.',
    ].join('\n'),
  },
  waitlist: {
    subject: "You're on the Flagship waitlist",
    text: [
      "All 250 founder units are spoken for, and you're on the waitlist. If a unit frees up we'll email you first.",
      '',
      'Reply to this email with any question. A person reads every one.',
    ].join('\n'),
  },
};

export async function sendReservationEmail(
  email: string,
  outcome: ReserveOutcome
): Promise<boolean> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const from =
      process.env.RESEND_FROM ??
      'Family Intelligence <invest@mail.intelligence.family>';
    const replyTo = process.env.REPLY_TO;
    const { subject, text } = RESERVATION_EMAIL[outcome];

    const { error } = await resend.emails.send({
      from,
      to: email,
      ...(replyTo ? { replyTo } : {}),
      subject,
      text,
    });

    return !error;
  } catch {
    return false;
  }
}
```

Move the `import type { ReserveOutcome }` line to the top of the file next to the existing `import { Resend } from 'resend';`.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/email.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
npx prettier --write lib/email.ts tests/email.test.ts
git add lib/email.ts tests/email.test.ts
git commit -m "Email: reservation and waitlist confirmations

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 4: `POST /api/reserve`

**Files:**
- Create: `app/api/reserve/route.ts`
- Modify: `next.config.ts:8-13`
- Modify: `.env.example` (append)
- Test: `tests/reserve.test.ts`

**Interfaces:**
- Consumes: `createCrmContact` from `lib/crm.ts`; `sendReservationEmail` from `lib/email.ts`; `resolvePreorderSource`, `ReserveOutcome` from `lib/preorder.ts`; `consume` from `lib/rate-limit.ts`; `clientIp` from `lib/client-ip.ts`.
- Produces: HTTP contract used by `ReserveCard` in Task 9:
  - Request `POST /api/reserve` JSON `{ email: string, src?: string, outcome: 'reserve' | 'waitlist' }`
  - 201 `{ success: true, status: 'reserve' | 'waitlist' }`
  - 400 `{ success: false, message: string }`
  - 429 `{ success: false, message: string }`
  - 500 `{ success: false, message: string }`

- [ ] **Step 1: Write the failing tests**

Create `tests/reserve.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { _resetForTests } from '../lib/rate-limit';

const crmMock = vi.fn();
vi.mock('../lib/crm', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/crm')>();
  return { ...actual, createCrmContact: (...a: unknown[]) => crmMock(...a) };
});

const emailMock = vi.fn();
vi.mock('../lib/email', () => ({
  sendReservationEmail: (...a: unknown[]) => emailMock(...a),
}));

// after() runs the callback once the response is sent; in tests, run it now.
vi.mock('next/server', async importOriginal => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: (fn: () => unknown) => fn() };
});

import { POST } from '../app/api/reserve/route';

function req(body: unknown, ip = '203.0.113.7') {
  return new NextRequest('http://localhost/api/reserve', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  _resetForTests();
  crmMock.mockReset();
  crmMock.mockResolvedValue({ ok: true, status: 'created' });
  emailMock.mockReset();
  emailMock.mockResolvedValue(true);
});

describe('POST /api/reserve', () => {
  it('rejects a bad email', async () => {
    const res = await POST(req({ email: 'nope', outcome: 'reserve' }));
    expect(res.status).toBe(400);
    expect(crmMock).not.toHaveBeenCalled();
  });

  it('rejects a bad outcome', async () => {
    const res = await POST(req({ email: 'a@b.co', outcome: 'buy' }));
    expect(res.status).toBe(400);
  });

  it('rejects a malformed body', async () => {
    const r = new NextRequest('http://localhost/api/reserve', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.9' },
      body: 'not json',
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
  });

  it('writes an ads reservation with the ads source and emails', async () => {
    const res = await POST(
      req({ email: 'Parent@Example.com', src: 'ads', outcome: 'reserve' })
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true, status: 'reserve' });
    expect(crmMock).toHaveBeenCalledWith(
      'Parent@Example.com',
      'g3d:family_intelligence:preorder:ads'
    );
    expect(emailMock).toHaveBeenCalledWith('Parent@Example.com', 'reserve');
  });

  it('maps prolific and unknown src to the plain preorder source', async () => {
    await POST(req({ email: 'a@b.co', src: 'prolific', outcome: 'reserve' }));
    await POST(req({ email: 'c@d.co', src: 'zzz', outcome: 'reserve' }));
    await POST(req({ email: 'e@f.co', outcome: 'reserve' }));
    for (const call of crmMock.mock.calls) {
      expect(call[1]).toBe('g3d:family_intelligence:preorder');
    }
  });

  it('passes the waitlist outcome through to the email', async () => {
    const res = await POST(req({ email: 'a@b.co', outcome: 'waitlist' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true, status: 'waitlist' });
    expect(emailMock).toHaveBeenCalledWith('a@b.co', 'waitlist');
  });

  it('returns 500 and sends no email when Stacks fails', async () => {
    crmMock.mockResolvedValue({ ok: false, status: 'error' });
    const res = await POST(req({ email: 'a@b.co', outcome: 'reserve' }));
    expect(res.status).toBe(500);
    expect(emailMock).not.toHaveBeenCalled();
  });

  it('still returns 201 when the email fails', async () => {
    emailMock.mockResolvedValue(false);
    const res = await POST(req({ email: 'a@b.co', outcome: 'reserve' }));
    expect(res.status).toBe(201);
  });

  it('rate limits per IP after 20 requests in the window', async () => {
    for (let i = 0; i < 20; i++) {
      const res = await POST(
        req({ email: `u${i}@example.com`, outcome: 'reserve' }, '198.51.100.1')
      );
      expect(res.status).toBe(201);
    }
    const res = await POST(
      req({ email: 'u21@example.com', outcome: 'reserve' }, '198.51.100.1')
    );
    expect(res.status).toBe(429);
  });

  it('rate limits per email after 3 requests in the window', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await POST(
        req({ email: 'same@example.com', outcome: 'reserve' }, `10.0.0.${i}`)
      );
      expect(res.status).toBe(201);
    }
    const res = await POST(
      req({ email: 'Same@Example.com', outcome: 'reserve' }, '10.0.0.9')
    );
    expect(res.status).toBe(429);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/reserve.test.ts`
Expected: FAIL, cannot resolve `../app/api/reserve/route`.

- [ ] **Step 3: Implement the route**

Create `app/api/reserve/route.ts`:

```ts
import { NextRequest, NextResponse, after } from 'next/server';
import { createCrmContact } from '@/lib/crm';
import { sendReservationEmail } from '@/lib/email';
import { resolvePreorderSource, type ReserveOutcome } from '@/lib/preorder';
import { consume } from '@/lib/rate-limit';
import { clientIp } from '@/lib/client-ip';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 600_000;
const IP_LIMIT = 20;
const EMAIL_LIMIT = 3;
const RATE_LIMIT_ERROR =
  'Too many requests. Please wait a few minutes and try again.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

type ReserveResponse =
  | { success: true; status: ReserveOutcome }
  | { success: false; message: string };

function fail(message: string, status: number) {
  return NextResponse.json<ReserveResponse>(
    { success: false, message },
    { status }
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReserveResponse>> {
  const ip = clientIp(request);
  if (!consume(`reserve:${ip}`, IP_LIMIT, WINDOW_MS)) {
    return fail(RATE_LIMIT_ERROR, 429);
  }

  let body: { email?: unknown; src?: unknown; outcome?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body.', 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    return fail('Please enter a valid email address.', 400);
  }

  const outcome = body.outcome;
  if (outcome !== 'reserve' && outcome !== 'waitlist') {
    return fail('Invalid request body.', 400);
  }

  if (!consume(`reserve-email:${email.toLowerCase()}`, EMAIL_LIMIT, WINDOW_MS)) {
    return fail(RATE_LIMIT_ERROR, 429);
  }

  const source = resolvePreorderSource(
    typeof body.src === 'string' ? body.src : undefined
  );

  const result = await createCrmContact(email, source);
  if (!result.ok) {
    return fail(GENERIC_ERROR, 500);
  }

  after(async () => {
    const sent = await sendReservationEmail(email, outcome);
    if (!sent) console.error('Reservation email failed for', email);
  });

  return NextResponse.json<ReserveResponse>(
    { success: true, status: outcome },
    { status: 201 }
  );
}
```

- [ ] **Step 4: Trace the env file into the function bundle**

In `next.config.ts`, add a line to `outputFileTracingIncludes`:

```ts
    "/api/reserve": ["./.env"],
```

- [ ] **Step 5: Document the dashboard-only vars**

Append to `.env.example`:

```
# Dashboard only, never in .env (instrumentation overloads .env values):
# FOUNDER_UNITS_TOTAL=250
# FOUNDER_UNITS_RESERVED=0
# PROLIFIC_CODE_RESERVED=
# PROLIFIC_CODE_DECLINED=
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run tests/reserve.test.ts`
Expected: PASS, 10 tests. If the email mock is not called, check that the `next/server` mock replaces `after` (the route imports `after` from `next/server`).

- [ ] **Step 7: Commit**

```bash
npx prettier --write app/api/reserve/route.ts tests/reserve.test.ts next.config.ts
git add app/api/reserve/route.ts tests/reserve.test.ts next.config.ts .env.example
git commit -m "API: /api/reserve writes to Stacks and queues the confirmation email

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 5: Page media in `public/preorder/`

**Files:**
- Create: `public/preorder/context-window-home.webp`, `public/preorder/walled-garden.webp`, `public/preorder/family-vault.webp`, `public/preorder/device-photo.jpg`, `public/preorder/device-cad.jpg`

**Interfaces:**
- Produces the paths above, referenced by `content.tsx` in Task 6. The hero video and poster stay at `/opportunity/device-playtest.mp4` and `/opportunity/device-playtest-poster.jpg`.

- [ ] **Step 1: Convert and resize**

Run from `www/`:

```bash
mkdir -p public/preorder
cwebp -q 82 -resize 1536 0 public/opportunity/context-window-home.png -o public/preorder/context-window-home.webp
cwebp -q 82 -resize 1536 0 public/opportunity/walled-garden.png -o public/preorder/walled-garden.webp
cp public/opportunity/family-vault.webp public/preorder/family-vault.webp
cp public/opportunity/device-photo.jpg public/preorder/device-photo.jpg
cp public/opportunity/device-cad.jpg public/preorder/device-cad.jpg
```

- [ ] **Step 2: Verify sizes**

Run: `du -h public/preorder/*`
Expected: each WebP under 400K (the two conversions land near 384K and 362K), each JPG under 400K (they are copied as-is: both are already under 1600px on the long edge). If a WebP is over 400K, re-run with `-q 75`.

- [ ] **Step 3: Commit**

```bash
git add public/preorder
git commit -m "Preorder page media: WebP illustrations and resized photos

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 6: Page copy as data in `content.tsx`

**Files:**
- Create: `app/preorder/content.tsx`
- Test: `tests/preorder-copy.test.ts`

**Interfaces:**
- Produces the exports below, consumed by Tasks 8 and 9:
  ```ts
  export const HERO_MEDIA: { orientation: 'portrait' | 'landscape'; src: string; poster: string; label: string };
  export const HERO: { headline: string; body: string; pillars: readonly [string, string, string]; offer: string };
  export const HARNESS: { line: string; body: string; closer: string; image: string; alt: string };
  export const USE_CASE_GROUPS: ReadonlyArray<{ header: string; items: ReadonlyArray<{ n: number; name: string; body: string; later?: boolean }> }>;
  export const USE_CASES_IMAGE: { src: string; alt: string };
  export const KITCHEN: { line: string; body: string; image: string; alt: string };
  export const PRIVACY: { line: string; body: string; image: string; alt: string };
  export const OBJECT: { specs: readonly string[]; body: string; cad: string; cadAlt: string; photo: string; photoAlt: string };
  export const RESERVE: { title: string; sub: string; ship: string; button: string; smallPrint: string; waitlist: { count: string; button: string; smallPrint: string }; reserved: { title: string; body: string }; waitlisted: { title: string; body: string }; prolific: { reserve: string; decline: string; thanks: string; noCode: string } };
  export const FAQ: ReadonlyArray<{ q: string; a: string }>;
  ```

- [ ] **Step 1: Write the failing copy test**

Create `tests/preorder-copy.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { HERO, USE_CASE_GROUPS, FAQ, RESERVE } from '../app/preorder/content';
import { RESERVATION_EMAIL } from '../lib/email';

const contentSrc = readFileSync(
  path.join(__dirname, '..', 'app', 'preorder', 'content.tsx'),
  'utf8'
);

describe('preorder copy contract', () => {
  it('carries the approved hero copy', () => {
    expect(HERO.headline).toBe(
      'Take better care of your family than ever before.'
    );
    expect(HERO.body).toBe(
      "The Flagship is the most capable AI assistant you can put in a home. It remembers your family's stories, paperwork, and health. It helps run the household. It answers the kids. And nothing it hears ever leaves the house."
    );
    expect(HERO.pillars).toEqual([
      'Remembers your family',
      'Runs your household',
      'Nothing leaves the house',
    ]);
    expect(HERO.offer).toBe(
      '$899 at launch. Hold one of 250 founder units with a $49 refundable deposit.'
    );
  });

  it('carries the eight use cases in order under two group headers', () => {
    expect(USE_CASE_GROUPS.map(g => g.header)).toEqual([
      'Remembers your family',
      'Runs your household',
    ]);
    const items = USE_CASE_GROUPS.flatMap(g => g.items);
    expect(items.map(i => i.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(items.map(i => i.name)).toEqual([
      'Family stories',
      'The document vault',
      'The family health record',
      'Photos and recordings',
      'The shared family brain',
      'Kid-safe AI',
      "Everyone's private assistant",
      'The brain of the smart home',
    ]);
    expect(items[7].later).toBe(true);
    expect(items.slice(0, 7).every(i => !i.later)).toBe(true);
  });

  it('carries the six FAQ questions', () => {
    expect(FAQ.map(f => f.q)).toEqual([
      'When am I charged?',
      'Can I get my deposit back?',
      'What does a founder unit get me?',
      'What does it need at home?',
      'Where do you ship?',
      'When does it ship?',
    ]);
  });

  it('says no charge today next to the reserve button', () => {
    expect(RESERVE.button).toBe('Reserve a founder unit');
    expect(RESERVE.smallPrint).toContain('No charge today.');
  });

  it('has no em dashes in page copy or email copy', () => {
    expect(contentSrc).not.toContain('—');
    for (const { subject, text } of Object.values(RESERVATION_EMAIL)) {
      expect(subject).not.toContain('—');
      expect(text).not.toContain('—');
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/preorder-copy.test.ts`
Expected: FAIL, cannot resolve `../app/preorder/content`.

- [ ] **Step 3: Write the content file**

Create `app/preorder/content.tsx`:

```tsx
// Every string on /preorder lives here so copy changes never touch layout.
// The use-case names, group headers, FAQ questions, and hero copy are a
// contract with the Prolific survey. tests/preorder-copy.test.ts enforces it.

export const HERO_MEDIA = {
  // Swap to 'landscape' with /preorder/hero.mp4 once the wide clip exists.
  orientation: 'portrait' as 'portrait' | 'landscape',
  src: '/opportunity/device-playtest.mp4',
  poster: '/opportunity/device-playtest-poster.jpg',
  label: 'The Flagship on a coffee table in a family living room',
};

export const HERO = {
  headline: 'Take better care of your family than ever before.',
  body: "The Flagship is the most capable AI assistant you can put in a home. It remembers your family's stories, paperwork, and health. It helps run the household. It answers the kids. And nothing it hears ever leaves the house.",
  pillars: [
    'Remembers your family',
    'Runs your household',
    'Nothing leaves the house',
  ] as const,
  offer:
    '$899 at launch. Hold one of 250 founder units with a $49 refundable deposit.',
};

export const HARNESS = {
  line: 'An assistant that knows your home.',
  body: "One local agent holds the household's memory. It runs the jobs a family never gets to: weekly check-ins, budgets, school, health. When you allow it, it reaches out to your calendar, email, web search, and maps, and it talks to the devices already on your network. Everything stays local by default. The internet comes to your data, not the other way around.",
  closer:
    "That's why it's the most capable assistant you can put in a home. It has context no cloud assistant is allowed to have.",
  image: '/preorder/context-window-home.webp',
  alt: 'A house in cross-section with the Flagship on the coffee table, connected to the TV, thermostat, camera, laptop, phone, and speaker in every room',
};

export type UseCase = { n: number; name: string; body: string; later?: boolean };
export type UseCaseGroup = { header: string; items: ReadonlyArray<UseCase> };

export const USE_CASE_GROUPS: ReadonlyArray<UseCaseGroup> = [
  {
    header: 'Remembers your family',
    items: [
      {
        n: 1,
        name: 'Family stories',
        body: 'Record grandparents while you still can, and find any story, recipe, or tradition later.',
      },
      {
        n: 2,
        name: 'The document vault',
        body: 'Birth certificates, wills, insurance, school forms. Never lost again.',
      },
      {
        n: 3,
        name: 'The family health record',
        body: 'Vaccines, allergies, medications, what runs in the family, for kids and aging parents alike.',
      },
      {
        n: 4,
        name: 'Photos and recordings',
        body: 'One home for everything scattered across phones and drives.',
      },
    ],
  },
  {
    header: 'Runs your household',
    items: [
      {
        n: 5,
        name: 'The shared family brain',
        body: "What the pediatrician said, when the permission slip is due, what's being saved for. Ask it instead of each other.",
      },
      {
        n: 6,
        name: 'Kid-safe AI',
        body: 'Homework help and endless questions, with rules you set, and nothing about your kids leaving the house.',
      },
      {
        n: 7,
        name: "Everyone's private assistant",
        body: 'Writing, research, planning, as good as the best cloud assistants, with no account and no one reading over your shoulder.',
      },
      {
        n: 8,
        name: 'The brain of the smart home',
        body: 'One assistant that knows the house and talks to the devices in it.',
        later: true,
      },
    ],
  },
];

export const USE_CASES_IMAGE = {
  src: '/preorder/family-vault.webp',
  alt: 'The Flagship surrounded by a storybook, cookbook, document box, photo pile, calendar, piggy bank, and health folder',
};

export const KITCHEN = {
  line: 'Some stories you only get to record once.',
  body: "It sits on the kitchen shelf. Invite it into the conversation and it can resurface the story your grandfather told last Thanksgiving, find the recording of your daughter's first words, and help your kids interview their grandparents. Everything it hears stays inside the house.",
  image: '/preorder/device-photo.jpg',
  alt: "A child's hand on the Flagship's screen on a kitchen counter",
};

export const PRIVACY = {
  line: 'Nothing leaves the house.',
  body: 'Prompts, inference, and reasoning stay on the box. Far-away family reach it through apps over a tunnel we cannot read. You can dim the lights without telling anyone.',
  image: '/preorder/walled-garden.webp',
  alt: 'A hedge-walled garden with the Flagship at its center, one gate ajar where a single thread reaches out to a distant datacenter and returns',
};

export const OBJECT = {
  specs: [
    'Runs open models locally. Nothing to sign in to.',
    'No subscription needed to use it.',
    'Gets smarter over the air as better open models ship.',
    "Sits on a shelf. Plugs into the wall. That's the setup.",
  ] as const,
  body: 'A premium, heirloom-grade object that carries the inference runtime and the household graph. Made to sit on the counter for a very long time.',
  cad: '/preorder/device-cad.jpg',
  cadAlt: 'CAD render of the Flagship: curved shell, tilted display, and the compute module inside',
  photo: '/preorder/device-photo.jpg',
  photoAlt: 'The Flagship prototype on a kitchen counter',
};

export const RESERVE = {
  title: 'The Flagship. $899 at launch.',
  sub: 'Hold a founder unit with a $49 refundable deposit.',
  ship: 'Founder units ship in 2027. United States only.',
  button: 'Reserve a founder unit',
  smallPrint:
    "No charge today. We'll email you a payment link when deposits open. Full refund any time before your unit ships.",
  waitlist: {
    count: 'All 250 founder units reserved',
    button: 'Join the waitlist',
    smallPrint: "We'll email you if a unit frees up.",
  },
  reserved: {
    title: "You're in line for the Flagship.",
    body: "When deposits open we'll email you a payment link for the $49 refundable deposit. Paying it confirms your unit and locks the $899 launch price. The $850 balance is due when your unit ships.",
  },
  waitlisted: {
    title: "You're on the waitlist.",
    body: "All 250 founder units are spoken for. If a unit frees up we'll email you first.",
  },
  prolific: {
    reserve: 'Reserve a founder unit',
    decline: "No thanks, I'm not interested",
    thanks: 'Thanks. Your completion code is',
    noCode: 'Return to Prolific to finish the study.',
  },
};

export const FAQ = [
  {
    q: 'When am I charged?',
    a: 'Not today. When deposits open we email you a payment link for the $49 deposit. The $850 balance is due when your unit ships.',
  },
  {
    q: 'Can I get my deposit back?',
    a: 'Yes. Full refund any time before your unit ships, no questions asked.',
  },
  {
    q: 'What does a founder unit get me?',
    a: 'One of the first 250 devices, the $899 launch price locked in, and a direct line to the team while we build it.',
  },
  {
    q: 'What does it need at home?',
    a: "A shelf, a power outlet, and Wi-Fi for the family's phones and laptops to reach it. It works with the internet off.",
  },
  {
    q: 'Where do you ship?',
    a: 'Founder units ship to the United States. Other countries come later.',
  },
  {
    q: 'When does it ship?',
    a: "Founder units ship in 2027. We'll send updates as we go, and you can leave the line at any time.",
  },
] as const;
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/preorder-copy.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
npx prettier --write app/preorder/content.tsx tests/preorder-copy.test.ts
git add app/preorder/content.tsx tests/preorder-copy.test.ts
git commit -m "Preorder copy as data with a copy contract test

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 7: Styles, reveal hook, and hero video

**Files:**
- Create: `app/preorder/preorder.css`
- Create: `app/preorder/useReveal.tsx`
- Create: `app/preorder/HeroVideo.tsx`

**Interfaces:**
- Produces:
  ```ts
  // useReveal.tsx
  export function Reveal(props: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' | 'p' }): JSX.Element;
  // HeroVideo.tsx
  export default function HeroVideo(props: { src: string; poster: string; label: string; className?: string }): JSX.Element;
  ```
- CSS class names consumed by Tasks 8 and 9 are listed in the file below. Do not rename them.

No unit tests (DOM code); Task 10 verifies in the browser.

- [ ] **Step 1: Write the reveal hook**

Create `app/preorder/useReveal.tsx` (a `.tsx` file: it returns JSX. A
callback ref typed on `HTMLElement` satisfies all four tag types, and
keeps the React Compiler lint rule `react-hooks/refs` happy, which
`createElement(as, { ref })` does not):

```tsx
'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/** Adds .po-in when the element enters the viewport. Under reduced motion
 * the class is added immediately so nothing is ever hidden. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'p';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((el: HTMLElement | null) => {
    ref.current = el;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCED).matches) {
      el.classList.add('po-in');
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          el.classList.add('po-in');
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={setRef}
      className={`po-reveal ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: Write the hero video component**

Create `app/preorder/HeroVideo.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/** Plays only while on screen and never under reduced motion, so those
 * users see the poster. No autoplay attribute: play() is the only path. */
export default function HeroVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCED).matches) return;
    const io = new IntersectionObserver(
      entries => {
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  );
}
```

- [ ] **Step 3: Write the page styles**

Create `app/preorder/preorder.css`:

```css
/* /preorder page styles. Prefix: po-. Tokens come from globals.css. */

.po-page {
  background: var(--fi-green-100);
  color: var(--fi-black-900);
  font-size: 16px;
  line-height: 1.5;
  overflow-x: hidden;
}
@media (min-width: 768px) {
  .po-page {
    font-size: 18px;
  }
}
.po-container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}
.po-tabular {
  font-variant-numeric: tabular-nums;
}

/* ---------- Reveal ---------- */
.po-reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 500ms ease-out,
    transform 500ms ease-out;
}
.po-reveal.po-in {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .po-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* ---------- Hero ---------- */
.po-hero {
  position: relative;
  min-height: 100svh;
  background: var(--fi-black-900);
  color: #fff;
  display: grid;
  overflow: hidden;
}
.po-hero-media {
  position: absolute;
  inset: 0;
}
.po-hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.po-hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(49, 49, 49, 0.15) 0%,
    rgba(49, 49, 49, 0.2) 40%,
    rgba(49, 49, 49, 0.85) 100%
  );
}
.po-hero-copy {
  position: relative;
  align-self: end;
  padding-bottom: 72px;
  padding-top: 120px;
  max-width: 44rem;
}
.po-hero h1 {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(40px, 6vw, 88px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0 0 20px;
}
.po-hero-body {
  font-size: clamp(16px, 1.4vw, 20px);
  line-height: 1.45;
  max-width: 36rem;
  color: rgba(255, 255, 255, 0.92);
}
.po-pillars {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 0;
  margin: 24px 0 28px;
  padding: 0;
  list-style: none;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}
.po-pillars li + li::before {
  content: '·';
  margin: 0 10px;
}
.po-hero-offer {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 14px;
}
.po-hero-cta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}
.po-hero-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}
.po-scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

/* Portrait clip on desktop: dark ground, copy left, clip standing right. */
@media (min-width: 900px) {
  .po-hero-portrait {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .po-hero-portrait .po-hero-media {
    position: relative;
    grid-column: 2;
    grid-row: 1;
    display: flex;
    justify-content: center;
    align-items: stretch;
    min-height: 100svh;
  }
  .po-hero-portrait .po-hero-video {
    width: auto;
    height: 100svh;
    aspect-ratio: 9 / 16;
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      #000 12%,
      #000 88%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      #000 12%,
      #000 88%,
      transparent 100%
    );
  }
  .po-hero-portrait .po-hero-scrim {
    display: none;
  }
  .po-hero-portrait .po-hero-copy {
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    padding-top: 96px;
    padding-bottom: 96px;
  }
}

/* ---------- Buttons and inputs ---------- */
.po-btn {
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 14px 26px;
  font: inherit;
  font-weight: 600;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  background: var(--fi-green-500);
  color: #fff;
  transition: background 150ms ease;
}
.po-btn:hover {
  background: var(--fi-green-400);
}
.po-btn:disabled {
  cursor: default;
  opacity: 0.6;
}
.po-btn-light {
  background: #fff;
  color: var(--fi-black-900);
}
.po-btn-light:hover {
  background: var(--fi-green-100);
}
.po-btn-quiet {
  background: transparent;
  color: var(--fi-green-600);
  text-decoration: underline;
  text-underline-offset: 3px;
  padding-left: 8px;
  padding-right: 8px;
}
.po-btn-quiet:hover {
  background: transparent;
  color: var(--fi-black-900);
}
.po-input {
  width: 100%;
  border: 1px solid var(--fi-green-400);
  border-radius: 999px;
  background: #fff;
  padding: 14px 20px;
  font: inherit;
  font-size: 16px;
  color: var(--fi-black-900);
}
.po-input:focus {
  outline: 2px solid var(--fi-green-500);
  outline-offset: 2px;
}

/* ---------- Chapter openers ---------- */
.po-chapter {
  position: relative;
  min-height: 70svh;
  display: grid;
  align-items: end;
  overflow: hidden;
  color: #fff;
}
@media (min-width: 768px) {
  .po-chapter {
    min-height: 90svh;
  }
}
.po-chapter img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.po-chapter::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(49, 49, 49, 0) 30%,
    rgba(49, 49, 49, 0.75) 100%
  );
}
.po-chapter-line {
  position: relative;
  z-index: 1;
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(32px, 5vw, 72px);
  line-height: 1.02;
  letter-spacing: -0.02em;
  max-width: 14ch;
  padding-top: 40px;
  padding-bottom: 56px;
  color: #fff;
}

/* ---------- Sections ---------- */
.po-section {
  padding: 72px 0;
}
@media (min-width: 768px) {
  .po-section {
    padding: 112px 0;
  }
}
.po-section-tint {
  background: var(--fi-green-200);
}
.po-split {
  display: grid;
  gap: 32px;
  align-items: center;
}
@media (min-width: 900px) {
  .po-split {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 64px;
  }
  .po-split-flip > :first-child {
    order: 2;
  }
}
.po-split img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  display: block;
}
.po-h2 {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(28px, 3.4vw, 48px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  color: var(--fi-black-900);
}
.po-prose {
  font-size: inherit;
  line-height: 1.55;
  max-width: 34rem;
}
.po-prose + .po-prose {
  margin-top: 16px;
}
.po-closer {
  font-weight: 600;
}

/* ---------- Use-case cards ---------- */
.po-group {
  margin-top: 40px;
}
.po-group-header {
  /* Rendered as an h3; globals.css gives h3 the serif, so reset it. */
  font-family: var(--font-sans);
  line-height: 1.4;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 500;
  color: var(--fi-green-600);
  margin: 0 0 14px;
}
.po-cards {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 640px) {
  .po-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .po-cards {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.po-card {
  position: relative;
  border: 20px solid transparent;
  border-image: url('/opportunity/ragged-band-green200.svg') 32 fill stretch;
  padding: 6px 8px 10px;
  filter: drop-shadow(0px 4px 5px rgba(134, 160, 120, 0.45));
  min-height: 100%;
}
.po-section-tint .po-card {
  border-image-source: url('/opportunity/ragged-band-green100.svg');
}
.po-card-n {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--fi-green-600);
  font-variant-numeric: tabular-nums;
}
.po-card h4 {
  margin: 6px 0 8px;
}
.po-card p {
  font-size: 15px;
  line-height: 1.45;
}
.po-later {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--fi-green-300);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  vertical-align: middle;
}

/* ---------- The object ---------- */
.po-object {
  display: grid;
  gap: 40px;
  align-items: center;
}
@media (min-width: 900px) {
  .po-object {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 72px;
  }
}
.po-object img {
  width: 100%;
  height: auto;
  display: block;
}
.po-specs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 18px;
}
.po-specs li {
  padding-top: 14px;
  border-top: 1px solid rgba(94, 123, 41, 0.35);
  font-size: 17px;
  line-height: 1.4;
}

/* ---------- Reserve card ---------- */
.po-reserve-wrap {
  padding: 72px 0;
  background: var(--fi-green-200);
}
.po-reserve {
  max-width: 34rem;
  margin: 0 auto;
  background: var(--fi-green-100);
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 8px 24px rgba(89, 102, 71, 0.18);
}
@media (min-width: 640px) {
  .po-reserve {
    padding: 40px;
  }
}
.po-reserve-title {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
}
.po-reserve-sub {
  font-size: 17px;
  margin-bottom: 20px;
}
.po-progress {
  height: 6px;
  border-radius: 999px;
  background: var(--fi-green-300);
  overflow: hidden;
}
.po-progress > span {
  display: block;
  height: 100%;
  background: var(--fi-green-500);
}
.po-count {
  margin-top: 8px;
  font-size: 14px;
  color: var(--fi-green-600);
}
.po-ship {
  margin: 18px 0 22px;
  font-size: 14px;
  color: var(--fi-green-600);
}
.po-form {
  display: grid;
  gap: 12px;
}
.po-small {
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--fi-green-600);
}
.po-error {
  font-size: 14px;
  color: #8a2f1c;
}
.po-code {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
  padding: 10px 16px;
  border-radius: 12px;
  background: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 20px;
  letter-spacing: 0.06em;
  user-select: all;
}
.po-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

/* ---------- FAQ ---------- */
.po-faq {
  display: grid;
  gap: 14px;
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 768px) {
  .po-faq {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ---------- Sticky nav ---------- */
.po-sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 40;
  display: flex;
  align-items: center;
  background: rgba(215, 221, 212, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(94, 123, 41, 0.25);
  transform: translateY(-100%);
  transition: transform 220ms ease;
}
.po-sticky.po-sticky-on {
  transform: none;
}
.po-sticky-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.po-sticky-name {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 22px;
}
.po-sticky-right {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
}
.po-sticky-right .po-btn {
  padding: 10px 18px;
  font-size: 14px;
}
@media (max-width: 639px) {
  .po-sticky-meta {
    display: none;
  }
}

/* ---------- Footer ---------- */
.po-footer {
  padding: 40px 0 56px;
  font-size: 13px;
  color: var(--fi-green-600);
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors from the three new files. (Errors elsewhere are pre-existing; note them but do not fix.)

- [ ] **Step 5: Commit**

```bash
npx prettier --write app/preorder/preorder.css app/preorder/useReveal.tsx app/preorder/HeroVideo.tsx
git add app/preorder/preorder.css app/preorder/useReveal.tsx app/preorder/HeroVideo.tsx
git commit -m "Preorder page styles, reveal hook, and hero video

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 8: Static sections, page, and layout

**Files:**
- Create: `app/preorder/track.ts`
- Create: `app/preorder/sections.tsx`
- Create: `app/preorder/PreorderClient.tsx` (first version; Task 9 adds the reserve card and sticky nav)
- Create: `app/preorder/page.tsx`
- Create: `app/preorder/layout.tsx`

**Interfaces:**
- Consumes: everything from `content.tsx` (Task 6), `Reveal` and `HeroVideo` (Task 7), `readFounderUnits`, `remainingUnits`, `parseSrc`, `completionCode`, `PreorderSrc` (Task 1).
- Produces:
  ```ts
  // sections.tsx
  export function Hero(props: { remaining: number; total: number; reserved: boolean; onReserve: () => void }): JSX.Element;
  export function Harness(): JSX.Element;
  export function UseCases(): JSX.Element;
  export function Kitchen(): JSX.Element;
  export function Privacy(): JSX.Element;
  export function ObjectSection(): JSX.Element;
  export function Faq(): JSX.Element;
  // track.ts
  export function track(name: string, params?: Record<string, unknown>): void;
  // PreorderClient.tsx
  export type PreorderProps = { src: PreorderSrc; total: number; remaining: number; codes: { reserved: string | null; declined: string | null } };
  export default function PreorderClient(props: PreorderProps): JSX.Element;
  ```

- [ ] **Step 0: Write the analytics helper**

Create `app/preorder/track.ts`:

```ts
/** Google Analytics event helper. gtag is loaded in app/layout.tsx and
 * typed in types/gtag.d.ts. No-op when it is absent (tests, blockers). */
export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
}
```

- [ ] **Step 1: Write the static sections**

Create `app/preorder/sections.tsx`:

```tsx
'use client';

import HeroVideo from './HeroVideo';
import { Reveal } from './useReveal';
import {
  HERO,
  HERO_MEDIA,
  HARNESS,
  USE_CASE_GROUPS,
  USE_CASES_IMAGE,
  KITCHEN,
  PRIVACY,
  OBJECT,
  FAQ,
} from './content';

/* eslint-disable @next/next/no-img-element */

export function Hero({
  remaining,
  total,
  reserved,
  onReserve,
}: {
  remaining: number;
  total: number;
  reserved: boolean;
  onReserve: () => void;
}) {
  const portrait = HERO_MEDIA.orientation === 'portrait';
  return (
    <section
      className={`po-hero ${portrait ? 'po-hero-portrait' : 'po-hero-landscape'}`}
      aria-label="The Flagship"
    >
      <div className="po-hero-media">
        <HeroVideo
          src={HERO_MEDIA.src}
          poster={HERO_MEDIA.poster}
          label={HERO_MEDIA.label}
          className="po-hero-video"
        />
        <div className="po-hero-scrim" aria-hidden="true" />
      </div>
      <div className="po-container po-hero-copy">
        <h1>{HERO.headline}</h1>
        <p className="po-hero-body">{HERO.body}</p>
        <ul className="po-pillars">
          {HERO.pillars.map(p => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="po-hero-offer">
          {reserved ? "You're in line for the Flagship." : HERO.offer}
        </p>
        <div className="po-hero-cta">
          <button
            type="button"
            className="po-btn po-btn-light"
            onClick={onReserve}
            disabled={reserved}
          >
            {reserved ? "You're in line" : 'Reserve a founder unit'}
          </button>
          <span className="po-hero-count po-tabular">
            {remaining === 0
              ? `All ${total} founder units reserved`
              : `${remaining} of ${total} remaining`}
          </span>
        </div>
      </div>
      <div className="po-scroll-cue" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}

function Chapter({
  line,
  image,
  alt,
}: {
  line: string;
  image: string;
  alt: string;
}) {
  return (
    <div className="po-chapter">
      <img src={image} alt={alt} loading="lazy" />
      <div className="po-container">
        <Reveal as="p" className="po-chapter-line">
          {line}
        </Reveal>
      </div>
    </div>
  );
}

export function Harness() {
  return (
    <section aria-labelledby="harness-h">
      <Chapter line={HARNESS.line} image={HARNESS.image} alt={HARNESS.alt} />
      <div className="po-section">
        <div className="po-container">
          <Reveal>
            <h2 id="harness-h" className="po-h2">
              One local agent, for the whole house.
            </h2>
            <p className="po-prose">{HARNESS.body}</p>
            <p className="po-prose po-closer">{HARNESS.closer}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function UseCases() {
  return (
    <section className="po-section po-section-tint" aria-labelledby="uses-h">
      <div className="po-container">
        <div className="po-split">
          <Reveal>
            <h2 id="uses-h" className="po-h2">
              What it does for your family.
            </h2>
            <p className="po-prose">
              Eight jobs a household already has. One assistant that does
              them without leaving the house.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <img
              src={USE_CASES_IMAGE.src}
              alt={USE_CASES_IMAGE.alt}
              loading="lazy"
            />
          </Reveal>
        </div>
        {USE_CASE_GROUPS.map(group => (
          <div key={group.header} className="po-group">
            <h3 className="po-group-header">{group.header}</h3>
            <ul className="po-cards">
              {group.items.map((item, i) => (
                <Reveal as="li" key={item.n} className="po-card" delay={i * 60}>
                  <div className="po-card-n">{String(item.n).padStart(2, '0')}</div>
                  <h4>
                    {item.name}
                    {item.later && (
                      <span className="po-later">Coming later</span>
                    )}
                  </h4>
                  <p>{item.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Kitchen() {
  return (
    <section aria-label="The kitchen shelf">
      <Chapter line={KITCHEN.line} image={KITCHEN.image} alt={KITCHEN.alt} />
      <div className="po-section">
        <div className="po-container">
          <Reveal>
            <p className="po-prose">{KITCHEN.body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Privacy() {
  return (
    <section aria-label="Nothing leaves the house">
      <Chapter line={PRIVACY.line} image={PRIVACY.image} alt={PRIVACY.alt} />
      <div className="po-section">
        <div className="po-container">
          <Reveal>
            <p className="po-prose">{PRIVACY.body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ObjectSection() {
  return (
    <section className="po-section" aria-labelledby="object-h">
      <div className="po-container">
        <div className="po-object">
          <Reveal>
            <img src={OBJECT.cad} alt={OBJECT.cadAlt} loading="lazy" />
          </Reveal>
          <div>
            <Reveal>
              <h2 id="object-h" className="po-h2">
                The object.
              </h2>
            </Reveal>
            <ul className="po-specs po-tabular">
              {OBJECT.specs.map((spec, i) => (
                <Reveal as="li" key={spec} delay={120 + i * 90}>
                  {spec}
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
        <div className="po-split po-split-flip" style={{ marginTop: 64 }}>
          <Reveal>
            <p className="po-prose">{OBJECT.body}</p>
          </Reveal>
          <Reveal delay={100}>
            <img src={OBJECT.photo} alt={OBJECT.photoAlt} loading="lazy" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="po-section" aria-labelledby="faq-h">
      <div className="po-container">
        <Reveal>
          <h2 id="faq-h" className="po-h2">
            Questions.
          </h2>
        </Reveal>
        <ul className="po-faq">
          {FAQ.map((item, i) => (
            <Reveal as="li" key={item.q} className="po-card" delay={i * 50}>
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write the first version of the client composer**

Create `app/preorder/PreorderClient.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PreorderSrc } from '@/lib/preorder';
import './preorder.css';
import { track } from './track';
import {
  Hero,
  Harness,
  UseCases,
  Kitchen,
  Privacy,
  ObjectSection,
  Faq,
} from './sections';

export type PreorderProps = {
  src: PreorderSrc;
  total: number;
  remaining: number;
  codes: { reserved: string | null; declined: string | null };
};

export default function PreorderClient({ src, total, remaining }: PreorderProps) {
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    track('preorder_view', { src });
  }, [src]);

  const scrollToReserve = useCallback(() => {
    track('reserve_click', { src, from: 'hero' });
    document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' });
  }, [src]);

  return (
    <main className="po-page">
      <Hero
        remaining={remaining}
        total={total}
        reserved={reserved}
        onReserve={scrollToReserve}
      />
      <Harness />
      <UseCases />
      <Kitchen />
      <Privacy />
      <ObjectSection />
      <section id="reserve" className="po-reserve-wrap">
        <div className="po-container">
          {/* Task 9 replaces this placeholder with ReserveCard. */}
          <div className="po-reserve">
            <button
              type="button"
              className="po-btn"
              onClick={() => setReserved(true)}
            >
              Reserve a founder unit
            </button>
          </div>
        </div>
      </section>
      <Faq />
      <footer className="po-footer">
        <div className="po-container">
          Family Intelligence. Designed and engineered in San Francisco and
          New York City.
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Write the server page and layout**

Create `app/preorder/page.tsx`:

```tsx
import PreorderClient from './PreorderClient';
import {
  completionCode,
  parseSrc,
  readFounderUnits,
  remainingUnits,
} from '@/lib/preorder';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PreorderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const src = parseSrc(params.src);
  const { total, reserved } = readFounderUnits(process.env);
  const remaining = remainingUnits(total, reserved);
  // Only Prolific traffic receives the codes; they ship in the RSC payload.
  const codes =
    src === 'prolific'
      ? {
          reserved: completionCode('reserved', process.env),
          declined: completionCode('declined', process.env),
        }
      : { reserved: null, declined: null };
  return (
    <PreorderClient src={src} total={total} remaining={remaining} codes={codes} />
  );
}
```

Create `app/preorder/layout.tsx`:

```tsx
import type { Metadata } from 'next';

const title = 'Reserve the Flagship · Family Intelligence';
const description =
  'The most capable AI assistant you can put in a home. $899 at launch. Hold one of 250 founder units with a $49 refundable deposit.';
const shareImage = '/research/fam-og-image.png';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [{ url: shareImage }] },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [shareImage],
  },
};

export default function PreorderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/preorder`
Expected: no errors in `app/preorder`.

- [ ] **Step 5: Smoke test in dev**

Run in the background: `npm run dev -- --port 3101`
Then: `curl -s http://localhost:3101/preorder | grep -o "Take better care of your family than ever before." | head -1`
Expected: the headline prints. Also: `curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3101/preorder?src=prolific"` prints `200`. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
npx prettier --write app/preorder/track.ts app/preorder/sections.tsx app/preorder/PreorderClient.tsx app/preorder/page.tsx app/preorder/layout.tsx
git add app/preorder
git commit -m "Preorder page: hero, chapters, use cases, object, FAQ

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 9: Reserve card, sticky nav, and Prolific mode

**Files:**
- Create: `app/preorder/ReserveCard.tsx`
- Create: `app/preorder/StickyNav.tsx`
- Modify: `app/preorder/PreorderClient.tsx` (replace the placeholder and wire state)

**Interfaces:**
- Consumes: `RESERVE` from `content.tsx`; `track` from `track.ts`; `PreorderSrc`, `ReserveOutcome`, `ProlificOutcome` from `lib/preorder.ts`; the `/api/reserve` contract from Task 4.
- Produces:
  ```ts
  // ReserveCard.tsx
  export type ReserveState = 'idle' | 'reserved' | 'waitlisted' | 'prolific-reserved' | 'prolific-declined';
  export default function ReserveCard(props: { src: PreorderSrc; total: number; remaining: number; codes: { reserved: string | null; declined: string | null }; state: ReserveState; onState: (s: ReserveState) => void }): JSX.Element;
  // StickyNav.tsx
  export default function StickyNav(props: { remaining: number; total: number; reserved: boolean; onReserve: () => void }): JSX.Element;
  ```

- [ ] **Step 1: Write the reserve card**

Create `app/preorder/ReserveCard.tsx`:

```tsx
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { PreorderSrc, ReserveOutcome } from '@/lib/preorder';
import { RESERVE } from './content';
import { track } from './track';

export type ReserveState =
  | 'idle'
  | 'reserved'
  | 'waitlisted'
  | 'prolific-reserved'
  | 'prolific-declined';

const PROLIFIC_KEY = 'preorder:prolific';

function readProlificState(): ReserveState | null {
  try {
    const v = window.sessionStorage.getItem(PROLIFIC_KEY);
    return v === 'prolific-reserved' || v === 'prolific-declined' ? v : null;
  } catch {
    return null;
  }
}

function writeProlificState(s: ReserveState) {
  try {
    window.sessionStorage.setItem(PROLIFIC_KEY, s);
  } catch {
    /* private mode: the in-memory state still works for this page load */
  }
}

export default function ReserveCard({
  src,
  total,
  remaining,
  codes,
  state,
  onState,
}: {
  src: PreorderSrc;
  total: number;
  remaining: number;
  codes: { reserved: string | null; declined: string | null };
  state: ReserveState;
  onState: (s: ReserveState) => void;
}) {
  const soldOut = remaining === 0;
  const prolific = src === 'prolific';
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Rehydrate a Prolific outcome so a refresh shows the same code.
  useEffect(() => {
    if (!prolific) return;
    const stored = readProlificState();
    if (stored) onState(stored);
  }, [prolific, onState]);

  const filled = total === 0 ? 100 : Math.round(((total - remaining) / total) * 100);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const outcome: ReserveOutcome = soldOut ? 'waitlist' : 'reserve';
    track('reserve_click', { src, from: 'card', outcome });
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, src, outcome }),
      });
      const data = (await res.json()) as
        | { success: true; status: ReserveOutcome }
        | { success: false; message: string };
      if (res.ok && data.success) {
        track('reserved', { src, outcome });
        onState(outcome === 'reserve' ? 'reserved' : 'waitlisted');
      } else {
        setError(data.success ? null : data.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function choose(outcome: 'reserved' | 'declined') {
    const next: ReserveState = `prolific-${outcome}`;
    track('reserve_click', { src, from: 'card', outcome });
    if (outcome === 'reserved') track('reserved', { src, outcome: 'prolific' });
    writeProlificState(next);
    onState(next);
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* selection is still available via user-select: all */
    }
  }

  const progress = (
    <>
      <div
        className="po-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={total - remaining}
        aria-label="Founder units reserved"
      >
        <span style={{ width: `${filled}%` }} />
      </div>
      <p className="po-count po-tabular">
        {soldOut
          ? RESERVE.waitlist.count
          : `${remaining} of ${total} founder units remaining`}
      </p>
    </>
  );

  if (state === 'prolific-reserved' || state === 'prolific-declined') {
    const code = state === 'prolific-reserved' ? codes.reserved : codes.declined;
    return (
      <div className="po-reserve" aria-live="polite">
        <h2 className="po-reserve-title">You're done.</h2>
        {code ? (
          <>
            <p className="po-reserve-sub">{RESERVE.prolific.thanks}</p>
            <div className="po-code">
              <span>{code}</span>
              <button
                type="button"
                className="po-btn po-btn-quiet"
                onClick={() => copyCode(code)}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="po-small">Return to Prolific to finish.</p>
          </>
        ) : (
          <p className="po-reserve-sub">{RESERVE.prolific.noCode}</p>
        )}
      </div>
    );
  }

  if (state === 'reserved' || state === 'waitlisted') {
    const done = state === 'reserved' ? RESERVE.reserved : RESERVE.waitlisted;
    return (
      <div className="po-reserve" aria-live="polite">
        <h2 className="po-reserve-title">{done.title}</h2>
        <p className="po-reserve-sub">{done.body}</p>
        {progress}
        <p className="po-small">
          Check your inbox for a confirmation. Reply to it with any question.
        </p>
      </div>
    );
  }

  return (
    <div className="po-reserve">
      <h2 className="po-reserve-title">{RESERVE.title}</h2>
      <p className="po-reserve-sub">{RESERVE.sub}</p>
      {progress}
      <p className="po-ship">{RESERVE.ship}</p>
      {prolific ? (
        <div className="po-choice">
          <button
            type="button"
            className="po-btn"
            onClick={() => choose('reserved')}
          >
            {RESERVE.prolific.reserve}
          </button>
          <button
            type="button"
            className="po-btn po-btn-quiet"
            onClick={() => choose('declined')}
          >
            {RESERVE.prolific.decline}
          </button>
        </div>
      ) : (
        <form className="po-form" onSubmit={submit} noValidate>
          <label className="sr-only" htmlFor="reserve-email">
            Email address
          </label>
          <input
            id="reserve-email"
            className="po-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={busy}
          />
          <button type="submit" className="po-btn" disabled={busy}>
            {busy
              ? 'One moment'
              : soldOut
                ? RESERVE.waitlist.button
                : RESERVE.button}
          </button>
          {error && (
            <p className="po-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
      <p className="po-small">
        {soldOut ? RESERVE.waitlist.smallPrint : RESERVE.smallPrint}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Write the sticky nav**

Create `app/preorder/StickyNav.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';

/** Apple-style local nav that slides in once the hero is off screen. */
export default function StickyNav({
  remaining,
  total,
  reserved,
  onReserve,
}: {
  remaining: number;
  total: number;
  reserved: boolean;
  onReserve: () => void;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.po-hero');
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setOn(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`po-sticky ${on ? 'po-sticky-on' : ''}`} aria-hidden={!on}>
      <div className="po-container po-sticky-inner">
        <span className="po-sticky-name">Flagship</span>
        <div className="po-sticky-right">
          <span className="po-sticky-meta po-tabular">
            {reserved
              ? "You're in line"
              : remaining === 0
                ? `All ${total} founder units reserved`
                : `$49 deposit · ${remaining} of ${total} remaining`}
          </span>
          <button
            type="button"
            className="po-btn"
            onClick={onReserve}
            disabled={reserved}
            tabIndex={on ? 0 : -1}
          >
            {reserved ? 'Reserved' : remaining === 0 ? 'Waitlist' : 'Reserve'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire them into the composer**

Replace the whole of `app/preorder/PreorderClient.tsx` with:

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PreorderSrc } from '@/lib/preorder';
import './preorder.css';
import { track } from './track';
import {
  Hero,
  Harness,
  UseCases,
  Kitchen,
  Privacy,
  ObjectSection,
  Faq,
} from './sections';
import ReserveCard, { type ReserveState } from './ReserveCard';
import StickyNav from './StickyNav';

export type PreorderProps = {
  src: PreorderSrc;
  total: number;
  remaining: number;
  codes: { reserved: string | null; declined: string | null };
};

export default function PreorderClient({
  src,
  total,
  remaining,
  codes,
}: PreorderProps) {
  const [state, setState] = useState<ReserveState>('idle');
  const prolific = src === 'prolific';
  // A Prolific decline leaves the hero button live; the card shows the code.
  const reserved =
    state === 'reserved' ||
    state === 'waitlisted' ||
    state === 'prolific-reserved';

  useEffect(() => {
    track('preorder_view', { src });
  }, [src]);

  const scrollToReserve = useCallback(
    (from: 'hero' | 'sticky') => {
      track('reserve_click', { src, from });
      document
        .getElementById('reserve')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [src]
  );

  return (
    <main className="po-page">
      {!prolific && (
        <StickyNav
          remaining={remaining}
          total={total}
          reserved={reserved}
          onReserve={() => scrollToReserve('sticky')}
        />
      )}
      <Hero
        remaining={remaining}
        total={total}
        reserved={reserved}
        onReserve={() => scrollToReserve('hero')}
      />
      <Harness />
      <UseCases />
      <Kitchen />
      <Privacy />
      <ObjectSection />
      <section id="reserve" className="po-reserve-wrap">
        <div className="po-container">
          <ReserveCard
            src={src}
            total={total}
            remaining={remaining}
            codes={codes}
            state={state}
            onState={setState}
          />
        </div>
      </section>
      <Faq />
      <footer className="po-footer">
        <div className="po-container">
          Family Intelligence. Designed and engineered in San Francisco and
          New York City.
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 4: Type-check, lint, full test run**

(Tailwind v4 generates `.sr-only` from the class name in `ReserveCard.tsx`; nothing to add.)

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/preorder lib tests && npm test`
Expected: clean, and all test files pass.

- [ ] **Step 5: Smoke test the API and page in dev**

Run in the background: `npm run dev -- --port 3101`
Then:

```bash
curl -s -X POST http://localhost:3101/api/reserve -H 'content-type: application/json' -d '{"email":"nope","outcome":"reserve"}'
```
Expected: `{"success":false,"message":"Please enter a valid email address."}`

```bash
curl -s http://localhost:3101/preorder?src=prolific | grep -c "No thanks, I&#x27;m not interested"
```
Expected: `1` (React escapes the apostrophe). Stop the dev server.

- [ ] **Step 6: Commit**

```bash
npx prettier --write app/preorder
git add app/preorder
git commit -m "Preorder page: reserve card, sticky nav, Prolific completion codes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

---

### Task 10: Visual verification and build

**Files:**
- No new files. Screenshots go to the scratchpad directory, not the repo.

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: succeeds, and the route list shows `/preorder` as dynamic (ƒ) and `/api/reserve`.

- [ ] **Step 2: Screenshot the page at phone and desktop widths**

Run in the background: `npm run start -- --port 3102`
Then, using Playwright via npx (no install into the repo):

```bash
S=/private/tmp/claude-501/-Users-hhff-Documents-Code-intelligence-family/e2df7e7e-a267-4187-b816-210ed3e11651/scratchpad
npx --yes playwright@1.61.1 screenshot --viewport-size=390,844 --full-page "http://localhost:3102/preorder" "$S/preorder-phone.png"
npx --yes playwright@1.61.1 screenshot --viewport-size=1440,900 --full-page "http://localhost:3102/preorder" "$S/preorder-desktop.png"
npx --yes playwright@1.61.1 screenshot --viewport-size=1440,900 "http://localhost:3102/preorder?src=prolific" "$S/preorder-prolific.png"
```

If `npx playwright screenshot` fails because browsers are not installed, run `npx --yes playwright@1.61.1 install chromium` once and retry.

- [ ] **Step 3: Review the screenshots**

Open each PNG with the Read tool and check against the spec:

- Hero fills the first viewport. On desktop the portrait clip stands on the right on a dark ground with copy on the left. On phone the copy sits over the scrim at the bottom and is legible.
- Chapter lines are readable over their images.
- Use-case cards show 01 to 08 with two group headers and "Coming later" on 08.
- Reserve card shows the progress bar and "250 of 250 founder units remaining".
- Prolific view shows two buttons and no email field, and no sticky nav.
- Nothing overflows horizontally on the phone screenshot.

Fix any visual defect in `preorder.css` or `sections.tsx`, re-screenshot, and repeat until the list passes. Stop the server.

- [ ] **Step 4: Commit any fixes**

```bash
npx prettier --write app/preorder
git add app/preorder
git commit -m "Preorder page: visual fixes from screenshot review

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018zW9RqKzDTuqJuFPLZZr2D"
```

Skip the commit if nothing changed.
