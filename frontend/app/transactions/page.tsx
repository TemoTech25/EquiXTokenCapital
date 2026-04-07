import { AppShell } from '@/components/layout/app-shell';
import { SectionPage } from '@/components/layout/section-page';

export default function TransactionsPage() {
  return (
    <AppShell>
      <SectionPage
        title="Transactions"
        description="Manage transactions workflows in the EquiX fintech dashboard."
      />
    </AppShell>
  );
}
