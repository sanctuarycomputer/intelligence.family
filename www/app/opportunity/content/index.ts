import { ACT1_PAGES } from './act1';
import { ACT2_PAGES } from './act2';
import { ACT3_PAGES } from './act3';
import { ACT4_PAGES } from './act4';

export { APPENDIX_PAGES } from './appendix';

export const TOTAL = 24;
export const ACT_STARTS = [
  { page: 1 },
  { page: 8 },
  { page: 17 },
  { page: 22 },
];
export const ALL_PAGES = [
  ...ACT1_PAGES,
  ...ACT2_PAGES,
  ...ACT3_PAGES,
  ...ACT4_PAGES,
];
