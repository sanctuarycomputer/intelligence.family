/**
 * The commerce exchange's basket: one list, read by every surface that shows
 * it.
 *
 * The spec's point is that the device screen's basket card and the phone's
 * payment sheet are *the same basket* — not two copies that happen to agree
 * today. Before this module they were three: the card's own list and total
 * in screenCards.ts, a second literal list in PaymentSheet.tsx plus a hand
 * typed "6 items" and "$87.40" in its markup, and a third hand typed summary
 * and total in threadScript.ts's checkout-link bubble. Editing one price
 * left the others silently wrong. Now there is one list, and the count and
 * total are both derived from it rather than restated beside it.
 */

/** Item name, price as authored copy (e.g. `'$12.00'`). */
export type BasketItem = [name: string, price: string];

/**
 * Six items is a layout constraint on the device screen's card, not a
 * preference: the card box is 1088x480 in screen space and the header eats
 * the first 124px of it, so six rows plus the total rule is 326px of the
 * 356px left. A seventh line would draw past the bottom edge. See
 * screenCards.ts's drawBasket.
 */
export const BASKET_ITEMS: readonly BasketItem[] = [
  ['Composition books x 8', '$12.00'],
  ['Highlighters x 2', '$8.50'],
  ['Reading log', '$6.90'],
  ['Pencil case x 2', '$14.00'],
  ['Lunchbox x 2', '$16.00'],
  ['Sneakers, Tom', '$30.00'],
];

export const BASKET_COUNT = BASKET_ITEMS.length;

/** Parses a `'$12.00'`-shaped price into cents, so summing never touches floats. */
function toCents(price: string): number {
  return Math.round(Number.parseFloat(price.replace(/[^0-9.]/g, '')) * 100);
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** The sum of every item's price, formatted the same way each item is. */
export const BASKET_TOTAL = formatCents(
  BASKET_ITEMS.reduce((sum, [, price]) => sum + toCents(price), 0)
);

/** The checkout link's summary line, e.g. `'6 items · Back to school'`. */
export const BASKET_SUMMARY = `${BASKET_COUNT} items · Back to school`;
