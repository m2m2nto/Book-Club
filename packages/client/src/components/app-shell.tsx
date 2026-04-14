import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import {
  BookHeart,
  BookOpenText,
  CalendarDays,
  ChartColumnBig,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  Vote,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import type { CurrentUser } from '../hooks/use-auth';
import { cn } from '../lib/utils';

const baseNavigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: BookOpenText },
  { to: '/wishlist', label: 'Wishlist', icon: BookHeart },
  { to: '/surveys', label: 'Surveys', icon: Vote },
  { to: '/meetings', label: 'Meetings', icon: CalendarDays },
  { to: '/stats', label: 'Stats', icon: ChartColumnBig },
];

type AppShellProps = PropsWithChildren & {
  currentUser?: CurrentUser | null;
  onLogout?: () => void;
};

export const AppShell = ({
  children,
  currentUser = null,
  onLogout,
}: AppShellProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    ...baseNavigation,
    ...(currentUser?.role === 'admin'
      ? [
          { to: '/admin/users', label: 'Users', icon: Users },
          { to: '/admin/export', label: 'Export', icon: ShieldCheck },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-panel px-4 py-3 text-sm text-slate-200 lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>

        <aside
          className={cn(
            'rounded-3xl border border-slate-800 bg-panel p-5 shadow-glow',
            menuOpen ? 'block' : 'hidden lg:block',
          )}
        >
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
              Book Club
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Manager</h1>
            <p className="mt-3 text-sm text-slate-400">
              Organize reading lists, meetings, and votes in one place.
            </p>
          </div>

          {currentUser ? (
            <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center gap-3">
                {currentUser.avatarUrl ? (
                  <img
                    alt={currentUser.name}
                    className="h-10 w-10 rounded-full object-cover"
                    src={currentUser.avatarUrl}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-200">
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{currentUser.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{currentUser.role}</span>
                  </div>
                </div>
              </div>

              <button
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
                onClick={onLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : null}

          <nav className="space-y-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
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
