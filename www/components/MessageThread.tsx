'use client';

import { useEffect, useRef, useState } from 'react';
import LeafIcon from '@/components/LeafIcon';
import { read, subscribe } from '@/components/demo/demoClock';
import { THREAD } from '@/components/thread/threadScript';
import {
  AudioSnippet,
  OUT,
  Out,
  Receipt,
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

export default function MessageThread() {
  const [visible, setVisible] = useState(() => read().visibleMessages);
  const [attributed, setAttributed] = useState(() => read().attributed);
  const [typing, setTyping] = useState(() => read().typing);
  const [phoneUp, setPhoneUp] = useState(() => read().phoneY > 0.99);
  const upRef = useRef(read().phoneY > 0.99);
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      subscribe(s => {
        setVisible(s.visibleMessages);
        setAttributed(s.attributed);
        setTyping(s.typing);
      }),
    []
  );

  // The phone rises on a continuous value, so it is read per frame rather than
  // pushed through React. One class toggle, not a re-render per frame.
  useEffect(() => {
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const el = frameRef.current;
      if (!el) return;
      const y = read().phoneY;
      el.style.transform = `translate3d(0, ${(1 - y) * 46}%, 0)`;
      el.style.opacity = String(Math.min(1, y * 1.6));
      // Only tell React when it actually flips, rather than dispatching an
      // identical value sixty times a second.
      const up = y > 0.99;
      if (up !== upRef.current) {
        upRef.current = up;
        setPhoneUp(up);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keep the newest bubble in view once the thread outgrows the frame.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: phoneUp ? 'smooth' : 'auto',
    });
  }, [visible, typing, phoneUp]);

  let replyIndex = -1;

  return (
    <div className="flex w-full flex-1 flex-col items-center lg:items-start">
      {/* The rise is written per frame by the loop below, but the first paint
          happens before any frame runs, so the resting state is inline too.
          Without it the Dynamic Island shows through on load. */}
      <div
        className="relative"
        ref={frameRef}
        style={{
          transform: `translate3d(0, ${(1 - read().phoneY) * 46}%, 0)`,
          opacity: Math.min(1, read().phoneY * 1.6),
        }}
      >
        {/* ===== iPhone ===== */}
        <div
          className="relative mx-auto w-[390px] max-w-full overflow-hidden bg-black shadow-[0_2px_6px_rgba(49,49,49,0.08),0_24px_60px_rgba(49,49,49,0.16)]"
          style={{
            aspectRatio: '390 / 844',
            borderRadius: '56px',
            padding: '11px',
          }}
        >
          <div
            className="relative flex h-full w-full flex-col overflow-hidden bg-white"
            style={{ borderRadius: '46px' }}
          >
            {/* Dynamic Island */}
            <div className="pointer-events-none absolute left-1/2 top-[9px] z-20 h-[32px] w-[112px] -translate-x-1/2 rounded-full bg-black" />

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
                  viewBox="0 0 16 12"
                  fill="none"
                  aria-hidden="true"
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
              {THREAD.slice(0, visible).map(entry => {
                if (entry.kind === 'reply') replyIndex += 1;
                switch (entry.kind) {
                  case 'voiceNote':
                    return (
                      <VoiceNote key={entry.id} duration={entry.duration} />
                    );
                  case 'transcript':
                    return <Transcript key={entry.id} text={entry.text} />;
                  case 'out':
                    return <Out key={entry.id} text={entry.text} />;
                  case 'receipt':
                    return <Receipt key={entry.id} text={entry.text} />;
                  case 'reply':
                    return (
                      <Reply
                        key={entry.id}
                        text={entry.text}
                        from={entry.from}
                        showFrom={replyIndex < attributed}
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
