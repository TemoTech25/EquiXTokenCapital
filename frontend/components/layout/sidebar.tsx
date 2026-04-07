import Link from 'next/link';
import { Building2, FileText, LayoutDashboard, Shield, ShieldCheck, Workflow, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/deals', label: 'Deals', icon: Handshake },
  { href: '/transactions', label: 'Transactions', icon: Workflow },
  { href: '/ownership', label: 'Ownership', icon: ShieldCheck },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/admin', label: 'Admin', icon: Shield },
  { href: '/auth', label: 'Auth', icon: Building2 }
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-4 lg:block">
      <div className="mb-8 px-3 py-4">
        <h1 className="text-xl font-bold text-slate-800">EquiX Capital</h1>
        <p className="text-xs text-slate-500">Fintech operations console</p>
      </div>
      <nav className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
