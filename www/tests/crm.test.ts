import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCrmContact, ALLOWED_SOURCES } from '../lib/crm'

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('ALLOWED_SOURCES', () => {
  it('matches the spec allowlist', () => {
    expect(ALLOWED_SOURCES).toEqual([
      'g3d:family_intelligence',
      'g3d:family_intelligence:fundraising',
      'g3d:family_intelligence:fundraising-viewed',
    ])
  })
})

describe('createCrmContact', () => {
  it('POSTs a normalized email with the default source', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await createCrmContact('  A@B.COM ')
    expect(result).toEqual({ ok: true, status: 'created' })
    expect(fetchMock).toHaveBeenCalledOnce()
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body).toEqual({ email: 'a@b.com', sources: ['g3d:family_intelligence'] })
    expect(init.headers['X-Api-Key']).toBe('test-stacks-key')
  })

  it('rejects an unknown source before contacting the CRM', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const result = await createCrmContact('a@b.com', 'evil:source')
    expect(result).toEqual({ ok: false, status: 'rejected_source' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts an allowlisted source', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await createCrmContact('a@b.com', 'g3d:family_intelligence:fundraising')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(result).toEqual({ ok: true, status: 'created' })
    expect(body.sources).toEqual(['g3d:family_intelligence:fundraising'])
  })

  it('returns error status on HTTP failure without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })))
    const result = await createCrmContact('a@b.com')
    expect(result).toEqual({ ok: false, status: 'error' })
  })
})
