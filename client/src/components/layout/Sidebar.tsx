import { CheckCircle2, LayoutDashboard, ListChecks, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
];

export const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <>
    {open ? (
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default bg-ink-900/30 lg:hidden"
      />
    ) : null}

    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-white transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-line px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <CheckCircle2 className="size-5" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink-900">Workforce</p>
            <p className="text-xs text-ink-500">Admin console</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-lg p-1.5 text-ink-300 hover:bg-surface hover:text-ink-700 lg:hidden"
        >
          <X className="size-4.5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                  : 'text-ink-500 hover:bg-surface hover:text-ink-900',
              )
            }
          >
            <Icon className="size-4.5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-xl bg-mint-50 p-4 ring-1 ring-mint-100">
        <p className="text-xs font-semibold text-mint-800">Audit trail enabled</p>
        <p className="mt-1 text-xs leading-relaxed text-mint-700">
          Every employee removal is recorded with a reason and the tasks it released.
        </p>
      </div>
    </aside>
  </>
);
