const PHASES = [
  {
    label: 'Phase 1',
    title: 'One product, one market',
    detail: 'Family device + subscription · 200M+ households',
  },
  {
    label: 'Phase 2',
    title: 'One stack, many markets',
    detail: 'Legal · journalism · healthcare SKUs',
  },
  {
    label: 'Phase 3',
    title: 'One stack, every hardware company',
    detail: 'Platform licensing + fleet management',
  },
];

export default function TrajectoryDiagram() {
  return (
    <figure className="my-10">
      <div className="flex flex-col md:flex-row items-stretch gap-2">
        {PHASES.map((phase, i) => (
          <div key={phase.label} className="flex-1 flex items-stretch gap-2">
            <div className="flex-1 border border-fi-green-500/50 rounded p-4 flex flex-col gap-1 bg-fi-green-500/5">
              <span className="label">{phase.label}</span>
              <span className="font-sans text-sm font-medium text-fi-black-900">
                {phase.title}
              </span>
              <span className="font-sans text-sm text-fi-black-900/70">
                {phase.detail}
              </span>
            </div>
            {i < PHASES.length - 1 && (
              <span
                aria-hidden
                className="hidden md:flex items-center text-fi-green-500"
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 border border-fi-green-500 rounded px-4 py-3 text-center bg-fi-green-500/10">
        <span className="font-sans text-sm font-medium text-fi-black-900">
          The private intelligence stack, built once: local inference ·
          e2e-encrypted sync · zero-knowledge fleet tooling
        </span>
      </div>
      <figcaption className="byline mt-3 text-center">
        Phase 1&apos;s fleet is Phase 3&apos;s reference customer.
      </figcaption>
    </figure>
  );
}
