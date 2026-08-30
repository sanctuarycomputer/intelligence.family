/**
 * Draws the device's lock screen into a canvas, for use as a three.js
 * CanvasTexture. This is the same design as components/DeviceScreen.tsx (the
 * flat CSS version) and the same source: the remote UI in family-book
 * (fam-api/app/static/remote — markup from js/app.js's gate, styling and drift
 * timings from css/apps.css).
 *
 * Canvas rather than DOM because the screen has to live inside the WebGL scene:
 * that way the depth buffer occludes it with the bezel for free, and it stays
 * correct through any camera move.
 */

import { drawCard, type CardState } from './screenCards';

export const SCREEN_W = 1280;
export const SCREEN_H = 800;

const PAGE = '#d5dbd1'; // remote --page
const INK = '#000';
const CHIP_BG = '#c9d8c2'; // remote --navbar-band
const CHIP_INK = '#1e1e1e'; // remote --ink
const SAGE_INK = '#54663a'; // remote --sage-ink
const PILL_BG = '#b8c6b0'; // remote --bubble-user, LockButton fill
const PILL_BORDER = '#d8e4d0'; // remote --pill-border
const PILL_SHADOW = 'rgba(134, 160, 120, 0.5)'; // remote --shadow-sage-50

/* Both spacings are 1.2x the originals (left 80 -> 96, title-to-subtitle
   80 -> 96, subtitle-to-chip 42 -> 50). The top inset is larger than the left
   in texture space because the panel tilts away from the camera: equal texture
   distances foreshorten vertically, so INSET_TOP is tuned to READ as equal to
   INSET_LEFT on screen. */
/** How far the title block fades back while an artifact is up. */
const TITLE_FADED_TO = 0.2;

const INSET_LEFT = 96;
const INSET_TOP = 150;
const GAP_TITLE_SUB = 96;
const GAP_SUB_CHIP = 50;

/** Path endpoints and periods from css/apps.css, scaled to this surface. */
const LEAVES = [
  {
    from: [128, 560],
    to: [1101, 32],
    period: 23,
    delay: 0,
    w: 64,
    h: 64,
    wob: 4,
    wobPhase: 0,
  },
  {
    from: [205, 688],
    to: [1178, 128],
    period: 29.44,
    delay: -9.72,
    w: 80,
    h: 64,
    wob: 3.25,
    wobPhase: -2.1,
  },
  {
    from: [77, 432],
    to: [1024, -32],
    period: 18.4,
    delay: -12.14,
    w: 83,
    h: 51,
    wob: 4.75,
    wobPhase: -6.3,
  },
];

/** 0 at both path ends, two pulses per traversal — matches ds-breathe. */
function breathe(t: number) {
  return 0.65 * (0.5 - 0.5 * Math.cos(4 * Math.PI * t));
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export type ScreenAssets = {
  decoration: HTMLImageElement;
  leaves: HTMLImageElement[];
  heart: HTMLImageElement;
  mic: HTMLImageElement;
};

export async function loadScreenAssets(): Promise<ScreenAssets> {
  const [decoration, l1, l2, l3, heart, mic] = await Promise.all([
    loadImage('/home/screen/cover-decoration.png'),
    loadImage('/home/screen/cover-leaf-1.png'),
    loadImage('/home/screen/cover-leaf-2.png'),
    loadImage('/home/screen/cover-leaf-3.png'),
    loadImage('/home/screen/heart.png'),
    loadImage('/home/screen/microphone.png'),
  ]);
  // The faces are already declared in globals.css; make sure they're resident
  // before the first paint or the title lands in a fallback serif.
  try {
    await Promise.all([
      document.fonts.load("700 92px 'Windsor Pro'"),
      document.fonts.load("400 56px 'Roobert'"),
      document.fonts.load("500 24px 'Roobert'"),
      document.fonts.load("500 26px 'Roobert'"),
    ]);
  } catch {
    /* fonts are a nicety here, never a blocker */
  }
  return { decoration, leaves: [l1, l2, l3], heart, mic };
}

export type ScreenState = {
  /** Seconds since the scene started. */
  time: number;
  /** Shows the processing indicator, to pair with the phone's typing bubble. */
  thinking?: boolean;
  /** Freezes the leaves for prefers-reduced-motion. */
  still?: boolean;
  /** The artifact the device is showing, if any. Drawn over the lock screen. */
  card?: CardState | null;
};

export function drawScreen(
  ctx: CanvasRenderingContext2D,
  a: ScreenAssets,
  { time, thinking = false, still = false, card = null }: ScreenState
) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = PAGE;
  ctx.fillRect(0, 0, W, H);

  // Cloud/hill line art, bottom right.
  const dw = 700;
  const dh = dw * (a.decoration.height / a.decoration.width);
  ctx.drawImage(a.decoration, W - dw, H - dh, dw, dh);

  // Leaves drifting up the diagonal, behind the text.
  LEAVES.forEach((L, i) => {
    const img = a.leaves[i];
    const t = still ? 0.25 : ((((time - L.delay) / L.period) % 1) + 1) % 1;
    const alpha = still ? 0.5 : breathe(t);
    if (alpha <= 0.001) return;
    const x = L.from[0] + (L.to[0] - L.from[0]) * t;
    const y = L.from[1] + (L.to[1] - L.from[1]) * t;
    const wob = still
      ? 0
      : Math.sin((2 * Math.PI * (time - L.wobPhase)) / (L.wob * 2)) * 0.09;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x + L.w / 2, y + L.h / 2);
    ctx.rotate(wob);
    ctx.drawImage(img, -L.w / 2, -L.h / 2, L.w, L.h);
    ctx.restore();
  });

  // Title block — lock_screen.slint's copy, hardcoded there too.
  // The top inset matches the left inset so the block sits equidistant from
  // both edges. Measured from the title's real ascent rather than an assumed
  // cap height, so the optical gap is right whatever the face metrics are.
  //
  // It fades back as an artifact rises, in step with the card rather than on a
  // timer of its own. Down to a fifth rather than away: the card covers the
  // lower two thirds, and whose device this is should still be legible above
  // it, just not competing with what it is showing you.
  ctx.save();
  ctx.globalAlpha = 1 - (card?.y ?? 0) * (1 - TITLE_FADED_TO);
  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  ctx.font = "700 92px 'Windsor Pro', Georgia, serif";
  const title = 'The O’Hagans';
  const ascent = ctx.measureText(title).actualBoundingBoxAscent || 66;
  const titleBaseline = INSET_TOP + ascent;
  ctx.fillText(title, INSET_LEFT, titleBaseline);

  ctx.font = "400 56px 'Roobert', sans-serif";
  const subBaseline = titleBaseline + GAP_TITLE_SUB;
  ctx.fillText('Family Book', INSET_LEFT, subBaseline);
  ctx.restore();

  // Activity chip.
  const chipX = INSET_LEFT;
  const chipY = subBaseline + GAP_SUB_CHIP;
  const chipH = 62;
  ctx.font = "500 24px 'Roobert', sans-serif";
  const label = '2 Stories just added by Toni';
  const chipW = 18 + 34 + 14 + ctx.measureText(label).width + 28;
  // While the box is working, the chip's row carries the indicator instead of
  // the activity line. Same slot, so the screen's composition never jumps.
  if (thinking) {
    drawThinking(ctx, chipX, chipY + chipH / 2, time);
  } else {
    ctx.fillStyle = CHIP_BG;
    ctx.beginPath();
    ctx.roundRect(chipX, chipY, chipW, chipH, chipH / 2);
    ctx.fill();
    ctx.drawImage(a.heart, chipX + 18, chipY + (chipH - 34) / 2, 34, 34);
    ctx.fillStyle = CHIP_INK;
    ctx.fillText(label, chipX + 18 + 34 + 14, chipY + chipH / 2 + 8);
  }

  // Ask pill, bottom right — launcher.slint's `ask-btn` (label "Ask" beside a
  // microphone), at twice the device's own size so it holds up at the distance
  // the scene views the screen from.
  //
  // Its right edge mirrors the title's left inset, so the two blocks bookend
  // the screen. The bottom gap is half the title's top one: the pill is a
  // control rather than a block of copy, and it wants to sit nearer its edge.
  const pillH = 170;
  const pillR = pillH / 2;
  const micSize = 120;
  const padL = 68;
  const padR = 32;
  const gap = 24;
  ctx.font = "500 52px 'Roobert', sans-serif";
  const askLabel = 'Ask';
  const pillW = padL + ctx.measureText(askLabel).width + gap + micSize + padR;
  const pillX = W - INSET_LEFT - pillW;
  const pillY = H - INSET_TOP / 2 - pillH;

  ctx.save();
  ctx.shadowColor = PILL_SHADOW;
  ctx.shadowBlur = 68;
  ctx.fillStyle = PILL_BG;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = PILL_BORDER;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
  ctx.stroke();

  // Label sits LEFT of the glyph: the device's mic nearly fills its pill
  // rather than sitting in it as a small icon.
  ctx.fillStyle = CHIP_INK;
  ctx.fillText(askLabel, pillX + padL, pillY + pillH / 2 + 18);
  ctx.drawImage(
    a.mic,
    pillX + pillW - padR - micSize,
    pillY + (pillH - micSize) / 2,
    micSize,
    micSize
  );

  // The artifact, over everything. It slides up from the bottom edge, so it
  // covers the Ask pill on the way and that is the intent: while the box is
  // showing you a record, it is not waiting for another question.
  drawCard(ctx, card);
}

/** Three dots, in sync with the phone's typing bubble. */
function drawThinking(
  ctx: CanvasRenderingContext2D,
  x: number,
  centreY: number,
  time: number
) {
  ctx.save();
  for (let i = 0; i < 3; i += 1) {
    const p = time / 1.2 - i * 0.15;
    const k = 0.5 - 0.5 * Math.cos(2 * Math.PI * (((p % 1) + 1) % 1));
    ctx.globalAlpha = 0.28 + 0.72 * k;
    ctx.fillStyle = SAGE_INK;
    ctx.beginPath();
    ctx.arc(x + 14 + i * 34, centreY - k * 6, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
