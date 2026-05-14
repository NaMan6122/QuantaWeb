import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Ambient Drift Background                                           */
/*  ----------------------------------------------------------------  */
/*  Very subtle, non-distracting background for content-heavy pages.   */
/*  - Sparse floating particles that drift slowly upward               */
/*  - Faint horizontal grid lines                                      */
/*  - Extremely low opacity — meant to add depth, not draw attention   */
/*  - Fixed position, covers full viewport                             */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 60;

function DriftParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const { positions, colors, sizes, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    const primary = new THREE.Color('#ff9f4a');
    const secondary = new THREE.Color('#ff734c');
    const dim = new THREE.Color('#ffffff');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spread across a wide area
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      speeds[i] = 0.05 + Math.random() * 0.1;
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 1.5 + Math.random() * 2.5;

      // Mostly dim white with occasional warm accents
      const r = Math.random();
      const c = r < 0.2
        ? primary.clone().multiplyScalar(0.8)
        : r < 0.35
        ? secondary.clone().multiplyScalar(0.7)
        : dim.clone().multiplyScalar(0.25 + Math.random() * 0.15);

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return { positions, colors, sizes, speeds, phases };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    timeRef.current += delta;

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Slow upward drift
      pos[i * 3 + 1] += speeds[i] * delta;

      // Very gentle horizontal sway
      pos[i * 3] += Math.sin(timeRef.current * 0.5 + phases[i]) * delta * 0.02;

      // Reset when above
      if (pos[i * 3 + 1] > 7) {
        pos[i * 3 + 1] = -7;
        pos[i * 3] = (Math.random() - 0.5) * 14;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Faint horizontal scan lines */
function ScanLines() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const c = new THREE.Color('#ff9f4a');

    const lineCount = 8;
    for (let i = 0; i < lineCount; i++) {
      const y = (i / (lineCount - 1)) * 12 - 6;
      positions.push(-7, y, 0, 7, y, 0);
      colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.06} />
    </lineSegments>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Very subtle parallax
    groupRef.current.rotation.y = state.pointer.x * 0.02;
    groupRef.current.rotation.x = state.pointer.y * 0.01;
  });

  return (
    <group ref={groupRef}>
      <ScanLines />
      <DriftParticles />
    </group>
  );
}

export default function AmbientDriftBg() {
  return (
    <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
