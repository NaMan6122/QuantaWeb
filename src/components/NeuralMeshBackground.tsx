import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRIMARY = new THREE.Color('#ff9f4a');
const SECONDARY = new THREE.Color('#ff734c');
const NODE_COUNT = 100;
const NODE_COUNT_MOBILE = 55;
const CONNECTION_DISTANCE = 2.8;
const SPREAD_X = 10;
const SPREAD_Y = 3;
const SPREAD_Z = 8;

/* ------------------------------------------------------------------ */
/*  Generate static node positions & metadata                          */
/* ------------------------------------------------------------------ */

function generateNodes(count: number) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count); // for floating animation
  const amplitudes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
    phases[i] = Math.random() * Math.PI * 2;
    amplitudes[i] = 0.02 + Math.random() * 0.06;
  }

  return { positions, phases, amplitudes };
}

function generateConnections(positions: Float32Array, count: number) {
  const pairs: [number, number][] = [];

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < CONNECTION_DISTANCE) {
        pairs.push([i, j]);
      }
    }
  }

  return pairs;
}

/* ------------------------------------------------------------------ */
/*  Neural Mesh scene                                                  */
/* ------------------------------------------------------------------ */

function NeuralMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { pointer, size } = useThree();

  const isMobile = size.width < 768;
  const nodeCount = isMobile ? NODE_COUNT_MOBILE : NODE_COUNT;

  const { positions: initPositions, phases, amplitudes } = useMemo(
    () => generateNodes(nodeCount),
    [nodeCount],
  );

  const connections = useMemo(
    () => generateConnections(initPositions, nodeCount),
    [initPositions, nodeCount],
  );

  // Working copy of positions for animation
  const livePositions = useMemo(
    () => new Float32Array(initPositions),
    [initPositions],
  );

  // Line geometry positions (2 vertices per connection)
  const linePositions = useMemo(
    () => new Float32Array(connections.length * 6),
    [connections],
  );

  // Line colors (for pulse effect)
  const lineColors = useMemo(
    () => {
      const arr = new Float32Array(connections.length * 6);
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] = PRIMARY.r;
        arr[i + 1] = PRIMARY.g;
        arr[i + 2] = PRIMARY.b;
      }
      return arr;
    },
    [connections],
  );

  // Node sizes
  const sizes = useMemo(() => {
    const arr = new Float32Array(nodeCount);
    for (let i = 0; i < nodeCount; i++) {
      arr[i] = 2 + Math.random() * 3;
    }
    return arr;
  }, [nodeCount]);

  // Pulse state
  const pulseRef = useRef({ active: -1, time: 0, next: 2 });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    // Slow rotation
    group.rotation.y = t * 0.04;

    // Mouse parallax
    group.position.x = THREE.MathUtils.lerp(group.position.x, pointer.x * 0.5, 0.03);
    group.position.y = THREE.MathUtils.lerp(group.position.y, pointer.y * 0.3, 0.03);

    // Float nodes
    for (let i = 0; i < nodeCount; i++) {
      livePositions[i * 3 + 1] =
        initPositions[i * 3 + 1] +
        Math.sin(t * 0.6 + phases[i]) * amplitudes[i];
    }

    // Update point positions
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      posAttr.array = livePositions;
      posAttr.needsUpdate = true;
    }

    // Update line positions
    for (let c = 0; c < connections.length; c++) {
      const [a, b] = connections[c];
      linePositions[c * 6] = livePositions[a * 3];
      linePositions[c * 6 + 1] = livePositions[a * 3 + 1];
      linePositions[c * 6 + 2] = livePositions[a * 3 + 2];
      linePositions[c * 6 + 3] = livePositions[b * 3];
      linePositions[c * 6 + 4] = livePositions[b * 3 + 1];
      linePositions[c * 6 + 5] = livePositions[b * 3 + 2];
    }

    if (linesRef.current) {
      const geo = linesRef.current.geometry;
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      posAttr.array = linePositions;
      posAttr.needsUpdate = true;

      // Pulse: periodically brighten random connections
      const pulse = pulseRef.current;
      pulse.time += state.clock.getDelta();

      if (pulse.time > pulse.next && connections.length > 0) {
        pulse.active = Math.floor(Math.random() * connections.length);
        pulse.time = 0;
        pulse.next = 1 + Math.random() * 2;
      }

      const colAttr = geo.getAttribute('color') as THREE.BufferAttribute;
      const colors = colAttr.array as Float32Array;

      for (let c = 0; c < connections.length; c++) {
        const isPulse = c === pulse.active && pulse.time < 0.6;
        const brightness = isPulse ? 0.8 + Math.sin(pulse.time * 10) * 0.2 : 0.15;
        const col = isPulse ? SECONDARY : PRIMARY;
        colors[c * 6] = col.r * brightness;
        colors[c * 6 + 1] = col.g * brightness;
        colors[c * 6 + 2] = col.b * brightness;
        colors[c * 6 + 3] = col.r * brightness;
        colors[c * 6 + 4] = col.g * brightness;
        colors[c * 6 + 5] = col.b * brightness;
      }
      colAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[livePositions, 3]}
            count={nodeCount}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
            count={nodeCount}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={PRIMARY}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={connections.length * 2}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
            count={connections.length * 2}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported wrapper                                                   */
/* ------------------------------------------------------------------ */

export default function NeuralMeshBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <NeuralMesh />
      </Canvas>
    </div>
  );
}
