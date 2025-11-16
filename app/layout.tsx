import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Windows VM Builder',
  description: 'Provision and manage Windows VMs (demo mode enabled)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="border-b bg-white">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold">Windows VM Builder</h1>
              <a className="text-sm text-blue-600 hover:underline" href="https://agentic-62eb423b.vercel.app">Production URL</a>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
