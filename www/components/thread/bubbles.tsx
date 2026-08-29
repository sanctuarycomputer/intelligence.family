/**
 * The iMessage bubbles, one component per kind of thing the thread can hold.
 *
 * Split out of MessageThread so the thread can be staged: the demo reveals
 * entries one at a time, which needs each entry to be a thing that can be
 * rendered on its own rather than a run of hand-written markup.
 *
 * Frame is 390x844 (iPhone logical points, 19.5:9), so the sizes here are in
 * iOS points and deliberately literal.
 */

export const IN = '#E9E9EB';
export const OUT = '#007AFF';

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

export function Waveform({ seed, color }: { seed: number; color: string }) {
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

export function PlayGlyph({ color }: { color: string }) {
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

/** Wraps every entry so they all arrive the same way. */
export function Entry({ children }: { children: React.ReactNode }) {
  return <div className="thread-entry">{children}</div>;
}

export function VoiceNote({ duration }: { duration: string }) {
  return (
    <Entry>
      <div className="flex flex-col items-end gap-[3px]">
        <div
          className="flex max-w-[86%] items-center gap-[9px] rounded-[19px] rounded-br-[6px] px-[13px] py-[9px]"
          style={{ background: OUT }}
        >
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-white/95">
            <PlayGlyph color={OUT} />
          </span>
          <Waveform seed={7} color="rgba(255,255,255,0.95)" />
          <span className="shrink-0 text-[11px] tabular-nums text-white/80">
            {duration}
          </span>
        </div>
      </div>
    </Entry>
  );
}

/** Apple's transcription, right-aligned under the note it transcribes. */
export function Transcript({ text }: { text: string }) {
  return (
    <Entry>
      <p className="ml-auto max-w-[86%] text-right text-[12px] leading-[1.3] text-black/45">
        &ldquo;{text}&rdquo;
      </p>
    </Entry>
  );
}

export function Out({ text }: { text: string }) {
  return (
    <Entry>
      <div
        className="ml-auto max-w-[86%] rounded-[19px] rounded-br-[6px] px-[13px] py-[8px]"
        style={{ background: OUT }}
      >
        <p className="text-[14px] leading-[1.32] text-white">{text}</p>
      </div>
    </Entry>
  );
}

export function Reply({
  text,
  attribution,
  attributionKind,
  showAttribution,
}: {
  text: string;
  attribution: string;
  attributionKind: 'source' | 'action';
  showAttribution: boolean;
}) {
  return (
    <Entry>
      <div
        className="mr-auto max-w-[86%] rounded-[19px] rounded-bl-[6px] px-[13px] py-[8px]"
        style={{ background: IN }}
      >
        <p className="text-[14px] leading-[1.32] text-black">{text}</p>
        {showAttribution ? (
          <p className="mt-[6px] text-[11.5px] leading-[1.25] text-black/45">
            {attributionKind === 'source' ? (
              <>from &ldquo;{attribution}&rdquo;</>
            ) : (
              attribution
            )}
          </p>
        ) : null}
      </div>
    </Entry>
  );
}

export function AudioSnippet({
  name,
  duration,
}: {
  name: string;
  duration: string;
}) {
  return (
    <Entry>
      <div
        className="mr-auto flex max-w-[86%] items-center gap-[9px] rounded-[19px] rounded-bl-[6px] px-[13px] py-[8px]"
        style={{ background: IN }}
      >
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-black/[0.55]">
          <PlayGlyph color="#fff" />
        </span>
        <span className="flex flex-col gap-[2px]">
          <Waveform seed={31} color="rgba(0,0,0,0.42)" />
          <span className="text-[10.5px] leading-none text-black/45">
            {name}, {duration}
          </span>
        </span>
      </div>
    </Entry>
  );
}

/** The three dots, paired with the device's own thinking indicator. */
export function Typing() {
  return (
    <div
      className="mr-auto flex w-[62px] items-center justify-center gap-[5px] rounded-[19px] rounded-bl-[6px] py-[11px]"
      style={{ background: IN }}
      aria-label="Family Intelligence is replying"
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="thread-typing-dot"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}
