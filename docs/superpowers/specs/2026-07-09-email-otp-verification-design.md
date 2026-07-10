# Email OTP Verification for the Fundraising Gate — Design

- **Date:** 2026-07-09
- **Status:** Draft, awaiting review
- **Branch:** `feat/email-otp-verification`
- **Owner:** Hugh Francis

## 1. Background & problem

The `/fundraising` page reveals gated content when a visitor submits an email via the
inline gate (`InlineEmailGate`, rendered at `www/app/fundraising/page.tsx:269`).
Today, any syntactically-valid email — real or fake — immediately:

1. Reveals the gated content, and
2. Is pushed to the Garden3D CRM (`https://stacks.garden3d.net/api/contacts`) by
   `www/app/api/subscribe/route.ts`.

There is no verification, so fake and typo'd emails pollute the CRM. A timestamp
suffix is appended to every email (`appendTimestampToEmail`, `route.ts:9-20`) as a
hack to bypass CRM dedup — a direct symptom of the lack of verification.

We need visitors to **prove they control the email** by entering a one-time code
emailed to them before content is unlocked and before anything reaches the CRM.

## 2. Goal

Add email one-time-password (OTP) verification to the inline fundraising gate:

- User enters email → server emails a short code.
- User enters the code → server verifies → content unlocks.
- The CRM tags leads in two stages: `g3d:family_intelligence:fundraising` when a
  code is requested, and `g3d:family_intelligence:fundraising-viewed` once verified.
- "Verified" is remembered so returning visitors skip the gate.

## 3. Non-goals

- Real user accounts / passwords / a logged-in product (Clerk was considered and
  rejected for this scope).
- Zapier or Notion orchestration (rejected — can't securely store/check codes).
- Changing the disabled full-screen `EmailGateModal` (`EMAIL_GATE_ENABLED = false`).
  Out of scope; the OTP flow targets the active inline gate only.
- High-security identity proofing. The threat model is "stop casual fake-email
  entry and CRM pollution," not adversarial account takeover.

## 4. Approach

DIY, native to the existing Next.js app:

- **Next.js API routes** generate, store, and verify the code.
- **`iron-session`** stores the pending code in an **encrypted, tamper-proof cookie**
  (clients cannot read or forge it). No database required.
- **Resend** delivers the code email directly from the server.
- **Garden3D CRM** is contacted in two stages: at code-request (lead capture, source
  `g3d:family_intelligence:fundraising`) and again on successful verification
  (source `g3d:family_intelligence:fundraising-viewed`).

### 4.1 Flow

1. **Request code** — visitor submits email → `POST /api/request-code { email, source }`.
   - Validate email shape.
   - Generate a 6-digit code.
   - Store `{ email, codeHash, attempts, expiresAt, source, resendAt }` in the
     iron-session cookie.
   - Send the code via Resend to the submitted email.
   - On a successful send, capture the lead in Garden3D with source
     `g3d:family_intelligence:fundraising` (the request `source`).
   - Always return `{ ok: true }` (do **not** reveal whether the address is known).
2. **Verify code** — visitor submits the code → `POST /api/verify-code { code }`.
   - Read the pending iron-session cookie. Reject if absent/expired.
   - Compare the submitted code in **constant time** against the stored hash.
   - On success: POST the verified email to Garden3D with source
     `g3d:family_intelligence:fundraising-viewed` (`<request source>-viewed`).
     Return `{ ok: true, verified: true }`.
   - On failure: decrement `attempts`; after 5, invalidate the code and require a
     re-request. Return `{ ok: false, error }` with attempts remaining.
3. **Unlock** — on a successful verify the client sets
   `localStorage.fi_fundraising_unlocked = '1'` (the existing unlock contract at
   `app/fundraising/page.tsx:38-44`) and reveals the content. Returning visitors
   skip the gate via this same localStorage flag (unchanged from today).

## 5. Components & files

### New
- `www/app/api/request-code/route.ts` — request endpoint (validate, gen, store, send).
- `www/app/api/verify-code/route.ts` — verify endpoint (compare, unlock cookie, CRM).
- `www/lib/otp-session.ts` — `iron-session` wrappers: `getPendingSession()`,
  `savePendingSession()`, `getVerifiedSession()`, `setVerifiedSession()`.
- `www/lib/email.ts` — thin Resend client + `sendOtpEmail(email, code)`.
- `www/lib/crm.ts` — extract the Garden3D contact POST (currently inline in
  `subscribe/route.ts`) into a reusable `createCrmContact(email, source)`.

### Modified
- `www/components/InlineEmailGate.tsx` — add a second step: state machine
  `enter-email → enter-code → verified`. Calls `/api/request-code` then
  `/api/verify-code`; on success invokes the existing `onSuccess` prop.
- `www/app/fundraising/page.tsx` — **no change needed.** This file is a client
  component (`'use client'`) that already unlocks on the
  `fi_fundraising_unlocked` localStorage flag. The two-step flow lives entirely
  inside `InlineEmailGate`, which calls the existing `onSuccess` → `handleUnlock`.
- `www/package.json` — add deps `iron-session`, `resend`, `@dotenvx/dotenvx`;
  wrap scripts in `dotenvx run --` (see §8).
- `www/.gitignore` — commit the encrypted `.env`; ignore `.env.keys` and
  `.env*.local` (see §8).

### Retired
- `www/app/api/subscribe/route.ts` — CRM responsibility moves into
  `/api/verify-code` via `lib/crm.ts`. Remove the `appendTimestamp` hack with it.

## 6. Security model

- **Cookie storage:** `iron-session` encrypts+signs the cookie with
  `SESSION_SECRET` (≥32 chars). Cookie flags: `httpOnly`, `secure`, `sameSite=lax`,
  path `/`. Clients cannot read or modify the stored code.
- **Code:** 6 numeric digits, **15-minute expiry**, **max 5 verification attempts**,
  **60-second resend cooldown** (enforced via `resendAt`).
- **Comparison:** constant-time (`crypto.timingSafeEqual`); store a hash of the code
  in the cookie rather than the plaintext code.
- **Rate limiting:** per-IP limit on `/api/request-code` using an in-memory map
  (MVP). Documented limitation: resets on cold start and is per-instance; upgrade to
  Upstash Redis if traffic grows. This is acceptable for the current threat model.
- **CSRF:** the iron-session cookie uses `sameSite=lax`, so it is not sent on
  cross-site POSTs; both endpoints are same-origin only.
- **Source allowlist:** the existing `ALLOWED_SOURCES` check in the current
  `subscribe/route.ts` is preserved when extracting `lib/crm.ts`, so clients
  cannot tag CRM contacts with arbitrary sources.
- **Enumeration:** `/request-code` returns the same response shape regardless of
  whether the email is "known" (there are no accounts, but the principle holds).
- **No code in URLs** and no logging of codes.

## 7. Verified state

- For the MVP, "verified" is remembered **client-side** via the existing
  `localStorage.fi_fundraising_unlocked` flag (set on successful verify, read on
  load at `app/fundraising/page.tsx:38`). Returning visitors skip the gate this
  way — unchanged from today.
- **No separate long-lived "verified" cookie in the MVP.** An earlier draft
  proposed a 30-day signed `fi_verified` cookie as the "source of truth," but
  `app/fundraising/page.tsx` is a client component and cannot read an httpOnly
  cookie; making such a cookie drive the unlock would require a server-component
  wrapper reading it via `next/headers`. That is real extra surface for no gain
  under this threat model, so it is deferred (see §12).
- The CRM contact strategy is two-stage: a successful code request captures the
  lead (`g3d:family_intelligence:fundraising`), and a successful verification adds
  the `g3d:family_intelligence:fundraising-viewed` tag — so the `-viewed` tag is
  applied only to verified emails. Both writes are server-side and **independent**
  of any cookie/localStorage.
- Unlocked content is client-gated by design (acceptable for the "casual
  fake-email" threat model).
- Note: rotating `SESSION_SECRET` invalidates in-flight pending-code cookies
  (anyone mid-flow must re-request); it does not affect the localStorage flag.

## 8. Environment & secrets (encrypted dotenv)

Mirror the `@dotenvx/dotenvx` pattern used in `../actual-weather-services`:

- `.env` holds values as `KEY="encrypted:..."` plus a `DOTENV_PUBLIC_KEY` header.
  **This file is committed** — it is safe because it is encrypted.
- `.env.keys` holds `DOTENV_PRIVATE_KEY` (the decryption key). **Never committed**
  (gitignored); kept locally and shared out of band.
- Scripts wrap the binary: `"dev": "dotenvx run -- next dev"`, and likewise for
  `build` and `start`.
- To change a value: `npx dotenvx set KEY "value"` (auto-encrypts and writes).

### Variables
| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | iron-session encryption key (≥32 random chars; generate with `openssl rand -hex 32`) |
| `RESEND_API_KEY` | Resend send API key |
| `RESEND_FROM` | Sender, e.g. `Family Intelligence <invest@mail.intelligence.family>` (verified Resend domain `mail.intelligence.family`) |
| `REPLY_TO` | Reply-to address, e.g. `invest@intelligence.family` (optional; omitted from the send when unset; need not be on the verified Resend domain) |
| `STACKS_API_KEY` | Garden3D CRM key (moved from Vercel-only into the encrypted `.env`) |

### `www/.gitignore` changes
Replace the current `.env*` / `!.env.example` block with the sibling's convention:
ignore `.env*.local` and `.env.keys`; **allow** the encrypted `.env`.

### Production (Vercel)
The deploy runs `amondnet/vercel-action` (`.github/workflows/deploy.yml`). Vercel
will not have the gitignored `.env.keys`, so set `DOTENV_PRIVATE_KEY` as a Vercel
project environment variable. Then `dotenvx run -- next build` decrypts the committed
`.env` at build time — full parity with local, with no plaintext secrets stored in
Vercel.

## 9. Deliverability setup (outside code)

- Add `intelligence.family` as a **verified domain in Resend** (SPF/DKIM/DMARC TXT
  records). Until verified, test sends can use Resend's shared
  `onboarding@resend.dev` sender.
- The code email body should be short, plain-text-friendly, with the 6-digit code
  prominent, plus the brand name and an expiry note.

## 10. UX defaults

- 6-digit numeric code.
- 15-minute expiry.
- 5 max verification attempts per code.
- 60-second resend cooldown with a countdown in the UI.
- Two-step inline UI consistent with the current gate aesthetic (green pill, mono
  input). "Resend code" and "Use a different email" controls on the code step.

## 11. Test plan

- Real email receives a code; correct code unlocks content; verified email appears
  in Garden3D with the correct `source`.
- Wrong code is rejected; attempts-remaining shown; after 5 attempts the code is
  invalidated and a new one must be requested.
- A fake/disposable email can request a code (sent to a mailbox the visitor can't
  open) and therefore can never unlock or reach the CRM.
- Refresh after verifying keeps content unlocked (cookie + localStorage).
- Code expires after 15 minutes; expired code is rejected.
- Resend is blocked until the 60-second cooldown elapses.
- Rate limit on `/request-code` triggers after repeated requests from one IP.
- `EMAIL_GATE_ENABLED` / gate toggles still behave; the inline gate is the focus.

**Test harness note:** the repo has no test runner today (no `test` script; no
vitest/jest). The above are manual checks for the MVP. Optionally add vitest + a
route-level harness for the two endpoints as part of this work — flagged for the
implementation plan to decide.

## 12. Open decisions / risks

- **Rate-limit store:** in-memory for MVP; call out the cold-start/per-instance
  caveat. Upgrade to Upstash Redis if abused.
- **Robust returning-visitor skip (deferred):** if you later want the gate to stay
  unlocked even after a visitor clears localStorage, add a server-component
  wrapper around `/fundraising` that reads a signed `fi_verified` cookie (via
  `next/headers`) and seeds `initialUnlocked`. Not in the MVP — flagged here so
  the endpoints won't need to change to support it later.
- **Scope:** inline gate only. The disabled `EmailGateModal` is untouched; it can
  adopt the same `/api/request-code` + `/api/verify-code` endpoints later.
- **Test harness:** none today; decide during planning whether to add vitest or
  rely on manual verification.
