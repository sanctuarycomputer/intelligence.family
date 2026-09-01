import { ACT1_PAGES } from './act1';
import { ACT2_PAGES } from './act2';
import { ACT3_PAGES } from './act3';
import { ACT4_PAGES } from './act4';
import { APPENDIX_PAGES } from './appendix';

export { APPENDIX_PAGES } from './appendix';

export const ALL_PAGES = [
  ...ACT1_PAGES,
  ...ACT2_PAGES,
  ...ACT3_PAGES,
  ...ACT4_PAGES,
];

// The single source of truth for the deck's page count. Act files can't
// import this (see their "kept local" comments, avoiding the circular
// import back into this module), so anything else that needs the total
// imports it from here.
export const TOTAL = ALL_PAGES.length;

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

const APPENDIX_META: PageMeta[] = Array.from(
  { length: APPENDIX_PAGES.length },
  () => ({
    act: 'A · Appendix',
    counter: 'A',
  })
);

// Each act's run starts right after the previous one ends, so a page
// added or hidden anywhere upstream shifts every later start automatically.
const ACT1_START = 1;
const ACT2_START = ACT1_START + ACT1_PAGES.length;
const ACT3_START = ACT2_START + ACT2_PAGES.length;
const ACT4_START = ACT3_START + ACT3_PAGES.length;
const APPENDIX_START = ACT4_START + ACT4_PAGES.length; // === TOTAL + 1

export const PAGE_META: PageMeta[] = [
  ...actRun(ACT1_PAGES.length, 'I · The Category', ACT1_START),
  ...actRun(ACT2_PAGES.length, 'II · Our First Device', ACT2_START, {
    bg: 'green-200',
  }),
  ...actRun(ACT3_PAGES.length, 'III · Under the Hood', ACT3_START, {
    dark: true,
  }),
  ...actRun(ACT4_PAGES.length, 'IV · The Ask', ACT4_START, {
    bg: 'green-200',
  }),
  ...APPENDIX_META,
];

// Leaves drift on five specific slides: the cover (Act I's first page),
// Act I's closing splash (its last page), and the splash that opens each
// of Act III, Act IV and the appendix (each act's first page). Each is
// expressed from the act it actually belongs to, not as a literal
// position, so it survives any page being added or hidden anywhere.
const LEAF_PAGES = [
  ACT1_START, // cover
  ACT1_START + ACT1_PAGES.length - 1, // Act I's closing splash
  ACT3_START, // Act III's opening splash
  ACT4_START, // Act IV's opening splash
  APPENDIX_START, // appendix's opening splash
];

for (const page of LEAF_PAGES) {
  if (PAGE_META[page - 1]) PAGE_META[page - 1].leaves = true;
}
