/**
 * Terminal Boot Screen v9.0.0
 * Unique neural-organic visualization of the 20-module architecture
 * Mobile-friendly with no mid-word line breaks
 * 
 * v9.0.0 ARCHITECT Epoch Changes:
 * - 200 synergy pipelines, 125 executors, 32 S-tier discoveries
 * - Updated version branding to v9.1.0 ARCHITECT
 * - 400+ capabilities, 100 engines, 25 meta-engines
 * - 7 infrastructure systems: cron, rate-limit, snapshots, analytics, streaming, files, NL
 * - 340+ commands across 20 modules + infrastructure
 * - Enhanced mobile boot sequence
 * - Improved visual hierarchy
 */

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
  '  ├─ KERNEL ───────────────────────────',
  '  │  ◉ core      ◉ ripple     ◉ access',
  '  ├─ COGNITIVE ─────────────────────────',
  '  │  ◉ brain     ◉ decode     ◉ dream',
  '  ├─ OPERATIONS ────────────────────────',
  '  │  ◉ defense   ◉ nexus      ◉ vision',
  '  ├─ ADMIN ─────────────────────────────',
  '  │  ◉ system    ◉ modernizer ◉ inclusive',
  '  ├─ ORCHESTRATOR ──────────────────────',
  '  │  ◉ cortex    ◉ integration',
  '  └─────────────────────────────────────',
];

/**
 * Full-width module grid (desktop)
 */
const MODULE_GRID_DESKTOP = `
  ╔═══════════════════════════════════════════════════════════╗
  ║              PROMPTFLUID® SUBSTRATE OS v8.5.0             ║
  ║               SYNERGY+ Epoch Cognitive OS                  ║
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
  ║    ┃ ◇ SYSTEM  ◇ MODERNIZER ◇ INCLUSIVE┃                   ║
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
  '  ▓  PROMPTFLUID® SUBSTRATE OS     ▓',
  '  ▓  Version 9.1.0 — ARCHITECT     ▓',
    '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    '',
    '  ┌─ BOOTSTRAP ────────────────────┐',
    '  │                                │',
    '  │  ⬢ KERNEL                      │',
    '  │    core  ripple  access        │',
    '  │                                │',
    '  │  ◈ COGNITIVE                   │',
    '  │    brain  decode  dream        │',
    '  │                                │',
    '  │  ◆ OPERATIONS                  │',
    '  │    defense  nexus  vision      │',
    '  │                                │',
    '  │  ◇ ADMIN                       │',
    '  │    system  modernizer          │',
    '  │    inclusive                   │',
    '  │                                │',
    '  │  ★ ORCHESTRATOR                │',
    '  │    cortex  integration  encode │',
    '  │                                │',
    '  │  ⬡ INFRASTRUCTURE             │',
    '  │    memory  relay  audit        │',
    '  │    identity  economy  sandbox  │',
    '  │                                │',
    '  └────────────────────────────────┘',
    '',
  '  ◉ 21 modules operational',
  '  ◉ 360+ commands available',
  '  ◉ 200+ synergies | 125 executors',
  '  ◉ 400+ capabilities | 100+ engines',
  '  ◉ 7 infrastructure systems',
  '  ◉ CLM: ENCODE + Infra Six reporting',
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
    '  ░   ██████╗  ██████╗  ██████╗ ███╗   ███╗██████╗ ████████╗  ░',
    '  ░   ██╔══██╗██╔═══██╗██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝  ░',
    '  ░   ██████╔╝██║   ██║██║   ██║██╔████╔██║██████╔╝   ██║     ░',
    '  ░   ██╔═══╝ ██║   ██║██║   ██║██║╚██╔╝██║██╔═══╝    ██║     ░',
    '  ░   ██║     ╚██████╔╝╚██████╔╝██║ ╚═╝ ██║██║        ██║     ░',
    '  ░   ╚═╝      ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝        ╚═╝     ░',
    '  ░                                                       ░',
    '  ░   ███████╗██╗     ██╗   ██╗██╗██████╗  ®              ░',
    '  ░   ██╔════╝██║     ██║   ██║██║██╔══██╗                ░',
    '  ░   █████╗  ██║     ██║   ██║██║██║  ██║                ░',
    '  ░   ██╔══╝  ██║     ██║   ██║██║██║  ██║                ░',
    '  ░   ██║     ███████╗╚██████╔╝██║██████╔╝                ░',
    '  ░   ╚═╝     ╚══════╝ ╚═════╝ ╚═╝╚═════╝                 ░',
    '  ░                                                       ░',
    '  ░   SUBSTRATE OS v9.1.0 ARCHITECT                       ░',
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
    '  │  SYSTEM        MODERNIZER            INCLUSIVE       │',
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
    '  │  ◉ modernizer ────── evolution engine           [OK]  │',
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
  '  ║  21 MODULES │ 360+ CMDS │ 200+ SYNERGIES │ 400+ CAPS ║',
  '  ║  CLM: ENCODE + Infra Six reporting to DECODE          ║',
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
