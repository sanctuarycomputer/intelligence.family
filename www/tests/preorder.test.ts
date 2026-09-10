import { describe, it, expect } from 'vitest';
import {
  FOUNDER_UNITS_DEFAULT_TOTAL,
  remainingUnits,
  readFounderUnits,
  parseSrc,
  resolvePreorderSource,
  completionCode,
  prolificCodes,
} from '../lib/preorder';

describe('remainingUnits', () => {
  it('subtracts reserved from total', () => {
    expect(remainingUnits(250, 33)).toBe(217);
  });

  it('never goes below zero', () => {
    expect(remainingUnits(250, 900)).toBe(0);
  });

  it('never goes above total', () => {
    expect(remainingUnits(250, -5)).toBe(250);
  });
});

describe('readFounderUnits', () => {
  it('defaults to 250 total and 0 reserved when env is empty', () => {
    expect(readFounderUnits({})).toEqual({
      total: FOUNDER_UNITS_DEFAULT_TOTAL,
      reserved: 0,
    });
  });

  it('parses integers from env', () => {
    expect(
      readFounderUnits({
        FOUNDER_UNITS_TOTAL: '300',
        FOUNDER_UNITS_RESERVED: '12',
      })
    ).toEqual({ total: 300, reserved: 12 });
  });

  it('treats non-numeric values as the default', () => {
    expect(
      readFounderUnits({
        FOUNDER_UNITS_TOTAL: 'lots',
        FOUNDER_UNITS_RESERVED: '',
      })
    ).toEqual({ total: 250, reserved: 0 });
  });

  it('treats negative values as the default', () => {
    expect(readFounderUnits({ FOUNDER_UNITS_RESERVED: '-4' })).toEqual({
      total: 250,
      reserved: 0,
    });
  });
});

describe('parseSrc', () => {
  it('recognizes prolific and ads', () => {
    expect(parseSrc('prolific')).toBe('prolific');
    expect(parseSrc('ads')).toBe('ads');
  });

  it('falls back to direct for anything else', () => {
    expect(parseSrc(undefined)).toBe('direct');
    expect(parseSrc('')).toBe('direct');
    expect(parseSrc('newsletter')).toBe('direct');
    expect(parseSrc(['ads', 'prolific'])).toBe('direct');
  });

  it('is case-insensitive', () => {
    expect(parseSrc('Prolific')).toBe('prolific');
  });
});

describe('resolvePreorderSource', () => {
  it('maps ads to the ads source', () => {
    expect(resolvePreorderSource('ads')).toBe(
      'g3d:family_intelligence:preorder:ads'
    );
  });

  it('maps prolific and unknown values to the plain preorder source', () => {
    expect(resolvePreorderSource('prolific')).toBe(
      'g3d:family_intelligence:preorder'
    );
    expect(resolvePreorderSource(undefined)).toBe(
      'g3d:family_intelligence:preorder'
    );
    expect(resolvePreorderSource('anything')).toBe(
      'g3d:family_intelligence:preorder'
    );
  });
});

describe('completionCode', () => {
  const env = {
    PROLIFIC_CODE_RESERVED: 'RES123',
    PROLIFIC_CODE_DECLINED: 'DEC456',
  };

  it('returns the reserved code for reserved', () => {
    expect(completionCode('reserved', env)).toBe('RES123');
  });

  it('returns the declined code for declined', () => {
    expect(completionCode('declined', env)).toBe('DEC456');
  });

  it('returns null when the code is unset or blank', () => {
    expect(completionCode('reserved', {})).toBeNull();
    expect(
      completionCode('declined', { PROLIFIC_CODE_DECLINED: '  ' })
    ).toBeNull();
  });
});

describe('prolificCodes', () => {
  const env = {
    PROLIFIC_CODE_RESERVED: 'RES1',
    PROLIFIC_CODE_DECLINED: 'DEC1',
  };

  it('returns both codes for prolific traffic', () => {
    expect(prolificCodes('prolific', env)).toEqual({
      reserved: 'RES1',
      declined: 'DEC1',
    });
  });

  it('returns nulls for ads and direct traffic even when codes are set', () => {
    expect(prolificCodes('ads', env)).toEqual({
      reserved: null,
      declined: null,
    });
    expect(prolificCodes('direct', env)).toEqual({
      reserved: null,
      declined: null,
    });
  });
});
