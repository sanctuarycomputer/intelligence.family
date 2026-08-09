export default function FpoBox({
  note,
  aspect = '16/9',
}: {
  note: string;
  aspect?: string;
}) {
  return (
    <div className="deck-fpo" style={{ aspectRatio: aspect }}>
      <p>
        <strong>FPO</strong>
        <br />
        {note}
      </p>
    </div>
  );
}
