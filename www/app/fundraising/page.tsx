import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseClarifications } from '@/lib/clarifications';
import FundraisingClient from './FundraisingClient';

// This route is fully static, so the md read and parse run at build time.
// In dev, edits to clarifications.md show up on refresh.
export default function Fundraising() {
  const md = readFileSync(
    path.join(process.cwd(), 'app', 'fundraising', 'clarifications.md'),
    'utf8'
  );
  const clarifications = parseClarifications(md);
  if (clarifications.length === 0) {
    throw new Error(
      'app/fundraising/clarifications.md contains no "## " items'
    );
  }
  return <FundraisingClient clarifications={clarifications} />;
}
