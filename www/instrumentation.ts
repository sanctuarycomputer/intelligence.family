/**
 * Runs once per server / serverless cold start, before any request is handled.
 *
 * On Vercel, `dotenvx run -- next build` only decrypts secrets at BUILD time —
 * serverless functions read `process.env` at REQUEST time and would otherwise
 * only see whatever Vercel injects (the encrypted `.env` values, or nothing).
 *
 * Here we decrypt the committed `.env` at runtime using DOTENV_PRIVATE_KEY
 * (set in the Vercel dashboard), the same way Rails decrypts credentials with
 * RAILS_MASTER_KEY at boot. `overload: true` overrides any ciphertext that
 * Next.js's own env loader may have already read from `.env`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { config } = await import('@dotenvx/dotenvx')
    config({ path: '.env', overload: true, quiet: true })
  }
}
