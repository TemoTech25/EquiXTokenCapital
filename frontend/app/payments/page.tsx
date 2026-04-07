'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

type PaymentStatus = 'PENDING' | 'HELD' | 'RELEASED' | string;

type Payment = {
  id: string;
  dealId: string;
  payerId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
};

const statusClass: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  HELD: 'bg-slate-200 text-slate-800',
  RELEASED: 'bg-emerald-100 text-emerald-800'
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get<Payment[]>('/payments');
        setPayments(Array.isArray(data) ? data : []);
      } catch {
        setError('Unable to load payments.');
      } finally {
        setLoading(false);
      }
    };

    void fetchPayments();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments & Escrow</h1>
          <p className="text-sm text-slate-500">Monitor escrow lifecycle and payment statuses across deals.</p>
        </div>

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
            <CardDescription>Statuses: PENDING, HELD, RELEASED.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Payment ID</th>
                  <th className="py-2 pr-4">Deal</th>
                  <th className="py-2 pr-4">Payer</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Method</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={7}>
                      Loading payments...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={7}>
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 text-xs text-slate-600">{payment.id}</td>
                      <td className="py-3 pr-4">
                        <Link href={`/deals/${payment.dealId}`} className="text-slate-700 underline-offset-2 hover:underline">
                          {payment.dealId}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-600">{payment.payerId}</td>
                      <td className="py-3 pr-4 font-medium text-slate-700">
                        {payment.currency} {Number(payment.amount).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{payment.paymentMethod}</td>
                      <td className="py-3 pr-4">
                        <Badge className={statusClass[payment.status] ?? 'bg-slate-100 text-slate-700'}>{payment.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-500">{new Date(payment.createdAt).toLocaleString()}</td>
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
