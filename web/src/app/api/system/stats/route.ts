import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    // Calculate average CPU load across all cores (simplified)
    // Note: This is a snapshot. For real load, we'd need to compare over time, 
    // but for this simple dashboard, we'll return a load based on idle times.
    // A better approach for instantaneous load on Node is `os.loadavg()` but that works best on Linux/macOS
    const loadAvg = os.loadavg();
    // Fallback or calculation can be complex cross-platform. 
    // Let's use a simulated "active" percentage based on loadAvg[0] (1 minute load) normalized by core count.
    const cpuPercent = Math.min(100, Math.round((loadAvg[0] / cpus.length) * 100)) || 0;

    // Uptime in seconds
    const uptime = os.uptime();

    return NextResponse.json({
        cpu: cpuPercent,
        memory: {
            total: totalMem,
            free: freeMem,
            used: totalMem - freeMem,
            percent: Math.round(((totalMem - freeMem) / totalMem) * 100),
        },
        uptime: uptime,
        cores: cpus.length,
        platform: os.platform(),
    });
}
