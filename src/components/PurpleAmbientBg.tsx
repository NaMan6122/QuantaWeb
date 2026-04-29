import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PURPLE_A = new THREE.Color('#7c3aed'); // violet-600
const PURPLE_B = new THREE.Color('#a855f7'); // purple-500
const PURPLE_C = new THREE.Color('#6d28d9'); // violet-700
const ORB_COUNT = 6;

/* ------------------------------------------------------------------ */
/*  Floating orb                                                       */
/* ------------------------------------------------------------------ */

function Orb({
  basePosition,
  color,
  scale,
  speed,
  phase,
}: {
  basePosition: [number, number, number];
  color: THREE.Color;
  scale: number;
  speed: number;
  phase: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.position.x = basePosition[0] + Math.sin(t * speed + phase) * 1.2;
    mesh.position.y = basePosition[1] + Math.cos(t * speed * 0.7 + phase) * 0.8;
    mesh.position.z = basePosition[2] + Math.sin(t * speed * 0.5 + phase * 2) * 0.6;

    // Gentle breathing scale
    const s = scale * (1 + Math.sin(t * 0.4 + phase) * 0.15);
    mesh.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef} position={basePosition}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Particle dust field                                                */
/* ------------------------------------------------------------------ */

const DUST_COUNT = 120;

function DustField() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    const vel = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = 0.002 + Math.random() * 0.005; // slow upward drift
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    for (let i = 0; i < DUST_COUNT; i++) {
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap around vertically
      if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -10;
    }

    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      attr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={DUST_COUNT} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#c084fc"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene with parallax                                                */
/* ------------------------------------------------------------------ */

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const orbs = useMemo(
    () => [
      { pos: [-3, 2, -2] as [number, number, number], color: PURPLE_A, scale: 2.5, speed: 0.2, phase: 0 },
      { pos: [4, -1, -3] as [number, number, number], color: PURPLE_B, scale: 3, speed: 0.15, phase: 1.5 },
      { pos: [-1, -3, -1] as [number, number, number], color: PURPLE_C, scale: 2, speed: 0.25, phase: 3 },
      { pos: [2, 3, -4] as [number, number, number], color: PURPLE_B, scale: 2.8, speed: 0.18, phase: 4.5 },
      { pos: [-4, 0, -2] as [number, number, number], color: PURPLE_A, scale: 1.8, speed: 0.22, phase: 2 },
      { pos: [0, -2, -5] as [number, number, number], color: PURPLE_C, scale: 3.5, speed: 0.12, phase: 5.5 },
    ],
    [],
  );

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 0.08,
        0.02,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        pointer.y * 0.05,
        0.02,
      );
    }
  });

  return (
    <group ref={groupRef}>
      {orbs.map((o, i) => (
        <Orb
          key={i}
          basePosition={o.pos}
          color={o.color}
          scale={o.scale}
          speed={o.speed}
          phase={o.phase}
        />
      ))}
      <DustField />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export default function PurpleAmbientBg() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
