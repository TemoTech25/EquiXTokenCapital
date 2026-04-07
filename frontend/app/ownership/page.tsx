import { AppShell } from '@/components/layout/app-shell';
import { SectionPage } from '@/components/layout/section-page';

export default function OwnershipPage() {
  return (
    <AppShell>
      <SectionPage
        title="Ownership"
        description="Manage ownership workflows in the EquiX fintech dashboard."
      />
    </AppShell>
  );
}
