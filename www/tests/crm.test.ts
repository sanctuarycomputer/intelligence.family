import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createCrmContact,
  ALLOWED_SOURCES,
  OPPORTUNITY_GATE_SOURCE,
  OPPORTUNITY_VIEWED_SOURCE,
} from '../lib/crm';

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ALLOWED_SOURCES', () => {
  it('matches the spec allowlist', () => {
    expect(ALLOWED_SOURCES).toEqual([
      'g3d:family_intelligence',
      'g3d:family_intelligence:fundraising',
      'g3d:family_intelligence:fundraising-viewed',
      'g3d:family_intelligence:opportunity',
      'g3d:family_intelligence:opportunity-viewed',
    ]);
  });
});

describe('createCrmContact', () => {
  it('POSTs a normalized email with the default source', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await createCrmContact('  A@B.COM ');
    expect(result).toEqual({ ok: true, status: 'created' });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      email: 'a@b.com',
      sources: ['g3d:family_intelligence'],
    });
    expect(init.headers['X-Api-Key']).toBe('test-stacks-key');
  });

  it('rejects an unknown source before contacting the CRM', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await createCrmContact('a@b.com', 'evil:source');
    expect(result).toEqual({ ok: false, status: 'rejected_source' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts an allowlisted source', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await createCrmContact(
      'a@b.com',
      'g3d:family_intelligence:fundraising'
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(result).toEqual({ ok: true, status: 'created' });
    expect(body.sources).toEqual(['g3d:family_intelligence:fundraising']);
  });

  it('returns error status on HTTP failure without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('boom', { status: 500 }))
    );
    const result = await createCrmContact('a@b.com');
    expect(result).toEqual({ ok: false, status: 'error' });
  });

  it('aborts a hung CRM fetch after 3s and returns error without hanging', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new Error('aborted'))
          );
        })
    );
    vi.stubGlobal('fetch', fetchMock);
    const pending = createCrmContact('a@b.com');
    await vi.advanceTimersByTimeAsync(3000);
    const result = await pending;
    expect(result).toEqual({ ok: false, status: 'error' });
  });
});

describe('opportunity CRM sources', () => {
  it('exports the opportunity gate and viewed sources', () => {
    expect(OPPORTUNITY_GATE_SOURCE).toBe('g3d:family_intelligence:opportunity');
    expect(OPPORTUNITY_VIEWED_SOURCE).toBe(
      'g3d:family_intelligence:opportunity-viewed'
    );
  });

  it('allowlists both so createCrmContact will not reject them', () => {
    expect(ALLOWED_SOURCES).toContain('g3d:family_intelligence:opportunity');
    expect(ALLOWED_SOURCES).toContain(
      'g3d:family_intelligence:opportunity-viewed'
    );
  });
});
