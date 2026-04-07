import { AppShell } from '@/components/layout/app-shell';
import { SectionPage } from '@/components/layout/section-page';

export default function AdminPage() {
  return (
    <AppShell>
      <SectionPage
        title="Admin"
        description="Manage admin workflows in the EquiX fintech dashboard."
      />
    </AppShell>
  );
}
