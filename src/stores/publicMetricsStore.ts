/**
 * Public Metrics Store
 * Single Source of Truth for all public-facing metrics
 * 
 * This Zustand store serves as the canonical source for all marketing numbers,
 * version info, and capability counts across the entire substrate.
 * 
 * Update values here OR via the OS Dashboard "Public Metrics" tab to sync site-wide.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// TYPES
// =============================================================================

export interface PublicMetrics {
  // Version Information
  version: string;
  codename: string;
  epoch: string;
  buildDate: string;
  
  // Architecture Counts
  modulesCount: number;
  layersCount: number;
  
  // Synergy Metrics
  synergyPipelinesCount: number;
  synergyExecutorsCount: number;
  stierPipelinesCount: number;
  
  // Templates
  templatesCount: number;
  
  // Engine Metrics
  enginesCount: number;
  metaEnginesCount: number;
  
  // Capability Metrics
  capabilitiesCount: number;
  crownJewelCapabilitiesCount: number;
  archivedCapabilitiesCount: number;
  
  // Terminal & Commands
  terminalCommandsCount: number;
  
  // Integration
  integrationAdaptersCount: number;
  
  // Codebase
  linesOfCode: number;
  linesOfCodeDisplay: string;
  
  // Performance Claims
  routingLatencyClaim: string;
  
  // Accessibility
  wcagLevel: string;
  
  // Providers
  providersCount: number;
  byokSupported: boolean;
}

export interface PublicMetricsStore {
  metrics: PublicMetrics;
  lastUpdated: string;
  
  // Actions
  updateMetric: <K extends keyof PublicMetrics>(key: K, value: PublicMetrics[K]) => void;
  updateMetrics: (updates: Partial<PublicMetrics>) => void;
  resetToDefaults: () => void;
  getMetric: <K extends keyof PublicMetrics>(key: K) => PublicMetrics[K];
}

// =============================================================================
// DEFAULT VALUES (verified counts)
// =============================================================================

export const DEFAULT_METRICS: PublicMetrics = {
  // Version Information
  version: '17.0.0',
  codename: 'BELIEVER',
  epoch: 'BELIEVER',
  buildDate: new Date().toISOString().split('T')[0],
  
  // Architecture Counts — 10 public entities (CORE + 9 Nodes)
  modulesCount: 10,
  layersCount: 6,
  
  // Synergy Metrics (88 core + 27 discovery + 32 S-tier + 53 infrastructure = 200 + 100 crystallized = 300)
  synergyPipelinesCount: 300,
  synergyExecutorsCount: 125,
  stierPipelinesCount: 32,
  
  // Templates (base + high-value + expansion = 201+)
  templatesCount: 201,
  
  // Engine Metrics (76 base + 24 meta = 100)
  enginesCount: 76,
  metaEnginesCount: 24,
  
  // Capability Metrics (525+)
  capabilitiesCount: 525,
  crownJewelCapabilitiesCount: 168,
  archivedCapabilitiesCount: 136,
  
  // Terminal & Commands
  terminalCommandsCount: 360,
  
  // Integration
  integrationAdaptersCount: 35,
  
  // Codebase
  linesOfCode: 180000,
  linesOfCodeDisplay: '180k+',
  
  // Performance Claims
  routingLatencyClaim: '<100ms',
  
  // Accessibility
  wcagLevel: 'WCAG 2.2 AA',
  
  // Providers
  providersCount: 13,
  byokSupported: true,
};

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const usePublicMetricsStore = create<PublicMetricsStore>()(
  persist(
    (set, get) => ({
      metrics: { ...DEFAULT_METRICS },
      lastUpdated: new Date().toISOString(),
      
      updateMetric: (key, value) => {
        set((state) => ({
          metrics: { ...state.metrics, [key]: value },
          lastUpdated: new Date().toISOString(),
        }));
      },
      
      updateMetrics: (updates) => {
        set((state) => ({
          metrics: { ...state.metrics, ...updates },
          lastUpdated: new Date().toISOString(),
        }));
      },
      
      resetToDefaults: () => {
        set({
          metrics: { ...DEFAULT_METRICS },
          lastUpdated: new Date().toISOString(),
        });
      },
      
      getMetric: (key) => get().metrics[key],
    }),
    {
      name: 'substrate-public-metrics',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Ensure all DEFAULT_METRICS keys exist after schema changes
        if (version < 2 && persistedState && typeof persistedState === 'object') {
          return {
            ...persistedState,
            metrics: { ...DEFAULT_METRICS, ...(persistedState.metrics || {}) },
          };
        }
        return persistedState;
      },
      merge: (persistedState: any, currentState: any) => {
        // Deep merge metrics to prevent undefined fields from stale localStorage
        if (persistedState && typeof persistedState === 'object') {
          return {
            ...currentState,
            ...persistedState,
            metrics: { ...DEFAULT_METRICS, ...(persistedState.metrics || {}) },
          };
        }
        return currentState;
      },
    }
  )
);

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/** Get a single metric value reactively */
export function useMetric<K extends keyof PublicMetrics>(key: K): PublicMetrics[K] {
  return usePublicMetricsStore((state) => state.metrics[key]);
}

/** Get the full version string (e.g., "11.1.0 SPARTA") */
export function useVersionString(): string {
  return usePublicMetricsStore((state) => 
    `${state.metrics.version} ${state.metrics.codename}`
  );
}

/** Get total engine ecosystem count */
export function useTotalEngineCount(): number {
  return usePublicMetricsStore((state) => 
    state.metrics.enginesCount + state.metrics.metaEnginesCount
  );
}

// =============================================================================
// NON-REACTIVE GETTERS (for non-component code)
// =============================================================================

/** Get metrics synchronously (for use outside React components) */
export function getPublicMetrics(): PublicMetrics {
  return usePublicMetricsStore.getState().metrics;
}

/** Get a single metric synchronously */
export function getMetric<K extends keyof PublicMetrics>(key: K): PublicMetrics[K] {
  return usePublicMetricsStore.getState().metrics[key];
}

/** Get full version string synchronously */
export function getVersionString(): string {
  const { version, codename } = usePublicMetricsStore.getState().metrics;
  return `${version} ${codename}`;
}

export default usePublicMetricsStore;
