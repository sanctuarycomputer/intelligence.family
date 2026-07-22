'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import InlineEmailGate from '@/components/InlineEmailGate';
import { FUNDRAISING_UNLOCK_KEY } from '@/lib/fundraising-gate';
import CalloutLayer from '@/components/stack-tour/CalloutLayer';
import {
  TOUR_BEATS,
  type AnchorScreenMap,
} from '@/components/stack-tour/stackTour';

const TrunkCanvas = dynamic(() => import('@/components/trunk/TrunkCanvas'), {
  ssr: false,
});

const StackTourCanvas = dynamic(
  () => import('@/components/stack-tour/StackTourCanvas'),
  { ssr: false }
);

const STORY_ID = 'stack-story';

// The viewer card: sage plate, hairline edge, generous radius. Shared by
// the locked and unlocked layouts so the trunk never appears to move
// containers when the gate falls away.
const CARD_CLASS =
  'relative h-full overflow-hidden rounded-[28px] border border-fi-green-200 bg-white/25';

const BEAT_TITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(20px, 1.8vw, 26px)',
  fontWeight: 500,
  lineHeight: 1.25,
  letterSpacing: '-0.01em',
  margin: 0,
};

const BEAT_LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontVariationSettings: "'MONO' 100",
  fontSize: '12px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#7B8F5E',
  marginBottom: '0.9em',
};

const BEAT_BODY_STYLE: React.CSSProperties = {
  fontSize: 'clamp(16px, 1.25vw, 19px)',
  lineHeight: 1.45,
};

// The hand-drawn stroke /fundraising puts under its byline. Carried as a
// background rather than an absolutely-positioned <img> (its usage there)
// because this sentence wraps: box-decoration-break gives each wrapped line
// its own stroke, sized to that line instead of to the whole block.
const UNDERLINE_STYLE: React.CSSProperties = {
  backgroundImage: "url('/research/email-underline.png')",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '0 100%',
  backgroundSize: '100% 0.45em',
  paddingBottom: '0.42em',
  WebkitBoxDecorationBreak: 'clone',
  boxDecorationBreak: 'clone',
};

// "The Stack" intro: shown beside the gate while locked, and as the story's
// opening section once unlocked, so the copy never disappears on unlock.
function StackIntro() {
  return (
    <>
      {/* Bare h1: takes the site display treatment from globals.css,
          same as the homepage. Its `margin: 0` is why the gap below
          lives on the copy block instead. */}
      <h1>The Stack</h1>
      <div className="mt-6 text-fi-black-900 text-pretty">
        <p className="large">
          Under the hood, we&rsquo;re solving for zero knowledge data sync,
          end-to-end encryption at rest, runtime memory management, model
          agnostic agentic harness, fleet management and firmware updates.
        </p>
        <p className="large">
          Together, our stack is{' '}
          <strong>
            an integrated silicon-to-screen application runtime for deploying
            privacy preserving inference to edge devices
          </strong>
          .
        </p>
        <p className="large">
          <span style={UNDERLINE_STYLE}>
            This is the Android of privately intelligent hardware.
          </span>
        </p>
      </div>
    </>
  );
}

export default function Stack() {
  const [unlocked, setUnlocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(FUNDRAISING_UNLOCK_KEY) === '1')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUnlocked(true);
    } catch {}
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const unlock = () => {
    try {
      localStorage.setItem(FUNDRAISING_UNLOCK_KEY, '1');
    } catch {}
    setUnlocked(true);
  };

  const anchorsRef = useRef<AnchorScreenMap>({});

  // Locked: one screen, and the scrolling story is not in the DOM at all,
  // so there is nothing to scroll past the gate.
  if (!unlocked) {
    return (
      <main className="min-h-svh lg:h-svh lg:overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-4 lg:p-8">
          <div className="lg:col-span-8 h-[45svh] lg:h-full">
            <div className={CARD_CLASS}>
              <div className="absolute inset-0 opacity-30 blur-[2px]">
                <TrunkCanvas storyElementId={STORY_ID} progressOverride={0} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-lg bg-fi-green-100/70 backdrop-blur-sm px-5 py-6">
                  <InlineEmailGate
                    onSuccess={unlock}
                    source="fundraising_stack"
                    prompt="Enter your email to see inside the trunk."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center pb-8 lg:pb-0 lg:pr-4">
            <StackIntro />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* The story element's own height is the scroll track useScrollProgress
          reads: eleven one-viewport sections (intro + ten beats), so beat i
          centres at t = (i + 1) / 10. */}
      <div
        id={STORY_ID}
        className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-10 px-4 lg:px-8"
      >
        {/* Narrow screens pin the card to the top of the viewport; on lg+ it
            rides along as a sticky pane inside its own column. */}
        <div className="fixed inset-x-4 top-4 z-10 h-[42svh] lg:static lg:inset-auto lg:z-auto lg:h-auto lg:col-span-8">
          <div className="h-full lg:sticky lg:top-0 lg:h-svh lg:py-8">
            <div className={CARD_CLASS}>
              <StackTourCanvas
                storyElementId={STORY_ID}
                reducedMotion={reducedMotion}
                anchorsRef={anchorsRef}
              />
              <CalloutLayer
                storyElementId={STORY_ID}
                reducedMotion={reducedMotion}
                anchorsRef={anchorsRef}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          {/* Intro section: the same "The Stack" copy as the locked frame,
              always at the top; scrolling descends into Layer 01. */}
          <section className="min-h-svh flex items-end pb-[10svh] lg:items-center lg:pb-0 lg:pr-4">
            <div>
              <StackIntro />
            </div>
          </section>
          {TOUR_BEATS.map(beat => (
            <section
              key={beat.id}
              className="min-h-svh flex items-end pb-[10svh] lg:items-center lg:pb-0 lg:pr-4"
            >
              <div className="text-fi-black-900 text-pretty">
                <p style={BEAT_LABEL_STYLE}>{beat.label}</p>
                <h2 style={BEAT_TITLE_STYLE}>{beat.title}</h2>
                {beat.paragraphs.map(p => (
                  <p
                    key={p.slice(0, 24)}
                    className="mt-4"
                    style={BEAT_BODY_STYLE}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
