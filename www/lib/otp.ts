import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { sessionSecret } from './session-secret'

const CODE_MIN = 0
const CODE_MAX_EXCLUSIVE = 1_000_000

export function generateCode(): string {
  return String(randomInt(CODE_MIN, CODE_MAX_EXCLUSIVE)).padStart(6, '0')
}

export function hashCode(code: string): string {
  return createHash('sha256').update(`${sessionSecret()}:${code}`).digest('hex')
}

export function verifyCode(submitted: string, storedHash: string): boolean {
  const computed = hashCode(submitted)
  const a = Buffer.from(computed, 'utf8')
  const b = Buffer.from(storedHash, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function isExpired(expiresAt: number, now: number = Date.now()): boolean {
  return now >= expiresAt
}
