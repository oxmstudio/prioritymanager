'use client';

import { useMemo, useState } from 'react';
import { formatShortDate, todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';

export function ReviewPage() {
  const { state, exportState, importState, resetState } = usePlanner();
  const [raw, setRaw] = useState('');
  const [message, setMessage] = useState('');

  const stats = useMemo(() => {
    const completed = state.tasks.filter((task) => task.status === 'completed').length;
    const aCompleted = state.tasks.filter((task) => task.status === 'completed' && task.priority === 'A').length;
    const delegated = state.tasks.filter((task) => task.status === 'delegated').length;
    const withFollowUp = state.communicationEntries.filter((entry) => entry.linkedTaskId).length;
    return { completed, aCompleted, delegated, withFollowUp };
  }, [state.communicationEntries, state.tasks]);

  function downloadExport() {
    const blob = new Blob([exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `priority-manager-export-${todayIso()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function runImport() {
    const result = importState(raw);
    setMessage(result.message);
  }

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Review</h2>
          <p>Reward what works. Review what repeated. Let the system teach you where the actual leverage lives.</p>
        </div>
        <div className="badge">Daily and weekly reflection</div>
      </div>

      <section className="grid-4">
        <div className="panel panel-inner">
          <div className="kicker">Completed tasks</div>
          <div className="metric">{stats.completed}</div>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Completed A tasks</div>
          <div className="metric">{stats.aCompleted}</div>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Delegated items</div>
          <div className="metric">{stats.delegated}</div>
        </div>
        <div className="panel panel-inner">
          <div className="kicker">Linked follow-ups</div>
          <div className="metric">{stats.withFollowUp}</div>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">What went well</div>
            <h3 className="card-title">Recent scorecards</h3>
          </div>
          {state.scorecards.length === 0 ? (
            <div className="empty">No scorecards saved yet.</div>
          ) : (
            <div className="item-list">
              {state.scorecards.map((scorecard) => (
                <div className="item" key={scorecard.date}>
                  <div className="row spread wrap">
                    <h4>{formatShortDate(scorecard.date)}</h4>
                    {scorecard.date === todayIso() ? <span className="badge">Today</span> : null}
                  </div>
                  <ol className="small" style={{ marginTop: 12, paddingLeft: 18 }}>
                    {scorecard.wins.map((win, index) => (
                      <li key={`${scorecard.date}-${index}`}>{win || '—'}</li>
                    ))}
                  </ol>
                  {scorecard.notes ? <p>{scorecard.notes}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">Data controls</div>
            <h3 className="card-title">Export, import, reset</h3>
          </div>
          <div className="row wrap">
            <button className="button" onClick={downloadExport}>Download JSON export</button>
            <button className="button-danger" onClick={resetState}>Reset to demo data</button>
          </div>
          <label className="label">
            Import JSON
            <textarea
              className="textarea"
              rows={10}
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder="Paste a previously exported JSON file here"
            />
          </label>
          <button className="button-ghost" onClick={runImport}>Import state</button>
          {message ? <div className="badge">{message}</div> : null}
        </div>
      </section>

      <section className="panel panel-inner stack">
        <div>
          <div className="kicker">MVP notes</div>
          <h3 className="card-title">What this version optimizes for</h3>
        </div>
        <div className="grid-3">
          <div className="item">
            <h4>Easy deployment</h4>
            <p>No database is required. It runs on Vercel as a simple Next.js app.</p>
          </div>
          <div className="item">
            <h4>Planner feel</h4>
            <p>The month page borrows the spacious rhythm of a paper planner instead of a dashboard wall.</p>
          </div>
          <div className="item">
            <h4>Clear upgrade path</h4>
            <p>When you are ready, replace local storage with real auth and Postgres without redesigning the UI.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
