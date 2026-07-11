// Single source of truth for the seal/hash secret. Throws loudly on
// misconfiguration so no code path silently falls back to a weak/empty secret.
export function sessionSecret(): string {
  const pw = process.env.SESSION_SECRET
  if (!pw || pw.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters')
  }
  return pw
}
