'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

const states = [
  'CREATED',
  'OFFER_MADE',
  'OFFER_ACCEPTED',
  'DOCUMENTS_PENDING',
  'COMPLIANCE_CHECK',
  'TRANSFER_INITIATED',
  'TRANSFER_COMPLETED'
] as const;

type Deal = {
  id: string;
  status: string;
  propertyId: string;
  property?: { title?: string; name?: string };
  buyerId: string;
  sellerId: string;
  createdAt?: string;
};

type Transaction = {
  id: string;
  dealId: string;
  currentState: string;
  stateHistory?: Array<{ from: string | null; to: string; timestamp: string }>;
};

export default function AdminPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stateSelections, setStateSelections] = useState<Record<string, string>>({});

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [{ data: dealsData }, { data: transactionsData }] = await Promise.all([
        api.get<Deal[]>('/admin/deals'),
        api.get<Transaction[]>('/admin/transactions')
      ]);

      const dealList = Array.isArray(dealsData) ? dealsData : [];
      const transactionList = Array.isArray(transactionsData) ? transactionsData : [];

      setDeals(dealList);
      setTransactions(transactionList);

      const initialSelections = Object.fromEntries(
        transactionList.map((tx) => [tx.id, tx.currentState])
      );
      setStateSelections(initialSelections);
    } catch {
      setError('Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAdminData();
  }, []);

  const overrideState = async (transactionId: string) => {
    const selectedState = stateSelections[transactionId];
    if (!selectedState) return;

    try {
      setUpdatingId(transactionId);
      setError(null);

      await api.patch(`/admin/transactions/${transactionId}/override`, {
        state: selectedState
      });

      await fetchAdminData();
    } catch {
      setError('Failed to override transaction state.');
    } finally {
      setUpdatingId(null);
    }
  };

  const dealCount = useMemo(() => deals.length, [deals]);
  const transactionCount = useMemo(() => transactions.length, [transactions]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Central admin controls for deals and transaction overrides.</p>
        </div>

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>Total Deals</CardDescription>
              <CardTitle className="text-3xl">{dealCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Transactions</CardDescription>
              <CardTitle className="text-3xl">{transactionCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Deals</CardTitle>
            <CardDescription>Admin view of all platform deals.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Deal ID</th>
                  <th className="py-2 pr-4">Property</th>
                  <th className="py-2 pr-4">Buyer</th>
                  <th className="py-2 pr-4">Seller</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>Loading deals...</td>
                  </tr>
                ) : deals.length === 0 ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>No deals found.</td>
                  </tr>
                ) : (
                  deals.map((deal) => (
                    <tr key={deal.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 text-xs text-slate-600">{deal.id}</td>
                      <td className="py-3 pr-4 text-slate-700">{deal.property?.title ?? deal.property?.name ?? deal.propertyId}</td>
                      <td className="py-3 pr-4 text-xs text-slate-600">{deal.buyerId}</td>
                      <td className="py-3 pr-4 text-xs text-slate-600">{deal.sellerId}</td>
                      <td className="py-3 pr-4 text-slate-700">{deal.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>View and override transaction workflow states.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Transaction ID</th>
                  <th className="py-2 pr-4">Deal ID</th>
                  <th className="py-2 pr-4">Current State</th>
                  <th className="py-2 pr-4">Override State</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>Loading transactions...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 text-xs text-slate-600">{tx.id}</td>
                      <td className="py-3 pr-4 text-xs text-slate-600">{tx.dealId}</td>
                      <td className="py-3 pr-4 text-slate-700">{tx.currentState}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={stateSelections[tx.id] ?? tx.currentState}
                          onChange={(e) =>
                            setStateSelections((prev) => ({
                              ...prev,
                              [tx.id]: e.target.value
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                        >
                          {states.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4">
                        <Button
                          size="sm"
                          onClick={() => overrideState(tx.id)}
                          disabled={updatingId === tx.id}
                        >
                          {updatingId === tx.id ? 'Overriding...' : 'Override'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
