'use client';

import { useMemo, useState } from 'react';
import { formatShortDate, formatTime, todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';

function hourSlots(start: string, end: string): string[] {
  const [startHour] = start.split(':').map(Number);
  const [endHour] = end.split(':').map(Number);
  return Array.from({ length: endHour - startHour + 1 }, (_, index) => `${String(startHour + index).padStart(2, '0')}:00`);
}

export function TodayPage() {
  const { state, toggleTaskComplete, setScorecard } = usePlanner();
  const today = todayIso();
  const [wins, setWins] = useState<[string, string, string]>(() => {
    const existing = state.scorecards.find((item) => item.date === today)?.wins;
    return existing ?? ['', '', ''];
  });
  const [notes, setNotes] = useState(state.scorecards.find((item) => item.date === today)?.notes ?? '');

  const appointments = useMemo(
    () => [...state.appointments].filter((item) => item.date === today).sort((a, b) => a.start.localeCompare(b.start)),
    [state.appointments, today],
  );

  const tasks = useMemo(
    () => state.tasks.filter((task) => task.date === today && task.status !== 'deleted'),
    [state.tasks, today],
  );

  const aTasks = tasks.filter((task) => task.priority === 'A');
  const bTasks = tasks.filter((task) => task.priority === 'B');
  const slots = hourSlots(state.settings.workdayStart, state.settings.workdayEnd);

  function saveScorecard() {
    setScorecard({ date: today, wins, notes });
  }

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Today</h2>
          <p>{formatShortDate(today)} · Fixed commitments on the left, activity-based priorities on the right.</p>
        </div>
        <div className="badge">
          Protected time {state.settings.biologicalPeakStart} to {state.settings.biologicalPeakEnd}
        </div>
      </div>

      <section className="grid-3">
        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">Fixed schedule</div>
            <h3 className="card-title">Appointments</h3>
          </div>
          {appointments.length === 0 ? (
            <div className="empty">No fixed appointments today. The page is mostly yours to compose.</div>
          ) : (
            <div className="item-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="item">
                  <div className="row spread wrap">
                    <h4>{appointment.title}</h4>
                    <span className="badge">{formatTime(appointment.start)} to {formatTime(appointment.end)}</span>
                  </div>
                  {appointment.notes ? <p>{appointment.notes}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel panel-inner stack" style={{ gridColumn: 'span 2' }}>
          <div>
            <div className="kicker">Reality map</div>
            <h3 className="card-title">24-hour workday view</h3>
          </div>
          <div className="timeline">
            {slots.map((slot) => {
              const appointmentsHere = appointments.filter((item) => item.start.startsWith(slot.slice(0, 2)));
              const tasksHere = tasks.filter((task) => task.timeBlockStart?.startsWith(slot.slice(0, 2)));
              const isFocus = slot >= state.settings.biologicalPeakStart && slot < state.settings.biologicalPeakEnd;

              return (
                <div className="time-slot" key={slot}>
                  <div className="time-label">{formatTime(slot)}</div>
                  <div className={`slot-body ${isFocus ? 'focus' : ''}`}>
                    {isFocus ? <div className="small">Protected time · A-priority work only</div> : null}
                    {[...appointmentsHere.map((item) => `Appointment · ${item.title}`), ...tasksHere.map((task) => `${task.priority} task · ${task.title}`)].length === 0 ? (
                      <div className="small">Open</div>
                    ) : (
                      <div className="stack">
                        {appointmentsHere.map((item) => (
                          <div key={item.id} className="badge">Appointment · {item.title}</div>
                        ))}
                        {tasksHere.map((task) => (
                          <div key={task.id} className={`badge ${task.priority === 'A' ? 'a' : 'b'}`}>
                            {task.priority} · {task.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div className="row spread wrap">
            <div>
              <div className="kicker">Activities</div>
              <h3 className="card-title">A priorities</h3>
            </div>
            <span className="badge a">Must be done today</span>
          </div>
          {aTasks.length === 0 ? (
            <div className="empty">No A tasks scheduled for today.</div>
          ) : (
            <div className="item-list">
              {aTasks.map((task) => (
                <div className="item" key={task.id}>
                  <div className="row spread wrap">
                    <h4>{task.title}</h4>
                    <span className={`badge ${task.status === 'completed' ? 'done' : 'a'}`}>{task.status}</span>
                  </div>
                  {task.description ? <p>{task.description}</p> : null}
                  <div className="row wrap" style={{ marginTop: 12 }}>
                    {task.timeBlockStart ? (
                      <span className="badge">
                        {formatTime(task.timeBlockStart)} to {formatTime(task.timeBlockEnd || task.timeBlockStart)}
                      </span>
                    ) : null}
                    {task.sourceType ? <span className="badge">Source · {task.sourceType}</span> : null}
                    <button className="button-ghost" onClick={() => toggleTaskComplete(task.id)}>
                      {task.status === 'completed' ? 'Mark active' : 'Mark complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel panel-inner stack">
          <div className="row spread wrap">
            <div>
              <div className="kicker">Activities</div>
              <h3 className="card-title">B priorities</h3>
            </div>
            <span className="badge b">Can move if needed</span>
          </div>
          {bTasks.length === 0 ? (
            <div className="empty">No B tasks scheduled for today.</div>
          ) : (
            <div className="item-list">
              {bTasks.map((task) => (
                <div className="item" key={task.id}>
                  <div className="row spread wrap">
                    <h4>{task.title}</h4>
                    <span className={`badge ${task.status === 'completed' ? 'done' : task.status === 'delegated' ? 'delegated' : 'b'}`}>
                      {task.status}
                    </span>
                  </div>
                  {task.description ? <p>{task.description}</p> : null}
                  <div className="row wrap" style={{ marginTop: 12 }}>
                    {task.followUpDate ? <span className="badge">Follow-up {formatShortDate(task.followUpDate)}</span> : null}
                    {task.delegatedTo ? <span className="badge">Delegated to {task.delegatedTo}</span> : null}
                    <button className="button-ghost" onClick={() => toggleTaskComplete(task.id)}>
                      {task.status === 'completed' ? 'Mark active' : 'Mark complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="panel panel-inner stack">
        <div className="row spread wrap">
          <div>
            <div className="kicker">Close the day</div>
            <h3 className="card-title">Plan tomorrow, today</h3>
          </div>
          <button className="button" onClick={saveScorecard}>
            Save review
          </button>
        </div>
        <p className="card-subtitle">
          Empty the mental pockets. Record three wins, then leave tomorrow laid out like a clean shirt on a chair.
        </p>
        <div className="grid-3">
          {wins.map((win, index) => (
            <label className="label" key={index}>
              Win {index + 1}
              <input
                className="field"
                value={win}
                onChange={(event) => {
                  const next = [...wins] as [string, string, string];
                  next[index] = event.target.value;
                  setWins(next);
                }}
                placeholder="What went well?"
              />
            </label>
          ))}
        </div>
        <label className="label">
          Notes
          <textarea
            className="textarea"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything to carry into tomorrow?"
          />
        </label>
      </section>
    </div>
  );
}
