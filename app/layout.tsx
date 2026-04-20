import type { Metadata } from 'next';
import './globals.css';
import { PlannerProvider } from '../lib/store';
import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: 'Priority Manager MVP',
  description: 'A planner-style priority system built for Vercel.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PlannerProvider>
          <AppShell>{children}</AppShell>
        </PlannerProvider>
      </body>
    </html>
  );
}
