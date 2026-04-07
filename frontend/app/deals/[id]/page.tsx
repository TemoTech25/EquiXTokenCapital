'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Deal, DealDocument, DealTimelineEvent } from '@/components/deals/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

function formatPerson(deal: Deal, role: 'buyer' | 'seller' | 'agent' | 'conveyancer') {
  const participant = deal[role];
  const fallbackId =
    role === 'buyer'
      ? deal.buyerId
      : role === 'seller'
        ? deal.sellerId
        : role === 'agent'
          ? deal.agentId
          : deal.conveyancerId;

  const fullName = `${participant?.firstName ?? ''} ${participant?.lastName ?? ''}`.trim();
  return fullName || participant?.email || fallbackId || 'N/A';
}

function buildTimeline(deal: Deal): DealTimelineEvent[] {
  if (Array.isArray(deal.timeline) && deal.timeline.length > 0) {
    return deal.timeline;
  }

  return [
    {
      id: `${deal.id}-created`,
      label: 'Deal created',
      description: `Deal entered workflow with status ${deal.status}.`,
      at: deal.createdAt
    },
    {
      id: `${deal.id}-status`,
      label: 'Current stage',
      description: `Current workflow stage: ${deal.status}.`,
      at: deal.updatedAt ?? deal.createdAt
    }
  ];
}

function buildDocuments(deal: Deal): DealDocument[] {
  if (Array.isArray(deal.documents) && deal.documents.length > 0) {
    return deal.documents;
  }

  return [];
}

export default function DealDetailsPage() {
  const params = useParams<{ id: string }>();
  const dealId = params?.id;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!dealId) return;

      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get<Deal>(`/deals/${dealId}`);
        setDeal(data);
      } catch {
        setError('Unable to load deal details.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [dealId]);

  const timeline = useMemo(() => (deal ? buildTimeline(deal) : []), [deal]);
  const linkedDocuments = useMemo(() => (deal ? buildDocuments(deal) : []), [deal]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Deal Details</h1>
            <p className="text-sm text-slate-500">Full workflow timeline, participants, and linked documents.</p>
          </div>
          <Link href="/deals" className="text-sm font-medium text-slate-700 hover:underline">
            Back to deals
          </Link>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading deal...</p> : null}
        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        {deal ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{deal.property?.title ?? deal.property?.name ?? deal.propertyId}</CardTitle>
                <CardDescription>Deal ID: {deal.id}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3 text-sm">
                <Badge>{deal.status}</Badge>
                <span className="text-slate-500">Created: {deal.createdAt ? new Date(deal.createdAt).toLocaleString() : 'N/A'}</span>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Participants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-700">Buyer:</span> {formatPerson(deal, 'buyer')}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Seller:</span> {formatPerson(deal, 'seller')}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Agent:</span> {formatPerson(deal, 'agent')}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Conveyancer:</span> {formatPerson(deal, 'conveyancer')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Linked Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {linkedDocuments.length === 0 ? (
                    <p className="text-sm text-slate-500">No linked documents available.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-slate-600">
                      {linkedDocuments.map((doc) => (
                        <li key={doc.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="font-medium text-slate-700">{doc.name ?? doc.fileName ?? 'Untitled document'}</p>
                          <p className="text-xs text-slate-500">{doc.documentType ?? 'Document'}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Full Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {timeline.map((event, index) => (
                    <li key={event.id ?? index} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-700">{event.label ?? `Step ${index + 1}`}</p>
                      <p className="text-xs text-slate-500">{event.description ?? 'No description available.'}</p>
                      <p className="mt-1 text-xs text-slate-400">{event.at ? new Date(event.at).toLocaleString() : 'Timestamp unavailable'}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
