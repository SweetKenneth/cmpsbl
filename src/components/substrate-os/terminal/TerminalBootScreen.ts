/**
 * Terminal Boot Screen v2.0
 * Cinematic boot sequence matching site neon palette
 * 40-Node / 12-Sector Field-Based Topology
 */

import { getMetric } from '@/stores/publicMetricsStore';

export interface BootConfig {
  animated?: boolean;
  compact?: boolean;
}

/**
 * Compact mobile-friendly boot screen
 */
export function generateMobileBootScreen(): string[] {
  const epoch = getMetric('epoch') || 'MINDGAMES';
  return [
    '',
    '  ╔══════════════════════════════════╗',
    '  ║     C M P S B L ®  O S          ║',
    `  ║     ${epoch} Epoch`.padEnd(35) + '║',
    '  ║     Memory Stream Terminal       ║',
    '  ╚══════════════════════════════════╝',
    '',
    '  ▸ Initializing substrate...',
    '  ▸ Loading 40-node matrix...',
    '  ▸ Mapping 12-sector topology...',
    '',
    '  ┌─ NODE MATRIX ─────────────────┐',
    '  │                               │',
    '  │  ⬢ CORE    ◇ SYSTEM           │',
    '  │                               │',
    '  │  ◈ CCR — Cognitive Core       │',
    '  │    brain  memory  dream       │',
    '  │                               │',
    '  │  ◆ OCG — Compliance Grid      │',
    '  │    ripple access identity     │',
    '  │    relay  audit  nerve        │',
    '  │                               │',
    '  │  ★ EXECUTION                  │',
    '  │    decode encode vision       │',
    '  │    cortex nexus economy       │',
    '  │    sandbox inclusive medic    │',
    '  │    integration                │',
    '  │                               │',
    '  │  ◎ ESZ  sovereign oracle      │',
    '  │         conscience treaty     │',
    '  │  ◎ EPZ  compass echo reflex   │',
    '  │  ◎ EMZ  forge lingua harvest  │',
    '  │  ◎ CSZ  evolution shadow      │',
    '  │         phantom               │',
    '  │                               │',
    '  │  ≋ FLD  immunity intent       │',
    '  │  ◉ PLN  governance            │',
    '  │  ◉ SHL  defense               │',
    '  │                               │',
    '  └───────────────────────────────┘',
    '',
    '  ◉ 40 nodes · 12 sectors · 500+ cmds',
    '  ◉ 675+ capabilities · 100 engines',
    '  ◉ Health: ████████████████ 100%',
    '',
    '  ▸ Stream substrate: ONLINE',
    '  ▸ Signal pathways: READY',
    '',
    "  Type 'help' for commands",
    '',
  ];
}

/**
 * Full desktop boot screen — cinematic neon aesthetic
 */
export function generateDesktopBootScreen(): string[] {
  const epoch = getMetric('epoch') || 'MINDGAMES';
  return [
    '',
    '  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
    '  ┃                                                               ┃',
    '  ┃     ██████╗ ███╗   ███╗██████╗ ███████╗██████╗ ██╗            ┃',
    '  ┃    ██╔════╝ ████╗ ████║██╔══██╗██╔════╝██╔══██╗██║            ┃',
    '  ┃    ██║      ██╔████╔██║██████╔╝███████╗██████╔╝██║            ┃',
    '  ┃    ██║      ██║╚██╔╝██║██╔═══╝ ╚════██║██╔══██╗██║            ┃',
    '  ┃    ╚██████╗ ██║ ╚═╝ ██║██║     ███████║██████╔╝███████╗       ┃',
    '  ┃     ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚══════╝╚═════╝ ╚══════╝       ┃',
    '  ┃                                                               ┃',
    `  ┃    ${epoch} Epoch · Memory Stream Terminal`.padEnd(64) + '┃',
    '  ┃    "Signal → Silicon"                                         ┃',
    '  ┃                                                               ┃',
    '  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
    '',
    '  ▸ Booting substrate kernel...',
    '  ▸ Initializing 40-node cognitive matrix...',
    '  ▸ Mapping 12-sector topology...',
    '  ▸ Calibrating signal pathways...',
    '',
    '  ┌─ 40-NODE / 12-SECTOR TOPOLOGY ──────────────────────────────┐',
    '  │                                                              │',
    '  │  ⬢ CORE KERNEL ─────────────────────────────────────────     │',
    '  │    ◉ core (cascade authority, bootstrap)                     │',
    '  │                                                              │',
    '  │  ◇ SYSTEM LAYER ────────────────────────────────────────     │',
    '  │    ◉ system (lifecycle, diagnostics, config)                  │',
    '  │                                                              │',
    '  │  ◈ CCR — Cognitive Core Reality ────────────────────────     │',
    '  │    ◉ brain      ◉ memory       ◉ dream                       │',
    '  │                                                              │',
    '  │  ◆ OCG — Operational Compliance Grid ───────────────────     │',
    '  │    ◉ ripple     ◉ access       ◉ identity                    │',
    '  │    ◉ relay      ◉ audit        ◉ nerve                       │',
    '  │                                                              │',
    '  │  ★ EXECUTION SECTOR (10 nodes) ─────────────────────────     │',
    '  │    ◉ decode     ◉ encode       ◉ vision      ◉ cortex       │',
    '  │    ◉ nexus      ◉ economy      ◉ sandbox                     │',
    '  │    ◉ inclusive   ◉ medic        ◉ integration                 │',
    '  │                                                              │',
    '  │  ◎ ESZ — Expansion Sovereignty Zone ────────────────────     │',
    '  │    ◉ sovereign  ◉ oracle       ◉ conscience  ◉ treaty       │',
    '  │                                                              │',
    '  │  ◎ EPZ — Expansion Perception Zone ─────────────────────     │',
    '  │    ◉ compass    ◉ echo         ◉ reflex                      │',
    '  │                                                              │',
    '  │  ◎ EMZ — Expansion Manufacturing Zone ──────────────────     │',
    '  │    ◉ forge      ◉ lingua       ◉ harvest                     │',
    '  │                                                              │',
    '  │  ◎ CSZ — Covert Systems Zone ───────────────────────────     │',
    '  │    ◉ evolution  ◉ shadow       ◉ phantom                     │',
    '  │                                                              │',
    '  │  ≋ FIELDS — Transformation Fabric ──────────────────────     │',
    '  │    ◉ immunity   ◉ intent                                     │',
    '  │                                                              │',
    '  │  ◉ OVERLAY PLANE: governance                                 │',
    '  │  ◉ DEFENSE SHELL: defense                                    │',
    '  │                                                              │',
    '  └──────────────────────────────────────────────────────────────┘',
    '',
    '  ▸ Matrix integrity:  ████████████████████ 100%',
    '  ▸ Signal strength:   ████████████████████ 100%',
    '  ▸ Stream bandwidth:  ████████████████████ 100%',
    '',
    '  ╔══════════════════════════════════════════════════════════════╗',
    '  ║  40 PRIMITIVES  │  4 CATEGORIES  │  500+ CMDS  │  675+ CAPS       ║',
    '  ║  300 Synergy Pipelines  │  125 Executors  │  100 Engines    ║',
    '  ║  Memory Stream: ACTIVE  │  Quality Floor: 68+               ║',
    "  ║  Type 'help' for commands  ·  'cortex.status' for mode      ║",
    '  ╚══════════════════════════════════════════════════════════════╝',
    '',
    '  ◉ Stream substrate: ONLINE',
    '  ◉ Signal pathways: READY',
    '  ◉ Awaiting crystallization input...',
    '',
  ];
}

/**
 * Generate boot sequence
 */
export function generateBootSequence(isMobile: boolean = false): string[] {
  if (isMobile) {
    return generateMobileBootScreen();
  }
  return generateDesktopBootScreen();
}

/**
 * Get boot messages for terminal initialization
 */
export function getBootMessages(viewportWidth?: number): string[] {
  const isMobile = !viewportWidth || viewportWidth < 768;
  return generateBootSequence(isMobile);
}
