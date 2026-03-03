/**
 * Terminal Boot Screen
 * 37-Node / 11-Sector Field-Based Topology
 * Mobile-friendly with no mid-word line breaks
 * 
 * Architecture:
 * - 37 active nodes across 11 sectors (CORE, SYSTEM, CCR, OCG, Execution, ESZ, EPZ, EMZ, Fields, Plane, Shell)
 * - 300 synergy pipelines, 125 executors, 142 S-tier discoveries
 * - 675+ capabilities, 100 engines (76 base + 24 meta)
 * - 7 infrastructure systems: cron, rate-limit, snapshots, analytics, streaming, files, NL
 * - 500+ commands across all 37 nodes + infrastructure
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
  ║                CMPSBL® OS Substrate                    ║
  ║               Cognitive OS                                  ║
  ╠═══════════════════════════════════════════════════════════╣
  ║                                                           ║
  ║    ┏━━━━━━━━━━ KERNEL LAYER ━━━━━━━━━━┓                   ║
  ║    ┃  ⬢ CORE      ⬢ RIPPLE    ⬢ ACCESS ┃                   ║
  ║    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                   ║
  ║          ╲                         ╱                       ║
  ║    ┏━━━━━━━━━ COGNITIVE LAYER ━━━━━━━━━┓                   ║
  ║    ┃  ◈ BRAIN     ◈ DECODE    ◈ DREAM  ┃                   ║
  ║    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                   ║
  ║          ╲                         ╱                       ║
  ║    ┏━━━━━━━━ OPERATIONS LAYER ━━━━━━━━━┓                   ║
  ║    ┃ ◆ DEFENSE  ◆ NEXUS  ◆ VISION      ┃                   ║
  ║    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                   ║
  ║          ╲                         ╱                       ║
  ║    ┏━━━━━━━━━━ ADMIN LAYER ━━━━━━━━━━━━┓                   ║
  ║    ┃ ◇ SYSTEM  ◇ EVOLUTION  ◇ INCLUSIVE┃                   ║
  ║    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                   ║
  ║                    ╲   ╱                                   ║
  ║    ┏━━━━━━━━━ ORCHESTRATOR LAYER ━━━━━━━┓                  ║
  ║    ┃  ★ CORTEX      ★ INTEGRATION       ┃                  ║
  ║    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                  ║
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
    '  ▓     CMPSBL® OS                  ▓',
    `  ▓     ${getMetric('epoch')} Epoch`.padEnd(35) + '▓',
    '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    '',
    '  ┌─ 37-NODE MATRIX ───────────────┐',
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
    '  │    relay  audit                │',
    '  │                                │',
    '  │  ★ Execution (11 nodes)        │',
    '  │    decode encode vision cortex │',
    '  │    nexus economy sandbox       │',
    '  │    inclusive medic nerve       │',
    '  │    integration                 │',
    '  │                                │',
    '  │  ◎ ESZ (Sovereignty)           │',
    '  │    sovereign oracle            │',
    '  │    conscience treaty           │',
    '  │  ◎ EPZ (Perception)            │',
    '  │    compass echo reflex         │',
    '  │  ◎ EMZ (Manufacturing)         │',
    '  │    forge lingua phantom        │',
    '  │    harvest                     │',
    '  │                                │',
    '  │  ≋ Fields                      │',
    '  │    evolution immunity intent   │',
    '  │  ◉ Plane: governance           │',
    '  │  ◉ Shell: defense              │',
    '  │                                │',
    '  └────────────────────────────────┘',
    '',
    '  ◉ 37 nodes | 11 sectors',
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
  '  ░   Cognitive Operating System                          ░',
    '  ░   "Where Dreams Come To Adapt"                        ░',
    '  ░                                                       ░',
    '  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
    '',
    '  ┌─ NEURAL ARCHITECTURE ─────────────────────────────────┐',
    '  │                                                       │',
    '  │      ⬢ ═══════════════════════════════════════ ⬢      │',
    '  │     ╱ ╲           KERNEL LAYER              ╱ ╲     │',
    '  │   CORE            RIPPLE              ACCESS         │',
    '  │     ╲ ╱                                     ╲ ╱     │',
    '  │      ║                                       ║       │',
    '  │      ◈ ═══════════════════════════════════════ ◈      │',
    '  │     ╱ ╲         COGNITIVE LAYER             ╱ ╲     │',
    '  │   BRAIN           DECODE               DREAM         │',
    '  │     ╲ ╱                                     ╲ ╱     │',
    '  │      ║                                       ║       │',
    '  │      ◆ ═══════════════════════════════════════ ◆      │',
    '  │     ╱ ╲        OPERATIONS LAYER             ╱ ╲     │',
    '  │  DEFENSE          NEXUS               VISION         │',
    '  │     ╲ ╱                                     ╲ ╱     │',
    '  │      ║                                       ║       │',
    '  │      ◇ ═══════════════════════════════════════ ◇      │',
    '  │     ╱ ╲           ADMIN LAYER               ╱ ╲     │',
    '  │  SYSTEM        EVOLUTION             INCLUSIVE       │',
    '  │     ╲ ╱                                     ╲ ╱     │',
    '  │      ║                                       ║       │',
  '  │      ★ ═══════════════════════════════════════ ★      │',
    '  │     ╱ ╲       ORCHESTRATOR LAYER            ╱ ╲     │',
    '  │  CORTEX          INTEGRATION           ENCODE         │',
    '  │     ╲ ╱                                     ╲ ╱     │',
    '  │      ║                                       ║       │',
    '  │      ⬡ ═══════════════════════════════════════ ⬡      │',
    '  │     ╱ ╲      INFRASTRUCTURE LAYER           ╱ ╲     │',
    '  │  MEMORY  RELAY  AUDIT  IDENTITY  ECONOMY  SANDBOX     │',
    '  │     ╲ ╱                                     ╲ ╱     │',
    '  │      ⬡                                       ⬡       │',
    '  │                                                       │',
    '  └───────────────────────────────────────────────────────┘',
    '',
    '  ┌─ BOOTSTRAP ───────────────────────────────────────────┐',
    '  │                                                       │',
    '  │  ◉ core ─────────── scheduler, lifecycle        [OK]  │',
    '  │  ◉ ripple ────────── message bus, pub/sub       [OK]  │',
    '  │  ◉ access ────────── API keys, metering         [OK]  │',
    '  │  ◉ brain ─────────── memory, learning           [OK]  │',
    '  │  ◉ decode ────────── intent parsing             [OK]  │',
    '  │  ◉ dream ─────────── dream-eater cycles         [OK]  │',
    '  │  ◉ defense ───────── security, anomalies        [OK]  │',
    '  │  ◉ nexus ─────────── AI routing                 [OK]  │',
    '  │  ◉ vision ────────── observability              [OK]  │',
    '  │  ◉ system ────────── orchestration              [OK]  │',
    '  │  ◉ evolution ─────── evolution engine            [OK]  │',
    '  │  ◉ inclusive ─────── accessibility              [OK]  │',
    '  │  ◉ integration ───── enterprise adapters        [OK]  │',
  '  │  ◉ cortex ────────── policy intent (manual)     [OK]  │',
    '  │  ◉ encode ────────── code execution engine       [OK]  │',
    '  │  ◉ memory ────────── vector/RAG orchestration    [OK]  │',
    '  │  ◉ relay ─────────── webhook delivery            [OK]  │',
    '  │  ◉ audit ─────────── compliance logging          [OK]  │',
    '  │  ◉ identity ──────── actor attribution           [OK]  │',
    '  │  ◉ economy ────────── cost tracking              [OK]  │',
    '  │  ◉ sandbox ────────── isolated execution         [OK]  │',
    '  │                                                       │',
    '  └───────────────────────────────────────────────────────┘',
    '',
  '  ╔═══════════════════════════════════════════════════════╗',
  '  ║  10 ENTITIES │ 5 MESHES │ 9 ZONES │ 360+ CMDS │ 400+ CAPS ║',
  '  ║  CLM: all modules reporting to DECODE                       ║',
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
