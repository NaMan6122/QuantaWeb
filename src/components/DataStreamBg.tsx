import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Flowing particles that simulate data packets moving through        */
/*  a pipeline — vertical streams with branching paths                 */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 120;
const STREAM_HEIGHT = 8;

function DataParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const { positions, velocities, colors, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    const primary = new THREE.Color('#ff9f4a');
    const secondary = new THREE.Color('#ff734c');
    const dim = new THREE.Color('#ff9f4a').multiplyScalar(0.3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute particles in vertical streams
      const stream = Math.floor(Math.random() * 5); // 5 parallel streams
      const xOffsets = [-1.2, -0.6, 0, 0.6, 1.2];
      const xSpread = 0.15;

      positions[i * 3] = xOffsets[stream] + (Math.random() - 0.5) * xSpread;
      positions[i * 3 + 1] = Math.random() * STREAM_HEIGHT - STREAM_HEIGHT / 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      velocities[i] = 0.3 + Math.random() * 0.5;
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 2 + Math.random() * 4;

      // Color based on stream (left streams = primary, right = secondary)
      const c = stream < 3 ? primary.clone().lerp(dim, Math.random() * 0.5) : secondary.clone().lerp(dim, Math.random() * 0.5);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return { positions, velocities, colors, sizes, phases };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    timeRef.current += delta;

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const sz = pointsRef.current.geometry.attributes.size.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Move downward
      pos[i * 3 + 1] -= velocities[i] * delta * 2;

      // Gentle horizontal wobble
      pos[i * 3] += Math.sin(timeRef.current * 2 + phases[i]) * delta * 0.05;

      // Reset when below
      if (pos[i * 3 + 1] < -STREAM_HEIGHT / 2) {
        pos[i * 3 + 1] = STREAM_HEIGHT / 2;
      }

      // Pulse size
      sz[i] = sizes[i] * (0.7 + 0.3 * Math.sin(timeRef.current * 3 + phases[i]));
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Thin vertical connection lines */
function StreamLines() {
  const linesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const primary = new THREE.Color('#ff9f4a');
    const secondary = new THREE.Color('#ff734c');
    const xOffsets = [-1.2, -0.6, 0, 0.6, 1.2];

    for (let s = 0; s < 5; s++) {
      const segments = 20;
      const c = s < 3 ? primary : secondary;
      for (let i = 0; i < segments; i++) {
        const y1 = (i / segments) * STREAM_HEIGHT - STREAM_HEIGHT / 2;
        const y2 = ((i + 1) / segments) * STREAM_HEIGHT - STREAM_HEIGHT / 2;
        positions.push(xOffsets[s], y1, 0, xOffsets[s], y2, 0);
        colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.08} />
    </lineSegments>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Subtle mouse parallax
    groupRef.current.rotation.y = state.pointer.x * 0.05;
    groupRef.current.rotation.x = state.pointer.y * 0.03;
  });

  return (
    <group ref={groupRef}>
      <StreamLines />
      <DataParticles />
    </group>
  );
}

export default function DataStreamBg() {
  return (
    <div className="absolute inset-0 -z-10 opacity-25">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
