import type { PropsWithChildren } from 'react';
import {
  BookOpenText,
  CalendarDays,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '../lib/utils';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: BookOpenText },
  { to: '/meetings', label: 'Meetings', icon: CalendarDays },
  { to: '/members', label: 'Members', icon: Users },
];

export const AppShell = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-800 bg-panel p-5 shadow-glow">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
              Book Club
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Manager</h1>
            <p className="mt-3 text-sm text-slate-400">
              Organize reading lists, meetings, and votes in one place.
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-violet-500/15 text-violet-200'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="rounded-3xl border border-slate-800 bg-panelAlt/80 p-6 shadow-glow">
          {children}
        </main>
      </div>
    </div>
  );
};
