import PreorderClient from './PreorderClient';
import {
  completionCode,
  parseSrc,
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
  const codes =
    src === 'prolific'
      ? {
          reserved: completionCode('reserved', process.env),
          declined: completionCode('declined', process.env),
        }
      : { reserved: null, declined: null };
  return (
    <PreorderClient
      src={src}
      total={total}
      remaining={remaining}
      codes={codes}
    />
  );
}
