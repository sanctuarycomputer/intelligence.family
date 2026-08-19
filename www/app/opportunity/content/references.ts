export type Reference = {
  source: string;
  date: string;
  url: string;
  note?: string;
};

export const REFERENCES: Record<string, Reference> = {
  // p2, p13 — computing history
  'census-computer-ownership': {
    source: 'US Census Bureau',
    date: '2018',
    url: 'https://www.census.gov/library/publications/2018/acs/acs-39.html',
  },
  'apple2-price': {
    source: 'Computer History Museum',
    date: '1977',
    url: 'https://www.computerhistory.org/tdih/june/10/',
  },
  'ibm-pc-price': {
    source: 'IBM corporate history',
    date: '1981',
    url: 'https://www.ibm.com/history/personal-computer',
  },
  'mac-price': {
    source: 'AppleInsider',
    date: '2019-01-24',
    url: 'https://appleinsider.com/articles/19/01/24/apple-launched-macintosh-on-january-24-1984-and-changed-the-world----eventually',
  },
  // p3 — local AI momentum
  'epoch-open-weights': {
    source: 'Epoch AI',
    date: '2026',
    url: 'https://epoch.ai/data-insights/open-weights-vs-closed-weights-models',
  },
  inkling: {
    source: 'TechCrunch',
    date: '2026-07-15',
    url: 'https://techcrunch.com/2026/07/15/thinking-machines-amps-up-its-bet-against-one-size-fits-all-ai-with-its-first-open-model-inkling/',
  },
  nemotron3: {
    source: 'NVIDIA Newsroom',
    date: '2025-12-15',
    url: 'https://nvidianews.nvidia.com/news/nvidia-debuts-nemotron-3-family-of-open-models',
  },
  'ai-pc-shipments': {
    source: 'Counterpoint Research',
    date: '2026',
    url: 'https://counterpointresearch.com/en/reports/ai-advanced-pcs-to-surpass-half-of-global-shipments-in-2026',
  },
  ollama: {
    source: 'TechCrunch',
    date: '2026-07-09',
    url: 'https://techcrunch.com/2026/07/09/popular-open-source-ai-developer-tool-ollama-raises-65m-grows-to-nearly-9m-users/',
  },
  // p4 — sovereign AI
  'nvidia-palantir': {
    source: 'NVIDIA Newsroom',
    date: '2025-10',
    url: 'https://nvidianews.nvidia.com/news/nvidia-palantir-ai-enterprise-data-intelligence',
  },
  'palantir-sovereign-aios': {
    source: 'Businesswire',
    date: '2026-06-29',
    url: 'https://www.businesswire.com/news/home/20260629390275/en/Palantir-Launches-Engine-for-Deploying-NVIDIA-Nemotron-Open-Models-in-Sovereign-Environments',
  },
  'eu-gigafactories': {
    source: 'Euronews',
    date: '2026-07-30',
    url: 'https://www.euronews.com/my-europe/2026/07/30/eu-opens-call-for-seven-gigafactories-to-train-next-generation-ai-technologies',
  },
  'cloudian-onprem': {
    source: 'Cloudian 2026 Enterprise AI Infrastructure Survey',
    date: '2026-03',
    url: 'https://www.storagenewsletter.com/wp-content/uploads/2026/03/Cloudian-AI-Infrastructure-Survey_Report.pdf',
  },
  // p5 — regulation
  'coppa-definition': {
    source: '16 CFR 312.2 (eCFR)',
    date: '2026',
    url: 'https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312',
  },
  'coppa-amended': {
    source: 'FTC',
    date: '2025-01-16',
    url: 'https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data',
  },
  'gdpr-household': {
    source: 'GDPRhub, Art. 2 commentary',
    date: '2026',
    url: 'https://gdprhub.eu/Article_2_GDPR',
  },
  'hipaa-ftc': {
    source: 'FTC business guidance',
    date: '2024-04',
    url: 'https://www.ftc.gov/business-guidance/blog/2024/04/updated-ftc-health-breach-notification-rule-puts-new-provisions-place-protect-users-health-apps',
  },
  'eu-ai-act-enforcement': {
    source: 'Help Net Security',
    date: '2026-08-04',
    url: 'https://www.helpnetsecurity.com/2026/08/04/eu-ai-act-enforcement-ai-models/',
  },
  ab1043: {
    source: 'Hunton (California AB 1043)',
    date: '2025-10',
    url: 'https://www.hunton.com/privacy-and-cybersecurity-law-blog/california-introduces-new-age-verification-requirements-for-software-applications',
  },
  'senate-moratorium': {
    source: 'Goodwin',
    date: '2025-07',
    url: 'https://www.goodwinlaw.com/en/insights/publications/2025/07/alerts-practices-aiml-federal-ai-moratorium-dies-on-the-vine',
  },
  // p6 — trust gap
  'pew-distrust': {
    source: 'Pew Research Center',
    date: '2026-06-17',
    url: 'https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/',
  },
  'parks-72': {
    source: 'Parks Associates',
    date: '2024',
    url: 'https://www.parksassociates.com/blogs/pr-smart-home/72-of-smart-home-product-owners-are-concerned-with-personal-data-security',
  },
  'echo-local-removed': {
    source: 'TechCrunch',
    date: '2025-03-15',
    url: 'https://techcrunch.com/2025/03/15/amazons-echo-will-send-all-voice-recordings-to-the-cloud-starting-march-28/',
  },
  whittaker: {
    source: 'Startup Fortune',
    date: '2026-06',
    url: 'https://startupfortune.com/signals-meredith-whittaker-says-ai-agents-are-surveillance-infrastructure-and-shes-right/',
    note: 'verify',
  },
  // p7 — intentional tech
  'yoto-growth': {
    source: 'Music Ally',
    date: '2025-08-27',
    url: 'https://musically.com/2025/08/27/childrens-speakers-startup-yoto-saw-sales-grow-by-86-in-2024/',
  },
  'signal-backups': {
    source: 'Signal',
    date: '2025',
    url: 'https://signal.org/blog/introducing-secure-backups/',
  },
  'apple-adp': {
    source: 'Apple',
    date: '2026',
    url: 'https://support.apple.com/en-us/108756',
  },
  // p10 — family comps
  'tonies-fy2025': {
    source: 'tonies FY2025 results',
    date: '2026',
    url: 'https://www.mynewsdesk.com/us/tonies/pressreleases/tonies-continues-profitable-growth-with-record-results-in-2025-expects-strong-momentum-for-full-year-2026-expansion-of-ecosystem-around-toniebox-2-proves-a-global-success-3442746',
  },
  'life360-q1': {
    source: 'Life360 investor relations',
    date: '2026-05-11',
    url: 'https://investors.life360.com/news-releases/news-release-details/life360-reports-record-q1-2026-results',
  },
  'ancestry-blackstone': {
    source: 'Blackstone',
    date: '2020-08',
    url: 'https://www.blackstone.com/news/press/blackstone-to-acquire-ancestry-leading-online-family-history-business-for-4-7-billion/',
  },
  storyworth: {
    source: 'StoryWorth (company-reported)',
    date: '2026',
    url: 'https://welcome.storyworth.com/blog/storyworth-reviews-good-bad',
  },
  greenlight: {
    source: 'Sacra',
    date: '2025-05',
    url: 'https://sacra.com/c/greenlight/',
  },
  // p11 — cautionary
  '23andme-sale': {
    source: 'CNBC',
    date: '2025-06-13',
    url: 'https://www.cnbc.com/2025/06/13/anne-wojcicki-to-buy-back-23andme-and-its-data-for-305-million.html',
  },
  '23andme-breach': {
    source: 'ClassAction.org',
    date: '2026-01',
    url: 'https://www.classaction.org/blog/23andme-data-breach-settlement-30m-deal-covers-millions-whose-info-was-stolen',
  },
  'chatgpt-logs': {
    source: 'Bloomberg Law',
    date: '2026-01-05',
    url: 'https://news.bloomberglaw.com/ip-law/openai-must-turn-over-20-million-chatgpt-logs-judge-affirms',
  },
  'askai-leak': {
    source: 'Malwarebytes',
    date: '2026-02',
    url: 'https://www.malwarebytes.com/blog/news/2026/02/ai-chat-app-leak-exposes-300-million-messages-tied-to-25-million-users',
  },
  // p12 — hub category
  'alexa-600m': {
    source: 'CNBC',
    date: '2025-09-30',
    url: 'https://www.cnbc.com/2025/09/30/amazon-devices-alexa-echo-kindle.html',
  },
  'google-home-800m': {
    source: 'Google Developers Blog',
    date: '2025-10-01',
    url: 'https://developers.googleblog.com/en/gemini-for-home-expanding-the-platform-for-a-new-era-of-smart-home-ai/',
  },
  'edison-35': {
    source: 'Edison Research, Infinite Dial 2025',
    date: '2025',
    url: 'https://www.edisonresearch.com/the-infinite-dial-2025/',
  },
  'parks-51': {
    source: 'Parks Associates',
    date: '2025-10',
    url: 'https://www.prnewswire.com/news-releases/parks-associates-amazon-smart-speakers-now-account-for-60-of-all-smart-speaker-purchases-302572389.html',
  },
  'openai-io': {
    source: 'Bloomberg',
    date: '2025-05-21',
    url: 'https://www.bloomberg.com/news/articles/2025-05-21/openai-to-buy-apple-veteran-jony-ive-s-ai-device-startup-in-6-5-billion-deal',
  },
  'bee-amazon': {
    source: 'TechCrunch',
    date: '2025-07-22',
    url: 'https://techcrunch.com/2025/07/22/amazon-acquires-bee-the-ai-wearable-that-records-everything-you-say/',
  },
  'limitless-meta': {
    source: 'TechCrunch',
    date: '2025-12-05',
    url: 'https://techcrunch.com/2025/12/05/meta-acquires-ai-device-startup-limitless/',
  },
  // p14 — subscription economics
  '1password-arr': {
    source: 'CNBC',
    date: '2025-11-06',
    url: 'https://www.cnbc.com/2025/11/06/ryan-reynolds-backed-1password-tops-400-million-in-arr.html',
  },
  'proton-nonprofit': {
    source: 'TechCrunch',
    date: '2024-06-17',
    url: 'https://techcrunch.com/2024/06/17/privacy-app-maker-proton-transitions-to-non-profit-foundation-structure/',
  },
  'apple-subscriptions': {
    source: 'MacRumors (Apple Q3 2026 earnings)',
    date: '2026-07-30',
    url: 'https://www.macrumors.com/2026/07/30/apple-3q-2026-earnings/',
  },
  // p15/p16 — traction & economics
  plaud: {
    source: 'Forbes',
    date: '2025-09-02',
    url: 'https://www.forbes.com/sites/iainmartin/2025/09/02/how-an-ai-notetaker-became-one-of-the-few-profitable-ai-startups/',
  },
  'rabbit-ship': {
    source: 'Wikipedia, Rabbit r1',
    date: '2024',
    url: 'https://en.wikipedia.org/wiki/Rabbit_r1',
  },
  // p18 — device density
  'parks-17-devices': {
    source: 'Parks Associates',
    date: '2024-01',
    url: 'https://www.parksassociates.com/blogs/press-releases/at-ces-2024-parks-associates-announces-new-research-showing-average-number-of-connected-devices-per-us-internet-household-reached-17-in-2023',
  },
  'matter-1200': {
    source: 'Matter Alpha (CSA)',
    date: '2026-06',
    url: 'https://www.matteralpha.com/explainer/unify-2026-matter-takeaways-industry-future',
  },
  'abi-tinyml': {
    source: 'ABI Research',
    date: '2026-06-18',
    url: 'https://www.abiresearch.com/press/tinyml-ai-chipset-shipments-to-top-4.1-billion-by-2031-as-embedded-ai-scales-across-industrial-iot',
  },
  // p20 — licensing economics
  'qualcomm-qtl': {
    source: 'Qualcomm FY2025 10-K (SEC)',
    date: '2025-11',
    url: 'https://www.sec.gov/Archives/edgar/data/804328/000080432825000085/qcom-20250928.htm',
  },
  'dolby-licensing': {
    source: 'Dolby FY2025 results',
    date: '2025-11',
    url: 'https://investor.dolby.com/news-events/financial-news/news-details/2025/Dolby-Laboratories-Reports-Fourth-Quarter-and-Fiscal-Year-2025-Financial-Results/default.aspx',
  },
  'arm-royalty': {
    source: 'Arm Q4 FYE26 results',
    date: '2026-05-06',
    url: 'https://newsroom.arm.com/news/arm-q4-fye26-results',
  },
  'android-3b': {
    source: 'Google I/O 2025',
    date: '2025-05',
    url: 'https://blog.google/products/android/the-android-show-io-2025',
  },
  // p22/p24 — objections & ask
  'humane-hp': {
    source: 'Quantum Zeitgeist',
    date: '2025-02',
    url: 'https://quantumzeitgeist.com/hp-acquires-humane-for-116-million-gains-300-patents-and-employees-shuts-down-ai-pin/',
  },
  'crunchbase-ai-half': {
    source: 'Crunchbase News',
    date: '2026-01',
    url: 'https://news.crunchbase.com/ai/big-funding-trends-charts-eoy-2025/',
  },
  'mozilla-research': {
    source: 'Instagram (Mozilla collaboration)',
    date: '2026',
    url: 'https://www.instagram.com/p/DUWLI8hiUai/',
  },
  'light-phone': {
    source: 'Sanctuary Computer',
    date: '2025',
    url: 'https://www.sanctuary.computer/work/light-three',
  },
  // Appended for p4/p7 subtitle facts. Append-only: existing numbering stays stable.
  'cohere-sovereign': {
    source: 'The National',
    date: '2026-07-09',
    url: 'https://www.thenationalnews.com/future/technology/2026/07/09/cohere-humain-canada-saudi-arabia-ai/',
  },
  'remarkable-profitable': {
    source: 'Sifted',
    date: '2021',
    url: 'https://sifted.eu/articles/remarkable-unicorn-norway',
  },
  'friend-backlash': {
    source: 'Instagram (friend.com reception)',
    date: '2024',
    url: 'https://www.instagram.com/p/C-DJdMTpbeQ/',
  },
  'zai-fable-prediction': {
    source: 'Jie Tang, Z.ai founder, on X',
    date: '2026-06',
    url: 'https://x.com/jietang/status/2067580270078030088',
  },
  // Appended for the demand-validation and protocol pages. Append-only.
  'vpn-market': {
    source: 'SQ Magazine, VPN statistics',
    date: '2026',
    url: 'https://sqmagazine.co.uk/vpn-statistics/',
    note: 'verify',
  },
  'lumo-10m': {
    source: 'Wikipedia, Lumo (AI assistant)',
    date: '2026',
    url: 'https://en.wikipedia.org/wiki/Lumo_(AI_assistant)',
    note: 'verify',
  },
  'dgx-spark-soldout': {
    source: 'Network World',
    date: '2025-10',
    url: 'https://www.networkworld.com/article/4072947/nvidias-dgx-spark-desktop-supercomputer-is-on-sale-now-but-hard-to-find-2.html',
  },
  'signal-protocol-docs': {
    source: 'Signal, protocol documentation',
    date: '2026',
    url: 'https://signal.org/docs/',
  },
  'proton-key-transparency': {
    source: 'Proton, Key Transparency whitepaper',
    date: '2025',
    url: 'https://proton.me/files/proton_keytransparency_whitepaper.pdf',
  },
  '1password-whitepaper': {
    source: '1Password Security Design white paper',
    date: '2025',
    url: 'https://1passwordstatic.com/files/security/1password-white-paper.pdf',
  },
  // Appended for the lineage cards. Append-only.
  'pgp-symantec': {
    source: 'Wikipedia, Pretty Good Privacy (Symantec acquisition)',
    date: '2010',
    url: 'https://en.wikipedia.org/wiki/Pretty_Good_Privacy',
  },
  'firefox-users': {
    source: 'Wikipedia, Firefox',
    date: '2012',
    url: 'https://en.wikipedia.org/wiki/Firefox',
    note: 'verify',
  },
  // Appended for the smart-routing page. Append-only.
  routellm: {
    source: 'RouteLLM, UC Berkeley & LMSYS',
    date: '2024',
    url: 'https://github.com/lm-sys/routellm',
  },
  frugalgpt: {
    source: 'FrugalGPT, Chen et al., Stanford',
    date: '2023',
    url: 'https://arxiv.org/abs/2305.05176',
  },
  'perplexity-hybrid': {
    source: 'VentureBeat',
    date: '2026-06',
    url: 'https://venturebeat.com/technology/perplexity-ai-unveils-hybrid-local-cloud-inference-system-at-computex-2026',
  },
  'perplexity-computer': {
    source: 'TechTimes',
    date: '2026-07-28',
    url: 'https://www.techtimes.com/articles/321882/20260728/perplexity-brings-ai-desktop-agent-windows-routing-tasks-across-20-models.htm',
  },
  'its-nice-that': {
    source: "It's Nice That, Good Screens report",
    date: '2026-08-12',
    url: 'https://www.itsnicethat.com/features/good-screens-report-its-nice-that-insights-120826',
  },
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
