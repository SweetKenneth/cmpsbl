/**
 * Terminal Boot Screen v9.0.0
 * Unique neural-organic visualization of the 20-module architecture
 * Mobile-friendly with no mid-word line breaks
 * 
 * v9.0.0 ARCHITECT Epoch Changes:
 * - 147 synergy pipelines, 125 executors, 32 S-tier discoveries
 * - Updated version branding to v9.0.0 ARCHITECT
 * - 325 capabilities, 70 engines, 22 meta-engines
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
  '  ▓  Version 8.5.0 — SYNERGY+      ▓',
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
    '  │    cortex  integration         │',
    '  │                                │',
    '  └────────────────────────────────┘',
    '',
  '  ◉ 14 modules operational',
  '  ◉ 340+ commands available',
  '  ◉ 147 synergies | 125 executors',
  '  ◉ 269 capabilities | 62 engines',
  '  ◉ 7 infrastructure systems',
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
    '  ░   SUBSTRATE OS v8.5.0 SYNERGY+                        ░',
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
    '  │  CORTEX                            INTEGRATION       │',
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
    '  │                                                       │',
    '  └───────────────────────────────────────────────────────┘',
    '',
  '  ╔═══════════════════════════════════════════════════════╗',
  '  ║  14 MODULES │ 340+ CMDS │ 147 SYNERGIES │ 269 CAPS   ║',
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
