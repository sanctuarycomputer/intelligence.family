'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import InlineEmailGate from '@/components/InlineEmailGate';
import { FUNDRAISING_UNLOCK_KEY } from '@/lib/fundraising-gate';

const TrunkCanvas = dynamic(() => import('@/components/trunk/TrunkCanvas'), {
  ssr: false,
});

const STORY_ID = 'stack-story';

// PLACEHOLDER copy throughout: every beat below is scaffolding for Hugh
// to replace with his own words. Structure and part names are real.
const BEATS: { heading: string; body: string }[] = [
  {
    heading: 'One object, whole',
    body: 'The family trunk arrives as a single sculptural object. Scroll to open it up.',
  },
  {
    heading: 'The Lid',
    body: 'The top lifts away. Nothing about this device asks to live in a server closet.',
  },
  {
    heading: 'The Leaf',
    body: 'A small signature. Every trunk carries one.',
  },
  {
    heading: 'The Front, and the Display',
    body: 'The front panel carries a Waveshare display: the face your family actually talks to.',
  },
  {
    heading: 'The Orin',
    body: 'An NVIDIA Jetson Orin Nano runs the entire intelligence stack locally. No cloud, no subscription to a stranger.',
  },
  {
    heading: 'The Power',
    body: 'A UPS module sits beneath the compute, so a blackout never takes your family offline.',
  },
  {
    heading: 'The Shell',
    body: 'The back shell closes around all of it. This is the whole machine: yours, at home.',
  },
];

export default function Stack() {
  const [unlocked, setUnlocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(localStorage.getItem(FUNDRAISING_UNLOCK_KEY) === '1');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const unlock = () => {
    localStorage.setItem(FUNDRAISING_UNLOCK_KEY, '1');
    setUnlocked(true);
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center text-balance">
          The Stack
        </h1>
        <InlineEmailGate
          onSuccess={unlock}
          source="fundraising_stack"
          prompt="Enter your email to see inside the trunk."
        />
      </main>
    );
  }

  return (
    <main>
      <TrunkCanvas
        storyElementId={STORY_ID}
        progressOverride={reducedMotion ? 1 : undefined}
      />
      <div id={STORY_ID} className="relative z-10">
        {BEATS.map((beat, i) => (
          <section
            key={beat.heading}
            className="min-h-[120vh] flex items-center px-6 md:px-20"
          >
            <div
              className={`max-w-sm ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}
            >
              <h2 className="font-serif text-3xl md:text-4xl mb-4">{beat.heading}</h2>
              <p className="text-lg leading-relaxed text-fi-black-900">{beat.body}</p>
            </div>
          </section>
        ))}
        <section className="min-h-[60vh] flex items-center justify-center">
          <p className="font-serif text-2xl md:text-3xl text-center text-balance px-6">
            The whole stack, in one trunk.
          </p>
        </section>
      </div>
    </main>
  );
}
