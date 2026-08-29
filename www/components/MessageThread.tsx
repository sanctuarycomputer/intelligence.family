import LeafIcon from '@/components/LeafIcon';

/**
 * A mock iMessage thread showing the device answering from the family's own
 * archive. Content follows the investor demo script's escalation: a recorded
 * story, a cross-source calendar answer, and an honest decline.
 *
 * The O'Hagans are the synthetic seed family from fam-api/fixtures/seeds.
 * Over SMS the real device strips citation markers and shows a single source
 * line, so each reply carries at most one, and the decline carries none.
 *
 * Frame is 390x844 (iPhone logical points, 19.5:9). Static and server
 * rendered: no client JS.
 */

const IN = '#E9E9EB';
const OUT = '#007AFF';

/* Deterministic pseudo-waveform so the bars look spoken, not generated. */
function bars(seed: number, count: number) {
  const out: number[] = [];
  let v = seed;
  for (let i = 0; i < count; i += 1) {
    v = (v * 1103515245 + 12345) % 2147483648;
    out.push(6 + ((v >>> 8) % 15));
  }
  return out;
}

function Waveform({ seed, color }: { seed: number; color: string }) {
  return (
    <span className="flex h-[22px] items-center gap-[2.5px]">
      {bars(seed, 26).map((h, i) => (
        <span
          key={i}
          style={{ height: `${h}px`, background: color }}
          className="w-[2.5px] rounded-full"
        />
      ))}
    </span>
  );
}

function PlayGlyph({ color }: { color: string }) {
  return (
    <svg
      width="9"
      height="11"
      viewBox="0 0 9 11"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 0.7v9.6c0 .5.6.9 1 .6l8-4.8c.4-.2.4-.8 0-1L1 .1C.6-.2 0 .2 0 .7Z"
        fill={color}
      />
    </svg>
  );
}

export default function MessageThread() {
  return (
    <div className="flex w-full flex-1 flex-col items-center lg:items-start lg:pl-[90px]">
      <div className="relative">
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
            <div className="flex flex-1 flex-col gap-[4px] overflow-hidden px-[13px] pb-2 pt-[6px]">
              {/* 1 — asked by voice from a waiting room, with Apple's transcription */}
              <div className="flex flex-col items-end gap-[3px]">
                <div
                  className="flex max-w-[86%] items-center gap-[9px] rounded-[19px] rounded-br-[6px] px-[13px] py-[9px]"
                  style={{ background: OUT }}
                >
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-white/95">
                    <PlayGlyph color={OUT} />
                  </span>
                  <Waveform seed={7} color="rgba(255,255,255,0.85)" />
                  <span className="shrink-0 text-[11px] tabular-nums text-white/80">
                    0:06
                  </span>
                </div>
                <p className="max-w-[86%] text-right text-[12px] leading-[1.3] text-black/45">
                  &ldquo;At the doctor. Do we have family history of
                  glaucoma?&rdquo;
                </p>
              </div>

              <div
                className="max-w-[86%] self-start rounded-[19px] rounded-bl-[6px] px-[13px] py-[7px]"
                style={{ background: IN }}
              >
                <p className="text-[14px] leading-[1.32] text-black">
                  Yes. Des has glaucoma in the left eye and he&rsquo;s on drops
                  for it. It came up at his eye review with Mr Deasy.
                </p>
                <p className="mt-[6px] text-[11.5px] leading-[1.25] text-black/45">
                  from &ldquo;GP summary, Des O&rsquo;Hagan&rdquo;
                </p>
              </div>

              {/* 2 — answered with the grandmother's own recording */}
              <div
                className="max-w-[86%] self-end rounded-[19px] rounded-br-[6px] px-[13px] py-[7px]"
                style={{ background: OUT }}
              >
                <p className="text-[14px] leading-[1.32] text-white">
                  Ali is asking how Granny &amp; Grandad met?
                </p>
              </div>

              <div
                className="max-w-[86%] self-start rounded-[19px] rounded-bl-[6px] px-[13px] py-[7px]"
                style={{ background: IN }}
              >
                <p className="text-[14px] leading-[1.32] text-black">
                  At the Crystal Ballroom in Dublin, in 1971. She turned him
                  down twice before she danced with him on the third ask.
                </p>
                <p className="mt-[6px] text-[11.5px] leading-[1.25] text-black/45">
                  from &ldquo;M&aacute;ire at the Crystal Ballroom&rdquo;
                </p>
              </div>

              <div
                className="flex max-w-[86%] items-center gap-[9px] self-start rounded-[19px] rounded-bl-[6px] px-[13px] py-[9px]"
                style={{ background: IN }}
              >
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-black/[0.55]">
                  <PlayGlyph color="#fff" />
                </span>
                <span className="flex flex-col gap-[3px]">
                  <Waveform seed={21} color="rgba(0,0,0,0.45)" />
                  <span className="text-[10.5px] leading-none text-black/45">
                    M&aacute;ire, 0:14
                  </span>
                </span>
              </div>

              {/* 3 — cross-source: the answer names whose calendar it came from */}
              <div className="flex flex-col items-end gap-[3px]">
                <div
                  className="max-w-[86%] rounded-[19px] rounded-br-[6px] px-[13px] py-[7px]"
                  style={{ background: OUT }}
                >
                  <p className="text-[14px] leading-[1.32] text-white">
                    When is the kids&rsquo; next parent teacher interview?
                  </p>
                </div>
                <p className="pr-[3px] text-[10.5px] leading-none text-black/40">
                  Delivered to the box in your kitchen
                </p>
              </div>

              <div
                className="max-w-[86%] self-start rounded-[19px] rounded-bl-[6px] px-[13px] py-[7px]"
                style={{ background: IN }}
              >
                <p className="text-[14px] leading-[1.32] text-black">
                  From your wife&rsquo;s Google Calendar: Thursday 4:30, in the
                  school hall.
                </p>
              </div>
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
