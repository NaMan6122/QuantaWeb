import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BAR_COUNT = 64;

function WaveformBars({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const phases = useMemo(() => Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2), []);
  const activeRef = useRef(active);
  activeRef.current = active;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < BAR_COUNT; i++) {
      const x = (i / BAR_COUNT - 0.5) * 10;
      const isActive = activeRef.current;

      // Height based on activity
      const baseHeight = 0.05;
      const activeHeight = isActive
        ? 0.3 + Math.sin(t * 4 + phases[i]) * 0.25 + Math.sin(t * 7 + i * 0.3) * 0.15
        : baseHeight + Math.sin(t * 1.5 + phases[i]) * 0.02;

      const height = Math.max(0.02, activeHeight);

      dummy.position.set(x, height / 2, 0);
      dummy.scale.set(0.08, height, 0.08);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color: brighter when active
      const color = new THREE.Color('#ff9f4a');
      if (isActive) {
        const brightness = 0.7 + Math.sin(t * 3 + phases[i]) * 0.3;
        color.multiplyScalar(brightness);
      } else {
        color.multiplyScalar(0.3);
      }
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BAR_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0.8} toneMapped={false} />
    </instancedMesh>
  );
}

/* Mirror reflection below */
function WaveformReflection({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const phases = useMemo(() => Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2), []);
  const activeRef = useRef(active);
  activeRef.current = active;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < BAR_COUNT; i++) {
      const x = (i / BAR_COUNT - 0.5) * 10;
      const isActive = activeRef.current;

      const baseHeight = 0.05;
      const activeHeight = isActive
        ? 0.3 + Math.sin(t * 4 + phases[i]) * 0.25 + Math.sin(t * 7 + i * 0.3) * 0.15
        : baseHeight + Math.sin(t * 1.5 + phases[i]) * 0.02;

      const height = Math.max(0.02, activeHeight) * 0.5;

      dummy.position.set(x, -height / 2, 0);
      dummy.scale.set(0.08, height, 0.08);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const color = new THREE.Color('#ff9f4a');
      color.multiplyScalar(isActive ? 0.1 : 0.05);
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BAR_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0.3} toneMapped={false} />
    </instancedMesh>
  );
}

function Scene({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.pointer.x * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <WaveformBars active={active} />
      <WaveformReflection active={active} />
    </group>
  );
}

export default function WaveformBg({ active = false }: { active?: boolean }) {
  return (
    <div className="absolute inset-0 -z-10 opacity-70">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Scene active={active} />
      </Canvas>
    </div>
  );
}
