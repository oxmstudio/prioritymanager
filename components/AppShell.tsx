'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlanner } from '../lib/store';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/today', label: 'Today' },
  { href: '/month', label: 'Month' },
  { href: '/triage', label: 'Triage' },
  { href: '/communications', label: 'Communications' },
  { href: '/goals', label: 'Goals' },
  { href: '/someday', label: 'Someday' },
  { href: '/review', label: 'Review' },
  { href: 'https://mbswebapp.vercel.app/', label: 'Statistics', external: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, isLoaded } = usePlanner();

  const activeTasks = state.tasks.filter((task) => task.status === 'active').length;
  const mindTraffic = state.triageItems.filter((item) => item.decision !== 'delete').length;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Priority Manager</h1>
          <p>One plan. Clear mind. Right priorities.</p>
        </div>

        <nav className="nav">
          {links.map((link) => {
            const isExternal = Boolean(link.external);
            const isActive = !isExternal && pathname === link.href;
            const className = `nav-link ${isActive ? 'active' : ''}`;
            const content = (
              <>
                <span>{link.label}</span>
                {link.href === '/triage' ? <span className="small">{mindTraffic}</span> : null}
              </>
            );

            return isExternal ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <strong>Today&apos;s Formula</strong>
          <div className="stack small">
            <span>Right task</span>
            <span>Right process</span>
            <span>Right tools</span>
            <span>Results</span>
          </div>
          <div className="hr" />
          <div className="small">{isLoaded ? `${activeTasks} active tasks` : 'Loading tasks...'}</div>
          <div className="small">Mind traffic captured: {mindTraffic}</div>
        </div>
      </aside>

      <main className="content-wrap">
        {!isLoaded ? (
          <div className="panel panel-inner stack">
            <div className="kicker">Loading</div>
            <h2 className="card-title">Opening your planner...</h2>
            <p className="card-subtitle">A quick breath while the local workspace is restored.</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
