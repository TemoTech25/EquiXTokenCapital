import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background fintech-grid">
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
