"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Monitor, Cpu, Wifi, Battery, Settings, Power, LayoutDashboard, Terminal, Activity, LogOut, Bell, Search, Server, Disc, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SkavTechLogo from "@/components/ui/SkavTechLogo";
import MonitoringChart from "@/components/dashboard/MonitoringChart";

// Tabs
type Tab = "overview" | "instances" | "monitoring" | "settings";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [stats, setStats] = useState({
        cpu: 0,
        latency: 0,
        uptime: 0,
        active: false,
        cores: 4,
        memory: { used: 0, total: 0, percent: 0 }
    });
    const [isLoading, setIsLoading] = useState(true);

    // History for charts
    const [cpuHistory, setCpuHistory] = useState<number[]>(Array(20).fill(0));
    const [memHistory, setMemHistory] = useState<number[]>(Array(20).fill(0));

    // Settings State
    const [resolution, setResolution] = useState("1280x720");
    const [quality, setQuality] = useState(80);

    // Poll for system stats
    useEffect(() => {
        const fetchStats = async () => {
            const start = Date.now();
            try {
                const res = await fetch("/api/system/stats");
                const data = await res.json();
                const end = Date.now();
                const latency = end - start;

                setStats(prev => ({
                    ...prev,
                    cpu: data.cpu || Math.floor(Math.random() * 20) + 5,
                    latency: latency,
                    uptime: data.uptime,
                    active: true,
                    cores: data.cores,
                    memory: data.memory || { used: 4000, total: 16000, percent: 25 }
                }));

                // Update charts history
                setCpuHistory(prev => [...prev.slice(1), data.cpu || 0]);
                setMemHistory(prev => [...prev.slice(1), data.memory?.percent || 0]);

            } catch (error) {
                console.error("Failed to fetch stats", error);
                setStats(prev => ({ ...prev, active: false }));
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 2000); // 2 seconds polling
        return () => clearInterval(interval);
    }, []);

    // Format uptime
    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="min-h-screen bg-black text-white flex overflow-hidden selection:bg-primary selection:text-white">
            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 bg-zinc-950 border-r border-white/10 flex flex-col justify-between p-4 hidden md:flex z-20">
                <div>
                    <div className="flex items-center space-x-3 px-2 mb-10 text-primary">
                        <SkavTechLogo className="w-12 h-12" />
                        <span className="text-xl font-bold tracking-tighter hidden lg:block">SKAV OS</span>
                    </div>

                    <nav className="space-y-2">
                        <NavItem
                            icon={LayoutDashboard}
                            label="Overview"
                            active={activeTab === "overview"}
                            onClick={() => setActiveTab("overview")}
                        />
                        <NavItem
                            icon={Terminal}
                            label="Instances"
                            active={activeTab === "instances"}
                            onClick={() => setActiveTab("instances")}
                        />
                        <NavItem
                            icon={Activity}
                            label="Monitoring"
                            active={activeTab === "monitoring"}
                            onClick={() => setActiveTab("monitoring")}
                        />
                        <NavItem
                            icon={Settings}
                            label="Settings"
                            active={activeTab === "settings"}
                            onClick={() => setActiveTab("settings")}
                        />
                    </nav>
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 hidden lg:block">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500" />
                        <div>
                            <div className="text-sm font-bold">Sandeep Kasturi</div>
                            <div className="text-xs text-gray-400">Developer</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-96 bg-primary/20 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-full h-96 bg-violet-900/10 blur-[100px] pointer-events-none" />

                {/* Top Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-md z-10">
                    <div className="md:hidden text-lg font-bold">SKAV OS</div>
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-widest hidden md:block">
                        {activeTab}
                    </div>
                    <div className="flex items-center space-x-4 ml-auto">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <div className="h-4 w-px bg-white/10" />
                        <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 scrollbar-hide">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "overview" && (
                                    <>
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold mb-2">System Overview</h1>
                                            <p className="text-gray-400">Monitor your cloud environment performance.</p>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            <StatsCard icon={Cpu} label="CPU Load" value={isLoading ? "..." : `${stats.cpu}%`} subtext={`${stats.cores} Cores`} color="text-green-400" />
                                            <StatsCard icon={Wifi} label="Latency" value={isLoading ? "..." : `${stats.latency}ms`} subtext="Realtime" color="text-blue-400" />
                                            <StatsCard icon={Monitor} label="Display" value={resolution} subtext="Configured" color="text-purple-400" />
                                            <StatsCard icon={Battery} label="Uptime" value={isLoading ? "..." : formatUptime(stats.uptime)} subtext="Session" color="text-yellow-400" />
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <motion.div className="lg:col-span-2 relative h-80 rounded-3xl overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-900 to-black opacity-80" />
                                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                                    <div>
                                                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md mb-4 ${stats.active ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                                                            <div className={`w-2 h-2 rounded-full ${stats.active ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                                                            <span className="text-xs font-medium">{stats.active ? 'Systems Operational' : 'Connecting...'}</span>
                                                        </div>
                                                        <h2 className="text-3xl font-bold mb-2">Ubuntu 22.04 LTS</h2>
                                                        <p className="text-white/70 max-w-md">Full desktop environment accessible directly from your browser.</p>
                                                    </div>
                                                    <Link href="/desktop">
                                                        <button className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-gray-200 transition-colors transform group-hover:scale-105 duration-300 w-fit">
                                                            <Power className="w-5 h-5" />
                                                            <span>BOOT OS</span>
                                                        </button>
                                                    </Link>
                                                </div>
                                                <Terminal className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                                            </motion.div>

                                            {/* Quick Tip */}
                                            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex flex-col justify-center">
                                                <Activity className="w-8 h-8 text-blue-400 mb-4" />
                                                <h3 className="text-xl font-bold mb-2">Quick Tip</h3>
                                                <p className="text-gray-400 text-sm">Press F11 for fullscreen experience in the OS.</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === "instances" && (
                                    <>
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold mb-2">Active Instances</h1>
                                            <p className="text-gray-400">Manage your deployed operating systems.</p>
                                        </div>
                                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                <div className="col-span-4">Instance Name</div>
                                                <div className="col-span-2">Status</div>
                                                <div className="col-span-2">IP Address</div>
                                                <div className="col-span-2">Uptime</div>
                                                <div className="col-span-2 text-right">Actions</div>
                                            </div>
                                            {/* Single Instance Item */}
                                            <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                                                <div className="col-span-4 flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                                        <Server className="w-5 h-5 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">Ubuntu 22.04 LTS</div>
                                                        <div className="text-xs text-gray-500">t2.micro equivalent</div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stats.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {stats.active ? 'Running' : 'Stopped'}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-sm text-gray-400">127.0.0.1 (Local)</div>
                                                <div className="col-span-2 text-sm text-gray-400">{formatUptime(stats.uptime)}</div>
                                                <div className="col-span-2 flex justify-end">
                                                    <Link href="/desktop">
                                                        <button className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200">Connect</button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === "monitoring" && (
                                    <>
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
                                            <p className="text-gray-400">Realtime resource usage for your current session.</p>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                            <MonitoringChart
                                                data={cpuHistory}
                                                label="CPU Usage"
                                                value={`${stats.cpu}%`}
                                                subtext="4 Cores Active"
                                                color="#4ade80" // green
                                            />
                                            <MonitoringChart
                                                data={memHistory}
                                                label="Memory Usage"
                                                value={`${stats.memory.percent}%`}
                                                subtext={`${(stats.memory.used / 1024 / 1024 / 1024).toFixed(1)} GB / ${(stats.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB`}
                                                color="#f472b6" // pink
                                            />
                                        </div>
                                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold mb-4">Hardware Specifications</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SpecItem label="Processor" value={`Intel/AMD x86_64 (${stats.cores} Cores)`} flip />
                                                <SpecItem label="Architecture" value="x64" flip />
                                                <SpecItem label="Total Memory" value={`${(stats.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB`} flip />
                                                <SpecItem label="Platform" value="Linux / Docker" flip />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === "settings" && (
                                    <>
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold mb-2">Environment Settings</h1>
                                            <p className="text-gray-400">Configure your SKAV OS experience.</p>
                                        </div>

                                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 max-w-2xl">
                                            <div className="space-y-8">
                                                {/* Resolution Settings */}
                                                <div>
                                                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-300 mb-3">
                                                        <Monitor className="w-4 h-4" />
                                                        <span>Display Resolution</span>
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {["1280x720", "1920x1080", "2560x1440"].map((res) => (
                                                            <button
                                                                key={res}
                                                                onClick={() => setResolution(res)}
                                                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${resolution === res ? 'bg-primary border-primary text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}
                                                            >
                                                                {res}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">Note: Changing resolution may require a container restart.</p>
                                                </div>

                                                {/* Quality Slider */}
                                                <div>
                                                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-300 mb-3">
                                                        <Sliders className="w-4 h-4" />
                                                        <span>Stream Quality ({quality}%)</span>
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="100"
                                                        value={quality}
                                                        onChange={(e) => setQuality(parseInt(e.target.value))}
                                                        className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary"
                                                    />
                                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                                        <span>Performance</span>
                                                        <span>Balanced</span>
                                                        <span>High Fidelity</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Helper Components

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div onClick={onClick} className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-primary/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
            <span className="font-medium hidden lg:block">{label}</span>
        </div>
    )
}

function StatsCard({ icon: Icon, label, value, subtext, color }: { icon: any, label: string, value: string, subtext: string, color: string }) {
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-xs font-mono text-gray-500 bg-black/40 px-2 py-1 rounded">LIVE</span>
            </div>
            <div>
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className="text-2xl font-bold mb-1">{value}</div>
                <div className="text-[10px] text-gray-500">{subtext}</div>
            </div>
        </div>
    );
}

function SpecItem({ label, value, flip }: { label: string, value: string, flip?: boolean }) {
    return (
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-gray-400 text-sm">{label}</span>
            <span className="font-bold text-sm tracking-wide">{value}</span>
        </div>
    )
}
