"use client";

import React, { useState } from "react";
import { ArrowLeft, Keyboard, Settings2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const VNCViewer = dynamic(() => import("@/components/VNCViewer"), { ssr: false });

export default function DesktopPage() {
    const [showControls, setShowControls] = useState(false);

    // In production, these should come from env or user settings
    // Port 6080 is the default websockify port from our Docker container
    // We assume localhost if running locally, or the server IP if remote.
    // Since we are running on 'localhost' for the user simulation:
    // Dynamic VNC URL construction
    const [vncUrl, setVncUrl] = useState<string>("");

    React.useEffect(() => {
        // Use env var if set, otherwise construct from current hostname
        const envUrl = process.env.NEXT_PUBLIC_VNC_WS_URL;
        if (envUrl) {
            setVncUrl(envUrl);
        } else {
            // Default: Assume port 6080 on the same host
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // If we are behind a reverse proxy (typical in prod), we might want '/websockify' on the same port
            // But for this simple docker-compose setup, port 6080 is exposed separately.
            setVncUrl(`${protocol}//${window.location.hostname}:6080/websockify`);
        }
    }, []);

    const password = "password"; // Default from Dockerfile

    return (
        <div className="h-screen w-screen bg-black relative overscroll-none">
            <VNCViewer url={vncUrl} password={password} />

            {/* Mobile Touch Controls Overlay */}
            <div
                className="absolute top-4 left-4 z-50 flex space-x-2 pointer-events-auto opacity-50 hover:opacity-100 transition-opacity"
            >
                <Link href="/dashboard">
                    <button className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </Link>
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20"
                >
                    <Settings2 className="w-6 h-6" />
                </button>
            </div>

            {showControls && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex space-x-4">
                    <button className="flex flex-col items-center space-y-1 text-white/80 hover:text-white">
                        <Keyboard className="w-6 h-6" />
                        <span className="text-[10px]">Keyboard</span>
                    </button>
                    {/* Add more virtual keys like ESC, CTRL, ALT here */}
                </div>
            )}
        </div>
    );
}
