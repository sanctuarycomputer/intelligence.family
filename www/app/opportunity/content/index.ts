import { ACT1_PAGES } from './act1';
import { ACT2_PAGES } from './act2';
import { ACT3_PAGES } from './act3';
import { ACT4_PAGES } from './act4';

export { APPENDIX_PAGES } from './appendix';

export const TOTAL = 24;
export const ACT_STARTS = [
  { page: 1 },
  { page: 8 },
  { page: 15 },
  { page: 20 },
];
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
};

function actRun(
  count: number,
  act: string,
  start: number,
  dark?: boolean
): PageMeta[] {
  return Array.from({ length: count }, (_, i) => ({
    act,
    counter: `${String(start + i).padStart(2, '0')} / ${TOTAL}`,
    ...(dark ? { dark: true } : {}),
  }));
}

const APPENDIX_META: PageMeta[] = Array.from({ length: 9 }, () => ({
  act: 'A · Appendix',
  counter: 'A',
}));

const LEAF_PAGES = [1, 7, 15, 20, TOTAL + 1]; // cover + act splashes + appendix splash

export const PAGE_META: PageMeta[] = [
  ...actRun(7, 'I · The Category', 1),
  ...actRun(7, 'II · Our First Device', 8),
  ...actRun(5, 'III · Under the Hood', 15, true),
  ...actRun(5, 'IV · The Ask', 20),
  ...APPENDIX_META,
];

for (const page of LEAF_PAGES) {
  if (PAGE_META[page - 1]) PAGE_META[page - 1].leaves = true;
}
