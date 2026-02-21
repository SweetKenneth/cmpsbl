/**
 * Clockless Habitat — Depth Engine
 * vX.UI.ULTIMATE
 *
 * Subtle 3D depth management. Parallax layers, micro-orbital motion,
 * depth-of-field blur, gentle Z-axis lift on inspection.
 * No dramatic zooms. No spinning. No game-engine theatrics.
 */

import type { TemporalState } from './temporalEngine';

// ═══ Types ═════════════════════════════════════════════════════════

export interface DepthLayer {
  id: string;
  label: string;
  zOffset: number;        // base Z position
  parallaxFactor: number; // pointer movement multiplier
  opacity: number;
  blurAmount: number;     // px, 0 = sharp
}

export interface DepthConfig {
  layers: DepthLayer[];
  cameraParallaxIntensity: number;  // 0–1
  microOrbitalSpeed: number;         // radians/sec
  microOrbitalRadius: number;        // world units
  inspectionLiftZ: number;           // Z lift on node focus
  inspectionDimOpacity: number;      // background dim
}

// ═══ Layer Definitions ════════════════════════════════════════════

const BASE_LAYERS: DepthLayer[] = [
  { id: 'escalation',   label: 'Escalation Clusters', zOffset: 3,   parallaxFactor: 0.08, opacity: 1,    blurAmount: 0 },
  { id: 'probes',       label: 'Probe Clusters',      zOffset: 2,   parallaxFactor: 0.06, opacity: 1,    blurAmount: 0 },
  { id: 'engines',      label: 'Engines',             zOffset: 1,   parallaxFactor: 0.04, opacity: 0.95, blurAmount: 0 },
  { id: 'clm',          label: 'CLM Cycles',          zOffset: 0,   parallaxFactor: 0.03, opacity: 0.9,  blurAmount: 0.5 },
  { id: 'resource',     label: 'Resource Current',    zOffset: -1,  parallaxFactor: 0.02, opacity: 0.7,  blurAmount: 1 },
  { id: 'atmosphere',   label: 'Atmospheric Layer',   zOffset: -2,  parallaxFactor: 0.01, opacity: 0.4,  blurAmount: 2 },
  { id: 'substrate',    label: 'Global Substrate',    zOffset: -3,  parallaxFactor: 0.005, opacity: 0.15, blurAmount: 3 },
];

// ═══ Temporal Modifiers ═══════════════════════════════════════════

function applyTemporalCompression(layers: DepthLayer[], compression: number): DepthLayer[] {
  if (compression <= 0) return layers;
  return layers.map(layer => ({
    ...layer,
    zOffset: layer.zOffset * (1 - compression * 0.4),
  }));
}

// ═══ Config Builder ═══════════════════════════════════════════════

export function buildDepthConfig(
  temporalState: TemporalState,
  depthCompression: number = 0,
  isEnterpriseGlobal: boolean = false
): DepthConfig {
  let layers = [...BASE_LAYERS];

  // Hide substrate layer for non-enterprise
  if (!isEnterpriseGlobal) {
    layers = layers.filter(l => l.id !== 'substrate');
  }

  // Apply temporal compression
  layers = applyTemporalCompression(layers, depthCompression);

  // Adjust motion based on temporal state
  const orbitalSpeedMap: Record<TemporalState, number> = {
    CALM: 0.05,
    ACTIVE: 0.08,
    SURGE: 0.12,
    INSTABILITY: 0.15,
  };

  return {
    layers,
    cameraParallaxIntensity: 0.3,
    microOrbitalSpeed: orbitalSpeedMap[temporalState],
    microOrbitalRadius: 0.15,
    inspectionLiftZ: 1.5,
    inspectionDimOpacity: 0.3,
  };
}

// ═══ Performance ══════════════════════════════════════════════════

export function shouldDisable3DDepth(): boolean {
  if (typeof navigator === 'undefined') return false;
  // Detect low-performance: no GPU, mobile with low memory
  const gl = document.createElement('canvas').getContext('webgl');
  if (!gl) return true;
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    // Known software renderers
    if (/swiftshader|llvmpipe|mesa/i.test(renderer)) return true;
  }
  // Check device memory if available
  if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) return true;
  return false;
}
