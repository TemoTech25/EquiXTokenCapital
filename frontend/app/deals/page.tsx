import { AppShell } from '@/components/layout/app-shell';
import { SectionPage } from '@/components/layout/section-page';

export default function DealsPage() {
  return (
    <AppShell>
      <SectionPage
        title="Deals"
        description="Manage deals workflows in the EquiX fintech dashboard."
      />
    </AppShell>
  );
}
