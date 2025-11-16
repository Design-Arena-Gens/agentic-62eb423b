"use client";

import { useEffect, useState } from 'react';

export interface VM {
  id: string;
  provider: string;
  state: 'pending' | 'running' | 'stopped' | 'terminated';
  publicIp?: string;
  region?: string;
  instanceType?: string;
  username?: string;
}

export default function VMList() {
  const [vms, setVms] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vm');
      if (!res.ok) throw new Error('Failed to load VMs');
      const data = await res.json();
      setVms(data.vms || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function terminate(id: string) {
    const res = await fetch(`/api/vm?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) await load();
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  if (loading) return <p>Loading?</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  if (!vms.length) return <p className="text-gray-600">No VMs yet. Create one above.</p>;

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {vms.map((vm) => (
        <div key={vm.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{vm.provider.toUpperCase()} ? {vm.id}</h3>
              <p className="text-sm text-gray-600">{vm.region} ? {vm.instanceType}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-md ${
              vm.state === 'running' ? 'bg-green-100 text-green-700' :
              vm.state === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              vm.state === 'stopped' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
            }`}>
              {vm.state}
            </span>
          </div>

          {vm.publicIp && (
            <div className="mt-3 text-sm">
              <p><span className="font-medium">Public IP:</span> {vm.publicIp}</p>
              <p><span className="font-medium">RDP:</span> <code>{vm.publicIp}:3389</code></p>
              <p><span className="font-medium">Username:</span> {vm.username || 'Administrator'}</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => terminate(vm.id)}
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Terminate
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
