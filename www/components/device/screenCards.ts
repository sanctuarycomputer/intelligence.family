/**
 * The artifacts the device shows while it answers.
 *
 * Each card is what the box is looking at, drawn onto the same canvas as the
 * lock screen and slid up from the bottom edge. They are the demo's evidence:
 * the phone claims an answer came from the family's own records, and this is
 * the record.
 *
 * Sizes are in the screen's own pixel space, the same space screenTexture.ts
 * lays the lock screen out in.
 */

import type { CardKind } from '../demo/timeline';

const CARD_BG = '#eef1ec';
const CARD_EDGE = 'rgba(84, 102, 58, 0.22)';
const CARD_SHADOW = 'rgba(60, 76, 44, 0.28)';
const INK = '#1a1a1a';
const MUTED = 'rgba(26, 26, 26, 0.52)';
const SAGE = '#54663a';

/** The card occupies the lower part of the screen, inset from both edges. */
const INSET_X = 96;
const HEIGHT_FRACTION = 0.6;
const RADIUS = 26;

export type CardState = {
  kind: CardKind;
  /** 0 = fully below the screen, 1 = settled. */
  y: number;
  /** The email card's header flips once it has sent. */
  sent: boolean;
  /** Seconds since play, for the audio card's playhead. */
  time: number;
};

type Box = { x: number; y: number; w: number; h: number };

function cardBox(W: number, H: number, y: number): Box {
  const w = W - INSET_X * 2;
  const h = Math.round(H * HEIGHT_FRACTION);
  // Rises from just below the bottom edge to sitting on it.
  const top = H - h * y;
  return { x: INSET_X, y: top, w, h };
}

function roundRect(ctx: CanvasRenderingContext2D, b: Box, r: number): void {
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, [r, r, 0, 0]);
}

/** Truncates to fit, with an ellipsis, so long copy can never overrun a card. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > max) {
    cut = cut.slice(0, -1);
  }
  return `${cut}…`;
}

/** Wraps to at most `maxLines`, truncating the last one. */
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  max: number,
  maxLines: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= max) {
      line = next;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    lines[maxLines - 1] = fit(ctx, lines[maxLines - 1], max);
  }
  return lines;
}

function header(
  ctx: CanvasRenderingContext2D,
  b: Box,
  left: string,
  right: string
): number {
  const top = b.y + 46;
  ctx.font = "600 26px 'Roobert', sans-serif";
  ctx.fillStyle = SAGE;
  ctx.fillText(left.toUpperCase(), b.x + 44, top);

  ctx.textAlign = 'right';
  ctx.fillStyle = MUTED;
  ctx.fillText(right, b.x + b.w - 44, top);
  ctx.textAlign = 'left';

  // Rule under the header.
  ctx.strokeStyle = CARD_EDGE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x + 44, top + 24);
  ctx.lineTo(b.x + b.w - 44, top + 24);
  ctx.stroke();

  return top + 78;
}

function drawRecord(ctx: CanvasRenderingContext2D, b: Box) {
  let y = header(ctx, b, 'GP summary', 'Des O’Hagan');
  const max = b.w - 88;

  ctx.fillStyle = INK;
  ctx.font = "500 40px 'Roobert', sans-serif";
  ctx.fillText(
    fit(ctx, 'Primary open-angle glaucoma, left eye', max),
    b.x + 44,
    y
  );

  y += 52;
  ctx.font = "400 32px 'Roobert', sans-serif";
  ctx.fillStyle = 'rgba(26, 26, 26, 0.78)';
  ctx.fillText(fit(ctx, 'Latanoprost 0.005%, nightly', max), b.x + 44, y);

  y += 54;
  ctx.font = "400 26px 'Roobert', sans-serif";
  ctx.fillStyle = MUTED;
  ctx.fillText(
    fit(ctx, 'Reviewed by Mr Deasy · 14 Mar 2024', max),
    b.x + 44,
    y
  );
}

function drawAudio(ctx: CanvasRenderingContext2D, b: Box, time: number) {
  let y = header(ctx, b, 'Recording', 'Máire O’Hagan');
  const max = b.w - 88;

  ctx.fillStyle = MUTED;
  ctx.font = "400 26px 'Roobert', sans-serif";
  ctx.fillText(
    fit(ctx, 'Crystal Ballroom · 12 Feb 2019 · 0:14', max),
    b.x + 44,
    y
  );

  // Waveform. Deterministic from the bar index so it never flickers between
  // frames, with a playhead that advances while the card is up.
  y += 46;
  const bars = 54;
  const gap = max / bars;
  const head = ((time * 0.42) % 1) * bars;
  for (let i = 0; i < bars; i += 1) {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const n = seed - Math.floor(seed);
    const h = 12 + n * 62;
    ctx.fillStyle = i <= head ? SAGE : 'rgba(84, 102, 58, 0.28)';
    ctx.beginPath();
    ctx.roundRect(b.x + 44 + i * gap, y + (74 - h) / 2, gap * 0.45, h, 4);
    ctx.fill();
  }
}

function drawEmail(ctx: CanvasRenderingContext2D, b: Box, sent: boolean) {
  let y = header(ctx, b, sent ? 'Sent · 9:41' : 'New message', 'Gmail');
  const max = b.w - 88;
  const labelX = b.x + 44;
  const valueX = b.x + 44 + 110;

  const row = (label: string, value: string) => {
    ctx.font = "400 26px 'Roobert', sans-serif";
    ctx.fillStyle = MUTED;
    ctx.fillText(label, labelX, y);
    ctx.font = "500 30px 'Roobert', sans-serif";
    ctx.fillStyle = INK;
    ctx.fillText(fit(ctx, value, max - 110), valueX, y);
    y += 48;
  };

  row('To', 'Ms Boland, Mr Kavanagh');
  row('Subject', 'Parent-teacher meeting');

  y += 10;
  ctx.font = "400 30px 'Roobert', sans-serif";
  ctx.fillStyle = 'rgba(26, 26, 26, 0.78)';
  const body = wrap(
    ctx,
    "Hi both, when's the next parent-teacher meeting for Ali and Tom? Thanks, Toni",
    max,
    2
  );
  for (const line of body) {
    ctx.fillText(line, labelX, y);
    y += 40;
  }
}

/**
 * Draws the current artifact over the lock screen. A `y` of 0 draws nothing,
 * so the caller does not have to special-case the gaps between exchanges.
 */
export function drawCard(
  ctx: CanvasRenderingContext2D,
  card: CardState | null
): void {
  if (!card || card.y <= 0.001) return;

  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const b = cardBox(W, H, card.y);

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  ctx.shadowColor = CARD_SHADOW;
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = -8;
  ctx.fillStyle = CARD_BG;
  roundRect(ctx, b, RADIUS);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = CARD_EDGE;
  ctx.lineWidth = 2;
  roundRect(ctx, b, RADIUS);
  ctx.stroke();

  // Clip so a card still rising cannot draw its contents past its own top edge.
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, [RADIUS, RADIUS, 0, 0]);
  ctx.clip();

  if (card.kind === 'record') drawRecord(ctx, b);
  else if (card.kind === 'audio') drawAudio(ctx, b, card.time);
  else drawEmail(ctx, b, card.sent);

  ctx.restore();
}
