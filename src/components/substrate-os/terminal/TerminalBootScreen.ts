import { getMetric } from '@/stores/publicMetricsStore';

/**
 * Mobile boot screen — compact version for <768px viewports
 */
export function generateMobileBootScreen(): string[] {
  const epoch = getMetric('epoch') || 'MINDGAMES';
  return [
    '',
    '  ╔══════════════════════════════════╗',
    '  ║       C M P S B L ®             ║',
    `  ║  ${epoch} · Stream Terminal`.padEnd(35) + '║',
    '  ╚══════════════════════════════════╝',
    '',
    '  ▸ Initializing substrate...',
    '  ▸ Loading 40-primitive matrix...',
    '  ▸ Mapping 4-category taxonomy...',
    '',
    '  ┌─ PRIMITIVE MATRIX ──────────────┐',
    '  │                               │',
    '  │  ⬡ ORGANS (12)                │',
    '  │    core  system  nerve        │',
    '  │    ripple access identity     │',
    '  │    relay  audit  nexus        │',
    '  │    integration brain memory   │',
    '  │                               │',
    '  │  ◇ LAYERS (8)                 │',
    '  │    defense immunity           │',
    '  │    governance intent           │',
    '  │    evolution inclusive         │',
    '  │    conscience treaty           │',
    '  │                               │',
    '  │  ◈ ENGINES (10)               │',
    '  │    dream cortex oracle        │',
    '  │    forge compass atlas        │',
    '  │    economy sandbox medic      │',
    '  │    reflex                      │',
    '  │                               │',
    '  │  ★ AGENTS (10)                │',
    '  │    encode decode vision       │',
    '  │    phantom lingua echo        │',
    '  │    harvest sovereign          │',
    '  │    engineer observer          │',
    '  │                               │',
    '  └───────────────────────────────┘',
    '',
    '  ◉ 40 primitives · 4 categories · 500+ cmds',
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
    '  ▸ Initializing 40-primitive cognitive matrix...',
    '  ▸ Mapping 4-category taxonomy...',
    '  ▸ Calibrating signal pathways...',
    '',
    '  ┌─ 40-PRIMITIVE / 4-CATEGORY TAXONOMY ─────────────────────────┐',
    '  │                                                              │',
    '  │  ⬡ ORGANS (12) — Internal infrastructure ────────────────     │',
    '  │    ◉ core       ◉ system       ◉ nerve                       │',
    '  │    ◉ ripple     ◉ access       ◉ identity                    │',
    '  │    ◉ relay      ◉ audit        ◉ nexus                       │',
    '  │    ◉ integration ◉ brain       ◉ memory                      │',
    '  │                                                              │',
    '  │  ◇ LAYERS (8) — Ambient protection & governance ─────────     │',
    '  │    ◉ defense    ◉ immunity     ◉ governance  ◉ intent        │',
    '  │    ◉ evolution  ◉ inclusive    ◉ conscience  ◉ treaty        │',
    '  │                                                              │',
    '  │  ◈ ENGINES (10) — Invoked processing powerhouses ────────     │',
    '  │    ◉ dream      ◉ cortex      ◉ oracle      ◉ forge         │',
    '  │    ◉ compass    ◉ atlas       ◉ economy     ◉ sandbox       │',
    '  │    ◉ medic      ◉ reflex                                     │',
    '  │                                                              │',
    '  │  ★ AGENTS (10) — Autonomous actors ──────────────────────     │',
    '  │    ◉ encode     ◉ decode      ◉ vision      ◉ phantom       │',
    '  │    ◉ lingua     ◉ echo        ◉ harvest     ◉ sovereign     │',
    '  │    ◉ engineer   ◉ observer                                    │',
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
