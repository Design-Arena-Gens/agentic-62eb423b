import ProviderForm from '@/components/ProviderForm';
import VMList from '@/components/VMList';

export default function Page() {
  return (
    <div className="space-y-6">
      <ProviderForm onCreated={() => { /* list auto-refreshes */ }} />
      <VMList />

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-medium">How to use the Windows VM</h2>
        <ol className="mt-2 list-decimal pl-6 text-sm text-gray-700 space-y-1">
          <li>Create a VM above. In demo mode this is simulated.</li>
          <li>When running, copy the Public IP and connect with any RDP client.</li>
          <li>Username is <code>Administrator</code>. For AWS, decrypt the password with your key pair.</li>
        </ol>
      </section>
    </div>
  );
}
