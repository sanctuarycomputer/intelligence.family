/** Google Analytics event helper. gtag is loaded in app/layout.tsx and
 * typed in types/gtag.d.ts. No-op when it is absent (tests, blockers). */
export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', name, params);
    return;
  }
  (window.dataLayer ??= []).push(['event', name, params]);
}
