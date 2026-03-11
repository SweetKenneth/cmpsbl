/**
 * Intent Mesh — Kill Switch / Toggle
 * Auto-starts scheduler when mesh is enabled
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
      enabled: true, // ON by default — full matrix mesh active
      setEnabled: (enabled) => {
        set({ enabled });
        // Auto-start/stop scheduler when mesh toggles
        syncScheduler(enabled);
      },
      toggle: () => set((s) => {
        const next = !s.enabled;
        syncScheduler(next);
        return { enabled: next };
      }),
    }),
    { name: 'mesh-toggle-v10' }
  )
);

/** Lazy-load scheduler to avoid circular imports */
function syncScheduler(enabled: boolean) {
  import('./auto-scheduler').then(({ meshScheduler }) => {
    if (enabled && !meshScheduler.getState().isRunning) {
      meshScheduler.start();
      console.log('[Mesh] Auto-started scheduler with mesh toggle');
    } else if (!enabled && meshScheduler.getState().isRunning) {
      meshScheduler.stop();
      console.log('[Mesh] Auto-stopped scheduler with mesh toggle');
    }
  }).catch(() => {});
}

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
