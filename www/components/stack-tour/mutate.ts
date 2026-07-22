// www/components/stack-tour/mutate.ts
// Imperative per-frame writes to three.js objects, kept in module-level
// helpers: the react-hooks/immutability rule (correctly) forbids mutating
// memoized values inside hook callbacks, and r3f frame loops are the
// sanctioned exception. Funnelling the writes through here keeps the rule
// meaningful everywhere else.
export function assign<T extends object>(target: T, patch: Partial<T>): void {
  Object.assign(target, patch);
}

export function setVisible(
  object: { visible: boolean } | null,
  visible: boolean
): void {
  if (object) object.visible = visible;
}
