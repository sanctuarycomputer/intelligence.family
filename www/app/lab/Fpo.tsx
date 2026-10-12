/** Grey-box placeholder for an image slot. The label describes the asset
 * that belongs there so the wireframe doubles as the shot list. */
export default function Fpo({
  label,
  ratio,
}: {
  label: string;
  /** CSS aspect-ratio, e.g. '3 / 2'. */
  ratio: string;
}) {
  return (
    <div
      className="lab-fpo"
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <span className="lab-fpo-tag" aria-hidden="true">
        FPO
      </span>
      <span className="lab-fpo-label" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
