'use client';

import { useMemo, useState } from 'react';
import { todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';
import type { GoalType, Priority, Quadrant, TriageDecision } from '../lib/types';

export function DecidingPage() {
  const { state, updatePlanningProfile, addRole, addGoal, toggleGoalActive, addTriageDecision, addSomedayItem, activateSomedayToTask } = usePlanner();
  const [openSection, setOpenSection] = useState<'identity' | 'goals' | 'classification' | 'triage' | 'someday' | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [profile, setProfile] = useState(state.planningProfile);
  const [roleName, setRoleName] = useState('');
  const [roleMission, setRoleMission] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('monthly');
  const [goalRoleId, setGoalRoleId] = useState('');
  const [triageText, setTriageText] = useState('');
  const [triageDecision, setTriageDecision] = useState<TriageDecision>('do');
  const [quadrant, setQuadrant] = useState<Quadrant>('Q2');
  const [priority, setPriority] = useState<Priority>('A');
  const [somedayTitle, setSomedayTitle] = useState('');

  function toggleSection(section: 'identity' | 'goals' | 'classification' | 'triage' | 'someday') {
    setOpenSection((current) => (current === section ? null : section));
  }

  const goalCounts = useMemo(() => ({
    daily: state.goals.filter((g) => g.type === 'daily').length,
    monthly: state.goals.filter((g) => g.type === 'monthly').length,
    quarterly: state.goals.filter((g) => g.type === 'quarterly').length,
    annual: state.goals.filter((g) => g.type === 'annual').length,
  }), [state.goals]);

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Deciding</h2>
          <p>Define who you are, what matters, and what should enter execution.</p>
        </div>
        <div className="row wrap">
          <button
            type="button"
            className="gear-button"
            aria-expanded={showSettings}
            aria-label="Open deciding settings"
            title="Settings"
            onClick={() => setShowSettings((current) => !current)}
          >
            ⚙️
          </button>
          <div className="badge">Upstream planning layer</div>
        </div>
      </div>

      {showSettings ? (
        <section className="panel panel-inner stack">
          <div className="row spread wrap">
            <div>
              <div className="kicker">Settings</div>
              <h3 className="card-title">Identity reference</h3>
            </div>
            <button className="button-ghost" onClick={() => setShowSettings(false)}>Close</button>
          </div>
          <div className="item">
            <h4>Identity summary</h4>
            <p>Role setup now lives in Step 1 so planning context is visible directly in the workflow.</p>
          </div>
          <div className="item-list">
            {state.roles.map((role) => <div key={role.id} className="item"><strong>{role.name}</strong><p>{role.mission || 'No mission set yet.'}</p></div>)}
          </div>
        </section>
      ) : null}

      <section className="stack">
        <article className="panel panel-inner stack">
          <button type="button" className="accordion-trigger" aria-expanded={openSection === 'identity'} onClick={() => toggleSection('identity')}>
            <span>
              <span className="kicker">Step 1 · Roles / Mission / Values</span>
              <strong>Set identity before priorities.</strong>
            </span>
            <span className="small">Why: goals and tasks need a stable direction.</span>
          </button>
          {openSection === 'identity' ? (
            <div className="stack">
              <label className="label">Mission<input className="field" value={profile.mission} onChange={(e) => setProfile({ ...profile, mission: e.target.value })} /></label>
              <label className="label">Purpose<input className="field" value={profile.purpose} onChange={(e) => setProfile({ ...profile, purpose: e.target.value })} /></label>
              <label className="label">Values<textarea className="textarea" rows={3} value={profile.values} onChange={(e) => setProfile({ ...profile, values: e.target.value })} /></label>
              <label className="label">Priority themes (comma separated)
                <input className="field" value={profile.priorityThemes.join(', ')} onChange={(e) => setProfile({ ...profile, priorityThemes: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
              </label>
              <div className="grid-2">
                <input className="field" placeholder="Role name" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                <input className="field" placeholder="Role mission" value={roleMission} onChange={(e) => setRoleMission(e.target.value)} />
              </div>
              <div className="row wrap">
                <button className="button" onClick={() => updatePlanningProfile(profile)}>Save planning profile</button>
                <button className="button-ghost" onClick={() => { if (!roleName.trim()) return; addRole({ name: roleName.trim(), mission: roleMission.trim() }); setRoleName(''); setRoleMission(''); }}>Add role</button>
              </div>
            </div>
          ) : null}
        </article>

        <article className="panel panel-inner stack">
          <button type="button" className="accordion-trigger" aria-expanded={openSection === 'goals'} onClick={() => toggleSection('goals')}>
            <span>
              <span className="kicker">Step 2 · SMART Goals & Objectives</span>
              <strong>Translate identity into measurable objectives.</strong>
            </span>
            <span className="small">Why: SMART goals define what “good execution” means.</span>
          </button>
          {openSection === 'goals' ? (
            <div className="stack">
              <div className="small">Daily {goalCounts.daily} · Monthly {goalCounts.monthly} · Quarterly {goalCounts.quarterly} · Annual {goalCounts.annual}</div>
              <div className="grid-3">
                <select className="select" value={goalType} onChange={(e) => setGoalType(e.target.value as GoalType)}><option value="daily">Daily</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select>
                <select className="select" value={goalRoleId} onChange={(e) => setGoalRoleId(e.target.value)}><option value="">Link to role (optional)</option>{state.roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
                <input className="field" value={goalTitle} placeholder="Goal title" onChange={(e) => setGoalTitle(e.target.value)} />
              </div>
              <button className="button" onClick={() => { if (!goalTitle.trim()) return; addGoal({ type: goalType, title: goalTitle.trim(), specific: '', measurable: '', attainable: '', relevant: '', trackable: '', linkedRoleId: goalRoleId || undefined, stage: 'deciding' }); setGoalTitle(''); }}>Add goal</button>
              <div className="item-list">{state.goals.map((goal) => <div key={goal.id} className="item"><div className="row spread"><strong>{goal.title}</strong><button className={`tab ${goal.active ? 'active' : ''}`} onClick={() => toggleGoalActive(goal.id)}>{goal.active ? 'Active' : 'Paused'}</button></div></div>)}</div>
            </div>
          ) : null}
        </article>

        <article className="panel panel-inner stack">
          <button type="button" className="accordion-trigger" aria-expanded={openSection === 'classification'} onClick={() => toggleSection('classification')}>
            <span>
              <span className="kicker">Step 3 · Work Type Classification</span>
              <strong>Decide Operational Work vs Projects.</strong>
            </span>
            <span className="small">Why: routine work and projects need different handling and risk controls.</span>
          </button>
          {openSection === 'classification' ? (
            <div className="grid-2">
              <div className="item">
                <h4>Operational Work</h4>
                <p>Ongoing, repetitive, checklist-oriented activity with simpler planning needs.</p>
              </div>
              <div className="item">
                <h4>Projects</h4>
                <p>Temporary, unique, dependency-aware work that may block or depend on other items.</p>
              </div>
            </div>
          ) : null}
        </article>

        <article className="panel panel-inner stack">
          <button type="button" className="accordion-trigger" aria-expanded={openSection === 'triage'} onClick={() => toggleSection('triage')}>
            <span>
              <span className="kicker">Step 4 · Priority Filter / 4D + Quadrants</span>
              <strong>Process incoming work through a decision engine.</strong>
            </span>
            <span className="small">Why: this prevents reactive overload and protects key goals.</span>
          </button>
          {openSection === 'triage' ? (
            <div className="stack">
              <textarea className="textarea" rows={4} value={triageText} onChange={(e) => setTriageText(e.target.value)} placeholder="Capture item" />
              <div className="grid-3">
                <select className="select" value={triageDecision} onChange={(e) => setTriageDecision(e.target.value as TriageDecision)}><option value="do">Do</option><option value="date">Date</option><option value="delegate">Delegate</option><option value="delete">Delete</option></select>
                <select className="select" value={quadrant} onChange={(e) => setQuadrant(e.target.value as Quadrant)}><option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option></select>
                <select className="select" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}><option value="A">A</option><option value="B">B</option></select>
              </div>
              <button className="button" onClick={() => { if (!triageText.trim()) return; addTriageDecision({ text: triageText.trim(), decision: triageDecision, activationDate: todayIso(), priority, quadrant }); setTriageText(''); }}>Process decision</button>
              <div className="item-list">{state.triageItems.slice(0, 6).map((item) => <div className="item" key={item.id}><div className="row wrap"><span className="badge">{item.decision}</span><span className="badge">{item.quadrant || 'No quadrant'}</span></div><p>{item.text}</p></div>)}</div>
            </div>
          ) : null}
        </article>

        <article className="panel panel-inner stack">
          <button type="button" className="accordion-trigger" aria-expanded={openSection === 'someday'} onClick={() => toggleSection('someday')}>
            <span>
              <span className="kicker">Step 5 · Someday / Incubator</span>
              <strong>Store ideas that are valid but not active now.</strong>
            </span>
            <span className="small">Why: protects focus while preserving future opportunities.</span>
          </button>
          {openSection === 'someday' ? (
            <div className="stack">
              <div className="row wrap">
                <input className="field" style={{ maxWidth: 420 }} placeholder="Capture future project or idea" value={somedayTitle} onChange={(e) => setSomedayTitle(e.target.value)} />
                <button className="button-ghost" onClick={() => { if (!somedayTitle.trim()) return; addSomedayItem({ title: somedayTitle.trim(), linkedRoleId: goalRoleId || undefined }); setSomedayTitle(''); }}>Store</button>
              </div>
              <div className="item-list">{state.somedayItems.map((item) => <div className="item" key={item.id}><div className="row spread"><strong>{item.title}</strong>{item.activatedTaskId ? <span className="badge done">Activated</span> : <button className="button-ghost" onClick={() => activateSomedayToTask(item.id, todayIso())}>Activate</button>}</div></div>)}</div>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}
