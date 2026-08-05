import { ACT1_PAGES } from './act1';
import { ACT2_PAGES } from './act2';
import { ACT3_PAGES } from './act3';
import { ACT4_PAGES } from './act4';

export { APPENDIX_PAGES } from './appendix';

export const TOTAL = 25;
export const ACT_STARTS = [
  { page: 1 },
  { page: 7 },
  { page: 16 },
  { page: 22 },
];
export const ALL_PAGES = [
  ...ACT1_PAGES,
  ...ACT2_PAGES,
  ...ACT3_PAGES,
  ...ACT4_PAGES,
];

/** Chrome values for each rendered page, aligned 1:1 with
 * [...ALL_PAGES, ...APPENDIX_PAGES]. */
type PageMeta = { act: string; counter: string };

function actRun(count: number, act: string, start: number): PageMeta[] {
  return Array.from({ length: count }, (_, i) => ({
    act,
    counter: `${String(start + i).padStart(2, '0')} / ${TOTAL}`,
  }));
}

const APPENDIX_META: PageMeta[] = Array.from({ length: 6 }, () => ({
  act: 'A · Appendix',
  counter: 'A',
}));

export const PAGE_META: PageMeta[] = [
  ...actRun(6, 'I · The Category', 1),
  ...actRun(9, 'II · The Wedge', 7),
  ...actRun(6, 'III · Under the Hood', 16),
  ...actRun(4, 'IV · The Ask', 22),
  ...APPENDIX_META,
];
