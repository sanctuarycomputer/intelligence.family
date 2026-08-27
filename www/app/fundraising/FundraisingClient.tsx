'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import SectionHeader from '@/components/SectionHeader';
import QuoteBox from '@/components/QuoteBox';
import MediaRow from '@/components/MediaRow';
import LeafIcon from '@/components/LeafIcon';
import InlineEmailGate from '@/components/InlineEmailGate';
import { AnimatedElement } from '@/components/PageAnimations';
import ClarificationItem from '@/components/ClarificationItem';
import type { Clarification } from '@/lib/clarifications';

function trackOutbound(label: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'outbound_click', {
      event_category: 'engagement',
      event_label: label,
      value: 1,
    });
  }
}

// Fixed-px gradient so the teaser fade reads identically whether the scrim
// sits over the clipped teaser or over the full content mid-reveal.
const GATE_SCRIM =
  'linear-gradient(to bottom, rgba(215,221,212,0) 0px, rgba(215,221,212,0) 96px, var(--fi-green-100) 300px)';

const GATE_LOCKED_STYLE: CSSProperties = {
  maxHeight: 460,
  overflow: 'hidden',
  pointerEvents: 'none',
};

// Bump the suffix to force all returning visitors back through the gate.
const UNLOCK_KEY = 'fi_fundraising_unlocked_v2';

export default function FundraisingClient({
  clarifications,
}: {
  clarifications: Clarification[];
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [revealing, setRevealing] = useState(false);
  // The FigJam embed stays inert until clicked so scrolling over it moves the
  // page, not the canvas; mousing away re-locks it. Touch devices have no
  // mouseleave to re-lock with, so they never activate: without this the
  // near-full-viewport canvas would trap page scrolling after one tap.
  const [figmaActive, setFigmaActive] = useState(false);
  const activateFigma = () => {
    if (window.matchMedia('(hover: hover)').matches) setFigmaActive(true);
  };

  useEffect(() => {
    try {
      // v1 (pre-OTP) unlocks are deliberately not honored: cycling the key
      // sends earlier visitors back through the gate so their views are
      // verified and tracked. Cookie holders auto-unlock via /api/gate-status.
      localStorage.removeItem('fi_fundraising_unlocked');
      if (localStorage.getItem(UNLOCK_KEY) === '1') setUnlocked(true);
    } catch {}
  }, []);

  const handleUnlock = () => {
    try {
      localStorage.setItem(UNLOCK_KEY, '1');
    } catch {}
    // Content snaps to full height beneath the still-opaque scrim (no visible
    // movement), then the scrim softly fades away to reveal it.
    setRevealing(true);
    window.setTimeout(() => setUnlocked(true), 1150);
  };

  // Fully locked (teaser clipped) vs. revealing/unlocked. While locked the
  // gated region is inert so keyboard users can't tab into the clipped links.
  const locked = !unlocked && !revealing;
  const gatedStyle: CSSProperties | undefined = locked
    ? GATE_LOCKED_STYLE
    : undefined;

  return (
    <div className="min-h-screen relative">
      {/* Back link */}
      <AnimatedElement
        delay={300}
        className="absolute top-5 left-5 md:top-10 md:left-10 z-50"
      >
        <a
          href="/research"
          className="block p-4 rounded bg-fi-green-200 hover:bg-fi-green-300 transition-colors no-underline"
        >
          <h4>← Read our Research</h4>
        </a>
      </AnimatedElement>

      {/* Main Content */}
      <main className="container-content">
        {/* Hero Section */}
        <header className="pt-40 md:pt-48 pb-16 md:pb-24 xl:pb-32">
          <div className="grid-layout">
            <div className="col-span-12 flex flex-col items-center text-center">
              {/* H1 Title with Leaf */}
              <AnimatedElement delay={0} className="relative inline-block">
                <h1
                  className="relative inline-block"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(40px, 9vw, 64px)',
                    fontWeight: 400,
                  }}
                >
                  Investor Preview
                  <LeafIcon
                    className="absolute leaf-animate"
                    style={{
                      width: '0.35em',
                      height: '0.4em',
                      top: '-0.05em',
                      right: '-0.4em',
                    }}
                  />
                </h1>
              </AnimatedElement>

              {/* H2 Subtitle */}
              <AnimatedElement delay={100}>
                <h2
                  className="mt-2 text-balance max-w-2xl"
                  style={{ fontSize: 'clamp(20px, 4vw, 28px)' }}
                >
                  Private intelligence is a newly possible category of
                  computing.
                </h2>
              </AnimatedElement>

              {/* Byline */}
              <AnimatedElement delay={200} className="byline mt-8">
                AI that runs local in your home, your office, your hand.
                <br />
                <span className="relative inline-block">
                  We&apos;re starting with families.
                  <img
                    src="/research/email-underline.png"
                    alt=""
                    className="absolute left-0 -bottom-1 w-full h-auto pointer-events-none"
                    style={{ transform: 'translateY(50%)' }}
                  />
                </span>
              </AnimatedElement>
            </div>
          </div>
        </header>
      </main>

      {/* ===== SECTION: Single-column teaser ===== */}
      <div className="page-content-wrapper">
        <div className="content-section relative z-0">
          <div className="main-content container-content">
            <div className="grid-layout">
              <div className="hidden md:block md:col-span-3" />
              <div className="col-span-12 md:col-span-6">
                <AnimatedElement delay={300}>
                  <section id="fundraising" className="mb-10">
                    {/* ===== I. THE CONTEXT — public teaser ===== */}
                    <SectionHeader label="I" title="The Context" />

                    <div className="mt-8 space-y-6">
                      <div className="mb-10">
                        <QuoteBox
                          large
                          quote={
                            <>
                              <span
                                style={{
                                  display: 'block',
                                  marginBottom: '1em',
                                }}
                              >
                                Open models running consumer hardware is newly
                                possible in 2026. We intend to be the trusted,
                                privacy-forward brand that brings local AI
                                devices into the home and workplace.{' '}
                                <strong>
                                  Today no one owns this market, but that window
                                  is closing fast.
                                </strong>
                              </span>
                              We&apos;re building the first device in this new
                              category: beautiful consumer hardware running a
                              fully local AI stack, where your most intimate
                              data is understood, agentified, inferred
                              against...{' '}
                              <strong>but never exposed to the cloud</strong>.
                            </>
                          }
                          showQuotes={false}
                          source="Email us to learn more"
                          actionLabel="invest@intelligence.family"
                          href="mailto:invest@intelligence.family?subject=Investor%20Memo%20Request"
                          onClick={() => {
                            if (typeof window !== 'undefined' && window.gtag) {
                              window.gtag('event', 'email_click', {
                                event_category: 'engagement',
                                event_label: 'investor_memo_request_callout',
                                value: 1,
                              });
                            }
                          }}
                        />
                      </div>

                      <p className="large">
                        <strong>
                          We're starting with families, then branching out
                        </strong>
                        . There are ~84 million households in the US alone, and
                        200M+ across the English-speaking world. It&apos;s a
                        safe place to prove our technology: high value
                        emotionally, low stakes legally.{' '}
                        <a
                          href="https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                          onClick={() => trackOutbound('pew_trust')}
                        >
                          Nearly 70% of Americans don't trust Big AI
                        </a>{' '}
                        with their data, but{' '}
                        <a
                          href="https://www.instagram.com/p/DUWLI8hiUai/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                          onClick={() => trackOutbound('research_instagram')}
                        >
                          the Instagram response to our research
                        </a>{' '}
                        (across 28k+ impressions, with Mozilla Foundation) was
                        overwhelmingly positive:{' '}
                        <strong>
                          privacy-preserving AI architecture is what wins
                          customers over
                        </strong>
                        .
                      </p>

                      {/* ===== Email gate: everything below fades until verified ===== */}
                      <div className="relative">
                        <div
                          className={`space-y-6 ${locked ? 'select-none' : ''}`}
                          aria-hidden={locked}
                          inert={locked}
                          style={gatedStyle}
                        >
                          {/* The gate wrapper breaks the `p + p` adjacency that
                              globals.css uses for paragraph rhythm, so restore
                              the margin explicitly. */}
                          <p className="large" style={{ marginTop: '1em' }}>
                            From there,{' '}
                            <strong>
                              the same stack extends to any industry where
                              private data needs inference
                            </strong>
                            : law, journalism, healthcare, and any organization
                            that&apos;s regulated or conscientious about trust.
                            This product category is newly possible:{' '}
                            <a
                              href="https://epoch.ai/data-insights/open-weights-vs-closed-weights-models"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('models_shrink')}
                            >
                              open models now trail frontier cloud models by
                              just months
                            </a>
                            , and{' '}
                            <a
                              href="https://www.qualcomm.com/snapdragon/smartphones/ai"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('chips_grow')}
                            >
                              consumer chipsets are fast enough to run them
                            </a>
                            . This is AI that no one can surveil or turn off. It
                            runs in your home without internet, with no server
                            to go dark and no company that can revoke it.{' '}
                            <strong>AI as an offline appliance</strong>.
                          </p>

                          {/* ===== II. OUR FIRST DEVICE ===== */}
                          <div className="pt-8">
                            <SectionHeader
                              label="II"
                              title="Our First Device"
                            />
                          </div>

                          <p className="large">
                            <strong>
                              This device is a living archive of your family.
                            </strong>{' '}
                            It sits on the kitchen shelf, and when you invite it
                            into the conversation it can resurface the story
                            your grandfather told last Thanksgiving, find the
                            recording of your daughter&apos;s first words, and
                            help your kids interview their grandparents while
                            they still can. Everything it hears and remembers{' '}
                            <strong>stays inside the house</strong>, so everyone
                            can rest easy knowing their cherished memories are
                            captured for them, and them alone.
                          </p>

                          <p className="large">
                            <strong>
                              It solves age old family archive problems
                              overnight
                            </strong>
                            : the trustworthy filing cabinet for documents often
                            lost, the scribe (and fact checker) for
                            Grandpa&apos;s bewildering tall stories (and history
                            of glaucoma), the family cookbook, the home media
                            server for photos and recordings often scattered
                            across devices.
                          </p>

                          <p className="large">
                            <strong>
                              Local AI is the best of both worlds.
                            </strong>{' '}
                            Going local doesn&apos;t mean giving up convenience:
                            with the family&apos;s opt-in, local AI agents can
                            pull remote context down from the public internet
                            (the weather, web search, your calendar) and mesh it
                            with the household&apos;s private ontology for a far
                            more powerful experience. The most valuable context
                            an AI can operate on is what you resist uploading -
                            so we bring the internet to your data, (not the
                            other way around). And the family connects to the
                            box remotely via slick native apps: the same
                            experience AI users have come to expect from Claude
                            or ChatGPT, backed by your own hardware instead of
                            someone else&apos;s server.
                          </p>

                          <div className="my-10">
                            <MediaRow
                              items={[
                                {
                                  type: 'video',
                                  src: '/opportunity/device-playtest.mp4',
                                  alt: 'A family play-testing the prototype',
                                },
                                {
                                  type: 'image',
                                  src: '/opportunity/device-cad.jpg',
                                  alt: 'CAD render of the device enclosure and compute module',
                                },
                                {
                                  type: 'image',
                                  src: '/opportunity/device-photo.jpg',
                                  alt: "A child touching the prototype's screen",
                                },
                              ]}
                              caption="Play testing our working prototype."
                              height={400}
                              preload="none"
                            />
                          </div>

                          <p className="large">
                            <strong>
                              It&apos;s also a context window for the whole
                              home.
                            </strong>{' '}
                            The house knows who the plumber is and what the
                            family is saving for. As homes get smarter, every
                            single purpose device will want access to private
                            inference that understands the home, and who lives
                            there - and our device is the one place that memory
                            can safely live.{' '}
                            <a
                              href="https://www.parksassociates.com/blogs/press-releases/at-ces-2024-parks-associates-announces-new-research-showing-average-number-of-connected-devices-per-us-internet-household-reached-17-in-2023"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('parks_17_devices')}
                            >
                              The average US internet household already runs 17
                              connected devices
                            </a>
                            , and soon they&apos;ll all need inference.
                          </p>

                          {/* ===== III. WHY THIS WINS ===== */}
                          <div className="pt-8">
                            <SectionHeader label="III" title="Why This Wins" />
                          </div>

                          <p className="large">
                            <strong>
                              Family-focused hardware plus subscription is a
                              proven category
                            </strong>
                            :{' '}
                            <a
                              href="https://www.mynewsdesk.com/us/tonies/pressreleases/tonies-reaches-upper-end-of-fy-2025-guidance-portfolio-expansion-and-internationalization-drive-profitable-growth-with-record-adjusted-ebitda-margin-3430792"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('tonies_proof')}
                            >
                              tonies built a public company on it
                            </a>{' '}
                            (&euro;630M revenue in FY2025, up 31%, at a record
                            adjusted EBITDA margin), and{' '}
                            <a
                              href="https://musically.com/2025/08/27/childrens-speakers-startup-yoto-saw-sales-grow-by-86-in-2024/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('yoto_proof')}
                            >
                              Yoto grew 86% in 2024 to &pound;95M
                            </a>{' '}
                            with backing from{' '}
                            <a
                              href="https://chanzuckerberg.com/newsroom/yoto-investment/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('czi_yoto')}
                            >
                              the Chan Zuckerberg Initiative
                            </a>
                            .
                          </p>

                          <p className="large">
                            <strong>
                              Big AI labs can't afford to compete in this
                              category
                            </strong>
                            . The hyperscalers&apos; core business depends on
                            your data living in their cloud; building a private,
                            on-device stack is diametrically opposed to how they
                            work. Even a privacy-forward cloud is still a cloud:
                            your data still goes to someone else&apos;s server,
                            and you have to trust that no one looks at it. Our
                            industrial design will be high taste and hard to
                            replicate, but{' '}
                            <strong>
                              truly local, encrypted, and privacy-preserving
                              inference is our real moat
                            </strong>
                            . There's a reason Google hasn't cloned Signal or
                            Telegram.
                          </p>

                          <p className="large">
                            The device will be sold at a premium consumer price
                            point, but the memories it holds are irreplaceable,
                            and families will pay extra to never lose them.{' '}
                            <strong>
                              We sell a recurring, end-to-end encrypted cloud
                              backup
                            </strong>
                            , where the keys live only with the family and the
                            data syncs as an opaque vault we cannot open. All
                            inference runs locally; the cloud is a sealed
                            mirror.
                          </p>

                          <div className="my-10">
                            <QuoteBox
                              large
                              quote={
                                <>
                                  <strong>This is a proven model</strong>:
                                  Signal now{' '}
                                  <a
                                    href="https://signal.org/blog/introducing-secure-backups/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:no-underline"
                                    onClick={() =>
                                      trackOutbound('signal_backups')
                                    }
                                  >
                                    charges for encrypted backups
                                  </a>
                                  , Telegram for Premium, Apple for{' '}
                                  <a
                                    href="https://support.apple.com/en-us/108756"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:no-underline"
                                    onClick={() => trackOutbound('apple_adp')}
                                  >
                                    Advanced Data Protection
                                  </a>{' '}
                                  on iCloud+, and Proton, 1Password, Bitwarden,
                                  Tresorit, and Standard Notes all run
                                  profitable subscriptions on zero-knowledge
                                  encryption their own servers can&apos;t read.
                                  We&apos;re applying the same architecture to
                                  the most precious archive a family owns.
                                </>
                              }
                              showQuotes={false}
                              source=""
                              actionLabel="Signal's Private Backups"
                              actionHref="https://signal.org/blog/introducing-secure-backups/"
                              onActionClick={() =>
                                trackOutbound('signal_backups_footer')
                              }
                            />
                          </div>

                          <p className="large">
                            <strong>Our stack is licensable, too</strong>. The
                            infrastructure under the family device (on-device
                            inference, encrypted sync, and fleet tooling that
                            updates thousands of devices without ever reading
                            their contents) is what a hospital network or a law
                            firm needs to run AI on data that can&apos;t leave
                            the building. Think a platform company like{' '}
                            <a
                              href="https://www.balena.io"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('balena')}
                            >
                              balena
                            </a>
                            , but for specialist IoT fleets that run private
                            inference at the edge. The consumer arena hardens
                            our tech, then{' '}
                            <strong>we license it to enterprises</strong>.
                          </p>

                          <figure
                            className="my-10 relative z-20"
                            style={{
                              width: '100vw',
                              marginLeft: 'calc(-50vw + 50%)',
                            }}
                          >
                            <div
                              className="mx-auto border border-fi-green-500/50 md:rounded-[20px] overflow-hidden relative"
                              style={{ maxWidth: 'min(1280px, 94vw)' }}
                              onMouseLeave={() => setFigmaActive(false)}
                            >
                              <iframe
                                src="https://embed.figma.com/board/CXl5xhLZOzBHkGiz8CgCUh/Untitled?node-id=2-952&embed-host=intelligence-family&footer=false&page-selector=false"
                                title="Family Intelligence product & technology trajectory, 2026 to 2030+"
                                loading="lazy"
                                allowFullScreen
                                className="block w-full"
                                style={{
                                  aspectRatio: '4864 / 3528',
                                  border: 0,
                                  pointerEvents: figmaActive ? 'auto' : 'none',
                                }}
                              />
                              {!figmaActive && (
                                <button
                                  type="button"
                                  aria-label="Activate the interactive diagram"
                                  className="absolute inset-0 w-full h-full cursor-default"
                                  onClick={activateFigma}
                                />
                              )}
                            </div>
                            <figcaption className="caption text-fi-black-900 text-center mt-4">
                              Our roadmap: from the family home, to
                              privacy-critical industries, to the enterprise.
                            </figcaption>
                          </figure>

                          <p className="large">
                            <strong>Our math is simple</strong>: an $899 device,
                            a $9/month end-to-end encrypted backup subscription,
                            and a five-year plan built on ~91,000 flagship
                            devices, roughly 0.07% of US households.{' '}
                            <strong>
                              And that&apos;s before we roll out companion
                              devices, or branch into other industries.
                            </strong>
                          </p>

                          {/* ===== IV. WHO WE ARE ===== */}
                          <div className="pt-8">
                            <SectionHeader label="IV" title="Who We Are" />
                          </div>

                          <p className="large">
                            <strong>
                              We&apos;ve spent our careers building intimate,
                              human-centric hardware.
                            </strong>
                          </p>

                          <p className="large">
                            <strong>
                              <a
                                href="http://hhff.solar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:no-underline"
                                onClick={() => trackOutbound('hugh_francis')}
                              >
                                Hugh Francis
                              </a>
                            </strong>{' '}
                            founded{' '}
                            <a
                              href="https://garden3d.net"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('garden3d')}
                            >
                              garden3d
                            </a>{' '}
                            and{' '}
                            <a
                              href="https://www.sanctuary.computer"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() =>
                                trackOutbound('sanctuary_computer')
                              }
                            >
                              Sanctuary Computer
                            </a>
                            , and oversees a $6mm+ design & development studio.
                            He&apos;s a patented inventor for architecting{' '}
                            <a
                              href="https://www.sanctuary.computer/work/light-three"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('light_phone')}
                            >
                              The Light Phone II & III
                            </a>{' '}
                            (named among TIME Magazine&apos;s Best Inventions in
                            2019 and 2025), architected{' '}
                            <a
                              href="https://www.sanctuary.computer/work/mill"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('mill')}
                            >
                              Mill&apos;s IoT infrastructure
                            </a>{' '}
                            (from the founders of Google&apos;s Nest), and{' '}
                            <strong>
                              holds direct relationships in Taipei and Shenzhen
                              with Foxconn
                            </strong>
                            , Arima, Coosea, and other top-tier contract
                            manufacturers.
                          </p>

                          <p className="large">
                            <strong>
                              Yatú Pelaez-Espinosa & Norm O&rsquo;Hagan
                            </strong>{' '}
                            are a product duo with 10+ years of creative
                            collaboration: they founded{' '}
                            <a
                              href="https://usb.club/about"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('usb_club')}
                            >
                              USB Club
                            </a>
                            , a hardware-enabled social network (acquired in
                            2026), founded the Advanced Concepts hardware team
                            at{' '}
                            <a
                              href="https://www.recordsofthought.com/proof"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('world')}
                            >
                              Sam Altman&apos;s World
                            </a>
                            , researched new educational models at{' '}
                            <a
                              href="https://otherinter.net"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:no-underline"
                              onClick={() => trackOutbound('other_internet')}
                            >
                              Other Internet
                            </a>
                            , and in past lives designed at IBM and early Plaid.
                          </p>

                          <p className="large">
                            <strong>
                              Today, all three of us work together at garden3d
                            </strong>
                            , a creative studio of 30+ designers and developers.
                          </p>

                          <div className="my-10">
                            <MediaRow
                              items={[
                                {
                                  type: 'image',
                                  src: '/fundraising/signal-source.jpg',
                                  alt: 'USB Club Transport product poster',
                                },
                                {
                                  type: 'image',
                                  src: '/fundraising/family-together.webp',
                                  alt: 'On the factory floor with our contract manufacturing partners',
                                },
                                {
                                  type: 'video',
                                  src: '/fundraising/moment-video.mp4',
                                  poster:
                                    '/fundraising/moment-video-poster.jpg',
                                  alt: 'Early prototype in use',
                                },
                              ]}
                              caption="We've built and scaled domestic and international consumer hardware businesses."
                              height={400}
                              preload="none"
                            />
                          </div>

                          {/* ===== V. THE ASK ===== */}
                          <div className="pt-8">
                            <SectionHeader label="V" title="The Ask" />
                          </div>

                          <div className="my-10">
                            <QuoteBox
                              large
                              quote={
                                <>
                                  <strong>We&apos;re raising $15M</strong> to
                                  design, manufacture, and ship the first device
                                  in this category, on shelves and ready to gift{' '}
                                  <strong>by Christmas 2027</strong>. It&apos;s
                                  the same stack every private-intelligence
                                  product after it will run on.
                                </>
                              }
                              showQuotes={false}
                              source="Book a demo"
                              actionLabel="invest@intelligence.family"
                              href="mailto:invest@intelligence.family?subject=Investor%20Memo%20Request"
                              onClick={() => {
                                if (
                                  typeof window !== 'undefined' &&
                                  window.gtag
                                ) {
                                  window.gtag('event', 'email_click', {
                                    event_category: 'engagement',
                                    event_label: 'investor_memo_request_ask',
                                    value: 1,
                                  });
                                }
                              }}
                            />
                          </div>

                          <p className="large">
                            <strong>
                              We&apos;ve built a working prototype and written a
                              full investor memo
                            </strong>
                            : product, unit economics, go-to-market, and the
                            three-phase path from a single device to a platform
                            company powering every privacy-conscious hardware
                            maker.{' '}
                            <strong>
                              Our team lives in New York City and San Francisco
                            </strong>
                            .
                          </p>

                          <p className="large">
                            <strong>
                              If you&apos;d like a demo or the full memo, please
                              email us
                            </strong>{' '}
                            at{' '}
                            <span className="relative inline-block">
                              <a
                                href="mailto:invest@intelligence.family?subject=Investor%20Memo%20Request"
                                onClick={() => {
                                  if (
                                    typeof window !== 'undefined' &&
                                    window.gtag
                                  ) {
                                    window.gtag('event', 'email_click', {
                                      event_category: 'engagement',
                                      event_label: 'investor_memo_request',
                                      value: 1,
                                    });
                                  }
                                }}
                                className="no-underline hover:underline"
                              >
                                invest@intelligence.family
                              </a>
                              <img
                                src="/research/email-underline.png"
                                alt=""
                                className="absolute left-0 -bottom-1 w-full h-auto pointer-events-none"
                                style={{ transform: 'translateY(50%)' }}
                              />
                            </span>
                            .
                          </p>

                          <figure className="my-10 w-screen ml-[calc(-50vw+50%)] md:w-full md:ml-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/fundraising/grandma-text.png"
                              alt='Text message: "So my grandma beat the odds and lived. So if y&apos;all can speed it up on the family intelligence that would be greatly appreciated."'
                              className="block w-full h-auto rounded-none md:rounded-[20px]"
                            />
                            <figcaption className="caption text-fi-black-900 text-center mt-4">
                              A real text message from an early user tester.
                              &#9825;
                            </figcaption>
                          </figure>

                          {/* ===== VI. CLARIFICATIONS ===== */}
                          <div className="pt-8">
                            <SectionHeader label="VI" title="Clarifications" />
                          </div>

                          <div className="border-b border-fi-green-300">
                            {clarifications.map(item => (
                              <ClarificationItem
                                key={item.question}
                                question={item.question}
                                answerHtml={item.answerHtml}
                              />
                            ))}
                          </div>
                        </div>
                        {/* /gated content */}

                        {!unlocked && (
                          <div
                            // z-30 beats .media-row-wrapper's z-20, which
                            // otherwise paints the Section II photo row over
                            // the scrim and email form while locked.
                            className="absolute inset-0 z-30"
                            style={{
                              background: GATE_SCRIM,
                              opacity: revealing ? 0 : 1,
                              transition: 'opacity 1100ms ease-out',
                              pointerEvents: revealing ? 'none' : 'auto',
                            }}
                          >
                            <div
                              className="absolute inset-x-0"
                              style={{ top: 400 }}
                            >
                              <InlineEmailGate
                                onSuccess={handleUnlock}
                                source="g3d:family_intelligence:fundraising"
                                prompt="Enter your email to read our fundraising note"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {/* /email gate wrapper */}
                    </div>
                  </section>
                </AnimatedElement>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-24 md:pb-32" />
    </div>
  );
}
