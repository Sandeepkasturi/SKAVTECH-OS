'use client';

import { Activity, Disc, Cpu, Server } from 'lucide-react';

interface StatusData {
    status: string;
    os: string;
    cpu_usage: string;
    ram_usage: string;
    disk_usage: string;
}

export default function StatusCard({ status }: { status: StatusData | null }) {
    if (!status) {
        return (
            <div className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl animate-pulse">
                <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="text-blue-400" />
                System Status
            </h3>

            <div className="space-y-6">
                {/* CPU */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 flex items-center gap-2">
                            <Cpu size={16} /> CPU Usage
                        </span>
                        <span className="text-white font-mono">{status.cpu_usage}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: status.cpu_usage }}
                        />
                    </div>
                </div>

                {/* RAM */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 flex items-center gap-2">
                            <Server size={16} /> RAM Usage
                        </span>
                        <span className="text-white font-mono">{status.ram_usage}</span>
                    </div>
                </div>

                {/* Disk */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 flex items-center gap-2">
                            <Disc size={16} /> Disk Usage
                        </span>
                        <span className="text-white font-mono">{status.disk_usage}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 transition-all duration-500"
                            style={{ width: status.disk_usage }}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-gray-500 text-sm">OS</span>
                    <span className="text-gray-300 text-sm font-medium">{status.os}</span>
                </div>
            </div>
        </div>
    );
}
