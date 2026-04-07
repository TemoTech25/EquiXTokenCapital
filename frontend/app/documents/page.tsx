'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Download, FileText, Upload } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

type ManagedDocument = {
  id: string;
  type: string;
  ownerId: string;
  fileUrl: string;
  version: number;
  createdAt: string;
  signedUrl?: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ManagedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('Legal Contract');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<ManagedDocument[]>('/documents');
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load documents. Please ensure you are authenticated.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDocuments();
  }, []);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    try {
      setUploading(true);
      setError(null);
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFile(null);
      await fetchDocuments();
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (doc: ManagedDocument) => {
    if (!doc.signedUrl) {
      setError('Download URL unavailable for this document.');
      return;
    }

    window.open(doc.signedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document Management</h1>
          <p className="text-sm text-slate-500">Upload, version, and download compliance and ownership documents.</p>
        </div>

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Document
            </CardTitle>
            <CardDescription>Send new document versions using secure upload API.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Document type</label>
                <input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="KYC, Contract, Deed..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">File</label>
                <input
                  type="file"
                  onChange={onFileChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1"
                />
              </div>

              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documents
            </CardTitle>
            <CardDescription>Versioned document list with download actions.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-500">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-slate-500">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-3">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">{doc.type}</p>
                      <p className="text-xs text-slate-500">
                        Version v{doc.version} • {new Date(doc.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <Button type="button" variant="secondary" size="sm" onClick={() => handleDownload(doc)}>
                      <Download className="mr-1 h-4 w-4" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
