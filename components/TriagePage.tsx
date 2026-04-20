'use client';

import { useMemo, useState } from 'react';
import { formatShortDate, todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';
import type { Priority, TriageDecision } from '../lib/types';

export function TriagePage() {
  const { state, addTriageDecision } = usePlanner();
  const [text, setText] = useState('');
  const [decision, setDecision] = useState<TriageDecision>('do');
  const [activationDate, setActivationDate] = useState(todayIso());
  const [delegatedTo, setDelegatedTo] = useState('');
  const [priority, setPriority] = useState<Priority>('A');
  const [title, setTitle] = useState('');

  const stats = useMemo(() => {
    return {
      do: state.triageItems.filter((item) => item.decision === 'do').length,
      date: state.triageItems.filter((item) => item.decision === 'date').length,
      delegate: state.triageItems.filter((item) => item.decision === 'delegate').length,
      delete: state.triageItems.filter((item) => item.decision === 'delete').length,
    };
  }, [state.triageItems]);

  function submit() {
    if (!text.trim()) return;
    addTriageDecision({
      text: text.trim(),
      decision,
      activationDate: decision === 'date' || decision === 'delegate' ? activationDate : todayIso(),
      delegatedTo: decision === 'delegate' ? delegatedTo : undefined,
      priority,
      title: title.trim() || undefined,
    });

    setText('');
    setTitle('');
    setDelegatedTo('');
  }

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Triage</h2>
          <p>Clear mind traffic. Decide once. Move the item into the right lane and let your brain stop babysitting it.</p>
        </div>
        <div className="row wrap">
          <span className="badge">Do {stats.do}</span>
          <span className="badge">Date {stats.date}</span>
          <span className="badge">Delegate {stats.delegate}</span>
          <span className="badge">Delete {stats.delete}</span>
        </div>
      </div>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">4D formula</div>
            <h3 className="card-title">Capture and decide</h3>
          </div>
          <label className="label">
            Raw input
            <textarea
              className="textarea"
              rows={7}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Email, thought, request, reminder, sticky-note ghost..."
            />
          </label>
          <label className="label">
            Short title
            <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional cleaner title for the resulting task" />
          </label>
          <div className="tabs">
            {[
              { key: 'do', label: 'Do it now' },
              { key: 'date', label: 'Date activate it' },
              { key: 'delegate', label: 'Delegate it' },
              { key: 'delete', label: 'Delete it' },
            ].map((option) => (
              <button
                key={option.key}
                className={`tab ${decision === option.key ? 'active' : ''}`}
                onClick={() => setDecision(option.key as TriageDecision)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          {decision !== 'delete' ? (
            <div className="grid-2">
              <label className="label">
                Priority
                <select className="select" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </label>
              <label className="label">
                Activation date
                <input className="field" type="date" value={activationDate} onChange={(event) => setActivationDate(event.target.value)} />
              </label>
            </div>
          ) : null}

          {decision === 'delegate' ? (
            <label className="label">
              Delegate to
              <input className="field" value={delegatedTo} onChange={(event) => setDelegatedTo(event.target.value)} placeholder="Person or team" />
            </label>
          ) : null}

          <div className="row wrap">
            <button className="button" onClick={submit}>
              Save decision
            </button>
            <span className="small">Tools should reduce work. This form stays short on purpose.</span>
          </div>
        </div>

        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">Decision log</div>
            <h3 className="card-title">Recently processed items</h3>
          </div>
          {state.triageItems.length === 0 ? (
            <div className="empty">No triage items yet.</div>
          ) : (
            <div className="item-list">
              {state.triageItems.map((item) => (
                <div className="item" key={item.id}>
                  <div className="row spread wrap">
                    <span className={`badge ${item.decision === 'delegate' ? 'delegated' : item.decision === 'delete' ? '' : item.decision === 'do' ? 'a' : 'b'}`}>
                      {item.decision}
                    </span>
                    <span className="small">{new Date(item.capturedAt).toLocaleString()}</span>
                  </div>
                  <p>{item.text}</p>
                  <div className="row wrap" style={{ marginTop: 12 }}>
                    {item.activationDate ? <span className="badge">{formatShortDate(item.activationDate)}</span> : null}
                    {item.delegatedTo ? <span className="badge">Delegated to {item.delegatedTo}</span> : null}
                    {item.resultingTaskId ? <span className="badge">Task created</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid-4">
        <div className="panel panel-inner">
          <div className="kicker">Do</div>
          <p className="card-subtitle">For urgent items that belong on today&apos;s page immediately.</p>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Date</div>
          <p className="card-subtitle">For real work that matters, just not now. Assign it a date and release it.</p>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Delegate</div>
          <p className="card-subtitle">Capture owner and follow-up so delegated work does not dissolve into mist.</p>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Delete</div>
          <p className="card-subtitle">A ceremonial trapdoor for things that should never rent space in your head again.</p>
        </div>
      </section>
    </div>
  );
}
