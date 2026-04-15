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
    <div className="min-h-screen text-[color:var(--color-text-primary)]">
      <div className="page-shell grid min-h-screen gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
        <button
          className="inline-flex items-center gap-2 self-start rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-base)] px-4 py-3 text-sm font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>

        <aside
          className={cn(
            'surface-base h-fit p-4 lg:sticky lg:top-6 lg:block',
            menuOpen ? 'block' : 'hidden',
          )}
        >
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-default)] px-4 py-5">
            <p className="eyebrow text-[color:var(--color-text-muted)]">
              Book Club Manager
            </p>
            <h1 className="mt-3 font-editorial text-[2.2rem] leading-[0.95] tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              A calmer club rhythm.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">
              Keep books, meetings, and shared decisions in one bright,
              readable place.
            </p>
          </div>

          {currentUser ? (
            <div className="mt-5 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-raised)] px-4 py-4">
              <div className="flex items-center gap-3">
                {currentUser.avatarUrl ? (
                  <img
                    alt={currentUser.name}
                    className="h-11 w-11 rounded-full object-cover"
                    src={currentUser.avatarUrl}
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-accent-primary-soft)] text-sm font-semibold text-[color:var(--color-text-accent)]">
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--color-text-primary)]">
                    {currentUser.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-text-accent)]" />
                    <span>{currentUser.role}</span>
                  </div>
                </div>
              </div>

              <button
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-base)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-text-primary)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
                onClick={onLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : null}

          <nav className="mt-5 space-y-1.5">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-[var(--radius-lg)] px-3.5 py-3 text-sm font-medium transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)]',
                    isActive
                      ? 'bg-[color:var(--color-accent-primary-soft)] text-[color:var(--color-text-accent)]'
                      : 'text-[color:var(--color-text-secondary)] hover:-translate-y-0.5 hover:bg-[color:var(--color-canvas-subtle)] hover:text-[color:var(--color-text-primary)]',
                  )
                }
              >
                <Icon className="h-4 w-4 transition-transform duration-[var(--motion-duration-fast)] group-hover:scale-105" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 rounded-[var(--radius-xl)] border border-[color:var(--color-border-soft)] bg-white/50 p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
