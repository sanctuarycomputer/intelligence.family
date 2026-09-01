'use client';

import { useEffect, useRef, useState } from 'react';
import LeafIcon from '@/components/LeafIcon';
import { subscribe } from '@/components/demo/demoClock';
import { REPLY_ORDINAL, THREAD } from '@/components/thread/threadScript';
import { phoneScaleFor } from '@/components/thread/phoneFit';
import {
  AudioSnippet,
  OUT,
  Out,
  Reply,
  Transcript,
  Typing,
  VoiceNote,
} from '@/components/thread/bubbles';

/**
 * A mock iMessage thread showing the device answering from the family's own
 * archive. The copy lives in threadScript.ts; this file is the phone around it.
 *
 * Entries arrive one at a time, driven by the demo clock, and the thread
 * scrolls to keep the newest one above the input bar. Before the demo is
 * played the thread is empty, which is what makes pressing play feel like
 * starting a conversation rather than replaying a recording.
 *
 * Frame is 390x844 (iPhone logical points, 19.5:9).
 */

/** Matches the .phone-rise transform transition in globals.css. */
const PHONE_EXIT_MS = 1400;

export default function MessageThread() {
  /* All of these start at the demo's resting state rather than being read from
     the clock, so the server and the client render the same first frame.
     subscribe() catches up on mount. */
  const [attributed, setAttributed] = useState(0);
  const [typing, setTyping] = useState(false);
  const [phoneUp, setPhoneUp] = useState(false);
  /* How much of the thread renders. Trails the clock on the way down only:
     replay empties the thread at once, and clearing it immediately would leave
     the phone blank for the whole of its fade. */
  const [shown, setShown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let emptying: ReturnType<typeof setTimeout> | undefined;
    const stop = subscribe(s => {
      setAttributed(s.attributed);
      setTyping(s.typing);
      setPhoneUp(s.phoneUp);

      if (s.visibleMessages > 0) {
        clearTimeout(emptying);
        emptying = undefined;
        setShown(s.visibleMessages);
      } else if (!emptying) {
        emptying = setTimeout(() => {
          emptying = undefined;
          setShown(0);
        }, PHONE_EXIT_MS);
      }
    });
    return () => {
      stop();
      clearTimeout(emptying);
    };
  }, []);

  /**
   * How far the phone has to shrink to fit, whole, in whatever frame it is in.
   *
   * Computed here rather than in CSS because scale() needs a unitless number,
   * and CSS cannot divide a length by a length to produce one — written as a
   * calc() it is silently invalid and the phone renders at full size.
   *
   * Measured against the visual viewport where the browser exposes one. On a
   * phone the layout viewport can be taller than what you can actually see,
   * with a collapsing toolbar over the difference, and the phone is docked to
   * the bottom edge — exactly the edge that would be hidden.
   */
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const vv = window.visualViewport;
    const fit = () => {
      const width = vv?.width ?? window.innerWidth;
      const height = vv?.height ?? window.innerHeight;
      el.style.setProperty(
        '--phone-scale',
        String(phoneScaleFor(width, height))
      );
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    vv?.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
      vv?.removeEventListener('resize', fit);
    };
  }, []);

  // Keep the newest bubble in view once the thread outgrows the frame.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: phoneUp ? 'smooth' : 'auto',
    });
  }, [shown, typing, phoneUp]);

  return (
    <div ref={dockRef} className="phone-dock">
      {/* The rise is a CSS transition rather than a per-frame write, so it
          eases back out on replay too. A transform written every frame cannot
          be transitioned away from — it just stops, leaving the phone stranded
          wherever the last frame put it. */}
      <div className={`phone-rise${phoneUp ? ' is-up' : ''}`}>
        {/* ===== iPhone =====
            Always laid out at 390x844 and scaled to fit, never reflowed. At
            full size it is taller than a laptop viewport, but shrinking the box
            while its contents keep their iOS point sizes is what pushed the
            status bar icons out, wrapped the transcription onto a third line
            and crowded the timestamp off the voice note. */}
        <div
          className="phone-frame relative mx-auto overflow-hidden shadow-[0_2px_6px_rgba(49,49,49,0.08),0_24px_60px_rgba(49,49,49,0.16)]"
          style={{
            aspectRatio: '390 / 844',
            borderRadius: '56px',
            /* The bezel, a quarter thinner than a real iPhone's: at this size
               the full width reads as a heavy frame rather than an edge. */
            padding: '8.25px',
            /* The device's own black is the wordmark's off-black, not #000.
               Pure black beside it looks like a different palette. */
            background: 'var(--fi-black-900)',
          }}
        >
          <div
            className="relative flex h-full w-full flex-col overflow-hidden bg-white"
            style={{ borderRadius: '46px' }}
          >
            {/* Dynamic Island */}
            {/* Same off-black as the bezel: it is the same piece of hardware. */}
            <div
              className="pointer-events-none absolute left-1/2 top-[9px] z-20 h-[32px] w-[112px] -translate-x-1/2 rounded-full"
              style={{ background: 'var(--fi-black-900)' }}
            />

            {/* Status bar */}
            <div className="relative z-10 flex shrink-0 items-center justify-between px-[26px] pb-[4px] pt-[15px] text-[14px] font-semibold text-black">
              <span className="tracking-[-0.2px]">9:41</span>
              <span className="flex items-center gap-[5px]">
                {/* cellular */}
                <svg
                  width="17"
                  height="11"
                  viewBox="0 0 17 11"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  {[0, 1, 2, 3].map(i => (
                    <rect
                      key={i}
                      x={i * 4.4}
                      y={8 - i * 2.4}
                      width="3"
                      height={3 + i * 2.4}
                      rx="1"
                      fill="black"
                    />
                  ))}
                </svg>
                {/* wifi */}
                <svg
                  width="16"
                  height="11"
                  viewBox="0 0 16 11"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path
                    d="M8 10.4 6.2 8.5a2.6 2.6 0 0 1 3.6 0L8 10.4Z"
                    fill="black"
                  />
                  <path
                    d="M11.6 6.6a5.2 5.2 0 0 0-7.2 0L3 5.2a7.2 7.2 0 0 1 10 0l-1.4 1.4Z"
                    fill="black"
                  />
                  <path
                    d="M14.5 3.5a9.4 9.4 0 0 0-13 0L0 2.1a11.4 11.4 0 0 1 16 0l-1.5 1.4Z"
                    fill="black"
                  />
                </svg>
                {/* battery */}
                <svg
                  width="26"
                  height="12"
                  viewBox="0 0 26 12"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="21"
                    height="11"
                    rx="3.2"
                    stroke="black"
                    strokeOpacity="0.35"
                  />
                  <rect x="2" y="2" width="18" height="8" rx="2" fill="black" />
                  <path
                    d="M23.5 4v4a2.1 2.1 0 0 0 0-4Z"
                    fill="black"
                    fillOpacity="0.4"
                  />
                </svg>
              </span>
            </div>

            {/* Nav bar */}
            <div className="relative z-10 flex shrink-0 items-center border-b border-black/[0.08] px-3 pb-[7px] pt-[6px]">
              <svg
                width="12"
                height="20"
                viewBox="0 0 12 20"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M10 1 2 10l8 9"
                  stroke={OUT}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="flex flex-1 flex-col items-center gap-[3px]">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-fi-green-100">
                  <LeafIcon style={{ width: '17px', height: '19px' }} />
                </span>
                <span className="flex items-center gap-[3px] text-[11px] font-normal leading-none text-black">
                  Family Intelligence
                  <svg
                    width="6"
                    height="9"
                    viewBox="0 0 6 9"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 1l3.5 3.5L1 8"
                      stroke="black"
                      strokeOpacity="0.3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
              <span className="w-[12px] shrink-0" />
            </div>

            {/* ===== Thread ===== */}
            <div
              ref={scrollRef}
              className="flex flex-1 flex-col gap-[4px] overflow-hidden px-[13px] pb-2 pt-[6px]"
            >
              {THREAD.slice(0, shown).map(entry => {
                switch (entry.kind) {
                  case 'voiceNote':
                    return (
                      <VoiceNote key={entry.id} duration={entry.duration} />
                    );
                  case 'transcript':
                    return <Transcript key={entry.id} text={entry.text} />;
                  case 'out':
                    return <Out key={entry.id} text={entry.text} />;
                  case 'reply':
                    return (
                      <Reply
                        key={entry.id}
                        text={entry.text}
                        attribution={entry.attribution}
                        attributionKind={entry.attributionKind}
                        showAttribution={
                          (REPLY_ORDINAL.get(entry.id) ?? 0) < attributed
                        }
                      />
                    );
                  case 'audioSnippet':
                    return (
                      <AudioSnippet
                        key={entry.id}
                        name={entry.name}
                        duration={entry.duration}
                      />
                    );
                  case 'checkoutLink':
                  case 'trackingLink':
                    // Task 5 draws these bubbles. Landing the two cases here
                    // keeps this switch exhaustive for Task 4's commit.
                    return null;
                }
              })}

              {typing ? <Typing /> : null}
            </div>

            {/* ===== Input bar ===== */}
            <div className="shrink-0 px-[11px] pb-[7px] pt-[5px]">
              <div className="flex items-center gap-[8px]">
                <span className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full bg-black/[0.06]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 1.6v10.8M1.6 7h10.8"
                      stroke="rgba(0,0,0,0.45)"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="flex h-[32px] flex-1 items-center justify-between rounded-full border border-black/[0.13] pl-[13px] pr-[3px]">
                  <span className="text-[14px] text-black/30">iMessage</span>
                  <span
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
                    style={{ background: OUT }}
                  >
                    <svg
                      width="13"
                      height="14"
                      viewBox="0 0 13 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6.5 13V2M1.6 6.6 6.5 1.5l4.9 5.1"
                        stroke="#fff"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </div>
              {/* Home indicator */}
              <span className="mx-auto mt-[7px] block h-[5px] w-[134px] rounded-full bg-black/85" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
