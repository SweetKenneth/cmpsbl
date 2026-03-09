/**
 * Terminal Boot Screen
 * 40-Node / 12-Sector Field-Based Topology
 * Mobile-friendly with no mid-word line breaks
 * 
 * Architecture:
 * - 40 active nodes across 12 sectors (CORE, SYSTEM, CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Shell)
 * - 300 synergy pipelines, 125 executors, 142 S-tier discoveries
 * - 675+ capabilities, 100 engines (76 base + 24 meta)
 * - 7 infrastructure systems: cron, rate-limit, snapshots, analytics, streaming, files, NL
 * - 500+ commands across all 38 nodes + infrastructure
 * - CLM across all modules
 * - Enhanced mobile boot sequence
 * - Improved visual hierarchy
 */

import { getMetric } from '@/stores/publicMetricsStore';

export interface BootConfig {
  animated?: boolean;
  compact?: boolean;
}

/**
 * DNA Helix-style module visualization
 */
const DNA_HELIX = `
    ╭─────╮                              ╭─────╮
   ╱ CORE  ╲════════════════════════════╱CORTEX╲
  ╱─────────╲                          ╱─────────╲
  ╲ ▓░▓░▓░▓ ╱═══╗                ╔═══╱ ▓░▓░▓░▓ ╱
   ╲───────╱    ║                ║    ╲───────╱
      ║        ╭─────╮      ╭─────╮        ║
      ╠════════│BRAIN│══════│DREAM│════════╣
      ║        ╰─────╯      ╰─────╯        ║
   ╭───────╮    ║                ║    ╭───────╮
  ╱ ░▓░▓░▓░ ╲═══╝                ╚═══╱ ░▓░▓░▓░ ╲
  ╲─────────╱                          ╲─────────╱
   ╲RIPPLE ╱════════════════════════════╲VISION ╱
    ╰─────╯                              ╰─────╯
`;

/**
 * Module status indicators (compact for mobile)
 */
const MODULE_STATUS = [
  '  ├─ CORE Kernel ────────────────────────',
  '  │  ◉ core                               ',
  '  ├─ SYSTEM Layer ───────────────────────',
  '  │  ◉ system                             ',
  '  ├─ CCR (Cognitive Core Reality) ────────',
  '  │  ◉ brain     ◉ memory     ◉ dream    ',
  '  ├─ OCG (Operational Compliance Grid) ──',
  '  │  ◉ ripple    ◉ access     ◉ identity ',
  '  │  ◉ relay     ◉ audit                  ',
  '  ├─ Execution Sector ───────────────────',
  '  │  ◉ decode    ◉ encode     ◉ vision   ',
  '  │  ◉ cortex    ◉ nexus      ◉ economy  ',
  '  │  ◉ sandbox   ◉ inclusive  ◉ medic    ',
  '  │  ◉ nerve     ◉ integration            ',
  '  ├─ ESZ (Sovereignty Zone) ─────────────',
  '  │  ◉ sovereign ◉ oracle     ◉ conscience',
  '  │  ◉ treaty                              ',
  '  ├─ EPZ (Perception Zone) ──────────────',
  '  │  ◉ compass   ◉ echo       ◉ reflex   ',
  '  ├─ EMZ (Manufacturing Zone) ───────────',
  '  │  ◉ forge     ◉ lingua     ◉ phantom  ',
  '  │  ◉ harvest                             ',
  '  ├─ Fields (Transformation Fabric) ─────',
  '  │  ◉ evolution ◉ immunity   ◉ intent   ',
  '  ├─ Overlay Plane ──────────────────────',
  '  │  ◉ governance                          ',
  '  ├─ DEFENSE Shell ──────────────────────',
  '  │  ◉ defense                             ',
  '  └─────────────────────────────────────',
];

/**
 * Full-width module grid (desktop)
 */
const MODULE_GRID_DESKTOP = `
  ╔═══════════════════════════════════════════════════════════╗
   ║              CMPSBL® OS — 38-Node Matrix                ║
   ║             12-Sector Cognitive Topology                  ║
   ╠═══════════════════════════════════════════════════════════╣
   ║                                                           ║
   ║  ┏━━━━━━━━━━━━ CORE + SYSTEM ━━━━━━━━━━━━┓               ║
   ║  ┃  ⬢ CORE (kernel)    ◇ SYSTEM (lifecycle) ┃             ║
   ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛             ║
   ║        ╲                           ╱                       ║
   ║  ┏━━━━━━━ CCR (Cognitive Core) ━━━━━━━━━━┓               ║
   ║  ┃  ◈ BRAIN     ◈ MEMORY     ◈ DREAM     ┃               ║
   ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛               ║
   ║  ┏━━━━ OCG (Operational Compliance) ━━━━━┓               ║
   ║  ┃  ◆ RIPPLE  ◆ ACCESS  ◆ IDENTITY       ┃               ║
   ║  ┃  ◆ RELAY   ◆ AUDIT   ◆ NERVE          ┃               ║
   ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛               ║
  ║        ╲                           ╱                       ║
  ║  ┏━━━━━━━ EXECUTION (10 nodes) ━━━━━━━━━━┓               ║
  ║  ┃  ★ DECODE  ★ ENCODE  ★ VISION  ★ CORTEX┃              ║
  ║  ┃  ★ NEXUS   ★ ECONOMY ★ SANDBOX         ┃              ║
  ║  ┃  ★ INCLUSIVE ★ MEDIC  ★ NERVE           ┃              ║
  ║  ┃  ★ INTEGRATION                          ┃              ║
  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛              ║
  ║        ╲                           ╱                       ║
  ║  ┏━ ESZ (Sovereignty) ━┓ ┏━ EPZ (Perception) ━┓          ║
  ║  ┃ ◎ SOVEREIGN ◎ ORACLE┃ ┃ ◎ COMPASS ◎ ECHO   ┃          ║
  ║  ┃ ◎ CONSCIENCE◎TREATY ┃ ┃ ◎ REFLEX            ┃          ║
  ║  ┗━━━━━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━━━━━━┛          ║
  ║  ┏━ EMZ (Manufacturing) ━━━━━━━━━━━━━━━━━━━━━┓           ║
  ║  ┃ ◎ FORGE  ◎ LINGUA  ◎ PHANTOM  ◎ HARVEST   ┃           ║
  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛           ║
  ║        ╲                           ╱                       ║
  ║  ┏━━━━━━ FIELDS + PLANE + SHELL ━━━━━━━━━┓               ║
  ║  ┃  ≋ EVOLUTION  ≋ IMMUNITY  ≋ INTENT     ┃               ║
  ║  ┃  ◉ GOVERNANCE (Plane)                   ┃               ║
  ║  ┃  ◉ DEFENSE (Shell)                      ┃               ║
  ║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛               ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
`;

/**
 * Compact mobile-friendly boot screen
 */
export function generateMobileBootScreen(): string[] {
  return [
    '',
    '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    '  ▓     CMPSBL® Memory Stream       ▓',
    `  ▓     ${getMetric('epoch')} Epoch`.padEnd(35) + '▓',
    '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    '',
    '  ┌─ 38-NODE MATRIX ───────────────┐',
    '  │                                │',
    '  │  ⬢ CORE Kernel                 │',
    '  │    core                         │',
    '  │  ◇ SYSTEM Layer                │',
    '  │    system                       │',
    '  │                                │',
    '  │  ◈ CCR (Cognitive Core)        │',
    '  │    brain  memory  dream        │',
    '  │  ◆ OCG (Compliance Grid)       │',
    '  │    ripple access identity      │',
    '  │    relay  audit  nerve         │',
    '  │                                │',
    '  │  ★ Execution (10 nodes)        │',
    '  │    decode encode vision cortex │',
    '  │    nexus economy sandbox       │',
    '  │    inclusive medic             │',
    '  │    integration                 │',
    '  │                                │',
    '  │  ◎ ESZ (Sovereignty)           │',
    '  │    sovereign oracle            │',
    '  │    conscience treaty           │',
    '  │  ◎ EPZ (Perception)            │',
    '  │    compass echo reflex         │',
    '  │  ◎ EMZ (Manufacturing)         │',
    '  │    forge lingua harvest        │',
    '  │  ◎ CSZ (Covert Systems)        │',
    '  │    evolution shadow phantom    │',
    '  │                                │',
    '  │  ≋ Fields                      │',
    '  │    immunity intent             │',
    '  │  ◉ Plane: governance           │',
    '  │  ◉ Shell: defense              │',
    '  │                                │',
    '  └────────────────────────────────┘',
    '',
    '  ◉ 38 nodes | 12 sectors',
    '  ◉ 500+ commands available',
    '  ◉ 300 synergies | 125 executors',
    '  ◉ 675+ capabilities | 100 engines',
    '  ◉ 7 infrastructure systems',
    '  ◉ CLM: all modules reporting',
    '  ◉ Health: 100%',
    '',
    '  Type \'help\' for commands',
    '',
  ];
}

/**
 * Full desktop boot screen with DNA helix aesthetic
 */
export function generateDesktopBootScreen(): string[] {
  return [
    '',
    '  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
    '  ░                                                       ░',
    '  ░    ██████╗ ███╗   ███╗██████╗ ███████╗██████╗ ██╗      ░',
    '  ░   ██╔════╝ ████╗ ████║██╔══██╗██╔════╝██╔══██╗██║      ░',
    '  ░   ██║      ██╔████╔██║██████╔╝███████╗██████╔╝██║      ░',
    '  ░   ██║      ██║╚██╔╝██║██╔═══╝ ╚════██║██╔══██╗██║      ░',
    '  ░   ╚██████╗ ██║ ╚═╝ ██║██║     ███████║██████╔╝███████╗ ░',
    '  ░    ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚══════╝╚═════╝ ╚══════╝ ░',
    '  ░                                                       ░',
    '  ░   ███████╗██╗   ██╗██████╗ ███████╗████████╗██████╗   ░',
    '  ░   ██╔════╝██║   ██║██╔══██╗██╔════╝╚══██╔══╝██╔══██╗  ░',
    '  ░   ███████╗██║   ██║██████╔╝███████╗   ██║   ██████╔╝  ░',
    '  ░   ╚════██║██║   ██║██╔══██╗╚════██║   ██║   ██╔══██╗  ░',
    '  ░   ███████║╚██████╔╝██████╔╝███████║   ██║   ██║  ██║  ░',
    '  ░   ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝  ░',
    '  ░                                                       ░',
  `  ░   CMPSBL® OS — ${getMetric('epoch')} Epoch`.padEnd(58) + '░',
    '  ░   Memory Stream Terminal                              ░',
    '  ░   "Signal → Silicon"                                  ░',
    '  ░                                                       ░',
    '  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
    '',
    '  ┌─ 38-NODE / 12-SECTOR TOPOLOGY ────────────────────────┐',
    '  │                                                       │',
    '  │  ⬢ CORE KERNEL ───────────────────────────────────    │',
    '  │    ◉ core (boots first, cascade authority)             │',
    '  │                                                       │',
    '  │  ◇ SYSTEM LAYER ──────────────────────────────────    │',
    '  │    ◉ system (lifecycle, diagnostics, config)           │',
    '  │                                                       │',
    '  │  ◈ CCR — Cognitive Core Reality ──────────────────    │',
    '  │    ◉ brain      ◉ memory       ◉ dream                │',
    '  │                                                       │',
    '  │  ◆ OCG — Operational Compliance Grid ─────────────    │',
    '  │    ◉ ripple     ◉ access       ◉ identity             │',
    '  │    ◉ relay      ◉ audit        ◉ nerve                │',
    '  │                                                       │',
    '  │  ★ EXECUTION SECTOR (10 nodes) ───────────────────    │',
    '  │    ◉ decode     ◉ encode       ◉ vision               │',
    '  │    ◉ cortex     ◉ nexus        ◉ economy              │',
    '  │    ◉ sandbox    ◉ inclusive     ◉ medic                │',
    '  │    ◉ integration                                       │',
    '  │                                                       │',
    '  │  ◎ ESZ — Expansion Sovereignty Zone ──────────────    │',
    '  │    ◉ sovereign  ◉ oracle       ◉ conscience           │',
    '  │    ◉ treaty                                            │',
    '  │                                                       │',
    '  │  ◎ EPZ — Expansion Perception Zone ───────────────    │',
    '  │    ◉ compass    ◉ echo         ◉ reflex               │',
    '  │                                                       │',
    '  │  ◎ EMZ — Expansion Manufacturing Zone ────────────    │',
    '  │    ◉ forge      ◉ lingua       ◉ harvest              │',
    '  │                                                       │',
    '  │  ◎ CSZ — Covert Systems Zone ─────────────────────    │',
    '  │    ◉ evolution  ◉ shadow       ◉ phantom              │',
    '  │                                                       │',
    '  │  ≋ FIELDS — Transformation Fabric ────────────────    │',
    '  │    ◉ immunity   ◉ intent                              │',
    '  │                                                       │',
    '  │  ◉ OVERLAY PLANE: governance                          │',
    '  │  ◉ DEFENSE SHELL: defense                             │',
    '  │                                                       │',
    '  └───────────────────────────────────────────────────────┘',
    '',
    '  ╔═══════════════════════════════════════════════════════╗',
    '  ║  38 NODES │ 12 SECTORS │ 500+ CMDS │ 675+ CAPS       ║',
    '  ║  Memory Stream Active │ Quality Floor: 68+            ║',
    '  ║  Type \'help\' for commands • \'cortex.status\' for mode  ║',
    '  ╚═══════════════════════════════════════════════════════╝',
    '',
  ];
}

/**
 * Generate animated boot sequence (returns lines one at a time)
 */
export function generateBootSequence(isMobile: boolean = false): string[] {
  if (isMobile) {
    return generateMobileBootScreen();
  }
  return generateDesktopBootScreen();
}

/**
 * Get boot messages for terminal initialization
 * Detects viewport size and returns appropriate boot screen
 */
export function getBootMessages(viewportWidth?: number): string[] {
  // Default to mobile-first if no width provided
  const isMobile = !viewportWidth || viewportWidth < 768;
  return generateBootSequence(isMobile);
}

// Export the DNA helix for special effects
export { DNA_HELIX, MODULE_STATUS, MODULE_GRID_DESKTOP };
