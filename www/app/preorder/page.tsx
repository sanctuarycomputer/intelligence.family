import PreorderClient from './PreorderClient';
import {
  parseSrc,
  prolificCodes,
  readFounderUnits,
  remainingUnits,
} from '@/lib/preorder';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PreorderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const src = parseSrc(params.src);
  const { total, reserved } = readFounderUnits(process.env);
  const remaining = remainingUnits(total, reserved);
  // Only Prolific traffic receives the codes; they ship in the RSC payload.
  const codes = prolificCodes(src, process.env);
  return (
    <PreorderClient
      src={src}
      total={total}
      remaining={remaining}
      codes={codes}
    />
  );
}
