import { AppShell } from '@/components/layout/app-shell';
import { SectionPage } from '@/components/layout/section-page';

export default function DocumentsPage() {
  return (
    <AppShell>
      <SectionPage
        title="Documents"
        description="Manage documents workflows in the EquiX fintech dashboard."
      />
    </AppShell>
  );
}
