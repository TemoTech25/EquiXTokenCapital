import { Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function TopHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Portfolio Operations</h2>
        <p className="text-xs text-slate-500">Monitor deals, ownership, and document workflows.</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-slate-500" />
        </button>

        <div className="flex items-center gap-3">
          <Avatar name="Alex Morgan" />
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">Alex Morgan</p>
            <Badge>Portfolio Manager</Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
