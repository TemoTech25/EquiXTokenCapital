import { AppShell } from '@/components/layout/app-shell';
import { SectionPage } from '@/components/layout/section-page';

export default function AuthPage() {
  return (
    <AppShell>
      <SectionPage
        title="Auth"
        description="Manage auth workflows in the EquiX fintech dashboard."
      />
    </AppShell>
  );
}
