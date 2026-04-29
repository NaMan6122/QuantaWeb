import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PRIMARY = '#ff9f4a';
const PRIMARY_DIM = '#cc7a30';
const TRACE_COLOR = '#ff9f4a';
const BASE_COLOR = '#1a1a1a';
const BORDER_COLOR = '#333333';

function hexShape(radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

// Honeycomb positions for 7 hexagons (center + 6 surrounding)
function corePositions(spacing: number): [number, number][] {
  const positions: [number, number][] = [[0, 0]];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    positions.push([spacing * Math.cos(angle), spacing * Math.sin(angle)]);
  }
  return positions;
}

// Trace lines connecting cores
function traceSegments(positions: [number, number][]): [number, number][][] {
  const segments: [number, number][][] = [];
  // Connect center to each surrounding core
  for (let i = 1; i < positions.length; i++) {
    segments.push([positions[0], positions[i]]);
  }
  // Connect adjacent surrounding cores
  for (let i = 1; i < positions.length; i++) {
    const next = i === positions.length - 1 ? 1 : i + 1;
    segments.push([positions[i], positions[next]]);
  }
  return segments;
}

function ChipScene() {
  const groupRef = useRef<THREE.Group>(null!);
  const coreRefs = useRef<THREE.Mesh[]>([]);
  const traceRefs = useRef<THREE.LineSegments[]>([]);
  const { pointer } = useThree();

  const coreRadius = 0.22;
  const spacing = 0.6;
  const baseRadius = 1.3;
  const positions = useMemo(() => corePositions(spacing), []);
  const traces = useMemo(() => traceSegments(positions), [positions]);

  const baseGeo = useMemo(() => {
    const shape = hexShape(baseRadius);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
  }, []);

  const coreGeo = useMemo(() => {
    const shape = hexShape(coreRadius);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
  }, []);

  const borderGeo = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const angle = (Math.PI / 3) * (i % 6) - Math.PI / 6;
      points.push(new THREE.Vector3(
        (baseRadius + 0.08) * Math.cos(angle),
        0.1,
        (baseRadius + 0.08) * Math.sin(angle),
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const traceGeos = useMemo(() => {
    return traces.map(([a, b]) => {
      const points = [
        new THREE.Vector3(a[0], 0.1, a[1]),
        new THREE.Vector3(b[0], 0.1, b[1]),
      ];
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, [traces]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Rotation
    groupRef.current.rotation.y = t * 0.3;

    // Tilt toward pointer
    groupRef.current.rotation.x = -0.3 + pointer.y * 0.15;
    groupRef.current.rotation.z = pointer.x * 0.1;

    // Sequential core pulse
    const cycleTime = 2.5; // seconds per full cycle
    const phase = (t % cycleTime) / cycleTime;

    coreRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const corePhase = i / 7;
      let dist = phase - corePhase;
      if (dist < 0) dist += 1;
      const glow = Math.max(0, 1 - dist * 4);
      const intensity = 0.3 + glow * 2.5;
      mat.emissiveIntensity = intensity;
    });

    // Trace flash
    traceRefs.current.forEach((line, i) => {
      if (!line) return;
      const mat = line.material as THREE.LineBasicMaterial;
      // Each trace connects two cores; flash when pulse passes
      const tracePhase = (i < 7 ? i / 7 : ((i - 7) + 0.5) / 7) % 1;
      let dist = phase - tracePhase;
      if (dist < 0) dist += 1;
      const flash = Math.max(0, 1 - dist * 5);
      mat.opacity = 0.15 + flash * 0.85;
    });
  });

  return (
    <group ref={groupRef} rotation={[-0.3, 0, 0]}>
      {/* Base chip die */}
      <mesh geometry={baseGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color={BASE_COLOR} roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Outer border ring */}
      <lineLoop geometry={borderGeo}>
        <lineBasicMaterial color={BORDER_COLOR} linewidth={1} />
      </lineLoop>

      {/* Cores */}
      {positions.map(([x, z], i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) coreRefs.current[i] = el; }}
          geometry={coreGeo}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.08, z]}
        >
          <meshStandardMaterial
            color={PRIMARY_DIM}
            emissive={PRIMARY}
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Traces */}
      {traceGeos.map((geo, i) => (
        <lineSegments
          key={i}
          ref={(el) => { if (el) traceRefs.current[i] = el as unknown as THREE.LineSegments; }}
          geometry={geo}
        >
          <lineBasicMaterial color={TRACE_COLOR} transparent opacity={0.15} toneMapped={false} />
        </lineSegments>
      ))}
    </group>
  );
}

export default function HexChipVisual() {
  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        camera={{ position: [0, 3, 4], fov: 35 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[0, 5, 2]} intensity={0.8} />
        <ChipScene />
      </Canvas>
    </div>
  );
}
