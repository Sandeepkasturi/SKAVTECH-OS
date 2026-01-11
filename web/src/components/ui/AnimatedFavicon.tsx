"use client";

import { useEffect, useRef } from "react";

export default function AnimatedFavicon() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        // Create logic to update favicon
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');

        if (!document.querySelector("link[rel~='icon']")) {
            link.type = 'image/x-icon';
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        if (!ctx) return;

        let frameId: number;
        let angle = 0;

        const particles = Array.from({ length: 15 }).map(() => ({
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20,
            z: (Math.random() - 0.5) * 20,
            color: Math.random() > 0.5 ? '#8b5cf6' : '#a78bfa' // Violet shades
        }));

        const render = () => {
            ctx.clearRect(0, 0, 32, 32);
            ctx.fillStyle = "#000000"; // Black background for visibility
            ctx.fillRect(0, 0, 32, 32);

            // Center
            const cx = 16;
            const cy = 16;

            // Sort by Z for simple depth matching
            const rotatedParticles = particles.map(p => {
                // Rotate around Y
                const x = p.x * Math.cos(angle) - p.z * Math.sin(angle);
                const z = p.x * Math.sin(angle) + p.z * Math.cos(angle);
                return { x, y: p.y, z, color: p.color };
            }).sort((a, b) => b.z - a.z);

            rotatedParticles.forEach(p => {
                // Perspectve projection
                const scale = 15 / (15 - p.z);
                const px = cx + p.x * scale;
                const py = cy + p.y * scale;
                const size = Math.max(0.5, 1.5 * scale); // Particle size

                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            // Update Link
            link.href = canvas.toDataURL("image/png");

            angle += 0.05;
            // Limit framerate to avoid heavy browser load
            setTimeout(() => {
                frameId = requestAnimationFrame(render);
            }, 50);
        };

        render();

        return () => cancelAnimationFrame(frameId);
    }, []);

    return null; // Render nothing in DOM
}
