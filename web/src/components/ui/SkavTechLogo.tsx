"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import { useTheme } from "next-themes";

function ParticleSwirl(props: any) {
    const ref = useRef<any>();
    // Generate particles in a sphere
    const sphere = useMemo(() => random.inSphere(new Float32Array(1500), { radius: 1.2 }), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 15;
            ref.current.rotation.y -= delta / 10;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#8b5cf6" // Primary Violet
                    size={0.03} // Slightly larger for visibility as a logo
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.8}
                />
            </Points>
        </group>
    );
}

export default function SkavTechLogo({ className = "w-12 h-12" }: { className?: string }) {
    return (
        <div className={className}>
            <Canvas camera={{ position: [0, 0, 3], fov: 60 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <ParticleSwirl />
            </Canvas>
        </div>
    );
}
