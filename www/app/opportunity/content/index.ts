import { ACT1_PAGES } from './act1';
import { ACT2_PAGES } from './act2';
import { ACT3_PAGES } from './act3';
import { ACT4_PAGES } from './act4';

export { APPENDIX_PAGES } from './appendix';

export const TOTAL = 25;
export const ALL_PAGES = [
  ...ACT1_PAGES,
  ...ACT2_PAGES,
  ...ACT3_PAGES,
  ...ACT4_PAGES,
];

/** Chrome values for each rendered page, aligned 1:1 with
 * [...ALL_PAGES, ...APPENDIX_PAGES]. */
type PageMeta = {
  act: string;
  counter: string;
  dark?: boolean;
  leaves?: boolean;
  /** Act background tone; the chrome bar's fill matches it. */
  bg?: 'green-200';
};

function actRun(
  count: number,
  act: string,
  start: number,
  opts: { dark?: boolean; bg?: PageMeta['bg'] } = {}
): PageMeta[] {
  return Array.from({ length: count }, (_, i) => ({
    act,
    counter: `${String(start + i).padStart(2, '0')} / ${TOTAL}`,
    ...(opts.dark ? { dark: true } : {}),
    ...(opts.bg ? { bg: opts.bg } : {}),
  }));
}

const APPENDIX_META: PageMeta[] = Array.from({ length: 7 }, () => ({
  act: 'A · Appendix',
  counter: 'A',
}));

const LEAF_PAGES = [1, 9, 18, 21, TOTAL + 1]; // cover + act splashes + appendix splash

export const PAGE_META: PageMeta[] = [
  ...actRun(9, 'I · The Category', 1),
  ...actRun(8, 'II · Our First Device', 10, { bg: 'green-200' }),
  ...actRun(3, 'III · Under the Hood', 18, { dark: true }),
  ...actRun(5, 'IV · The Ask', 21, { bg: 'green-200' }),
  ...APPENDIX_META,
];

for (const page of LEAF_PAGES) {
  if (PAGE_META[page - 1]) PAGE_META[page - 1].leaves = true;
}
