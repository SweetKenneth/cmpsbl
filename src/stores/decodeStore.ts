/**
 * DECODE Mode Store — Unified state for the single conversational interface
 * Modes: assistant | support | builder | governor
 */

import { create } from 'zustand';

export type DecodeMode = 'assistant' | 'support' | 'builder' | 'governor';

export type IdentityRole = 'anonymous' | 'user' | 'creator' | 'architect' | 'governor';

export interface DecodeCapability {
  id: string;
  label: string;
  governorOnly?: boolean;
}

const BASE_CAPABILITIES: DecodeCapability[] = [
  { id: 'assist', label: 'assist' },
  { id: 'support', label: 'support' },
  { id: 'learn', label: 'learn' },
];

const GOVERNOR_CAPABILITIES: DecodeCapability[] = [
  { id: 'inspect_primitives', label: 'inspect_primitives', governorOnly: true },
  { id: 'topology_view', label: 'topology_view', governorOnly: true },
  { id: 'discovery_metrics', label: 'discovery_metrics', governorOnly: true },
  { id: 'cjpi_scoring', label: 'cjpi_scoring', governorOnly: true },
  { id: 'system_heal', label: 'system_heal', governorOnly: true },
  { id: 'governance_override', label: 'governance_override', governorOnly: true },
  { id: 'memory_stream', label: 'memory_stream', governorOnly: true },
];

interface DecodeState {
  mode: DecodeMode;
  isOpen: boolean;
  identityRole: IdentityRole;
  capabilities: DecodeCapability[];
  pendingModeOnOpen: DecodeMode | null;

  // Actions
  setMode: (mode: DecodeMode) => void;
  open: (mode?: DecodeMode) => void;
  close: () => void;
  toggle: () => void;
  setIdentityRole: (role: IdentityRole) => void;
  requestGovernorMode: () => boolean;
}

export const useDecodeStore = create<DecodeState>((set, get) => ({
  mode: 'assistant',
  isOpen: false,
  identityRole: 'anonymous',
  capabilities: [...BASE_CAPABILITIES],
  pendingModeOnOpen: null,

  setMode: (mode) => {
    const { identityRole } = get();
    // Governor mode requires governor identity
    if (mode === 'governor' && identityRole !== 'governor') return;

    const caps = mode === 'governor'
      ? [...BASE_CAPABILITIES, ...GOVERNOR_CAPABILITIES]
      : [...BASE_CAPABILITIES];

    set({ mode, capabilities: caps });
  },

  open: (mode) => {
    const { identityRole } = get();
    if (mode && mode !== 'governor') {
      const caps = [...BASE_CAPABILITIES];
      set({ isOpen: true, mode, capabilities: caps, pendingModeOnOpen: mode });
    } else if (mode === 'governor' && identityRole === 'governor') {
      set({ isOpen: true, mode: 'governor', capabilities: [...BASE_CAPABILITIES, ...GOVERNOR_CAPABILITIES], pendingModeOnOpen: 'governor' });
    } else {
      set({ isOpen: true, pendingModeOnOpen: null });
    }
  },

  close: () => set({ isOpen: false }),

  toggle: () => {
    const { isOpen } = get();
    set({ isOpen: !isOpen });
  },

  setIdentityRole: (role) => {
    const caps = role === 'governor'
      ? [...BASE_CAPABILITIES, ...GOVERNOR_CAPABILITIES]
      : [...BASE_CAPABILITIES];

    // If current mode is governor but role changed away, reset
    const { mode } = get();
    const newMode = mode === 'governor' && role !== 'governor' ? 'assistant' : mode;

    set({ identityRole: role, capabilities: caps, mode: newMode });
  },

  requestGovernorMode: () => {
    const { identityRole } = get();
    if (identityRole !== 'governor') return false;
    set({
      mode: 'governor',
      capabilities: [...BASE_CAPABILITIES, ...GOVERNOR_CAPABILITIES],
    });
    return true;
  },
}));
