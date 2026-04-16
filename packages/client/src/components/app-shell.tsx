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
  X,
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
      <div className="page-shell grid min-h-screen gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <button
          className="pressable inline-flex items-center gap-2 self-start rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Menu
        </button>

        <aside
          className={cn(
            'surface-base h-fit p-4 lg:sticky lg:top-6 lg:block',
            menuOpen ? 'block' : 'hidden',
          )}
        >
          <div className="space-y-4 border-b border-[color:var(--color-border-soft)] px-1 pb-5">
            <div className="page-header gap-3">
              <p className="eyebrow">Book Club Manager</p>
              <div className="space-y-2">
                <h1 className="text-[1.45rem] font-semibold leading-[1.02] tracking-[-0.035em] text-[color:var(--color-text-primary)]">
                  A quieter home for books, meetings, and club decisions.
                </h1>
                <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                  Clear structure, lighter surfaces, and one place to keep the
                  club in rhythm.
                </p>
              </div>
            </div>
          </div>

          {currentUser ? (
            <div className="mt-5 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.72)] p-4">
              <div className="flex items-center gap-3">
                {currentUser.avatarUrl ? (
                  <img
                    alt={currentUser.name}
                    className="h-11 w-11 rounded-full border border-[color:var(--color-border-soft)] object-cover"
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
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-text-accent)]" />
                    <span>{currentUser.role}</span>
                  </div>
                </div>
              </div>

              <button
                className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
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
                      ? 'border border-[color:rgba(42,93,176,0.08)] bg-[color:var(--color-accent-primary-soft)] text-[color:var(--color-text-accent)]'
                      : 'border border-transparent text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-soft)] hover:bg-[rgba(255,255,255,0.68)] hover:text-[color:var(--color-text-primary)]',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="surface-base min-w-0 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
