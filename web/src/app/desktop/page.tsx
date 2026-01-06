'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DesktopPage() {
    const [iframeUrl, setIframeUrl] = useState('');

    useEffect(() => {
        // In a real scenario, we might need to fetch the tunneling URL for VNC
        // For local dev, localhost:6080 is fine.

        const fetchUrl = async () => {
            try {
                // We can reuse the proxy logic or just fetch raw txt again.
                // For cleaner code, let's just fetch raw txt client-side or create a specific API for it.
                // Let's use a quick client-side fetch to the raw UserContent
                const res = await fetch('https://raw.githubusercontent.com/Sandeepkasturi/SKAVTECH-OS/main/connection.txt');
                if (res.ok) {
                    const url = (await res.text()).trim();
                    if (url.startsWith('http')) {
                        // Append vnc_lite.html
                        setIframeUrl(`${url}/vnc_lite.html`);
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to load VNC url", e);
            }
        };
        fetchUrl();
    }, []);

    return (
        <div className="h-screen w-screen bg-black flex flex-col">
            <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between">
                <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-semibold">Back to Dashboard</span>
                </Link>
                <div className="text-gray-500 text-sm">
                    SkavTech OS Remote Desktop
                </div>
            </div>
            <div className="flex-1 relative">
                {iframeUrl ? (
                    <iframe
                        src={iframeUrl}
                        className="w-full h-full border-none"
                        allowFullScreen
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <p>Connecting to Cloud OS...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
