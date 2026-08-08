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

const PHASES: Phase[] = [
  {
    name: 'Proof',
    tasks: [
      {
        name: 'Prototype on NVIDIA Orin',
        detail: 'Working prototype on previous-generation silicon, by choice',
        start: 0,
        end: 6,
        status: 'done',
      },
      {
        name: 'Mozilla research published',
        detail: '28k+ impressions, overwhelmingly positive',
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
        name: 'Round closes',
        detail: 'Waitlist opens the same day',
        start: 7,
        end: 10,
        status: 'active',
      },
    ],
  },
  {
    name: 'Team & Manufacturing',
    tasks: [
      {
        name: 'Core hires',
        detail: 'ML-systems lead first',
        start: 9,
        end: 14,
        status: 'next',
      },
      {
        name: 'Contract manufacturer engaged',
        detail: 'Foxconn, Arima, or Coosea; tariff-aware plan',
        start: 10,
        end: 14,
        status: 'next',
      },
      {
        name: 'EVT / DVT / PVT',
        detail: 'Engineering, design, and production validation builds',
        start: 13,
        end: 21,
        status: 'next',
      },
    ],
  },
  {
    name: 'Software',
    tasks: [
      {
        name: 'SDK & stack hardening',
        detail: 'TEE, sync server, MOTA, ontology, harness',
        start: 10,
        end: 21,
        status: 'next',
      },
      {
        name: 'Field beta',
        detail: 'Founder-family units in real homes',
        start: 18,
        end: 22,
        status: 'next',
      },
    ],
  },
  {
    name: 'Launch',
    tasks: [
      {
        name: 'Production & shipping',
        detail: 'First run lands for the holidays',
        start: 20,
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
      aria-label="Timeline from a mid-2026 raise to shelves at Christmas 2027"
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
