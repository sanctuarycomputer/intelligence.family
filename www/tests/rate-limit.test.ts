import { describe, it, expect, beforeEach } from 'vitest'
import { consume, _resetForTests, _bucketCount } from '../lib/rate-limit'

beforeEach(() => _resetForTests())

describe('consume', () => {
  it('allows up to the limit within the window', () => {
    expect(consume('1.2.3.4', 3, 1000, 0)).toBe(true)
    expect(consume('1.2.3.4', 3, 1000, 10)).toBe(true)
    expect(consume('1.2.3.4', 3, 1000, 20)).toBe(true)
    expect(consume('1.2.3.4', 3, 1000, 30)).toBe(false)
  })
  it('resets after the window', () => {
    expect(consume('1.2.3.4', 2, 1000, 0)).toBe(true)
    expect(consume('1.2.3.4', 2, 1000, 10)).toBe(true)
    expect(consume('1.2.3.4', 2, 1000, 1001)).toBe(true)
  })
  it('tracks keys independently', () => {
    expect(consume('a', 1, 1000, 0)).toBe(true)
    expect(consume('b', 1, 1000, 0)).toBe(true)
    expect(consume('a', 1, 1000, 1)).toBe(false)
  })
  it('evicts expired buckets instead of growing unbounded', () => {
    consume('a', 1, 1000, 0)
    consume('b', 1, 1000, 0)
    consume('c', 1, 1000, 0)
    expect(_bucketCount()).toBe(3)
    // A later call past the sweep interval prunes the stale keys.
    consume('d', 1, 1000, 60_000)
    expect(_bucketCount()).toBe(1)
  })
  it('does not evict buckets that are still within their own window', () => {
    consume('long', 5, 120_000, 0) // 2-minute window
    consume('trigger', 1, 1000, 60_000) // fires a sweep but 'long' is still live
    expect(_bucketCount()).toBe(2)
  })
})
