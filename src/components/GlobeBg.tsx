import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function WireGlobe() {
  const globeRef = useRef<THREE.LineSegments>(null);
  const dotsRef = useRef<THREE.Points>(null);

  const globeGeo = useMemo(() => {
    const sphere = new THREE.SphereGeometry(2, 24, 16);
    return new THREE.WireframeGeometry(sphere);
  }, []);

  // Connection points on the globe surface converging to center
  const { dotPositions, dotColors, linePositions, lineColors } = useMemo(() => {
    const count = 20;
    const dotPositions = new Float32Array(count * 3);
    const dotColors = new Float32Array(count * 3);
    const linePositions = new Float32Array(count * 6); // 2 points per line
    const lineColors = new Float32Array(count * 6);
    const primary = new THREE.Color('#ff9f4a');
    const secondary = new THREE.Color('#ff734c');

    for (let i = 0; i < count; i++) {
      // Random point on sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;

      const c = i % 3 === 0 ? secondary : primary;
      dotColors[i * 3] = c.r;
      dotColors[i * 3 + 1] = c.g;
      dotColors[i * 3 + 2] = c.b;

      // Line from surface point to center (phone icon position)
      linePositions[i * 6] = x;
      linePositions[i * 6 + 1] = y;
      linePositions[i * 6 + 2] = z;
      linePositions[i * 6 + 3] = 0;
      linePositions[i * 6 + 4] = 0;
      linePositions[i * 6 + 5] = 0;

      lineColors[i * 6] = c.r;
      lineColors[i * 6 + 1] = c.g;
      lineColors[i * 6 + 2] = c.b;
      lineColors[i * 6 + 3] = c.r;
      lineColors[i * 6 + 4] = c.g;
      lineColors[i * 6 + 5] = c.b;
    }

    return { dotPositions, dotColors, linePositions, lineColors };
  }, []);

  // Center glow
  const centerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (globeRef.current) {
      globeRef.current.rotation.y = t * 0.15;
      globeRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (dotsRef.current) {
      dotsRef.current.rotation.y = t * 0.15;
      dotsRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (centerRef.current) {
      centerRef.current.scale.setScalar(0.15 + Math.sin(t * 2) * 0.03);
    }
  });

  return (
    <group>
      {/* Wireframe globe */}
      <lineSegments ref={globeRef} geometry={globeGeo}>
        <lineBasicMaterial color="#ff9f4a" transparent opacity={0.18} />
      </lineSegments>

      {/* Surface dots */}
      <points ref={dotsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dotPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dotColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          transparent
          opacity={0.8}
          size={4}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connection lines to center */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.15} />
      </lineSegments>

      {/* Center glow (the "phone") */}
      <mesh ref={centerRef}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ff9f4a" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.pointer.x * 0.15;
    groupRef.current.rotation.x = state.pointer.y * 0.1;
  });

  return (
    <group ref={groupRef}>
      <WireGlobe />
    </group>
  );
}

export default function GlobeBg() {
  return (
    <div className="absolute inset-0 -z-10 opacity-80">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
