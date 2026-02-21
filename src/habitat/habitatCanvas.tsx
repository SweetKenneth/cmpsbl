/**
 * Clockless Habitat — Canvas
 * vX.UI.ULTIMATE
 *
 * Full-screen dimensional cognitive habitat.
 * Delta-driven rendering from snapshotEngine.
 * No SaaS patterns. No KPI grids. No alarm UI.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { SignalField } from './signalField';
import { PrecisionOverlay } from './precisionOverlay';
import { resolveHabitatState, type HabitatState } from './habitatStateResolver';
import { createNamespaceContext, type NamespaceContext } from './namespaceLens';
import { updateSpatialMemory, resetSpatialMemory, getDefaultSpatial } from './spatialMemory';
import { shouldDisable3DDepth } from './depthEngine';
import { checkHabitatIntegrity } from './integrityLayer';
import { getDecodeMode } from '@/core/goal';
import { appendEvent } from '@/core/events/eventStore';
import type { UserTier } from '@/core/decode/depthResolver';

// ═══ Camera Controller ════════════════════════════════════════════

function HabitatCamera({
  spatial,
  temporalState,
  parallaxIntensity,
  orbitalSpeed,
  orbitalRadius,
}: {
  spatial: import('./spatialMemory').SpatialState;
  temporalState: import('./temporalEngine').TemporalState;
  parallaxIntensity: number;
  orbitalSpeed: number;
  orbitalRadius: number;
}) {
  const { camera, gl } = useThree();
  const pointerRef = useRef({ x: 0, y: 0 });
  const targetPos = useRef(new THREE.Vector3(...spatial.cameraPosition));

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    gl.domElement.addEventListener('pointermove', onPointerMove);
    return () => gl.domElement.removeEventListener('pointermove', onPointerMove);
  }, [gl]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Target position with micro-orbital motion
    const orbX = Math.sin(t * orbitalSpeed) * orbitalRadius;
    const orbY = Math.cos(t * orbitalSpeed * 0.7) * orbitalRadius;

    // Parallax from pointer
    const parX = pointerRef.current.x * parallaxIntensity;
    const parY = pointerRef.current.y * parallaxIntensity * 0.5;

    targetPos.current.set(
      spatial.cameraPosition[0] + orbX + parX,
      spatial.cameraPosition[1] + orbY + parY,
      spatial.cameraPosition[2]
    );

    // Smooth lerp
    camera.position.lerp(targetPos.current, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ═══ Environment Header ═══════════════════════════════════════════

function EnvironmentHeader({ habitatState }: { habitatState: HabitatState }) {
  const { namespace, integrity, temporal } = habitatState;

  const integrityColor =
    integrity.state === 'VALID'
      ? 'text-[hsl(var(--system-green))]'
      : integrity.state === 'MISMATCH'
        ? 'text-destructive'
        : 'text-muted-foreground';

  return (
    <div className="absolute top-4 left-4 right-4 z-30 flex items-start justify-between pointer-events-none">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: temporal.state === 'CALM' ? 'hsl(var(--system-green))'
                : temporal.state === 'ACTIVE' ? 'hsl(var(--neon-cyan))'
                : temporal.state === 'SURGE' ? 'hsl(var(--neon-amber))'
                : 'hsl(var(--destructive))',
            }}
          />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            {namespace.namespace.namespaceId}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span>Health {namespace.healthIndex}%</span>
          <span>·</span>
          <span>Signals {namespace.activeSignals}</span>
          <span>·</span>
          <span className={integrityColor}>
            Integrity {integrity.state}
          </span>
        </div>
      </div>

      {/* Temporal state indicator */}
      <div className="text-right">
        <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
          {temporal.state}
        </span>
        <div className="flex items-center gap-1 mt-1 justify-end">
          <span className="text-[9px] font-mono text-muted-foreground/40">
            repair {temporal.repairVelocity.toFixed(1)}/hr
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══ Decode Auto-Watch Display ════════════════════════════════════

function AutoWatchDisplay({ utterance }: { utterance: import('./decodeInterface').DecodeUtterance | null }) {
  return (
    <AnimatePresence>
      {utterance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-20 left-4 right-4 z-30 pointer-events-none"
        >
          <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-lg px-4 py-3 max-w-lg">
            <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-1">
              decode · {utterance.trigger.replace('_', ' ')}
            </p>
            <p className="text-xs font-mono text-foreground leading-relaxed">
              {utterance.content}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══ Recenter Control ═════════════════════════════════════════════

function RecenterControl({
  namespaceId,
  onRecenter,
}: {
  namespaceId: string;
  onRecenter: () => void;
}) {
  const handleRecenter = useCallback(() => {
    resetSpatialMemory(namespaceId);
    appendEvent('HEALTH_STATE_CHANGE', 'habitat', namespaceId, 'custom', 'recentered');
    onRecenter();
  }, [namespaceId, onRecenter]);

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-4 right-4 z-30 text-[10px] font-mono text-muted-foreground/50 
                 hover:text-muted-foreground transition-colors duration-300
                 border border-border/20 hover:border-border/40 rounded px-3 py-1.5
                 bg-card/30 backdrop-blur-sm"
    >
      Recenter Habitat
    </button>
  );
}

// ═══ Main Canvas ══════════════════════════════════════════════════

interface HabitatCanvasProps {
  userId?: string;
  userTier?: UserTier;
  namespaceId?: string;
}

export function HabitatCanvas({
  userId = 'default-user',
  userTier = 'CREATOR',
  namespaceId = 'default',
}: HabitatCanvasProps) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [globalView, setGlobalView] = useState(false);
  const [habitatState, setHabitatState] = useState<HabitatState | null>(null);
  const [is3DDisabled] = useState(() => shouldDisable3DDepth());
  const namespaceCtx = useMemo(
    () => createNamespaceContext(userId, userTier, namespaceId),
    [userId, userTier, namespaceId]
  );

  // Resolve habitat state
  const refreshState = useCallback(() => {
    const state = resolveHabitatState(namespaceCtx, globalView);
    setHabitatState(state);
  }, [namespaceCtx, globalView]);

  // Initial load + periodic refresh (delta-driven, not polling)
  useEffect(() => {
    refreshState();
    // Check integrity on mount
    checkHabitatIntegrity().then(() => refreshState());
    const interval = setInterval(refreshState, 30_000); // re-resolve every 30s
    return () => clearInterval(interval);
  }, [refreshState]);

  // Handle node inspection
  const handleNodeClick = useCallback((nodeId: string) => {
    setFocusedNodeId(prev => prev === nodeId ? null : nodeId);
    updateSpatialMemory(namespaceId, { focusedNodeId: nodeId });
  }, [namespaceId]);

  const handleCloseOverlay = useCallback(() => {
    setFocusedNodeId(null);
    updateSpatialMemory(namespaceId, { focusedNodeId: null });
  }, [namespaceId]);

  const handleRecenter = useCallback(() => {
    setFocusedNodeId(null);
    setGlobalView(false);
    refreshState();
  }, [refreshState]);

  if (!habitatState) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
      </div>
    );
  }

  const focusedMetrics = focusedNodeId
    ? habitatState.namespace.modules[focusedNodeId] ?? null
    : null;

  const isStrictMode = getDecodeMode() === 'STRICT_TELEMETRY';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Environment Header */}
      <EnvironmentHeader habitatState={habitatState} />

      {/* 3D Canvas */}
      {is3DDisabled ? (
        <Fallback2DView habitatState={habitatState} onNodeClick={handleNodeClick} focusedNodeId={focusedNodeId} />
      ) : (
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
          className="!absolute inset-0"
          style={{ background: 'transparent' }}
        >
          <color attach="background" args={['#0a0a0e']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.4} color="#00cccc" />
          <pointLight position={[-5, -3, 3]} intensity={0.2} color="#cc88ff" />

          <HabitatCamera
            spatial={habitatState.spatial}
            temporalState={habitatState.temporal.state}
            parallaxIntensity={habitatState.depth.cameraParallaxIntensity}
            orbitalSpeed={habitatState.depth.microOrbitalSpeed}
            orbitalRadius={habitatState.depth.microOrbitalRadius}
          />

          <SignalField
            namespaceData={habitatState.namespace}
            temporal={habitatState.temporal}
            depthConfig={habitatState.depth}
            focusedNodeId={focusedNodeId}
            onNodeClick={handleNodeClick}
          />
        </Canvas>
      )}

      {/* Precision Overlay */}
      <PrecisionOverlay
        moduleId={focusedNodeId}
        moduleMetrics={focusedMetrics}
        tier={userTier}
        integrity={habitatState.integrity}
        isStrictMode={isStrictMode}
        onClose={handleCloseOverlay}
      />

      {/* Auto-Watch Decode */}
      <AutoWatchDisplay utterance={habitatState.autoWatchUtterance} />

      {/* Enterprise Global Toggle */}
      {userTier === 'ENTERPRISE' && (
        <button
          onClick={() => setGlobalView(v => !v)}
          className="absolute bottom-4 left-4 z-30 text-[10px] font-mono text-muted-foreground/50 
                     hover:text-muted-foreground transition-colors duration-300
                     border border-border/20 hover:border-border/40 rounded px-3 py-1.5
                     bg-card/30 backdrop-blur-sm"
        >
          {globalView ? 'Namespace View' : 'Global Context'}
        </button>
      )}

      {/* Recenter */}
      <RecenterControl namespaceId={namespaceId} onRecenter={handleRecenter} />

      {/* Vignette overlay for peripheral darkening */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: `radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,${habitatState.temporal.peripheralDarkening}) 100%)`,
        }}
      />
    </div>
  );
}

// ═══ Fallback 2D View (Low-Performance Devices) ═══════════════════

function Fallback2DView({
  habitatState,
  onNodeClick,
  focusedNodeId,
}: {
  habitatState: HabitatState;
  onNodeClick: (id: string) => void;
  focusedNodeId: string | null;
}) {
  const modules = Object.entries(habitatState.namespace.modules);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full max-w-2xl aspect-square">
        {modules.map(([id, metrics], index) => {
          const angle = (index / modules.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 38;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          const isFocused = focusedNodeId === id;
          const healthColor =
            metrics.healthScore >= 80 ? 'hsl(var(--system-green))'
            : metrics.healthScore >= 60 ? 'hsl(var(--neon-amber))'
            : 'hsl(var(--destructive))';

          return (
            <button
              key={id}
              onClick={() => onNodeClick(id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500
                         ${isFocused ? 'scale-125' : 'scale-100 hover:scale-110'}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className="w-10 h-10 rounded-full border flex items-center justify-center"
                style={{
                  borderColor: healthColor,
                  backgroundColor: `${healthColor}20`,
                  boxShadow: isFocused ? `0 0 20px ${healthColor}40` : 'none',
                }}
              >
                <span className="text-[8px] font-mono text-foreground">
                  {metrics.healthScore}
                </span>
              </div>
              <span className="block text-[8px] font-mono text-muted-foreground text-center mt-1">
                {id.slice(0, 6)}
              </span>
            </button>
          );
        })}

        {/* Center health index */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-2xl font-mono font-light text-foreground">
            {habitatState.namespace.healthIndex}
          </span>
          <span className="block text-[9px] font-mono text-muted-foreground mt-1">
            namespace health
          </span>
        </div>
      </div>
    </div>
  );
}

export default HabitatCanvas;
