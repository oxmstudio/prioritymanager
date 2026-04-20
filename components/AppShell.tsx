'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  {
    href: 'https://mbswebapp.vercel.app/',
    label: 'Statistics',
    external: true,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, isLoaded } = usePlanner();
  const [selectedHref, setSelectedHref] = useState(pathname);

  const activeTasks = state.tasks.filter((task) => task.status === 'active').length;
  const mindTraffic = state.triageItems.filter((item) => item.decision !== 'delete').length;

  useEffect(() => {
    setSelectedHref(pathname);
  }, [pathname]);

  const dropdownOptions = useMemo(
    () =>
      links.map((link) => ({
        ...link,
        optionLabel: link.href === '/triage' ? `${link.label} (${mindTraffic})` : link.label,
      })),
    [mindTraffic],
  );

  function handleNavigate(nextHref: string) {
    const target = links.find((link) => link.href === nextHref);
    if (!target) return;

    if (target.external) {
      window.open(target.href, '_blank', 'noopener,noreferrer');
      setSelectedHref(pathname);
      return;
    }

    setSelectedHref(target.href);
    router.push(target.href);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Priority Manager</h1>
          <p>One plan. Clear mind. Right priorities.</p>
        </div>

        <div className="nav-dropdown-wrap">
          <label className="label" htmlFor="planner-nav">
            Workspace
            <select
              id="planner-nav"
              className="select nav-dropdown"
              value={selectedHref}
              onChange={(event) => handleNavigate(event.target.value)}
            >
              {dropdownOptions.map((link) => (
                <option key={link.href} value={link.href}>
                  {link.optionLabel}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="sidebar-footer speech-bubble speech-bubble-small">
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
          <div className="panel panel-inner stack speech-bubble">
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
