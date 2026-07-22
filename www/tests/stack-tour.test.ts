import { describe, it, expect } from 'vitest';
import {
  TOUR_BEATS,
  BEAT_COUNT,
  beatCenter,
  beatIndexAt,
  beatWindow,
  openFactor,
  sheetState,
  slabOpacity,
  calloutPhase,
  silhouetteOpacity,
  mirrorArtOpacity,
  fotaArtOpacity,
  SHEET_COUNT,
  SHEET_SLOT_Y,
  SLAB_Y,
  tourCameraPose,
  anchorWorld,
  TOUR_CALLOUTS,
} from '@/components/stack-tour/stackTour';

describe('tour beats', () => {
  it('has ten beats labelled LAYER 01..LAYER 10 in order', () => {
    expect(TOUR_BEATS).toHaveLength(BEAT_COUNT);
    TOUR_BEATS.forEach((b, i) => {
      expect(b.label).toBe(`LAYER ${String(i + 1).padStart(2, '0')}`);
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.paragraphs.length).toBeGreaterThan(0);
    });
  });

  it('centres beat i at (i+1)/10, leaving the intro below 0.1, and tiles windows', () => {
    expect(beatCenter(0)).toBe(0.1);
    expect(beatCenter(9)).toBe(1);
    // Beat 0's window opens at 0 so the intro region still resolves to it.
    expect(beatWindow(0).start).toBe(0);
    expect(beatWindow(9).end).toBe(1);
    for (let i = 1; i < BEAT_COUNT; i++) {
      expect(beatWindow(i).start).toBeCloseTo(beatWindow(i - 1).end, 10);
    }
  });

  it('maps beat centres back to their beat index', () => {
    for (let i = 0; i < BEAT_COUNT; i++) {
      expect(beatIndexAt(beatCenter(i))).toBe(i);
    }
    expect(beatIndexAt(-1)).toBe(0);
    expect(beatIndexAt(2)).toBe(9);
  });
});

describe('motion tracks', () => {
  it('opens for beats 02-07 and closes again by beat 08', () => {
    expect(openFactor(beatCenter(0))).toBe(0);
    for (let i = 1; i <= 6; i++) expect(openFactor(beatCenter(i))).toBe(1);
    expect(openFactor(beatCenter(7))).toBe(0);
    expect(openFactor(1)).toBe(0);
  });

  it('materializes each sheet at its own beat and not before', () => {
    for (let s = 0; s < SHEET_COUNT; s++) {
      const beat = s + 1; // sheet s belongs to beat index s+1 (LAYER 02..05)
      expect(sheetState(s, beatCenter(beat)).opacity).toBe(1);
      expect(sheetState(s, beatCenter(beat)).y).toBeCloseTo(SHEET_SLOT_Y[s], 6);
      expect(sheetState(s, beatCenter(beat - 1)).opacity).toBe(0);
    }
  });

  it('earlier sheets dim once their beat has passed', () => {
    const atCrypto = sheetState(0, beatCenter(4));
    expect(atCrypto.opacity).toBeGreaterThan(0);
    expect(atCrypto.opacity).toBeLessThan(1);
  });

  it('consolidates sheets into the slab at beat 06 and dissipates by 07', () => {
    const osT = beatCenter(5);
    for (let s = 0; s < SHEET_COUNT; s++) {
      expect(sheetState(s, osT).y).toBeCloseTo(SLAB_Y, 6);
      expect(sheetState(s, osT).opacity).toBe(0);
    }
    expect(slabOpacity(osT)).toBe(1);
    expect(slabOpacity(beatCenter(6))).toBe(0);
    for (let s = 0; s < SHEET_COUNT; s++) {
      expect(sheetState(s, beatCenter(6)).opacity).toBe(0);
    }
  });

  it('callout phases peak inside their own beat and are dark outside', () => {
    for (let i = 0; i < BEAT_COUNT; i++) {
      expect(calloutPhase(i, beatCenter(i)).opacity).toBe(1);
      expect(calloutPhase(i, beatCenter(i)).draw).toBe(1);
      if (i > 0) expect(calloutPhase(i, beatCenter(i - 1)).opacity).toBe(0);
      if (i < 9) expect(calloutPhase(i, beatCenter(i + 1)).opacity).toBe(0);
    }
  });

  it('static art tracks belong to their beats', () => {
    expect(silhouetteOpacity(beatCenter(7))).toBe(1);
    expect(silhouetteOpacity(beatCenter(6))).toBe(0);
    expect(silhouetteOpacity(beatCenter(8))).toBe(0);
    expect(mirrorArtOpacity(beatCenter(8))).toBe(1);
    expect(mirrorArtOpacity(beatCenter(7))).toBe(0);
    expect(fotaArtOpacity(beatCenter(9))).toBe(1);
    expect(fotaArtOpacity(beatCenter(8))).toBe(0);
  });
});

describe('camera and anchors', () => {
  it('returns finite poses with no cuts anywhere', () => {
    let prev = tourCameraPose(0);
    for (let t = 0.001; t <= 1.0001; t += 0.001) {
      const pose = tourCameraPose(Math.min(1, t));
      for (const v of [...pose.position, ...pose.target]) {
        expect(Number.isFinite(v)).toBe(true);
      }
      const jump = Math.hypot(
        pose.position[0] - prev.position[0],
        pose.position[1] - prev.position[1],
        pose.position[2] - prev.position[2]
      );
      expect(jump).toBeLessThan(0.02);
      prev = pose;
    }
  });

  it('dives closest at the TEE beat', () => {
    const dist = (t: number) => {
      const p = tourCameraPose(t);
      return Math.hypot(
        p.position[0] - p.target[0],
        p.position[1] - p.target[1],
        p.position[2] - p.target[2]
      );
    };
    const teeDist = dist(beatCenter(6));
    for (const i of [0, 1, 2, 3, 4, 5, 7, 8, 9]) {
      expect(teeDist).toBeLessThan(dist(beatCenter(i)));
    }
  });

  it('anchors move with the open factor and sheet tracks', () => {
    // Display carries its explode offset when open (beat 02) and returns
    // home when closed (beat 08).
    const open = anchorWorld('display', beatCenter(1));
    const closed = anchorWorld('display', beatCenter(7));
    expect(open[2]).toBeCloseTo(0.1158 + 0.1, 3);
    expect(closed[2]).toBeCloseTo(0.1158, 3);
    // Sheet anchors ride their slots (via the constants, so slot tuning in
    // the visual pass cannot silently break this).
    expect(anchorWorld('sheet0', beatCenter(1))[1]).toBeCloseTo(
      SHEET_SLOT_Y[0],
      6
    );
    expect(anchorWorld('slab', beatCenter(5))[1]).toBeCloseTo(SLAB_Y, 6);
  });

  it('every callout points at a defined anchor within a valid beat', () => {
    for (const c of TOUR_CALLOUTS) {
      expect(c.beat).toBeGreaterThanOrEqual(0);
      expect(c.beat).toBeLessThan(BEAT_COUNT);
      expect(c.label.length).toBeGreaterThan(0);
      expect(() => anchorWorld(c.anchor, 0.5)).not.toThrow();
    }
  });
});
