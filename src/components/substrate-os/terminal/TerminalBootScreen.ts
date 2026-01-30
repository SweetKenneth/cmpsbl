/**
 * Terminal Boot Screen v6.3.1
 * Unique neural-organic visualization of the 14-module architecture
 * Mobile-friendly with no mid-word line breaks
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
  ║              PROMPTFLUID® SUBSTRATE OS v6.3.1             ║
  ║               Cognitive Operating System                   ║
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
    '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    '  ▓  PROMPTFLUID® SUBSTRATE OS       ▓',
    '  ▓  Version 6.3.1 FNDTN             ▓',
    '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    '',
    '  ┌─ BOOTSTRAP ─────────────────────┐',
    '  │                                 │',
    '  │  ⬢ KERNEL                       │',
    '  │    core ripple access           │',
    '  │                                 │',
    '  │  ◈ COGNITIVE                    │',
    '  │    brain decode dream           │',
    '  │                                 │',
    '  │  ◆ OPERATIONS                   │',
    '  │    defense nexus vision         │',
    '  │                                 │',
    '  │  ◇ ADMIN                        │',
    '  │    system modernizer inclusive  │',
    '  │                                 │',
    '  │  ★ ORCHESTRATOR                 │',
    '  │    cortex integration           │',
    '  │                                 │',
    '  └─────────────────────────────────┘',
    '',
    '  ◉ 14 modules operational',
    '  ◉ 260+ commands available',
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
    '  ░   SUBSTRATE OS v6.3.1 FNDTN                           ░',
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
    '  ║  14 MODULES │ 260+ COMMANDS │ HEALTH: 100%            ║',
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
