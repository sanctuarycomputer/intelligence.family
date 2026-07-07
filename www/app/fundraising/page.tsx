'use client';

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import SectionHeader from "@/components/SectionHeader";
import QuoteBox from "@/components/QuoteBox";
import MediaRow from "@/components/MediaRow";
import LeafIcon from "@/components/LeafIcon";
import InlineEmailGate from "@/components/InlineEmailGate";
import { AnimatedElement } from "@/components/PageAnimations";

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
const GATE_SCRIM = 'linear-gradient(to bottom, rgba(215,221,212,0) 0px, rgba(215,221,212,0) 96px, var(--fi-green-100) 300px)';

const GATE_LOCKED_STYLE: CSSProperties = {
  maxHeight: 460,
  overflow: 'hidden',
  pointerEvents: 'none',
};

export default function Fundraising() {
  const [unlocked, setUnlocked] = useState(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('fi_fundraising_unlocked') === '1') setUnlocked(true);
    } catch {}
  }, []);

  const handleUnlock = () => {
    try {
      localStorage.setItem('fi_fundraising_unlocked', '1');
    } catch {}
    // Content snaps to full height beneath the still-opaque scrim (no visible
    // movement), then the scrim softly fades away to reveal it.
    setRevealing(true);
    window.setTimeout(() => setUnlocked(true), 1150);
  };

  // Clipped while locked; full height the moment we start revealing (hidden
  // under the scrim), so the reveal is a fade rather than a slide.
  const gatedStyle: CSSProperties | undefined =
    unlocked || revealing ? undefined : GATE_LOCKED_STYLE;

  return (
    <div className="min-h-screen relative">
      {/* Back link */}
      <AnimatedElement delay={300} className="absolute top-5 left-5 md:top-10 md:left-10 z-50">
        <a
          href="/"
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
              <AnimatedElement delay={200} className="byline mt-8">
                August · September 2026
              </AnimatedElement>
    
              {/* H1 Title with Leaf */}
              <AnimatedElement delay={0} className="relative inline-block">
                <h1 className="relative inline-block" style={{ fontFamily: 'var(--font-serif)' }}>
                  Fundraising
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
                <h2 className="mt-2 text-balance">
                  We're building a consumer hardware business and software platform for private intelligence.
                </h2>
              </AnimatedElement>

              {/* Byline */}
              <AnimatedElement delay={200} className="byline mt-8">
                <span className="relative inline-block">
                  We&apos;re raising $25M
                  <img
                    src="/research/email-underline.png"
                    alt=""
                    className="absolute left-0 -bottom-1 w-full h-auto pointer-events-none"
                    style={{ transform: 'translateY(50%)' }}
                  />
                </span>
                <br />
                to ship our first device.
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
                  <SectionHeader label="I" title="Business Concept" />

                  <div className="mt-8 space-y-6">
                    <div className="mb-10">
                      <QuoteBox
                        large
                        quote={<><strong>We&apos;re raising $25M</strong> to design, manufacture, and ship the first device in a new category: beautiful consumer hardware running a fully local AI stack, where your most intimate data is understood, agentified, inferred against... <strong>but never exposed to the cloud</strong>.</>}
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

                    {/* ===== Email gate: everything below fades until an email is submitted ===== */}
                    <div className="relative">
                    <div
                      className={`space-y-6 ${unlocked ? '' : 'select-none'}`}
                      aria-hidden={!unlocked}
                      style={gatedStyle}
                    >

                    <p className="large">
                      <strong>We're starting with families, then branching out</strong>. There are ~84 million households in the US alone, and 200M+ across the English-speaking world. It&apos;s a safe place to prove our technology: high value emotionally, low stakes legally. <a href="https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('pew_trust')}>Nearly 70% of Americans don't trust Big AI</a> with their data, but <a href="https://www.instagram.com/p/DUWLI8hiUai/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('research_instagram')}>the Instagram response to our research</a> (published in partnership with Mozilla Foundation) was overwhelmingly positive: <strong>privacy-preserving AI architecture is what wins customers over</strong>.
                    </p>
    
                    <p className="large">
                      From there, <strong>the same stack extends to any industry where private data needs inference</strong>: law, journalism, healthcare, and any organization that&apos;s regulated or conscientious about trust. This product category is newly possible: <a href="https://epoch.ai/data-insights/open-weights-vs-closed-weights-models" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('models_shrink')}>open models now trail frontier cloud models by just months</a>, and <a href="https://www.qualcomm.com/snapdragon/smartphones/ai" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('chips_grow')}>consumer chipsets are fast enough to run them</a>. This is AI that no one can surveil or turn off. It runs in your home without internet, with no server to go dark and no company that can revoke it. <strong>AI as an offline appliance</strong>.
                    </p>

                    <div className="my-10">
                      <MediaRow
                        items={[
                          { type: "image", src: "/research/moment-1.png", alt: "Family device in a kitchen" },
                          { type: "image", src: "/research/family-together.png", alt: "A family together" },
                          { type: "image", src: "/research/moment-3.png", alt: "Family device on a shelf" },
                        ]}
                        caption="Play tests for our early industrial designs."
                        height={400}
                      />
                    </div>

                    <p className="large">
                      <strong>Big AI labs can't afford to compete in this category</strong>. The hyperscalers&apos; core business depends on your data living in their cloud; building a private, on-device stack is diametrically opposed to how they work. Even a privacy-forward cloud is still a cloud: your data still goes to someone else&apos;s server, and you have to trust that no one looks at it. Our industrial design will be high taste and hard to replicate, but <strong>truly local, encrypted, and privacy-preserving inference is our real moat</strong>. There's a reason Google hasn't cloned Signal or Telegram.
                    </p>

                    <p className="large">
                      The device will be sold at a premium consumer price point, but the memories it holds are irreplaceable, and families will pay extra to never lose them. <strong>We sell a recurring, end-to-end encrypted cloud backup</strong>, where the keys live only with the family and the data syncs as an opaque vault we cannot open. All inference runs locally; the cloud is a sealed mirror.
                    </p>

                    <div className="my-10">
                      <QuoteBox
                        large
                        quote={<><strong>This is a proven model</strong>: Signal now <a href="https://signal.org/blog/introducing-secure-backups/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('signal_backups')}>charges for encrypted backups</a>, Telegram for Premium, Apple for <a href="https://support.apple.com/en-us/108756" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('apple_adp')}>Advanced Data Protection</a> on iCloud+, and Proton, 1Password, Bitwarden, Tresorit, and Standard Notes all run profitable subscriptions on zero-knowledge encryption their own servers can&apos;t read. We&apos;re applying the same architecture to the most precious archive a family owns.</>}
                        showQuotes={false}
                        source=""
                        actionLabel="Signal's Private Backups"
                        actionHref="https://signal.org/blog/introducing-secure-backups/"
                        onActionClick={() => trackOutbound('signal_backups_footer')}
                      />
                    </div>
  
                    <p className="large">
                      <strong>Our stack is licensable, too</strong>. The infrastructure under the family device (on-device inference, encrypted sync, and fleet tooling that updates thousands of devices without ever reading their contents) is what a hospital network or a law firm needs to run AI on data that can&apos;t leave the building. Think a platform company like <a href="https://www.balena.io" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('balena')}>balena</a>, but for specialist IoT fleets that run private inference at the edge. The consumer arena hardens our tech, then <strong>we license it to enterprises</strong>.
                    </p>
    
                    <div className="pt-8">
                      <SectionHeader label="II" title="Our Experience" />
                    </div>
    
                    <p className="large">
                      <strong>We&apos;re patented inventors</strong> for our work architecting and shipping <a href="https://www.sanctuary.computer/work/light-three" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('light_phone')}>The Light Phone II & III</a> (named among TIME Magazine's Best Inventions in both 2019 and 2025). We've built hardware-enabled social networks like <a href="https://usb.club/about" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('usb_club')}>USB Club</a>, and led advanced-concepts hardware teams for <a href="https://www.recordsofthought.com/proof" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('world')}>Sam Altman's World</a>, AT&T, <a href="https://www.sanctuary.computer/work/mill" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" onClick={() => trackOutbound('mill')}>Mill</a> (from the founders of Google's Nest), and more. We hold direct relationships in Taipei and Shenzhen with Foxconn and other top-tier contract manufacturers, and we understand, in detail, how hardware is built and launched at scale.
                    </p>
    
                    <div className="my-10">
                      <MediaRow
                        items={[
                          { type: "image", src: "/fundraising/signal-source.jpg", alt: "Early prototype hardware" },
                          { type: "image", src: "/fundraising/family-together.webp", alt: "A family together" },
                          { type: "video", src: "/fundraising/moment-video.mp4", poster: "/fundraising/moment-video-poster.jpg", alt: "Early prototype in use" },
                        ]}
                        caption="We've built and scaled domestic and international consumer hardware businesses."
                        height={400}
                      />
                    </div>

                    <SectionHeader label="III" title="Our Prototype & Memo" />

                    <p className="large">
                      <strong>We&apos;ve built a working prototype and written a full investor memo</strong>: product, unit economics, go-to-market, and the three-phase path from a single device to a platform company powering every privacy-conscious hardware maker. <strong>If you&apos;d like a demo, please email us</strong> at{" "}
                      <span className="relative inline-block">
                        <a
                          href="mailto:invest@intelligence.family?subject=Investor%20Memo%20Request"
                          onClick={() => {
                            if (typeof window !== 'undefined' && window.gtag) {
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
                      </span>.
                    </p>

                    </div>{/* /gated content */}

                    {!unlocked && (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: GATE_SCRIM,
                          opacity: revealing ? 0 : 1,
                          transition: 'opacity 1100ms ease-out',
                          pointerEvents: revealing ? 'none' : 'auto',
                        }}
                      >
                        <div className="absolute inset-x-0" style={{ top: 312 }}>
                          <InlineEmailGate
                            onSuccess={handleUnlock}
                            source="g3d:family_intelligence:fundraising"
                            prompt="Enter your email to read our fundraising note"
                          />
                        </div>
                      </div>
                    )}
                    </div>{/* /email gate wrapper */}
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
