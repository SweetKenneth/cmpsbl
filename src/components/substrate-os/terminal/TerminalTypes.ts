/**
 * Terminal Type Definitions
 * Terminal Configuration — 40-Node / 12-Sector Topology (500+ commands)
 */

export interface CommandResult {
  id: string;
  command: string;
  status: 'pending' | 'success' | 'error';
  output?: string;
  timestamp: Date;
  duration?: number;
}

export interface TerminalSession {
  id: string;
  startedAt: Date;
  commandCount: number;
  successCount: number;
  errorCount: number;
}

export type TerminalTheme = 'dark' | 'light' | 'matrix' | 'biohack';

export interface TerminalConfig {
  theme: TerminalTheme;
  showTimestamps: boolean;
  maxHistoryLength: number;
  autoscroll: boolean;
  showLineNumbers: boolean;
}

export const DEFAULT_CONFIG: TerminalConfig = {
  theme: 'dark',
  showTimestamps: true,
  maxHistoryLength: 100,
  autoscroll: true,
  showLineNumbers: false,
};

// Terminal personality messages
// Uses dynamic boot screen from TerminalBootScreen.ts
// This is the fallback for legacy compatibility
export const BOOT_MESSAGES = [
  '',
  '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
  '  ▓  CMPSBL® SUBSTRATE — 40-PRIMITIVE MATRIX ▓',
  '  ▓                                     ▓',
  '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
  '',
  '  ┌─ 4-CATEGORY TAXONOMY ────────────────────┐',
  '  │                                       │',
  '  │  ⬡ ORGANS (12):                      │',
  '  │    core system nerve ripple           │',
  '  │    relay identity access nexus        │',
  '  │    audit integration brain memory     │',
  '  │                                       │',
  '  │  ◇ LAYERS (8):                       │',
  '  │    defense immunity governance        │',
  '  │    intent evolution inclusive          │',
  '  │    conscience treaty                  │',
  '  │                                       │',
  '  │  ◈ ENGINES (10):                     │',
  '  │    dream cortex oracle forge          │',
  '  │    compass atlas economy sandbox      │',
  '  │    medic reflex                       │',
  '  │                                       │',
  '  │  ★ AGENTS (10):                      │',
  '  │    encode decode vision phantom       │',
  '  │    lingua echo harvest sovereign      │',
  '  │    engineer observer                  │',
  '  │                                       │',
  '  └───────────────────────────────────────┘',
  '',
  '  ◉ 40 primitives operational | 4 categories',
  '  ◉ 500+ commands available',
  '  ◉ 675+ capabilities | Σw = 1.000',
  '  ◉ Health: 100%',
  '',
  '  Type \'help\' for commands',
  '',
];

export const PERSONALITY_RESPONSES = {
  greeting: [
    'memory stream standing by...',
    'signal pathways ready.',
    'stream substrate: online.',
    'awaiting crystallization input...',
    'ready to process stream.',
  ],
  success: [
    'crystallization complete.',
    'stream operation executed.',
    'signal pathways confirmed.',
    'stream loop closed.',
    'pipeline verified.',
  ],
  error: [
    'stream anomaly detected.',
    'signal pathway failed.',
    'crystallization disruption.',
    'attempting stream recovery...',
    'error in stream processing.',
  ],
  thinking: [
    'sampling memory stream...',
    'traversing signal graph...',
    'crystallizing insights...',
    'stream cycle in progress...',
    'analyzing stream topology...',
  ],
};

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
