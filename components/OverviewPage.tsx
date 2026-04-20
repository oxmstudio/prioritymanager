'use client';

import Link from 'next/link';
import { usePlanner } from '../lib/store';
import { formatMonthYear, todayIso } from '../lib/date';

export function OverviewPage() {
  const { state } = usePlanner();
  const today = todayIso();
  const todayTasks = state.tasks.filter((task) => task.date === today && task.status !== 'deleted');
  const appointments = state.appointments.filter((item) => item.date === today);
  const activeGoals = state.goals.filter((goal) => goal.active);

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Planner overview</h2>
          <p>
            A calm command deck for the month, the day, and the little loose ends trying to sprint
            around your head.
          </p>
        </div>
        <div className="badge">{formatMonthYear(new Date())}</div>
      </div>

      <section className="grid-4">
        <div className="panel panel-inner">
          <div className="kicker">Today</div>
          <div className="metric">{todayTasks.length}</div>
          <div className="card-subtitle">Planned tasks on today&apos;s sheet</div>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Appointments</div>
          <div className="metric">{appointments.length}</div>
          <div className="card-subtitle">Fixed commitments shaping the day</div>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Active goals</div>
          <div className="metric">{activeGoals.length}</div>
          <div className="card-subtitle">Kept intentionally small for clarity</div>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Mind traffic</div>
          <div className="metric">{state.triageItems.length}</div>
          <div className="card-subtitle">Captured items that are no longer rattling the cage</div>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">Daily operating system</div>
            <h3 className="card-title">How the MVP is wired</h3>
            <p className="card-subtitle">
              Calendar holds fixed commitments. The planner holds priorities. Triage clears mind
              traffic. Communication logs create linked follow-ups.
            </p>
          </div>
          <div className="grid-2">
            <Link href="/month" className="item">
              <h4>Month planner</h4>
              <p>Paper-style spread for monthly placement and daily load balancing.</p>
            </Link>
            <Link href="/today" className="item">
              <h4>Today</h4>
              <p>24-hour reality map with protected time and A/B priorities.</p>
            </Link>
            <Link href="/triage" className="item">
              <h4>Triage</h4>
              <p>Do, Date, Delegate, or Delete. Decide once and move on.</p>
            </Link>
            <Link href="/communications" className="item">
              <h4>Communications</h4>
              <p>I Said / They Said logs that convert directly into next actions.</p>
            </Link>
          </div>
        </div>

        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">General principles</div>
            <h3 className="card-title">Foundation layer</h3>
          </div>
          <div className="item-list">
            <div className="item">
              <div className="row wrap">
                <span className="badge">Right task</span>
                <span className="badge">Right process</span>
                <span className="badge">Right tools</span>
                <span className="badge">Results</span>
              </div>
            </div>
            <div className="item">
              <h4>Plan tomorrow, today</h4>
              <p>Close the day before the day closes you. Let tomorrow wake up already arranged.</p>
            </div>
            <div className="item">
              <h4>Tools should reduce work</h4>
              <p>If a feature adds friction without clarity, it should be shaved down or shown the door.</p>
            </div>
            <div className="item">
              <h4>A priorities must be done today</h4>
              <p>B tasks can move. A tasks are the stones you do not kick into tomorrow.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <div className="panel panel-inner stack">
          <div className="kicker">Monthly focus</div>
          <h3 className="card-title">{state.settings.monthlyFocus}</h3>
          <div className="stack">
            {state.settings.topPriorities.map((priority) => (
              <div key={priority} className="badge">
                {priority}
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-inner stack">
          <div className="kicker">Protected time</div>
          <h3 className="card-title">
            {state.settings.biologicalPeakStart} to {state.settings.biologicalPeakEnd}
          </h3>
          <p className="card-subtitle">
            This block is reserved for A-priority work. It is the velvet rope around your strongest
            thinking.
          </p>
        </div>

        <div className="panel panel-inner stack">
          <div className="kicker">Quick start</div>
          <div className="stack">
            <Link href="/triage" className="button-ghost">
              Capture an item
            </Link>
            <Link href="/today" className="button-ghost">
              Plan the day
            </Link>
            <Link href="/review" className="button-ghost">
              Close the day
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
