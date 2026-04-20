'use client';

import { useMemo, useState } from 'react';
import { formatMonthYear, formatShortDate, formatTime, isSameMonth, monthGrid, toIsoDate, todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';
import type { Priority } from '../lib/types';

export function MonthPage() {
  const { state, addAppointment, addTask, toggleTaskComplete } = usePlanner();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [quickTitle, setQuickTitle] = useState('');
  const [quickType, setQuickType] = useState<'appointment' | 'task'>('task');
  const [quickPriority, setQuickPriority] = useState<Priority>('A');
  const [quickStart, setQuickStart] = useState('09:00');
  const [quickEnd, setQuickEnd] = useState('09:30');

  const grid = useMemo(() => monthGrid(cursor), [cursor]);
  const selectedAppointments = state.appointments.filter((item) => item.date === selectedDate).sort((a, b) => a.start.localeCompare(b.start));
  const selectedTasks = state.tasks.filter((task) => task.date === selectedDate && task.status !== 'deleted');

  function addQuickItem() {
    if (!quickTitle.trim()) return;

    if (quickType === 'appointment') {
      addAppointment({ date: selectedDate, title: quickTitle.trim(), start: quickStart, end: quickEnd });
    } else {
      addTask({
        title: quickTitle.trim(),
        date: selectedDate,
        priority: quickPriority,
        sourceType: 'manual',
        timeBlockStart: quickStart,
        timeBlockEnd: quickEnd,
      });
    }

    setQuickTitle('');
  }

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Month planner</h2>
          <p>Planner-style spread for seeing commitments, placing A/B work, and keeping the page uncluttered.</p>
        </div>
        <div className="row wrap">
          <button className="button-ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            Previous
          </button>
          <div className="badge">{formatMonthYear(cursor)}</div>
          <button className="button-ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            Next
          </button>
        </div>
      </div>

      <section className="grid-3">
        <div className="panel panel-inner" style={{ gridColumn: 'span 2' }}>
          <div className="row spread wrap" style={{ marginBottom: 16 }}>
            <div>
              <div className="kicker">Planner spread</div>
              <h3 className="card-title">{formatMonthYear(cursor)}</h3>
            </div>
            <div className="tabs">
              {['Monthly focus', 'Top priorities', 'Mind traffic'].map((item) => (
                <span key={item} className="tab">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="calendar-strip">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="planner-grid">
            {grid.map((date) => {
              const iso = toIsoDate(date);
              const appointments = state.appointments.filter((item) => item.date === iso).slice(0, 2);
              const tasks = state.tasks.filter((task) => task.date === iso && task.status !== 'deleted').slice(0, 3);
              const extraCount = state.appointments.filter((item) => item.date === iso).length + state.tasks.filter((task) => task.date === iso && task.status !== 'deleted').length - appointments.length - tasks.length;
              const isToday = iso === todayIso();
              const isSelected = iso === selectedDate;

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  className={`day-cell ${isSameMonth(date, cursor) ? '' : 'outside'} ${isToday ? 'today' : ''}`}
                  style={{ textAlign: 'left', outline: isSelected ? '2px solid rgba(55,85,106,0.3)' : undefined }}
                >
                  <div className="day-number">
                    <span>{date.getDate()}</span>
                    {isSelected ? <span className="small">Open</span> : null}
                  </div>
                  <div className="day-lines">
                    {appointments.map((appointment) => (
                      <div className="day-entry" key={appointment.id}>
                        {appointment.start} {appointment.title}
                      </div>
                    ))}
                    {tasks.map((task) => (
                      <div className={`day-entry ${task.status === 'completed' ? 'muted' : ''}`} key={task.id}>
                        {task.priority} {task.title}
                      </div>
                    ))}
                    {extraCount > 0 ? <div className="day-entry muted">+{extraCount} more</div> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">Selected day</div>
            <h3 className="card-title">{formatShortDate(selectedDate)}</h3>
            <p className="card-subtitle">Use the day drawer like the margin notes of a paper planner.</p>
          </div>

          <div className="stack">
            <label className="label">
              Quick add title
              <input className="field" value={quickTitle} onChange={(event) => setQuickTitle(event.target.value)} placeholder="Add an appointment or task" />
            </label>
            <div className="grid-2">
              <label className="label">
                Type
                <select className="select" value={quickType} onChange={(event) => setQuickType(event.target.value as 'appointment' | 'task')}>
                  <option value="task">Task</option>
                  <option value="appointment">Appointment</option>
                </select>
              </label>
              <label className="label">
                Priority
                <select className="select" value={quickPriority} onChange={(event) => setQuickPriority(event.target.value as Priority)}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </label>
            </div>
            <div className="grid-2">
              <label className="label">
                Start
                <input className="field" type="time" value={quickStart} onChange={(event) => setQuickStart(event.target.value)} />
              </label>
              <label className="label">
                End
                <input className="field" type="time" value={quickEnd} onChange={(event) => setQuickEnd(event.target.value)} />
              </label>
            </div>
            <button className="button" onClick={addQuickItem}>
              Add to selected day
            </button>
          </div>

          <div className="hr" />

          <div className="stack">
            <div className="small">Appointments</div>
            {selectedAppointments.length === 0 ? (
              <div className="empty">No fixed appointments.</div>
            ) : (
              selectedAppointments.map((appointment) => (
                <div className="item" key={appointment.id}>
                  <div className="row spread wrap">
                    <h4>{appointment.title}</h4>
                    <span className="badge">
                      {formatTime(appointment.start)} to {formatTime(appointment.end)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="stack">
            <div className="small">Tasks</div>
            {selectedTasks.length === 0 ? (
              <div className="empty">No tasks planned for this day.</div>
            ) : (
              selectedTasks.map((task) => (
                <div className="item" key={task.id}>
                  <div className="row spread wrap">
                    <h4>{task.title}</h4>
                    <span className={`badge ${task.status === 'completed' ? 'done' : task.priority === 'A' ? 'a' : 'b'}`}>
                      {task.status === 'completed' ? 'done' : task.priority}
                    </span>
                  </div>
                  <div className="row wrap" style={{ marginTop: 12 }}>
                    {task.timeBlockStart ? <span className="badge">{formatTime(task.timeBlockStart)}</span> : null}
                    <button className="button-ghost" onClick={() => toggleTaskComplete(task.id)}>
                      {task.status === 'completed' ? 'Mark active' : 'Mark complete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid-3">
        <div className="panel panel-inner stack">
          <div className="kicker">Monthly focus</div>
          <h3 className="card-title">{state.settings.monthlyFocus}</h3>
        </div>
        <div className="panel panel-inner stack">
          <div className="kicker">Top priorities</div>
          {state.settings.topPriorities.map((priority) => (
            <div key={priority} className="badge">
              {priority}
            </div>
          ))}
        </div>
        <div className="panel panel-inner stack">
          <div className="kicker">Design note</div>
          <p className="card-subtitle">
            This view intentionally behaves like a clean planner spread rather than a widget carnival. Text rows, ruled space, and light ink keep noise down.
          </p>
        </div>
      </section>
    </div>
  );
}
