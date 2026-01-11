"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface MonitoringChartProps {
    data: number[];
    color?: string; // e.g. "rgb(74, 222, 128)"
    label: string;
    value: string;
    subtext?: string;
    height?: number;
}

export default function MonitoringChart({
    data,
    color = "rgb(168, 85, 247)", // purple default
    label,
    value,
    subtext,
    height = 120
}: MonitoringChartProps) {

    // Calculate SVG path
    const pathData = useMemo(() => {
        if (data.length < 2) return "";

        // Normalize data to fit height
        const max = Math.max(...data, 100); // assume 100 as baseline max usually
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d / max) * 100;
            return `${x},${y}`;
        });

        return `M0,100 L${points.join(" L")} L100,100 Z`;
    }, [data]);

    const linePath = useMemo(() => {
        if (data.length < 2) return "";
        const max = Math.max(...data, 100);
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d / max) * 100;
            return `${x},${y}`;
        });
        return `M${points.join(" L")}`;
    }, [data]);

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">{label}</h3>
                    <div className="text-3xl font-bold tracking-tight">{value}</div>
                    {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
                </div>
                <div className={`w-3 h-3 rounded-full animate-pulse`} style={{ backgroundColor: color }} />
            </div>

            {/* Chart Container */}
            <div className="relative h-32 w-full">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Fill Gradient Area */}
                    <motion.path
                        d={pathData}
                        fill={color}
                        fillOpacity="0.1"
                        initial={{ d: "M0,100 L100,100 Z" }}
                        animate={{ d: pathData }}
                        transition={{ type: "tween", ease: "linear", duration: 0.5 }}
                    />
                    {/* Line Stroke */}
                    <motion.path
                        d={linePath}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1, d: linePath }}
                        transition={{ type: "tween", ease: "linear", duration: 0.5 }}
                    />
                </svg>
            </div>
        </div>
    );
}
