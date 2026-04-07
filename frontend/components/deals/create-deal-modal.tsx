'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DealStatus } from '@/components/deals/types';

type CreateDealPayload = {
  propertyId: string;
  buyerId: string;
  sellerId: string;
  agentId: string;
  conveyancerId: string;
  status: DealStatus;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateDealPayload) => Promise<void>;
  isSubmitting: boolean;
};

const statuses: DealStatus[] = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'TRANSFER_COMPLETED'];

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function CreateDealModal({ open, onClose, onCreate, isSubmitting }: Props) {
  const [propertyId, setPropertyId] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [conveyancerId, setConveyancerId] = useState('');
  const [status, setStatus] = useState<DealStatus>('DRAFT');
  const [error, setError] = useState<string | null>(null);

  const fields = useMemo(
    () => [
      { label: 'Property ID', value: propertyId },
      { label: 'Buyer ID', value: buyerId },
      { label: 'Seller ID', value: sellerId },
      { label: 'Agent ID', value: agentId },
      { label: 'Conveyancer ID', value: conveyancerId }
    ],
    [propertyId, buyerId, sellerId, agentId, conveyancerId]
  );

  const validate = () => {
    for (const field of fields) {
      if (!field.value.trim()) {
        return `${field.label} is required.`;
      }
      if (!uuidPattern.test(field.value.trim())) {
        return `${field.label} must be a valid UUID.`;
      }
    }
    return null;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) {
      return;
    }

    await onCreate({
      propertyId: propertyId.trim(),
      buyerId: buyerId.trim(),
      sellerId: sellerId.trim(),
      agentId: agentId.trim(),
      conveyancerId: conveyancerId.trim(),
      status
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Create New Deal</h3>
            <p className="text-sm text-slate-500">Start a new property ownership workflow.</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">
            Close
          </button>
        </div>

        {error ? <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <form className="space-y-3" onSubmit={submit}>
          <input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Property ID (UUID)" />
          <input value={buyerId} onChange={(e) => setBuyerId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Buyer ID (UUID)" />
          <input value={sellerId} onChange={(e) => setSellerId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Seller ID (UUID)" />
          <input value={agentId} onChange={(e) => setAgentId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Agent ID (UUID)" />
          <input value={conveyancerId} onChange={(e) => setConveyancerId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Conveyancer ID (UUID)" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create deal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
