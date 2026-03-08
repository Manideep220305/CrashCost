// ============================================================
// AURORA BACKGROUND — Three.js floating particles
// ============================================================
// Lightweight 3D effect: soft floating particles that react to
// the theme. Keeps the page feeling alive without heavy GPU usage.
// ============================================================

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = ({ count = 60, isDark }) => {
    const mesh = useRef();

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
            sizes[i] = Math.random() * 0.08 + 0.02;
        }
        return { positions, sizes };
    }, [count]);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
            mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.06}
                color={isDark ? '#34d399' : '#10b981'}
                transparent
                opacity={isDark ? 0.6 : 0.4}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

const AuroraBackground = ({ isDark = false }) => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Wavy Green Aurora Sweep */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[45%] rounded-[50%] bg-gradient-to-r from-emerald-400/25 via-emerald-300/15 to-teal-400/20 dark:from-emerald-500/30 dark:via-emerald-400/20 dark:to-teal-500/25 blur-[100px] animate-aurora-wave"></div>
                <div className="absolute bottom-[-15%] left-[-10%] w-[130%] h-[40%] rounded-[50%] bg-gradient-to-r from-teal-300/15 via-emerald-400/20 to-emerald-300/10 dark:from-teal-500/20 dark:via-emerald-500/25 dark:to-emerald-400/15 blur-[110px] animate-aurora-wave-reverse"></div>
            </div>

            {/* Three.js Particle Layer */}
            <Canvas
                camera={{ position: [0, 0, 6], fov: 60 }}
                style={{ position: 'absolute', inset: 0 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, alpha: true }}
            >
                <Particles isDark={isDark} />
            </Canvas>
        </div>
    );
};

export default AuroraBackground;
