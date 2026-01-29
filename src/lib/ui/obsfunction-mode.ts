/**
 * OBSFUNCTION Mode — Organism Display State
 * Manages display preferences including dialect selection.
 * 
 * NOTE: This controls DISPLAY ONLY.
 * All execution remains modern JS/TS regardless of dialect.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DisplayDialect } from './display-dialect';

export interface ObsModeState {
  enabled: boolean;
  dialect: DisplayDialect;
  showDialectBadge: boolean;
}

interface ObsModeStore extends ObsModeState {
  setEnabled: (enabled: boolean) => void;
  setDialect: (dialect: DisplayDialect) => void;
  setShowDialectBadge: (show: boolean) => void;
  reset: () => void;
}

const DEFAULT_OBS_STATE: ObsModeState = {
  enabled: true, // OBSFUNCTION organism mode ON by default
  dialect: 'modern', // Default to modern display
  showDialectBadge: true,
};

export const useObsMode = create<ObsModeStore>()(
  persist(
    (set) => ({
      ...DEFAULT_OBS_STATE,
      
      setEnabled: (enabled) => set({ enabled }),
      
      setDialect: (dialect) => set({ dialect }),
      
      setShowDialectBadge: (show) => set({ showDialectBadge: show }),
      
      reset: () => set(DEFAULT_OBS_STATE),
    }),
    {
      name: 'obsfunction-mode',
      partialize: (state) => ({
        enabled: state.enabled,
        dialect: state.dialect,
        showDialectBadge: state.showDialectBadge,
      }),
    }
  )
);

// Sync to cookie for SSR compatibility (if needed)
if (typeof window !== 'undefined') {
  useObsMode.subscribe((state) => {
    document.cookie = `obs-dialect=${state.dialect};path=/;max-age=31536000`;
    document.cookie = `obs-enabled=${state.enabled};path=/;max-age=31536000`;
  });
}
