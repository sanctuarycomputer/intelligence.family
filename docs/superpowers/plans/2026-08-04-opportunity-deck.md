# /opportunity Investor Deck (First Draft) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the browser-only first draft of the 24-page investor deck at `/opportunity`, gated by the existing OTP email gate, per the approved spec at `docs/superpowers/specs/2026-08-04-investor-deck-narrative-design.md`.

**Architecture:** A new Next.js App Router route (`www/app/opportunity/`) renders a scroll-snap deck of full-viewport pages composed from eight layout archetype components, with page copy and a citation registry kept in content modules (testable via the repo's copy-contract pattern). The existing OTP gate is reused with new CRM source attribution; the cover slide ports the family-book drifting-leaves animation in pure CSS.

**Tech Stack:** Next.js 16 / React 19 (already in `www/`), Tailwind 4 + `globals.css` custom properties, Vitest (node environment — no DOM component tests; UI is verified by typecheck, lint, and dev-server checks).

## Global Constraints

- **Colors:** ONLY the styleguide tokens from `www/app/globals.css` (`--fi-green-100` #D7DDD4, `--fi-green-200` #CAD4C6, `--fi-green-300` #B8C6B0, `--fi-green-400` #7B8F5E, `--fi-green-500` #5E7B29, `--fi-green-600` #596647, `--fi-black-900` #313131, `--fi-black-1000` #000000). family-book hexes are never used.
- **Fonts:** `var(--font-serif)` (Windsor Pro) for display, `var(--font-sans)` (Roobert) for everything else. Already loaded; add no fonts.
- **Copy rules (from spec "Voice & copy rules"):** no em dashes anywhere in deck copy; every page is Title + Subtitle exactly as written in the spec; body copy ~40–80 words; no dramatic/aphoristic titles; urgency is dated fact, never countdown pressure.
- **No PDF export** in this draft. No print stylesheet work.
- **Page count:** 24 core pages + appendix stubs. Page numbering "N / 24" refers to the core only.
- **Spec is the copy source of truth:** every Title/Sub in this plan is copied verbatim from the spec; body copy is drafted from the spec's per-page paragraph.
- **Tests:** Vitest node environment, files in `www/tests/*.test.ts`, run with `npm test` from `www/`. All commands below run from `www/` unless noted.
- **Commits:** small, per task, message style matching repo history (imperative, no scope prefix required).

## File Structure

```
www/public/opportunity/                 # cover-leaf-1/2/3.png, cover-decoration.png (from family-book)
www/lib/crm.ts                          # MODIFY: opportunity sources + PAGE_VIEWED_SOURCES map
www/lib/gate-page.ts                    # CREATE: slug→viewed-source resolution (testable)
www/app/api/gate-status/route.ts        # MODIFY: ?page= param
www/components/InlineEmailGate.tsx      # MODIFY: optional `page` prop threaded to gate-status
www/app/opportunity/layout.tsx          # CREATE: metadata (noindex), mirrors fundraising
www/app/opportunity/page.tsx            # CREATE: server component, renders client
www/app/opportunity/OpportunityClient.tsx  # CREATE: gate wiring + DeckShell mount
www/app/opportunity/opportunity.css     # CREATE: deck styles: snap, chrome, leaves keyframes, archetype grids
www/app/opportunity/components/DriftingLeaves.tsx  # CREATE: leaf animation
www/app/opportunity/components/Ref.tsx             # CREATE: superscript citation
www/app/opportunity/components/FpoBox.tsx          # CREATE: FPO asset placeholder
www/app/opportunity/components/DeckShell.tsx       # CREATE: snap container, progress rail, keyboard nav
www/app/opportunity/components/DeckPage.tsx        # CREATE: page wrapper + chrome (header/footer)
www/app/opportunity/components/archetypes.tsx      # CREATE: Cover/Statement/BigStat/Split/EvidenceGrid/DiagramPage/Ledger/CardsPage
www/app/opportunity/content/references.ts          # CREATE: citation registry (single source of truth)
www/app/opportunity/content/act1.tsx               # CREATE: pages 1–7
www/app/opportunity/content/act2.tsx               # CREATE: pages 8–16
www/app/opportunity/content/act3.tsx               # CREATE: pages 17–21
www/app/opportunity/content/act4.tsx               # CREATE: pages 22–24
www/app/opportunity/content/appendix.tsx           # CREATE: A1–A10 stubs + Sources page
www/app/opportunity/content/index.ts               # CREATE: ordered export of all pages
www/tests/gate-page.test.ts             # CREATE
www/tests/opportunity-references.test.ts # CREATE
www/tests/opportunity-copy.test.ts      # CREATE
www/tests/crm.test.ts                   # MODIFY: opportunity sources
www/tests/gate-status.test.ts           # MODIFY: page param cases
```

---

### Task 1: Copy family-book cover assets

**Files:**
- Create: `www/public/opportunity/cover-leaf-1.png`, `cover-leaf-2.png`, `cover-leaf-3.png`, `cover-decoration.png`

**Interfaces:**
- Produces: image paths `/opportunity/cover-leaf-{1,2,3}.png` and `/opportunity/cover-decoration.png` used by Task 6.

- [ ] **Step 1: Copy the four PNGs from the family-book web remote**

```bash
mkdir -p public/opportunity
cp /Users/hhff/Documents/Code/family-book/fam-api/app/static/remote/assets/cover-leaf-1.png public/opportunity/
cp /Users/hhff/Documents/Code/family-book/fam-api/app/static/remote/assets/cover-leaf-2.png public/opportunity/
cp /Users/hhff/Documents/Code/family-book/fam-api/app/static/remote/assets/cover-leaf-3.png public/opportunity/
cp /Users/hhff/Documents/Code/family-book/fam-api/app/static/remote/assets/cover-decoration.png public/opportunity/
```

- [ ] **Step 2: Verify sizes (leaves ~16–17 KB each, decoration larger)**

Run: `ls -la public/opportunity/`
Expected: four PNGs present, none zero-byte.

- [ ] **Step 3: Commit**

```bash
git add public/opportunity
git commit -m "Add family-book cover assets for /opportunity deck"
```

---

### Task 2: CRM opportunity sources

**Files:**
- Modify: `www/lib/crm.ts`
- Test: `www/tests/crm.test.ts` (append a describe block)

**Interfaces:**
- Produces: `OPPORTUNITY_GATE_SOURCE = 'g3d:family_intelligence:opportunity'` and `OPPORTUNITY_VIEWED_SOURCE = 'g3d:family_intelligence:opportunity-viewed'` exports; both appear in `ALLOWED_SOURCES`.

- [ ] **Step 1: Write the failing tests** (append to `tests/crm.test.ts`, following that file's existing mock/setup conventions — read it first)

```ts
import {
  ALLOWED_SOURCES,
  OPPORTUNITY_GATE_SOURCE,
  OPPORTUNITY_VIEWED_SOURCE,
} from '../lib/crm';

describe('opportunity CRM sources', () => {
  it('exports the opportunity gate and viewed sources', () => {
    expect(OPPORTUNITY_GATE_SOURCE).toBe('g3d:family_intelligence:opportunity');
    expect(OPPORTUNITY_VIEWED_SOURCE).toBe(
      'g3d:family_intelligence:opportunity-viewed'
    );
  });

  it('allowlists both so createCrmContact will not reject them', () => {
    expect(ALLOWED_SOURCES).toContain('g3d:family_intelligence:opportunity');
    expect(ALLOWED_SOURCES).toContain(
      'g3d:family_intelligence:opportunity-viewed'
    );
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- tests/crm.test.ts`
Expected: FAIL ("does not provide an export named 'OPPORTUNITY_GATE_SOURCE'")

- [ ] **Step 3: Implement in `lib/crm.ts`**

```ts
export const ALLOWED_SOURCES = [
  'g3d:family_intelligence',
  'g3d:family_intelligence:fundraising',
  'g3d:family_intelligence:fundraising-viewed',
  'g3d:family_intelligence:opportunity',
  'g3d:family_intelligence:opportunity-viewed',
] as const;

export const GATE_SOURCE = 'g3d:family_intelligence:fundraising';
export const VIEWED_SOURCE = 'g3d:family_intelligence:fundraising-viewed';
export const OPPORTUNITY_GATE_SOURCE = 'g3d:family_intelligence:opportunity';
export const OPPORTUNITY_VIEWED_SOURCE =
  'g3d:family_intelligence:opportunity-viewed';
```

(Leave the rest of the file untouched.)

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- tests/crm.test.ts`
Expected: PASS (existing tests still green)

- [ ] **Step 5: Commit**

```bash
git add lib/crm.ts tests/crm.test.ts
git commit -m "Add opportunity CRM sources to the gate allowlist"
```

---

### Task 3: Page-slug → viewed-source resolution

**Files:**
- Create: `www/lib/gate-page.ts`
- Test: `www/tests/gate-page.test.ts`

**Interfaces:**
- Produces: `resolveViewedSource(page: string | null): string` — `'opportunity'` → `OPPORTUNITY_VIEWED_SOURCE`, anything else (including null, garbage, or a raw CRM string) → `VIEWED_SOURCE`. Consumed by Task 4.

- [ ] **Step 1: Write the failing test** (`tests/gate-page.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { resolveViewedSource } from '../lib/gate-page';

describe('resolveViewedSource', () => {
  it('maps the opportunity slug to the opportunity viewed source', () => {
    expect(resolveViewedSource('opportunity')).toBe(
      'g3d:family_intelligence:opportunity-viewed'
    );
  });

  it('defaults to fundraising-viewed for null, unknown, and raw-source inputs', () => {
    expect(resolveViewedSource(null)).toBe(
      'g3d:family_intelligence:fundraising-viewed'
    );
    expect(resolveViewedSource('fundraising')).toBe(
      'g3d:family_intelligence:fundraising-viewed'
    );
    expect(resolveViewedSource('evil')).toBe(
      'g3d:family_intelligence:fundraising-viewed'
    );
    // A client may never smuggle a raw CRM source string through the param.
    expect(resolveViewedSource('g3d:family_intelligence:opportunity-viewed')).toBe(
      'g3d:family_intelligence:fundraising-viewed'
    );
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- tests/gate-page.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/gate-page.ts`**

```ts
import { VIEWED_SOURCE, OPPORTUNITY_VIEWED_SOURCE } from './crm';

// Server-side slug map: the client names a page, never a CRM source.
const PAGE_VIEWED_SOURCES: Record<string, string> = {
  fundraising: VIEWED_SOURCE,
  opportunity: OPPORTUNITY_VIEWED_SOURCE,
};

export function resolveViewedSource(page: string | null): string {
  return (page && PAGE_VIEWED_SOURCES[page]) || VIEWED_SOURCE;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- tests/gate-page.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/gate-page.ts tests/gate-page.test.ts
git commit -m "Add server-side page-slug to viewed-source resolution"
```

---

### Task 4: gate-status per-page attribution

**Files:**
- Modify: `www/app/api/gate-status/route.ts`
- Test: `www/tests/gate-status.test.ts` (append cases)

**Interfaces:**
- Consumes: `resolveViewedSource` from Task 3.
- Produces: `GET /api/gate-status?page=opportunity` logs `g3d:family_intelligence:opportunity-viewed`; no param keeps today's behavior exactly.

- [ ] **Step 1: Write the failing tests** (append inside the existing `describe`; reuse the file's `verifiedReq` helper but note it hardcodes the URL — add a variant)

```ts
async function verifiedPageReq(email: string, page: string) {
  const seal = await sealVerified({ email });
  return new NextRequest(
    `http://localhost/api/gate-status?page=${page}`,
    { method: 'GET', headers: { cookie: `fi_verified=${seal}` } }
  );
}

it('logs the opportunity viewed source for ?page=opportunity', async () => {
  const res = await GET(await verifiedPageReq('user@example.com', 'opportunity'));
  expect(await res.json()).toEqual({ verified: true });
  expect(crmMock).toHaveBeenCalledWith(
    'user@example.com',
    'g3d:family_intelligence:opportunity-viewed'
  );
});

it('falls back to fundraising-viewed for an unknown page param', async () => {
  const res = await GET(await verifiedPageReq('user@example.com', 'evil'));
  expect(await res.json()).toEqual({ verified: true });
  expect(crmMock).toHaveBeenCalledWith(
    'user@example.com',
    'g3d:family_intelligence:fundraising-viewed'
  );
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- tests/gate-status.test.ts`
Expected: FAIL (opportunity case receives `fundraising-viewed`)

- [ ] **Step 3: Implement** — in `app/api/gate-status/route.ts`, replace the `VIEWED_SOURCE` import with `resolveViewedSource` and read the param:

```ts
import { resolveViewedSource } from '@/lib/gate-page';
// ... createCrmContact still imported from '@/lib/crm' (drop VIEWED_SOURCE import)

  const viewedSource = resolveViewedSource(
    request.nextUrl.searchParams.get('page')
  );
  if (consume(`gate-status:${clientIp(request)}`, PING_LIMIT, PING_WINDOW_MS)) {
    after(() => createCrmContact(session.email, viewedSource));
  }
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- tests/gate-status.test.ts`
Expected: PASS, including all pre-existing cases.

- [ ] **Step 5: Commit**

```bash
git add app/api/gate-status/route.ts tests/gate-status.test.ts
git commit -m "gate-status: per-page viewed-source attribution via validated slug"
```

---

### Task 5: InlineEmailGate page prop

**Files:**
- Modify: `www/components/InlineEmailGate.tsx`

**Interfaces:**
- Produces: optional prop `page?: string`; when set, the auto-unlock fetch calls `/api/gate-status?page=<page>`. Fundraising callers unchanged (no prop → today's URL). Consumed by Task 12.

- [ ] **Step 1: Implement** — extend the props interface and the status fetch:

```tsx
interface InlineEmailGateProps {
  onSuccess: () => void
  source?: string
  prompt?: string
  page?: string
}

// in the component signature:
export default function InlineEmailGate({ onSuccess, source, prompt, page }: InlineEmailGateProps) {

// in the gate-status effect, replace the fetch line:
    fetch(page ? `/api/gate-status?page=${encodeURIComponent(page)}` : '/api/gate-status')
```

Also make the verify-success gtag label follow the page (fundraising unchanged):

```tsx
          window.gtag('event', 'email_subscribe', {
            event_category: 'engagement',
            event_label: page ? `${page}_gate` : 'fundraising_gate',
            value: 1,
          })
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Run the full suite (no behavior change for existing callers)**

Run: `npm test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add components/InlineEmailGate.tsx
git commit -m "InlineEmailGate: optional page prop for per-page gate-status attribution"
```

---

### Task 6: Reference registry

**Files:**
- Create: `www/app/opportunity/content/references.ts`
- Test: `www/tests/opportunity-references.test.ts`

**Interfaces:**
- Produces: `REFERENCES: Record<string, Reference>` with `type Reference = { source: string; date: string; url: string; note?: string }`, plus `refNumber(key: string): number` (1-based, stable insertion order) and `orderedReferences(): Array<[string, Reference]>`. Consumed by Tasks 7 (Ref component) and 8–11 (content).

- [ ] **Step 1: Write the failing test** (`tests/opportunity-references.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import {
  REFERENCES,
  refNumber,
  orderedReferences,
} from '../app/opportunity/content/references';

describe('opportunity reference registry', () => {
  it('every entry has a source, an ISO-ish date, and an https url', () => {
    for (const [key, ref] of Object.entries(REFERENCES)) {
      expect(ref.source, key).toBeTruthy();
      expect(ref.date, key).toMatch(/^\d{4}(-\d{2})?(-\d{2})?$/);
      expect(ref.url, key).toMatch(/^https:\/\//);
    }
  });

  it('numbers references stably from 1 in insertion order', () => {
    const entries = orderedReferences();
    expect(entries.length).toBeGreaterThanOrEqual(30);
    expect(refNumber(entries[0][0])).toBe(1);
    expect(refNumber(entries[entries.length - 1][0])).toBe(entries.length);
  });

  it('throws on an unknown key so a typo fails tests, not renders', () => {
    expect(() => refNumber('not-a-real-key')).toThrow();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- tests/opportunity-references.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `app/opportunity/content/references.ts`** — the full seed, keys grouped by deck page. These map 1:1 from the spec's evidence bank; entries marked `note: 'verify'` are the spec's "verify before deck lock" items.

```ts
export type Reference = {
  source: string;
  date: string;
  url: string;
  note?: string;
};

export const REFERENCES: Record<string, Reference> = {
  // p2, p13 — computing history
  'census-computer-ownership': { source: 'US Census Bureau', date: '2018', url: 'https://www.census.gov/library/publications/2018/acs/acs-39.html' },
  'apple2-price': { source: 'Computer History Museum', date: '1977', url: 'https://www.computerhistory.org/tdih/june/10/' },
  'ibm-pc-price': { source: 'IBM corporate history', date: '1981', url: 'https://www.ibm.com/history/personal-computer' },
  'mac-price': { source: 'AppleInsider', date: '2019-01-24', url: 'https://appleinsider.com/articles/19/01/24/apple-launched-macintosh-on-january-24-1984-and-changed-the-world----eventually' },
  // p3 — local AI momentum
  'epoch-open-weights': { source: 'Epoch AI', date: '2026', url: 'https://epoch.ai/data-insights/open-weights-vs-closed-weights-models' },
  'inkling': { source: 'TechCrunch', date: '2026-07-15', url: 'https://techcrunch.com/2026/07/15/thinking-machines-amps-up-its-bet-against-one-size-fits-all-ai-with-its-first-open-model-inkling/' },
  'nemotron3': { source: 'NVIDIA Newsroom', date: '2025-12-15', url: 'https://nvidianews.nvidia.com/news/nvidia-debuts-nemotron-3-family-of-open-models' },
  'ai-pc-shipments': { source: 'Counterpoint Research', date: '2026', url: 'https://counterpointresearch.com/en/reports/ai-advanced-pcs-to-surpass-half-of-global-shipments-in-2026' },
  'ollama': { source: 'TechCrunch', date: '2026-07-09', url: 'https://techcrunch.com/2026/07/09/popular-open-source-ai-developer-tool-ollama-raises-65m-grows-to-nearly-9m-users/' },
  // p4 — sovereign AI
  'nvidia-palantir': { source: 'NVIDIA Newsroom', date: '2025-10', url: 'https://nvidianews.nvidia.com/news/nvidia-palantir-ai-enterprise-data-intelligence' },
  'palantir-sovereign-aios': { source: 'Businesswire', date: '2026-06-29', url: 'https://www.businesswire.com/news/home/20260629390275/en/Palantir-Launches-Engine-for-Deploying-NVIDIA-Nemotron-Open-Models-in-Sovereign-Environments' },
  'eu-gigafactories': { source: 'Euronews', date: '2026-07-30', url: 'https://www.euronews.com/my-europe/2026/07/30/eu-opens-call-for-seven-gigafactories-to-train-next-generation-ai-technologies' },
  'cloudian-onprem': { source: 'Cloudian 2026 Enterprise AI Infrastructure Survey', date: '2026-03', url: 'https://www.storagenewsletter.com/wp-content/uploads/2026/03/Cloudian-AI-Infrastructure-Survey_Report.pdf' },
  // p5 — regulation
  'coppa-definition': { source: '16 CFR 312.2 (eCFR)', date: '2026', url: 'https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312' },
  'coppa-amended': { source: 'FTC', date: '2025-01-16', url: 'https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data' },
  'gdpr-household': { source: 'GDPRhub, Art. 2 commentary', date: '2026', url: 'https://gdprhub.eu/Article_2_GDPR' },
  'hipaa-ftc': { source: 'FTC business guidance', date: '2024-04', url: 'https://www.ftc.gov/business-guidance/blog/2024/04/updated-ftc-health-breach-notification-rule-puts-new-provisions-place-protect-users-health-apps' },
  'eu-ai-act-enforcement': { source: 'Help Net Security', date: '2026-08-04', url: 'https://www.helpnetsecurity.com/2026/08/04/eu-ai-act-enforcement-ai-models/' },
  'ab1043': { source: 'Hunton (California AB 1043)', date: '2025-10', url: 'https://www.hunton.com/privacy-and-cybersecurity-law-blog/california-introduces-new-age-verification-requirements-for-software-applications' },
  'senate-moratorium': { source: 'Goodwin', date: '2025-07', url: 'https://www.goodwinlaw.com/en/insights/publications/2025/07/alerts-practices-aiml-federal-ai-moratorium-dies-on-the-vine' },
  // p6 — trust gap
  'pew-distrust': { source: 'Pew Research Center', date: '2026-06-17', url: 'https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/' },
  'parks-72': { source: 'Parks Associates', date: '2024', url: 'https://www.parksassociates.com/blogs/pr-smart-home/72-of-smart-home-product-owners-are-concerned-with-personal-data-security' },
  'echo-local-removed': { source: 'TechCrunch', date: '2025-03-15', url: 'https://techcrunch.com/2025/03/15/amazons-echo-will-send-all-voice-recordings-to-the-cloud-starting-march-28/' },
  'whittaker': { source: 'Startup Fortune', date: '2026-06', url: 'https://startupfortune.com/signals-meredith-whittaker-says-ai-agents-are-surveillance-infrastructure-and-shes-right/', note: 'verify' },
  // p7 — intentional tech
  'yoto-growth': { source: 'Music Ally', date: '2025-08-27', url: 'https://musically.com/2025/08/27/childrens-speakers-startup-yoto-saw-sales-grow-by-86-in-2024/' },
  'signal-backups': { source: 'Signal', date: '2025', url: 'https://signal.org/blog/introducing-secure-backups/' },
  'apple-adp': { source: 'Apple', date: '2026', url: 'https://support.apple.com/en-us/108756' },
  // p10 — family comps
  'tonies-fy2025': { source: 'tonies FY2025 results', date: '2026', url: 'https://www.mynewsdesk.com/us/tonies/pressreleases/tonies-continues-profitable-growth-with-record-results-in-2025-expects-strong-momentum-for-full-year-2026-expansion-of-ecosystem-around-toniebox-2-proves-a-global-success-3442746' },
  'life360-q1': { source: 'Life360 investor relations', date: '2026-05-11', url: 'https://investors.life360.com/news-releases/news-release-details/life360-reports-record-q1-2026-results' },
  'ancestry-blackstone': { source: 'Blackstone', date: '2020-08', url: 'https://www.blackstone.com/news/press/blackstone-to-acquire-ancestry-leading-online-family-history-business-for-4-7-billion/' },
  'storyworth': { source: 'StoryWorth (company-reported)', date: '2026', url: 'https://welcome.storyworth.com/blog/storyworth-reviews-good-bad' },
  'greenlight': { source: 'Sacra', date: '2025-05', url: 'https://sacra.com/c/greenlight/' },
  // p11 — cautionary
  '23andme-sale': { source: 'CNBC', date: '2025-06-13', url: 'https://www.cnbc.com/2025/06/13/anne-wojcicki-to-buy-back-23andme-and-its-data-for-305-million.html' },
  '23andme-breach': { source: 'ClassAction.org', date: '2026-01', url: 'https://www.classaction.org/blog/23andme-data-breach-settlement-30m-deal-covers-millions-whose-info-was-stolen' },
  'chatgpt-logs': { source: 'Bloomberg Law', date: '2026-01-05', url: 'https://news.bloomberglaw.com/ip-law/openai-must-turn-over-20-million-chatgpt-logs-judge-affirms' },
  'askai-leak': { source: 'Malwarebytes', date: '2026-02', url: 'https://www.malwarebytes.com/blog/news/2026/02/ai-chat-app-leak-exposes-300-million-messages-tied-to-25-million-users' },
  // p12 — hub category
  'alexa-600m': { source: 'CNBC', date: '2025-09-30', url: 'https://www.cnbc.com/2025/09/30/amazon-devices-alexa-echo-kindle.html' },
  'google-home-800m': { source: 'Google Developers Blog', date: '2025-10-01', url: 'https://developers.googleblog.com/en/gemini-for-home-expanding-the-platform-for-a-new-era-of-smart-home-ai/' },
  'edison-35': { source: 'Edison Research, Infinite Dial 2025', date: '2025', url: 'https://www.edisonresearch.com/the-infinite-dial-2025/' },
  'parks-51': { source: 'Parks Associates', date: '2025-10', url: 'https://www.prnewswire.com/news-releases/parks-associates-amazon-smart-speakers-now-account-for-60-of-all-smart-speaker-purchases-302572389.html' },
  'openai-io': { source: 'Bloomberg', date: '2025-05-21', url: 'https://www.bloomberg.com/news/articles/2025-05-21/openai-to-buy-apple-veteran-jony-ive-s-ai-device-startup-in-6-5-billion-deal' },
  'bee-amazon': { source: 'TechCrunch', date: '2025-07-22', url: 'https://techcrunch.com/2025/07/22/amazon-acquires-bee-the-ai-wearable-that-records-everything-you-say/' },
  'limitless-meta': { source: 'TechCrunch', date: '2025-12-05', url: 'https://techcrunch.com/2025/12/05/meta-acquires-ai-device-startup-limitless/' },
  // p14 — subscription economics
  '1password-arr': { source: 'CNBC', date: '2025-11-06', url: 'https://www.cnbc.com/2025/11/06/ryan-reynolds-backed-1password-tops-400-million-in-arr.html' },
  'proton-nonprofit': { source: 'TechCrunch', date: '2024-06-17', url: 'https://techcrunch.com/2024/06/17/privacy-app-maker-proton-transitions-to-non-profit-foundation-structure/' },
  'apple-subscriptions': { source: 'MacRumors (Apple Q3 2026 earnings)', date: '2026-07-30', url: 'https://www.macrumors.com/2026/07/30/apple-3q-2026-earnings/' },
  // p15/p16 — traction & economics
  'plaud': { source: 'Forbes', date: '2025-09-02', url: 'https://www.forbes.com/sites/iainmartin/2025/09/02/how-an-ai-notetaker-became-one-of-the-few-profitable-ai-startups/' },
  'rabbit-ship': { source: 'Wikipedia, Rabbit r1', date: '2024', url: 'https://en.wikipedia.org/wiki/Rabbit_r1' },
  // p18 — device density
  'parks-17-devices': { source: 'Parks Associates', date: '2024-01', url: 'https://www.parksassociates.com/blogs/press-releases/at-ces-2024-parks-associates-announces-new-research-showing-average-number-of-connected-devices-per-us-internet-household-reached-17-in-2023' },
  'matter-1200': { source: 'Matter Alpha (CSA)', date: '2026-06', url: 'https://www.matteralpha.com/explainer/unify-2026-matter-takeaways-industry-future' },
  'abi-tinyml': { source: 'ABI Research', date: '2026-06-18', url: 'https://www.abiresearch.com/press/tinyml-ai-chipset-shipments-to-top-4.1-billion-by-2031-as-embedded-ai-scales-across-industrial-iot' },
  // p20 — licensing economics
  'qualcomm-qtl': { source: 'Qualcomm FY2025 10-K (SEC)', date: '2025-11', url: 'https://www.sec.gov/Archives/edgar/data/804328/000080432825000085/qcom-20250928.htm' },
  'dolby-licensing': { source: 'Dolby FY2025 results', date: '2025-11', url: 'https://investor.dolby.com/news-events/financial-news/news-details/2025/Dolby-Laboratories-Reports-Fourth-Quarter-and-Fiscal-Year-2025-Financial-Results/default.aspx' },
  'arm-royalty': { source: 'Arm Q4 FYE26 results', date: '2026-05-06', url: 'https://newsroom.arm.com/news/arm-q4-fye26-results' },
  'android-3b': { source: 'Google I/O 2025', date: '2025-05', url: 'https://blog.google/products/android/the-android-show-io-2025' },
  // p22/p24 — objections & ask
  'humane-hp': { source: 'Quantum Zeitgeist', date: '2025-02', url: 'https://quantumzeitgeist.com/hp-acquires-humane-for-116-million-gains-300-patents-and-employees-shuts-down-ai-pin/' },
  'crunchbase-ai-half': { source: 'Crunchbase News', date: '2026-01', url: 'https://news.crunchbase.com/ai/big-funding-trends-charts-eoy-2025/' },
  'mozilla-research': { source: 'Instagram (Mozilla collaboration)', date: '2026', url: 'https://www.instagram.com/p/DUWLI8hiUai/' },
  'light-phone': { source: 'Sanctuary Computer', date: '2025', url: 'https://www.sanctuary.computer/work/light-three' },
};

const ORDER = Object.keys(REFERENCES);

export function refNumber(key: string): number {
  const i = ORDER.indexOf(key);
  if (i === -1) throw new Error(`Unknown reference key: ${key}`);
  return i + 1;
}

export function orderedReferences(): Array<[string, Reference]> {
  return ORDER.map(k => [k, REFERENCES[k]]);
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- tests/opportunity-references.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/opportunity/content/references.ts tests/opportunity-references.test.ts
git commit -m "Add /opportunity citation registry with integrity tests"
```

---

### Task 7: Deck primitives — styles, leaves, Ref, FpoBox, chrome

**Files:**
- Create: `www/app/opportunity/opportunity.css`
- Create: `www/app/opportunity/components/DriftingLeaves.tsx`
- Create: `www/app/opportunity/components/Ref.tsx`
- Create: `www/app/opportunity/components/FpoBox.tsx`
- Create: `www/app/opportunity/components/DeckPage.tsx`

**Interfaces:**
- Consumes: `refNumber`, `REFERENCES` (Task 6); assets (Task 1).
- Produces:
  - `<DriftingLeaves />` — self-positioning full-bleed ambient layer.
  - `<Ref k="pew-distrust" />` — superscript numbered link, new tab, `trackOutbound('ref:pew-distrust')`, `title` attribute "{source} · {date}" as the tooltip.
  - `<FpoBox note="..." aspect="16/9" />` — dashed `fi-green-400` box labeled "FPO" with the draw note.
  - `<DeckPage n={7} total={24} act="I — The Category" chrome>{children}</DeckPage>` — full-viewport snap page with header/footer chrome; `chrome={false}` for the cover.

- [ ] **Step 1: Write `opportunity.css`** — deck shell + leaves (port of family-book `style.css:100-161`, re-tokenized to `fi-*`):

```css
/* Deck shell */
.deck { height: 100dvh; overflow-y: auto; scroll-snap-type: y mandatory; }
.deck-page { min-height: 100dvh; scroll-snap-align: start; position: relative;
  display: flex; flex-direction: column; padding: 72px var(--container-padding); }
.deck-chrome-header, .deck-chrome-footer { position: absolute; left: 0; right: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 var(--container-padding); color: var(--fi-black-900);
  font-family: var(--font-sans); font-size: 13px; letter-spacing: 0.04em; }
.deck-chrome-header { top: 20px; }
.deck-chrome-footer { bottom: 20px; }
.deck-act-2 { background: var(--fi-green-200); }
.deck-act-3 { background: var(--fi-green-100); }
.deck-act-4 { background: var(--fi-green-200); }

/* Progress rail */
.deck-rail { position: fixed; right: 10px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 6px; z-index: 40; }
.deck-rail a { width: 6px; height: 6px; border-radius: 999px;
  background: var(--fi-green-300); display: block; }
.deck-rail a.active { background: var(--fi-green-500); }
.deck-rail a.act-start { height: 14px; }

/* References */
.deck-ref { font-size: 0.6em; vertical-align: super; text-decoration: none;
  color: var(--fi-green-500); margin-left: 1px; }
.deck-ref:hover { text-decoration: underline; }

/* FPO */
.deck-fpo { border: 2px dashed var(--fi-green-400); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; text-align: center;
  color: var(--fi-black-900); background: rgba(184, 198, 176, 0.15);
  font-family: var(--font-sans); font-size: 14px; padding: 24px; width: 100%; }

/* Drifting leaves — port of family-book remote style.css:133-161.
   Two elements per leaf: wrapper drifts + breathes, inner img wobbles. */
.drifting-leaves { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.drift-leaf { position: absolute; left: 0; top: 0; opacity: 0; }
.drift-leaf:nth-child(1) { animation: drift-1 23s linear infinite, leaf-breathe 23s ease-in-out infinite; }
.drift-leaf:nth-child(2) { animation: drift-2 29.44s linear -9.72s infinite, leaf-breathe 29.44s ease-in-out -9.72s infinite; }
.drift-leaf:nth-child(3) { animation: drift-3 18.4s linear -12.14s infinite, leaf-breathe 18.4s ease-in-out -12.14s infinite; }
.drift-leaf:nth-child(1) img { width: 40px; height: 40px; animation: wobble-5 4s ease-in-out infinite alternate; }
.drift-leaf:nth-child(2) img { width: 50px; height: 40px; animation: wobble-4 3.25s ease-in-out -2.1s infinite alternate; }
.drift-leaf:nth-child(3) img { width: 52px; height: 32px; animation: wobble-6 4.75s ease-in-out -6.3s infinite alternate; }
@keyframes drift-1 { from { transform: translate(10vw, 70dvh); } to { transform: translate(86vw, 4dvh); } }
@keyframes drift-2 { from { transform: translate(16vw, 86dvh); } to { transform: translate(92vw, 16dvh); } }
@keyframes drift-3 { from { transform: translate(6vw, 54dvh); } to { transform: translate(80vw, -4dvh); } }
@keyframes leaf-breathe { 0%, 50%, 100% { opacity: 0; } 25%, 75% { opacity: 0.65; } }
@keyframes wobble-5 { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
@keyframes wobble-4 { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }
@keyframes wobble-6 { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
@media (prefers-reduced-motion: reduce) { .drifting-leaves { display: none; } }
```

- [ ] **Step 2: Write the four components**

`components/DriftingLeaves.tsx`:

```tsx
export default function DriftingLeaves() {
  return (
    <div className="drifting-leaves" aria-hidden="true">
      {[1, 2, 3].map(n => (
        <span key={n} className="drift-leaf">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/opportunity/cover-leaf-${n}.png`} alt="" />
        </span>
      ))}
    </div>
  );
}
```

`components/Ref.tsx`:

```tsx
'use client';
import { REFERENCES, refNumber } from '../content/references';

function trackOutbound(label: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'outbound_click', {
      event_category: 'engagement',
      event_label: label,
      value: 1,
    });
  }
}

export default function Ref({ k }: { k: string }) {
  const ref = REFERENCES[k];
  if (!ref) throw new Error(`Unknown reference key: ${k}`);
  return (
    <a
      className="deck-ref"
      href={ref.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${ref.source} · ${ref.date}`}
      onClick={() => trackOutbound(`ref:${k}`)}
    >
      {refNumber(k)}
    </a>
  );
}
```

`components/FpoBox.tsx`:

```tsx
export default function FpoBox({
  note,
  aspect = '16/9',
}: {
  note: string;
  aspect?: string;
}) {
  return (
    <div className="deck-fpo" style={{ aspectRatio: aspect }}>
      <p>
        <strong>FPO</strong>
        <br />
        {note}
      </p>
    </div>
  );
}
```

`components/DeckPage.tsx`:

```tsx
import type { ReactNode } from 'react';

export default function DeckPage({
  n,
  total,
  act,
  actClass = '',
  chrome = true,
  children,
}: {
  n: number;
  total: number;
  act: string;
  actClass?: string;
  chrome?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={`page-${n}`} className={`deck-page ${actClass}`}>
      {chrome && (
        <header className="deck-chrome-header">
          <span>Family Intelligence</span>
          <span>{act}</span>
        </header>
      )}
      <div className="flex-1 flex flex-col justify-center">{children}</div>
      {chrome && (
        <footer className="deck-chrome-footer">
          <span>
            {String(n).padStart(2, '0')} / {total}
          </span>
          <span>Investor Preview · August 2026</span>
          <span>intelligence.family</span>
        </footer>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Typecheck, lint, full suite**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: clean and green. (`window.gtag` typing already exists for the fundraising page; if the declaration is file-local there, lift it into a shared `types/` declaration rather than redeclaring.)

- [ ] **Step 4: Commit**

```bash
git add app/opportunity/opportunity.css app/opportunity/components
git commit -m "Deck primitives: leaves port, Ref citations, FPO boxes, page chrome"
```

---

### Task 8: Archetypes + DeckShell

**Files:**
- Create: `www/app/opportunity/components/archetypes.tsx`
- Create: `www/app/opportunity/components/DeckShell.tsx`

**Interfaces:**
- Consumes: `DeckPage`, `FpoBox`, `DriftingLeaves` (Task 7).
- Produces (all accept `children`/slots; content tasks compose them):
  - `Statement({ title, sub, children })` — Windsor Pro display title (`var(--font-serif)`, clamp 40–64px), Roobert sub, optional body.
  - `BigStat({ stat, title, sub, children })` — giant serif numeral.
  - `Split({ title, sub, media, flip, children })` — text/media 50/50 grid; `flip` mirrors.
  - `EvidenceGrid({ title, sub, cards })` — `cards: Array<{ heading: string; body: ReactNode }>`.
  - `DiagramPage({ title, sub, media, caption, children })`.
  - `Ledger({ title, sub, rows })` — `rows: Array<{ label: ReactNode; value: ReactNode }>`.
  - `CardsPage({ title, sub, cards })` — same card shape as EvidenceGrid, stacked full-width.
  - `DeckShell({ pages, railActs })` — `pages: ReactNode[]`; renders `.deck` container + progress rail (`railActs: Array<{ page: number }>` marks act starts); ArrowUp/ArrowDown scroll to prev/next `#page-N`.
  - Cover is composed directly in content (Task 9), not an archetype: full-bleed `fi-green-100` page, `cover-decoration.png` bottom-right, `DriftingLeaves`, Windsor title.

- [ ] **Step 1: Implement `archetypes.tsx`** — each archetype is a thin presentational wrapper (~20 lines) using the h1/h2/p classes from `globals.css` plus Tailwind layout utilities. Title element: `<h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 400 }}>`; sub: `<h2 className="mt-3" style={{ fontSize: 'clamp(18px, 2.6vw, 26px)' }}>`; body: `<p className="large mt-6 max-w-2xl">`. Grids: `grid md:grid-cols-2 gap-10 items-center` for Split; `grid md:grid-cols-3 gap-6` for EvidenceGrid cards (`rounded-[8px] bg-fi-green-200 p-6`).

- [ ] **Step 2: Implement `DeckShell.tsx`**

```tsx
'use client';
import { useEffect, useState, type ReactNode } from 'react';

export default function DeckShell({
  pages,
  railActs,
}: {
  pages: ReactNode[];
  railActs: Array<{ page: number }>;
}) {
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const next = Math.min(
        Math.max(current + (e.key === 'ArrowDown' ? 1 : -1), 1),
        pages.length
      );
      document
        .getElementById(`page-${next}`)
        ?.scrollIntoView({ behavior: 'smooth' });
      setCurrent(next);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, pages.length]);

  const actStarts = new Set(railActs.map(a => a.page));
  return (
    <div className="deck">
      {pages}
      <nav className="deck-rail" aria-label="Deck pages">
        {pages.map((_, i) => (
          <a
            key={i}
            href={`#page-${i + 1}`}
            aria-label={`Page ${i + 1}`}
            className={`${i + 1 === current ? 'active ' : ''}${actStarts.has(i + 1) ? 'act-start' : ''}`}
            onClick={() => setCurrent(i + 1)}
          />
        ))}
      </nav>
    </div>
  );
}
```

(Scroll-position → `current` sync via IntersectionObserver is a polish item; keyboard + click set it for the draft.)

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/opportunity/components/archetypes.tsx app/opportunity/components/DeckShell.tsx
git commit -m "Deck archetypes and scroll-snap shell with progress rail"
```

---

### Task 9: Content — Act I (pages 1–7) + copy contract test

**Files:**
- Create: `www/app/opportunity/content/act1.tsx`, `www/app/opportunity/content/index.ts`
- Test: `www/tests/opportunity-copy.test.ts`

**Interfaces:**
- Consumes: archetypes, `DeckPage`, `Ref`, `FpoBox`, `DriftingLeaves`.
- Produces: `export const ACT1_PAGES: ReactNode[]` (7 entries); `content/index.ts` exports `ALL_PAGES: ReactNode[]`, `TOTAL = 24`, `ACT_STARTS = [{ page: 1 }, { page: 8 }, { page: 17 }, { page: 22 }]`.

Exact Title / Sub strings (copy verbatim; body copy is drafted at execution from the matching spec page paragraph, 40–80 words, citing the listed `Ref` keys):

| Pg | Archetype | Title | Sub | Refs |
|---|---|---|---|---|
| 1 | Cover (bespoke) | Family Intelligence | Private intelligence for the home. | (traction strip, no refs) |
| 2 | Diagram | The GPU is coming home | AI compute is moving into the house, the way the personal computer did. | census-computer-ownership |
| 3 | Split | Local AI now runs on consumer hardware | Open-weight models are closing the gap with the frontier. | epoch-open-weights, inkling, nemotron3, ai-pc-shipments, ollama |
| 4 | Evidence Grid | The industry is moving compute to the data | NVIDIA, Palantir and Cohere are betting on sovereign AI. | nvidia-palantir, palantir-sovereign-aios, eu-gigafactories, cloudian-onprem |
| 5 | Diagram | Privacy law triggers when data leaves the device | Local-first architecture is ahead of the coming AI regulation. | coppa-definition, coppa-amended, gdpr-household, hipaa-ftc, eu-ai-act-enforcement, ab1043, senate-moratorium |
| 6 | Big Stat | Nobody owns this category | 7 in 10 Americans don't trust big tech's AI. There is no Signal or Mozilla of the home. | pew-distrust, parks-72, echo-local-removed, whittaker |
| 7 | Evidence Grid | People pay for intentional technology | Light Phone, Daylight, Remarkable and Yoto built profitable businesses on it. | yoto-growth, signal-backups, apple-adp, light-phone |

FPO notes per page: copy the matching row of the spec's "Page-by-page: archetype + FPO asset" table into each `FpoBox note` verbatim.

Cover composition (page 1): full-bleed page, no chrome; `cover-decoration.png` absolutely positioned bottom-right (`width: min(70vw, 632px)`, `pointer-events: none`); `<DriftingLeaves />`; Windsor Pro title + Roobert sub top-left region; traction strip line: `Working prototype · Published research with Mozilla · Direct Foxconn relationships`; below it, the gate slot — the cover accepts a `gate?: ReactNode` prop from OpportunityClient (Task 12) and renders it under the traction strip.

- [ ] **Step 1: Write the failing copy-contract test** (`tests/opportunity-copy.test.ts`, following the `fundraising-copy.test.ts` read-the-source pattern)

```ts
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- tests/opportunity-copy.test.ts`
Expected: FAIL (act1.tsx missing)

- [ ] **Step 3: Implement `act1.tsx` and `index.ts`** — compose the seven pages per the table above; draft body copy from the spec's Act I paragraphs at 40–80 words per page (spec section "Act I — The Category"), placing each `<Ref k="..." />` immediately after the fact it supports. `index.ts`:

```ts
import { ACT1_PAGES } from './act1';

export const TOTAL = 24;
export const ACT_STARTS = [{ page: 1 }, { page: 8 }, { page: 17 }, { page: 22 }];
export const ALL_PAGES = [...ACT1_PAGES]; // acts 2–4 append in later tasks
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- tests/opportunity-copy.test.ts && npx tsc --noEmit`
Expected: PASS / clean.

- [ ] **Step 5: Commit**

```bash
git add app/opportunity/content tests/opportunity-copy.test.ts
git commit -m "Deck content: Act I pages with copy contract test"
```

---

### Task 10: Content — Act II (pages 8–16)

**Files:**
- Create: `www/app/opportunity/content/act2.tsx`
- Modify: `www/app/opportunity/content/index.ts` (append `ACT2_PAGES`)
- Test: extend `www/tests/opportunity-copy.test.ts`

**Interfaces:** same pattern as Task 9; produces `ACT2_PAGES: ReactNode[]` (9 entries).

Titles/Subs (verbatim) with archetypes and refs:

| Pg | Archetype | Title | Sub | Refs |
|---|---|---|---|---|
| 8 | Statement | Our first device is for families | High emotional value, low-risk data, and a GPU in the living room. | — |
| 9 | Split | A family practice | Weekly check-ins, budgets, school, health, and the family stories. | — |
| 10 | Evidence Grid | Families already pay for this | tonies did €630M in revenue last year. Life360 is a $4.5B public company. | tonies-fy2025, life360-q1, ancestry-blackstone, storyworth, greenlight |
| 11 | Split | Family data is too sensitive for the cloud | 23andMe centralized it. That ended in a breach and a bankruptcy. | 23andme-sale, 23andme-breach, chatgpt-logs, askai-leak |
| 12 | Big Stat | Home hubs are a proven category | 600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally. | alexa-600m, google-home-800m, edison-35, parks-51, openai-io, bee-amazon, limitless-meta |
| 13 | Ledger | $899 flagship, $499 companions | The Apple II cost $7,000 in today's dollars. Premium first, affordable next. | apple2-price, ibm-pc-price, mac-price, census-computer-ownership |
| 14 | Diagram | A privacy-conscious cloud subscription | $9/month, optional: zero-knowledge backup, sync, and remote access. | 1password-arr, proton-nonprofit, apple-subscriptions |
| 15 | Split | The prototype already works | Built on a previous-generation NVIDIA Orin, by choice. | mozilla-research, rabbit-ship, plaud, tonies-fy2025 |
| 16 | Ledger | Unit economics | An $899 device, a $9/month subscription, 110,000 devices in five years. | plaud |

Notes for execution: p12 subtitle contains the exact string above; the copy test asserts `$15M` appears exactly once deck-wide (it lands on p24 in Task 11). Page 15 uses existing assets `/fundraising/moment-video-poster.jpg` and `/fundraising/grandma-text.png` in its media slot (real assets, not FPO). Body copy source: spec section "Act II — The Wedge".

- [ ] **Step 1: Extend the copy test** — append:

```ts
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
```

- [ ] **Step 2: Run to verify failure**, then **Step 3: implement** `act2.tsx` per the table, append to `index.ts` (`ALL_PAGES = [...ACT1_PAGES, ...ACT2_PAGES]`), then **Step 4: verify pass** (`npm test -- tests/opportunity-copy.test.ts && npx tsc --noEmit`).

- [ ] **Step 5: Commit**

```bash
git add app/opportunity/content tests/opportunity-copy.test.ts
git commit -m "Deck content: Act II pages"
```

---

### Task 11: Content — Acts III & IV + appendix + Sources page

**Files:**
- Create: `www/app/opportunity/content/act3.tsx`, `act4.tsx`, `appendix.tsx`
- Modify: `www/app/opportunity/content/index.ts`
- Test: extend `www/tests/opportunity-copy.test.ts`

**Interfaces:** produces `ACT3_PAGES` (5), `ACT4_PAGES` (3), `APPENDIX_PAGES` (A1–A10 stubs + Sources). `ALL_PAGES` = all four acts (24 core); `APPENDIX_PAGES` render after the core with quiet chrome (`act="A — For the Diligent Reader"`, unnumbered footer).

Act III titles/subs (verbatim), archetypes, refs:

| Pg | Archetype | Title | Sub | Refs |
|---|---|---|---|---|
| 17 | Split | A context window for the home | The house keeps its own memory: people, maintenance, money, goals. | — |
| 18 | Diagram | The Home Harness | One local agent every device on the network can use. | parks-17-devices, matter-1200, abi-tinyml |
| 19 | Diagram | The stack | Six generic primitives, built once, reused in every product. | — |
| 20 | Split | Licensing works like Android | Every Snapdragon ships a tuned Android build. Partner devices ship a tuned Harness. | qualcomm-qtl, dolby-licensing, arm-royalty, android-3b |
| 21 | Diagram | One stack, four markets | Families, then homes, then offices, then enterprise hardware partners. | — |

Act IV:

| Pg | Archetype | Title | Sub | Refs |
|---|---|---|---|---|
| 22 | Cards | The hard questions | Apple, model quality, hardware risk, and consent. | echo-local-removed, humane-hp, openai-io, inkling, nemotron3 |
| 23 | Cards | The team | We shipped the Light Phone, Mill's IoT stack, and USB Club. | light-phone |
| 24 | Statement | We're raising $15M | On shelves and ready to gift by Christmas 2027. | crunchbase-ai-half |

Appendix stubs: each A-page is a `Statement` with the spec's appendix list item as title (e.g. "A1 · Stack deep-dive") and a one-line "Detail follows in the investor-ready revision." body plus an `FpoBox`. The Sources page renders `orderedReferences()` as a numbered list of `source · date · url` links.

Copy-test additions: acts III/IV title order (same pattern as prior steps, arrays from the tables above), plus:

```ts
it('asks for $15M exactly once across the deck, on the ask page', () => {
  const all = contentFiles().map(([, s]) => s).join('\n');
  expect(all.match(/\$15M/g)).toHaveLength(1);
  const act4 = readFileSync(path.join(dir, 'act4.tsx'), 'utf8');
  expect(act4).toContain("We're raising $15M");
});

it('renders a sources page from the registry', () => {
  const src = readFileSync(path.join(dir, 'appendix.tsx'), 'utf8');
  expect(src).toContain('orderedReferences');
});
```

- [ ] **Step 1: extend copy test → Step 2: verify failure → Step 3: implement → Step 4: verify pass** (`npm test && npx tsc --noEmit`) — body copy from spec sections "Act III", "Act IV", "Appendix"; the p24 body carries the take-it-or-leave-it framing verbatim in intent: building either way, round sets the speed, window stated as fact, email invitation (`invest@intelligence.family` mailto, mirroring the fundraising CTA conventions).

- [ ] **Step 5: Commit**

```bash
git add app/opportunity/content tests/opportunity-copy.test.ts
git commit -m "Deck content: Acts III-IV, appendix stubs, sources page"
```

---

### Task 12: Route, layout, gate wiring

**Files:**
- Create: `www/app/opportunity/layout.tsx`, `www/app/opportunity/page.tsx`, `www/app/opportunity/OpportunityClient.tsx`
- Test: extend `www/tests/opportunity-copy.test.ts`

**Interfaces:**
- Consumes: `ALL_PAGES`, `APPENDIX_PAGES`, `TOTAL`, `ACT_STARTS`; `DeckShell`; `InlineEmailGate` with `page="opportunity"` and `source={OPPORTUNITY_GATE_SOURCE}` (import the constant, no string literal).
- Produces: the live `/opportunity` route.

Gate behavior (mirrors `FundraisingClient` — read it first): cover always renders (leaves, title, traction strip) with the `InlineEmailGate` form embedded on the cover below the traction strip; pages 2+ are **not mounted** until unlocked (`unlocked` state; conditional render also keeps the leaves the only animating nodes pre-unlock). localStorage hint key: `fi_opportunity_unlocked_v1`; verified-cookie holders auto-unlock via the gate's `/api/gate-status?page=opportunity` call.

- [ ] **Step 1: Write the failing test additions**

```ts
describe('opportunity gate contract', () => {
  const client = () =>
    readFileSync(
      path.join(__dirname, '..', 'app', 'opportunity', 'OpportunityClient.tsx'),
      'utf8'
    );

  it('gates with the opportunity source constant and page slug', () => {
    expect(client()).toContain('OPPORTUNITY_GATE_SOURCE');
    expect(client()).toContain('page="opportunity"');
    expect(client()).toContain('fi_opportunity_unlocked_v1');
  });

  it('is noindexed', () => {
    const layout = readFileSync(
      path.join(__dirname, '..', 'app', 'opportunity', 'layout.tsx'),
      'utf8'
    );
    expect(layout).toMatch(/index:\s*false/);
  });
});
```

- [ ] **Step 2: Run to verify failure**, then **Step 3: implement**:

`layout.tsx` — mirror `app/fundraising/layout.tsx` exactly, with `title = 'Opportunity · Family Intelligence'`, same description/share image, `robots: { index: false, follow: false }`.

`page.tsx`:

```tsx
import OpportunityClient from './OpportunityClient';

export default function OpportunityPage() {
  return <OpportunityClient />;
}
```

`OpportunityClient.tsx` skeleton:

```tsx
'use client';
import { useEffect, useState } from 'react';
import InlineEmailGate from '@/components/InlineEmailGate';
import { OPPORTUNITY_GATE_SOURCE } from '@/lib/crm';
import DeckShell from './components/DeckShell';
import { ALL_PAGES, APPENDIX_PAGES, ACT_STARTS } from './content';
import { coverPage } from './content/act1';
import './opportunity.css';

const UNLOCK_KEY = 'fi_opportunity_unlocked_v1';

export default function OpportunityClient() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(UNLOCK_KEY) === '1') setUnlocked(true);
    } catch {}
  }, []);

  const handleUnlock = () => {
    try {
      localStorage.setItem(UNLOCK_KEY, '1');
    } catch {}
    setUnlocked(true);
  };

  const gate = unlocked ? null : (
    <InlineEmailGate
      onSuccess={handleUnlock}
      source={OPPORTUNITY_GATE_SOURCE}
      page="opportunity"
      prompt="Enter your email to view the deck"
    />
  );

  const pages = unlocked
    ? [coverPage(null), ...ALL_PAGES.slice(1), ...APPENDIX_PAGES]
    : [coverPage(gate)];

  return <DeckShell pages={pages} railActs={unlocked ? ACT_STARTS : []} />;
}
```

(Requires Task 9's `act1.tsx` to export `coverPage(gate: ReactNode): ReactNode` and for `ALL_PAGES[0]` to be `coverPage(null)` — keep that contract consistent when implementing Task 9.)

- [ ] **Step 4: Verify** — `npm test && npx tsc --noEmit && npm run lint`, then boot the dev server and smoke-check:

```bash
npm run dev &   # then:
curl -s http://localhost:3000/opportunity | grep -o "Family Intelligence" | head -1
curl -s http://localhost:3000/opportunity | grep -c "page-2"   # expect 0 while locked (SSR renders locked state)
```

Expected: title present; gated pages absent from the locked render.

- [ ] **Step 5: Commit**

```bash
git add app/opportunity tests/opportunity-copy.test.ts
git commit -m "/opportunity route: gated deck shell wired to content"
```

---

### Task 13: Copy audit + final verification

**Files:**
- Modify: `www/app/opportunity/content/*.tsx` (copy fixes only)

- [ ] **Step 1: Run the avoid-ai-writing audit** — invoke the `avoid-ai-writing` skill in edit mode over the five content files, investor-email strictness. Titles/subs are locked (spec-approved); the audit applies to body copy only.

- [ ] **Step 2: Voice checklist pass** — against the Tone of Voice doc (`/Users/hhff/Documents/Code/website/sanctuary.computer/corpus/artifacts/tone-of-voice.md`): exact numbers present, no manufactured urgency, first-person plural warmth, no hedging.

- [ ] **Step 3: Full verification**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run format:check`
Expected: everything green (run `npm run format` first if format:check fails).

- [ ] **Step 4: Visual smoke check** — dev server up; confirm in the browser: cover leaves animate; gate unlocks with a code; arrow keys page; chrome shows correct act labels and page numbers; every FPO box shows its draw note; every superscript opens its source in a new tab.

- [ ] **Step 5: Commit**

```bash
git add app/opportunity/content
git commit -m "Deck copy: avoid-ai-writing audit pass"
```

---

## Self-Review Notes

- **Spec coverage:** narrative pages 1–24 (Tasks 9–11), appendix + Sources (Task 11), chrome/sections (Task 7), references treatment (Tasks 6–7), archetypes (Task 8), leaves/cover (Tasks 1, 7, 9), gate + shared access + per-page attribution (Tasks 2–5, 12), styleguide-only colors (Global Constraints), PDF deferred (excluded per spec). Unit-economics *numbers* remain the spec's open item 1 — p16 ships the simple-math frame only, which the spec permits.
- **Type consistency:** `Reference`/`refNumber`/`orderedReferences` (Task 6) match usages in Tasks 7 and 11; `coverPage(gate)` contract stated in both Task 9 and Task 12; `page` prop name consistent across Tasks 4, 5, 12.
- **Known deliberate gaps:** IntersectionObserver rail sync and mobile polish are post-review; appendix pages are stubs by design for the co-founder draft.
