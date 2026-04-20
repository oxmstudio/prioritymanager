'use client';

import { useState } from 'react';
import { todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';

export function SomedayPage() {
  const { state, addSomedayItem, activateSomedayToTask } = usePlanner();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [activateDates, setActivateDates] = useState<Record<string, string>>({});

  function submit() {
    if (!title.trim()) return;
    addSomedayItem({ title: title.trim(), note: note.trim() });
    setTitle('');
    setNote('');
  }

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Someday file</h2>
          <p>A quiet parking lot for ideas, phantom goals, and future sparks that should leave your conscious mind alone for now.</p>
        </div>
        <div className="badge">Stored ideas {state.somedayItems.length}</div>
      </div>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">Capture</div>
            <h3 className="card-title">Add to Someday</h3>
          </div>
          <label className="label">
            Idea title
            <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Future idea, possible project, maybe-later move" />
          </label>
          <label className="label">
            Notes
            <textarea className="textarea" rows={5} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Enough context so future-you knows what present-you meant" />
          </label>
          <button className="button" onClick={submit}>Store idea</button>
        </div>

        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">Phantom goals</div>
            <h3 className="card-title">Stored without pressure</h3>
          </div>
          {state.somedayItems.length === 0 ? (
            <div className="empty">Nothing in Someday yet.</div>
          ) : (
            <div className="item-list">
              {state.somedayItems.map((item) => (
                <div className="item" key={item.id}>
                  <div className="row spread wrap">
                    <h4>{item.title}</h4>
                    {item.activatedTaskId ? <span className="badge done">Activated</span> : <span className="badge">Someday</span>}
                  </div>
                  {item.note ? <p>{item.note}</p> : null}
                  <div className="row wrap" style={{ marginTop: 12 }}>
                    {!item.activatedTaskId ? (
                      <>
                        <input
                          className="field"
                          type="date"
                          style={{ maxWidth: 190 }}
                          value={activateDates[item.id] ?? todayIso()}
                          onChange={(event) => setActivateDates((current) => ({ ...current, [item.id]: event.target.value }))}
                        />
                        <button className="button-ghost" onClick={() => activateSomedayToTask(item.id, activateDates[item.id] ?? todayIso())}>
                          Activate as task
                        </button>
                      </>
                    ) : (
                      <span className="small">This idea now has a live task attached.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
