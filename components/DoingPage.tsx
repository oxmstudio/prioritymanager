'use client';

import { useMemo, useState } from 'react';
import { formatMonthYear, formatShortDate, todayIso } from '../lib/date';
import { usePlanner } from '../lib/store';
import type { DependencyType, Priority, WorkType } from '../lib/types';

export function DoingPage() {
  const { state, addTask, toggleTaskComplete, updateTask } = usePlanner();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('A');
  const [workType, setWorkType] = useState<WorkType>('operational');
  const [dependencyType, setDependencyType] = useState<DependencyType>('independent');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [roleId, setRoleId] = useState('');
  const today = todayIso();

  const todayTasks = useMemo(() => state.tasks.filter((task) => task.date === today && task.status !== 'deleted'), [state.tasks, today]);
  const queueTasks = useMemo(() => state.tasks.filter((task) => task.status === 'active' && task.date >= today), [state.tasks, today]);
  const projectTasks = queueTasks.filter((task) => task.workType === 'project');

  function createTask() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      date: today,
      priority,
      stage: 'doing',
      workType,
      dependencyType,
      dependsOnTaskId: dependencyType === 'dependent' ? relatedTaskId || undefined : undefined,
      blocksTaskId: dependencyType === 'blocks' ? relatedTaskId || undefined : undefined,
      linkedRoleId: roleId || undefined,
      sourceType: 'manual',
    });
    setTitle('');
  }

  return (
    <div className="stack">
      <div className="topbar">
        <div className="page-title">
          <h2>Doing</h2>
          <p>Execute with clarity across Today, Month, task queue, project dependencies, and protected time.</p>
        </div>
        <div className="badge">{formatMonthYear(new Date())}</div>
      </div>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div className="kicker">Task Queue</div>
          <div className="grid-2">
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
            <select className="select" value={roleId} onChange={(e) => setRoleId(e.target.value)}><option value="">Role (optional)</option>{state.roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
          </div>
          <div className="grid-3">
            <select className="select" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}><option value="A">A</option><option value="B">B</option></select>
            <select className="select" value={workType} onChange={(e) => setWorkType(e.target.value as WorkType)}><option value="operational">Operational Work</option><option value="project">Project</option></select>
            <select className="select" value={dependencyType} onChange={(e) => setDependencyType(e.target.value as DependencyType)}><option value="independent">Independent</option><option value="dependent">Dependent on</option><option value="blocks">Blocks</option></select>
          </div>
          {dependencyType !== 'independent' ? <select className="select" value={relatedTaskId} onChange={(e) => setRelatedTaskId(e.target.value)}><option value="">Select related task</option>{queueTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select> : null}
          <button className="button" onClick={createTask}>Add to queue</button>
        </div>

        <div className="panel panel-inner stack">
          <div className="kicker">Protected Time</div>
          <h3 className="card-title">{state.settings.biologicalPeakStart} – {state.settings.biologicalPeakEnd}</h3>
          <p className="card-subtitle">Reserve this for high-value A priorities and project milestones.</p>
          <div className="badge">Today tasks: {todayTasks.length}</div>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel panel-inner stack">
          <div className="kicker">Today</div>
          <div className="item-list">
            {todayTasks.map((task) => (
              <div className="item" key={task.id}>
                <div className="row spread wrap"><strong>{task.title}</strong><span className={`badge ${task.priority === 'A' ? 'a' : 'b'}`}>{task.priority}</span></div>
                <div className="row wrap">
                  <span className="badge">{task.workType || 'operational'}</span>
                  <span className="badge">{task.dependencyType || 'independent'}</span>
                  <button className="button-ghost" onClick={() => toggleTaskComplete(task.id)}>{task.status === 'completed' ? 'Mark active' : 'Mark complete'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-inner stack">
          <div className="kicker">Month</div>
          <p className="card-subtitle">Upcoming workload within this month planner cycle.</p>
          <div className="item-list">{queueTasks.slice(0, 12).map((task) => <div className="item" key={task.id}><div className="row spread wrap"><strong>{task.title}</strong><span className="small">{formatShortDate(task.date)}</span></div></div>)}</div>
        </div>
      </section>

      <section className="panel panel-inner stack">
        <div className="kicker">Project Board / Dependencies</div>
        <div className="item-list">
          {projectTasks.length === 0 ? <div className="empty">No project-classified work yet.</div> : projectTasks.map((task) => (
            <div className="item" key={task.id}>
              <div className="row spread wrap"><strong>{task.title}</strong><span className="badge">{task.dependencyType || 'independent'}</span></div>
              <div className="row wrap">
                {task.dependsOnTaskId ? <span className="small">Depends on: {state.tasks.find((t) => t.id === task.dependsOnTaskId)?.title || 'unknown'}</span> : null}
                {task.blocksTaskId ? <span className="small">Blocks: {state.tasks.find((t) => t.id === task.blocksTaskId)?.title || 'unknown'}</span> : null}
                <button className="button-ghost" onClick={() => updateTask(task.id, { stage: 'delivering' })}>Move to Delivering</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
