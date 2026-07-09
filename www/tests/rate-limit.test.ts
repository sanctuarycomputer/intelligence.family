import { describe, it, expect, beforeEach } from 'vitest'
import { consume, _resetForTests } from '../lib/rate-limit'

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
})
