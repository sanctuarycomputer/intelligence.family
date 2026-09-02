/**
 * The Apple Pay sheet, sliding up over the thread.
 *
 * Positioned inside the phone frame rather than over the whole dock, because
 * on iOS the sheet is a card the app presents, not a system overlay: it stops
 * short of the status bar and leaves the thread dimmed behind it.
 *
 * Stateless on purpose. `up` and `paid` come from the demo clock, and the
 * slide is a CSS transition off `up` so it eases out on replay the way the
 * phone itself does.
 */

import { BASKET_ITEMS, BASKET_SUMMARY, BASKET_TOTAL } from './basket';
import { OUT } from './bubbles';

function AppleMark() {
  return (
    <svg
      width="13"
      height="16"
      viewBox="0 0 13 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.6 8.5c0-1.8 1.4-2.6 1.5-2.7-.8-1.2-2.1-1.4-2.6-1.4-1.1-.1-2.1.6-2.7.6-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.8 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1 0 1.3.6 2.3.5 1 0 1.6-.8 2.2-1.7.7-1 .9-1.9 1-2-.1 0-1.9-.7-1.9-2.7ZM8.9 3.2c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.7 2.2.8 0 1.6-.4 2.1-1.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg
      width="16"
      height="13"
      viewBox="0 0 16 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.5 6.8 5.6 11 14.5 1.8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PaymentSheet({
  up,
  paid,
  tapped,
}: {
  up: boolean;
  paid: boolean;
  tapped: boolean;
}) {
  return (
    <>
      {/* The thread dims behind the sheet, as it does behind any iOS sheet. */}
      <div className={`pay-scrim${up ? ' is-up' : ''}`} aria-hidden="true" />
      <div
        className={`pay-sheet${up ? ' is-up' : ''}`}
        role="group"
        aria-label="Apple Pay"
        aria-hidden={up ? undefined : true}
      >
        <span className="mx-auto mt-[8px] block h-[5px] w-[36px] rounded-full bg-black/20" />

        <div className="flex items-center justify-between px-[18px] pb-[10px] pt-[14px]">
          <span className="text-[15px] font-semibold text-black">
            Instacart
          </span>
          <span className="text-[11.5px] text-black/45">{BASKET_SUMMARY}</span>
        </div>

        <div className="border-t border-black/[0.08] px-[18px] pt-[8px]">
          {BASKET_ITEMS.map(([item, price]) => (
            <div
              key={item}
              className="flex items-center justify-between py-[4px]"
            >
              <span className="text-[12.5px] text-black/70">{item}</span>
              <span className="text-[12.5px] tabular-nums text-black">
                {price}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-[6px] flex items-center justify-between border-t border-black/[0.08] px-[18px] py-[10px]">
          <span className="text-[13px] font-medium text-black/55">Total</span>
          <span className="text-[17px] font-semibold tabular-nums text-black">
            {BASKET_TOTAL}
          </span>
        </div>

        <div className="px-[18px] pb-[16px]">
          <div
            className={`pay-button${tapped ? ' is-tapped' : ''}`}
            style={{ background: paid ? OUT : 'var(--fi-black-900)' }}
          >
            {paid ? (
              <CheckMark />
            ) : (
              <>
                <AppleMark />
                <span className="text-[15px] font-medium leading-none">
                  Pay
                </span>
              </>
            )}
          </div>
          <p className="pt-[8px] text-center text-[10.5px] leading-none text-black/35">
            Double-click to pay
          </p>
        </div>
      </div>
    </>
  );
}
