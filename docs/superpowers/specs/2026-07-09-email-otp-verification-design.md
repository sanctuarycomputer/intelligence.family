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
- The CRM receives **only verified** emails.
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
- **Garden3D CRM** is contacted only after a successful verification.

### 4.1 Flow

1. **Request code** — visitor submits email → `POST /api/request-code { email, source }`.
   - Validate email shape.
   - Generate a 6-digit code.
   - Store `{ email, codeHash, attempts, expiresAt, source, resendAt }` in the
     iron-session cookie.
   - Send the code via Resend to the submitted email.
   - Always return `{ ok: true }` (do **not** reveal whether the address is known).
2. **Verify code** — visitor submits the code → `POST /api/verify-code { code }`.
   - Read the iron-session cookie. Reject if absent/expired.
   - Compare the submitted code in **constant time** against the stored hash.
   - On success: set a separate long-lived signed **"verified" cookie**
     (`{ email, source, verifiedAt }`, 30 days), and POST the verified email to
     Garden3D. Return `{ ok: true, verified: true }`.
   - On failure: decrement `attempts`; after 5, invalidate the code and require a
     re-request. Return `{ ok: false, error }` with attempts remaining.
3. **Unlock** — on the client, a successful verify sets
   `localStorage.fi_fundraising_unlocked = '1'` (matches the existing unlock
   contract in `app/fundraising/page.tsx:38-44`) and reveals the content. The
   30-day verified cookie is the durable, server-side source of truth; the
   localStorage flag is a client-side mirror for instant unlock on load.

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
- `www/app/fundraising/page.tsx` — no logic change; the gate component gains the
  second step transparently. Consider seeding the "verified" state from the
  verified cookie on first paint (SSR/cookie read) so returning visitors skip
  the gate without a localStorage dependency.
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
- **Enumeration:** `/request-code` returns the same response shape regardless of
  whether the email is "known" (there are no accounts, but the principle holds).
- **No code in URLs** and no logging of codes.

## 7. Verified state

- The 30-day signed cookie (`fi_verified`) bound to `{ email, source, verifiedAt }`
  is the durable signal. Set by `/api/verify-code` on success.
- The client also sets `localStorage.fi_fundraising_unlocked = '1'` for instant
  unlock on subsequent loads (existing behavior).
- Returning visitors with a valid `fi_verified` cookie skip the gate. If the cookie
  is absent but localStorage is set, the gate still unlocks client-side (current
  behavior) — the cookie is additive hardening, not a regression.

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
| `RESEND_FROM` | Sender, e.g. `Family Intelligence <verify@intelligence.family>` |
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

## 12. Open decisions / risks

- **Rate-limit store:** in-memory for MVP; call out the cold-start/per-instance
  caveat. Upgrade to Upstash Redis if abused.
- **Verified cookie vs. localStorage:** cookie is the source of truth (recommended);
  localStorage remains as a client mirror. Confirm this dual approach is acceptable.
- **Scope:** inline gate only. The disabled `EmailGateModal` is untouched; it can
  adopt the same `/api/request-code` + `/api/verify-code` endpoints later.
