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

  it('centres beat i at i/9 and tiles windows without gaps', () => {
    expect(beatCenter(0)).toBe(0);
    expect(beatCenter(9)).toBe(1);
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
