/**
 * Clockless Habitat — Signal Field
 * vX.UI.ULTIMATE
 *
 * 3D signal cluster visualization. Clustered by default.
 * Each node represents a module's health/activity.
 * Delta-driven rendering only.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TemporalReading } from './temporalEngine';
import type { NamespacedData } from './namespaceLens';
import type { DepthConfig } from './depthEngine';

// ═══ Types ═════════════════════════════════════════════════════════

interface SignalNode {
  id: string;
  label: string;
  healthScore: number;
  position: [number, number, number];
  intensity: number; // 0–1 based on activity
  layerId: string;
}

interface SignalFieldProps {
  namespaceData: NamespacedData;
  temporal: TemporalReading;
  depthConfig: DepthConfig;
  focusedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
}

// ═══ Node Layout ═══════════════════════════════════════════════════

function layoutNodes(
  modules: NamespacedData['modules'],
  depthConfig: DepthConfig
): SignalNode[] {
  const entries = Object.entries(modules);
  const nodes: SignalNode[] = [];
  const count = entries.length;

  entries.forEach(([moduleId, metrics], index) => {
    const angle = (index / count) * Math.PI * 2;
    const radius = 2.5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.6;

    // Map health to layer: healthy = higher Z, unhealthy = lower
    const healthNorm = metrics.healthScore / 100;
    const probeLayer = depthConfig.layers.find(l => l.id === 'probes');
    const z = (probeLayer?.zOffset ?? 2) * 0.3 * healthNorm;

    // Activity intensity from counters
    const totalActivity = Object.values(metrics.counters).reduce((a, b) => a + b, 0);
    const intensity = Math.min(totalActivity / 1000, 1);

    nodes.push({
      id: moduleId,
      label: moduleId,
      healthScore: metrics.healthScore,
      position: [x, y, z],
      intensity,
      layerId: 'probes',
    });
  });

  return nodes;
}

// ═══ Signal Node Component ════════════════════════════════════════

function SignalNodeMesh({
  node,
  isFocused,
  temporal,
  onClick,
}: {
  node: SignalNode;
  isFocused: boolean;
  temporal: TemporalReading;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const healthColor = useMemo(() => {
    const h = node.healthScore;
    if (h >= 80) return new THREE.Color().setHSL(0.45, 0.8, 0.5); // cyan-green
    if (h >= 60) return new THREE.Color().setHSL(0.15, 0.9, 0.5); // amber
    if (h >= 40) return new THREE.Color().setHSL(0.08, 0.9, 0.5); // orange
    return new THREE.Color().setHSL(0.0, 0.8, 0.5);                // red
  }, [node.healthScore]);

  const baseScale = isFocused ? 1.3 : 0.8 + node.intensity * 0.4;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Micro-orbital motion
    const orbitalSpeed = 0.3 + node.intensity * 0.2;
    const orbitalRadius = 0.05;
    meshRef.current.position.x = node.position[0] + Math.sin(t * orbitalSpeed) * orbitalRadius;
    meshRef.current.position.y = node.position[1] + Math.cos(t * orbitalSpeed * 0.7) * orbitalRadius;

    // Z-lift when focused
    const targetZ = isFocused ? node.position[2] + 1.5 : node.position[2];
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.05);

    // Pulse based on temporal rhythm
    const pulse = Math.sin(t * (Math.PI * 2 / temporal.pulseRhythm)) * 0.1 + 1;
    meshRef.current.scale.setScalar(baseScale * pulse);

    // Glow intensity
    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      glowMat.opacity = 0.15 + node.intensity * 0.15 + Math.sin(t * 1.5) * 0.05;
      glowRef.current.scale.setScalar(baseScale * pulse * 2);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={node.position}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <icosahedronGeometry args={[0.2, 2]} />
        <meshStandardMaterial
          color={healthColor}
          emissive={healthColor}
          emissiveIntensity={isFocused ? 0.8 : 0.3 + node.intensity * 0.3}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* Glow sphere */}
      <mesh ref={glowRef} position={node.position}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={healthColor}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ═══ Connection Lines ═════════════════════════════════════════════

function ConnectionLines({ nodes }: { nodes: SignalNode[] }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];

    // Connect adjacent nodes
    for (let i = 0; i < nodes.length; i++) {
      const next = nodes[(i + 1) % nodes.length];
      positions.push(...nodes[i].position, ...next.position);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [nodes]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={0x00cccc}
        transparent
        opacity={0.1}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ═══ Resource Current ═════════════════════════════════════════════

function ResourceCurrent({ temporal }: { temporal: TemporalReading }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 80;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = -1 + Math.random() * -1; // Z-1 to Z-2 layer
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    const speed = 0.2 + temporal.motionDensity * 0.3;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += Math.sin(t * speed + i) * 0.003;
      pos[i * 3 + 1] += Math.cos(t * speed * 0.7 + i) * 0.002;
      // Wrap around
      if (pos[i * 3] > 4) pos[i * 3] = -4;
      if (pos[i * 3] < -4) pos[i * 3] = 4;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={0x00aacc}
        size={0.04}
        transparent
        opacity={0.3 + temporal.motionDensity * 0.2}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ═══ Atmospheric Layer ════════════════════════════════════════════

function AtmosphericLayer({ temporal }: { temporal: TemporalReading }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    // Warmth shift: warm = amber tint, cool = blue tint
    const warmth = temporal.lightWarmth;
    const color = new THREE.Color().setHSL(
      0.15 * warmth + 0.55 * (1 - warmth), // hue: amber↔blue
      0.3,
      0.08 + temporal.peripheralDarkening
    );
    mat.color = color;
    mat.opacity = 0.15 + temporal.peripheralDarkening;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2.5]}>
      <planeGeometry args={[20, 14]} />
      <meshBasicMaterial
        color={0x112233}
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </mesh>
  );
}

// ═══ Main Export ═══════════════════════════════════════════════════

export function SignalField({
  namespaceData,
  temporal,
  depthConfig,
  focusedNodeId,
  onNodeClick,
}: SignalFieldProps) {
  const nodes = useMemo(
    () => layoutNodes(namespaceData.modules, depthConfig),
    [namespaceData.modules, depthConfig]
  );

  return (
    <group>
      <AtmosphericLayer temporal={temporal} />
      <ResourceCurrent temporal={temporal} />
      <ConnectionLines nodes={nodes} />
      {nodes.map(node => (
        <SignalNodeMesh
          key={node.id}
          node={node}
          isFocused={focusedNodeId === node.id}
          temporal={temporal}
          onClick={() => onNodeClick(node.id)}
        />
      ))}
    </group>
  );
}
