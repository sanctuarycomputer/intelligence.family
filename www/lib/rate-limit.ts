type Bucket = { count: number; windowStart: number }

const buckets = new Map<string, Bucket>()

export function consume(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): boolean {
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return 1 <= limit
  }
  bucket.count += 1
  return bucket.count <= limit
}

export function _resetForTests(): void {
  buckets.clear()
}
