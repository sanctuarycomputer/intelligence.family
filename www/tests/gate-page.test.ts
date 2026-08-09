import { describe, it, expect } from 'vitest';
import { resolveViewedSource } from '../lib/gate-page';

describe('resolveViewedSource', () => {
  it('maps the opportunity slug to the opportunity viewed source', () => {
    expect(resolveViewedSource('opportunity')).toBe(
      'g3d:family_intelligence:opportunity-viewed'
    );
  });

  it('defaults to fundraising-viewed for null, unknown, and raw-source inputs', () => {
    expect(resolveViewedSource(null)).toBe(
      'g3d:family_intelligence:fundraising-viewed'
    );
    expect(resolveViewedSource('fundraising')).toBe(
      'g3d:family_intelligence:fundraising-viewed'
    );
    expect(resolveViewedSource('evil')).toBe(
      'g3d:family_intelligence:fundraising-viewed'
    );
    // A client may never smuggle a raw CRM source string through the param.
    expect(
      resolveViewedSource('g3d:family_intelligence:opportunity-viewed')
    ).toBe('g3d:family_intelligence:fundraising-viewed');
  });
});
