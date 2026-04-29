import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CARD_COUNT = 8;

function HoloCard({ position, rotation, speed, phase }: {
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
  phase: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Gentle float
    meshRef.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.3;
    // Subtle rotation
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.5 + phase) * 0.1;
    meshRef.current.rotation.y = rotation[1] + t * 0.15 * speed;
    // Mouse tilt
    meshRef.current.rotation.x += state.pointer.y * 0.1;
    meshRef.current.rotation.y += state.pointer.x * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[0.8, 1.1, 1, 1]} />
      <meshBasicMaterial
        color="#ff9f4a"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        wireframe
      />
    </mesh>
  );
}

function HoloEdges({ position, rotation, speed, phase }: {
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
  phase: number;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const w = 0.8, h = 1.1;
    const hw = w / 2, hh = h / 2;
    const positions = new Float32Array([
      -hw, -hh, 0, hw, -hh, 0,
      hw, -hh, 0, hw, hh, 0,
      hw, hh, 0, -hw, hh, 0,
      -hw, hh, 0, -hw, -hh, 0,
      // Inner detail lines
      -hw * 0.6, hh * 0.6, 0, hw * 0.6, hh * 0.6, 0,
      -hw * 0.6, -hh * 0.3, 0, hw * 0.6, -hh * 0.3, 0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!lineRef.current) return;
    const t = state.clock.elapsedTime;
    lineRef.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.3;
    lineRef.current.rotation.x = rotation[0] + Math.sin(t * 0.5 + phase) * 0.1;
    lineRef.current.rotation.y = rotation[1] + t * 0.15 * speed;
    lineRef.current.rotation.x += state.pointer.y * 0.1;
    lineRef.current.rotation.y += state.pointer.x * 0.1;
  });

  return (
    <lineSegments ref={lineRef} position={position} rotation={rotation} geometry={geometry}>
      <lineBasicMaterial color="#ff9f4a" transparent opacity={0.35} />
    </lineSegments>
  );
}

/* Floating dust particles */
function Dust() {
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      sizes[i] = 1 + Math.random() * 2;
    }
    return { positions, sizes };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ff9f4a"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene() {
  const cards = useMemo(() => {
    return Array.from({ length: CARD_COUNT }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3 - 1,
      ] as [number, number, number],
      rotation: [
        Math.random() * 0.5,
        Math.random() * Math.PI,
        Math.random() * 0.3,
      ] as [number, number, number],
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  return (
    <>
      {cards.map((c, i) => (
        <group key={i}>
          <HoloCard {...c} />
          <HoloEdges {...c} />
        </group>
      ))}
      <Dust />
    </>
  );
}

export default function HoloCardsBg() {
  return (
    <div className="absolute inset-0 -z-10 opacity-80">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
