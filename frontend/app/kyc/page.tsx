'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { ShieldCheck, UploadCloud } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string;

type KycRecord = {
  id: string;
  documentType: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
};

type KycStatusResponse = {
  userId: string;
  latestStatus: VerificationStatus;
  suspiciousFlag: boolean;
  records: KycRecord[];
};

const statusClass: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800'
};

export default function KycPage() {
  const [userId, setUserId] = useState('');
  const [documentType, setDocumentType] = useState('ID');
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<KycStatusResponse | null>(null);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const uploadKyc = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || !file) {
      setError('User ID and file are required.');
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('documentType', documentType);
    formData.append('file', file);

    try {
      setUploading(true);
      setError(null);
      await api.post('/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchStatus();
    } catch {
      setError('KYC upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const fetchStatus = async () => {
    if (!userId) {
      setError('Enter a user ID to check status.');
      return;
    }

    try {
      setLoadingStatus(true);
      setError(null);
      const { data } = await api.get<KycStatusResponse>('/kyc/status', {
        params: { user_id: userId }
      });
      setStatusData(data);
    } catch {
      setError('Unable to retrieve KYC status.');
      setStatusData(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">KYC Verification</h1>
          <p className="text-sm text-slate-500">Upload identity documents and track verification outcome.</p>
        </div>

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" /> Upload ID
            </CardTitle>
            <CardDescription>Submit ID or passport for verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={uploadKyc} className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">User ID</label>
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User UUID"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="ID">ID</option>
                  <option value="PASSPORT">Passport</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">File</label>
                <input
                  type="file"
                  onChange={onFileChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload KYC'}
                </Button>
                <Button type="button" variant="secondary" onClick={fetchStatus} disabled={loadingStatus}>
                  {loadingStatus ? 'Checking...' : 'Check Status'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Verification Status
            </CardTitle>
            <CardDescription>Latest approval or rejection state.</CardDescription>
          </CardHeader>
          <CardContent>
            {!statusData ? (
              <p className="text-sm text-slate-500">No status loaded yet.</p>
            ) : (
              <div className="space-y-3">
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass[statusData.latestStatus] ?? 'bg-slate-100 text-slate-700'}`}>
                  {statusData.latestStatus}
                </div>

                <p className="text-sm text-slate-600">
                  Decision: {statusData.latestStatus === 'APPROVED' ? 'Approved' : statusData.latestStatus === 'REJECTED' ? 'Rejected' : 'Pending review'}
                </p>

                <ul className="space-y-2">
                  {statusData.records.map((record) => (
                    <li key={record.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-medium text-slate-700">{record.documentType}</p>
                      <p className="text-xs text-slate-500">
                        {record.verificationStatus} • {new Date(record.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
