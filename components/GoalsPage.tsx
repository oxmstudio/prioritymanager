'use client';

import { useState } from 'react';
import { usePlanner } from '../lib/store';
import type { GoalType } from '../lib/types';

export function GoalsPage() {
  const { state, addGoal, toggleGoalActive } = usePlanner();
  const [type, setType] = useState<GoalType>('monthly');
  const [title, setTitle] = useState('');
  const [specific, setSpecific] = useState('');
  const [measurable, setMeasurable] = useState('');
  const [attainable, setAttainable] = useState('');
  const [relevant, setRelevant] = useState('');
  const [trackable, setTrackable] = useState('');

  const dailyGoals = state.goals.filter((goal) => goal.type === 'daily');
  const monthlyGoals = state.goals.filter((goal) => goal.type === 'monthly');
  const quarterlyGoals = state.goals.filter((goal) => goal.type === 'quarterly');
  const annualGoals = state.goals.filter((goal) => goal.type === 'annual');

  function submit() {
    if (!title.trim()) return;
    addGoal({
      type,
      title: title.trim(),
      specific: specific.trim(),
      measurable: measurable.trim(),
      attainable: attainable.trim(),
      relevant: relevant.trim(),
      trackable: trackable.trim(),
    });
    setTitle('');
    setSpecific('');
    setMeasurable('');
    setAttainable('');
    setRelevant('');
    setTrackable('');
  }

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Goals &amp; strategy</h2>
          <p>Keep the active list narrow. This page is for a few high-impact items, not a warehouse of noble intentions.</p>
        </div>
        <div className="row wrap">
          <span className="badge">Daily {dailyGoals.length}</span>
          <span className="badge">Monthly {monthlyGoals.length}</span>
          <span className="badge">Quarterly {quarterlyGoals.length}</span>
          <span className="badge">Annual {annualGoals.length}</span>
        </div>
      </div>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div>
            <div className="kicker">SMART builder</div>
            <h3 className="card-title">Create a strategy item</h3>
          </div>
          <div className="grid-2">
            <label className="label">
              Type
              <select className="select" value={type} onChange={(event) => setType(event.target.value as GoalType)}>
                <option value="daily">Daily objective</option>
                <option value="monthly">Monthly goal</option>
                <option value="quarterly">Quarterly objective</option>
                <option value="annual">Annual strategy</option>
              </select>
            </label>
            <label className="label">
              Title
              <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Name the goal" />
            </label>
          </div>
          <label className="label">
            Specific
            <textarea className="textarea" rows={3} value={specific} onChange={(event) => setSpecific(event.target.value)} placeholder="What exactly is the target?" />
          </label>
          <label className="label">
            Measurable
            <textarea className="textarea" rows={3} value={measurable} onChange={(event) => setMeasurable(event.target.value)} placeholder="How will you know it is working?" />
          </label>
          <label className="label">
            Attainable
            <textarea className="textarea" rows={3} value={attainable} onChange={(event) => setAttainable(event.target.value)} placeholder="Why is this realistic in the current season?" />
          </label>
          <label className="label">
            Relevant
            <textarea className="textarea" rows={3} value={relevant} onChange={(event) => setRelevant(event.target.value)} placeholder="Why does it matter now?" />
          </label>
          <label className="label">
            Trackable
            <textarea className="textarea" rows={3} value={trackable} onChange={(event) => setTrackable(event.target.value)} placeholder="How will you review progress?" />
          </label>
          <button className="button" onClick={submit}>Add strategy item</button>
        </div>

        <div className="stack">
          <div className="panel panel-inner stack">
            <div>
              <div className="kicker">Daily objectives</div>
              <h3 className="card-title">Small commitments for today</h3>
            </div>
            {dailyGoals.length === 0 ? (
              <div className="empty">No daily objectives yet.</div>
            ) : (
              <div className="item-list">
                {dailyGoals.map((goal) => (
                  <div className="item" key={goal.id}>
                    <div className="row spread wrap">
                      <h4>{goal.title}</h4>
                      <button className={`tab ${goal.active ? 'active' : ''}`} onClick={() => toggleGoalActive(goal.id)}>
                        {goal.active ? 'Active' : 'Paused'}
                      </button>
                    </div>
                    <p>{goal.specific}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel panel-inner stack">
            <div>
              <div className="kicker">Quarterly objectives</div>
              <h3 className="card-title">90-day progress bets</h3>
            </div>
            {quarterlyGoals.length === 0 ? (
              <div className="empty">No quarterly objectives yet.</div>
            ) : (
              <div className="item-list">
                {quarterlyGoals.map((goal) => (
                  <div className="item" key={goal.id}>
                    <div className="row spread wrap">
                      <h4>{goal.title}</h4>
                      <button className={`tab ${goal.active ? 'active' : ''}`} onClick={() => toggleGoalActive(goal.id)}>
                        {goal.active ? 'Active' : 'Paused'}
                      </button>
                    </div>
                    <p>{goal.measurable}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel panel-inner stack">
            <div>
              <div className="kicker">Annual strategies</div>
              <h3 className="card-title">3 to 5 high-level moves</h3>
            </div>
            {annualGoals.length === 0 ? (
              <div className="empty">No annual strategies yet.</div>
            ) : (
              <div className="item-list">
                {annualGoals.map((goal) => (
                  <div className="item" key={goal.id}>
                    <div className="row spread wrap">
                      <h4>{goal.title}</h4>
                      <button className={`tab ${goal.active ? 'active' : ''}`} onClick={() => toggleGoalActive(goal.id)}>
                        {goal.active ? 'Active' : 'Paused'}
                      </button>
                    </div>
                    <p>{goal.specific}</p>
                    <div className="small">Trackable: {goal.trackable || 'Not set yet'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel panel-inner stack">
            <div>
              <div className="kicker">Monthly goals</div>
              <h3 className="card-title">Small enough to steer, strong enough to matter</h3>
            </div>
            {monthlyGoals.length === 0 ? (
              <div className="empty">No monthly goals yet.</div>
            ) : (
              <div className="item-list">
                {monthlyGoals.map((goal) => (
                  <div className="item" key={goal.id}>
                    <div className="row spread wrap">
                      <h4>{goal.title}</h4>
                      <button className={`tab ${goal.active ? 'active' : ''}`} onClick={() => toggleGoalActive(goal.id)}>
                        {goal.active ? 'Active' : 'Paused'}
                      </button>
                    </div>
                    <p>{goal.measurable}</p>
                    <div className="small">Relevant: {goal.relevant || 'Not set yet'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
