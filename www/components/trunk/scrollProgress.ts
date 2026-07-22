// Maps the story element's viewport position to a 0..1 timeline value.
// Kept free of DOM access so it runs under vitest's node environment.
export function computeProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): number {
  const span = rectHeight - viewportHeight;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, -rectTop / span));
}
