import { VIEWED_SOURCE, OPPORTUNITY_VIEWED_SOURCE } from './crm';

// Server-side slug map: the client names a page, never a CRM source.
const PAGE_VIEWED_SOURCES: Record<string, string> = {
  fundraising: VIEWED_SOURCE,
  opportunity: OPPORTUNITY_VIEWED_SOURCE,
};

export function resolveViewedSource(page: string | null): string {
  return (page && PAGE_VIEWED_SOURCES[page]) || VIEWED_SOURCE;
}
