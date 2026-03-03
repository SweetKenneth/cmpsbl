/**
 * Terminal Type Definitions
 * Terminal Configuration — 38-Node / 12-Sector Topology (500+ commands)
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
  '  ▓  CMPSBL® SUBSTRATE — 38-NODE MATRIX ▓',
  '  ▓                                     ▓',
  '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
  '',
  '  ┌─ 12-SECTOR TOPOLOGY ──────────────────┐',
  '  │                                       │',
  '  │  ⬢ CORE        ◇ SYSTEM              │',
  '  │  ◈ CCR:  brain memory dream           │',
  '  │  ◆ OCG:  ripple access identity       │',
  '  │          relay audit nerve            │',
  '  │  ★ EXEC: decode encode vision cortex │',
  '  │          nexus economy sandbox        │',
  '  │          inclusive medic              │',
  '  │          integration                  │',
  '  │  ◎ ESZ:  sovereign oracle             │',
  '  │          conscience treaty            │',
  '  │  ◎ EPZ:  compass echo reflex          │',
  '  │  ◎ EMZ:  forge lingua harvest         │',
  '  │  ◎ CSZ:  evolution shadow phantom     │',
  '  │  ≋ FLD:  immunity intent              │',
  '  │  ◉ PLN:  governance                   │',
  '  │  ◉ SHL:  defense                      │',
  '  │                                       │',
  '  └───────────────────────────────────────┘',
  '',
  '  ◉ 38 nodes operational | 12 sectors',
  '  ◉ 500+ commands available',
  '  ◉ 675+ capabilities | Σw = 1.000',
  '  ◉ Health: 100%',
  '',
  '  Type \'help\' for commands',
  '',
];

export const PERSONALITY_RESPONSES = {
  greeting: [
    'standing by for orders...',
    'neural pathways ready.',
    'cognitive substrate: online.',
    'awaiting input...',
    'ready to process.',
  ],
  success: [
    'operation complete.',
    'task executed successfully.',
    'neural pathways confirmed.',
    'cognitive loop closed.',
    'execution verified.',
  ],
  error: [
    'anomaly detected.',
    'pathway failed.',
    'cognitive disruption.',
    'attempting recovery...',
    'error in processing.',
  ],
  thinking: [
    'processing neural patterns...',
    'traversing knowledge graph...',
    'synthesizing insights...',
    'cognitive cycle in progress...',
    'analyzing substrate data...',
  ],
};

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
