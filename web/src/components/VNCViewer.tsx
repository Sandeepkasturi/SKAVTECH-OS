"use client";

import React, { useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

interface VNCViewerProps {
    url: string; // e.g., 'ws://localhost:6080/websockify'
    password?: string;
    viewOnly?: boolean;
}

export default function VNCViewer({ url, password, viewOnly = false }: VNCViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rfbRef = useRef<any>(null);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");
    const [errorDetails, setErrorDetails] = useState<string>("");

    useEffect(() => {
        if (!containerRef.current) return;

        let rfbInstance: any = null;

        const connect = async () => {
            setStatus("connecting");
            try {
                // Use esm.sh CDN to load noVNC as ESM, bypassing Webpack bundling issues
                // @ts-ignore
                const module = await import(/* webpackIgnore: true */ "https://esm.sh/@novnc/novnc@1.5.0/lib/rfb.js");
                const RFB = module.default || module;

                const rfb = new RFB(containerRef.current!, url, {
                    credentials: { password: password },
                });

                rfb.viewOnly = viewOnly;
                rfb.scaleViewport = true;
                rfb.resizeSession = true;

                rfb.addEventListener("connect", () => {
                    setStatus("connected");
                    rfb.focus();
                });

                rfb.addEventListener("disconnect", (e: any) => {
                    setStatus("disconnected");
                    setErrorDetails(e.detail?.reason || "Connection closed");
                });

                rfb.addEventListener("securityfailure", (e: any) => {
                    setStatus("error");
                    setErrorDetails("Security negotiation failed");
                });

                rfbInstance = rfb;
                rfbRef.current = rfb;
            } catch (err: any) {
                console.error("VNC Connection Error:", err);
                setStatus("error");
                setErrorDetails(err.message || "Failed to initialize VNC");
            }
        };

        // Small delay to ensure hydration
        const timer = setTimeout(connect, 500);

        return () => {
            clearTimeout(timer);
            if (rfbInstance) {
                rfbInstance.disconnect();
            }
            rfbRef.current = null;
        };
    }, [url, password, viewOnly]);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
            {/* VNC Canvas Container */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Loading / Error States Overlay */}
            {status !== "connected" && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-50 text-white">
                    {status === "connecting" && (
                        <>
                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                            <p className="text-lg font-medium">Connecting to SKAV Cloud OS...</p>
                        </>
                    )}

                    {status === "disconnected" && (
                        <div className="text-center">
                            <p className="text-red-500 mb-2 font-bold text-xl">Disconnected</p>
                            <p className="text-gray-400 mb-4">{errorDetails}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-primary rounded-lg font-bold hover:bg-primary/80 transition"
                            >
                                Reconnect
                            </button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="text-center">
                            <p className="text-red-500 mb-2 font-bold text-xl">Connection Error</p>
                            <p className="text-gray-400">{errorDetails}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
