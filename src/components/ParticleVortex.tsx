import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 200;

function Particles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const { pointer } = useThree();

  const { positions, colors, sizes, radii, angles, yOffsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const radii = new Float32Array(PARTICLE_COUNT);
    const angles = new Float32Array(PARTICLE_COUNT);
    const yOffsets = new Float32Array(PARTICLE_COUNT);

    const colorA = new THREE.Color('#ff9f4a');
    const colorB = new THREE.Color('#ff734c');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = Math.random() * 4 + 1;
      const a = Math.random() * Math.PI * 2;
      radii[i] = r;
      angles[i] = a;
      yOffsets[i] = (Math.random() - 0.5) * 2;

      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = yOffsets[i];
      positions[i * 3 + 2] = Math.sin(a) * r;

      const t = Math.random();
      const c = colorA.clone().lerp(colorB, t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 4 + 1;
    }

    return { positions, colors, sizes, radii, angles, yOffsets };
  }, []);

  useFrame((state) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const t = state.clock.elapsedTime;
    const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      radii[i] -= 0.003 + (1 / (radii[i] + 1)) * 0.002;
      angles[i] += 0.008 + (1 / (radii[i] + 1)) * 0.005;

      if (radii[i] < 0.2) {
        radii[i] = Math.random() * 2 + 4;
        angles[i] = Math.random() * Math.PI * 2;
        yOffsets[i] = (Math.random() - 0.5) * 2;
      }

      pos[i * 3] = Math.cos(angles[i]) * radii[i];
      pos[i * 3 + 1] = yOffsets[i] + Math.sin(t * 0.8 + i) * 0.15;
      pos[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
    }

    posAttr.needsUpdate = true;

    pts.rotation.y = t * 0.03;
    pts.position.x = pointer.x * 0.15;
    pts.position.y = pointer.y * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function ParticleVortex() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
