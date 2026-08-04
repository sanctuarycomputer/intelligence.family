# Investor Deck Narrative Design — "The GPU Is Coming Home"

**Date:** 2026-08-04
**Status:** Draft for Hugh's review
**Scope:** Narrative structure only. Visual design, styling, and the browser/PDF build are explicitly out of scope for this document and will be planned separately once the narrative is approved.

## Goal

Replace the text-dense investor memo/page with a paced, emphasis-controlled deck that walks an investor through the opportunity. The deck is a **send-ahead reading document** (emailed, read unattended, rendered in the browser, exportable as PDF), not a live-presentation deck. It must self-narrate.

**Delivery:** lives at **`/opportunity`** on intelligence.family (new route in `www/`), with PDF export.

**The single takeaway an investor must leave with:** a new compute category (private local intelligence) has just become possible, it is a macro inevitability, nobody owns it in the home, and the trusted brand that claims it first (the way Signal and Mozilla claimed theirs) wins a market that ladders from families to every home, office, and hardware partner.

## Format Decision: 23-page core + 10-page appendix

Research basis (DocSend 2023; Rippling Series A memo; two-deck literature):

- Investors spend 2–3 minutes total on an emailed deck; 65% of unsuccessful teams had above-average page counts. A continuous 30-page narrative risks abandonment before the ask.
- Narrative reading documents are a validated format at length (Rippling raised $45M on a memo), provided they are memo-shaped: thesis up front, skimmable, evidence layered beneath.
- Post-2023 attention shifted to proof pages: business model (+48%), traction (+33%), competition (+88%). Unit economics and objections pages get disproportionate craft.
- The a16z speedrun rule shapes the acts: first half = the wedge and the next 12 months; second half = "what if it works."
- Steel-manned objections belong late-middle, after conviction and before the ask.
- Every act opens with a full-bleed single-idea page, so a skimmer reading only act openers gets the whole argument.

## Voice & copy rules

- **Tone of Voice source:** `../website/sanctuary.computer/corpus/artifacts/tone-of-voice.md` (v4, approved 2026-07-30). The rules that bite hardest for this deck: say the exact number (never round into vagueness); every claim carries its "so that"; plain words and layman-friendly metaphors; moral conviction stated flat; aphoristic compression (one earned aphorism per section); name the idea then reuse it (Home Harness is a coinage in exactly this tradition); confident "we don't" refusals lead, humility is earned later.
- **Voice tension to respect:** the voice never uses fear, pressure, or manufactured urgency as leverage. The deck's closing urgency ("the category gets claimed once") must be stated as plain fact about the market window with evidence, never as pressure tactics or countdown framing.
- **Tight, obvious, high impact:** each page carries less text at higher impact. Headline does the arguing (aim under 10 words); body copy supports at roughly 40–80 words on core pages; detail lives in the appendix. If a page needs a paragraph to be understood, the page is wrong.
- Copy audited with the `avoid-ai-writing` skill at investor-email strictness: no em dashes, no bold overuse, named comparables over vague claims (per established project convention).
- One idea per page. Headlines carry the argument; body copy supports.
- Every factual claim carries a real citation (evidence bank below). Nothing hand-waved.

---

## Act I — The Category (pages 1–7)

*Newly possible. Macro inevitable. Unowned. Regulation-aligned.*

**Page 1 — Cover: "Private intelligence for the home."**
One-sentence company purpose (Sequoia style) plus the single strongest proof point: the published Mozilla Foundation research collaboration. Brand, device silhouette.

**Page 2 — "Every computing era ends the same way: the machine moves into the house."**
The controlling metaphor. Mainframe → home computer; datacenter → home GPU. Supporting stat: in 1984 only 8% of US households owned a computer; by 2016 it was 89% (US Census). The first wave is the home GPU; eventually every home and office runs its own.

**Page 3 — "This is newly possible."**
Quantitative why-now, technical leg: open-weights capability curves (Epoch AI), consumer NPU cost curves, our prototype running on a previous-generation NVIDIA Orin (no bleeding-edge dependency). Open source is the future and we inherit its upstream advances for free: Thinking Machines Lab released Inkling, the largest American open-weights model (975B params, Apache 2.0, July 2026); NVIDIA's Nemotron 3 family ships permissively licensed with training data and tooling (Dec 2025 – June 2026). Jensen Huang: "Open innovation is the foundation of AI progress."

**Page 4 — "The giants already agree."**
Macro leg: sovereign AI. NVIDIA–Palantir partnership (Oct 2025); their Sovereign AI Operating System Reference Architecture for air-gapped government deployments where "data can never leave the building" (June 2026); the Nemotron Coalition of eight labs (March 2026); Cohere's sovereign positioning. Nations and enterprises are already buying compute they control. The household is the last sovereign unit nobody serves.

**Page 5 — "Regulation triggers at the network boundary."**
The front-running-regulation moat, and it verifies cleanly. The trigger is collection: COPPA's entire apparatus turns on "the gathering of any personal information from a child" (16 CFR 312.2); GDPR exempts purely personal household processing by the user (Art. 2(2)(c)); HIPAA binds only entities that create, receive, maintain, or transmit PHI for covered entities. Data that never crosses the network boundary largely never pulls these triggers. Meanwhile the compliance wall is rising on the server side right now: the amended COPPA Rule hit full compliance April 22, 2026; 20 states have comprehensive privacy laws; the EU AI Act's transparency duties took effect August 2, 2026. And cloud AI is acquiring KYC plumbing exactly as predicted: California AB 1043 mandates OS-level age signals by 2027, SB 243 imposes chatbot duties on operators, OpenAI already runs behavioral age prediction. After the Senate's 99–1 vote killed federal preemption (July 2025), the 50-state patchwork is durable, and architecture that avoids collection is the only compliance strategy that scales across every jurisdiction at once. Apple is the argument in market form: "the cornerstone of Apple Intelligence is on-device processing."

**Page 6 — "Nobody owns this in the home. Seven in ten Americans are waiting."**
The unclaimed-category page. Pew 2026: ~70% of Americans distrust big tech's AI. Parks Associates: 72% of smart home product owners are concerned about the data their devices collect (2024–25). And the incumbents are moving the wrong way: on March 28, 2025 Amazon removed the Echo's only local-processing option, routing all voice requests through its cloud (TechCrunch/The Register). Demand for AI is enormous; trust in its vendors is absent. That delta is the market, and there is no Signal or Mozilla of the home yet.

**Page 7 — "People already pay a premium for restraint."**
The intentional-tech wave: Light Phone, Daylight, Remarkable, Brick, Yoto (+86% sales growth 2024). The debunk: "convenience always wins" fails where data is intimate; privacy-conscious users choose Signal over iMessage, pay for 1Password, enable Apple ADP. A proven buyer with proven willingness to pay.

---

## Act II — The Wedge (pages 8–15)

*The next 12 months. First half of the pitch per the a16z rule.*

**Page 8 — "Our first device starts where trust matters most: the family."**
Positioning stated plainly: high emotional value, low-risk data category, and this is how the GPU physically enters the home. One device, one market, focus.

**Page 9 — "A family practice, not an app."**
The pivot beat. Not an ancestry gadget: a practice of family rhythm the device hosts. Weekly check-ins, budgets, savings goals, school progress, doctor visits. The stories become the heirloom (voices, accents, the archive as a love letter): the most emotionally resonant feature, deliberately sequenced after the practice so it reads as one beloved feature, never the whole premise. Vignette treatment.

**Page 10 — "Families already pay for this."**
The habit-risk answer, by evidence. Family coordination and storytelling are existing, monetized behaviors at public-company scale: Life360 (~98M MAU, $489.5M FY2025 revenue, ~$4.5B market cap), Ancestry (sold to Blackstone for $4.7B; 3M+ subscribers, $1B+ revenue at acquisition), StoryWorth (1M+ printed books, 35M+ stories, bootstrapped, $59–199/yr), Cozi (20M+ members), Greenlight (6.5M+ parents and kids). We unify the practice these products serve piecemeal, on hardware the family owns.

**Page 11 — "This data can never live in someone else's cloud."**
The cautionary proof: 23andMe went from a $6B peak to Chapter 11; a breach exposed 6.9M users' genetic and family data; its bankruptcy turned the database itself into an asset for sale, triggering state attorneys general to urge deletion. Centralized sensitive family data is a liability model. Our answer is architectural, not policy: physical kill switch, end-to-end encryption where we hold no keys, hybrid-source auditable firmware. Trust you can inspect.

**Page 12 — "The home hub is already a proven category. Ours doesn't phone home."**
The graveyard answer. The AI-hardware graveyard (Humane, Rabbit, friend.com) died inventing radical new interaction paradigms; we enter an already-massive category with a radically different architecture. Alexa: 600M+ devices sold (2025). Google Home: 800M+ connected devices (2025). 35% of Americans 12+ own a smart speaker (Edison 2025); 51% of US internet households own a speaker or display (Parks 2025). You shouldn't have to ask Jeff Bezos to turn on your lights. Beneath it: a generic stack others build interaction paradigms on, not a bet on one novel gadget.

**Page 13 — "Computing enters the home at a premium. It always has."**
The price-point page. Apple II (1977): $1,298, over $7,000 in 2026 dollars. A usable IBM PC (1981): roughly $11,000 today. Macintosh (1984): about $8,000 today, and only 8% of households owned any computer; premium entry prices didn't cap the category, they funded it. Our flagship at $899 carries a GPU and home server; companion devices ($499) join hub-and-spoke, and future spoke devices without GPUs bring the entry price down further. Works out of the box, offline, no account.

**Page 14 — "The cloud, without the surrender."**
The subscription page, framed as the optional upgrade it is. $9/mo buys the conveniences the cloud is actually good at: zero-knowledge encrypted backup (we hold no keys; a decade of family memory survives a dropped device), hub-and-spoke sync across flagship and companion devices, and a remote tunnel so family anywhere can reach the archive. Works in hotspot mode or on the private home network. All the convenience of a cloud LLM system, none of the data surrender. For investors this is the recurring revenue line; for families it is never a gate on the core promise. The device works forever without it.

**Page 15 — "The unit economics."**
The most-read page class post-2023. BOM envelope (prototype vs. at-scale), path to 40%+ blended gross margin, backup attach rate, blended LTV. Peloton frame: the device is the moat, the recurring layer is the business. *(Numbers arrive from the pro-forma actively in progress; page ships with defensible ranges, never "TK.")*

---

## Act III — What If It Works (pages 16–20)

*Second half of the pitch. One product, one stack, then the stack applied.*

**Page 16 — "What we're really building: a context window for the house."**
The elevation beat. The home gains a memory: who the plumber is, when the filters were changed, where each person is in life, what the family is saving for. A home that remembers is infrastructure, not a gadget.

**Page 17 — "Every device in your home will want inference. None of them should need their own cloud."**
The Home Harness: the agentic harness for the home, and the home's generic inference provider. It exposes an MCP server on the local network, a chat-completions endpoint, local RAG, and ontology lookup. The doorbell, the thermostat, the kids' laptop: each taps the home hub over Wi-Fi to perform smarter tasks through one shared agent, instead of every device shipping its own cloud AI subscription and phoning a different datacenter. One GPU, one harness, every device in the house gets intelligent.

**Page 18 — "One stack under everything."**
Exploded view: trusted execution environment, zero-knowledge backup server, mirroring server, peer-to-peer gossip between devices on the local network, local inference runtime, and the generic ontology library (declare a schema; the model extracts it) that lets the same stack serve families, firms, clinics, and newsrooms without rewriting anything.

**Page 19 — "Every chipset gets its own distribution."**
The licensing model with known economics. Every Snapdragon ships with its own tuned Android build that OEMs build on; Qualcomm's licensing arm is the reference business. Every partner device ships a tuned Home Harness distribution adapted to its silicon and form factor, royalty per device. Buyers: Sonos, Dyson, Bang & Olufsen, LG, and every hardware company that wants private intelligence inside its devices and will never build this stack.

**Page 20 — "One product. One stack. Every place private data needs inference."**
The focus frame and the sizing page. Not four businesses: one consumer hardware company and its underlying stack, applied in sequence to the home, the office, and enterprise hardware partnerships. Bottoms-up wedge math (households × ASP × attach) as the precise number; office (per-room/per-seat, on-prem transcription and meeting capture) and enterprise licensing (royalty × partner fleet volumes) as clearly labeled earned upside, with health as the largest private-compute prize. What carries over at every rung is the point: the stack, the trust brand, and the consumer fleet as reference customer. Phase gates state what unlocks each stage and what we are not doing yet. Destination: the 200-person company with Home, Family, Legal, and Health divisions.

---

## Act IV — Objections, Team, Ask (pages 21–23)

**Page 21 — "The hard questions, answered."**
Steel-manned, compact, each pointing to appendix depth:
- *Why won't Apple or Google do this?* Purity of trust (privacy-conscious users choose Signal over iMessage); ad-model conflict for Google and Amazon; an open harness every device can join versus a walled garden; incumbents treat this as a feature, we treat it as the company. Amazon's March 2025 removal of local processing shows the cloud gravity they can't escape.
- *Won't local models always lag the frontier?* Yes, and it doesn't matter: household tasks are narrow (transcription, extraction, RAG, classification). The gap is closing fast, and open weights (Inkling, Nemotron 3) mean every upstream advance lands in our stack for free.
- *Why dedicated hardware?* The seven in ten are not hobbyists. The trust boundary must be physical and legible to the oldest person in the family. Beautiful appliances are how AI enters the home; hardware is the moat and the margin.
- *Recording consent and children's data?* Consent-first capture, no ambient listening, and an architecture that keeps regulated data classes on-device (ties back to page 5; detail in appendix A7).

**Page 22 — "We've built humble tech before."**
Full-page team, ~80 words per founder tied to this company's hard parts: Light Phone II & III, Mill's IoT infrastructure, Foxconn/Arima/Coosea manufacturing experience, USB Club, World Advanced Concepts, the Mozilla research collaboration. The talent thesis: privacy-conscious, sovereign-data-minded builders join missions like this the way they join Signal and Mozilla. The first hires this raise buys, named honestly (including the ML-systems lead).

**Page 23 — "We're raising $15M."**
What it buys: a team hired fast enough to ship by Christmas 2027, a contract manufacturer in the room immediately, Foxconn-grade engineering, and the staffing the multi-device ecosystem vision requires. What it proves for the Series A: units shipped, attach rate, fleet reliability, zero trust incidents. Close on urgency: the category gets claimed once.

---

## Appendix — "For the diligent reader" (~10 pages)

- **A1** Stack deep-dive: TEE, zero-knowledge backup, mirroring server, P2P gossip diagrams
- **A2** Ontology library: declare a schema, the model extracts it across every vertical
- **A3** Home Harness API surfaces: MCP server, chat-completions endpoint, RAG, ontology lookup
- **A4** Competition matrix: cloud assistants, AI gadgets, DIY local stacks, genealogy platforms
- **A5** Three-year pro-forma (in progress)
- **A6** GTM detail: waitlist → Founder's Edition → broader pre-order; DTC + curated heritage retail; US-led rollout
- **A7** Trust & risk register: irreversible trust violations list, consent-first capture, children's data, regulatory mechanics
- **A8** Extended FAQ: raise size, subscriptions, industrial design maturity, chip supply
- **A9** Technical futures: family podcast, multimodal capture, cross-generational Q&A, heirloom integration
- **A10** Timeline

---

## Evidence bank (verified citations by page)

**Page 2, 13 — Home computer history**
- Apple II, June 1977, $1,298 (~$7,150 in 2026 dollars; 48KB config $2,638 ≈ $14,500). Computer History Museum; CPI-U via BLS (June 2026 index 333.952).
- IBM PC 5150, Aug 1981, $1,565 base, ~$3,000 usable (~$11,000 in 2026 dollars). IBM corporate history; DOS Days.
- Macintosh 128K, Jan 1984, $2,495 (~$8,000). AppleInsider; Wikipedia.
- Commodore 64, 1982, $595 (~$2,060): even the era's budget champion cost ~$2,000 today. Smithsonian NMAH.
- 8% of US households owned a computer in 1984 → 89% by 2016. US Census Bureau (CPS 1984; ACS 2016, published 2018).
- Phrasing caution: mid-90s "$2,000 average PC spend" is directional only; say "a typical complete home PC in 1995 ran roughly $2,000."

**Page 3 — Open models**
- Thinking Machines Lab "Inkling": 975B-param MoE, Apache 2.0, July 15, 2026; largest American open-weights model to date; monetizes Tinker fine-tuning, not weights. TechCrunch; The Register; Simon Willison. Note: TML did not lead with open source (Tinker API came first, Oct 2025); phrase as "released its first model as open weights," and its efficiency benchmarks are company-claimed.
- NVIDIA Nemotron 3 family: Nano/Super/Ultra (Dec 2025 – June 2026), up to ~550B params, permissive licenses, ~3T tokens of training data released. NVIDIA Newsroom, Dec 15, 2025.
- Nemotron Coalition: eight labs incl. Mistral, Perplexity, Thinking Machines (March 16, 2026). NVIDIA Newsroom.
- Jensen Huang quote: "Open innovation is the foundation of AI progress." NVIDIA Newsroom, Dec 2025.

**Page 4 — Sovereign AI**
- NVIDIA–Palantir partnership announced late Oct 2025 (GTC DC); Lowe's first major adopter (supply-chain digital twin). NVIDIA Newsroom; Dataconomy, Oct 30, 2025.
- Palantir engine for Nemotron in sovereign environments + Sovereign AI Operating System Reference Architecture (AIOS-RA), air-gapped, "data can never leave the building," June 29, 2026. Businesswire.

**Page 6 — Trust gap**
- Pew Research Center, "Americans and AI 2026" (June 17, 2026): the ~70% distrust stat already cited on /fundraising.
- Parks Associates 2024–25: 72% of smart home product owners concerned about device data; ~75% concerned about personal data security; 54% experienced a privacy/security issue in 12 months.
- Amazon removed Echo "Do Not Send Voice Recordings" effective March 28, 2025; all voice requests now cloud-routed. TechCrunch, Mar 15, 2025; The Register, Mar 17, 2025.

**Page 7 — Intentional tech**
- Yoto sales +86% in 2024 (musically.com, Aug 2025); CZI investment. Light Phone, Daylight, Remarkable, Brick as named comparables; Signal secure backups, Apple ADP, 1Password as premium-for-privacy behavior (links already on /fundraising).

**Page 10 — Family-space comps**
- Life360: ~97.8M MAU, Q1 2026 revenue $143.1M (+38% YoY), FY2025 revenue $489.5M (+32%), 3.0M paying circles, ~$4.5B market cap (Aug 2026), guidance $650–685M for 2026. Life360 investor releases, Mar–May 2026.
- Ancestry: Blackstone acquisition $4.7B (Aug 2020); 3M+ paying subscribers, $1B+ revenue at acquisition. Blackstone press release. (Current figures undisclosed; date the claim.)
- StoryWorth: 1M+ printed books, 35M+ stories, $59–199/yr, bootstrapped. Company-reported, 2026; label as such.
- Cozi: 20M+ members (as of 2022 acquisition by OurFamilyWizard). PR Newswire.
- Greenlight: 6.5M+ parents and kids, $2.3B valuation (2021 vintage; date it). Sacra, May 2025. Note: Greenlight launched a GPS family-safety device in March 2026 (fintech converging on family hardware).

**Page 11 — Cautionary tale**
- 23andMe: ~$6B peak (2021) → Chapter 11 (March 2025) → $305M sale to TTAM (approved June 30, 2025). CNBC; NPR.
- 2023 breach: 6.9M users' data exposed (~half of 14.1M customers); $30M class settlement (final approval Jan 2026; a revised $50M figure appears in bankruptcy proceedings, so phrase "a $30M settlement, later revised" if citing). Security.org; ClassAction.org; HIPAA Journal.
- State attorneys general urged customers to delete genetic data during bankruptcy sale. NPR, June 2025.

**Page 12 — Hub category**
- Alexa: 600M+ devices sold (CNBC, Sept 2025; Amazon's own number). Trajectory: 100M (Jan 2019) → 500M (May 2023) → 600M.
- Google Home: 800M+ connected devices via Cloud-to-Cloud APIs and Matter (Google Developers Blog, Oct 1, 2025). Note: counts connected third-party devices, not hardware sold.
- 35% of Americans 12+ own a smart speaker (~101M people). Edison Research Infinite Dial 2025.
- 51% of US internet households own a smart speaker/display; Amazon ~60% of speaker purchases. Parks Associates, Oct 2025.
- Smart home market ~$147.5B (2025) → $848.5B by 2034, 21.4% CAGR. Fortune Business Insights. (Pick one firm and attribute; estimates vary.)
- Alexa+ full US rollout Feb 4, 2026, free for Prime; "tens of millions" of devices running it (Bloomberg, May 2026): evidence the incumbents are doubling down on cloud AI in the home.

**Page 5 / A7 — Regulation** *(verified Aug 4, 2026)*
- COPPA trigger: "collects or collection" defined as "the gathering of any personal information from a child by any means." 16 CFR 312.2 (eCFR). Amended COPPA Rule: announced Jan 16, 2025; effective June 23, 2025; full compliance April 22, 2026 (FTC; Federal Register). Supporting FTC logic: 2017 policy statement declining enforcement where voice recordings replace typed input and are promptly deleted.
- GDPR: Art. 2(2)(c) household exemption covers a user's own on-device processing (GDPRhub; Irish DPC). Honest caveat for diligence: the exemption does not extend to the device maker for what it does process (accounts, telemetry, updates); the accurate claim is exposure reduction on content data, not GDPR immunity.
- HIPAA: binds covered entities and business associates that create/receive/maintain/transmit PHI; FTC states plainly that fitness trackers and health apps "aren't covered by HIPAA" (FTC business guidance, Apr 2024). FTC Health Breach Notification Rule (July 2024) fills the gap but is breach-triggered; data never held server-side cannot be breached at the vendor.
- US state patchwork: 20 states with comprehensive privacy laws as of 2026 (IAPP tracker); Senate voted 99–1 on July 1, 2025 to strip the 10-year state-AI-law moratorium, so the patchwork is durable (Goodwin; Covington).
- AI laws in force: Texas TRAIGA effective Jan 1, 2026; California SB 243 (companion chatbots) effective Jan 1, 2026; California SB 53 (frontier transparency) signed Sept 29, 2025; EU AI Act Article 50 transparency duties apply Aug 2, 2026 (high-risk obligations deferred to Dec 2027 / Aug 2028 by the Digital Omnibus, June 2026).
- KYC-for-AI trend: California AB 1043 (Digital Age Assurance Act, signed Oct 13, 2025, effective Jan 1, 2027) mandates OS-level age signals; OpenAI runs behavioral age prediction (Jan 2026). Identity infrastructure attaches to server-side operators; local-first products have no operator who "knows" the user.
- Expert support: Apple Intelligence positioning ("on-device processing... without collecting your personal information"); FPF treats on-device processing as an established privacy-protective mitigation (June 2026); EDPB voice-assistant guidelines press data minimization.
- Cautions: no explicit FTC ruling that pure on-device processing is categorically outside "collection" (structurally sound; counsel should confirm); Colorado's AI Act was replaced by a narrower law (SB 26-189, May 2026) so avoid citing Colorado as a strict-regulation example; CA Age-Appropriate Design Code litigation status unverified.

**Do not use in the deck** (flagged weak/unverifiable by research): precise Alexa+ subscriber counts; Matter market-size dollar figures; 2019 Pew smart-speaker and 2020 Voicebot stats unless clearly dated; StoryWorth revenue estimates; "HeirloomAI" as a comparable; Inkling efficiency benchmarks without a "company-claimed" label.

---

## Open items

1. **Unit economics (page 15, A5):** pro-forma actively being worked by Hugh; page structure is fixed, numbers land when the model does.
2. **Founder quotes (page 9):** "our own families said it better than we could" quotes remain TK in the memo; decide whether they enter the deck or stay on the website.
3. **Raise framing:** $15M confirmed. Deck copy on what-it-proves milestones (units, attach rate, NPS targets) needs Hugh's real targets before final copy.
4. **Legal review (page 5):** the regulatory argument is structurally sound and well-cited, but two claims need counsel sign-off before investor distribution: that pure on-device processing falls outside COPPA "collection," and the precise GDPR framing (exposure reduction on content data, not immunity).

## Out of scope (deliberately)

- Visual/styling system, typography, and the Next.js deck implementation with PDF export: planned separately after narrative approval.
- Rewriting the Notion memo or /fundraising page: the deck is a new artifact; those remain as-is.

## Next step

On approval of this document: invoke the writing-plans skill to plan the implementation (deck content drafting per page, then the browser-rendered deck with PDF export in `www/`).
