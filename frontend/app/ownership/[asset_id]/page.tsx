'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

type OwnershipHistoryEntry = {
  action: string;
  percentage: string;
  counterpartyOwnerId?: string;
  timestamp: string;
  note?: string;
};

type OwnershipRecord = {
  id: string;
  assetId: string;
  ownerId: string;
  percentage: string;
  rightsType: string;
  historyLog: OwnershipHistoryEntry[];
};

type TokenBalance = {
  id: string;
  ownerId: string;
  amount: number;
  type: string;
};

type TokenResponse = {
  assetId: string;
  totalTokensIssued: number;
  balances: TokenBalance[];
};

const colors = ['#334155', '#64748B', '#94A3B8', '#475569', '#CBD5E1', '#0F172A'];

function buildPieGradient(records: OwnershipRecord[]) {
  if (records.length === 0) {
    return 'conic-gradient(#e2e8f0 0deg 360deg)';
  }

  let cumulative = 0;
  const stops = records.map((record, index) => {
    const percent = Number(record.percentage);
    const start = cumulative;
    cumulative += percent * 3.6;
    const end = cumulative;
    return `${colors[index % colors.length]} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${stops.join(', ')})`;
}

export default function OwnershipAssetPage() {
  const params = useParams<{ asset_id: string }>();
  const assetId = params?.asset_id;

  const [ownership, setOwnership] = useState<OwnershipRecord[]>([]);
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fromOwnerId, setFromOwnerId] = useState('');
  const [toOwnerId, setToOwnerId] = useState('');
  const [percentage, setPercentage] = useState('');

  const loadData = async () => {
    if (!assetId) return;

    try {
      setLoading(true);
      setError(null);

      const [{ data: ownershipData }, { data: tokenData }] = await Promise.all([
        api.get<OwnershipRecord[]>(`/ownership/${assetId}`),
        api.get<TokenResponse>(`/tokens/${assetId}`)
      ]);

      const ownershipList = Array.isArray(ownershipData) ? ownershipData : [];
      setOwnership(ownershipList);
      setTokens(tokenData);

      if (ownershipList.length > 0 && !fromOwnerId) {
        setFromOwnerId(ownershipList[0].ownerId);
      }
    } catch {
      setError('Unable to load ownership and tokenisation data.');
      setOwnership([]);
      setTokens(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  const ownershipHistory = useMemo(
    () =>
      ownership
        .flatMap((record) =>
          (record.historyLog ?? []).map((entry) => ({
            ...entry,
            ownerId: record.ownerId
          }))
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [ownership]
  );

  const tokenByUser = useMemo(() => {
    if (!tokens) return [];
    return tokens.balances;
  }, [tokens]);

  const pieGradient = useMemo(() => buildPieGradient(ownership), [ownership]);

  const transferOwnership = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!assetId || !fromOwnerId || !toOwnerId || !percentage) {
      setError('Fill all transfer fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.patch('/ownership/transfer', {
        assetId,
        fromOwnerId,
        toOwnerId,
        percentage: Number(percentage)
      });

      setPercentage('');
      await loadData();
    } catch {
      setError('Ownership transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Digital Ownership Layer</h1>
          <p className="text-sm text-slate-500">Asset {assetId} • tokenised real estate ownership and transfer controls.</p>
        </div>

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {loading ? <p className="text-sm text-slate-500">Loading ownership profile...</p> : null}

        {!loading ? (
          <>
            <section className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ownership Breakdown</CardTitle>
                  <CardDescription>Current owners and percentages.</CardDescription>
                </CardHeader>
                <CardContent>
                  {ownership.length === 0 ? (
                    <p className="text-sm text-slate-500">No ownership records found.</p>
                  ) : (
                    <ul className="space-y-2">
                      {ownership.map((record, index) => (
                        <li key={record.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                            <span className="text-sm text-slate-700">{record.ownerId}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{Number(record.percentage).toFixed(2)}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Token Representation</CardTitle>
                  <CardDescription>Digital tokenisation layer mapped to ownership.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Total Tokens Issued</p>
                      <p className="text-xl font-semibold text-slate-800">{tokens?.totalTokensIssued ?? 0}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Token Holders</p>
                      <p className="text-xl font-semibold text-slate-800">{tokenByUser.length}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[160px_1fr] md:items-center">
                    <div
                      className="mx-auto h-36 w-36 rounded-full border border-slate-200"
                      style={{ background: pieGradient }}
                      aria-label="Ownership pie chart"
                    />

                    <div className="space-y-2">
                      {tokenByUser.map((token, index) => (
                        <div key={token.id}>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                            <span>{token.ownerId}</span>
                            <span>{token.amount.toFixed(2)} tokens</span>
                          </div>
                          <div className="h-2 rounded bg-slate-200">
                            <div
                              className="h-2 rounded"
                              style={{
                                width:
                                  tokens && tokens.totalTokensIssued > 0
                                    ? `${(token.amount / tokens.totalTokensIssued) * 100}%`
                                    : '0%',
                                backgroundColor: colors[index % colors.length]
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ownership History</CardTitle>
                  <CardDescription>Transfer and adjustment log.</CardDescription>
                </CardHeader>
                <CardContent>
                  {ownershipHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">No transfer history available.</p>
                  ) : (
                    <ul className="space-y-2">
                      {ownershipHistory.map((entry, index) => (
                        <li key={`${entry.ownerId}-${entry.timestamp}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm font-medium text-slate-700">{entry.action} • {entry.percentage}%</p>
                          <p className="text-xs text-slate-500">Owner: {entry.ownerId}</p>
                          <p className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</p>
                          {entry.note ? <p className="text-xs text-slate-500">{entry.note}</p> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Ownership</CardTitle>
                  <CardDescription>Move percentage ownership to another owner.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={transferOwnership} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">From owner</label>
                      <select
                        value={fromOwnerId}
                        onChange={(e) => setFromOwnerId(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="">Select sender</option>
                        {ownership.map((record) => (
                          <option key={`from-${record.id}`} value={record.ownerId}>
                            {record.ownerId}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Recipient</label>
                      <select
                        value={toOwnerId}
                        onChange={(e) => setToOwnerId(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="">Select recipient</option>
                        {ownership
                          .filter((record) => record.ownerId !== fromOwnerId)
                          .map((record) => (
                            <option key={`to-${record.id}`} value={record.ownerId}>
                              {record.ownerId}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Percentage</label>
                      <input
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        placeholder="e.g. 5.0000"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Processing transfer...' : 'Transfer ownership'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
