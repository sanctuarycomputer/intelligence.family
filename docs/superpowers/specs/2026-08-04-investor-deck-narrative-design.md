# Investor Deck Narrative Design — "The GPU Is Coming Home"

**Date:** 2026-08-04
**Status:** Draft for Hugh's review
**Scope:** Narrative structure only. Visual design, styling, and the browser/PDF build are explicitly out of scope for this document and will be planned separately once the narrative is approved.

## Goal

Replace the text-dense investor memo/page with a paced, emphasis-controlled deck that walks an investor through the opportunity. The deck is a **send-ahead reading document** (emailed, read unattended, rendered in the browser, exportable as PDF), not a live-presentation deck. It must self-narrate.

**Delivery:** lives at **`/opportunity`** on intelligence.family (new route in `www/`), with PDF export.

**The single takeaway an investor must leave with:** a new compute category (private local intelligence) has just become possible, it is a macro inevitability, nobody owns it in the home, and the trusted brand that claims it first (the way Signal and Mozilla claimed theirs) wins a market that ladders from families to every home, office, and hardware partner.

## Format Decision: 24-page core + 10-page appendix

Research basis (DocSend 2023; Rippling Series A memo; two-deck literature):

- Investors spend 2–3 minutes total on an emailed deck; 65% of unsuccessful teams had above-average page counts. A continuous 30-page narrative risks abandonment before the ask.
- Narrative reading documents are a validated format at length (Rippling raised $45M on a memo), provided they are memo-shaped: thesis up front, skimmable, evidence layered beneath.
- Post-2023 attention shifted to proof pages: business model (+48%), traction (+33%), competition (+88%). Unit economics and objections pages get disproportionate craft.
- The a16z speedrun rule shapes the acts: first half = the wedge and the next 12 months; second half = "what if it works."
- Steel-manned objections belong late-middle, after conviction and before the ask.
- Every act opens with a full-bleed single-idea page, so a skimmer reading only act openers gets the whole argument.

**The urgency thread.** Urgency runs through the whole deck as dated fact, never countdown pressure, and resolves on the ask page:
- p4: the giants moved in the last ten months (NVIDIA–Palantir Oct 2025, sovereign AIOS June 2026)
- p5: the server-side compliance wall rose this year (COPPA April 2026, EU AI Act Aug 2026)
- p6: the category is unowned and the incumbents went the wrong way (Amazon killed local processing, 2025); "that window is closing fast"
- p12: the incumbents doubled down on cloud (Alexa+ full rollout, Feb 2026)
- p15: we already have a working prototype and a shipped research collaboration; we move at shipped-hardware pace
- p24: take it or leave it; we're building this either way, the round sets the speed

## Voice & copy rules

- **Titles are direct, confident, obvious (Hugh's rule, 2026-08-04).** Every page gets a title plus a subtitle. No dramatic or aphoristic slide titles, no reveal-frames ("What we're really building:"), no two-sentence punchlines, no triadic staccato ("One product. One stack. Every place..."). The title names the thing; the subtitle states the supporting fact. "A privacy-conscious cloud subscription" is right; "The cloud, without the surrender" is wrong.
- **Tone of Voice source:** `../website/sanctuary.computer/corpus/artifacts/tone-of-voice.md` (v4, approved 2026-07-30). The rules that bite hardest for this deck: say the exact number (never round into vagueness); every claim carries its "so that"; plain words and layman-friendly metaphors; moral conviction stated flat; name the idea then reuse it (Home Harness is a coinage in exactly this tradition); confident "we don't" refusals lead, humility is earned later. Aphoristic compression stays in occasional body copy where it is earned; it never appears in titles.
- **Posture: take it or leave it (Hugh's rule, 2026-08-04).** We are doing this; the round sets the speed. The deck invites, it never pleads or sells. This is the Tone of Voice outer layer in deck form: "We don't placate the crowd. We are ready, willing, and able." The reader should close the deck certain the company happens with or without them.
- **Urgency is factual and constant.** The voice never manufactures urgency, so the deck drives it with dated facts instead, threaded through every act (see the urgency thread below). The live fundraising note already has the register: "Today no one owns this market, but that window is closing fast." Reuse its lines; they are already in Hugh's voice.
- **Tight, obvious, high impact:** each page carries less text at higher impact. Headline does the arguing (aim under 10 words); body copy supports at roughly 40–80 words on core pages; detail lives in the appendix. If a page needs a paragraph to be understood, the page is wrong.
- Copy audited with the `avoid-ai-writing` skill at investor-email strictness: no em dashes, no bold overuse, named comparables over vague claims (per established project convention).
- One idea per page. Headlines carry the argument; body copy supports.
- Every factual claim carries a real citation (evidence bank below). Nothing hand-waved.

---

## Act I — The Category (pages 1–7)

*Newly possible. Macro inevitable. Unowned. Regulation-aligned.*

**Page 1 — Title: "Family Intelligence" / Sub: "Private intelligence for the home."**
Cover. Brand, device silhouette, one-sentence company purpose (Sequoia style), plus the two strongest proof points stated flat: we have a working prototype, and our research is published with the Mozilla Foundation.

**Page 2 — Title: "The GPU is coming home" / Sub: "AI compute is moving into the house, the way the personal computer did."**
The controlling metaphor, stated plainly. Mainframe → home computer; datacenter → home GPU. Supporting stat: in 1984 only 8% of US households owned a computer; by 2016 it was 89% (US Census). The first wave is the home GPU; eventually every home and office runs its own.

**Page 3 — Title: "Local AI now runs on consumer hardware" / Sub: "Open-weight models are closing the gap with the frontier."**
Quantitative why-now, technical leg: open-weights capability curves (Epoch AI), consumer NPU cost curves, our prototype running on a previous-generation NVIDIA Orin (no bleeding-edge dependency). We inherit upstream open-source advances for free: Thinking Machines Lab released Inkling, the largest American open-weights model (975B params, Apache 2.0, July 2026); NVIDIA's Nemotron 3 family ships permissively licensed with training data and tooling (Dec 2025 – June 2026). Jensen Huang: "Open innovation is the foundation of AI progress."

**Page 4 — Title: "The industry is moving compute to the data" / Sub: "NVIDIA, Palantir and Cohere are betting on sovereign AI."**
Macro leg. NVIDIA–Palantir partnership (Oct 2025); their Sovereign AI Operating System Reference Architecture for air-gapped government deployments where "data can never leave the building" (June 2026); the Nemotron Coalition of eight labs (March 2026); Cohere's sovereign positioning. Nations and enterprises are already buying compute they control. The household is the last sovereign unit nobody serves.

**Page 5 — Title: "Privacy law triggers when data leaves the device" / Sub: "Local-first architecture is ahead of the coming AI regulation."**
The front-running-regulation moat, and it verifies cleanly. The trigger is collection: COPPA's entire apparatus turns on "the gathering of any personal information from a child" (16 CFR 312.2); GDPR exempts purely personal household processing by the user (Art. 2(2)(c)); HIPAA binds only entities that create, receive, maintain, or transmit PHI for covered entities. Data that never crosses the network boundary largely never pulls these triggers. Meanwhile the compliance wall is rising on the server side right now: the amended COPPA Rule hit full compliance April 22, 2026; 20 states have comprehensive privacy laws; the EU AI Act's transparency duties took effect August 2, 2026. And cloud AI is acquiring KYC plumbing exactly as predicted: California AB 1043 mandates OS-level age signals by 2027, SB 243 imposes chatbot duties on operators, OpenAI already runs behavioral age prediction. After the Senate's 99–1 vote killed federal preemption (July 2025), the 50-state patchwork is durable, and architecture that avoids collection is the only compliance strategy that scales across every jurisdiction at once. Apple is the argument in market form: "the cornerstone of Apple Intelligence is on-device processing."

**Page 6 — Title: "Nobody owns this category" / Sub: "7 in 10 Americans don't trust big tech's AI. There is no Signal or Mozilla of the home."**
The unclaimed-category page. Pew 2026: ~70% of Americans distrust big tech's AI. Parks Associates: 72% of smart home product owners are concerned about the data their devices collect (2024–25). And the incumbents are moving the wrong way: on March 28, 2025 Amazon removed the Echo's only local-processing option, routing all voice requests through its cloud (TechCrunch/The Register). Demand for AI is enormous; trust in its vendors is absent. That delta is the market, and there is no Signal or Mozilla of the home yet. Close on the live note's own line: "Today no one owns this market, but that window is closing fast."

**Page 7 — Title: "People pay for intentional technology" / Sub: "Light Phone, Daylight, Remarkable and Yoto built profitable businesses on it."**
The intentional-tech wave, with Yoto's +86% sales growth (2024) as the number. The debunk: "convenience always wins" fails where data is intimate; privacy-conscious users choose Signal over iMessage, pay for 1Password, enable Apple ADP. A proven buyer with proven willingness to pay.

---

## Act II — The Wedge (pages 8–16)

*The next 12 months. First half of the pitch per the a16z rule.*

**Page 8 — Title: "Our first device is for families" / Sub: "High emotional value, low-risk data, and a GPU in the living room."**
Positioning stated plainly: this is how the GPU physically enters the home. One device, one market, focus.

**Page 9 — Title: "A family practice" / Sub: "Weekly check-ins, budgets, school, health, and the family stories."**
The pivot beat: a practice of family rhythm the device hosts, not an ancestry gadget. The stories become the heirloom (voices, accents, the archive as a love letter): the most emotionally resonant feature, deliberately sequenced after the practice so it reads as one beloved feature, never the whole premise. Vignette treatment.

**Page 10 — Title: "Families already pay for this" / Sub: "tonies did €630M in revenue last year. Life360 is a $4.5B public company."**
The habit-risk answer, by evidence. Family hardware plus subscription is a proven, public-company-scale category: tonies (€630M FY2025 revenue, +31%, record adjusted EBITDA margin), Yoto (£95M, +86% in 2024, Chan Zuckerberg Initiative backing), Life360 (~98M MAU, $489.5M FY2025 revenue, ~$4.5B market cap), Ancestry (sold to Blackstone for $4.7B; 3M+ subscribers, $1B+ revenue at acquisition), StoryWorth (1M+ printed books, bootstrapped), Greenlight (6.5M+ parents and kids). We unify the practice these products serve piecemeal, on hardware the family owns.

**Page 11 — Title: "Family data is too sensitive for the cloud" / Sub: "23andMe centralized it. That ended in a breach and a bankruptcy."**
The cautionary proof: 23andMe went from a $6B peak to Chapter 11; a breach exposed 6.9M users' genetic and family data; its bankruptcy turned the database itself into an asset for sale, triggering state attorneys general to urge deletion. Centralized sensitive family data is a liability model. Our answer is architectural, not policy: physical kill switch, end-to-end encryption where we hold no keys, hybrid-source auditable firmware. Trust you can inspect.

**Page 12 — Title: "Home hubs are a proven category" / Sub: "600M+ Alexa devices sold, all of them cloud-dependent. Ours runs locally."**
The graveyard answer. The AI-hardware graveyard (Humane, Rabbit, friend.com) died inventing radical new interaction paradigms; we enter an already-massive category with a radically different architecture. Alexa: 600M+ devices sold (2025). Google Home: 800M+ connected devices (2025). 35% of Americans 12+ own a smart speaker (Edison 2025); 51% of US internet households own a speaker or display (Parks 2025). You shouldn't have to ask Jeff Bezos to turn on your lights. Beneath it: a generic stack others build interaction paradigms on, not a bet on one novel gadget.

**Page 13 — Title: "$899 flagship, $499 companions" / Sub: "The Apple II cost $7,000 in today's dollars. Premium first, affordable next."**
The price-point page. Apple II (1977): $1,298, over $7,000 in 2026 dollars. A usable IBM PC (1981): roughly $11,000 today. Macintosh (1984): about $8,000 today, and only 8% of households owned any computer; premium entry prices didn't cap the category, they funded it. Our flagship at $899 carries a GPU and home server; companion devices ($499) join hub-and-spoke, and future spoke devices without GPUs bring the entry price down further. Works out of the box, offline, no account: AI as an offline appliance (the live note's coinage; reuse it). No server to go dark, no company that can revoke it.

**Page 14 — Title: "A privacy-conscious cloud subscription" / Sub: "$9/month, optional: zero-knowledge backup, sync, and remote access."**
The subscription page, framed as the optional upgrade it is. $9/mo buys the conveniences the cloud is good at: zero-knowledge encrypted backup (we hold no keys; a decade of family memory survives a dropped device), hub-and-spoke sync across flagship and companion devices, and a remote tunnel so family anywhere can reach the archive. Works in hotspot mode or on the private home network. It matches the convenience of a cloud LLM system without handing over the data. For investors this is the recurring revenue line; for families it is never a gate on the core promise. The device works forever without it.

**Page 15 — Title: "The prototype already works" / Sub: "Built on a previous-generation NVIDIA Orin, by choice."**
The traction and velocity page. The prototype runs today on last-generation silicon, proving the UX without betting on the bleeding edge; industrial design play tests are underway; the research is published with Mozilla (28k+ impressions, overwhelmingly positive against friend.com's reception); the full memo, pro-forma, and three-phase plan are written. Human proof: the real tester text, "if y'all can speed it up on the family intelligence that would be greatly appreciated." We move at the pace of a team that has shipped hardware before: round closes, contract manufacturer is in the room, shelves by Christmas 2027.

**Page 16 — Title: "Unit economics" / Sub: "An $899 device, a $9/month subscription, 110,000 devices in five years."**
The most-read page class post-2023. Lead with the live note's simple-math frame: ~110,000 devices is roughly 0.05% of the 200M+ English-speaking households we sell into, before companion devices or any other industry. Then the mechanics: BOM envelope (prototype vs. at-scale), path to 40%+ blended gross margin, backup attach rate, blended LTV. Peloton frame: the device is the moat, the recurring layer is the business. *(Detail arrives from the pro-forma actively in progress; page ships with defensible ranges, never "TK.")*

---

## Act III — What If It Works (pages 17–21)

*Second half of the pitch. One product, one stack, then the stack applied.*

**Page 17 — Title: "A context window for the home" / Sub: "The house keeps its own memory: people, maintenance, money, goals."**
The elevation beat. Who the plumber is, when the filters were changed, where each person is in life, what the family is saving for. A home that remembers is infrastructure, not a gadget.

**Page 18 — Title: "The Home Harness" / Sub: "One local agent every device on the network can use."**
The home's generic inference provider. It exposes an MCP server on the local network, a chat-completions endpoint, local RAG, and ontology lookup. The doorbell, the thermostat, the kids' laptop: each taps the home hub over Wi-Fi to perform smarter tasks through one shared agent, instead of every device shipping its own cloud AI subscription and phoning a different datacenter. Every device in the home will want inference; none of them should need their own cloud.

**Page 19 — Title: "The stack" / Sub: "Six generic primitives, built once, reused in every product."**
Exploded view: trusted execution environment, zero-knowledge backup server, mirroring server, peer-to-peer gossip between devices on the local network, local inference runtime, and the generic ontology library (declare a schema; the model extracts it) that lets the same stack serve families, firms, clinics, and newsrooms without rewriting anything.

**Page 20 — Title: "Licensing works like Android" / Sub: "Every Snapdragon ships a tuned Android build. Partner devices ship a tuned Harness."**
The licensing model with known economics. Every Snapdragon ships with its own tuned Android build that OEMs build on; Qualcomm's licensing arm is the reference business. Every partner device ships a tuned Home Harness distribution adapted to its silicon and form factor, royalty per device. Buyers: Sonos, Dyson, Bang & Olufsen, LG, and every hardware company that wants private intelligence inside its devices and will never build this stack.

**Page 21 — Title: "One stack, four markets" / Sub: "Families, then homes, then offices, then enterprise hardware partners."**
The focus frame and the sizing page. Not four businesses: one consumer hardware company and its underlying stack, applied in sequence to the home, the office, and enterprise hardware partnerships. Bottoms-up wedge math (households × ASP × attach) as the precise number; office (per-room/per-seat, on-prem transcription and meeting capture) and enterprise licensing (royalty × partner fleet volumes) as clearly labeled earned upside, with health as the largest private-compute prize. What carries over at every rung is the point: the stack, the trust brand, and the consumer fleet as reference customer. Phase gates state what unlocks each stage and what we are not doing yet. Destination: the 200-person company with Home, Family, Legal, and Health divisions.

---

## Act IV — Objections, Team, Ask (pages 22–24)

**Page 22 — Title: "The hard questions" / Sub: "Apple, model quality, hardware risk, and consent."**
Steel-manned, compact, each pointing to appendix depth:
- *Why won't Apple or Google do this?* Sharpen to the live note's stronger claim: big AI labs can't afford to compete here; their core business depends on your data living in their cloud, so a private on-device stack is diametrically opposed to how they work. There's a reason Google hasn't cloned Signal. Amazon's March 2025 removal of local processing shows the cloud gravity they can't escape. Truly local, encrypted inference is the real moat; the industrial design is just the part they could copy.
- *Won't local models always lag the frontier?* Yes, and it doesn't matter: household tasks are narrow (transcription, extraction, RAG, classification). The gap is closing fast, and open weights (Inkling, Nemotron 3) mean every upstream advance lands in our stack for free.
- *Why dedicated hardware?* The seven in ten are not hobbyists. The trust boundary must be physical and legible to the oldest person in the family. Beautiful appliances are how AI enters the home; hardware is the moat and the margin.
- *Recording consent and children's data?* Consent-first capture, no ambient listening, and an architecture that keeps regulated data classes on-device (ties back to page 5; detail in appendix A7).

**Page 23 — Title: "The team" / Sub: "We shipped the Light Phone, Mill's IoT stack, and USB Club."**
Full-page team, ~80 words per founder tied to this company's hard parts: Light Phone II & III (patented, TIME Best Inventions 2019 and 2025), Mill's IoT infrastructure (for the founders of Google's Nest), direct Foxconn/Arima/Coosea relationships in Taipei and Shenzhen, USB Club, World Advanced Concepts, the Mozilla research collaboration. The talent thesis: privacy-conscious, sovereign-data-minded builders join missions like this the way they join Signal and Mozilla. The first hires this raise buys, named honestly (including the ML-systems lead).

**Page 24 — Title: "We're raising $15M" / Sub: "On shelves and ready to gift by Christmas 2027."**
The take-it-or-leave-it page. We are building this either way; the round sets the speed. What it buys: a team hired fast enough to ship by Christmas 2027, a contract manufacturer in the room on day one, Foxconn-grade engineering, and the staffing the multi-device ecosystem requires. It funds the same stack every private-intelligence product after it will run on. What it proves for the Series A: units shipped, attach rate, fleet reliability, zero trust incidents. Close with the window stated as fact, then the invitation: no one owns this market today, and that window is closing fast. If you'd like a demo, email us.

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
- tonies: €630M FY2025 revenue, +31%, record adjusted EBITDA margin (company press release via Mynewsdesk; already cited on the live /fundraising page).
- Yoto: £95M revenue, +86% in 2024; Chan Zuckerberg Initiative investment (musically.com, Aug 2025; CZI newsroom; already cited on /fundraising).
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

**Page 15 — Traction (from the live /fundraising page and memo)**
- Working prototype, built against a previous-generation NVIDIA Orin to prove the UX without bleeding-edge dependency (clarifications.md; "We've built a working prototype" on /fundraising).
- Mozilla Foundation research collaboration published; 28k+ Instagram impressions, overwhelmingly positive, versus friend.com's hostile reception (fundraising page; memo).
- Industrial design play tests underway (photo row on /fundraising).
- Real tester text message ("...if y'all can speed it up on the family intelligence that would be greatly appreciated"): asset at `www/public/fundraising/grandma-text.png`.
- Hugh: patented inventor; Light Phone II & III named TIME Best Inventions 2019 and 2025; Mill IoT for the founders of Google's Nest; direct Foxconn/Arima/Coosea relationships (fundraising page team section, for p23).

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

1. **Unit economics (page 16, A5):** pro-forma actively being worked by Hugh; the 110k-devices/0.05% frame from the live page anchors it; detail lands when the model does.
2. **Founder quotes (page 9):** "our own families said it better than we could" quotes remain TK in the memo; decide whether they enter the deck or stay on the website.
3. **Raise framing:** $15M confirmed. Deck copy on what-it-proves milestones (units, attach rate, NPS targets) needs Hugh's real targets before final copy.
4. **Legal review (page 5):** the regulatory argument is structurally sound and well-cited, but two claims need counsel sign-off before investor distribution: that pure on-device processing falls outside COPPA "collection," and the precise GDPR framing (exposure reduction on content data, not immunity).

## Out of scope (deliberately)

- Visual/styling system, typography, and the Next.js deck implementation with PDF export: planned separately after narrative approval.
- Rewriting the Notion memo or /fundraising page: the deck is a new artifact; those remain as-is.

## Next step

On approval of this document: invoke the writing-plans skill to plan the implementation (deck content drafting per page, then the browser-rendered deck with PDF export in `www/`).
