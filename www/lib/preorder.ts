export const FOUNDER_UNITS_DEFAULT_TOTAL = 250;

export type PreorderSrc = 'prolific' | 'ads' | 'direct';
export type ReserveOutcome = 'reserve' | 'waitlist';
export type ProlificOutcome = 'reserved' | 'declined';

// Stacks sources. Task 2 moves these into lib/crm.ts's allowlist.
const PREORDER_SOURCE = 'g3d:family_intelligence:preorder';
const PREORDER_ADS_SOURCE = 'g3d:family_intelligence:preorder:ads';

export function remainingUnits(total: number, reserved: number): number {
  return Math.min(total, Math.max(0, total - reserved));
}

function readNonNegativeInt(
  value: string | undefined,
  fallback: number
): number {
  if (value === undefined) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

export function readFounderUnits(env: Record<string, string | undefined>): {
  total: number;
  reserved: number;
} {
  return {
    total: readNonNegativeInt(
      env.FOUNDER_UNITS_TOTAL,
      FOUNDER_UNITS_DEFAULT_TOTAL
    ),
    reserved: readNonNegativeInt(env.FOUNDER_UNITS_RESERVED, 0),
  };
}

export function parseSrc(value: string | string[] | undefined): PreorderSrc {
  if (typeof value !== 'string') return 'direct';
  const v = value.trim().toLowerCase();
  if (v === 'prolific' || v === 'ads') return v;
  return 'direct';
}

/** Stacks source for a reservation. Prolific never reaches here in this
 * version (Prolific mode collects no email), so it maps to the plain
 * source rather than being rejected. */
export function resolvePreorderSource(src: string | undefined): string {
  return parseSrc(src) === 'ads' ? PREORDER_ADS_SOURCE : PREORDER_SOURCE;
}

export function completionCode(
  outcome: ProlificOutcome,
  env: Record<string, string | undefined>
): string | null {
  const raw =
    outcome === 'reserved'
      ? env.PROLIFIC_CODE_RESERVED
      : env.PROLIFIC_CODE_DECLINED;
  const code = raw?.trim();
  return code ? code : null;
}
