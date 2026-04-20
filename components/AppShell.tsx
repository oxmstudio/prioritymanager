'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlanner } from '../lib/store';

const workflowNav = [
  {
    stage: 'Deciding',
    href: '/deciding',
    pages: [
      { href: '/deciding', label: 'Roles / Mission / Values' },
    ],
  },
  {
    stage: 'Doing',
    href: '/doing',
    pages: [
      { href: '/doing', label: 'Today / Month / Task Queue' },
    ],
  },
  {
    stage: 'Delivering',
    href: '/delivering',
    pages: [
      { href: '/delivering', label: 'Comms / Delegation / Outcomes' },
    ],
  },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, isLoaded } = usePlanner();

  const stats = useMemo(() => {
    const activeTasks = state.tasks.filter((task) => task.status === 'active').length;
    const projects = state.tasks.filter((task) => task.workType === 'project' && task.status !== 'deleted').length;
    const delegated = state.delegationItems.filter((item) => item.status !== 'complete').length;
    return { activeTasks, projects, delegated };
  }, [state.delegationItems, state.tasks]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Priority Workflow OS</h1>
          <p>Deciding → Doing → Delivering</p>
        </div>

        <nav className="stack">
          {workflowNav.map((group) => {
            const active = pathname.startsWith(group.href);
            return (
              <div key={group.stage} className={`panel panel-inner ${active ? 'workflow-active' : ''}`}>
                <div className="kicker">{group.stage}</div>
                {group.pages.map((page) => (
                  <Link key={page.href} href={page.href} className="nav-link" style={{ marginTop: 8 }}>
                    {page.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="hr" style={{ marginTop: 14, marginBottom: 14 }} />
        <a href="https://mbswebapp.vercel.app/" className="button-ghost" target="_blank" rel="noopener noreferrer">
          Statistics (External)
        </a>

        <div className="sidebar-footer speech-bubble speech-bubble-small">
          <strong>Workflow Pulse</strong>
          <div className="small">{isLoaded ? `${stats.activeTasks} active tasks` : 'Loading tasks...'}</div>
          <div className="small">{stats.projects} project items</div>
          <div className="small">{stats.delegated} open delegations</div>
        </div>
      </aside>

      <main className="content-wrap">{!isLoaded ? <div className="panel panel-inner">Loading planner...</div> : children}</main>
    </div>
  );
}
