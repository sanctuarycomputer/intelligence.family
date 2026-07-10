export const ALLOWED_SOURCES = [
  'g3d:family_intelligence',
  'g3d:family_intelligence:fundraising',
  'g3d:family_intelligence:fundraising-viewed',
] as const;

export const GATE_SOURCE = 'g3d:family_intelligence:fundraising';
export const VIEWED_SOURCE = 'g3d:family_intelligence:fundraising-viewed';

const DEFAULT_SOURCE = 'g3d:family_intelligence';
const CRM_URL = 'https://stacks.garden3d.net/api/contacts';

type CrmResult = {
  ok: boolean;
  status: 'created' | 'rejected_source' | 'error';
};

export async function createCrmContact(
  email: string,
  source?: string
): Promise<CrmResult> {
  const resolvedSource =
    typeof source === 'string' &&
    (ALLOWED_SOURCES as readonly string[]).includes(source)
      ? source
      : DEFAULT_SOURCE;

  if (source && resolvedSource !== source) {
    return { ok: false, status: 'rejected_source' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const apiKey = process.env.STACKS_API_KEY;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(CRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey ?? '',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        sources: [resolvedSource],
      }),
      signal: controller.signal,
    });
    return res.ok
      ? { ok: true, status: 'created' }
      : { ok: false, status: 'error' };
  } catch {
    return { ok: false, status: 'error' };
  } finally {
    clearTimeout(timeout);
  }
}
