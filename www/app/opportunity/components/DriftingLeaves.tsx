export default function DriftingLeaves() {
  return (
    <div className="drifting-leaves" aria-hidden="true">
      {[1, 2, 3].map(n => (
        <span key={n} className="drift-leaf">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/opportunity/cover-leaf-${n}.png`} alt="" />
        </span>
      ))}
    </div>
  );
}
