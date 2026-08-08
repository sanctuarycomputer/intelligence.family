'use client';

type Status = 'done' | 'active' | 'next';

type Task = {
  name: string;
  detail: string;
  /** Month offsets from Jan 2026, inclusive start / exclusive end. */
  start: number;
  end: number;
  status: Status;
  star?: boolean;
};

type Phase = { name: string; tasks: Task[] };

const FIRST_MONTH = 0; // Jan '26
const LAST_MONTH = 24; // through Dec '27
const QUARTERS = [
  "Q1 '26",
  "Q2 '26",
  "Q3 '26",
  "Q4 '26",
  "Q1 '27",
  "Q2 '27",
  "Q3 '27",
  "Q4 '27",
];

// Mirrors the Notion plan (garden3d Timeline database), month precision.
const PHASES: Phase[] = [
  {
    name: 'Proof',
    tasks: [
      {
        name: 'Prototyping',
        detail:
          'Mar – Jun ’26 · Working prototype on a previous-gen NVIDIA Orin',
        start: 2,
        end: 5,
        status: 'done',
      },
      {
        name: 'Mozilla research published',
        detail: 'Apr – Jul ’26 · 28k+ impressions, overwhelmingly positive',
        start: 3,
        end: 7,
        status: 'done',
      },
    ],
  },
  {
    name: 'Raise',
    tasks: [
      {
        name: 'Fundraising',
        detail: 'Jun – Oct ’26 · Waitlist opens at close',
        start: 5,
        end: 9,
        status: 'active',
      },
    ],
  },
  {
    name: 'Design',
    tasks: [
      {
        name: 'Product design & research',
        detail: 'Oct ’26 – Feb ’27 · From gestural proof of concept to product',
        start: 9,
        end: 13,
        status: 'next',
      },
      {
        name: 'Industrial design',
        detail: 'Nov ’26 – Feb ’27 · Form factor around the hardware stackup',
        start: 10,
        end: 13,
        status: 'next',
      },
    ],
  },
  {
    name: 'Manufacturing',
    tasks: [
      {
        name: 'Contract manufacturer partnership',
        detail: 'Dec ’26 – Feb ’27 · Foxconn, Arima, or Coosea',
        start: 11,
        end: 13,
        status: 'next',
      },
      {
        name: 'Hardware iteration (EVT/DVT/PVT)',
        detail: 'Feb – Jul ’27 · Validation builds through production',
        start: 13,
        end: 18,
        status: 'next',
      },
    ],
  },
  {
    name: 'Software',
    tasks: [
      {
        name: 'Product development',
        detail: 'Jan – Aug ’27 · SDK, stack, and the family applications',
        start: 12,
        end: 19,
        status: 'next',
      },
    ],
  },
  {
    name: 'Go to market',
    tasks: [
      {
        name: 'Brand & marketing team',
        detail: 'Apr – Aug ’27 · Standing up the launch engine',
        start: 15,
        end: 19,
        status: 'next',
      },
      {
        name: 'Product launch',
        detail: 'Aug – Sep ’27',
        start: 19,
        end: 20,
        status: 'next',
      },
      {
        name: 'First customer ship',
        detail: 'Sep – Nov ’27',
        start: 20,
        end: 22,
        status: 'next',
      },
      {
        name: 'Customer support stood up',
        detail: 'Oct ’27 onward',
        start: 21,
        end: 24,
        status: 'next',
      },
      {
        name: 'Christmas 2027',
        detail: 'On shelves and ready to gift',
        start: 23,
        end: 24,
        status: 'next',
        star: true,
      },
    ],
  },
];

const pct = (m: number) =>
  `${((m - FIRST_MONTH) / (LAST_MONTH - FIRST_MONTH)) * 100}%`;

export default function TimelineGantt() {
  return (
    <div
      className="gantt"
      role="img"
      aria-label="Timeline from a 2026 raise to shelves at Christmas 2027"
    >
      <div className="gantt-legend" aria-hidden="true">
        <span>
          <i className="gantt-chip gantt-done" /> Completed
        </span>
        <span>
          <i className="gantt-chip gantt-active" /> In progress
        </span>
        <span>
          <i className="gantt-chip gantt-next" /> Upcoming
        </span>
      </div>
      <div className="gantt-head" aria-hidden="true">
        <span className="gantt-label" />
        <span className="gantt-track">
          {QUARTERS.map(q => (
            <span key={q} className="gantt-quarter">
              {q}
            </span>
          ))}
        </span>
      </div>
      {PHASES.map(phase => (
        <div key={phase.name} className="gantt-phase">
          <div className="gantt-phase-name">{phase.name}</div>
          {phase.tasks.map(task => (
            <div key={task.name} className="gantt-row">
              <span className="gantt-label">{task.name}</span>
              <span className="gantt-track">
                {QUARTERS.map((q, i) => (
                  <i
                    key={q}
                    className={`gantt-grid${i === 0 ? ' first' : ''}`}
                  />
                ))}
                <span
                  className={`gantt-bar gantt-${task.status}`}
                  style={{
                    left: pct(task.start),
                    width: `calc(${pct(task.end)} - ${pct(task.start)})`,
                  }}
                >
                  {task.star && <span className="gantt-star">★</span>}
                  <span className="gantt-tip">
                    <strong>{task.name}</strong>
                    {task.detail}
                  </span>
                </span>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
