import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Deal = {
  id: string;
  propertyName?: string;
  status?: string;
  stage?: string;
  participants?: string[];
  buyerId?: string;
  sellerId?: string;
  conveyancerId?: string;
  updatedAt?: string;
  createdAt?: string;
};

type OwnershipRecord = {
  id: string;
  assetId: string;
  ownerId: string;
  percentage?: string | number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchDeals(): Promise<Deal[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/deals`, { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as Deal[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchOwnership(): Promise<OwnershipRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/ownership`, { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as OwnershipRecord[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function formatParticipants(deal: Deal) {
  if (deal.participants && deal.participants.length > 0) {
    return deal.participants.join(', ');
  }

  const fallbackParticipants = [deal.buyerId, deal.sellerId, deal.conveyancerId].filter(Boolean);
  return fallbackParticipants.length > 0 ? fallbackParticipants.join(', ') : 'Participants not available';
}

function formatStatus(deal: Deal) {
  return deal.status ?? deal.stage ?? 'Pending';
}

export default async function DashboardPage() {
  const [deals, ownership] = await Promise.all([fetchDeals(), fetchOwnership()]);

  const totalAssetsOwned = new Set(ownership.map((record) => record.assetId)).size;
  const totalOwnershipPercentage = ownership.reduce((sum, record) => sum + Number(record.percentage ?? 0), 0);
  const averageOwnershipPercentage = ownership.length > 0 ? totalOwnershipPercentage / ownership.length : 0;

  const recentActivity = [...deals]
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bDate = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bDate - aDate;
    })
    .slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Real estate digital ownership operations overview.</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-700">Active Deals</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deals.length === 0 ? (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardContent className="pt-6 text-sm text-slate-500">No active deals available.</CardContent>
              </Card>
            ) : (
              deals.map((deal) => (
                <Card key={deal.id}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{deal.propertyName ?? 'Unnamed property'}</CardTitle>
                      <Badge>{formatStatus(deal)}</Badge>
                    </div>
                    <CardDescription>Participants: {formatParticipants(deal)}</CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-700">Ownership Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Total assets owned</CardDescription>
                <CardTitle className="text-3xl">{totalAssetsOwned}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Total ownership percentages</CardDescription>
                <CardTitle className="text-3xl">{totalOwnershipPercentage.toFixed(2)}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Average ownership percentage</CardDescription>
                <CardTitle className="text-3xl">{averageOwnershipPercentage.toFixed(2)}%</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-700">Recent Activity</h2>
          <Card>
            <CardContent className="pt-6">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity available.</p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((deal) => (
                    <li key={deal.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-700">{deal.propertyName ?? 'Unnamed property'}</p>
                      <p className="text-xs text-slate-500">Status: {formatStatus(deal)}</p>
                      <p className="text-xs text-slate-500">Participants: {formatParticipants(deal)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
