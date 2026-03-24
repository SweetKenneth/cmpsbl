import { getMetric } from '@/stores/publicMetricsStore';

/**
 * CMPSBL® Substrate Boot Screen
 * Canonical 40-Primitive / 4-Category / 12·12·8·8 Matrix
 *
 * Boot Order (deterministic):
 *   1. LAYERS  — ambient protection must be active first
 *   2. ORGANS  — vital infrastructure under layer protection
 *   3. ENGINES — processing powerhouses ready
 *   4. AGENTS  — autonomous actors activate last
 */

// ── Canonical Primitive Registry ────────────────────────────────

const LAYERS = [
  'DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'TREATY',
  'EVOLUTION', 'REFLEX', 'COMPASS', 'INTEGRATION',
  'INTENT', 'ACCESS', 'VISION', 'SHADOW',
] as const;

const ORGANS = [
  'CORE', 'SYSTEM', 'BRAIN', 'MEMORY',
  'NERVE', 'NEXUS', 'IDENTITY', 'SOVEREIGN',
  'ATLAS', 'MEDIC', 'RELAY', 'CONSCIENCE',
] as const;

const ENGINES = [
  'DREAM', 'HARVEST', 'FORGE', 'LINGUA',
  'ECHO', 'PHANTOM', 'SANDBOX', 'RIPPLE',
] as const;

const AGENTS = [
  'ENCODE', 'DECODE', 'AUDIT', 'ECONOMY',
  'INCLUSIVE', 'CORTEX', 'ORACLE', 'ENGINEER',
] as const;

// ── Mobile Boot Screen ──────────────────────────────────────────

export function generateMobileBootScreen(): string[] {
  const epoch = getMetric('epoch') || 'CONTACT';
  return [
    '',
    '  ╔══════════════════════════════════╗',
    '  ║       C M P S B L ®             ║',
    `  ║  ${epoch} · Stream Terminal`.padEnd(35) + '║',
    '  ╚══════════════════════════════════╝',
    '',
    '  ▸ Boot sequence initiated...',
    '',
    '  ┌─ STAGE 1 ─ LAYERS (12) ────────┐',
    '  │  ◇ defense   immunity          │',
    '  │  ◇ governance treaty           │',
    '  │  ◇ evolution  reflex           │',
    '  │  ◇ compass   integration       │',
    '  │  ◇ intent    access            │',
    '  │  ◇ vision    shadow            │',
    '  │  ✓ Ambient protection: ACTIVE  │',
    '  └────────────────────────────────┘',
    '  ┌─ STAGE 2 ─ ORGANS (12) ────────┐',
    '  │  ⬡ core     system  brain      │',
    '  │  ⬡ memory   nerve   nexus      │',
    '  │  ⬡ identity sovereign atlas    │',
    '  │  ⬡ medic    relay   conscience │',
    '  │  ✓ Vital infrastructure: UP    │',
    '  └────────────────────────────────┘',
    '  ┌─ STAGE 3 ─ ENGINES (8) ────────┐',
    '  │  ◈ dream  harvest  forge       │',
    '  │  ◈ lingua echo phantom         │',
    '  │  ◈ sandbox ripple              │',
    '  │  ✓ Processing power: READY     │',
    '  └────────────────────────────────┘',
    '  ┌─ STAGE 4 ─ AGENTS (8) ─────────┐',
    '  │  ★ encode  decode  audit       │',
    '  │  ★ economy inclusive cortex    │',
    '  │  ★ oracle  engineer            │',
    '  │  ✓ Autonomous actors: ARMED    │',
    '  └────────────────────────────────┘',
    '',
    '  ◉ 40 primitives · 12·12·8·8 matrix',
    '  ◉ Health: ████████████████ 100%',
    '',
    '  ▸ Stream substrate: ONLINE',
    '',
    "  Type 'help' for commands",
    '',
  ];
}

// ── Desktop Boot Screen ─────────────────────────────────────────

export function generateDesktopBootScreen(): string[] {
  const epoch = getMetric('epoch') || 'CONTACT';
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
    '  ▸ Boot sequence initiated — 4-stage deterministic startup...',
    '',
    '  ┌─ STAGE 1 ─ LAYERS (12) — Ambient Overlays ────────────────────┐',
    '  │  ◇ DEFENSE    ◇ IMMUNITY    ◇ GOVERNANCE   ◇ TREATY          │',
    '  │  ◇ EVOLUTION  ◇ REFLEX      ◇ COMPASS      ◇ INTEGRATION     │',
    '  │  ◇ INTENT     ◇ ACCESS      ◇ VISION       ◇ SHADOW          │',
    '  │  ✓ Protection perimeter: ACTIVE                               │',
    '  └──────────────────────────────────────────────────────────────┘',
    '',
    '  ┌─ STAGE 2 ─ ORGANS (12) — Vital Infrastructure ────────────────┐',
    '  │  ⬡ CORE       ⬡ SYSTEM      ⬡ BRAIN        ⬡ MEMORY         │',
    '  │  ⬡ NERVE      ⬡ NEXUS       ⬡ IDENTITY     ⬡ SOVEREIGN      │',
    '  │  ⬡ ATLAS      ⬡ MEDIC       ⬡ RELAY        ⬡ CONSCIENCE     │',
    '  │  ✓ Vital systems: HEARTBEAT CONFIRMED                         │',
    '  └──────────────────────────────────────────────────────────────┘',
    '',
    '  ┌─ STAGE 3 ─ ENGINES (8) — Processing Powerhouses ──────────────┐',
    '  │  ◈ DREAM      ◈ HARVEST     ◈ FORGE        ◈ LINGUA          │',
    '  │  ◈ ECHO       ◈ PHANTOM     ◈ SANDBOX      ◈ RIPPLE          │',
    '  │  ✓ Processing cores: IGNITION COMPLETE                        │',
    '  └──────────────────────────────────────────────────────────────┘',
    '',
    '  ┌─ STAGE 4 ─ AGENTS (8) — Autonomous Actors ────────────────────┐',
    '  │  ★ ENCODE     ★ DECODE      ★ AUDIT        ★ ECONOMY         │',
    '  │  ★ INCLUSIVE   ★ CORTEX      ★ ORACLE       ★ ENGINEER        │',
    '  │  ✓ Autonomous actors: DEPLOYED AND ARMED                      │',
    '  └──────────────────────────────────────────────────────────────┘',
    '',
    '  ▸ Matrix integrity:  ████████████████████ 100%',
    '  ▸ Signal strength:   ████████████████████ 100%',
    '  ▸ Stream bandwidth:  ████████████████████ 100%',
    '',
    '  ╔══════════════════════════════════════════════════════════════╗',
    '  ║  40 PRIMITIVES  │  12·12·8·8  │  4 CATEGORIES              ║',
    '  ║  Boot: Layers → Organs → Engines → Agents                  ║',
    '  ║  Memory Stream: ACTIVE  │  Quality Floor: 68+              ║',
    "  ║  Type 'help' for commands  ·  'cortex.status' for mode     ║",
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
