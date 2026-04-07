'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

const workflowSteps = [
  'CREATED',
  'OFFER_MADE',
  'OFFER_ACCEPTED',
  'DOCUMENTS_PENDING',
  'COMPLIANCE_CHECK',
  'TRANSFER_INITIATED',
  'TRANSFER_COMPLETED'
] as const;

type WorkflowState = (typeof workflowSteps)[number];

type TransactionTask = {
  id?: string;
  title?: string;
  description?: string;
  completed?: boolean;
  done?: boolean;
};

type TransactionDetails = {
  id: string;
  state: WorkflowState;
  updatedAt?: string;
  createdAt?: string;
  tasks?: TransactionTask[];
};

function normalizeTasks(transaction: TransactionDetails): TransactionTask[] {
  if (Array.isArray(transaction.tasks) && transaction.tasks.length > 0) {
    return transaction.tasks;
  }

  return [
    { id: 'task-1', title: 'Collect buyer documentation', completed: transaction.state !== 'CREATED' },
    { id: 'task-2', title: 'Verify compliance checks', completed: ['COMPLIANCE_CHECK', 'TRANSFER_INITIATED', 'TRANSFER_COMPLETED'].includes(transaction.state) },
    { id: 'task-3', title: 'Finalize transfer package', completed: ['TRANSFER_INITIATED', 'TRANSFER_COMPLETED'].includes(transaction.state) }
  ];
}

export default function TransactionWorkflowPage() {
  const params = useParams<{ id: string }>();
  const transactionId = params?.id;

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransaction = async () => {
    if (!transactionId) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<TransactionDetails>(`/transactions/${transactionId}`);
      setTransaction(data);
    } catch {
      setError('Unable to load transaction workflow.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransaction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const currentStepIndex = useMemo(() => {
    if (!transaction) return 0;
    const index = workflowSteps.indexOf(transaction.state);
    return index === -1 ? 0 : index;
  }, [transaction]);

  const nextState = useMemo(() => {
    if (!transaction) return null;
    const nextIndex = currentStepIndex + 1;
    return nextIndex < workflowSteps.length ? workflowSteps[nextIndex] : null;
  }, [transaction, currentStepIndex]);

  const moveToNextState = async () => {
    if (!transaction || !nextState) return;

    try {
      setUpdating(true);
      setError(null);
      await api.patch(`/transactions/${transaction.id}/state`, { state: nextState });
      await loadTransaction();
    } catch {
      setError('Unable to update transaction state.');
    } finally {
      setUpdating(false);
    }
  };

  const tasks = transaction ? normalizeTasks(transaction) : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Transaction Workflow</h1>
            <p className="text-sm text-slate-500">Visual lifecycle tracker and workflow controls.</p>
          </div>
          <Link href="/transactions" className="text-sm font-medium text-slate-700 hover:underline">
            Back to transactions
          </Link>
        </div>

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {loading ? <p className="text-sm text-slate-500">Loading transaction...</p> : null}

        {transaction ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Progress Tracker</CardTitle>
                <CardDescription>Current state: {transaction.state}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="flex min-w-[920px] items-center gap-2">
                    {workflowSteps.map((step, index) => {
                      const isCompleted = index < currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step} className="flex flex-1 items-center gap-2">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${
                                isCompleted
                                  ? 'border-slate-700 bg-slate-700 text-white'
                                  : isCurrent
                                    ? 'border-slate-500 bg-slate-200 text-slate-800'
                                    : 'border-slate-300 bg-white text-slate-500'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className={`text-[11px] ${isCurrent ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{step}</span>
                          </div>

                          {index < workflowSteps.length - 1 ? (
                            <div className={`h-1 flex-1 rounded ${isCompleted ? 'bg-slate-700' : 'bg-slate-200'}`} />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Task Checklist</CardTitle>
                  <CardDescription>Operational tasks tied to this transaction stage.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tasks.map((task, index) => {
                      const done = Boolean(task.completed ?? task.done);
                      return (
                        <li key={task.id ?? index} className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                          <input type="checkbox" checked={done} readOnly className="mt-1 h-4 w-4 accent-slate-700" />
                          <div>
                            <p className={`text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                              {task.title ?? `Task ${index + 1}`}
                            </p>
                            {task.description ? <p className="text-xs text-slate-500">{task.description}</p> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Move the transaction through the workflow state machine.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">Transaction ID: {transaction.id}</p>
                  <p className="text-sm text-slate-600">
                    Last updated: {transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString() : 'N/A'}
                  </p>

                  <Button onClick={moveToNextState} disabled={!nextState || updating} className="w-full">
                    {updating
                      ? 'Updating state...'
                      : nextState
                        ? `Move to ${nextState}`
                        : 'Workflow complete'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
