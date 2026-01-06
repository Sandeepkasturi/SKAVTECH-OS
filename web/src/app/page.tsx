'use client';

import { useEffect, useState } from 'react';
import StatusCard from '@/components/StatusCard';
import ActionPanel from '@/components/ActionPanel';

export default function Home() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/os/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CloudOS Controller</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">{status ? 'Connected' : 'Offline'}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Status */}
        <div className="lg:col-span-1">
          <StatusCard status={status} />
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-2">
          <ActionPanel />
        </div>
      </main>
    </div>
  );
}
