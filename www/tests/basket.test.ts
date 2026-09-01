import { describe, expect, it } from 'vitest';
import {
  BASKET_COUNT,
  BASKET_ITEMS,
  BASKET_SUMMARY,
  BASKET_TOTAL,
} from '@/components/thread/basket';
import { THREAD } from '@/components/thread/threadScript';

describe('the basket', () => {
  it('derives its count from the item list rather than restating it', () => {
    expect(BASKET_COUNT).toBe(BASKET_ITEMS.length);
  });

  /* The whole point of a shared module: the total is arithmetic on the
     items, not a second number someone has to keep in sync by hand. */
  it('totals to the sum of its items', () => {
    const centsOf = (price: string) =>
      Math.round(Number.parseFloat(price.replace(/[^0-9.]/g, '')) * 100);
    const sumCents = BASKET_ITEMS.reduce(
      (sum, [, price]) => sum + centsOf(price),
      0
    );
    expect(BASKET_TOTAL).toBe(`$${(sumCents / 100).toFixed(2)}`);
  });

  it('carries the approved copy', () => {
    expect(BASKET_COUNT).toBe(6);
    expect(BASKET_TOTAL).toBe('$87.40');
    expect(BASKET_SUMMARY).toBe('6 items · Back to school');
  });

  /* The checkout-link bubble in the thread is a fourth surface for the same
     basket; it has to read the shared summary and total rather than its own
     literals, or the three-way drift this module exists to prevent could
     still happen one hop away. */
  it('is what the checkout-link bubble in the thread shows', () => {
    const link = THREAD.find(e => e.kind === 'checkoutLink');
    expect(link).toBeDefined();
    if (link?.kind === 'checkoutLink') {
      expect(link.summary).toBe(BASKET_SUMMARY);
      expect(link.total).toBe(BASKET_TOTAL);
    }
  });
});
