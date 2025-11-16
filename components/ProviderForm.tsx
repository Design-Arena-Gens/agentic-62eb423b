"use client";

import { useState } from 'react';

export type Provider = 'demo' | 'aws';

export interface CreateVmPayload {
  provider: Provider;
  region?: string;
  instanceType?: string;
  windowsVersion?: string;
}

export default function ProviderForm(props: { onCreated: () => void }) {
  const [provider, setProvider] = useState<Provider>('demo');
  const [region, setRegion] = useState('us-east-1');
  const [instanceType, setInstanceType] = useState('t3.large');
  const [windowsVersion, setWindowsVersion] = useState('Windows_Server-2022-English-Full-Base');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider, region, instanceType, windowsVersion } satisfies CreateVmPayload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create VM');
      }
      props.onCreated();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Provision a Windows VM</h2>
        <span className="text-xs text-gray-500">Demo-safe: no charges without credentials</span>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Provider</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="rounded-md border px-3 py-2"
          >
            <option value="demo">Demo (simulated)</option>
            <option value="aws">AWS EC2 (requires env creds)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Region</span>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border px-3 py-2"
            placeholder="us-east-1"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Instance Type</span>
          <input
            value={instanceType}
            onChange={(e) => setInstanceType(e.target.value)}
            className="rounded-md border px-3 py-2"
            placeholder="t3.large"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Windows Image</span>
          <input
            value={windowsVersion}
            onChange={(e) => setWindowsVersion(e.target.value)}
            className="rounded-md border px-3 py-2"
            placeholder="Windows_Server-2022-English-Full-Base"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating?' : 'Create VM'}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        For AWS mode, set environment variables in Vercel: <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, and optional <code>AWS_SESSION_TOKEN</code>.
      </p>
    </div>
  );
}
