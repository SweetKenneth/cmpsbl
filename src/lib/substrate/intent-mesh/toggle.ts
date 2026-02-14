/**
 * Intent Mesh — Kill Switch / Toggle
 * v10.0.0 — Granular control over mesh behavior
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MeshToggleState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
}

export const useMeshToggle = create<MeshToggleState>()(
  persist(
    (set) => ({
      enabled: false, // OFF by default — opt-in safety
      setEnabled: (enabled) => set({ enabled }),
      toggle: () => set((s) => ({ enabled: !s.enabled })),
    }),
    { name: 'mesh-toggle-v10' }
  )
);

/** Check if mesh is enabled (non-hook version for library code) */
export function isMeshEnabled(): boolean {
  return useMeshToggle.getState().enabled;
}

/** Enable the mesh */
export function enableMesh(): void {
  useMeshToggle.getState().setEnabled(true);
}

/** Disable the mesh (kill switch) */
export function disableMesh(): void {
  useMeshToggle.getState().setEnabled(false);
}
