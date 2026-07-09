# Email OTP Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email one-time-password verification to the `/fundraising` inline gate so content unlocks and the Garden3D CRM is contacted only after the visitor proves control of a real email address.

**Architecture:** Two Next.js App Router route handlers (`/api/request-code`, `/api/verify-code`) own the flow. A 6-digit code is sealed into an encrypted `iron-session` cookie on the visitor's browser (no database). Resend delivers the code email directly from the server. The CRM POST happens only inside `/api/verify-code` on success. The existing client-side `localStorage` flag remains the unlock signal.

**Tech Stack:** Next.js 16 (App Router, Turbopack), TypeScript, `iron-session` (cookie sealing), `resend` (email), `@dotenvx/dotenvx` (encrypted env), `vitest` (server-side tests).

## Global Constraints

(Copied verbatim from `docs/superpowers/specs/2026-07-09-email-otp-verification-design.md`.)

- Code is **6 numeric digits**.
- Code expiry: **15 minutes (900s)**.
- Max **5 verification attempts** per code; on the 5th failure the code is invalidated.
- Resend cooldown: **60 seconds**.
- Code comparison is **constant-time** (`crypto.timingSafeEqual`).
- Pending-code cookie name: `fi_pending`. Flags: `httpOnly`, `secure`, `sameSite='lax'`, `path='/'`, `maxAge=900`.
- Code is stored in the cookie as a **sha256 hash** (not plaintext): `sha256(SESSION_SECRET + ':' + code)` hex.
- CRM source allowlist (verbatim): `['g3d:family_intelligence', 'g3d:family_intelligence:fundraising']`; default `'g3d:family_intelligence'`.
- CRM endpoint: `POST https://stacks.garden3d.net/api/contacts` with header `X-Api-Key: $STACKS_API_KEY`, body `{ email, sources: [source] }`. Email is lowercased + trimmed first.
- Unlock contract: client sets `localStorage.fi_fundraising_unlocked = '1'` and calls the existing `onSuccess` (`app/fundraising/page.tsx:42` `handleUnlock`). Do not change `app/fundraising/page.tsx`.
- `/api/request-code` always returns the same response shape (no email enumeration).
- Env vars (encrypted `.env`, dotenvx): `SESSION_SECRET` (≥32 chars), `RESEND_API_KEY`, `RESEND_FROM` (`Family Intelligence <verify@intelligence.family>`), `STACKS_API_KEY`.
- Retire `www/app/api/subscribe/route.ts` and the `appendTimestampToEmail` hack.
- No new comments unless requested. Follow existing code style (no semicolons — see `app/fundraising/page.tsx`).

---

## File Structure

- **Create** `www/lib/otp.ts` — pure code utilities (`generateCode`, `hashCode`, `verifyCode`, `isExpired`).
- **Create** `www/lib/rate-limit.ts` — in-memory per-IP rate limiter (`consume`).
- **Create** `www/lib/pending-session.ts` — iron-session seal/unseal + cookie read (NextRequest) / write (NextResponse).
- **Create** `www/lib/crm.ts` — `createCrmContact(email, source)` with source allowlist.
- **Create** `www/lib/email.ts` — `sendOtpEmail(email, code)` via the `resend` SDK.
- **Create** `www/app/api/request-code/route.ts` — request endpoint.
- **Create** `www/app/api/verify-code/route.ts` — verify endpoint.
- **Modify** `www/components/InlineEmailGate.tsx` — add the code-entry step.
- **Modify** `www/package.json` — deps + `dotenvx run --` scripts.
- **Modify** `www/.gitignore` — commit encrypted `.env`, ignore `.env.keys` / `.env*.local`.
- **Modify** `www/.env.example` — document new keys (placeholders only).
- **Delete** `www/app/api/subscribe/route.ts`.
- **Create** `www/vitest.config.ts` — test config.
- **Create** `www/tests/` — unit + route tests.

---

## Task 1: Project setup (deps, dotenvx, vitest)

**Files:**
- Create: `www/vitest.config.ts`
- Create: `www/tests/sanity.test.ts`
- Create: `www/.env` (encrypted), `www/.env.keys`
- Modify: `www/package.json` (deps + scripts)
- Modify: `www/.gitignore`
- Modify: `www/.env.example`

**Interfaces:**
- Produces: a working `npm run test` (vitest) command, a working `dotenvx run -- next dev`, committed encrypted `www/.env`, gitignored `www/.env.keys`, and env vars `SESSION_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `STACKS_API_KEY` available at runtime.

**Plan-level decision (deviation from spec, with rationale):** The spec lists `iron-session` and `resend` as deps. We keep both. We additionally add `vitest`. We use `iron-session`'s `sealData`/`unsealData` exports for cookie sealing (not `getIronSession`) so route handlers are testable without mocking `next/headers`. If `sealData`/`unsealData` are not exported by the installed `iron-session` version, fall back to `@hapi/iron` (`Iron.seal`/`Iron.unseal`) — but try `iron-session` first.

- [ ] **Step 1: Install dependencies**

Run from `www/`:
```bash
npm install iron-session resend
npm install -D vitest @dotenvx/dotenvx
```

- [ ] **Step 2: Verify iron-session exports sealData/unsealData**

Run:
```bash
node -e "const m = require('iron-session'); console.log('sealData' in m, 'unsealData' in m)"
```
Expected: prints `true true`. If `false false`, install `@hapi/iron` (`npm install @hapi/iron`) and Task 4 will use `Iron.seal`/`Iron.unseal` instead. Record which path applies.

- [ ] **Step 3: Wrap scripts with dotenvx**

Replace the `scripts` block in `www/package.json` with:
```json
"scripts": {
  "dev": "dotenvx run -- next dev",
  "build": "dotenvx run -- next build",
  "start": "dotenvx run -- next start",
  "lint": "eslint",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "lighthouse": "npx @lhci/cli autorun",
  "test": "vitest run",
  "test:watch": "vitest"
},
```

- [ ] **Step 4: Create the encrypted .env via dotenvx**

From the repo root (so paths are explicit), generate a 32+ char secret and set each value. Run:
```bash
cd www
npx dotenvx set SESSION_SECRET "$(openssl rand -hex 32)"
npx dotenvx set RESEND_API_KEY "re_test_placeholder_replace_me"
npx dotenvx set RESEND_FROM "Family Intelligence <verify@intelligence.family>"
npx dotenvx set STACKS_API_KEY "placeholder_replace_with_real_stacks_key"
```
This creates `www/.env` (encrypted, committed) and `www/.env.keys` (private key, gitignored). The `SESSION_SECRET` value is real and generated; the other three are placeholders to be replaced before deploy.

- [ ] **Step 5: Update .gitignore**

In `www/.gitignore`, find the block:
```
# env files (can opt-in for committing if needed)
.env*
!.env.example
```
Replace it with:
```
# dotenvx: encrypted .env IS safe to commit; .env.keys is the secret — NEVER commit
.env.keys
.env*.local
!.env.example
```

- [ ] **Step 6: Update .env.example**

Overwrite `www/.env.example` with placeholders (plaintext, for documentation):
```
SESSION_SECRET=
RESEND_API_KEY=
RESEND_FROM=Family Intelligence <verify@intelligence.family>
STACKS_API_KEY=
```

- [ ] **Step 7: Verify .env.keys is ignored and .env is not**

Run from repo root:
```bash
cd .. && git check-ignore www/.env.keys && echo "ignored OK"
git check-ignore www/.env && echo "WARN: .env is ignored" || echo ".env will be tracked OK"
```
Expected: `ignored OK` for `.env.keys`; `.env will be tracked OK` (i.e., `.env` is NOT ignored).

- [ ] **Step 8: Create vitest config**

Create `www/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
  },
})
```

> The `@` alias must match `tsconfig.json` (`"@/*": ["./*"]`, i.e. the `www/` root). Route handlers import `@/lib/...`, so tests that import a route need this alias to resolve. Tests mock modules via their relative path (e.g. `vi.mock('../lib/email')`); because the alias resolves `@/lib/email` to the same absolute path, the mock intercepts the route's import.

Create `www/tests/setup.ts`:
```ts
process.env.SESSION_SECRET = 'test-session-secret-at-least-32-characters-long-xx'
process.env.RESEND_API_KEY = 're_test_key'
process.env.RESEND_FROM = 'Test <test@example.com>'
process.env.STACKS_API_KEY = 'test-stacks-key'
```

Create `www/tests/sanity.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 9: Run the test suite**

Run from `www/`:
```bash
npm run test
```
Expected: `1 passed`, exit code 0.

- [ ] **Step 10: Verify dotenvx decrypts locally**

Run from `www/`:
```bash
npx dotenvx get SESSION_SECRET
```
Expected: prints the generated 64-char hex secret (proves `.env.keys` decrypts `.env`).

- [ ] **Step 11: Commit**

```bash
git add www/package.json www/package-lock.json www/.env www/.env.example www/.gitignore www/vitest.config.ts www/tests/setup.ts www/tests/sanity.test.ts
git commit -m "Add dotenvx encrypted env + vitest harness for OTP work"
```
Do NOT add `www/.env.keys`.

---

## Task 2: OTP code utilities (`www/lib/otp.ts`)

**Files:**
- Create: `www/lib/otp.ts`
- Test: `www/tests/otp.test.ts`

**Interfaces:**
- Produces:
  - `generateCode(): string` — returns a 6-digit zero-padded numeric string.
  - `hashCode(code: string): string` — returns `sha256(SESSION_SECRET + ':' + code)` hex.
  - `verifyCode(submitted: string, storedHash: string): boolean` — constant-time compare; length-mismatch returns `false` without throwing.
  - `isExpired(expiresAt: number, now = Date.now()): boolean`.

- [ ] **Step 1: Write the failing test**

Create `www/tests/otp.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { generateCode, hashCode, verifyCode, isExpired } from '../lib/otp'

describe('generateCode', () => {
  it('returns 6 digits', () => {
    for (let i = 0; i < 50; i++) {
      const c = generateCode()
      expect(c).toMatch(/^\d{6}$/)
    }
  })
})

describe('hashCode / verifyCode', () => {
  it('verifies the correct code', () => {
    const hash = hashCode('123456')
    expect(verifyCode('123456', hash)).toBe(true)
  })
  it('rejects a wrong code', () => {
    const hash = hashCode('123456')
    expect(verifyCode('123457', hash)).toBe(false)
  })
  it('does not throw on length mismatch', () => {
    const hash = hashCode('123456')
    expect(verifyCode('short', hash)).toBe(false)
  })
})

describe('isExpired', () => {
  it('expires after the deadline', () => {
    const now = 10_000
    expect(isExpired(9_000, now)).toBe(true)
    expect(isExpired(11_000, now)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- otp`
Expected: FAIL with `Cannot find module '../lib/otp'`.

- [ ] **Step 3: Write the implementation**

Create `www/lib/otp.ts`:
```ts
import { createHash, randomInt, timingSafeEqual } from 'node:crypto'

const CODE_MIN = 0
const CODE_MAX_EXCLUSIVE = 1_000_000

export function generateCode(): string {
  return String(randomInt(CODE_MIN, CODE_MAX_EXCLUSIVE)).padStart(6, '0')
}

export function hashCode(code: string): string {
  const secret = process.env.SESSION_SECRET ?? ''
  return createHash('sha256').update(`${secret}:${code}`).digest('hex')
}

export function verifyCode(submitted: string, storedHash: string): boolean {
  const computed = hashCode(submitted)
  const a = Buffer.from(computed, 'utf8')
  const b = Buffer.from(storedHash, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function isExpired(expiresAt: number, now: number = Date.now()): boolean {
  return now >= expiresAt
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- otp`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add www/lib/otp.ts www/tests/otp.test.ts
git commit -m "Add OTP code utilities (generate/hash/verify/expire)"
```

---

## Task 3: Rate limiter (`www/lib/rate-limit.ts`)

**Files:**
- Create: `www/lib/rate-limit.ts`
- Test: `www/tests/rate-limit.test.ts`

**Interfaces:**
- Produces: `consume(key: string, limit: number, windowMs: number, now = Date.now()): boolean` — returns `true` if the request is allowed (under limit for the rolling window), `false` if denied. In-memory; resets per-instance (documented limitation).

- [ ] **Step 1: Write the failing test**

Create `www/tests/rate-limit.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { consume, _resetForTests } from '../lib/rate-limit'

beforeEach(() => _resetForTests())

describe('consume', () => {
  it('allows up to the limit within the window', () => {
    expect(consume('1.2.3.4', 3, 1000, 0)).toBe(true)
    expect(consume('1.2.3.4', 3, 1000, 10)).toBe(true)
    expect(consume('1.2.3.4', 3, 1000, 20)).toBe(true)
    expect(consume('1.2.3.4', 3, 1000, 30)).toBe(false)
  })
  it('resets after the window', () => {
    expect(consume('1.2.3.4', 2, 1000, 0)).toBe(true)
    expect(consume('1.2.3.4', 2, 1000, 10)).toBe(true)
    expect(consume('1.2.3.4', 2, 1000, 1001)).toBe(true)
  })
  it('tracks keys independently', () => {
    expect(consume('a', 1, 1000, 0)).toBe(true)
    expect(consume('b', 1, 1000, 0)).toBe(true)
    expect(consume('a', 1, 1000, 1)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- rate-limit`
Expected: FAIL with `Cannot find module '../lib/rate-limit'`.

- [ ] **Step 3: Write the implementation**

Create `www/lib/rate-limit.ts`:
```ts
type Bucket = { count: number; windowStart: number }

const buckets = new Map<string, Bucket>()

export function consume(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): boolean {
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return 1 <= limit
  }
  bucket.count += 1
  return bucket.count <= limit
}

export function _resetForTests(): void {
  buckets.clear()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- rate-limit`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add www/lib/rate-limit.ts www/tests/rate-limit.test.ts
git commit -m "Add in-memory per-IP rate limiter"
```

---

## Task 4: Pending session seal/unseal (`www/lib/pending-session.ts`)

**Files:**
- Create: `www/lib/pending-session.ts`
- Test: `www/tests/pending-session.test.ts`

**Interfaces:**
- Consumes: `iron-session` `sealData`/`unsealData` (or `@hapi/iron` fallback per Task 1 Step 2).
- Produces:
  - `type PendingSession = { email: string; codeHash: string; attempts: number; expiresAt: number; resendAt: number; source: string }`
  - `sealPending(session: PendingSession): Promise<string>`
  - `unsealPending(seal: string): Promise<PendingSession | null>`
  - `readPendingCookie(req: NextRequest): Promise<PendingSession | null>`
  - `setPendingCookie(res: NextResponse, seal: string): void`
  - `clearPendingCookie(res: NextResponse): void`
  - Cookie name constant `PENDING_COOKIE = 'fi_pending'`, `PENDING_TTL_MS = 900_000`.

- [ ] **Step 1: Write the failing test**

Create `www/tests/pending-session.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { sealPending, unsealPending, PENDING_TTL_MS } from '../lib/pending-session'

const session = {
  email: 'a@b.com',
  codeHash: 'deadbeef',
  attempts: 0,
  expiresAt: 123,
  resendAt: 456,
  source: 'g3d:family_intelligence',
}

describe('pending session seal round-trip', () => {
  it('round-trips the session', async () => {
    const seal = await sealPending(session)
    expect(typeof seal).toBe('string')
    const back = await unsealPending(seal)
    expect(back).toEqual(session)
  })
  it('returns null for a tampered seal', async () => {
    const seal = await sealPending(session)
    const tampered = seal.slice(0, -2) + 'XX'
    expect(await unsealPending(tampered)).toBeNull()
  })
  it('exposes the 15-minute TTL', () => {
    expect(PENDING_TTL_MS).toBe(900_000)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- pending-session`
Expected: FAIL with `Cannot find module '../lib/pending-session'`.

- [ ] **Step 3: Write the implementation**

> If Task 1 Step 2 confirmed `iron-session` exports `sealData`/`unsealData`, use them as below. If not, import `{ Iron } from '@hapi/iron'` and use `Iron.seal(session, process.env.SESSION_SECRET!, Iron.defaults)` / `Iron.unseal(seal, process.env.SESSION_SECRET!, Iron.defaults)`, wrapping errors the same way.

Create `www/lib/pending-session.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { sealData, unsealData } from 'iron-session'

export const PENDING_COOKIE = 'fi_pending'
export const PENDING_TTL_MS = 900_000 // 15 minutes

export type PendingSession = {
  email: string
  codeHash: string
  attempts: number
  expiresAt: number
  resendAt: number
  source: string
}

function password(): string {
  const pw = process.env.SESSION_SECRET
  if (!pw || pw.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters')
  }
  return pw
}

export async function sealPending(session: PendingSession): Promise<string> {
  return sealData(session, { password })
}

export async function unsealPending(seal: string): Promise<PendingSession | null> {
  try {
    return (await unsealData(seal, { password })) as PendingSession
  } catch {
    return null
  }
}

export async function readPendingCookie(req: NextRequest): Promise<PendingSession | null> {
  const seal = req.cookies.get(PENDING_COOKIE)?.value
  if (!seal) return null
  return unsealPending(seal)
}

export function setPendingCookie(res: NextResponse, seal: string): void {
  res.cookies.set({
    name: PENDING_COOKIE,
    value: seal,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(PENDING_TTL_MS / 1000),
  })
}

export function clearPendingCookie(res: NextResponse): void {
  res.cookies.set({ name: PENDING_COOKIE, value: '', path: '/', maxAge: 0 })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- pending-session`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add www/lib/pending-session.ts www/tests/pending-session.test.ts
git commit -m "Add iron-session pending-code cookie helpers"
```

---

## Task 5: CRM client (`www/lib/crm.ts`)

**Files:**
- Create: `www/lib/crm.ts`
- Test: `www/tests/crm.test.ts`

**Interfaces:**
- Produces: `createCrmContact(email: string, source?: string): Promise<{ ok: boolean; status: 'created' | 'rejected_source' | 'error' }>` — lowercases/trims the email, enforces the source allowlist (default `'g3d:family_intelligence'`), and POSTs to `https://stacks.garden3d.net/api/contacts`. Never throws on network/HTTP errors — returns `{ ok: false, status: 'error' }`.

- [ ] **Step 1: Write the failing test**

Create `www/tests/crm.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCrmContact, ALLOWED_SOURCES } from '../lib/crm'

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('ALLOWED_SOURCES', () => {
  it('matches the spec allowlist', () => {
    expect(ALLOWED_SOURCES).toEqual([
      'g3d:family_intelligence',
      'g3d:family_intelligence:fundraising',
    ])
  })
})

describe('createCrmContact', () => {
  it('POSTs a normalized email with the default source', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await createCrmContact('  A@B.COM ')
    expect(result).toEqual({ ok: true, status: 'created' })
    expect(fetchMock).toHaveBeenCalledOnce()
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body).toEqual({ email: 'a@b.com', sources: ['g3d:family_intelligence'] })
    expect(init.headers['X-Api-Key']).toBe('test-stacks-key')
  })

  it('rejects an unknown source before contacting the CRM', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const result = await createCrmContact('a@b.com', 'evil:source')
    expect(result).toEqual({ ok: false, status: 'rejected_source' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts an allowlisted source', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await createCrmContact('a@b.com', 'g3d:family_intelligence:fundraising')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(result).toEqual({ ok: true, status: 'created' })
    expect(body.sources).toEqual(['g3d:family_intelligence:fundraising'])
  })

  it('returns error status on HTTP failure without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })))
    const result = await createCrmContact('a@b.com')
    expect(result).toEqual({ ok: false, status: 'error' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- crm`
Expected: FAIL with `Cannot find module '../lib/crm'`.

- [ ] **Step 3: Write the implementation**

Create `www/lib/crm.ts`:
```ts
export const ALLOWED_SOURCES = [
  'g3d:family_intelligence',
  'g3d:family_intelligence:fundraising',
] as const

const DEFAULT_SOURCE = 'g3d:family_intelligence'
const CRM_URL = 'https://stacks.garden3d.net/api/contacts'

type CrmResult = { ok: boolean; status: 'created' | 'rejected_source' | 'error' }

export async function createCrmContact(
  email: string,
  source?: string
): Promise<CrmResult> {
  const resolvedSource =
    typeof source === 'string' && (ALLOWED_SOURCES as readonly string[]).includes(source)
      ? source
      : DEFAULT_SOURCE

  if (source && resolvedSource !== source) {
    return { ok: false, status: 'rejected_source' }
  }

  const normalizedEmail = email.toLowerCase().trim()
  const apiKey = process.env.STACKS_API_KEY

  try {
    const res = await fetch(CRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey ?? '',
      },
      body: JSON.stringify({ email: normalizedEmail, sources: [resolvedSource] }),
    })
    return res.ok ? { ok: true, status: 'created' } : { ok: false, status: 'error' }
  } catch {
    return { ok: false, status: 'error' }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- crm`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add www/lib/crm.ts www/tests/crm.test.ts
git commit -m "Add Garden3D CRM client with source allowlist"
```

---

## Task 6: Email client (`www/lib/email.ts`)

**Files:**
- Create: `www/lib/email.ts`
- Test: `www/tests/email.test.ts`

**Interfaces:**
- Produces: `sendOtpEmail(email: string, code: string): Promise<boolean>` — returns `true` on success, `false` on error. Uses the `resend` SDK with `RESEND_API_KEY` and `RESEND_FROM`. Plain-text body, brand name "Family Intelligence", code prominent, notes 15-minute expiry.

- [ ] **Step 1: Write the failing test**

Create `www/tests/email.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const sendMock = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}))

import { sendOtpEmail } from '../lib/email'

beforeEach(() => {
  sendMock.mockReset()
})

describe('sendOtpEmail', () => {
  it('sends the code and returns true on success', async () => {
    sendMock.mockResolvedValue({ data: { id: 'msg_1' }, error: null })
    const ok = await sendOtpEmail('user@example.com', '123456')
    expect(ok).toBe(true)
    expect(sendMock).toHaveBeenCalledOnce()
    const payload = sendMock.mock.calls[0][0]
    expect(payload.to).toBe('user@example.com')
    expect(payload.from).toContain('verify@intelligence.family')
    expect(payload.text).toContain('123456')
  })

  it('returns false on error', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const ok = await sendOtpEmail('user@example.com', '123456')
    expect(ok).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- email`
Expected: FAIL with `Cannot find module '../lib/email'`.

- [ ] **Step 3: Write the implementation**

Create `www/lib/email.ts`:
```ts
import { Resend } from 'resend'

export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const from = process.env.RESEND_FROM ?? 'Family Intelligence <verify@intelligence.family>'

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Your Family Intelligence code: ${code}`,
    text: [
      'Welcome to Family Intelligence.',
      '',
      `Your verification code is ${code}.`,
      'It expires in 15 minutes.',
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
  })

  return !error
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- email`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add www/lib/email.ts www/tests/email.test.ts
git commit -m "Add Resend OTP email client"
```

---

## Task 7: `/api/request-code` route

**Files:**
- Create: `www/app/api/request-code/route.ts`
- Test: `www/tests/request-code.test.ts`

**Interfaces:**
- Consumes: `generateCode`, `hashCode` (Task 2); `consume` (Task 3); `sealPending`, `setPendingCookie` (Task 4); `sendOtpEmail` (Task 6).
- Produces: `POST(request: NextRequest): Promise<NextResponse>` that validates the email, rate-limits per IP (read `x-forwarded-for`), generates a code, seals a pending cookie, emails the code, and returns `{ ok: true }` regardless of outcome (no enumeration). Enforces the 60s resend cooldown by reading any existing pending cookie. Resend/body errors return HTTP 500 but the success body is identical.

- [ ] **Step 1: Write the failing test**

Create `www/tests/request-code.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { _resetForTests as resetRateLimit } from '../lib/rate-limit'

const sendOtp = vi.fn().mockResolvedValue(true)
vi.mock('../lib/email', () => ({ sendOtpEmail: (e: string, c: string) => sendOtp(e, c) }))

import { POST } from '../app/api/request-code/route'

function req(body: unknown, ip = '1.2.3.4', cookie?: string) {
  const headers: Record<string, string> = { 'content-type': 'application/json', 'x-forwarded-for': ip }
  if (cookie) headers.cookie = cookie
  return new NextRequest('http://localhost/api/request-code', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  resetRateLimit()
  sendOtp.mockReset()
  sendOtp.mockResolvedValue(true)
})

describe('POST /api/request-code', () => {
  it('emails a code, sets the pending cookie, returns ok', async () => {
    const res = await POST(req({ email: 'user@example.com', source: 'g3d:family_intelligence:fundraising' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
    expect(sendOtp).toHaveBeenCalledWith('user@example.com', expect.stringMatching(/^\d{6}$/))
    expect(res.headers.get('set-cookie') || '').toContain('fi_pending=')
  })

  it('returns 400 for a malformed email and does not mail', async () => {
    const res = await POST(req({ email: 'not-an-email' }))
    expect(res.status).toBe(400)
    expect(sendOtp).not.toHaveBeenCalled()
  })

  it('rate-limits repeated requests from one IP', async () => {
    for (let i = 0; i < 5; i++) await POST(req({ email: `u${i}@example.com` }))
    const res = await POST(req({ email: 'u9@example.com' }))
    expect(res.status).toBe(429)
    expect(sendOtp).toHaveBeenCalledTimes(5)
  })

  it('still returns ok=shape even when email send fails (no enumeration), HTTP 500', async () => {
    sendOtp.mockResolvedValue(false)
    const res = await POST(req({ email: 'user@example.com' }))
    expect(res.status).toBe(500)
  })
})
```

> Global rate-limit policy for this route: **5 requests per IP per 60s**. `NextRequest` is imported at the top of the test file via `next/server`.

Add the `NextRequest` import to the top of the test file (above `describe`):
```ts
import { NextRequest } from 'next/server'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- request-code`
Expected: FAIL with `Cannot find module '../app/api/request-code/route'`.

- [ ] **Step 3: Write the implementation**

Create `www/app/api/request-code/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { generateCode, hashCode } from '@/lib/otp'
import { consume } from '@/lib/rate-limit'
import { sealPending, setPendingCookie, readPendingCookie, type PendingSession } from '@/lib/pending-session'
import { sendOtpEmail } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000
const RESEND_COOLDOWN_MS = 60_000

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return 'unknown'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = clientIp(request)
  if (!consume(`request-code:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ ok: true }, { status: 429 })
  }

  let body: { email?: unknown; source?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const now = Date.now()
  const existing = await readPendingCookie(request)
  if (existing && now < existing.resendAt) {
    return NextResponse.json({ ok: true, resendAt: existing.resendAt })
  }

  const source = typeof body.source === 'string' ? body.source : 'g3d:family_intelligence'
  const code = generateCode()
  const session: PendingSession = {
    email,
    codeHash: hashCode(code),
    attempts: 0,
    expiresAt: now + 900_000,
    resendAt: now + RESEND_COOLDOWN_MS,
    source,
  }

  const sent = await sendOtpEmail(email, code)
  if (!sent) {
    return NextResponse.json({ ok: false, error: 'Could not send code. Please try again.' }, { status: 500 })
  }

  const seal = await sealPending(session)
  const res = NextResponse.json({ ok: true })
  setPendingCookie(res, seal)
  return res
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- request-code`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add www/app/api/request-code/route.ts www/tests/request-code.test.ts
git commit -m "Add /api/request-code endpoint (validate, rate-limit, seal, email)"
```

---

## Task 8: `/api/verify-code` route

**Files:**
- Create: `www/app/api/verify-code/route.ts`
- Test: `www/tests/verify-code.test.ts`

**Interfaces:**
- Consumes: `verifyCode`, `isExpired` (Task 2); `readPendingCookie`, `clearPendingCookie`, `sealPending`, `setPendingCookie` (Task 4); `createCrmContact` (Task 5).
- Produces: `POST(request: NextRequest): Promise<NextResponse>` that reads the pending cookie, returns 400 if absent/expired, decrements attempts on wrong codes (clears after 5), and on a correct code clears the pending cookie, contacts the CRM, and returns `{ ok: true, verified: true }`. The CRM call uses the `source` stored in the pending session.

- [ ] **Step 1: Write the failing test**

Create `www/tests/verify-code.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { sealPending, type PendingSession } from '../lib/pending-session'
import { hashCode } from '../lib/otp'

const crmMock = vi.fn().mockResolvedValue({ ok: true, status: 'created' })
vi.mock('../lib/crm', () => ({ createCrmContact: (...a: unknown[]) => crmMock(...a) }))

import { POST } from '../app/api/verify-code/route'

async function reqWithSession(code: string, session: PendingSession) {
  const seal = await sealPending(session)
  return new NextRequest('http://localhost/api/verify-code', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `fi_pending=${seal}` },
    body: JSON.stringify({ code }),
  })
}

const baseSession = (overrides: Partial<PendingSession> = {}): PendingSession => ({
  email: 'user@example.com',
  codeHash: hashCode('123456'),
  attempts: 0,
  expiresAt: Date.now() + 600_000,
  resendAt: Date.now(),
  source: 'g3d:family_intelligence:fundraising',
  ...overrides,
})

beforeEach(() => {
  crmMock.mockClear()
  crmMock.mockResolvedValue({ ok: true, status: 'created' })
})

describe('POST /api/verify-code', () => {
  it('verifies the correct code and pushes to the CRM with the stored source', async () => {
    const res = await POST(await reqWithSession('123456', baseSession()))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, verified: true })
    expect(crmMock).toHaveBeenCalledWith('user@example.com', 'g3d:family_intelligence:fundraising')
    const setCookie = res.headers.get('set-cookie') || ''
    expect(setCookie).toContain('fi_pending=')
    expect(setCookie).toContain('Max-Age=0')
  })

  it('rejects an absent pending cookie with 400', async () => {
    const req = new NextRequest('http://localhost/api/verify-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: '123456' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(crmMock).not.toHaveBeenCalled()
  })

  it('rejects an expired code with 400', async () => {
    const res = await POST(await reqWithSession('123456', baseSession({ expiresAt: Date.now() - 1 })))
    expect(res.status).toBe(400)
    expect(crmMock).not.toHaveBeenCalled()
  })

  it('counts down attempts and locks after 5', async () => {
    for (let i = 0; i < 4; i++) {
      const res = await POST(await reqWithSession('000000', baseSession({ attempts: i })))
      expect(res.status).toBe(200)
      expect(await res.json()).toMatchObject({ ok: true, verified: false })
    }
    const res = await POST(await reqWithSession('000000', baseSession({ attempts: 4 })))
    expect(res.status).toBe(400) // locked, pending cookie cleared
    expect(crmMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- verify-code`
Expected: FAIL with `Cannot find module '../app/api/verify-code/route'`.

- [ ] **Step 3: Write the implementation**

Create `www/app/api/verify-code/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyCode, isExpired } from '@/lib/otp'
import {
  readPendingCookie,
  clearPendingCookie,
  sealPending,
  setPendingCookie,
  type PendingSession,
} from '@/lib/pending-session'
import { createCrmContact } from '@/lib/crm'

const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await readPendingCookie(request)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'No pending code. Please request a new code.' }, { status: 400 })
  }
  if (isExpired(session.expiresAt)) {
    const res = NextResponse.json({ ok: false, error: 'Code expired. Please request a new code.' }, { status: 400 })
    clearPendingCookie(res)
    return res
  }

  let body: { code?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }
  const code = typeof body.code === 'string' ? body.code.trim() : ''

  if (!verifyCode(code, session.codeHash)) {
    const updated: PendingSession = { ...session, attempts: session.attempts + 1 }
    if (updated.attempts >= MAX_ATTEMPTS) {
      const res = NextResponse.json(
        { ok: false, error: 'Too many attempts. Please request a new code.' },
        { status: 400 }
      )
      clearPendingCookie(res)
      return res
    }
    const seal = await sealPending(updated)
    const res = NextResponse.json({
      ok: true,
      verified: false,
      attemptsRemaining: MAX_ATTEMPTS - updated.attempts,
    })
    setPendingCookie(res, seal)
    return res
  }

  await createCrmContact(session.email, session.source)
  const res = NextResponse.json({ ok: true, verified: true })
  clearPendingCookie(res)
  return res
}
```

> The wrong-code branch **re-seals the pending cookie** with the incremented `attempts`, so the 5-attempt limit actually persists across requests (the client resubmits the updated cookie). The cookie is sealed by iron-session, so the client cannot reset `attempts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- verify-code`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add www/app/api/verify-code/route.ts www/tests/verify-code.test.ts
git commit -m "Add /api/verify-code endpoint (verify, attempts, CRM on success)"
```

---

## Task 9: Inline gate UI + retire `/api/subscribe` + manual e2e

**Files:**
- Modify: `www/components/InlineEmailGate.tsx`
- Delete: `www/app/api/subscribe/route.ts`
- Test: manual (no React component test harness in this repo; see spec §11).

**Interfaces:**
- Consumes: `/api/request-code` and `/api/verify-code` (Tasks 7–8); existing `onSuccess` prop contract.
- Produces: a two-step gate (`enter-email` → `enter-code` → success calls `onSuccess`). Retains the current visual design (green pill, mono input). Adds "Resend code" (disabled until 60s elapsed) and "Use a different email" controls. No change to `app/fundraising/page.tsx`.

- [ ] **Step 1: Read the current component**

Read `www/components/InlineEmailGate.tsx` in full before editing. Preserve the existing `className`, `style`, and `fontVariationSettings` styling on the input/button; only extend the state machine.

- [ ] **Step 2: Rewrite the component with the two-step flow**

Replace the contents of `www/components/InlineEmailGate.tsx` with:
```tsx
'use client'

import { useState } from 'react'

type Step = 'email' | 'code'
type Status = 'idle' | 'loading' | 'error' | 'success'

interface InlineEmailGateProps {
  onSuccess: () => void
  source?: string
  prompt?: string
}

export default function InlineEmailGate({ onSuccess, source, prompt }: InlineEmailGateProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [resendAt, setResendAt] = useState<number | null>(null)

  const reset = () => {
    setStep('email')
    setCode('')
    setStatus('idle')
    setMessage('')
  }

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setStep('code')
        setStatus('idle')
        setResendAt(data.resendAt ? Number(data.resendAt) : Date.now() + 60_000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.verified) {
        setStatus('success')
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'email_subscribe', {
            event_category: 'engagement',
            event_label: 'fundraising_gate',
            value: 1,
          })
        }
        setTimeout(() => onSuccess(), 400)
      } else if (res.ok && data.ok === true) {
        setStatus('error')
        setMessage(
          data.attemptsRemaining != null
            ? `Incorrect code. ${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? '' : 's'} remaining.`
            : 'Incorrect code.'
        )
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const resendDisabled = resendAt != null && Date.now() < resendAt
  const resendSeconds = resendAt ? Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)) : 0

  const inputClass =
    'flex-1 px-4 py-3 bg-transparent outline-none placeholder:text-fi-black-900/50 font-mono text-sm tracking-wide text-center sm:text-left'
  const inputStyle = { fontVariationSettings: "'MONO' 100" } as const
  const buttonClass =
    'm-2 sm:m-[10px] px-4 py-2 bg-[#B8C6B0] hover:bg-fi-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium tracking-wide rounded-sm'

  if (step === 'code') {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <p className="text-lg md:text-xl leading-relaxed mb-6 text-balance text-fi-black-900">
          Enter the 6-digit code we sent to {email}.
        </p>
        <form onSubmit={submitCode} className="w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-sm overflow-hidden bg-[rgba(184,198,176,0.4)]">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                if (status !== 'idle') {
                  setStatus('idle')
                  setMessage('')
                }
              }}
              placeholder="6-digit code"
              className={inputClass}
              style={inputStyle}
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success' || code.length !== 6}
              className={buttonClass}
            >
              {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Success!' : 'Verify'}
            </button>
          </div>
        </form>
        <div className="flex justify-center gap-4 pt-4 text-sm">
          <button
            type="button"
            onClick={submitEmail}
            disabled={resendDisabled || status === 'loading'}
            className="underline disabled:opacity-50 disabled:no-underline"
          >
            {resendDisabled ? `Resend in ${resendSeconds}s` : 'Resend code'}
          </button>
          <button type="button" onClick={reset} className="underline">
            Use a different email
          </button>
        </div>
        {message && status === 'error' && (
          <p className="pt-4 text-sm text-red-600">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <p className="text-lg md:text-xl leading-relaxed mb-6 text-balance text-fi-black-900">
        {prompt ?? 'Enter your email to keep reading.'}
      </p>
      <form onSubmit={submitEmail} className="w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-sm overflow-hidden bg-[rgba(184,198,176,0.4)]">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status !== 'idle') {
                setStatus('idle')
                setMessage('')
              }
            }}
            placeholder="Your Email Address"
            className={inputClass}
            style={inputStyle}
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className={buttonClass}
          >
            {status === 'loading' ? 'Sending...' : 'Continue'}
          </button>
        </div>
      </form>
      {message && status === 'error' && (
        <p className="pt-4 text-sm text-red-600">{message}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Delete the old subscribe route**

Run:
```bash
git rm www/app/api/subscribe/route.ts
```
(If the directory becomes empty, also remove it: `rmdir www/app/api/subscribe` — git handles this automatically with `git rm`.)

- [ ] **Step 4: Run the full test suite + lint + build**

Run from `www/`:
```bash
npm run test
npm run lint
npm run build
```
Expected: all tests pass; lint produces no NEW errors in the touched files (pre-existing lint errors elsewhere are out of scope); build succeeds.

- [ ] **Step 5: Manual end-to-end checklist**

Run `npm run dev`, open `/fundraising`, clear `localStorage.fi_fundraising_unlocked`, and verify (spec §11):
- Real email receives a 6-digit code; correct code unlocks content; the verified email appears in Garden3D with the correct source.
- Wrong code shows attempts-remaining; 5th failure locks and clears the code (must re-request).
- A disposable/fake email can request a code but cannot unlock or reach the CRM.
- Refresh after verifying keeps content unlocked (localStorage).
- Resend is blocked for 60s; "Use a different email" returns to the email step.
- Repeated `/request-code` from one IP returns 429 after 5 within 60s.

- [ ] **Step 6: Commit**

```bash
git add www/components/InlineEmailGate.tsx
git commit -m "Two-step email OTP gate; retire /api/subscribe"
```

---

## Notes for the controller (not tasks)

- **Pre-deploy:** replace the placeholder `RESEND_API_KEY` and `STACKS_API_KEY` in the encrypted `www/.env` (`npx dotenvx set ...`), verify the `intelligence.family` domain in Resend, and set `DOTENV_PRIVATE_KEY` (contents of `www/.env.keys`) as a Vercel env var so prod decrypts the committed `.env`.
- **Do not** wire the disabled `EmailGateModal` to OTP in this plan (out of scope per spec §3).
- After Task 9, run the final whole-branch review (`requesting-code-review`) and use `finishing-a-development-branch`.
