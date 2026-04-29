import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * A polyhedron that slowly morphs between geometric shapes,
 * representing the different products being compared.
 */

function MorphingShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  // Create multiple geometries to morph between
  const geometries = useMemo(() => [
    new THREE.IcosahedronGeometry(1.5, 1),      // QuantaLLM
    new THREE.OctahedronGeometry(1.5, 1),        // MLC LLM
    new THREE.DodecahedronGeometry(1.5, 0),      // llama.cpp
    new THREE.TetrahedronGeometry(1.5, 1),       // Ollama
  ], []);

  const wireGeometries = useMemo(
    () => geometries.map((g) => new THREE.WireframeGeometry(g)),
    [geometries],
  );

  const currentGeo = useRef(0);
  const nextGeo = useRef(1);
  const morphProgress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !wireRef.current) return;
    const t = state.clock.elapsedTime;

    // Cycle through shapes every 4 seconds
    morphProgress.current += delta * 0.25;
    if (morphProgress.current >= 1) {
      morphProgress.current = 0;
      currentGeo.current = nextGeo.current;
      nextGeo.current = (nextGeo.current + 1) % geometries.length;
    }

    // Swap geometry at transition point
    const geoIndex = morphProgress.current < 0.5 ? currentGeo.current : nextGeo.current;
    meshRef.current.geometry = geometries[geoIndex];
    wireRef.current.geometry = wireGeometries[geoIndex];

    // Scale pulse at transition
    const transitionScale = morphProgress.current > 0.4 && morphProgress.current < 0.6
      ? 0.9 + Math.sin((morphProgress.current - 0.4) * Math.PI * 5) * 0.1
      : 1;

    // Continuous rotation
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
    meshRef.current.scale.setScalar(transitionScale);

    wireRef.current.rotation.copy(meshRef.current.rotation);
    wireRef.current.scale.copy(meshRef.current.scale);

    // Mouse parallax
    meshRef.current.rotation.x += state.pointer.y * 0.15;
    meshRef.current.rotation.y += state.pointer.x * 0.15;
    wireRef.current.rotation.copy(meshRef.current.rotation);
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <meshBasicMaterial color="#ff9f4a" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments ref={wireRef}>
        <lineBasicMaterial color="#ff9f4a" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

/* Orbiting particles around the shape */
function OrbitParticles() {
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 40;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 1;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 1.5 + Math.random() * 2.5;
    }

    return { positions, sizes };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    ref.current.rotation.x = state.clock.elapsedTime * 0.05;
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
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <MorphingShape />
      <OrbitParticles />
    </>
  );
}

export default function MorphGeoBg() {
  return (
    <div className="absolute inset-0 -z-10 opacity-80">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
