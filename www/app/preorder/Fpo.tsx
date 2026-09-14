/** Grey-box placeholder for an image or video slot. The label describes the
 * asset that belongs there so the wireframe doubles as the shot list. */
export default function Fpo({
  label,
  ratio,
  className = '',
}: {
  label: string;
  /** CSS aspect-ratio, e.g. '3 / 2'. Omit when the parent sizes the box. */
  ratio?: string;
  className?: string;
}) {
  return (
    <div
      className={`po-fpo ${className}`.trim()}
      style={ratio ? { aspectRatio: ratio } : undefined}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <span className="po-fpo-tag" aria-hidden="true">
        FPO
      </span>
      <span className="po-fpo-label" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
