'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { CreateDealModal } from '@/components/deals/create-deal-modal';
import { Deal } from '@/components/deals/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

function personLabel(firstName?: string, lastName?: string, fallback?: string) {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  return fullName || fallback || 'N/A';
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<Deal[]>('/deals');
      setDeals(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load deals right now.');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDeals();
  }, []);

  const createDeal = async (payload: {
    propertyId: string;
    buyerId: string;
    sellerId: string;
    agentId: string;
    conveyancerId: string;
    status: string;
  }) => {
    try {
      setSubmitting(true);
      setError(null);
      await api.post('/deals', payload);
      setOpenCreateModal(false);
      await loadDeals();
    } catch {
      setError('Deal creation failed. Please verify UUID values and roles.');
    } finally {
      setSubmitting(false);
    }
  };

  const dealsCount = useMemo(() => deals.length, [deals]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Deal Management</h1>
            <p className="text-sm text-slate-500">Track all real estate deal workflows and participants.</p>
          </div>
          <Button onClick={() => setOpenCreateModal(true)}>Create Deal</Button>
        </div>

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>All Deals</CardTitle>
            <CardDescription>{dealsCount} deal(s) currently in the system.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Property</th>
                  <th className="py-2 pr-4">Buyer</th>
                  <th className="py-2 pr-4">Seller</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>
                      Loading deals...
                    </td>
                  </tr>
                ) : deals.length === 0 ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>
                      No deals found.
                    </td>
                  </tr>
                ) : (
                  deals.map((deal) => (
                    <tr key={deal.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 font-medium text-slate-700">{deal.property?.title ?? deal.property?.name ?? deal.propertyId}</td>
                      <td className="py-3 pr-4 text-slate-600">{personLabel(deal.buyer?.firstName, deal.buyer?.lastName, deal.buyerId)}</td>
                      <td className="py-3 pr-4 text-slate-600">{personLabel(deal.seller?.firstName, deal.seller?.lastName, deal.sellerId)}</td>
                      <td className="py-3 pr-4">
                        <Badge>{deal.status}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Link href={`/deals/${deal.id}`} className="text-slate-700 underline-offset-2 hover:underline">
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {deals.map((deal) => (
            <Card key={`card-${deal.id}`}>
              <CardHeader>
                <CardTitle className="text-base">{deal.property?.title ?? deal.property?.name ?? 'Untitled property'}</CardTitle>
                <CardDescription>ID: {deal.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-700">Buyer:</span>{' '}
                  {personLabel(deal.buyer?.firstName, deal.buyer?.lastName, deal.buyerId)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Seller:</span>{' '}
                  {personLabel(deal.seller?.firstName, deal.seller?.lastName, deal.sellerId)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Status:</span> {deal.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CreateDealModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreate={createDeal}
        isSubmitting={submitting}
      />
    </AppShell>
  );
}
