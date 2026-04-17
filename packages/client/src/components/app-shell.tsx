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
      <div className="page-shell">
        <div className="grid min-h-screen gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <aside
            className={cn(
              'h-fit border-b border-[rgba(15,23,40,0.08)] pb-6 pr-0 lg:sticky lg:top-8 lg:block lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8',
              menuOpen ? 'block' : 'hidden lg:block',
            )}
          >
            <div className="editorial-rule space-y-5 pb-8">
              <div className="flex items-center justify-between gap-3 lg:block">
                <div className="space-y-3">
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                    Publishing home
                  </p>
                  <p className="text-[1.8rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-[color:var(--color-text-primary)]">
                    Books, ballots, calendars, and club notes in one focused workspace.
                  </p>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    Leaner like WordPress.com: clearer product chrome, stronger CTAs, and more breathable content blocks.
                  </p>
                </div>

                <button
                  className="pressable inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] lg:hidden"
                  onClick={() => setMenuOpen((current) => !current)}
                  type="button"
                >
                  {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  Sections
                </button>
              </div>

              {currentUser ? (
                <div className="rounded-[var(--radius-lg)] border border-[rgba(15,23,40,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.98))] p-4">
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
                    className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border-strong)] bg-[rgba(255,255,255,0.96)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)] hover:bg-[color:var(--color-canvas-subtle)]"
                    onClick={onLogout}
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : null}

              <nav className="space-y-1 border-t border-[rgba(15,23,40,0.08)] pt-5">
                {navigation.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-transparent px-3 py-3 text-sm font-semibold tracking-[-0.01em] transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)]',
                        isActive
                          ? 'border-[rgba(29,78,216,0.12)] bg-[color:var(--color-accent-primary-soft)] text-[color:var(--color-text-primary)]'
                          : 'text-[color:var(--color-text-secondary)] hover:translate-x-1 hover:border-[rgba(15,23,40,0.06)] hover:bg-white hover:text-[color:var(--color-text-primary)]',
                      )
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[color:var(--color-text-accent)]" />
                      <span>{label}</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                      {to === '/' ? 'Home' : 'Page'}
                    </span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          <main className="surface-raised min-w-0 p-4 sm:p-5 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
};
