type Bucket = { count: number; windowStart: number; windowMs: number }

const buckets = new Map<string, Bucket>()

// Prune expired buckets at most once per interval so the Map can't grow
// unbounded across a warm serverless instance's lifetime.
const SWEEP_INTERVAL_MS = 60_000
let lastSweep = 0

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= bucket.windowMs) buckets.delete(key)
  }
  lastSweep = now
}

export function consume(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): boolean {
  if (now - lastSweep >= SWEEP_INTERVAL_MS) sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now, windowMs })
    return 1 <= limit
  }
  bucket.count += 1
  return bucket.count <= limit
}

export function _resetForTests(): void {
  buckets.clear()
  lastSweep = 0
}

export function _bucketCount(): number {
  return buckets.size
}
