/**
 * Terminal Command Executor
 * Handles parsing and execution of all substrate commands
 * 40 primitives | 500+ commands | 300 synergy memory chains
 */

import { substrate, brain, decode, defense, nexus, vision, dream, system, evolutionClient as evolutionMod, core, ripple, access, integration, cortex, inclusive, memoryMod, relayMod, auditMod, identityMod, economyMod, sandboxMod, encodeMod } from '@/lib/substrate';
import { supabase } from '@/integrations/supabase/client';
import { ALL_COMMANDS, COMMAND_CATEGORIES, type CommandDefinition, getCommandTier, meetsRequiredTier, getTierIcon, getTierLabel, type CommandTier } from './TerminalCommands';
import { getRandomItem, PERSONALITY_RESPONSES } from './TerminalTypes';
import { resolveAlias, addAlias, removeAlias, formatAliasHelp } from './useTerminalAliases';
import { getMacro, createMacro, deleteMacro, formatMacroHelp, formatMacroDetail } from './useTerminalMacros';
import { scheduleCommand, cancelScheduled, clearScheduled, formatScheduledList, formatScheduleConfirmation, getPendingCommands } from './useTerminalScheduler';
import { getLocalAuditLog, formatAuditLog, getSessionStats, exportAuditLog } from './useTerminalAudit';
import { renderForMobile, getOptimalCharWidth } from './TerminalMobileRenderer';
import { labelPrimitive, labelDescription } from '@/lib/export/primitive-labels';
import { debugMode } from '@/lib/debug-mode';
import { log } from '@/lib/system/log';

// Mobile-first evolution log formatter (organism-focused, no implementation details)
function formatEvolutionLogForTerminal(): string {
  const charWidth = getOptimalCharWidth();
  const isMobile = charWidth < 50;
  
  // Evolution entries (v6.x.x public versioning)
  const entries = [
    {
      id: '015',
      date: '2026-02-24',
      pressures: [
        'Cascading failures across sectors',
        'Blind spots in predictive health',
        'Healing decisions from single signals'
      ],
      responses: [
        'Ten resilience engines crystallized',
        'Fault injection validates assumptions',
        'Consensus required before healing'
      ],
      capabilities: [
        'Staged rollouts with auto-rollback',
        'Predictive anomaly forecasting',
        'Immutable incident records'
      ]
    },
    {
      id: '014',
      date: '2026-01-30',
      pressures: [
        'Visibility into emergent behaviors',
        'Context for informed decisions',
        'Hypothetical threat analysis'
      ],
      responses: [
        'Synergy patterns documented',
        'Proposals self-descriptive',
        'Simulation channel emerged'
      ],
      capabilities: [
        'Memories observable',
        'Full proposal context',
        'Safe failure exploration'
      ]
    },
    {
      id: '013',
      date: '2026-01-29',
      pressures: [
        'Adapt to all screen sizes',
        'Sustainable resource governance',
        'Stronger isolation guarantees'
      ],
      responses: [
        'Rendering respects constraints',
        'Budget governance integral',
        'Circuit breakers crystallized'
      ],
      capabilities: [
        'Graceful adaptation',
        'Defined resource envelopes',
        'Contained failures'
      ]
    }
  ];
  
  let output = `
┌─ LIVING EVOLUTION LOG ────────────────`;
  
  if (isMobile) {
    output += `
│ v6.x.x — Human Compatibility Era
│ Major versions only (public)
└───────────────────────────────────────`;
  } else {
    output += `─────────────────────┐
│ v6.x.x — Human Compatibility Era                             │
│ One living log per major version. Patches abstracted.        │
└──────────────────────────────────────────────────────────────┘`;
  }
  
  for (const entry of entries) {
    if (isMobile) {
      // Compact mobile format
      output += `

┌─ Evolution ${entry.id} ─ ${entry.date} ───
│
│ PRESSURES:`;
      for (const p of entry.pressures) {
        output += `
│  ▸ ${p}`;
      }
      output += `
│
│ RESPONSES:`;
      for (const r of entry.responses) {
        output += `
│  ▸ ${r}`;
      }
      output += `
│
│ CAPABILITIES:`;
      for (const c of entry.capabilities) {
        output += `
│  ▸ ${c}`;
      }
      output += `
└─────────────────────────────────────`;
    } else {
      // Full desktop format
      output += `

┌─ Evolution ${entry.id} ─ ${entry.date} ──────────────────────────────────────
│
│ ◆ OBSERVED PRESSURES
│   ${entry.pressures.join('\n│   ')}
│
│ ◆ LEARNED RESPONSES
│   ${entry.responses.join('\n│   ')}
│
│ ◆ RESULTING CAPABILITIES
│   ${entry.capabilities.join('\n│   ')}
│
└──────────────────────────────────────────────────────────────`;
    }
  }
  
  output += `

┌─ Archived Versions ──────────────────`;
  if (isMobile) {
    output += `
│ v5.x.x: Stabilization Era
│ v4.x.x: Kernel Architecture
│ v3.x.x: Resilience Architecture
│ v1-2.x.x: Genesis & Formation
└───────────────────────────────────────`;
  } else {
    output += `─────────────────────┐
│ v5.x.x — Full System Stabilization (frozen)                  │
│ v4.x.x — Kernel Architecture (frozen)                        │
│ v3.x.x — Resilience Architecture (frozen)                    │
│ v1-2.x.x — Genesis & Formation (frozen)                      │
└──────────────────────────────────────────────────────────────┘`;
  }
  
  return output;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONALITY FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatPersonalityList(profiles: Array<{ id: string; name: string; description: string }>): string {
  let output = `
┌─ DECODE PERSONALITY PROFILES ─────────────────────────────────┐
│ Interpretive filters only — do NOT affect execution/memory    │
├───────────────────────────────────────────────────────────────┤`;

  for (const p of profiles) {
    output += `
│ ◆ ${p.id.toUpperCase().padEnd(12)} ${p.name.padEnd(12)} │
│   ${p.description.substring(0, 55).padEnd(55)} │`;
  }

  output += `
├───────────────────────────────────────────────────────────────┤
│ Set: decode.personality.set <profile>                         │
│ Auto: decode.personality.auto   Lock: decode.personality.lock │
└───────────────────────────────────────────────────────────────┘`;

  return output;
}

function formatPersonalityGet(
  profile: { id: string; name: string; description: string; traits?: { directness: number; formality: number; verbosity: number; technicality: number } },
  state: { active: string; autoDetect: boolean; locked: boolean; lastDetected: string | null; detectionConfidence: number; serverSynced?: boolean }
): string {
  const lockIcon = state.locked ? '🔒' : '🔓';
  const autoIcon = state.autoDetect ? '✓' : '✗';
  const syncIcon = state.serverSynced ? '☁️' : '💾';
  const traits = profile.traits || { directness: 0.5, formality: 0.5, verbosity: 0.5, technicality: 0.5 };
  
  return `
┌─ ACTIVE PERSONALITY ──────────────────────────────────────────┐
│                                                               │
│  Profile:     ${profile.name.padEnd(15)} (${profile.id})${' '.repeat(20)}│
│  ${profile.description.padEnd(61)}│
│                                                               │
│  ${lockIcon} Locked:      ${(state.locked ? 'Yes' : 'No').padEnd(10)} Auto-detect: ${autoIcon} ${state.autoDetect ? 'Enabled' : 'Disabled'}         │
│  Last detected: ${(state.lastDetected || 'none').padEnd(12)} Confidence: ${(state.detectionConfidence * 100).toFixed(0)}%         │
│  ${syncIcon} Server sync: ${state.serverSynced ? 'Synced' : 'Local only'}                                  │
│                                                               │
│  Traits:  Direct ${(traits.directness * 100).toFixed(0)}% │ Formal ${(traits.formality * 100).toFixed(0)}% │ Verbose ${(traits.verbosity * 100).toFixed(0)}% │ Tech ${(traits.technicality * 100).toFixed(0)}% │
│                                                               │
└───────────────────────────────────────────────────────────────┘`;
}

function formatPersonalityDetection(result: {
  profile: string;
  confidence: number;
  markers: string[];
  sentiment: number;
  applied: boolean;
}): string {
  const appliedIcon = result.applied ? '✓ Applied' : '○ Not applied (locked or low confidence)';
  const sentimentBar = result.sentiment >= 0 
    ? `${'█'.repeat(Math.round(result.sentiment * 5))}${'░'.repeat(5 - Math.round(result.sentiment * 5))} +${(result.sentiment * 100).toFixed(0)}%`
    : `${'░'.repeat(5 - Math.round(Math.abs(result.sentiment) * 5))}${'█'.repeat(Math.round(Math.abs(result.sentiment) * 5))} ${(result.sentiment * 100).toFixed(0)}%`;

  return `
┌─ PERSONALITY DETECTION ───────────────────────────────────────┐
│                                                               │
│  Detected:    ${result.profile.toUpperCase().padEnd(15)} Confidence: ${(result.confidence * 100).toFixed(0)}%            │
│  ${appliedIcon.padEnd(61)}│
│                                                               │
│  Sentiment:   ${sentimentBar.padEnd(47)}│
│  Markers:     ${(result.markers.slice(0, 4).join(', ') || 'none').padEnd(47)}│
│                                                               │
└───────────────────────────────────────────────────────────────┘`;
}

function formatPersonalityInterpret(result: {
  primaryIntent: string;
  secondaryIntent: string | null;
  confidence: number;
  detectedPersonality: string;
  ambiguityFlags: string[];
  shouldEscalate: boolean;
  metadata: { processingTimeMs: number; profileUsed: string; confidenceModified: boolean };
}): string {
  const escIcon = result.shouldEscalate ? '⚠ Yes' : '○ No';
  const confBar = '█'.repeat(Math.round(result.confidence * 10)) + '░'.repeat(10 - Math.round(result.confidence * 10));

  return `
┌─ PERSONALITY-ADJUSTED INTERPRETATION ─────────────────────────┐
│                                                               │
│  Primary Intent:   ${result.primaryIntent.padEnd(42)}│
│  Secondary:        ${(result.secondaryIntent || '—').padEnd(42)}│
│                                                               │
│  Confidence:       ${confBar} ${(result.confidence * 100).toFixed(0)}%                    │
│  Profile Used:     ${result.metadata.profileUsed.padEnd(42)}│
│                                                               │
│  Ambiguity Flags:  ${(result.ambiguityFlags.join(', ') || 'none').padEnd(42)}│
│  Escalate:         ${escIcon.padEnd(42)}│
│                                                               │
│  Processing:       ${result.metadata.processingTimeMs}ms                                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM-WIDE 40-PRIMITIVE RESPONSE FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_EXECUTION_SURFACES = [
  // CORE + SYSTEM (2)
  { key: 'core', label: 'CORE', layer: 'Kernel' },
  { key: 'system', label: 'SYSTEM', layer: 'System' },
  // CCR — Clockless Cognitive Reality (3)
  { key: 'brain', label: 'BRAIN', layer: 'CCR' },
  { key: 'memory', label: 'MEMORY', layer: 'CCR' },
  { key: 'dream', label: 'DREAM', layer: 'CCR' },
  // OCG — Operational Compliance Grid (6)
  { key: 'ripple', label: 'RIPPLE', layer: 'OCG' },
  { key: 'access', label: 'ACCESS', layer: 'OCG' },
  { key: 'identity', label: 'IDENTITY', layer: 'OCG' },
  { key: 'relay', label: 'RELAY', layer: 'OCG' },
  { key: 'audit', label: 'AUDIT', layer: 'OCG' },
  { key: 'nerve', label: 'NERVE', layer: 'OCG' },
  // Execution (10)
  { key: 'decode', label: 'DECODE', layer: 'Execution' },
  { key: 'encode', label: 'ENCODE', layer: 'Execution' },
  { key: 'vision', label: 'VISION', layer: 'Execution' },
  { key: 'cortex', label: 'CORTEX', layer: 'Execution' },
  { key: 'nexus', label: 'NEXUS', layer: 'Execution' },
  { key: 'economy', label: 'ECONOMY', layer: 'Execution' },
  { key: 'sandbox', label: 'SANDBOX', layer: 'Execution' },
  { key: 'inclusive', label: 'INCLUSIVE', layer: 'Execution' },
  { key: 'medic', label: 'MEDIC', layer: 'Execution' },
  { key: 'integration', label: 'INTEGRATION', layer: 'Execution' },
  // ESZ — Expansion Sovereignty Zone (4)
  { key: 'sovereign', label: 'SOVEREIGN', layer: 'ESZ' },
  { key: 'oracle', label: 'ORACLE', layer: 'ESZ' },
  { key: 'conscience', label: 'CONSCIENCE', layer: 'ESZ' },
  { key: 'treaty', label: 'TREATY', layer: 'ESZ' },
  // EPZ — Expansion Perception Zone (3)
  { key: 'compass', label: 'COMPASS', layer: 'EPZ' },
  { key: 'echo', label: 'ECHO', layer: 'EPZ' },
  { key: 'reflex', label: 'REFLEX', layer: 'EPZ' },
  // EMZ — Expansion Manufacturing Zone (3)
  { key: 'forge', label: 'FORGE', layer: 'EMZ' },
  { key: 'lingua', label: 'LINGUA', layer: 'EMZ' },
  { key: 'harvest', label: 'HARVEST', layer: 'EMZ' },
  // CSZ — Covert Systems Zone (3)
  { key: 'evolution', label: 'EVOLUTION', layer: 'CSZ' },
  { key: 'shadow', label: 'SHADOW', layer: 'CSZ' },
  { key: 'phantom', label: 'PHANTOM', layer: 'CSZ' },
  // Fields (2) + Plane (1) + Shell (1)
  { key: 'immunity', label: 'IMMUNITY', layer: 'Field' },
  { key: 'intent', label: 'INTENT', layer: 'Field' },
  { key: 'governance', label: 'GOVERNANCE', layer: 'Plane' },
  { key: 'defense', label: 'DEFENSE', layer: 'Shell' },
];

function formatSystemStatus(data: any): string {
  const modules = data?.modules || data?.module_status || {};
  const overall = data?.status || data?.overall || 'operational';
  const version = data?.version || '';
  const uptime = data?.uptime || data?.uptime_seconds || 'N/A';
  
  let output = `
╔══════════════════════════════════════════════════════════════╗
║  CMPSBL® OS — SYSTEM STATUS                                  ║
╠══════════════════════════════════════════════════════════════╣
║  Overall:   ${overall === 'operational' ? '🟢 OPERATIONAL' : overall === 'degraded' ? '🟡 DEGRADED' : '🔴 DOWN'}                                     ║
║  Uptime:    ${String(uptime).padEnd(20)}                          ║
║  Primitives: 40/40 (Agents·Engines·Layers·Organs)                            ║
╠══════════════════════════════════════════════════════════════╣`;

  const layers = ['Kernel', 'System', 'CCR', 'OCG', 'Execution', 'ESZ', 'EPZ', 'EMZ', 'CSZ', 'Field', 'Plane', 'Shell'];
  for (const layer of layers) {
    const layerModules = ALL_EXECUTION_SURFACES.filter(m => m.layer === layer);
    output += `\n║  ┌─ ${layer.toUpperCase()} LAYER ──────────────────────────────────────`;
    for (const mod of layerModules) {
      const modData = modules[mod.key] || modules[mod.label.toLowerCase()] || {};
      const status = modData?.status || modData?.health || 'operational';
      const icon = status === 'operational' || status === 'healthy' || status === true ? '◉' : status === 'degraded' ? '◎' : status === 'down' ? '✗' : '◉';
      const healthPct = typeof modData?.health_score === 'number' ? `${(modData.health_score * 100).toFixed(0)}%` : '100%';
      output += `\n║  │  ${icon} ${mod.label.padEnd(14)} ${healthPct.padEnd(6)} ${String(status).substring(0, 12)}`;
    }
    output += `\n║  └──────────────────────────────────────────────────────`;
  }

  output += `
╠══════════════════════════════════════════════════════════════╣
║  500+ commands | 300 synergy memory chains | 100 engines         ║
║  675+ capabilities | 76 base + 24 meta-engines               ║
╚══════════════════════════════════════════════════════════════╝`;

  return output;
}

function formatSystemHealth(data: any): string {
  const modules = data?.modules || data?.module_health || {};
  const overall = data?.health || data?.overall_health || 1.0;
  const overallPct = typeof overall === 'number' ? (overall <= 1 ? (overall * 100).toFixed(0) : overall.toFixed(0)) : '100';
  const circuitState = data?.circuit_state || 'closed';
  const threatLevel = data?.threat_level || 'low';
  const version = data?.version || '';
  
  let output = `
╔══════════════════════════════════════════════════════════════╗
║  CMPSBL® OS — HEALTH DIAGNOSTICS                              ║
╠══════════════════════════════════════════════════════════════╣
║  Overall Health:  ${'█'.repeat(Math.round(Number(overallPct) / 10))}${'░'.repeat(10 - Math.round(Number(overallPct) / 10))} ${overallPct}%                      ║
║  Circuit:         ${circuitState === 'closed' ? '🟢 CLOSED (ready)' : '🔴 OPEN (blocking)'}                     ║
║  Threat Level:    ${threatLevel.toUpperCase().padEnd(10)}                                ║
║  Primitives:      40/40 reporting                             ║
╠══════════════════════════════════════════════════════════════╣
║  PRIMITIVE HEALTH REPORT                                     ║
╠══════════════════════════════════════════════════════════════╣`;

  for (const mod of ALL_EXECUTION_SURFACES) {
    const modData = modules[mod.key] || modules[mod.label.toLowerCase()] || {};
    const health = typeof modData?.health === 'number' ? modData.health : (typeof modData?.score === 'number' ? modData.score : 1.0);
    const pct = health <= 1 ? (health * 100).toFixed(0) : health.toFixed(0);
    const bar = '█'.repeat(Math.round(Number(pct) / 20)) + '░'.repeat(5 - Math.round(Number(pct) / 20));
    const circuit = modData?.circuit || 'closed';
    const circuitIcon = circuit === 'closed' ? '●' : circuit === 'half' ? '◐' : '○';
    output += `\n║  ${circuitIcon} ${mod.label.padEnd(14)} ${bar} ${pct.padStart(3)}%  [${mod.layer.substring(0, 5).padEnd(5)}]      ║`;
  }

  output += `
╠══════════════════════════════════════════════════════════════╣
║  Legend: ● closed  ◐ half-open  ○ open                       ║
║  Heal: system.heal <module>  |  Full: system.heal --all      ║
╚══════════════════════════════════════════════════════════════╝`;

  return output;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  data?: unknown;
}

// Resolve short Plan ID (8+ chars) to full UUID
async function resolveShortPlanId(ref: string): Promise<string | null> {
  const cleaned = String(ref || '').replace(/[<>'"]/g, '').trim();
  if (!cleaned) return null;

  // If it's already a full UUID (36 chars with dashes), return as-is
  if (cleaned.length === 36 && cleaned.includes('-')) {
    return cleaned;
  }

  try {
    // 1) Prefer active Evolution Runs (mobile-first short IDs)
    const { data: resolvedRun, error: runErr } = await supabase.rpc('resolve_evolution_run', {
      p_ref: cleaned,
    });

    if (!runErr && Array.isArray(resolvedRun) && resolvedRun.length > 0) {
      return resolvedRun[0].plan_id as string;
    }

    // 2) Fallback to legacy Upgrade Plans
    const { data: resolvedPlan, error: planErr } = await supabase.rpc('resolve_upgrade_plan_id', {
      p_ref: cleaned,
    });

    if (!planErr && resolvedPlan) {
      return resolvedPlan as string;
    }

    return null;
  } catch (e) {
    console.error('Failed to resolve plan ID:', e);
    return null;
  }
}

// Parse command arguments and sanitize IDs
function parseArgs(command: string): { base: string; args: string[] } {
  const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  const base = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1).map(arg => {
    // Remove quotes first
    let cleaned = arg.replace(/^"(.*)"$/, '$1');
    // Remove angle brackets (common copy-paste issue from docs: <uuid>)
    cleaned = cleaned.replace(/^<(.*)>$/, '$1');
    // Also strip stray brackets if they appear
    cleaned = cleaned.replace(/[<>]/g, '').trim();
    return cleaned;
  });
  return { base, args };
}

// Generate help text for a specific module
function generateModuleHelp(module: keyof typeof COMMAND_CATEGORIES): string {
  const cat = COMMAND_CATEGORIES[module];
  const maxCmdLen = Math.max(...cat.commands.map(c => c.command.length));
  
  let output = `\n┌─ ${cat.label} MODULE ─────────────────────────────────────────\n│\n`;
  
  for (const cmd of cat.commands) {
    const paddedCmd = cmd.command.padEnd(maxCmdLen + 2);
    const tier = getCommandTier(cmd);
    const tierIcon = getTierIcon(tier);
    const tierTag = tier !== 'free' ? ` [${getTierLabel(tier)}]` : '';
    const argsHint = cmd.args ? ` ${cmd.args}` : '';
    output += `│ ${tierIcon} ${paddedCmd} ∷ ${cmd.description}${argsHint}${tierTag}\n`;
  }
  
  output += `│\n│ ○ = Free  ◆ = Creator  ★ = Architect  ◉ = Governor\n`;
  output += `└──────────────────────────────────────────────────────────`;
  
  return output;
}

// Generate full help text with all primitives
function generateFullHelp(): string {
  const modules = Object.keys(COMMAND_CATEGORIES) as Array<keyof typeof COMMAND_CATEGORIES>;
  const totalCommands = ALL_COMMANDS.length;
  
  let output = `
┌─────────────────────────────────────────────────────────────┐
│          CMPSBL® OS — COMMAND REFERENCE                     │
├─────────────────────────────────────────────────────────────┤
│  Total commands: ${totalCommands.toString().padEnd(5)}    Primitives: 40 · 4 Categories    │
│  Architecture: 40-primitive matrix │ 675+ caps │ 300 Synergies│
│                                                             │
│  Access Tiers:                                              │
│    ○ BUILDER      Read-only, status, pulse                  │
│    ◇ STUDIO       SDK, templates, memory ($29/mo)           │
│    ◆ CREATOR      Actions, engines ($49/mo)                  │
│    ★ ARCHITECT    Evolution, advanced ops ($79/mo)           │
│    ◉ GOVERNOR     System restore, admin (CMPSBL only)       │
│                                                             │
│  Quick navigation:                                          │
│    help <module>   Show module commands                     │
│    <cmd> --help    Show command usage                       │
└─────────────────────────────────────────────────────────────┘

┌─ MODULE INDEX ──────────────────────────────────────────────┐
│                                                             │
│  ⬢ KERNEL LAYER                                             │
│    core         (${COMMAND_CATEGORIES.core.commands.length.toString().padStart(2)} cmds)  Scheduler, lifecycle, routing      │
│    ripple       (${COMMAND_CATEGORIES.ripple.commands.length.toString().padStart(2)} cmds)  Message bus, pub/sub, queues       │
│    access       (${COMMAND_CATEGORIES.access.commands.length.toString().padStart(2)} cmds)  API keys, billing, metering        │
│                                                             │
│  ◈ COGNITIVE LAYER                                          │
│    brain        (${COMMAND_CATEGORIES.brain.commands.length.toString().padStart(2)} cmds)  Memory, learning, reflection       │
│    decode       (${COMMAND_CATEGORIES.decode.commands.length.toString().padStart(2)} cmds)  Interpretation, intent parsing     │
│    dream        (${COMMAND_CATEGORIES.dream.commands.length.toString().padStart(2)} cmds)  Dream-Eater, mutation, cycles      │
│                                                             │
│  ◆ OPERATIONS LAYER                                         │
│    defense      (${COMMAND_CATEGORIES.defense.commands.length.toString().padStart(2)} cmds)  Security, threats, anomalies       │
│    nexus        (${COMMAND_CATEGORIES.nexus.commands.length.toString().padStart(2)} cmds)  AI routing, multi-provider         │
│    vision       (${COMMAND_CATEGORIES.vision.commands.length.toString().padStart(2)} cmds)  Observability, metrics, logs       │
│                                                             │
│  ◇ ADMIN LAYER                                              │
│    system       (${COMMAND_CATEGORIES.system.commands.length.toString().padStart(2)} cmds)  Orchestration, heal, backup        │
│    evolution    (${COMMAND_CATEGORIES.evolution.commands.length.toString().padStart(2)} cmds)  Evolution engine, upgrades         │
│    inclusive    (${COMMAND_CATEGORIES.inclusive.commands.length.toString().padStart(2)} cmds)  Accessibility, WCAG scanning       │
│                                                             │
│  ★ ORCHESTRATOR LAYER                                       │
│    cortex       (${COMMAND_CATEGORIES.cortex.commands.length.toString().padStart(2)} cmds)  Policy intent, PAAEL loop          │
│    integration  (${COMMAND_CATEGORIES.integration.commands.length.toString().padStart(2)} cmds)  Enterprise adapters, discovery     │
│    encoded      (${COMMAND_CATEGORIES.engine.commands.length.toString().padStart(2)} cmds)  AI code generation agent           │
│                                                             │
│  ◎ INFRASTRUCTURE LAYER                                      │
│    memory       (${COMMAND_CATEGORIES.memory_mod.commands.length.toString().padStart(2)} cmds)  Vector/RAG orchestration           │
│    relay        (${COMMAND_CATEGORIES.relay_mod.commands.length.toString().padStart(2)} cmds)  Outbound webhooks & effects        │
│    audit        (${COMMAND_CATEGORIES.audit_mod.commands.length.toString().padStart(2)} cmds)  Immutable compliance ledger        │
│    identity     (${COMMAND_CATEGORIES.identity_mod.commands.length.toString().padStart(2)} cmds)  Universal actor attribution        │
│    economy      (${COMMAND_CATEGORIES.economy_mod.commands.length.toString().padStart(2)} cmds)  Cost attribution & budgets         │
│    sandbox      (${COMMAND_CATEGORIES.sandbox_mod.commands.length.toString().padStart(2)} cmds)  Isolated execution environments    │
│                                                             │
│  ◉ AUTONOMY LAYER                                           │
│    clm          (${COMMAND_CATEGORIES.clm.commands.length.toString().padStart(2)} cmds)  Autonomous learning, curriculum     │
│    seba         (${COMMAND_CATEGORIES.seba.commands.length.toString().padStart(2)} cmds)  Self-evolving bounded agent         │
│                                                             │
│  ⚡ ENGINE LAYER                                             │
│    engine       (${COMMAND_CATEGORIES.engine.commands.length.toString().padStart(2)} cmds)  76 engines + 24 meta-engines       │
│                                                             │
│  🔱 EXPANSION — ESZ (help esz)                                │
│    sovereign    (${COMMAND_CATEGORIES.sovereign.commands.length.toString().padStart(2)} cmds)  Jurisdictional compliance          │
│    oracle       (${COMMAND_CATEGORIES.oracle.commands.length.toString().padStart(2)} cmds)  Predictive analytics               │
│    conscience   (${COMMAND_CATEGORIES.conscience.commands.length.toString().padStart(2)} cmds)  Ethical governance & bias           │
│    treaty       (${COMMAND_CATEGORIES.treaty.commands.length.toString().padStart(2)} cmds)  Inter-system agreements            │
│                                                             │
│  🔱 EXPANSION — EPZ (help epz)                                │
│    compass      (${COMMAND_CATEGORIES.compass.commands.length.toString().padStart(2)} cmds)  Strategic navigation               │
│    echo         (${COMMAND_CATEGORIES.echo.commands.length.toString().padStart(2)} cmds)  Event replay & simulation          │
│    reflex       (${COMMAND_CATEGORIES.reflex.commands.length.toString().padStart(2)} cmds)  Edge computing & response          │
│                                                             │
│  🔱 EXPANSION — EMZ (help emz)                                │
│    forge        (${COMMAND_CATEGORIES.forge.commands.length.toString().padStart(2)} cmds)  Artifact manufacturing             │
│    lingua       (${COMMAND_CATEGORIES.lingua.commands.length.toString().padStart(2)} cmds)  Translation & i18n                 │
│    harvest      (${COMMAND_CATEGORIES.harvest.commands.length.toString().padStart(2)} cmds)  Data collection & ETL              │
│                                                             │
│  🔱 EXPANSION — CSZ (help csz)                                │
│    evolution    (${COMMAND_CATEGORIES.evolution.commands.length.toString().padStart(2)} cmds)  Mutation memory chain & upgrades       │
│    shadow       (${COMMAND_CATEGORIES.shadow.commands.length.toString().padStart(2)} cmds)  Shadow environment & staging       │
│    phantom      (${COMMAND_CATEGORIES.phantom.commands.length.toString().padStart(2)} cmds)  Privacy engineering                │
│                                                             │
│  🛡 MESH OVERLAYS                                              │
│    immunity     (${COMMAND_CATEGORIES.immunity.commands.length.toString().padStart(2)} cmds)  Self-healing & threat correlation   │
│    governance   (${COMMAND_CATEGORIES.governance.commands.length.toString().padStart(2)} cmds)  Policy enforcement                 │
│    medic        (${COMMAND_CATEGORIES.medic.commands.length.toString().padStart(2)} cmds)  Autonomous diagnostics             │
│    nerve        (${COMMAND_CATEGORIES.nerve.commands.length.toString().padStart(2)} cmds)  Inter-node signaling               │
│                                                             │
│  👁 OBSERVABILITY                                             │
│    obs          (${COMMAND_CATEGORIES.observability.commands.length.toString().padStart(2)} cmds)  Telemetry, bridges, latency, DLQ   │
│    gov          Governance modes, vetoes, drift              │
│                                                             │
│  ⚙ INFRASTRUCTURE                                            │
│    infra        (${COMMAND_CATEGORIES.infra.commands.length.toString().padStart(2)} cmds)  Cron, snapshots, analytics, NL     │
│    patch        ( 4 cmds)  Distribution patch dispatch        │
│    matrix       (13 cmds)  Canary, chaos, heatmap, quorum    │
│                                                             │
│  ⚙ META COMMANDS                                            │
│    meta         (${COMMAND_CATEGORIES.meta.commands.length.toString().padStart(2)} cmds)  Terminal controls, help, aliases    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ QUICK COMMANDS ────────────────────────────────────────────┐
│                                                             │
│  system.status      Global status check                     │
│  system.health      Full health report                      │
│  system.fix         Audit + auto-repair in one shot         │
│  system.repair      Self-repair loop (3 attempts)           │
│  vision.pulse       Quick heartbeat                         │
│  brain.reflect      Trigger reflection                      │
│  dream.cycle        Dream-Eater cycle                       │
│  system.heal        Self-healing                            │
│  obs.summary        Observability overview                  │
│  gov.mode           Governance mode & states                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ EVOLUTION CYCLE ────────────────────────────────────────────┐
│                                                             │
│  ┌─ COGNITIVE SCAN ─────────────────────────────────────┐   │
│  │  evolution.scan              Full systems scan       │   │
│  │  evolution.scan --explain    Human-readable output   │   │
│  │  evolution.scan --llm-report LLM reasoning included  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ LIFECYCLE ──────────────────────────────────────────┐   │
│  │  1. evolution.scan           Creates plan            │   │
│  │  2. evolution.evolve shadow  Apply to shadow env     │   │
│  │  3. evolution.evolve production  Promote (needs 2)   │   │
│  │  4. evolution.evolve verify  Complete cycle          │   │
│  │     evolution.evolve abort   Cancel active run       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ CIRCUIT BREAKER ────────────────────────────────────┐   │
│  │  evolution.circuit status    Check circuit state     │   │
│  │  evolution.circuit reset     Close circuit           │   │
│  │  evolution.autonomy status   View autonomy mode      │   │
│  │  evolution.autonomy set <m>  off|advisory|governed   │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ CLM (CONSTANT LEARNING MODE) ───────────────────────────────┐
│                                                             │
│  clm.status          Status, budget, queue size             │
│  clm.enable          Enable autonomous learning             │
│  clm.disable         Disable autonomous learning            │
│  clm.cycle           Run a manual CLM cycle                 │
│  clm.run <module>    Run CLM for a single module            │
│  clm.run_all         Run CLM for ALL modules                │
│  clm.budget          View daily budget allocation           │
│  clm.kill_switch     Activate/deactivate kill switch        │
│  clm.topics          View topic bank with mastery           │
│  clm.add_topic       Add custom topic to bank               │
│  clm.review_queue    View spaced repetition queue           │
│  clm.next_review     Get next review item                   │
│  decode.inbox        CLM reports from ALL modules            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ SEBA (SELF-EVOLVING BOUNDED AGENT) ─────────────────────────┐
│                                                             │
│  seba.status         Agent state, mode, and statistics      │
│  seba.enable         Enable bounded autonomy                │
│  seba.disable        Disable agent                          │
│  seba.mode [mode]    Get/set: off|observe|advisory|governed │
│  seba.cycle          Run complete 5-phase evolution cycle   │
│  seba.propose        Generate proposals only (no execution) │
│  seba.review         View pending proposals                 │
│  seba.approve <id>   Approve a proposal                     │
│  seba.reject <id>    Reject a proposal                      │
│  seba.execute <id>   Execute approved proposal              │
│  seba.rollback <id>  Rollback an execution                  │
│  seba.history [n]    View evolution history                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ SYNERGY ENGINE (200 Memory Chains) ─────────────────────────────┐
│                                                             │
│  cortex.synergy.status    Engine overview                   │
│  cortex.synergy.list      List all 200 memory chains            │
│  cortex.synergy.get <id>  Get memory chain details              │
│  cortex.synergy.execute   Execute a memory chain                │
│  cortex.synergy.dry_run   Preview execution (no effects)    │
│  cortex.synergy.recommend Get recommended synergies         │
│  cortex.synergy.categories  List categories                 │
│  cortex.synergy.modules     Synergies by module             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ INFRASTRUCTURE ──────────────────────────────────────────────┐
│                                                             │
│  ┌─ CRON SCHEDULER ─────────────────────────────────────┐   │
│  │  cron.list              View all scheduled jobs       │   │
│  │  cron.start / cron.stop Start/stop the scheduler      │   │
│  │  cron.trigger <job-id>  Manually trigger a job        │   │
│  │  cron.history           View run history              │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ RATE LIMITING ──────────────────────────────────────┐   │
│  │  ratelimit.status       Persistent limiter status     │   │
│  │  ratelimit.buckets      List all buckets              │   │
│  │  ratelimit.cleanup      Cleanup expired buckets       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ ROLLBACK SNAPSHOTS (Enterprise) ────────────────────┐   │
│  │  snapshot.list          List state snapshots          │   │
│  │  snapshot.capture       Capture current state         │   │
│  │  snapshot.restore <id>  Restore from snapshot         │   │
│  │  snapshot.diff <id>     Diff vs current state         │   │
│  │  snapshot.prune         Prune old snapshots           │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ CAPABILITY ANALYTICS ───────────────────────────────┐   │
│  │  analytics.summary      Usage summary (24h)           │   │
│  │  analytics.top          Top capabilities              │   │
│  │  analytics.dead         Dead/unused capabilities      │   │
│  │  analytics.rising       Rising trends                 │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ STREAMING + FILES + NL ─────────────────────────────┐   │
│  │  stream.status          SSE memory chain status           │   │
│  │  file.status            File processing memory chain      │   │
│  │  file.formats           Supported formats             │   │
│  │  nl.parse <query>       Natural language → command     │   │
│  │  nl.intents             Known NL intents              │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ PATCH DISPATCH ──────────────────────────────────────┐   │
│  │  patch.send             Dispatch patch to LNCHBL      │   │
│  │  patch.status           List recent patches           │   │
│  │  patch.publish <id>     Publish & dispatch draft      │   │
│  │  patch.help             Patch command reference       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ ENCODED AGENT ──────────────────────────────────────────────┐
│                                                             │
│  encoded.status          Agent status and configuration     │
│  encoded.generate        Generate code (with task spec)     │
│  encoded.verify <code>   Verify against guardrails          │
│  encoded.analyze <code>  Analyze quality metrics            │
│  encoded.skills          Skill proficiency levels           │
│  encoded.dry_run         Enable dry-run mode                │
│  encoded.enable          Enable human approval mode         │
│  encoded.semi_auto       Semi-autonomous mode               │
│  encoded.help            All encoded commands               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ OBSERVABILITY (obs.*) ──────────────────────────────────────┐
│                                                             │
│  obs.summary           Full observability overview           │
│  obs.bridges           Bridge activity & message flow        │
│  obs.latency           Cross-node latency metrics            │
│  obs.hotspots          Error hotspot detection               │
│  obs.telemetry         Telemetry engine state                │
│  obs.telemetry.errors  Recent error log                      │
│  obs.telemetry.gov     Governance events log                 │
│  obs.dlq               Dead letter queue status              │
│  obs.health            Composite health score                │
│  obs.help              Observability command reference       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ GOVERNANCE SHORTHAND (gov.*) ───────────────────────────────┐
│                                                             │
│  gov.mode              Current mode & subsystem states       │
│  gov.vetoes            Active vetoes with scope              │
│  gov.compliance        Run compliance audit                  │
│  gov.drift             Governance drift analysis             │
│  gov.transitions       Available mode transitions            │
│  gov.help              Governance command reference          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ SYSTEM AUDIT & REPAIR ─────────────────────────────────────┐
│                                                             │
│  system.audit          Full subsystem audit                  │
│  system.repair         Self-repair loop (3 attempts)         │
│  system.fix            Audit + auto-repair in one shot       │
│  system.health         Quick composite health check          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ ENGINE FRAMEWORK ──────────────────────────────────────────┐
│                                                             │
│  engine.list [cat]       List engines by category           │
│  engine.get <id>         Engine details                     │
│  engine.run <id>         Execute an engine                  │
│  engine.batch            Execute multiple engines           │
│  engine.worldfirst       14 world-first engines             │
│  meta.list               List meta-engines                  │
│  meta.run <id>           Execute meta-engine                │
│  engine.history          Recent executions                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ TERMINAL FEATURES ──────────────────────────────────────────┐
│                                                             │
│  alias               Shorthand commands                     │
│  macro               Multi-command scripts (@name)          │
│  schedule            Delayed execution (schedule 5m cmd)    │
│  watch               Periodic execution (watch 10s cmd)     │
│  audit               Session audit trail & stats            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ KEYBOARD SHORTCUTS ────────────────────────────────────────┐
│                                                             │
│  ↑/↓                 Navigate command history               │
│  Tab                 Autocomplete command                   │
│  Ctrl+C              Clear current input                    │
│  Ctrl+L              Clear terminal                         │
│  1-4                 Execute smart suggestions              │
│                                                             │
└─────────────────────────────────────────────────────────────┘`;

  return output;
}

// Execute a substrate command
export async function executeCommand(
  command: string, 
  isOperator: boolean,
  userTier?: CommandTier
): Promise<ExecutionResult> {
  const { base, args } = parseArgs(command);
  
  // Meta commands
  if (base === 'help') {
    const module = args[0]?.toLowerCase();
    if (module && module in COMMAND_CATEGORIES) {
      return { success: true, output: generateModuleHelp(module as keyof typeof COMMAND_CATEGORIES) };
    }
    // Special aliases for sub-modules not in COMMAND_CATEGORIES directly
    if (module === 'patch') {
      const { PATCH_COMMANDS } = await import('./TerminalCommands');
      const maxLen = Math.max(...PATCH_COMMANDS.map(c => c.command.length));
      let output = `\n┌─ PATCH DISPATCH ─────────────────────────────────────────────\n│\n`;
      for (const cmd of PATCH_COMMANDS) {
        const padded = cmd.command.padEnd(maxLen + 2);
        const tier = getCommandTier(cmd);
        const icon = getTierIcon(tier);
        const tierTag = tier !== 'free' ? ` [${getTierLabel(tier)}]` : '';
        const argsHint = cmd.args ? ` ${cmd.args}` : '';
        output += `│ ${icon} ${padded} ∷ ${cmd.description}${argsHint}${tierTag}\n`;
      }
      output += `│\n│ ○ = Free  ◆ = Creator  ★ = Architect  ◉ = Governor\n└──────────────────────────────────────────────────────────`;
      return { success: true, output };
    }
    if (module === 'encoded') {
      const { ENCODED_COMMANDS } = await import('./TerminalCommands');
      const maxLen = Math.max(...ENCODED_COMMANDS.map(c => c.command.length));
      let output = `\n┌─ ENCODED AGENT ──────────────────────────────────────────────\n│\n`;
      for (const cmd of ENCODED_COMMANDS) {
        const padded = cmd.command.padEnd(maxLen + 2);
        const tier = getCommandTier(cmd);
        const icon = getTierIcon(tier);
        const tierTag = tier !== 'free' ? ` [${getTierLabel(tier)}]` : '';
        const argsHint = cmd.args ? ` ${cmd.args}` : '';
        output += `│ ${icon} ${padded} ∷ ${cmd.description}${argsHint}${tierTag}\n`;
      }
      output += `│\n│ ○ = Free  ◆ = Creator  ★ = Architect  ◉ = Governor\n└──────────────────────────────────────────────────────────`;
      return { success: true, output };
    }
    // Shorthand aliases
    if (module === 'obs' || module === 'observability') {
      return { success: true, output: generateModuleHelp('observability' as keyof typeof COMMAND_CATEGORIES) };
    }
    if (module === 'gov') {
      return { success: true, output: generateModuleHelp('governance' as keyof typeof COMMAND_CATEGORIES) };
    }
    // Infrastructure module help aliases
    const infraModuleAliases: Record<string, string> = {
      'memory': 'memory_mod', 'relay': 'relay_mod', 'audit': 'audit_mod',
      'identity': 'identity_mod', 'economy': 'economy_mod', 'sandbox': 'sandbox_mod',
      'intent': 'intent_hub', 'atlas': 'atlas_op', 'engineer': 'engineer_op',
    };
    if (module && module in infraModuleAliases) {
      return { success: true, output: generateModuleHelp(infraModuleAliases[module] as keyof typeof COMMAND_CATEGORIES) };
    }
    // Expansion zone overviews
    if (module === 'expansion' || module === 'esz' || module === 'epz' || module === 'emz' || module === 'csz') {
      const zones: Record<string, string[]> = {
        expansion: ['sovereign', 'oracle', 'conscience', 'treaty', 'compass', 'echo', 'reflex', 'forge', 'lingua', 'phantom', 'harvest', 'medic', 'nerve', 'evolution', 'immunity', 'shadow'],
        esz: ['sovereign', 'oracle', 'conscience', 'treaty'],
        epz: ['compass', 'echo', 'reflex'],
        emz: ['forge', 'lingua', 'harvest'],
        csz: ['evolution', 'shadow', 'phantom'],
      };
      const mods = zones[module] || zones.expansion;
      let output = `\n┌─ ${module.toUpperCase()} — Expansion Primitives ────────────────────────────\n│\n`;
      for (const m of mods) {
        output += `│  ${m.padEnd(14)} → help ${m}\n`;
      }
      output += `│\n└──────────────────────────────────────────────────────────`;
      return { success: true, output };
    }
    // Matrix resilience help
    if (module === 'matrix') {
      return { success: true, output: `
┌─ MATRIX RESILIENCE COMMANDS ─────────────────────────────────┐
│                                                               │
│  matrix.canary          Node canary deployments               │
│  matrix.killswitch      Sector kill switch states             │
│  matrix.killswitch.kill Kill a sector                         │
│  matrix.killswitch.revive  Revive a sector                    │
│  matrix.redundant       Redundant node pairs                  │
│  matrix.chaos           Chaos testing stats                   │
│  matrix.chaos.inject    Inject chaos (fault injection)        │
│  matrix.correlation     Cross-sector correlation              │
│  matrix.heatmap         Health heatmap                        │
│  matrix.forecast        Anomaly forecasting                   │
│  matrix.quorum          Quorum healing                        │
│  matrix.incidents       Immutable incident registry           │
│  matrix.queue           Priority queue state                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘` };
    }
    // ENCODE module help
    if (module === 'encode') {
      const { registerEncodeModuleHandlers } = await import('@/lib/terminal/encode-handlers');
      registerEncodeModuleHandlers();
      const { getHandler } = await import('@/lib/terminal/validate-registry');
      const helpHandler = getHandler('encode.help');
      if (helpHandler) {
        const helpResult = await helpHandler() as any;
        return { success: true, output: helpResult?.formatted?.join('\n') || 'ENCODE module help' };
      }
    }
    return { success: true, output: generateFullHelp() };
  }

  if (base === 'clear') {
    return { success: true, output: '__CLEAR__' };
  }

  if (base === 'whoami') {
    // Determine tier display from the new tier model
    const effectiveTier: CommandTier = userTier || (isOperator ? 'creator' : 'free');
    const tierLabel = getTierLabel(effectiveTier);
    const tierIcon = getTierIcon(effectiveTier);
    
    const tierDescriptions: Record<string, string> = {
      free: 'Read-only dashboard, status commands',
      studio: 'SDK, templates, memory, analytics ($29/mo)',
      creator: 'Engines, agents, actions, exports ($49/mo)',
      architect: 'Evolution, mesh, advanced ops ($79/mo)',
      governor: 'Full system authority, admin, mint (CMPSBL only)',
    };
    const tierDesc = tierDescriptions[effectiveTier] || '';
    
    let identityLine = '';
    let devName = '';
    
    try {
      const identityResult = await access.identity() as any;
      if (identityResult?.success) {
        devName = identityResult.developer?.display_name || '';
        if (devName) {
          identityLine = `│  Identity:    ${devName}\n`;
        }
      }
    } catch {
      // continue
    }
    
    // If no identity from API, try backend directly
    if (!devName) {
      try {
        const { supabase: sb } = await import('@/integrations/supabase/client');
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const { data: dev } = await sb
            .from('access_developers')
            .select('display_name')
            .eq('user_id', user.id)
            .maybeSingle();
          devName = dev?.display_name || user.email?.split('@')[0] || 'User';
          identityLine = `│  Identity:    ${devName}\n│  Email:       ${user.email}\n`;
        }
      } catch {
        // Fallback
      }
    }
    
    const identity = `
┌─ SUBSTRATE IDENTITY ─────────────────────────────────────────
│ 
│  ██████╗ ███████╗     Cognitive Infrastructure Substrate
│  ██╔═══╝ ██╔════╝     CMPSBL® OS
│  ██║     ███████╗     
│  ██║     ╚════██║     Environment: CMPSBL Cloud
│  ██████╗ ███████║     Status: OPERATIONAL
│  ╚═════╝ ╚══════╝
│ 
│  40-Primitive / 12-Category Field-Based Topology — Full AI Substrate
│  Where Dreams Come To Adapt
│  
${identityLine}│  ${tierIcon} Tier:       ${tierLabel}
│  Access:     ${tierDesc}
│  
│  ┌─ KERNEL LAYER ────────────────────────────────────────────
│  │  core://       scheduler, lifecycle, routing
│  │  ripple://     message bus, pub/sub, queues
│  │  access://     API keys, billing, metering
│  │
│  ├─ COGNITION LAYER ─────────────────────────────────────────
│  │  brain://      memory, learning, reflection
│  │  decode://     interpretation, intent parsing
│  │  dream://      dream-eater, mutation
│  │
│  ├─ OPERATIONS LAYER ────────────────────────────────────────
│  │  defense://    security, threats, anomalies
│  │  nexus://      AI routing, multi-provider
│  │  vision://     observability, metrics
│  │
│  ├─ ADMIN LAYER ─────────────────────────────────────────────
│  │  system://     orchestration, lifecycle, heal
│  │  evolution://  upgrades, codebase evolution
│  │  inclusive://  accessibility, human compatibility
│  │
│  ├─ ORCHESTRATOR LAYER ──────────────────────────────────────
│  │  cortex://     policy intent, manual mode
│  │  integration://enterprise adapters, discovery
│  │  encode://     code execution, generation, CLM
│  │
│  ├─ INFRASTRUCTURE LAYER ────────────────────────────────────
│  │  memory://     vector store, RAG, embeddings
│  │  relay://      webhooks, notifications, delivery
│  │  audit://      immutable logs, hash chains
│  │  identity://   actor attribution, signatures
│  │  economy://    cost tracking, budget enforcement
│  │  sandbox://    isolated execution, testing
│  │
│  └────────────────────────────────────────────────────────────
│  
│  Terminal: aliases, macros, NLP, watch mode, audit
│  40 primitives | 4 categories | 500+ commands | 300 synergy memory chains | health: 100%
│  675+ capabilities | 100 engines (76 base + 24 meta)
│  CMPSBL® — where dreams come to adapt
│  
└──────────────────────────────────────────────────────────────`;
    return { success: true, output: identity };
  }

  if (base === 'history') {
    return { success: true, output: '__HISTORY__' };
  }

  if (base === 'export') {
    return { success: true, output: '__EXPORT__' };
  }

  if (base === 'theme') {
    const theme = args[0] || 'toggle';
    return { success: true, output: `__THEME__${theme}` };
  }

  // Alias commands
  if (base === 'alias') {
    if (args[0] === 'add' && args[1] && args[2]) {
      const success = addAlias(args[1], args.slice(2).join(' '));
      return {
        success,
        output: success 
          ? `◉ Alias created: ${args[1]} → ${args.slice(2).join(' ')}`
          : `▓ ERROR: Cannot override builtin alias '${args[1]}'`,
      };
    }
    if (args[0] === 'remove' && args[1]) {
      const success = removeAlias(args[1]);
      return {
        success,
        output: success 
          ? `◉ Alias removed: ${args[1]}`
          : `▓ ERROR: Alias '${args[1]}' not found or is builtin`,
      };
    }
    return { success: true, output: formatAliasHelp() };
  }

  // Macro commands
  if (base === 'macro') {
    if (args[0] === 'list' || args.length === 0) {
      return { success: true, output: formatMacroHelp() };
    }
    if (args[0] === 'show' && args[1]) {
      return { success: true, output: formatMacroDetail(args[1]) };
    }
    if (args[0] === 'create' && args[1]) {
      // Expect format: macro create <name> "cmd1; cmd2; cmd3" "description"
      const name = args[1];
      const commandStr = args[2] || '';
      const commands = commandStr.split(';').map(c => c.trim()).filter(Boolean);
      const description = args[3] || 'Custom macro';
      
      if (commands.length === 0) {
        return { 
          success: false, 
          output: '▓ ERROR: No commands provided\n  Usage: macro create <name> "cmd1; cmd2; cmd3" "description"',
        };
      }
      
      const success = createMacro(name, description, commands);
      return {
        success,
        output: success 
          ? `◉ Macro created: @${name} with ${commands.length} commands`
          : `▓ ERROR: Cannot override builtin macro '${name}'`,
      };
    }
    if (args[0] === 'delete' && args[1]) {
      const success = deleteMacro(args[1]);
      return {
        success,
        output: success 
          ? `◉ Macro deleted: @${args[1]}`
          : `▓ ERROR: Macro '${args[1]}' not found or is builtin`,
      };
    }
    if (args[0] === 'run' && args[1]) {
      const macro = getMacro(args[1]);
      if (!macro) {
        return { success: false, output: `▓ ERROR: Macro '${args[1]}' not found` };
      }
      // Return special marker for macro execution
      return { success: true, output: `__MACRO_RUN__${args[1]}` };
    }
    return { success: true, output: formatMacroHelp() };
  }

  // Schedule commands
  if (base === 'schedule') {
    if (args[0] === 'list' || args.length === 0) {
      return { success: true, output: formatScheduledList() };
    }
    if (args[0] === 'cancel' && args[1]) {
      // Find matching schedule by prefix
      const pending = getPendingCommands();
      const match = pending.find(s => s.id.startsWith(args[1]) || s.id.slice(0, 10) === args[1]);
      if (match) {
        cancelScheduled(match.id);
        return { success: true, output: `◉ Scheduled command cancelled: ${match.id.slice(0, 12)}` };
      }
      return { success: false, output: `▓ ERROR: Schedule '${args[1]}' not found` };
    }
    if (args[0] === 'clear') {
      const count = clearScheduled();
      return { success: true, output: `◉ Cancelled ${count} scheduled command(s)` };
    }
    // schedule <delay> <command>
    if (args[0] && args[1]) {
      const delay = args[0];
      const cmd = args.slice(1).join(' ');
      try {
        const executeAt = new Date(Date.now() + (parseInt(delay) * 1000 || 5000));
        return { 
          success: true, 
          output: `__SCHEDULE__${delay}__${cmd}`,
        };
      } catch (e) {
        return { success: false, output: `▓ ERROR: Invalid delay format: ${delay}` };
      }
    }
    return { success: true, output: formatScheduledList() };
  }

  // Watch commands
  if (base === 'watch') {
    if (args[0] === 'list' || args.length === 0) {
      return { success: true, output: '__WATCH_LIST__' };
    }
    if (args[0] === 'stop') {
      return { success: true, output: `__WATCH_STOP__${args[1] || 'all'}` };
    }
    // watch <interval> <command>
    if (args[0] && args[1]) {
      const interval = args[0];
      const cmd = args.slice(1).join(' ');
      return { success: true, output: `__WATCH_START__${interval}__${cmd}` };
    }
    return { success: true, output: '__WATCH_LIST__' };
  }

  // Audit commands
  if (base === 'audit') {
    if (args[0] === 'stats') {
      const stats = getSessionStats();
      return {
        success: true,
        output: `
┌─ SESSION STATISTICS ─────────────────────────────────────────
│
│  Session ID:    ${stats.session_id.substring(0, 20)}...
│  Commands Run:  ${stats.command_count}
│  Success Rate:  ${stats.success_rate.toFixed(1)}%
│  Total Time:    ${(stats.total_duration_ms / 1000).toFixed(1)}s
│  Avg Duration:  ${stats.avg_duration_ms.toFixed(0)}ms
│  Started:       ${stats.started_at.toLocaleTimeString()}
│
└──────────────────────────────────────────────────────────────`,
      };
    }
    if (args[0] === 'export') {
      return { success: true, output: `__AUDIT_EXPORT__` };
    }
    const limit = args[0] ? parseInt(args[0]) : 20;
    return { success: true, output: formatAuditLog(getLocalAuditLog(), limit) };
  }

  // Check if command requires a specific tier
  const cmdDef = ALL_COMMANDS.find(c => c.command.toLowerCase() === base);
  if (cmdDef) {
    const requiredTier = getCommandTier(cmdDef);
    const effectiveTier: CommandTier = userTier || (isOperator ? 'creator' : 'free');
    if (!meetsRequiredTier(effectiveTier, requiredTier)) {
      const tierLabel = getTierLabel(requiredTier);
      const currentLabel = getTierLabel(effectiveTier);
      return { 
        success: false, 
        output: `▓ ACCESS DENIED: ${tierLabel} tier required for '${base}'\n  Your tier: ${currentLabel}\n  Upgrade at cmpsbl.com/upgrade to unlock this command.\n  ${getRandomItem(PERSONALITY_RESPONSES.error)}` 
      };
    }
  }

  // ═══ BRIDGE-FIRST: Route through pf-substrate via registry handlers ═══
  // All module commands AND bare cognitive aliases go through the living substrate.
  const COGNITIVE_ALIASES = ['remember', 'recall', 'stream', 'discover', 'think', 'reflect', 'dream', 'synthesize', 'whoami', 'doctor'];
  if (base.includes('.') || COGNITIVE_ALIASES.includes(base)) {
    try {
      const { getHandler, hasHandler } = await import('@/lib/terminal/validate-registry');
      
      // Lazy-register all handlers once
      if (!hasHandler('core.status')) {
        const [
          { registerCoreHandlers },
          { registerSpineHandlers },
          { registerOCGHandlers },
          { registerInfraModuleHandlers },
          { registerEncodeModuleHandlers },
          { registerMeshHandlers },
          { registerEncodedHandlers },
          { registerPowerHandlers },
          { registerGovernanceHandlers },
          { registerObservabilityHandlers },
          { registerAnalyticsHandlers },
          { registerExecutionHandlers },
          { registerSEBAHandlers },
          { registerSynergyHandlers },
          { registerHardeningHandlers },
          { registerExpansionHandlers },
          { registerSystemAuditHandlers },
          { registerInfraHandlers },
        ] = await Promise.all([
          import('@/lib/terminal/core-handlers'),
          import('@/lib/terminal/spine-handlers'),
          import('@/lib/terminal/ocg-handlers'),
          import('@/lib/terminal/infra-module-handlers'),
          import('@/lib/terminal/encode-handlers'),
          import('@/lib/terminal/mesh-handlers'),
          import('@/lib/terminal/encoded-handlers'),
          import('@/lib/terminal/power-handlers'),
          import('@/lib/terminal/governance-handlers'),
          import('@/lib/terminal/observability-handlers'),
          import('@/lib/terminal/analytics-handlers'),
          import('@/lib/terminal/execution-handlers'),
          import('@/lib/terminal/seba-handlers'),
          import('@/lib/terminal/synergy-handlers'),
          import('@/lib/terminal/hardening-handlers'),
          import('@/lib/terminal/expansion-handlers'),
          import('@/lib/terminal/system-audit-handlers'),
          import('@/lib/terminal/infra-handlers'),
        ]);
        registerCoreHandlers();
        registerSpineHandlers();
        registerOCGHandlers();
        registerInfraModuleHandlers();
        registerEncodeModuleHandlers();
        registerMeshHandlers();
        registerEncodedHandlers();
        registerPowerHandlers();
        registerGovernanceHandlers();
        registerObservabilityHandlers();
        registerAnalyticsHandlers();
        registerExecutionHandlers();
        registerSEBAHandlers();
        registerSynergyHandlers();
        registerHardeningHandlers();
        registerExpansionHandlers();
        registerSystemAuditHandlers();
        registerInfraHandlers();
      }

      // Build structured args from positional arguments
      const structuredArgs: Record<string, unknown> = {};
      args.forEach((arg, i) => { structuredArgs[`arg${i}`] = arg; });
      if (args[0]) structuredArgs.input = args[0];
      if (args[1]) structuredArgs.type = args[1];
      if (args[2]) structuredArgs.confidence = args[2];
      structuredArgs._args = args;
      structuredArgs._raw = command;

      const handler = getHandler(base);
      if (handler) {
        const handlerResult = await handler(structuredArgs);
        const data = handlerResult as Record<string, unknown>;

        // If handler returned formatted output, use it directly
        if (data?.formatted && Array.isArray(data.formatted)) {
          return { success: true, output: (data.formatted as string[]).join('\n') };
        }

        // Governance-style output
        if (typeof data?.output === 'string' && data?.status) {
          return { success: data.status !== 'error', output: `◉ ${base}\n\n${data.output}` };
        }

        if (data?.success === false) {
          return { success: false, output: `▓ ${data.error || 'Command failed'}` };
        }

        return {
          success: true,
          output: `◉ ${base}\n\n${JSON.stringify(data?.data || data, null, 2)}`,
          data: data?.data || data,
        };
      }

      // ═══ AUTO-BRIDGE: No registered handler → route directly through pf-substrate ═══
      // This eliminates the need for the legacy if/else chain for dotted commands
      if (base.includes('.')) {
        const { callSubstrate } = await import('@/lib/terminal/substrate-bridge');
        const dotIdx = base.indexOf('.');
        const mod = base.slice(0, dotIdx);
        const action = base.slice(dotIdx + 1);
        const substrateResult = await callSubstrate(mod, action, structuredArgs);
        const subData = substrateResult as Record<string, unknown>;

        if (subData?.success === false) {
          // Substrate explicitly rejected — log for diagnostics, fall through to legacy
          if (debugMode.isEnabled()) {
            log.debug('terminal', `[auto-bridge] ${mod}/${action} returned success:false, trying legacy`, { error: subData?.error });
          }
        } else {
          // Use formatted output if substrate returned one
          const outputStr = typeof subData?.output === 'string'
            ? subData.output
            : JSON.stringify(subData?.data || subData, null, 2);
          return {
            success: true,
            output: `◉ ${base}\n\n${outputStr}`,
            data: subData?.data || subData,
          };
        }
      }

      // No handler and no substrate match — fall through to legacy chain
    } catch (bridgeErr) {
      // Bridge error — fall through to legacy chain
      if (debugMode.isEnabled()) {
        log.warn('terminal', `[bridge-first] Error for ${base}`, { error: bridgeErr instanceof Error ? bridgeErr.message : 'Unknown' });
      }
    }
  }

  // ═══ DEPRECATED LEGACY CHAIN ═══
  // These handlers are superseded by the bridge-first auto-route above.
  // They remain as fallback for: (1) commands where pf-substrate returns success:false,
  // (2) local-only commands (autoblog, matrix, patch, debug, alias, macro, schedule, watch).
  // Phase 5 will remove substrate-handled duplicates entirely.
  try {
    let result;

    // BRAIN module — REMOVED: All brain.* commands routed via bridge-first (spine-handlers.ts)
    // DECODE basic commands — REMOVED: decode.status/chat/intent/dream/propose/learn via bridge-first
    // Auto-bridge catches any remaining dotted commands via callSubstrate(mod, action).

    // DECODE Personality subsystem — LOCAL (uses in-memory personalityEngine, not pf-substrate)
    if (base === 'decode.personality.list') {
      const { personalityEngine } = await import('@/lib/substrate/decode');
      const profiles = personalityEngine.list();
      return {
        success: true,
        output: formatPersonalityList(profiles),
        data: profiles,
      };
    } else if (base === 'decode.personality.get') {
      const { personalityEngine } = await import('@/lib/substrate/decode');
      const { profile, state } = personalityEngine.get();
      return {
        success: true,
        output: formatPersonalityGet(profile, state),
        data: { profile, state },
      };
    } else if (base === 'decode.personality.set') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Profile required\n  Usage: decode.personality.set <profile>\n  Profiles: neutral, technical, concise, friendly, admin, exploratory' };
      }
      const { personalityEngine } = await import('@/lib/substrate/decode');
      try {
        const result = await personalityEngine.set(args[0] as any);
        return {
          success: true,
          output: `◈ Personality set: ${result.previous} → ${result.current}`,
          data: result,
        };
      } catch (e) {
        return { success: false, output: `▓ ERROR: ${(e as Error).message}` };
      }
    } else if (base === 'decode.personality.auto') {
      const { personalityEngine } = await import('@/lib/substrate/decode');
      const result = personalityEngine.enableAuto();
      return {
        success: true,
        output: `◈ Auto-detection enabled. Current profile: ${result.currentProfile}`,
        data: result,
      };
    } else if (base === 'decode.personality.lock') {
      const { personalityEngine } = await import('@/lib/substrate/decode');
      const result = personalityEngine.lock();
      return {
        success: true,
        output: `◈ Profile locked: ${result.profile} (auto-switching disabled)`,
        data: result,
      };
    } else if (base === 'decode.personality.unlock') {
      const { personalityEngine } = await import('@/lib/substrate/decode');
      const result = personalityEngine.unlock();
      return {
        success: true,
        output: `◈ Profile unlocked: ${result.profile} (auto-switching enabled)`,
        data: result,
      };
    } else if (base === 'decode.personality.detect') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Text required\n  Usage: decode.personality.detect <text>' };
      }
      const { personalityEngine } = await import('@/lib/substrate/decode');
      const text = args.join(' ');
      const result = personalityEngine.detect(text);
      return {
        success: true,
        output: formatPersonalityDetection(result),
        data: result,
      };
    } else if (base === 'decode.personality.interpret') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Text required\n  Usage: decode.personality.interpret <text>' };
      }
      const { personalityEngine } = await import('@/lib/substrate/decode');
      const text = args.join(' ');
      const result = personalityEngine.interpret(text);
      return {
        success: true,
        output: formatPersonalityInterpret(result),
        data: result,
      };
    } else if (base === 'decode.personality.reset') {
      const { personalityEngine } = await import('@/lib/substrate/decode');
      const result = await personalityEngine.reset();
      return {
        success: true,
        output: `◈ Personality reset to neutral. Auto-detection: enabled, Locked: false`,
        data: result,
      };
    }

    // DEFENSE, NEXUS, VISION, DREAM, SYSTEM substrate commands — REMOVED Phase 4.2
    // All routed via bridge-first auto-route (pf-substrate)

    // DEBUG MODE commands (kill-switch for background activity)
    else if (base === 'debug.on' || base === 'debug.enable') {
      debugMode.enable();
      const state = debugMode.getState();
      return {
        success: true,
        output: `
╔══════════════════════════════════════════════════════════════╗
║  🔴 DEBUG MODE ENABLED                                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  All background activity has been DISABLED:                  ║
║    ✓ polling-intervals      ✓ module-status-polling          ║
║    ✓ realtime-subscriptions ✓ learning-collector             ║
║    ✓ metrics-flush          ✓ background-writes              ║
║    ✓ auto-refresh           ✓ telemetry-log                  ║
║                                                              ║
║  Enabled at: ${state.enabledAt}                  ║
║                                                              ║
║  To test features one-by-one:                                 ║
║    debug.enable <feature>  — Enable single feature           ║
║    debug.batch <n>         — Enable batch 1-4                 ║
║                                                              ║
║  To re-enable all: debug.off                                  ║
║                                                              ║
║  IMPORTANT: Refresh the page to fully apply changes.         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
      };
    } else if (base === 'debug.off' || base === 'debug.disable') {
      debugMode.disable();
      return {
        success: true,
        output: `
╔══════════════════════════════════════════════════════════════╗
║  🟢 DEBUG MODE DISABLED                                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Background activity has been RE-ENABLED.                    ║
║                                                              ║
║  IMPORTANT: Refresh the page to fully restore features.      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
      };
    } else if (base === 'debug.batch') {
      const batchNum = parseInt(args[0] || '0');
      const batches: Record<number, string[]> = {
        1: ['polling-intervals'],
        2: ['polling-intervals', 'module-status-polling'],
        3: ['polling-intervals', 'module-status-polling', 'auto-refresh'],
        4: ['polling-intervals', 'module-status-polling', 'auto-refresh', 'realtime-subscriptions'],
      };
      
      if (!batches[batchNum]) {
        return {
          success: false,
          output: `
╔══════════════════════════════════════════════════════════════╗
║  DEBUG BATCH TESTING                                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Usage: debug.batch <1-4>                                     ║
║                                                              ║
║  Batches (cumulative — each adds to previous):               ║
║    1: polling-intervals (basic poll loops)                   ║
║    2: + module-status-polling (40 primitive status calls)          ║
║    3: + auto-refresh (dashboard auto-update)                 ║
║    4: + realtime-subscriptions (backend channels)            ║
║                                                              ║
║  Other features to test individually:                        ║
║    learning-collector, metrics-flush,                        ║
║    background-writes, telemetry-log                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
        };
      }
      
      (debugMode as any).enableOnly(batches[batchNum]);
      const state = debugMode.getState();
      const enabled = batches[batchNum];
      const disabled = state.disabledFeatures;
      
      return {
        success: true,
        output: `
╔══════════════════════════════════════════════════════════════╗
║  🟡 DEBUG BATCH ${batchNum} ENABLED                                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ENABLED (testing these):                                     ║
${enabled.map(f => `║    ✅ ${f.padEnd(50)}║`).join('\n')}
║                                                              ║
║  STILL DISABLED:                                              ║
${disabled.map(f => `║    ❌ ${f.padEnd(50)}║`).join('\n')}
║                                                              ║
║  If crashing returns, this batch contains the culprit.       ║
║  Refresh page to apply, then test stability.                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
      };
    } else if (base === 'debug.enable') {
      const feature = args[0];
      const allFeatures = debugMode.getAllFeatures();
      
      if (!feature || !allFeatures.includes(feature as any)) {
        return {
          success: false,
          output: `
╔══════════════════════════════════════════════════════════════╗
║  ENABLE SINGLE FEATURE                                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Usage: debug.enable <feature>                                ║
║                                                              ║
║  Available features:                                          ║
${allFeatures.map(f => `║    • ${f.padEnd(50)}║`).join('\n')}
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
        };
      }
      
      debugMode.enableFeature(feature as any);
      const state = debugMode.getState();
      
      return {
        success: true,
        output: `
╔══════════════════════════════════════════════════════════════╗
║  ✅ ENABLED: ${feature.padEnd(43)}║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Still disabled:                                              ║
${state.disabledFeatures.length > 0 
  ? state.disabledFeatures.map(f => `║    ❌ ${f.padEnd(50)}║`).join('\n')
  : '║    (none — debug mode fully disabled)                    ║'}
║                                                              ║
║  Refresh page to apply changes.                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
      };
    } else if (base === 'debug.disable') {
      const feature = args[0];
      const allFeatures = debugMode.getAllFeatures();
      
      if (!feature) {
        // No argument = disable debug mode entirely
        debugMode.disable();
        return {
          success: true,
          output: `
╔══════════════════════════════════════════════════════════════╗
║  🟢 DEBUG MODE DISABLED                                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Background activity has been RE-ENABLED.                    ║
║                                                              ║
║  IMPORTANT: Refresh the page to fully restore features.      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
        };
      }
      
      if (!allFeatures.includes(feature as any)) {
        return {
          success: false,
          output: `Unknown feature: ${feature}. Use 'debug' to see available features.`
        };
      }
      
      debugMode.disableFeature(feature as any);
      const state = debugMode.getState();
      
      return {
        success: true,
        output: `
╔══════════════════════════════════════════════════════════════╗
║  ❌ DISABLED: ${feature.padEnd(42)}║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Currently disabled:                                          ║
${state.disabledFeatures.map(f => `║    ❌ ${f.padEnd(50)}║`).join('\n')}
║                                                              ║
║  Refresh page to apply changes.                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
      };
    } else if (base === 'debug.status' || base === 'debug') {
      const state = debugMode.getState();
      const allFeatures = debugMode.getAllFeatures();
      const statusIcon = state.enabled ? '🔴' : '🟢';
      const statusText = state.enabled ? 'ACTIVE (background disabled)' : 'INACTIVE (normal operation)';
      const enabledFeatures = allFeatures.filter(f => !state.disabledFeatures.includes(f));
      
      return {
        success: true,
        output: `
╔══════════════════════════════════════════════════════════════╗
║  ${statusIcon} DEBUG MODE: ${statusText.padEnd(35)}║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Feature Status:                                              ║
${allFeatures.map(f => {
  const isEnabled = !state.disabledFeatures.includes(f);
  const icon = isEnabled ? '✅' : '❌';
  return `║    ${icon} ${f.padEnd(50)}║`;
}).join('\n')}
║                                                              ║
║  Commands:                                                   ║
║    debug.on              — Disable ALL background            ║
║    debug.off             — Enable ALL background             ║
║    debug.batch <1-4>     — Enable features in batches        ║
║    debug.enable <feat>   — Enable single feature             ║
║    debug.disable <feat>  — Disable single feature            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`
      };
    }
    // Module Registry commands
    else if (base === 'system.modules') {
      const full = args.includes('--full');
      const health = args.includes('--health');
      const dag = args.includes('--dag');
      const roles = args.includes('--roles');
      const boot = args.includes('--boot');
      const inventory = args.includes('--inventory');
      result = await system.modules({ full, health, dag, roles, boot, inventory });
    } else if (base === 'system.module') {
      result = await system.module(args[0] || '');
    }
    // Capability Auto-Adapt System
    else if (base === 'system.scan_adapt') {
      const { runScanAdapt, getManifest, listCapabilities, getCapability } = await import('@/lib/capabilities');
      
      const dryRun = !args.includes('--confirm');
      const pruneUnused = args.includes('--prune-unused');
      const verbose = args.includes('--verbose');
      
      const scanResult = runScanAdapt({ dryRun, confirm: !dryRun, pruneUnused, verbose });
      
      let output = `
┌─ EDGE FUNCTION SCAN & ADAPT ─────────────────────────────────
│ Mode: ${scanResult.mode.toUpperCase()}   Timestamp: ${scanResult.timestamp}
├──────────────────────────────────────────────────────────────
│ Findings: ${scanResult.findings.length}
│ Adapted: ${scanResult.adaptedCount}   Deleted: ${scanResult.deletedCount}   Blocked: ${scanResult.blockedCount}
│`;

      for (const finding of scanResult.findings) {
        output += `
├─ ${finding.name}
│  Path: ${finding.path}
│  Overlap: ${finding.overlap}${finding.overlap === 'FULL' ? ' ⚠️ DELETE RECOMMENDED' : ''}
│  Modules: ${finding.mergedLocations.join(', ') || 'NONE'}
│  Reason: ${finding.reason}
│  Metadata: ${finding.hasMetadata ? '✓ Valid' : '✗ Missing'}`;
      }

      if (scanResult.errors.length > 0) {
        output += `
├─ ERRORS:`;
        for (const err of scanResult.errors) {
          output += `
│  ✗ ${err}`;
        }
      }

      output += `
└──────────────────────────────────────────────────────────────`;

      if (dryRun) {
        output += `

  Dry-run complete. Use --confirm to apply safe adaptations.
  Use --prune-unused to suggest deletions.`;
      }

      result = { success: true, data: scanResult };
      return { success: true, output, data: scanResult };
    }
    else if (base === 'system.capabilities') {
      const { listCapabilities } = await import('@/lib/capabilities');
      
      let filter: { status?: 'active' | 'deprecated' } | undefined;
      if (args.includes('--active')) filter = { status: 'active' };
      else if (args.includes('--deprecated')) filter = { status: 'deprecated' };
      
      const caps = listCapabilities(filter);
      
      let output = `
┌─ REGISTERED CAPABILITIES ────────────────────────────────────
│ Total: ${caps.length}   Filter: ${filter?.status || 'ALL'}
├──────────────────────────────────────────────────────────────`;

      for (const cap of caps) {
        output += `
│ ${cap.status === 'active' ? '●' : '○'} ${cap.id}
│   Source: ${cap.source}   Risk: ${cap.risk}   Invokes: ${cap.invokeCount}`;
      }

      output += `
└──────────────────────────────────────────────────────────────`;

      return { success: true, output, data: caps };
    }
    else if (base === 'system.capability') {
      const { getCapability } = await import('@/lib/capabilities');
      
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Capability ID required\\n  Usage: system.capability <id>' };
      }
      
      const cap = getCapability(args[0]);
      if (!cap) {
        return { success: false, output: `▓ Capability '${args[0]}' not found in registry` };
      }
      
      const output = `
┌─ CAPABILITY: ${cap.id} ──────────────────────────────────────
│ Name: ${cap.name}
│ Status: ${cap.status}
│ Source: ${cap.source}
│ Modules: ${cap.modules.join(', ')}
│ Risk: ${cap.risk}
│ Reversible: ${cap.reversible ? 'Yes' : 'No'}
│ Description: ${cap.description}
├──────────────────────────────────────────────────────────────
│ Edge Path: ${cap.edgeFunctionPath || 'N/A'}
│ Registered: ${cap.registeredAt}
│ Last Invoked: ${cap.lastInvokedAt || 'Never'}
│ Invoke Count: ${cap.invokeCount}
│ Confidence: ${(cap.confidence * 100).toFixed(1)}%
└──────────────────────────────────────────────────────────────`;

      return { success: true, output, data: cap };
    }

    // EVOLUTION + CORE substrate commands — REMOVED Phase 4.2
    // All evolution.*, modernizer.*, core.* routed via bridge-first auto-route (pf-substrate)


    // RIPPLE, ACCESS, INTEGRATION, CORTEX, SYNERGY, INCLUSIVE substrate commands — REMOVED Phase 4.2
    // All routed via bridge-first auto-route (pf-substrate)


    // ═══════════════════════════════════════════════════════════════
    // DECODE INBOX — CLM reports from ALL modules
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'decode.inbox') {
      try {
        const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
        const feed = await moduleCLM.getFeed(args[0] ? parseInt(args[0]) : 50);
        
        if (feed.length === 0) {
          return {
            success: true,
            output: `╔══════════════════════════════════════════════════════════════╗
║  DECODE INBOX — Module Intelligence Feed                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  No CLM reports yet. Run 'clm.run_all' to generate.         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`,
          };
        }
        
        let output = `╔══════════════════════════════════════════════════════════════╗
║  DECODE INBOX — ${String(feed.length).padEnd(3)} Reports from ${ALL_EXECUTION_SURFACES.length} Modules               ║
╠══════════════════════════════════════════════════════════════╣\n`;
        
        for (const r of feed.slice(0, 20)) {
          const mod = r.moduleId.toUpperCase().padEnd(12);
          const pri = r.priority === 'critical' ? '🔴' : r.priority === 'high' ? '🟠' : r.priority === 'medium' ? '🟡' : '🟢';
          const conf = `${(r.confidence * 100).toFixed(0)}%`;
          output += `║  ${pri} [${mod}] ${r.title.substring(0, 35).padEnd(35)} ${conf.padEnd(4)} ║\n`;
        }
        
        if (feed.length > 20) {
          output += `║  ... and ${feed.length - 20} more reports                                ║\n`;
        }
        output += `╠══════════════════════════════════════════════════════════════╣
║  Commands: clm.run_all | clm.run <module> | decode.inbox     ║
╚══════════════════════════════════════════════════════════════╝`;
        
        return { success: true, output, data: feed };
      } catch (err) {
        return { success: false, output: `▓ Inbox error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // MCLM — Module-specific CLM (mclm.status, mclm.run, mclm.run.all, mclm.feed)
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'mclm.status') {
      try {
        const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
        const statesObj: Record<string, any> = {};
        for (const mod of ALL_EXECUTION_SURFACES) {
          statesObj[mod.key] = moduleCLM.getModuleState?.(mod.key as any) || {};
        }
        let output = `╔══════════════════════════════════════════════════════════════╗\n║  MODULE CLM STATUS — ${ALL_EXECUTION_SURFACES.length} Modules                               ║\n╠══════════════════════════════════════════════════════════════╣\n`;
        for (const mod of ALL_EXECUTION_SURFACES) {
          const s = statesObj[mod.key] || {};
          const icon = s.enabled ? '🟢' : '⚫';
          output += `║  ${icon} ${mod.label.padEnd(14)} [${mod.layer.substring(0, 5).padEnd(5)}]  cycles: ${String(s.cycles || 0).padEnd(3)} ║\n`;
        }
        output += `╚══════════════════════════════════════════════════════════════╝`;
        return { success: true, output, data: statesObj };
      } catch (err) {
        return { success: false, output: `▓ MCLM status error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'mclm.run') {
      const moduleArg = args[0]?.toLowerCase();
      if (!moduleArg) {
        return { success: false, output: '▓ Usage: mclm.run <module>\n  Example: mclm.run brain' };
      }
      try {
        const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
        const analysis = await moduleCLM.runModuleLearning(moduleArg as any);
        if (!analysis) {
          return { success: true, output: `◉ MCLM cycle for ${moduleArg.toUpperCase()} — no new insights` };
        }
        return { success: true, output: `◉ MCLM ${moduleArg.toUpperCase()}: ${analysis.title}\n  Type: ${analysis.analysisType}  Confidence: ${(analysis.confidence * 100).toFixed(0)}%`, data: analysis };
      } catch (err) {
        return { success: false, output: `▓ MCLM run error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'mclm.run.all') {
      try {
        const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
        const results = await moduleCLM.runAllModuleLearning();
        return { success: true, output: `◉ MCLM run all complete — ${results.length} insights generated across ${ALL_EXECUTION_SURFACES.length} modules`, data: results };
      } catch (err) {
        return { success: false, output: `▓ MCLM run all error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'mclm.feed') {
      try {
        const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
        const feed = await moduleCLM.getFeed(args[0] ? parseInt(args[0]) : 20);
        if (feed.length === 0) {
          return { success: true, output: '◉ MCLM feed is empty — run mclm.run.all to generate' };
        }
        let output = `┌─ MCLM INTELLIGENCE FEED (${feed.length}) ──────────────────────────\n│\n`;
        for (const r of feed.slice(0, 15)) {
          output += `│  ${r.moduleId.toUpperCase().padEnd(12)} ${r.title.substring(0, 40).padEnd(40)} ${(r.confidence * 100).toFixed(0)}%\n`;
        }
        output += `│\n└──────────────────────────────────────────────────────────────`;
        return { success: true, output, data: feed };
      } catch (err) {
        return { success: false, output: `▓ MCLM feed error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // CLM.RUN_ALL — Run CLM for ALL modules
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'clm.run_all') {
      try {
        const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
        const results = await moduleCLM.runAllModuleLearning();
        
        let output = `╔══════════════════════════════════════════════════════════════╗
║  CLM — All Module Learning Complete                           ║
╠══════════════════════════════════════════════════════════════╣
║  Modules analyzed: ${String(results.length).padEnd(2)} / 38                                   ║
╠══════════════════════════════════════════════════════════════╣\n`;
        
        for (const r of results) {
          const mod = r.moduleId.toUpperCase().padEnd(12);
          const conf = `${(r.confidence * 100).toFixed(0)}%`;
          output += `║  ✓ ${mod} ${r.title.substring(0, 35).padEnd(35)} ${conf.padEnd(4)} ║\n`;
        }
        
        if (results.length === 0) {
          output += `║  No new insights generated. Modules are stable.              ║\n`;
        }
        
        output += `╚══════════════════════════════════════════════════════════════╝`;
        return { success: true, output, data: results };
      } catch (err) {
        return { success: false, output: `▓ CLM run_all error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // CLM.RUN <module> — Run CLM for a single module
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'clm.run') {
      const moduleArg = args[0]?.toLowerCase();
      const validModules = ALL_EXECUTION_SURFACES.map(m => m.key);
      
      if (!moduleArg || !validModules.includes(moduleArg)) {
        // Group by layer for display
        const layers = [...new Set(ALL_EXECUTION_SURFACES.map(m => m.layer))];
        let moduleList = '';
        for (const layer of layers) {
          const mods = ALL_EXECUTION_SURFACES.filter(m => m.layer === layer).map(m => m.key);
          moduleList += `\n  ├─ ${layer.toUpperCase()} ──────────────────────────────────────────\n  │  ${mods.join(', ')}`;
        }
        moduleList += `\n  └───────────────────────────────────────────────────`;
        
        return {
          success: false,
          output: `▓ Usage: clm.run <module>\n\n  Available modules (${validModules.length}):${moduleList}`,
        };
      }
      
      try {
        const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
        const analysis = await moduleCLM.runModuleLearning(moduleArg as any);
        
        if (!analysis) {
          return {
            success: true,
            output: `◉ CLM cycle for ${moduleArg.toUpperCase()} — no new insights (module may be learning or stable)`,
          };
        }
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  CLM — ${moduleArg.toUpperCase().padEnd(12)} Learning Complete                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Title:      ${analysis.title.substring(0, 45).padEnd(45)} ║
║  Type:       ${analysis.analysisType.padEnd(45)} ║
║  Confidence: ${((analysis.confidence * 100).toFixed(0) + '%').padEnd(45)} ║
║  Priority:   ${analysis.priority.padEnd(45)} ║
║                                                              ║
║  ${analysis.content.substring(0, 58).padEnd(58)} ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`,
          data: analysis,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM run error for ${moduleArg}: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // CLM (Constant Learning Mode)
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'clm.status') {
      try {
        const { getCLMStatus } = await import('@/lib/substrate/clm');
        const status = await getCLMStatus();
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  CONSTANT LEARNING MODE                                       ║
╠══════════════════════════════════════════════════════════════╣
║  Status:      ${status.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}                                    ║
║  Kill Switch: ${status.kill_switch ? '🛑 ACTIVE' : '✅ OFF'}                                      ║
║  Budget Used: ${((status.budget_used / status.budget_total) * 100).toFixed(0)}% (${status.budget_used}/${status.budget_total} tokens)              ║
║  Topics:      ${status.topics_count} in bank                                  ║
║  Queue:       ${status.review_queue_size} items pending review                      ║
╚══════════════════════════════════════════════════════════════╝`,
          data: status,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM not initialized or error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.enable') {
      try {
        const { enableCLM } = await import('@/lib/substrate/clm');
        await enableCLM();
        return { success: true, output: '◉ Constant Learning Mode ENABLED — autonomous learning active' };
      } catch (err) {
        return { success: false, output: `▓ Failed to enable CLM: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.disable') {
      try {
        const { disableCLM } = await import('@/lib/substrate/clm');
        await disableCLM();
        return { success: true, output: '◉ Constant Learning Mode DISABLED' };
      } catch (err) {
        return { success: false, output: `▓ Failed to disable CLM: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.cycle') {
      try {
        const { runCLMCycle } = await import('@/lib/substrate/clm');
        const result = await runCLMCycle();
        if (!result) {
          return { success: false, output: '▓ CLM cycle returned no result — check if CLM is enabled' };
        }
        return { 
          success: result.success, 
          output: result.success 
            ? `◉ CLM cycle complete — topic: ${result.topic || 'unknown'}, ${result.unitsUsed || 0} units used` 
            : `▓ CLM cycle failed: ${result.error || 'Unknown error'}`,
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM cycle error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.kill_switch') {
      const action = args[0];
      if (!action || !['on', 'off'].includes(action)) {
        return { success: false, output: '▓ ERROR: Specify on or off\n  Usage: clm.kill_switch <on|off>' };
      }
      try {
        if (action === 'on') {
          const { activateKillSwitch } = await import('@/lib/substrate/clm');
          await activateKillSwitch();
          return { success: true, output: '🛑 CLM Kill Switch ACTIVATED — all learning halted' };
        } else {
          const { deactivateKillSwitch } = await import('@/lib/substrate/clm');
          await deactivateKillSwitch();
          return { success: true, output: '✅ CLM Kill Switch deactivated — learning resumed' };
        }
      } catch (err) {
        return { success: false, output: `▓ Kill switch error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.budget') {
      try {
        const { budgetGovernor } = await import('@/lib/substrate/clm');
        const status = budgetGovernor.getStatus();
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  CLM BUDGET GOVERNOR                                         ║
╠══════════════════════════════════════════════════════════════╣
║  Daily Budget:  ${status.daily_limit.toLocaleString()} tokens                           ║
║  Used Today:    ${status.used_today.toLocaleString()} tokens (${((status.used_today / status.daily_limit) * 100).toFixed(1)}%)                    ║
║  Remaining:     ${status.remaining.toLocaleString()} tokens                           ║
║  Rate Limit:    ${status.calls_per_hour}/hr                                   ║
║  Reset Time:    ${status.reset_time}                                ║
╚══════════════════════════════════════════════════════════════╝`,
          data: status,
        };
      } catch (err) {
        return { success: false, output: `▓ Budget error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.topics') {
      try {
        const { topicBank } = await import('@/lib/substrate/clm');
        const topics = topicBank.getTopics();
        const lines = ['╔══════════════════════════════════════════════════════════════╗'];
        lines.push('║  CLM TOPIC BANK                                              ║');
        lines.push('╠══════════════════════════════════════════════════════════════╣');
        for (const topic of topics.slice(0, 15)) {
          const mastery = `${(topic.mastery * 100).toFixed(0)}%`.padEnd(5);
          const name = topic.name.substring(0, 40).padEnd(40);
          lines.push(`║  ${mastery} ${name}     ║`);
        }
        if (topics.length > 15) {
          lines.push(`║  ... and ${topics.length - 15} more topics                               ║`);
        }
        lines.push('╚══════════════════════════════════════════════════════════════╝');
        return { success: true, output: lines.join('\n'), data: topics };
      } catch (err) {
        return { success: false, output: `▓ Topics error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.review_queue') {
      try {
        const { spacedRepetition } = await import('@/lib/substrate/clm');
        const queue = spacedRepetition.getQueue();
        if (queue.length === 0) {
          return { success: true, output: '◉ Review queue is empty — all caught up!' };
        }
        const lines = ['╔══════════════════════════════════════════════════════════════╗'];
        lines.push('║  SPACED REPETITION QUEUE                                     ║');
        lines.push('╠══════════════════════════════════════════════════════════════╣');
        for (const item of queue.slice(0, 10)) {
          const due = item.next_review ? new Date(item.next_review).toLocaleDateString() : 'Now';
          lines.push(`║  📚 ${item.topic.substring(0, 35).padEnd(35)} Due: ${due.padEnd(10)} ║`);
        }
        lines.push('╚══════════════════════════════════════════════════════════════╝');
        return { success: true, output: lines.join('\n'), data: queue };
      } catch (err) {
        return { success: false, output: `▓ Queue error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.add_topic') {
      if (args.length < 2) {
        return { success: false, output: '▓ ERROR: Missing arguments\n  Usage: clm.add_topic <topic> <category>\n  Categories: core_curriculum, gap_detection, spaced_repetition, deep_dive' };
      }
      const topicName = args[0];
      const category = args[1] as any;
      try {
        const { topicBank } = await import('@/lib/substrate/clm');
        const topic = topicBank.addTopic(topicName, category);
        return {
          success: true,
          output: `◉ Topic added to CLM bank: "${topic.name}" (${topic.category})`,
          data: topic,
        };
      } catch (err) {
        return { success: false, output: `▓ Failed to add topic: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.next_review') {
      try {
        const { spacedRepetition } = await import('@/lib/substrate/clm');
        const next = spacedRepetition.getNextDueTopic();
        if (!next) {
          return { success: true, output: '◉ No items due for review — all caught up!' };
        }
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  NEXT REVIEW ITEM                                            ║
╠══════════════════════════════════════════════════════════════╣
║  Topic:      ${next.name.substring(0, 45).padEnd(45)} ║
║  Confidence: ${((next.confidenceLevel || 0) * 100).toFixed(0)}%                                           ║
║  Studied:    ${next.studyCount || 0} times                                        ║
╚══════════════════════════════════════════════════════════════╝`,
          data: next,
        };
      } catch (err) {
        return { success: false, output: `▓ Next review error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SEBA (Self-Evolving Bounded Agent)
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'seba.status') {
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('status');
        if (!result.success) {
          return { success: false, output: `▓ SEBA error: ${result.message}` };
        }
        const data = result.data as { state: any; config: any };
        const state = data?.state || {};
        const config = data?.config || {};
        const modeIcon = config.enabled ? '🟢' : '🔴';
        const phaseIcon = state.current_phase === 'idle' ? '⚪' : state.current_phase === 'complete' ? '✅' : '🔄';
        const lastCycle = state.last_cycle_at ? new Date(state.last_cycle_at).toISOString() : 'Never';
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  SEBA — Full Spectrum Autonomy                                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Mode:        ${(config.mode || 'advisory').padEnd(46)}║
║  Phase:       ${phaseIcon} ${(state.current_phase || 'idle').padEnd(44)}║
║  Health:      ${String(state.agent_health || 100).padEnd(3)}%                                           ║
║  Last Cycle:  ${lastCycle.padEnd(46)}║
║  Proposals:   pending: ${String(state.pending_proposals || 0).padEnd(3)} | approved: ${String(state.approved_proposals || 0).padEnd(3)} | applied: ${String(state.executed_proposals || state.evolutions_applied || 0).padEnd(3)} ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  CYCLE STATS                                                 ║
║  Total:      ${String(state.total_cycles || 0).padEnd(5)} cycles                                   ║
║  Successful: ${String(state.successful_cycles || 0).padEnd(5)}                                          ║
║  Failed:     ${String(state.failed_cycles || 0).padEnd(5)}                                          ║
║  Blocked:    ${String(state.blocked_cycles || 0).padEnd(5)}                                          ║
╠══════════════════════════════════════════════════════════════╣
║  THRESHOLDS                                                  ║
║  Auto-approve: ≥${(state.auto_approve_threshold || 0.85).toFixed(2)} confidence                        ║
║  Risk tolerance: ${(state.risk_tolerance || 'low').toUpperCase().padEnd(42)}║
╚══════════════════════════════════════════════════════════════╝`,
          data: result.data,
        };
      } catch (err) {
        return { success: false, output: `▓ SEBA not initialized or error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.enable') {
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        await sebaAgent.handleCommand('enable');
        return { success: true, output: '◉ SEBA ENABLED — bounded autonomy active' };
      } catch (err) {
        return { success: false, output: `▓ Enable error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.disable') {
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        await sebaAgent.handleCommand('disable');
        return { success: true, output: '◉ SEBA DISABLED' };
      } catch (err) {
        return { success: false, output: `▓ Disable error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.mode') {
      const mode = args[0];
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('mode', mode ? { mode } : undefined);
        if (!result.success) {
          return { 
            success: false, 
            output: `▓ ${result.message}\n  Valid modes: off, observe, advisory, governed`,
          };
        }
        return { success: true, output: `◉ ${result.message}`, data: result.data };
      } catch (err) {
        return { success: false, output: `▓ Mode error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.cycle') {
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('cycle');
        if (!result.success) {
          return { success: false, output: `▓ Cycle failed: ${result.message}` };
        }
        const cycleData = result.data as any;
        const proposalsGenerated = cycleData?.proposals_generated || 0;
        const evolutionsApplied = cycleData?.evolutions_applied || 0;
        
        if (proposalsGenerated === 0) {
          return {
            success: true,
            output: `╔══════════════════════════════════════════════════════════════╗
║  ✅ CYCLE COMPLETE                                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Phase: COGNITIVE ANALYSIS                                   ║
║                                                              ║
║  Engines Scanned: ${ALL_EXECUTION_SURFACES.length}                                         ║
║    ✅ Memory    ✅ Learning    ✅ Imagination                ║
║    ✅ Reasoning ✅ Security    ✅ Telemetry                  ║
║    ✅ Governance ✅ Resources  ✅ Architecture               ║
║                                                              ║
║  Insights Found: 0                                           ║
║  No actionable insights found.                               ║
║  System is operating optimally.                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`,
            data: result.data,
          };
        }
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  ✅ CYCLE COMPLETE                                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  New Proposals: ${String(proposalsGenerated).padEnd(44)}║
║  Auto-Applied:  ${String(evolutionsApplied).padEnd(44)}║
║                                                              ║
║  Status: pending_review (awaiting governance)                ║
║                                                              ║
║  Use seba.review to see pending proposals.                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`,
          data: result.data,
        };
      } catch (err) {
        return { success: false, output: `▓ Cycle error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.propose') {
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('propose');
        if (!result.success) {
          return { success: false, output: `▓ Propose failed: ${result.message}` };
        }
        const data = result.data as any;
        const proposals = data?.proposals || [];
        
        if (proposals.length === 0) {
          return {
            success: true,
            output: `╔══════════════════════════════════════════════════════════════╗
║  🔬 PROPOSAL GENERATION                                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Insights analyzed: ${String(data?.insights || 0).padEnd(40)}║
║  Proposals created: 0                                        ║
║                                                              ║
║  No actionable insights found. System is healthy.            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`,
            data: result.data,
          };
        }
        
        let output = `╔══════════════════════════════════════════════════════════════╗
║  🔬 PROPOSAL GENERATION                                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Generated ${String(proposals.length).padEnd(2)} proposals from ${String(data?.insights || 0).padEnd(2)} insights                     ║
║                                                              ║\n`;
        
        for (const p of proposals.slice(0, 5)) {
          output += `║  • ${(p.title || 'Untitled').substring(0, 54).padEnd(56)}║
║    ID: ${(p.id || 'unknown').padEnd(12)} | Risk: ${(p.risk || 'low').padEnd(8)} | Conf: ${((p.confidence || 0) * 100).toFixed(0)}%       ║
║                                                              ║\n`;
        }
        
        output += `║  Use seba.review to see full details.                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
        
        return { success: true, output, data: result.data };
      } catch (err) {
        return { success: false, output: `▓ Propose error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.review') {
      try {
        // Use ProposalStore directly for accurate pending list
        const { ProposalStore } = await import('@/lib/substrate/seba/proposal-store');
        const pending = await ProposalStore.getPending();
        
        if (pending.length === 0) {
          return { 
            success: true, 
            output: `╔══════════════════════════════════════════════════════════════╗
║  📋 PENDING PROPOSALS                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  No pending proposals.                                       ║
║                                                              ║
║  Run seba.cycle to generate new proposals.                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`,
          };
        }
        
        let output = `╔═══════════════════════════════════════════════════════════════════╗
║  📋 PENDING PROPOSALS                                              ║
╠═══════════════════════════════════════════════════════════════════╣\n`;
        
        for (const p of pending.slice(0, 5)) {
          const shortId = p.id?.substring(0, 8) || 'unknown';
          const fullId = p.id || 'unknown';
          const title = p.title || 'Untitled';
          const confidence = typeof p.confidence === 'number' ? (p.confidence * 100).toFixed(0) : 'N/A';
          const risk = (p.expected_impact as any)?.risk_level || 'low';
          const execPhase = (p.expected_impact as any)?.execution_phase || 'pending';
          
          // Mobile-friendly: Full ID on separate line
          output += `║                                                                   ║
║  Short ID: ${shortId.padEnd(55)}║
║  Full ID:                                                         ║
║    ${fullId.padEnd(63)}║
║                                                                   ║
║  Title: ${title.substring(0, 58).padEnd(59)}║
║  Status: ${(p.status || 'pending').padEnd(14)} | Phase: ${execPhase.padEnd(20)}       ║
║  Risk: ${risk.padEnd(10)} | Confidence: ${confidence}%                            ║
║                                                                   ║
║  Commands:                                                        ║
║    seba.approve ${fullId}                                         ║
║    seba.reject ${fullId}                                          ║
║    seba.execute ${fullId}                                         ║
╠───────────────────────────────────────────────────────────────────╣\n`;
        }
        
        if (pending.length > 5) {
          output += `║                                                                   ║
║  Showing 5 of ${String(pending.length).padEnd(2)} proposals.                                       ║\n`;
        }
        
        output += `╚═══════════════════════════════════════════════════════════════════╝`;
        
        return { success: true, output, data: { pending_count: pending.length, proposals: pending } };
      } catch (err) {
        return { success: false, output: `▓ Review error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.approve') {
      const proposalId = args[0];
      if (!proposalId) {
        return { success: false, output: '▓ ERROR: Proposal ID required\n  Usage: seba.approve <proposal_id>' };
      }
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('approve', { proposal_id: proposalId });
        return { success: result.success, output: result.success ? `◉ ${result.message}` : `▓ ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Approve error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.reject') {
      const proposalId = args[0];
      if (!proposalId) {
        return { success: false, output: '▓ ERROR: Proposal ID required\n  Usage: seba.reject <proposal_id>' };
      }
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('reject', { proposal_id: proposalId });
        return { success: result.success, output: result.success ? `◉ ${result.message}` : `▓ ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Reject error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.execute') {
      const proposalId = args[0];
      const phase = args[1]; // Optional: 'shadow' or 'production'
      if (!proposalId) {
        return { 
          success: false, 
          output: `▓ ERROR: Proposal ID required
  Usage: seba.execute <proposal_id> [phase]
  
  Phases:
    (default)  — Apply to shadow environment first
    production — Apply to production (after shadow)
  
  Example:
    seba.execute abc12345           — shadow first
    seba.execute abc12345 production — then production` 
        };
      }
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('execute', { 
          proposal_id: proposalId,
          phase: phase || undefined,
        });
        // The agent returns a nicely formatted message, just display it
        return { success: result.success, output: result.success ? `${result.message}` : `▓ ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Execute error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.rollback') {
      const executionId = args[0];
      if (!executionId) {
        return { success: false, output: '▓ ERROR: Proposal/Execution ID required\n  Usage: seba.rollback <proposal_id>' };
      }
      try {
        const { ProposalStore } = await import('@/lib/substrate/seba/proposal-store');
        const { sebaAgent } = await import('@/lib/substrate/seba');
        // Mark proposal as rolled_back in DB
        await ProposalStore.markRolledBack(executionId, 'Manual rollback via terminal');
        const result = await sebaAgent.handleCommand('rollback', { execution_id: executionId });
        return { success: result.success, output: result.success ? `◉ ${result.message}` : `▓ ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Rollback error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.pause') {
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('pause');
        return { success: result.success, output: result.success ? `◉ ${result.message}` : `▓ ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Pause error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.resume') {
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('resume');
        return { success: result.success, output: result.success ? `◉ ${result.message}` : `▓ ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Resume error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.config') {
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        // Check if setting a value
        if (args.length > 0 && args[0].includes('=')) {
          const [key, value] = args[0].split('=');
          const updates: Record<string, unknown> = {};
          updates[key] = isNaN(Number(value)) ? value : Number(value);
          const result = await sebaAgent.handleCommand('config', { updates });
          return { success: result.success, output: result.success ? `◉ Config updated: ${key} = ${value}` : `▓ ${result.message}` };
        }
        
        const result = await sebaAgent.handleCommand('config');
        const data = result.data as any;
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  SEBA CONFIGURATION                                          ║
╠══════════════════════════════════════════════════════════════╣
║  mode:                    ${(data?.mode || 'advisory').padEnd(12)}                    ║
║  enabled:                 ${String(data?.enabled ?? true).padEnd(12)}                    ║
║  auto_approve_threshold:  ${String(data?.auto_approve_threshold || 0.85).padEnd(12)}                    ║
║  risk_tolerance:          ${(data?.risk_tolerance || 'low').padEnd(12)}                    ║
╚══════════════════════════════════════════════════════════════╝`,
          data: result.data,
        };
      } catch (err) {
        return { success: false, output: `▓ Config error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.thresholds') {
      const key = args[0];
      const value = args[1];
      
      if (!key) {
        return {
          success: true,
          output: `◉ SEBA THRESHOLDS
  Usage: seba.thresholds <key> <value>
  
  Available thresholds:
    auto_approve <0.0-1.0>  — Minimum confidence for auto-approval (default: 0.85)
    risk <level>            — Maximum risk: minimal, low, medium, high (default: low)
    
  Example: seba.thresholds auto_approve 0.9`,
        };
      }
      
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('thresholds', { [key]: key === 'auto_approve' ? parseFloat(value) : value });
        return { success: result.success, output: result.success ? `◉ ${result.message}` : `▓ ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Thresholds error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.history') {
      const limit = parseInt(args[0]) || 10;
      try {
        const { sebaAgent } = await import('@/lib/substrate/seba');
        const result = await sebaAgent.handleCommand('history', { limit });
        if (!result.success) {
          return { success: false, output: `▓ History error: ${result.message}` };
        }
        
        const data = result.data as any;
        const events = data?.events || [];
        
        if (events.length === 0) {
          return { 
            success: true, 
            output: `╔══════════════════════════════════════════════════════════════╗
║  📜 SEBA EVOLUTION HISTORY                                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  No evolution history found.                                 ║
║                                                              ║
║  Run seba.cycle to start generating history.                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`,
          };
        }
        
        let output = `╔══════════════════════════════════════════════════════════════╗
║  📜 SEBA EVOLUTION HISTORY                                    ║
╠══════════════════════════════════════════════════════════════╣\n`;
        
        for (const event of events.slice(0, limit)) {
          const icon = event.outcome === 'success' ? '✅' : event.outcome === 'error' ? '❌' : '⚠️';
          const timestamp = new Date(event.created_at).toLocaleString();
          const eventType = event.event_type || 'unknown';
          const eventData = event.data || {};
          const target = eventData.target || eventData.proposal_id?.substring(0, 8) || '';
          
          output += `║                                                              ║
║  ${timestamp.padEnd(30)} | ${event.outcome?.toUpperCase()?.padEnd(10) || 'UNKNOWN  '}      ║
║  ${icon} [${eventType}] ${target.padEnd(40)}║
║                                                              ║
╠──────────────────────────────────────────────────────────────╣\n`;
        }
        
        if (events.length > limit) {
          output += `║  Showing ${limit} of ${events.length} entries.                                  ║\n`;
        }
        
        output = output.slice(0, -68) + `╚══════════════════════════════════════════════════════════════╝`;
        
        return { success: true, output, data: result.data };
      } catch (err) {
        return { success: false, output: `▓ History error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    // (seba.config and seba.thresholds handled above — no duplicate)
    else if (base === 'seba.stamps') {
      // Evolution stamp verification command
      const limit = parseInt(args[0]) || 10;
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: stamps, error } = await supabase
          .from('brain_events')
          .select('*')
          .eq('event_type', 'evolution_stamp')
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (error) {
          return { success: false, output: `▓ Stamp query error: ${error.message}` };
        }
        
        if (!stamps || stamps.length === 0) {
          return { 
            success: true, 
            output: '◉ No evolution stamps found\n  Stamps are created when evolutions apply to production.\n  Run: modernizer.evolve → shadow → production to generate stamps.' 
          };
        }
        
        let output = `╔══════════════════════════════════════════════════════════════════════════╗
║  EVOLUTION STAMPS — Verification Trail                                   ║
╠══════════════════════════════════════════════════════════════════════════╣\n`;
        
        for (const stamp of stamps) {
          const data = stamp.data as Record<string, any>;
          const stampId = data?.stamp_id || 'N/A';
          const planId = data?.proposal_id?.substring(0, 8) || data?.plan_id?.substring(0, 8) || 'N/A';
          const initiator = data?.initiator || 'unknown';
          const changeType = data?.change_type || 'evolution';
          const createdAt = new Date(stamp.created_at).toLocaleString();
          
          output += `║  🔏 ${stampId}\n`;
          output += `║     Plan: ${planId}  |  Initiator: ${initiator}\n`;
          output += `║     Type: ${changeType}  |  Created: ${createdAt}\n`;
          output += `╠──────────────────────────────────────────────────────────────────────────╣\n`;
        }
        
        output = output.slice(0, -76) + '╚══════════════════════════════════════════════════════════════════════════╝';
        
        return { success: true, output, data: stamps };
      } catch (err) {
        return { success: false, output: `▓ Stamps error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'seba.cooldown') {
      // View/manage insight cooldowns
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const cooldownHours = 24;
        const cutoff = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();
        
        // Get recently addressed proposals
        const { data: proposals } = await supabase
          .from('evolution_proposals')
          .select('title, status, reviewed_at')
          .in('status', ['approved', 'applied'])
          .gte('reviewed_at', cutoff)
          .order('reviewed_at', { ascending: false });
          
        // Get recently applied improvements
        const { data: improvements } = await supabase
          .from('substrate_applied_improvements')
          .select('improvement_key, applied_at, applied_mode')
          .eq('is_active', true)
          .gte('applied_at', cutoff)
          .order('applied_at', { ascending: false });
        
        const proposalCount = proposals?.length || 0;
        const improvementCount = improvements?.length || 0;
        const total = proposalCount + improvementCount;
        
        let output = `╔══════════════════════════════════════════════════════════════╗
║  INSIGHT COOLDOWN STATUS                                     ║
╠══════════════════════════════════════════════════════════════╣
║  Cooldown Period: ${cooldownHours} hours                                   ║
║  Active Cooldowns: ${String(total).padEnd(3)} insights                            ║
╠══════════════════════════════════════════════════════════════╣\n`;

        if (proposalCount > 0) {
          output += `║  SEBA PROPOSALS (${proposalCount}):\n`;
          for (const p of (proposals || []).slice(0, 5)) {
            output += `║    • ${p.title.substring(0, 45)}...\n`;
          }
        }
        
        if (improvementCount > 0) {
          output += `║  EVOLUTION IMPROVEMENTS (${improvementCount}):\n`;
          for (const i of (improvements || []).slice(0, 5)) {
            const key = i.improvement_key.substring(0, 45);
            output += `║    • ${key}...\n`;
          }
        }
        
        output += `╚══════════════════════════════════════════════════════════════╝`;
        
        return { success: true, output, data: { proposals, improvements } };
      } catch (err) {
        return { success: false, output: `▓ Cooldown error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTOBLOG (Governed Blog Automation)
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'autoblog.status') {
      try {
        const { getAutoblogStatus } = await import('@/lib/autoblog');
        const status = await getAutoblogStatus();
        const s = status.settings;
        const modeIcon = s?.enabled ? '🟢' : '🔴';
        const circuitIcon = status.circuit.state === 'closed' ? '✅' : status.circuit.state === 'open' ? '🛑' : '⚡';
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  AUTOBLOG PRIMITIVE                                           ║
╠══════════════════════════════════════════════════════════════╣
║  Status:     ${modeIcon} ${s?.enabled ? 'ENABLED' : 'DISABLED'}                                       ║
║  Mode:       ${(s?.mode || 'off').toUpperCase().padEnd(10)}                                      ║
║  Circuit:    ${circuitIcon} ${status.circuit.state.toUpperCase().padEnd(10)}                                 ║
║  Dry Run:    ${s?.dry_run ? '✓ ON (publish blocked)' : '✗ OFF'}                      ║
║  Cadence:    ${s?.cadence_minutes || 360} min between posts                        ║
║  Max/Day:    ${s?.max_posts_per_day || 2} posts                                        ║
╚══════════════════════════════════════════════════════════════╝`,
          data: status,
        };
      } catch (err) {
        return { success: false, output: `▓ AutoBlog error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.enable') {
      try {
        const { updateAutoblogSettings } = await import('@/lib/autoblog');
        const result = await updateAutoblogSettings({ enabled: true });
        if (!result.ok) {
          return { success: false, output: `▓ Failed to enable AutoBlog: ${result.error}` };
        }
        return { success: true, output: '◉ AutoBlog ENABLED — governed automation active\n  Note: dry_run is still ON by default' };
      } catch (err) {
        return { success: false, output: `▓ Enable error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.disable') {
      try {
        const { updateAutoblogSettings } = await import('@/lib/autoblog');
        const result = await updateAutoblogSettings({ enabled: false });
        if (!result.ok) {
          return { success: false, output: `▓ Failed to disable AutoBlog: ${result.error}` };
        }
        return { success: true, output: '◉ AutoBlog DISABLED' };
      } catch (err) {
        return { success: false, output: `▓ Disable error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.plan') {
      try {
        const { autoblogPlan } = await import('@/lib/autoblog');
        const result = await autoblogPlan();
        if (!result.ok) {
          return { success: false, output: `▓ Plan blocked: ${result.reason}` };
        }
        return {
          success: true,
          output: `◉ Blog post planned and queued
  Queue ID:  ${result.queueId?.slice(0, 8)}...
  Channel:   ${result.data?.channel}
  Topic:     ${result.data?.topic}`,
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ Plan error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.draft') {
      const queueId = args[0];
      if (!queueId) {
        return { success: false, output: '▓ ERROR: Queue ID required\n  Usage: autoblog.draft <queue_id>' };
      }
      try {
        const { autoblogDraft } = await import('@/lib/autoblog');
        const result = await autoblogDraft(queueId);
        if (!result.ok) {
          return { success: false, output: `▓ Draft failed: ${result.reason}` };
        }
        return { success: true, output: `◉ Draft generated for ${queueId.slice(0, 8)}... — ready for verification` };
      } catch (err) {
        return { success: false, output: `▓ Draft error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.verify') {
      const queueId = args[0];
      if (!queueId) {
        return { success: false, output: '▓ ERROR: Queue ID required\n  Usage: autoblog.verify <queue_id>' };
      }
      try {
        const { autoblogVerify } = await import('@/lib/autoblog');
        const result = await autoblogVerify(queueId);
        if (!result.ok) {
          return { success: false, output: `▓ Verification failed: ${result.reason}` };
        }
        return {
          success: true,
          output: `◉ Draft verified — confidence: ${((result.data?.confidence as number) * 100).toFixed(0)}%
  Checks passed: ${(result.data?.checks as string[])?.join(', ')}`,
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ Verify error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.publish') {
      const queueId = args[0];
      if (!queueId) {
        return { success: false, output: '▓ ERROR: Queue ID required\n  Usage: autoblog.publish <queue_id>\n  Or use: autoblog.publish.all' };
      }
      try {
        const { autoblogPublish } = await import('@/lib/autoblog');
        const result = await autoblogPublish(queueId);
        if (!result.ok) {
          return { success: false, output: `▓ Publish blocked: ${result.reason}` };
        }
        return { 
          success: true, 
          output: `◉ POST PUBLISHED SUCCESSFULLY
  Queue ID:  ${queueId.slice(0, 8)}...
  Post ID:   ${result.data?.postId || 'N/A'}
  Slug:      ${result.data?.slug || 'N/A'}
  
  View at: /blog/${result.data?.slug || ''}`,
          data: result.data
        };
      } catch (err) {
        return { success: false, output: `▓ Publish error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.publish.all') {
      try {
        const { autoblogPublishAll } = await import('@/lib/autoblog');
        const result = await autoblogPublishAll();
        if (!result.ok) {
          return { success: false, output: `▓ Publish all failed: ${result.reason}` };
        }
        return { 
          success: true, 
          output: `◉ BATCH PUBLISH COMPLETE
  Published: ${result.data?.published || 0} posts
  Failed:    ${result.data?.failed || 0} posts
  
  Use 'autoblog.queue' to verify status`,
          data: result.data
        };
      } catch (err) {
        return { success: false, output: `▓ Publish all error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.abort') {
      const queueId = args[0];
      const reason = args.slice(1).join(' ') || 'Aborted by operator';
      if (!queueId) {
        return { success: false, output: '▓ ERROR: Queue ID required\n  Usage: autoblog.abort <queue_id> [reason]' };
      }
      try {
        const { autoblogAbort } = await import('@/lib/autoblog');
        const result = await autoblogAbort(queueId, reason);
        return { success: true, output: `◉ Aborted ${queueId.slice(0, 8)}... — ${reason}` };
      } catch (err) {
        return { success: false, output: `▓ Abort error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.queue') {
      try {
        const { getAutoblogQueue } = await import('@/lib/autoblog');
        const queue = await getAutoblogQueue();
        if (queue.length === 0) {
          return { success: true, output: '◉ Queue is empty — no pending posts' };
        }
        const charWidth = getOptimalCharWidth();
        const isMobile = charWidth < 50;
        
        let output = '╔══════════════════════════════════════════════════════════════╗\n';
        output += '║  AUTOBLOG QUEUE                                              ║\n';
        output += '╠══════════════════════════════════════════════════════════════╣\n';
        
        for (const item of queue.slice(0, 10)) {
          const id = item.id.slice(0, 8);
          const status = item.status.toUpperCase().padEnd(10);
          const channel = item.channel.padEnd(12);
          if (isMobile) {
            output += `║ ${id} ${status}           ║\n`;
            output += `║   └─ ${channel}                    ║\n`;
          } else {
            output += `║  ${id}  ${status}  ${channel}                    ║\n`;
          }
        }
        output += '╚══════════════════════════════════════════════════════════════╝';
        
        return { success: true, output, data: queue };
      } catch (err) {
        return { success: false, output: `▓ Queue error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.runs') {
      const limit = parseInt(args[0]) || 20;
      try {
        const { getAutoblogRuns } = await import('@/lib/autoblog');
        const runs = await getAutoblogRuns(limit);
        if (runs.length === 0) {
          return { success: true, output: '◉ No runs recorded yet' };
        }
        let output = '╔══════════════════════════════════════════════════════════════╗\n';
        output += '║  AUTOBLOG RUNS (Audit Trail)                                 ║\n';
        output += '╠══════════════════════════════════════════════════════════════╣\n';
        
        for (const run of runs.slice(0, 15)) {
          const phase = run.phase.toUpperCase().padEnd(8);
          const outcome = run.outcome === 'success' ? '✓' : run.outcome === 'blocked' ? '⚠' : '✗';
          const reason = (run.reason || '').substring(0, 35);
          output += `║  ${outcome} ${phase}  ${reason.padEnd(40)} ║\n`;
        }
        output += '╚══════════════════════════════════════════════════════════════╝';
        
        return { success: true, output, data: runs };
      } catch (err) {
        return { success: false, output: `▓ Runs error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.settings') {
      const action = args[0];
      
      if (action === 'set' && args.length >= 3) {
        const key = args[1];
        const value = args.slice(2).join(' ');
        try {
          const { updateAutoblogSettings } = await import('@/lib/autoblog');
          const updates: Record<string, unknown> = {};
          
          // Parse value based on key
          if (key === 'cadence_minutes' || key === 'max_posts_per_day' || key === 'max_failures_per_hour') {
            updates[key] = parseInt(value);
          } else if (key === 'min_confidence_publish') {
            updates[key] = parseFloat(value);
          } else if (key === 'dry_run' || key === 'enabled') {
            updates[key] = value === 'true';
          } else if (key === 'mode') {
            if (!['governed', 'shadow', 'off'].includes(value)) {
              return { success: false, output: '▓ Invalid mode. Use: governed, shadow, or off' };
            }
            updates[key] = value;
          } else {
            return { success: false, output: `▓ Unknown setting: ${key}` };
          }
          
          const result = await updateAutoblogSettings(updates as any);
          if (!result.ok) {
            return { success: false, output: `▓ Update failed: ${result.error}` };
          }
          return { success: true, output: `◉ Updated ${key} = ${value}` };
        } catch (err) {
          return { success: false, output: `▓ Settings error: ${err instanceof Error ? err.message : 'Unknown'}` };
        }
      }
      
      // View settings
      try {
        const { getAutoblogSettings } = await import('@/lib/autoblog');
        const settings = await getAutoblogSettings();
        if (!settings) {
          return { success: false, output: '▓ Settings not found' };
        }
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  AUTOBLOG SETTINGS                                           ║
╠══════════════════════════════════════════════════════════════╣
║  enabled:              ${settings.enabled}                              ║
║  mode:                 ${settings.mode}                           ║
║  dry_run:              ${settings.dry_run}                             ║
║  cadence_minutes:      ${settings.cadence_minutes}                              ║
║  max_posts_per_day:    ${settings.max_posts_per_day}                                ║
║  max_failures_per_hour: ${settings.max_failures_per_hour}                               ║
║  min_confidence:       ${settings.min_confidence_publish}                             ║
║  allowed_channels:     ${settings.allowed_channels.join(', ')}   ║
║  circuit_state:        ${settings.circuit_state}                          ║
╚══════════════════════════════════════════════════════════════╝`,
          data: settings,
        };
      } catch (err) {
        return { success: false, output: `▓ Settings error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.circuit') {
      const action = args[0];
      try {
        if (action === 'reset') {
          const { resetAutoblogCircuit } = await import('@/lib/autoblog');
          await resetAutoblogCircuit();
          return { success: true, output: '◉ AutoBlog circuit reset to CLOSED' };
        }
        
        const { checkAutoblogCircuit } = await import('@/lib/autoblog');
        const circuit = await checkAutoblogCircuit();
        const icon = circuit.state === 'closed' ? '✅' : circuit.state === 'open' ? '🛑' : '⚡';
        return {
          success: true,
          output: `◉ AutoBlog Circuit: ${icon} ${circuit.state.toUpperCase()}
  Can proceed: ${circuit.canProceed ? 'Yes' : 'No'}
  Reason:      ${circuit.reason || 'None'}`,
        };
      } catch (err) {
        return { success: false, output: `▓ Circuit error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.heal') {
      const full = args.includes('--full');
      try {
        const { healAutoblog } = await import('@/lib/autoblog');
        const result = await healAutoblog({ full, source: 'terminal' });
        
        let output = full
          ? '🔧 AutoBlog FULL HEAL executed:\n'
          : '🔧 AutoBlog soft heal executed:\n';
        
        for (const action of result.actions) {
          output += `  ▸ ${action}\n`;
        }
        output += `\nFinal state: enabled=${result.finalState.enabled}, circuit=${result.finalState.circuitState}`;
        if (result.finalState.itemsCleared > 0) {
          output += `, cleared=${result.finalState.itemsCleared}`;
        }
        
        return { success: result.ok, output, data: result };
      } catch (err) {
        return { success: false, output: `▓ Heal error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    // AUTONOMOUS MODE COMMANDS v2.0
    else if (base === 'autoblog.start') {
      try {
        const { startAutonomousMode } = await import('@/lib/autoblog');
        const result = await startAutonomousMode();
        if (!result.ok) {
          return { success: false, output: `▓ Start failed: ${result.message}` };
        }
        return {
          success: true,
          output: `◉ AUTONOMOUS MODE ACTIVATED
  Status:   Running continuously
  Cadence:  Posts generated on schedule
  Learning: Brain integration active
  
  Use 'autoblog.state' to monitor
  Use 'autoblog.stop' to halt`,
        };
      } catch (err) {
        return { success: false, output: `▓ Start error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.stop') {
      try {
        const { stopAutonomousMode } = await import('@/lib/autoblog');
        const result = stopAutonomousMode();
        if (!result.ok) {
          return { success: false, output: `▓ Stop failed: ${result.message}` };
        }
        return { success: true, output: `◉ Autonomous mode stopped — ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Stop error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.state') {
      try {
        const { getAutonomousState } = await import('@/lib/autoblog');
        const state = getAutonomousState();
        const runningIcon = state.is_running ? '🟢' : '⚫';
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  AUTONOMOUS ENGINE STATE                                     ║
╠══════════════════════════════════════════════════════════════╣
║  Status:     ${runningIcon} ${state.is_running ? 'RUNNING' : 'STOPPED'}                                      ║
║  Cycles:     ${String(state.cycles_completed).padEnd(5)} completed                             ║
║  Posts:      ${String(state.posts_generated).padEnd(5)} generated                             ║
║  Insights:   ${String(state.research_insights_captured).padEnd(5)} captured                              ║
║  Evolutions: ${String(state.evolution_updates_posted).padEnd(5)} posted                               ║
╠══════════════════════════════════════════════════════════════╣
║  Last Cycle: ${(state.last_cycle_at || 'Never').toString().substring(0, 20).padEnd(20)}                     ║
║  Next Cycle: ${(state.next_cycle_at || 'Not scheduled').toString().substring(0, 20).padEnd(20)}                     ║
╚══════════════════════════════════════════════════════════════╝`,
          data: state,
        };
      } catch (err) {
        return { success: false, output: `▓ State error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.seed') {
      const count = parseInt(args[0]) || 3;
      try {
        const { seedAutoblogPosts } = await import('@/lib/autoblog');
        const result = await seedAutoblogPosts(count);
        
        if (!result.ok) {
          return { success: false, output: `▓ Seed failed: ${result.errors.join(', ')}` };
        }
        
        let output = `◉ SEEDED ${result.seeded} POSTS\n\n`;
        for (const post of result.posts) {
          output += `  ▸ [${post.channel.toUpperCase()}] ${post.topic.substring(0, 40)}...\n`;
          output += `    Queue ID: ${post.queueId.slice(0, 8)}...\n\n`;
        }
        output += `All posts are in 'ready' status.\nUse 'autoblog.queue' to view them.\nUse 'autoblog.publish <id>' to publish.`;
        
        return { success: true, output, data: result };
      } catch (err) {
        return { success: false, output: `▓ Seed error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    // CLM (Constant Learning Mode) COMMANDS v2.1
    else if (base === 'autoblog.clm' || base === 'autoblog.clm.start') {
      try {
        const { startCLMMode } = await import('@/lib/autoblog');
        const result = await startCLMMode();
        if (!result.ok) {
          return { success: false, output: `▓ CLM start failed: ${result.message}` };
        }
        return {
          success: true,
          output: `◉ CLM (CONSTANT LEARNING MODE) ACTIVATED
  ┌────────────────────────────────────────┐
  │  Target:      3-6 posts per week       │
  │  Intelligence: Weighing enabled        │
  │  Tone:        Changelog unified        │
  │  Learning:    24/7 continuous          │
  └────────────────────────────────────────┘
  
  The system will:
  ▸ Assess importance before publishing
  ▸ Check uniqueness vs recent posts
  ▸ Match changelog tone guidelines
  ▸ Self-audit every 5 cycles
  
  Use 'autoblog.clm.status' to monitor
  Use 'autoblog.clm.stop' to halt`,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM start error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.clm.stop') {
      try {
        const { stopCLMMode } = await import('@/lib/autoblog');
        const result = stopCLMMode();
        if (!result.ok) {
          return { success: false, output: `▓ CLM stop failed: ${result.message}` };
        }
        return { success: true, output: `◉ CLM stopped — ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ CLM stop error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.clm.status') {
      try {
        const { getCLMStatus } = await import('@/lib/autoblog');
        const status = getCLMStatus();
        const runningIcon = status.running ? '🟢' : '⚫';
        const qualityBar = '█'.repeat(Math.floor(status.stats.quality_avg * 10)) + '░'.repeat(10 - Math.floor(status.stats.quality_avg * 10));
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  CLM (CONSTANT LEARNING MODE) STATUS                         ║
╠══════════════════════════════════════════════════════════════╣
║  Status:       ${runningIcon} ${status.running ? 'RUNNING 24/7' : 'STOPPED'}                              ║
║  Mode:         ${status.mode.toUpperCase().padEnd(12)}                                ║
╠══════════════════════════════════════════════════════════════╣
║  WEEKLY PROGRESS                                             ║
║  Posts:        ${String(status.stats.posts_this_week).padEnd(2)}/${status.config.MAX_POSTS_PER_WEEK} target (${status.config.MIN_POSTS_PER_WEEK}-${status.config.MAX_POSTS_PER_WEEK}/week)              ║
║  Total Posts:  ${String(status.stats.posts_total).padEnd(5)}                                          ║
║  Cycles:       ${String(status.stats.cycles).padEnd(5)}                                          ║
╠══════════════════════════════════════════════════════════════╣
║  QUALITY TREND                                               ║
║  ${qualityBar} ${(status.stats.quality_avg * 100).toFixed(0)}%                        ║
╚══════════════════════════════════════════════════════════════╝`,
          data: status,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM status error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ENGINE — Cognitive Engine System
    // ═══════════════════════════════════════════════════════════════════════════
    
    else if (base === 'engine.status') {
      try {
        const { getEngineSummary, getMetaEngineSummary } = await import('@/lib/substrate/engines');
        const engineSummary = getEngineSummary();
        const metaSummary = getMetaEngineSummary();
        
        return {
          success: true,
          output: `
╔══════════════════════════════════════════════════════════════╗
║  COGNITIVE ENGINE SYSTEM                                       ║
╠══════════════════════════════════════════════════════════════╣
║  Architecture: Capabilities (400+) → Engines (76) → Meta (24) ║
╠══════════════════════════════════════════════════════════════╣
║  ENGINES                                                     ║
║  Total:          ${String(engineSummary.totalEngines).padEnd(3)}                                        ║
║  Categories:     ${String(Object.keys(engineSummary.byCategory).length).padEnd(2)}                                         ║
║  Avg Synergy:    ${engineSummary.averageSynergyMultiplier.toFixed(1)}x                                       ║
║  Capabilities:   ${String(engineSummary.totalCapabilitiesOrchestrated).padEnd(3)}                                        ║
╠══════════════════════════════════════════════════════════════╣
║  META-ENGINES                                                ║
║  Total:          ${String(metaSummary.totalMetaEngines).padEnd(2)}                                         ║
║  Compound Avg:   ${metaSummary.averageCompoundSynergy.toFixed(1)}x                                       ║
║  Max Synergy:    8.2x (world_first_operational)              ║
╠══════════════════════════════════════════════════════════════╣
║  Use 'engine.list' to browse engines                         ║
║  Use 'meta.list' to browse meta-engines                      ║
║  Use 'engine.run <id>' to execute                            ║
╚══════════════════════════════════════════════════════════════╝`,
          data: { engines: engineSummary, meta: metaSummary },
        };
      } catch (err) {
        return { success: false, output: `▓ Engine status error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'engine.list') {
      try {
        const { listEngines, ENGINES_BY_CATEGORY } = await import('@/lib/substrate/engines');
        const categoryFilter = args[0]?.toLowerCase();
        const engines = listEngines();
        
        let filtered = engines;
        if (categoryFilter && categoryFilter !== 'all') {
          filtered = engines.filter(e => e.category === categoryFilter);
        }
        
        const categories = categoryFilter 
          ? [categoryFilter] 
          : [...new Set(engines.map(e => e.category))].sort();
        
        let output = `\n┌─ COGNITIVE ENGINES (${filtered.length} total) ───────────────────────────────\n`;
        
        for (const cat of categories) {
          const catEngines = filtered.filter(e => e.category === cat);
          if (catEngines.length === 0) continue;
          
          output += `│\n│ ▸ ${cat.toUpperCase()} (${catEngines.length})\n`;
          for (const engine of catEngines) {
            output += `│   • ${engine.id.padEnd(28)} ${engine.synergyMultiplier}x  ${engine.capabilities.length} caps\n`;
          }
        }
        
        output += `│\n└───────────────────────────────────────────────────────────────\n`;
        output += `\n  Use 'engine.get <id>' for details, 'engine.run <id>' to execute`;
        
        return { success: true, output, data: filtered };
      } catch (err) {
        return { success: false, output: `▓ Engine list error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'engine.get') {
      try {
        const { getEngine } = await import('@/lib/substrate/engines');
        const engineId = args[0];
        if (!engineId) {
          return { success: false, output: '▓ Usage: engine.get <engine_id>' };
        }
        const engine = getEngine(engineId as any);
        if (!engine) {
          return { success: false, output: `▓ Engine not found: ${engineId}` };
        }
        
        return {
          success: true,
          output: `
┌─ ENGINE: ${engine.name} ─────────────────────────
│
│  ID:          ${engine.id}
│  Category:    ${engine.category}
│  Layer:       ${engine.layer}
│  Synergy:     ${engine.synergyMultiplier}x
│  Complexity:  ${engine.complexityScore}/10
│  Latency:     ${engine.averageLatencyMs}ms
│  Autonomy:    ${engine.autonomyLevel}
│  Execution:   ${engine.executionMode}
│  Cacheable:   ${engine.cacheable}
│
│  DESCRIPTION
│  ${engine.description}
│
│  CAPABILITIES (${engine.capabilities.length})
│  ${engine.capabilities.slice(0, 6).join(', ')}${engine.capabilities.length > 6 ? '...' : ''}
│
│  MODULES: ${engine.primaryModules.join(', ')}
│
└──────────────────────────────────────────────────`,
          data: engine,
        };
      } catch (err) {
        return { success: false, output: `▓ Engine get error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'engine.categories') {
      try {
        const { listEngines } = await import('@/lib/substrate/engines');
        const engines = listEngines();
        const categories = [...new Set(engines.map(e => e.category))].sort();
        
        let output = `\n┌─ ENGINE CATEGORIES (${categories.length}) ────────────────────────────────\n│\n`;
        
        for (const cat of categories) {
          const count = engines.filter(e => e.category === cat).length;
          const avgSynergy = engines.filter(e => e.category === cat)
            .reduce((sum, e) => sum + e.synergyMultiplier, 0) / count;
          output += `│  • ${cat.toUpperCase().padEnd(15)} ${String(count).padStart(2)} engines  avg ${avgSynergy.toFixed(1)}x\n`;
        }
        
        output += `│\n└───────────────────────────────────────────────────────────────\n`;
        
        return { success: true, output, data: categories };
      } catch (err) {
        return { success: false, output: `▓ Categories error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'engine.run') {
      try {
        const { runEngine } = await import('@/lib/substrate/engines');
        const engineId = args[0];
        if (!engineId) {
          return { success: false, output: '▓ Usage: engine.run <engine_id> [json_input]' };
        }
        
        let input = {};
        if (args[1]) {
          try {
            input = JSON.parse(args.slice(1).join(' '));
          } catch {
            return { success: false, output: '▓ Invalid JSON input' };
          }
        }
        
        const result = await runEngine(engineId as any, input);
        
        if (result.success) {
          return {
            success: true,
            output: `
◉ ENGINE EXECUTED: ${result.engineId}

┌─ RESULT ─────────────────────────────────────────
│  Duration:      ${result.totalDurationMs}ms
│  Synergy Gain:  ${result.synergyGain}x
│  Confidence:    ${(result.confidenceScore * 100).toFixed(0)}%
│  Capabilities:  ${result.capabilitiesExecuted} executed
│  Trace ID:      ${result.traceId.substring(0, 20)}...
└──────────────────────────────────────────────────`,
            data: result,
          };
        } else {
          return { success: false, output: `▓ Engine failed: ${result.error}` };
        }
      } catch (err) {
        return { success: false, output: `▓ Engine run error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'engine.batch') {
      try {
        const { runEngine } = await import('@/lib/substrate/engines');
        const engineIds = args[0]?.split(',');
        if (!engineIds || engineIds.length === 0) {
          return { success: false, output: '▓ Usage: engine.batch <engine_id1,engine_id2,...> [parallel]' };
        }
        const parallel = args[1] === 'true';
        const input = args[2] ? JSON.parse(args[2]) : {};
        
        const executor = async (id: string) => runEngine(id as any, input);
        const results = parallel
          ? await Promise.allSettled(engineIds.map(executor))
          : [];
        
        if (!parallel) {
          for (const id of engineIds) {
            results.push({ status: 'fulfilled', value: await executor(id) } as any);
          }
        }
        
        const succeeded = results.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length;
        let output = `◉ ENGINE BATCH: ${engineIds.length} engines, ${parallel ? 'parallel' : 'sequential'}\n  Succeeded: ${succeeded}/${engineIds.length}\n`;
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const val = r.status === 'fulfilled' ? (r as any).value : null;
          output += `\n  ${val?.success ? '✓' : '✗'} ${engineIds[i]} ${val?.totalDurationMs ? `(${val.totalDurationMs}ms)` : ''}`;
        }
        return { success: succeeded === engineIds.length, output, data: results };
      } catch (err) {
        return { success: false, output: `▓ Batch error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'engine.history') {
      const limit = args[0] ? parseInt(args[0]) : 10;
      try {
        const { data: history, error } = await supabase
          .from('brain_events')
          .select('*')
          .eq('event_type', 'engine_execution')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) {
          return { success: false, output: `▓ History error: ${error.message}` };
        }
        if (!history || history.length === 0) {
          return { success: true, output: '◉ No engine execution history found' };
        }
        let output = `┌─ ENGINE EXECUTION HISTORY (${history.length}) ───────────────────────\n│\n`;
        for (const h of history) {
          const d = h.data as Record<string, any> || {};
          output += `│  ${new Date(h.created_at).toLocaleString()} │ ${(d.engine_id || 'unknown').padEnd(24)} │ ${d.success ? '✓' : '✗'} ${d.duration_ms || 0}ms\n`;
        }
        output += `│\n└──────────────────────────────────────────────────────────────`;
        return { success: true, output, data: history };
      } catch (err) {
        return { success: false, output: `▓ History error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'engine.worldfirst') {
      try {
        const { listEngines } = await import('@/lib/substrate/engines');
        const worldFirst = listEngines().filter(e => e.category === 'enhancement');
        
        let output = `\n┌─ WORLD-FIRST ENHANCEMENT ENGINES (14) ────────────────────────\n│\n`;
        
        for (const engine of worldFirst) {
          const module = engine.primaryModules[0] || 'N/A';
          output += `│  • ${engine.id.padEnd(30)} ${module.padEnd(12)} ${engine.synergyMultiplier}x\n`;
        }
        
        output += `│\n│  These engines orchestrate the substrate's 56 unique world-first\n`;
        output += `│  enhancements across all ${ALL_EXECUTION_SURFACES.length} modules.\n`;
        output += `│\n└───────────────────────────────────────────────────────────────\n`;
        
        return { success: true, output, data: worldFirst };
      } catch (err) {
        return { success: false, output: `▓ World-first list error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'engine.synergy') {
      try {
        const { getEngineSummary, getMetaEngineSummary } = await import('@/lib/substrate/engines');
        const engineSummary = getEngineSummary();
        const metaSummary = getMetaEngineSummary();
        
        return {
          success: true,
          output: `
┌─ SYNERGY METRICS ─────────────────────────────────────────────
│
│  ENGINE LAYER
│  Total Engines:        ${engineSummary.totalEngines}
│  Avg Synergy:          ${engineSummary.averageSynergyMultiplier.toFixed(2)}x
│  Avg Complexity:       ${engineSummary.averageComplexityScore.toFixed(1)}/10
│  World-First Engines:  14
│
│  META-ENGINE LAYER
│  Total Meta-Engines:   ${metaSummary.totalMetaEngines}
│  Avg Compound Synergy: ${metaSummary.averageCompoundSynergy.toFixed(2)}x
│  Max Synergy:          8.2x (world_first_operational)
│  Enterprise Grade:     16/20
│
│  CAPABILITY COVERAGE
│  Total Orchestrated:   ${engineSummary.totalCapabilitiesOrchestrated}
│  Synergy Memory Chains:    ${engineSummary.totalSynergyPipelines}
│  World-First:          ${engineSummary.totalWorldFirstEnhancements}
│
└───────────────────────────────────────────────────────────────`,
          data: { engines: engineSummary, meta: metaSummary },
        };
      } catch (err) {
        return { success: false, output: `▓ Synergy metrics error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    // META-ENGINE commands
    else if (base === 'meta.status') {
      try {
        const { getMetaEngineSummary } = await import('@/lib/substrate/engines');
        const summary = getMetaEngineSummary();
        
        return {
          success: true,
          output: `
╔══════════════════════════════════════════════════════════════╗
║  META-ENGINE SYSTEM                                           ║
╠══════════════════════════════════════════════════════════════╣
║  Total Meta-Engines:    ${String(summary.totalMetaEngines).padEnd(2)}                                    ║
║  Engines Orchestrated:  ${String(summary.totalEnginesOrchestrated).padEnd(2)}                                    ║
║  Capabilities Reached:  ${String(summary.totalCapabilitiesReached).padEnd(3)}                                   ║
║  Avg Compound Synergy:  ${summary.averageCompoundSynergy.toFixed(1)}x                                   ║
╠══════════════════════════════════════════════════════════════╣
║  Use 'meta.list' for all meta-engines                        ║
║  Use 'meta.run <id>' to execute                              ║
╚══════════════════════════════════════════════════════════════╝`,
          data: summary,
        };
      } catch (err) {
        return { success: false, output: `▓ Meta status error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'meta.list') {
      try {
        const { listMetaEngines } = await import('@/lib/substrate/engines');
        const metas = listMetaEngines();
        
        let output = `\n┌─ META-ENGINES (${metas.length}) ─────────────────────────────────────────\n│\n`;
        
        for (const meta of metas) {
          output += `│  • ${meta.id.padEnd(26)} ${meta.compoundSynergyMultiplier.toFixed(1)}x  ${meta.engines.length} engines\n`;
        }
        
        output += `│\n└───────────────────────────────────────────────────────────────\n`;
        output += `\n  Use 'meta.get <id>' for details, 'meta.run <id>' to execute`;
        
        return { success: true, output, data: metas };
      } catch (err) {
        return { success: false, output: `▓ Meta list error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'meta.get') {
      try {
        const { getMetaEngine } = await import('@/lib/substrate/engines');
        const metaId = args[0];
        if (!metaId) {
          return { success: false, output: '▓ Usage: meta.get <meta_engine_id>' };
        }
        const meta = getMetaEngine(metaId as any);
        if (!meta) {
          return { success: false, output: `▓ Meta-engine not found: ${metaId}` };
        }
        
        return {
          success: true,
          output: `
┌─ META-ENGINE: ${meta.name} ─────────────────────────
│
│  ID:              ${meta.id}
│  Category:        ${meta.category}
│  Compound Synergy: ${meta.compoundSynergyMultiplier}x
│  Complexity:      ${meta.complexityScore}/10
│  Latency:         ~${meta.estimatedLatencyMs}ms
│  Orchestration:   ${meta.orchestrationMode}
│  Enterprise:      ${meta.enterpriseValue}
│
│  DESCRIPTION
│  ${meta.description}
│
│  ENGINES (${meta.engines.length})
│  ${meta.engines.join(', ')}
│
│  USE CASES
│  ${meta.useCases.slice(0, 3).map(u => `• ${u}`).join('\n│  ')}
│
└──────────────────────────────────────────────────`,
          data: meta,
        };
      } catch (err) {
        return { success: false, output: `▓ Meta get error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'meta.batch') {
      try {
        const { runMetaEngine } = await import('@/lib/substrate/engines');
        const metaIds = args[0]?.split(',');
        if (!metaIds || metaIds.length === 0) {
          return { success: false, output: '▓ Usage: meta.batch <meta_id1,meta_id2,...> [parallel]' };
        }
        const parallel = args[1] === 'true';
        const input = args[2] ? JSON.parse(args[2]) : {};
        
        const executor = async (id: string) => runMetaEngine(id as any, input);
        const results = parallel
          ? await Promise.allSettled(metaIds.map(executor))
          : [];
        
        if (!parallel) {
          for (const id of metaIds) {
            results.push({ status: 'fulfilled', value: await executor(id) } as any);
          }
        }
        
        const succeeded = results.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length;
        let output = `◉ META-ENGINE BATCH: ${metaIds.length} meta-engines, ${parallel ? 'parallel' : 'sequential'}\n  Succeeded: ${succeeded}/${metaIds.length}\n`;
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const val = r.status === 'fulfilled' ? (r as any).value : null;
          output += `\n  ${val?.success ? '✓' : '✗'} ${metaIds[i]} ${val?.totalDurationMs ? `(${val.totalDurationMs}ms)` : ''}`;
        }
        return { success: succeeded === metaIds.length, output, data: results };
      } catch (err) {
        return { success: false, output: `▓ Meta batch error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    
    else if (base === 'meta.run') {
      try {
        const { runMetaEngine } = await import('@/lib/substrate/engines');
        const metaId = args[0];
        if (!metaId) {
          return { success: false, output: '▓ Usage: meta.run <meta_engine_id> [json_input]' };
        }
        
        let input = {};
        if (args[1]) {
          try {
            input = JSON.parse(args.slice(1).join(' '));
          } catch {
            return { success: false, output: '▓ Invalid JSON input' };
          }
        }
        
        const result = await runMetaEngine(metaId as any, input);
        
        if (result.success) {
          return {
            success: true,
            output: `
◉ META-ENGINE EXECUTED: ${result.metaEngineId}

┌─ RESULT ─────────────────────────────────────────
│  Duration:      ${result.totalDurationMs}ms
│  Compound Gain: ${result.compoundSynergyGain}x
│  Confidence:    ${(result.confidenceScore * 100).toFixed(0)}%
│  Engines Run:   ${result.enginesExecuted}
│  Capabilities:  ${result.capabilitiesOrchestrated}
│  Trace ID:      ${result.traceId.substring(0, 20)}...
└──────────────────────────────────────────────────`,
            data: result,
          };
        } else {
          return { success: false, output: `▓ Meta-engine failed: ${result.error}` };
        }
      } catch (err) {
        return { success: false, output: `▓ Meta run error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══ INFRASTRUCTURE COMMANDS ═══
    else if (base.startsWith('cron.') || base.startsWith('ratelimit.') || base.startsWith('snapshot.') || base.startsWith('cap.') || base.startsWith('stream.') || base.startsWith('file.') || base.startsWith('nl.')) {
      try {
        // Lazy-register infra handlers on first use
        const { registerInfraHandlers } = await import('@/lib/terminal/infra-handlers');
        registerInfraHandlers();
        
        const { getHandler } = await import('@/lib/terminal/validate-registry');
        const handler = getHandler(base);
        
        if (handler) {
          const structuredInfraArgs: Record<string, unknown> = {};
          args.forEach((arg, i) => { structuredInfraArgs[`arg${i}`] = arg; });
          if (args[0]) structuredInfraArgs.input = args[0];
          structuredInfraArgs._args = args;
          structuredInfraArgs._raw = command;
          const handlerResult = await handler(structuredInfraArgs);
          const data = handlerResult as Record<string, unknown>;
          
          // If handler returned a formatted output, use it directly
          if (data?.formatted && Array.isArray(data.formatted)) {
            return { success: true, output: (data.formatted as string[]).join('\n') };
          }
          
          if (data?.success === false) {
            return { success: false, output: `▓ ${data.error || 'Command failed'}` };
          }
          
          return {
            success: true,
            output: `◉ ${base}\n\n${JSON.stringify(data?.data || data, null, 2)}`,
            data: data?.data || data,
          };
        } else {
          return { success: false, output: `▓ Infrastructure command not found: ${base}` };
        }
      } catch (err) {
        return { success: false, output: `▓ Infra error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // PATCH — Local Patch Management (LNCHBL shares the same backend)
    else if (base.startsWith('patch.')) {

      if (base === 'patch.help') {
        return {
          success: true,
          output: `◉ PATCH COMMANDS\n\n  patch.status\n    → List recent patches from cmpsbl_patches\n\n  patch.publish <patch_id>\n    → Publish a draft patch\n\n  patch.help\n    → This help text`,
        };
      }

      if (base === 'patch.status') {
        const { data, error } = await (supabase as any)
          .from('cmpsbl_patches')
          .select('id, version, status, changelog, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) return { success: false, output: `▓ Error: ${error.message}` };
        const lines = (data || []).map((p: any) =>
          `  ${p.status === 'published' ? '✅' : p.status === 'draft' ? '📝' : '❌'} v${p.version} [${p.status}] — ${p.changelog?.slice(0, 60) || 'No description'}\n    ID: ${p.id.slice(0, 8)}… | ${new Date(p.created_at).toLocaleDateString()}`
        ).join('\n\n');
        return { success: true, output: `◉ RECENT PATCHES (${data?.length || 0})\n\n${lines || '  No patches found.'}` };
      }

      if (base === 'patch.publish') {
        const patchRef = args[0];
        if (!patchRef) {
          return { success: false, output: '▓ Usage: patch.publish <patch_id>\n  Use patch.status to find draft IDs' };
        }
        const { data: patches, error: fetchErr } = await (supabase as any)
          .from('cmpsbl_patches')
          .select('*')
          .eq('status', 'draft')
          .order('created_at', { ascending: false });
        if (fetchErr) return { success: false, output: `▓ Error: ${fetchErr.message}` };
        const patch = (patches || []).find((p: any) => p.id.startsWith(patchRef) || p.version === patchRef);
        if (!patch) return { success: false, output: `▓ Draft patch not found: ${patchRef}` };

        await (supabase as any)
          .from('cmpsbl_patches')
          .update({ status: 'published', published_at: new Date().toISOString() })
          .eq('id', patch.id);
        return { success: true, output: `◉ PATCH v${patch.version} PUBLISHED ✅\n\n  ID: ${patch.id.slice(0, 8)}…\n  Engines: ${(patch.engines_unlocked || []).length}\n  Capabilities: ${(patch.capabilities_unlocked || []).length}` };
      }

      return { success: false, output: `▓ Unknown patch command: ${base}\n  Type 'patch.help' for available commands` };
    }

    // SUBSTRATE FALLBACK — REMOVED Phase 4.2 (redundant with bridge-first auto-route above)


    // ═══ MATRIX RESILIENCE COMMANDS ═══
    else if (base === 'matrix.canary') {
      const { getActiveCanaries, getAllCanaries } = await import('@/lib/substrate/node-canary');
      return { success: true, output: `◉ Node Canaries\n\n${JSON.stringify({ active: getActiveCanaries(), all: getAllCanaries().slice(-10) }, null, 2)}` };
    } else if (base === 'matrix.killswitch') {
      const { getAllKillStates } = await import('@/lib/substrate/sector-killswitch');
      return { success: true, output: `◉ Sector Kill Switch States\n\n${JSON.stringify(getAllKillStates(), null, 2)}` };
    } else if (base === 'matrix.killswitch.kill') {
      const { killSector } = await import('@/lib/substrate/sector-killswitch');
      const sector = args[0] as any; const reason = args.slice(1).join(' ') || 'Manual kill';
      return { success: true, output: `◉ Sector Killed\n\n${JSON.stringify(killSector(sector, reason), null, 2)}` };
    } else if (base === 'matrix.killswitch.revive') {
      const { reviveSector } = await import('@/lib/substrate/sector-killswitch');
      return { success: true, output: `◉ Sector Revived\n\n${JSON.stringify(reviveSector(args[0] as any), null, 2)}` };
    } else if (base === 'matrix.redundant') {
      const { getAllPairs } = await import('@/lib/substrate/redundant-nodes');
      return { success: true, output: `◉ Redundant Node Pairs\n\n${JSON.stringify(getAllPairs(), null, 2)}` };
    } else if (base === 'matrix.chaos') {
      const { getChaosStats, getExperiments } = await import('@/lib/substrate/chaos-testing');
      return { success: true, output: `◉ Chaos Testing\n\n${JSON.stringify({ stats: getChaosStats(), recent: getExperiments(5) }, null, 2)}` };
    } else if (base === 'matrix.chaos.inject') {
      const { injectChaos } = await import('@/lib/substrate/chaos-testing');
      return { success: true, output: `◉ Chaos Injected\n\n${JSON.stringify(injectChaos((args[0] || 'breaker_trip') as any, args[1] || 'decode'), null, 2)}` };
    } else if (base === 'matrix.correlation') {
      const { getCorrelationSummary } = await import('@/lib/substrate/cross-sector-correlation');
      return { success: true, output: `◉ Cross-Sector Correlation\n\n${JSON.stringify(getCorrelationSummary(), null, 2)}` };
    } else if (base === 'matrix.heatmap') {
      const { getHeatmapSummary } = await import('@/lib/substrate/health-heatmap');
      return { success: true, output: `◉ Health Heatmap\n\n${JSON.stringify(getHeatmapSummary(), null, 2)}` };
    } else if (base === 'matrix.forecast') {
      const { getForecastSummary, getActiveForecasts } = await import('@/lib/substrate/anomaly-forecasting');
      return { success: true, output: `◉ Anomaly Forecasting\n\n${JSON.stringify({ summary: getForecastSummary(), active: getActiveForecasts().slice(-5) }, null, 2)}` };
    } else if (base === 'matrix.quorum') {
      const { getQuorumSummary, getQuorumConfig } = await import('@/lib/substrate/quorum-healing');
      return { success: true, output: `◉ Quorum Healing\n\n${JSON.stringify({ summary: getQuorumSummary(), config: getQuorumConfig() }, null, 2)}` };
    } else if (base === 'matrix.incidents') {
      const { getIncidentSummary, getOpenIncidents } = await import('@/lib/substrate/immutable-incidents');
      return { success: true, output: `◉ Immutable Incidents\n\n${JSON.stringify({ summary: getIncidentSummary(), open: getOpenIncidents().slice(-5) }, null, 2)}` };
    } else if (base === 'matrix.queue') {
      const { getQueueState } = await import('@/lib/substrate/priority-queue');
      return { success: true, output: `◉ Priority Queue\n\n${JSON.stringify(getQueueState(), null, 2)}` };
    }

    // Unknown command
    else {
      return {
        success: false,
        output: `▓ UNKNOWN COMMAND: ${base}\n  Type 'help' for available commands or 'help <module>' for specifics`,
      };
    }

    // Format result
    if (result?.success) {
      const output = `◉ ${getRandomItem(PERSONALITY_RESPONSES.success)}\n\n${JSON.stringify(result.data || result, null, 2)}`;
      return { success: true, output, data: result.data };
    } else {
      return {
        success: false,
        output: `▓ ${result?.error || 'Command failed'}\n  ${getRandomItem(PERSONALITY_RESPONSES.error)}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `▓ EXCEPTION: ${error instanceof Error ? error.message : 'Unknown error'}\n  ${getRandomItem(PERSONALITY_RESPONSES.error)}`,
    };
  }
}
