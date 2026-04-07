import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  { label: 'Active Deals', value: '24' },
  { label: 'Pending Transfers', value: '8' },
  { label: 'KYC Alerts', value: '3' },
  { label: 'Documents Due', value: '11' }
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-500">Operational overview for tokenized asset workflows.</p>
          </div>
          <Badge className="bg-slate-700 text-white">Live</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-3xl">{item.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Health</CardTitle>
            <CardDescription>System-wide processing and compliance indicators.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
