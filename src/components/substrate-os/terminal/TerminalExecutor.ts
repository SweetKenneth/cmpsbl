/**
 * Terminal Command Executor
 * Handles parsing and execution of all substrate commands
 * 40 nodes / 12 sectors | 500+ commands | 300 synergy pipelines
 */

import { substrate, brain, decode, defense, nexus, vision, dream, system, modernizer, core, ripple, access, integration, cortex, inclusive, memoryMod, relayMod, auditMod, identityMod, economyMod, sandboxMod, encodeMod } from '@/lib/substrate';
import { supabase } from '@/integrations/supabase/client';
import { ALL_COMMANDS, COMMAND_CATEGORIES, type CommandDefinition, getCommandTier, meetsRequiredTier, getTierIcon, getTierLabel, type CommandTier } from './TerminalCommands';
import { getRandomItem, PERSONALITY_RESPONSES } from './TerminalTypes';
import { resolveAlias, addAlias, removeAlias, formatAliasHelp } from './useTerminalAliases';
import { getMacro, createMacro, deleteMacro, formatMacroHelp, formatMacroDetail } from './useTerminalMacros';
import { scheduleCommand, cancelScheduled, clearScheduled, formatScheduledList, formatScheduleConfirmation, getPendingCommands } from './useTerminalScheduler';
import { getLocalAuditLog, formatAuditLog, getSessionStats, exportAuditLog } from './useTerminalAudit';
import { renderForMobile, getOptimalCharWidth } from './TerminalMobileRenderer';
import { debugMode } from '@/lib/debug-mode';

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
        'Pipelines observable',
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
// SYSTEM-WIDE 40-NODE RESPONSE FORMATTERS
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
║  Nodes:     38/38 (12 sectors — CORE·SYSTEM·CCR·OCG·Exec·ESZ·EPZ·EMZ·CSZ·Fields·Plane·Shell) ║
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
║  500+ commands | 300 synergy pipelines | 100 engines         ║
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
║  Modules:         38/38 reporting                             ║
╠══════════════════════════════════════════════════════════════╣
║  MODULE HEALTH REPORT                                        ║
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

// Generate full help text with all modules
function generateFullHelp(): string {
  const modules = Object.keys(COMMAND_CATEGORIES) as Array<keyof typeof COMMAND_CATEGORIES>;
  const totalCommands = ALL_COMMANDS.length;
  
  let output = `
┌─────────────────────────────────────────────────────────────┐
│          CMPSBL® OS — COMMAND REFERENCE                     │
├─────────────────────────────────────────────────────────────┤
│  Total commands: ${totalCommands.toString().padEnd(5)}    Nodes: 40 / 12 Sectors           │
│  Architecture: 40-node matrix │ 675+ caps │ 300 Synergies  │
│                                                             │
│  Access Tiers:                                              │
│    ○ FREE        Read-only, status, pulse                   │
│    ◆ CREATOR     Actions, mutations ($29/mo)                │
│    ★ ARCHITECT   Evolution, modernizer ($79/mo)            │
│    ◉ GOVERNOR    System restore, admin (CMPSBL only)        │
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
│    evolution    (${COMMAND_CATEGORIES.evolution.commands.length.toString().padStart(2)} cmds)  Mutation pipeline & upgrades       │
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

┌─ SYNERGY ENGINE (200 Pipelines) ─────────────────────────────┐
│                                                             │
│  cortex.synergy.status    Engine overview                   │
│  cortex.synergy.list      List all 200 pipelines            │
│  cortex.synergy.get <id>  Get pipeline details              │
│  cortex.synergy.execute   Execute a pipeline                │
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
│  │  stream.status          SSE pipeline status           │   │
│  │  file.status            File processing pipeline      │   │
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
      let output = `\n┌─ ${module.toUpperCase()} — Expansion Modules ────────────────────────────\n│\n`;
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
      creator: 'Terminal, engines, analytics, actions ($29/mo)',
      architect: 'Evolution, modernizer, mesh, advanced ops ($79/mo)',
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
│  ██████╗ ███████╗     Cognitive Operating System
│  ██╔═══╝ ██╔════╝     CMPSBL® OS
│  ██║     ███████╗     
│  ██║     ╚════██║     Environment: CMPSBL Cloud
│  ██████╗ ███████║     Status: OPERATIONAL
│  ╚═════╝ ╚══════╝
│ 
│  40-Node / 12-Sector Field-Based Topology — Full AI Operating System
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
│  │  modernizer:// upgrades, codebase evolution
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
│  40 nodes | 12 sectors | 500+ commands | 300 synergy pipelines | health: 100%
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

  // Execute substrate commands
  try {
    let result;

    // BRAIN module
    if (base === 'brain.status') {
      result = await brain.status();
    } else if (base === 'brain.query') {
      result = await brain.query(args[0] || '', args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'brain.remember') {
      result = await brain.remember(args[0] || '', args[1] || 'fact', args[2] ? parseFloat(args[2]) : undefined);
    } else if (base === 'brain.recall') {
      result = await brain.recall(args[0] || '', args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'brain.reflect') {
      result = await brain.reflect();
    } else if (base === 'brain.dream') {
      result = await brain.dream();
    } else if (base === 'brain.reinforce') {
      result = await brain.reinforce(args[0] || '', args[1] ? parseFloat(args[1]) : undefined);
    } else if (base === 'brain.synthesize') {
      result = await brain.synthesize();
    } else if (base === 'brain.optimize') {
      const mode = args[0] as 'standard' | 'aggressive' | 'deep' || 'standard';
      result = await brain.optimize(mode);
    } else if (base === 'brain.tier') {
      const mode = args[0] as 'standard' | 'aggressive' | 'deep' || 'standard';
      result = await brain.tier(mode);
    } else if (base === 'brain.prune') {
      const threshold = args[0] ? parseFloat(args[0]) : 0.1;
      result = await brain.prune(threshold);
    } else if (base === 'brain.deep_think') {
      result = await brain.deepThink(args[0] || '', args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'brain.hypothesis_test') {
      result = await brain.hypothesisTest(args[0] || '');
    } else if (base === 'brain.cognitive_cycle') {
      result = await brain.cognitiveCycle();
    } else if (base === 'brain.continuous_learn') {
      result = await brain.continuousLearn(args[0] === 'true');
    } else if (base === 'brain.graph_build') {
      result = await brain.graphBuild();
    } else if (base === 'brain.graph_summary') {
      result = await brain.graphSummary();
    } else if (base === 'brain.graph') {
      const inspect = args.includes('--inspect');
      const stats = args.includes('--stats');
      const exportGraph = args.includes('--export');
      const page = args.find(a => !a.startsWith('--') && /^\d+$/.test(a));
      result = await substrate.invoke({ 
        module: 'brain', 
        action: 'graph', 
        payload: { inspect, stats, export: exportGraph, page: page ? parseInt(page) : undefined } 
      });
    } else if (base === 'brain.curiosity') {
      result = await brain.curiosity();
    } else if (base === 'brain.explore') {
      result = await brain.explore(args[0] || '');
    } else if (base === 'brain.patterns') {
      result = await brain.patterns();
    } else if (base === 'brain.session_reflection') {
      result = await brain.sessionReflection(args[0] ? parseInt(args[0]) : undefined);
    } else if (base === 'brain.coherence_check') {
      result = await brain.coherenceCheck(args[0] as 'standard' | 'deep' | undefined);
    } else if (base === 'brain.forecast') {
      result = await brain.forecast(args[0], args[1]);
    } else if (base === 'brain.forecast_eval') {
      result = await substrate.invoke({ module: 'brain', action: 'forecast_eval' });
    } else if (base === 'brain.causal') {
      result = await substrate.invoke({ module: 'brain', action: 'causal', payload: { query_id: args[0] } });
    } else if (base === 'brain.ethical') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Proposed action required\n  Usage: brain.ethical <proposed_action>' };
      }
      result = await substrate.invoke({ module: 'brain', action: 'ethical', payload: { content: args.join(' ') } });
    } else if (base === 'brain.self_critique') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Output content required\n  Usage: brain.self_critique <output> [output_type]' };
      }
      result = await substrate.invoke({ module: 'brain', action: 'self_critique', payload: { output: args[0], output_type: args[1] || 'text' } });
    } else if (base === 'brain.systems_reason') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: System and issue required\n  Usage: brain.systems_reason <system> <issue>' };
      }
      result = await substrate.invoke({ module: 'brain', action: 'systems_reason', payload: { system: args[0], issue: args.slice(1).join(' ') } });
    } else if (base === 'brain.pattern_fusion') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Problem required\n  Usage: brain.pattern_fusion <problem> [domain_1] [domain_2]' };
      }
      result = await substrate.invoke({ module: 'brain', action: 'pattern_fusion', payload: { problem: args[0], domain1: args[1], domain2: args[2] } });
    } else if (base === 'brain.synthesize_knowledge') {
      result = await substrate.invoke({ module: 'brain', action: 'synthesize_knowledge' });
    } else if (base === 'brain.lesson_compress') {
      result = await substrate.invoke({ module: 'brain', action: 'lesson_compress', payload: { timeframe: args[0] || 'last_hour' } });
    } else if (base === 'brain.curiosity_reflect') {
      result = await substrate.invoke({ module: 'brain', action: 'curiosity_reflect' });
    } else if (base === 'brain.tone_detect') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Message required\n  Usage: brain.tone_detect <message>' };
      }
      result = await substrate.invoke({ module: 'brain', action: 'tone_detect', payload: { message: args.join(' ') } });
    } else if (base === 'brain.insight_aggregate') {
      result = await substrate.invoke({ module: 'brain', action: 'insight_aggregate' });
    } else if (base === 'brain.insight_synthesize') {
      result = await substrate.invoke({ module: 'brain', action: 'insight_synthesize' });
    } else if (base === 'brain.temporal_score') {
      result = await substrate.invoke({ module: 'brain', action: 'temporal_score', payload: { query: args[0], context_type: args[1] } });
    } else if (base === 'brain.reflexive_plan') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Task required\n  Usage: brain.reflexive_plan <task> [context]' };
      }
      result = await substrate.invoke({ module: 'brain', action: 'reflexive_plan', payload: { task: args[0], context: args.slice(1).join(' ') || undefined } });
    } else if (base === 'brain.reward') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Memory ID required\n  Usage: brain.reward <memory_id> [reward_score] [outcome_type]' };
      }
      result = await substrate.invoke({ module: 'brain', action: 'reward', payload: { memory_id: args[0], reward_score: args[1] ? parseFloat(args[1]) : 0.1, outcome_type: args[2] || 'positive' } });
    } else if (base === 'brain.reinforce_cycle') {
      result = await substrate.invoke({ module: 'brain', action: 'reinforce_cycle', payload: { lookbackHours: args[0] ? parseInt(args[0]) : 24, minScore: args[1] ? parseFloat(args[1]) : 0.5 } });
    } else if (base === 'brain.persona_refine') {
      result = await substrate.invoke({ module: 'brain', action: 'persona_refine' });
    }

    // DECODE module
    else if (base === 'decode.status') {
      result = await decode.status();
    } else if (base === 'decode.chat') {
      result = await decode.chat(args[0] || '');
    } else if (base === 'decode.intent') {
      result = await decode.intent(args[0] || '');
    } else if (base === 'decode.dream') {
      result = await decode.dream();
    } else if (base === 'decode.propose') {
      result = await decode.propose(args[0] || '');
    } else if (base === 'decode.learn') {
      result = await decode.learn(args[0] || '', args[1]);
    }
    // DECODE Personality subsystem
    else if (base === 'decode.personality.list') {
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

    // DEFENSE module
    else if (base === 'defense.status') {
      result = await defense.status();
    } else if (base === 'defense.analyze') {
      result = await defense.analyze({}, args[0]);
    } else if (base === 'defense.reputation') {
      result = await defense.reputation(args[0] || '');
    } else if (base === 'defense.ip_intel') {
      result = await defense.ipIntel(args[0] || '', args[1] === 'true');
    } else if (base === 'defense.anomaly') {
      result = await defense.anomaly(args[0] as '1h' | '6h' | '24h' | undefined);
    } else if (base === 'defense.anomaly_probe') {
      result = await defense.anomalyProbe(args[0] ? parseInt(args[0]) : undefined);
    } else if (base === 'defense.posture') {
      result = await defense.posture();
    } else if (base === 'defense.limits') {
      result = await defense.limits();
    } else if (base === 'defense.rules') {
      result = await defense.rules();
    }

    // NEXUS module
    else if (base === 'nexus.status') {
      result = await nexus.status();
    } else if (base === 'nexus.route') {
      result = await nexus.route(args[0] || '');
    } else if (base === 'nexus.text') {
      result = await nexus.text(args[0] || '', args[1]);
    } else if (base === 'nexus.image') {
      result = await nexus.image(args[0] || '', args[1]);
    } else if (base === 'nexus.providers') {
      result = await nexus.providers();
    } else if (base === 'nexus.route_stats') {
      result = await nexus.routeStats();
    } else if (base === 'nexus.test') {
      result = await nexus.text(args[0] || 'Hello, substrate.', undefined);
    } else if (base === 'nexus.pulse') {
      result = await substrate.invoke({ module: 'nexus', action: 'pulse' });
    } else if (base === 'nexus.analytics') {
      result = await substrate.invoke({ module: 'nexus', action: 'analytics' });
    }

    // VISION module
    else if (base === 'vision.status') {
      result = await vision.status();
    } else if (base === 'vision.health') {
      result = await vision.health();
    } else if (base === 'vision.pulse') {
      result = await vision.pulse();
    } else if (base === 'vision.metrics') {
      result = await vision.metrics();
    } else if (base === 'vision.logs') {
      result = await vision.logs(args[0] as any, args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'vision.alert') {
      result = await vision.alert(args[0] as any || 'info', args.slice(1).join(' ') || 'Terminal alert');
    } else if (base === 'vision.audit') {
      result = await vision.audit(args[0], args[1]);
    } else if (base === 'vision.dashboard') {
      result = await vision.dashboard();
    } else if (base === 'vision.trace') {
      result = await vision.trace(args[0]);
    } else if (base === 'vision.monitor') {
      result = await vision.monitor();
    } else if (base === 'vision.resilience') {
      result = await vision.resilience();
    } else if (base === 'vision.analytics') {
      result = await vision.analytics();
    } else if (base === 'vision.health_snapshot') {
      result = await vision.healthSnapshot();
    } else if (base === 'vision.introspection') {
      result = await vision.introspection();
    } else if (base === 'vision.quota') {
      result = await vision.quota();
    } else if (base === 'vision.dependency_map') {
      result = await vision.dependencyMap();
    } else if (base === 'vision.anomalies') {
      // Parse --window flag from args
      const windowArg = args.find(a => a.startsWith('--window'));
      const windowVal = windowArg ? windowArg.split('=')[1] || args[args.indexOf(windowArg) + 1] : '1h';
      const limit = args[0] && !args[0].startsWith('--') ? parseInt(args[0]) : 10;
      result = await substrate.invoke({ module: 'vision', action: 'anomalies', payload: { limit, window: windowVal } });
    } else if (base === 'vision.mode') {
      const newMode = args[0] as 'passive' | 'advisory' | 'operative' | undefined;
      result = await substrate.invoke({ module: 'vision', action: 'mode', payload: { mode: newMode } });
    } else if (base === 'vision.replay') {
      const window = args[0] || '1h';
      result = await substrate.invoke({ module: 'vision', action: 'replay', payload: { window } });
    } else if (base === 'vision.inspect') {
      const links = args.includes('--links');
      result = await substrate.invoke({ module: 'vision', action: 'inspect', payload: { links } });
    } else if (base === 'vision.diagnostics') {
      const full = args.includes('--full');
      result = await substrate.invoke({ module: 'vision', action: 'diagnostics', payload: { full } });
    }

    // DREAM module
    else if (base === 'dream.status') {
      result = await dream.status();
    } else if (base === 'dream.mood') {
      result = await dream.mood(args[0]);
    } else if (base === 'dream.cycle') {
      result = await dream.cycle();
    } else if (base === 'dream.consume') {
      result = await dream.consume(args[0] || '');
    } else if (base === 'dream.interpret') {
      result = await dream.interpret(args.join(' ') || '');
    } else if (base === 'dream.mutate') {
      result = await dream.mutate();
    } else if (base === 'dream.reflect') {
      result = await dream.reflect();
    } else if (base === 'dream.feed') {
      result = await substrate.invoke({ module: 'dream', action: 'feed', payload: { dream_content: args[0] || '', dream_type: args[1] || 'dream' } });
    } else if (base === 'dream.awaken') {
      result = await substrate.invoke({ module: 'dream', action: 'awaken' });
    } else if (base === 'dream.pulse') {
      result = await substrate.invoke({ module: 'dream', action: 'pulse' });
    } else if (base === 'dream.anomalies') {
      const limit = args[0] ? parseInt(args[0]) : 10;
      const showResolved = args.includes('--resolved');
      result = await substrate.invoke({ module: 'dream', action: 'anomalies', payload: { limit, show_resolved: showResolved } });
    }

    // SYSTEM module
    else if (base === 'system.status') {
      result = await system.status();
      if (result?.success !== false) {
        const data = result?.data || result || {};
        return { success: true, output: formatSystemStatus(data), data };
      }
    } else if (base === 'system.health') {
      result = await system.health();
      if (result?.success !== false) {
        const data = result?.data || result || {};
        return { success: true, output: formatSystemHealth(data), data };
      }
    } else if (base === 'system.version') {
      result = await system.version();
    } else if (base === 'system.changelog' || base === 'system.evolution') {
      // Mobile-first evolution log display (organism-focused, no internals)
      const evolutionLog = formatEvolutionLogForTerminal();
      return { success: true, output: evolutionLog };
    } else if (base === 'system.config') {
      result = await system.config(args[0]);
    } else if (base === 'system.audit') {
      result = await system.audit();
    } else if (base === 'system.diagnostics') {
      try {
        const { collectDiagnostics } = await import('@/lib/substrate/diagnostics-aggregator');
        const diag = collectDiagnostics();
        const healthIcon = diag.overallHealth === 'healthy' ? '🟢' : diag.overallHealth === 'degraded' ? '🟡' : '🔴';
        
        let output = `
╔══════════════════════════════════════════════════════════════╗
║  SUBSTRATE DIAGNOSTICS                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Overall: ${healthIcon} ${diag.overallHealth.toUpperCase().padEnd(12)}  Timestamp: ${diag.timestamp.substring(11, 19)}       ║
╠══════════════════════════════════════════════════════════════╣
║  UPTIME                                                       ║
║  Since:       ${String(diag.uptime.bootTimestamp || 'N/A').substring(0, 19).padEnd(46)}║
║  Duration:    ${String(diag.uptime.uptimeFormatted || 'N/A').padEnd(46)}║
╠══════════════════════════════════════════════════════════════╣
║  MEMORY                                                       ║
║  Pressure:    ${String(diag.memory.level || 'normal').toUpperCase().padEnd(46)}║
╠══════════════════════════════════════════════════════════════╣
║  CIRCUIT BREAKERS                                             ║
║  Open:        ${String(diag.circuitBreakers.open).padEnd(3)}  Half-Open: ${String(diag.circuitBreakers.halfOpen).padEnd(3)}  Closed: ${String(diag.circuitBreakers.closed).padEnd(3)}  ║
╠══════════════════════════════════════════════════════════════╣
║  DEAD LETTER QUEUE                                            ║
║  Total:       ${String(diag.deadLetterQueue.total).padEnd(5)}                                           ║
╠══════════════════════════════════════════════════════════════╣
║  TELEMETRY SAMPLER                                            ║
║  Window Count: ${String(diag.telemetrySampler.currentWindowCount || 0).padEnd(5)}  Bursting: ${String(diag.telemetrySampler.isBursting).padEnd(5)}                ║
╠══════════════════════════════════════════════════════════════╣
║  METRICS CACHE                                                ║
║  Size:        ${String(diag.metricsCache.size || 0).padEnd(5)}  Modules: ${String(diag.metricsCache.moduleIds?.length || 0).padEnd(5)}                  ║
╠══════════════════════════════════════════════════════════════╣
║  SNAPSHOTS                                                    ║
║  Captures:    ${String(diag.snapshots.totalCaptures || 0).padEnd(5)}  Retained: ${String(diag.snapshots.retainedSnapshots || 0).padEnd(5)}                 ║
╚══════════════════════════════════════════════════════════════╝`;
        
        return { success: true, output, data: diag };
      } catch (err) {
        // Fallback to substrate.invoke
        const full = args.includes('--full');
        result = await substrate.invoke({ module: 'system', action: 'diagnostics', payload: { full } });
      }
    } else if (base === 'system.doctor') {
      // Quick diagnostics: env, DB, routing, providers
      try {
        const [sysResult, visionResult, nexusResult, defenseResult] = await Promise.allSettled([
          system.status(),
          vision.pulse(),
          substrate.invoke({ module: 'nexus', action: 'pulse' }),
          defense.posture(),
        ]);
        const sysOk = sysResult.status === 'fulfilled' && sysResult.value?.success !== false;
        const visOk = visionResult.status === 'fulfilled' && visionResult.value?.success !== false;
        const nexOk = nexusResult.status === 'fulfilled' && nexusResult.value?.success !== false;
        const defOk = defenseResult.status === 'fulfilled' && defenseResult.value?.success !== false;
        const allOk = sysOk && visOk && nexOk && defOk;
        const passed = [sysOk, visOk, nexOk, defOk].filter(Boolean).length;
        return {
          success: allOk,
          output: `
╔══════════════════════════════════════════════════════════════╗
║  SYSTEM DOCTOR — Quick Diagnostics                            ║
╠══════════════════════════════════════════════════════════════╣
║  ${sysOk ? '✅' : '❌'} System Status      ${sysOk ? 'PASS' : 'FAIL'}                                  ║
║  ${visOk ? '✅' : '❌'} Vision Pulse       ${visOk ? 'PASS' : 'FAIL'}                                  ║
║  ${nexOk ? '✅' : '❌'} Nexus Routing      ${nexOk ? 'PASS' : 'FAIL'}                                  ║
║  ${defOk ? '✅' : '❌'} Defense Posture    ${defOk ? 'PASS' : 'FAIL'}                                  ║
╠══════════════════════════════════════════════════════════════╣
║  Result: ${passed}/4 checks passed  ${allOk ? '🟢 HEALTHY' : '🟡 DEGRADED'}                      ║
╚══════════════════════════════════════════════════════════════╝`,
        };
      } catch (err) {
        return { success: false, output: `▓ Doctor error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'system.verify') {
      // Non-destructive verification of all 40 nodes
      const verbose = args.includes('--verbose');
      try {
        const moduleChecks = ALL_EXECUTION_SURFACES.map(async (mod) => {
          try {
            const r = await substrate.invoke({ module: mod.key as any, action: 'pulse' });
            return { key: mod.key, label: mod.label, layer: mod.layer, ok: r?.success !== false };
          } catch {
            return { key: mod.key, label: mod.label, layer: mod.layer, ok: false };
          }
        });
        const results = await Promise.allSettled(moduleChecks);
        const checks = results.map(r => r.status === 'fulfilled' ? r.value : { key: '?', label: '?', layer: '?', ok: false });
        const totalChecked = checks.length;
        const passed = checks.filter(c => c.ok).length;
        const failedCount = totalChecked - passed;
        let output = `
╔══════════════════════════════════════════════════════════════╗
║  SYSTEM VERIFY — Non-Destructive Module Check                 ║
╠══════════════════════════════════════════════════════════════╣
║  Modules Checked: ${String(totalChecked).padEnd(4)}  Passed: ${String(passed).padEnd(2)}    Failed: ${String(failedCount).padEnd(2)}           ║
╠══════════════════════════════════════════════════════════════╣`;
        for (const c of checks) {
          output += `\n║  ${c.ok ? '✅' : '❌'} ${c.label.padEnd(14)} [${c.layer.substring(0, 5).padEnd(5)}]  ${c.ok ? 'PASS' : 'FAIL'}                      ║`;
        }
        output += `
╠══════════════════════════════════════════════════════════════╣
║  Overall: ${failedCount === 0 ? '🟢 ALL SYSTEMS NOMINAL' : `🟡 ${failedCount} MODULE(S) NEED ATTENTION`}                       ║
╚══════════════════════════════════════════════════════════════╝`;
        return { success: failedCount === 0, output };
      } catch (err) {
        return { success: false, output: `▓ Verify error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'system.resilience') {
      const role = args[0] as 'observer' | 'operator' | undefined;
      result = await system.resilience(role);
    } else if (base === 'system.heal') {
      // Comprehensive healing: --all heals everything, specific module name heals that module
      const target = args[0]?.toLowerCase();
      const force = args.includes('--force') || args.includes('-f');
      
      if (!target) {
        return {
          success: false,
          output: `▓ ERROR: Module or --all required
  Usage: system.heal <module>   — Heal specific module
         system.heal --all      — Heal entire system
         system.heal --all --force  — Force-heal (reset all scores to 100%)
  
  Modules: ${ALL_EXECUTION_SURFACES.map(m => m.key).join(', ')}
  Subsystems: intent_mesh, autoblog, seba, shadow_mesh, clm, evolution_mesh, immunity_mesh`,
        };
      }
      
      if (target === '--all' || target === 'all') {
        // Full system heal: subsystems + circuit breakers + self-repair
        try {
          const { healAllSubsystems } = await import('@/lib/substrate/subsystem-health');
          const { runSelfRepair } = await import('@/lib/substrate/system/selfRepairLoop');
          const { resetBreaker } = await import('@/lib/substrate/circuit-breaker');
          
          // 1. Reset all 40 node circuit breakers
          const breakerResets: string[] = [];
          for (const mod of ALL_EXECUTION_SURFACES) {
            try {
              resetBreaker(mod.key);
              breakerResets.push(mod.label);
            } catch { /* skip */ }
          }
          
          // 2. Heal all subsystems
          const subsystemResults = await healAllSubsystems(force);
          
          // 3. Run self-repair loop
          const repairReport = await runSelfRepair(2);
          
          const subsystemOk = subsystemResults.filter(r => r.ok).length;
          const totalSubs = subsystemResults.length;
          const allOk = subsystemResults.every(r => r.ok) && repairReport.stable;
          
          let output = `
╔══════════════════════════════════════════════════════════════╗
║  SYSTEM HEAL — FULL RECOVERY ${force ? '(FORCED)' : ''}                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌─ CIRCUIT BREAKERS ────────────────────────────────────────║
║  │  Reset: ${breakerResets.length}/${ALL_EXECUTION_SURFACES.length} node breakers cleared                    ║
║  └───────────────────────────────────────────────────────────║
║                                                              ║
║  ┌─ SUBSYSTEM HEALING ───────────────────────────────────────║`;

          for (const sr of subsystemResults) {
            output += `
║  │  ${sr.ok ? '✅' : '❌'} ${sr.subsystem.padEnd(18)} ${sr.previousScore}% → ${sr.newScore}%  (${sr.actions.length} actions)  ║`;
          }
          
          output += `
║  └───────────────────────────────────────────────────────────║
║                                                              ║
║  ┌─ SELF-REPAIR ─────────────────────────────────────────────║
║  │  Attempts: ${repairReport.attempts}/${repairReport.maxAttempts}                                        ║
║  │  Repairs applied: ${repairReport.repairs.length}                                    ║
║  │  System stable: ${repairReport.stable ? '✅ YES' : '❌ NO'}                                   ║
║  └───────────────────────────────────────────────────────────║
║                                                              ║
║  Result: ${allOk ? '🟢 SYSTEM HEALED' : '🟡 PARTIAL HEAL — some issues remain'}              ║
║  Subsystems: ${subsystemOk}/${totalSubs} healthy                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;

          return { success: allOk, output };
        } catch (err) {
          return { success: false, output: `▓ System heal error: ${err instanceof Error ? err.message : 'Unknown'}` };
        }
      }
      
      // Check if target is a known subsystem
      const SUBSYSTEM_IDS = ['intent_mesh', 'autoblog', 'seba', 'shadow_mesh', 'clm', 'evolution_mesh', 'immunity_mesh'];
      if (SUBSYSTEM_IDS.includes(target)) {
        try {
          const { healSubsystem } = await import('@/lib/substrate/subsystem-health');
          const healResult = await healSubsystem(target as any, force);
          return {
            success: healResult.ok,
            output: `${healResult.ok ? '✅' : '❌'} ${target}: ${healResult.previousScore}% → ${healResult.newScore}% (${healResult.actions.join(', ')})`,
          };
        } catch (err) {
          return { success: false, output: `▓ Heal error for ${target}: ${err instanceof Error ? err.message : 'Unknown'}` };
        }
      }
      
      // Check if target is a known node (from ALL_EXECUTION_SURFACES)
      const node = ALL_EXECUTION_SURFACES.find(m => m.key === target || m.label.toLowerCase() === target);
      if (node) {
        try {
          const { resetBreaker } = await import('@/lib/substrate/circuit-breaker');
          resetBreaker(node.key);
          
          // Also try to pulse the module to verify it's responsive
          let pulseOk = true;
          try {
            await substrate.invoke({ module: node.key as any, action: 'pulse' });
          } catch { pulseOk = false; }
          
          return {
            success: true,
            output: `✅ ${node.label} [${node.layer}]: Circuit breaker reset, pulse ${pulseOk ? 'OK' : 'failed (module may need restart)'}`,
          };
        } catch (err) {
          return { success: false, output: `▓ Heal error for ${node.label}: ${err instanceof Error ? err.message : 'Unknown'}` };
        }
      }
      
      return { success: false, output: `▓ Unknown module: '${target}'\n  Use system.heal --all for full system heal.` };
    } else if (base === 'system.fix') {
      // Audit + auto-repair in one shot
      try {
        const { runSystemAudit } = await import('@/lib/substrate/system/auditRunner');
        const { runSelfRepair } = await import('@/lib/substrate/system/selfRepairLoop');
        
        // 1. Run audit
        const auditReport = await runSystemAudit();
        const failures = auditReport.results.filter(r => !r.ok);
        
        if (failures.length === 0) {
          return {
            success: true,
            output: `╔══════════════════════════════════════════════════════════════╗
║  SYSTEM FIX — Audit + Auto-Repair                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Audit Result: ✅ ALL SUBSYSTEMS HEALTHY                      ║
║  Checked:      ${String(auditReport.results.length).padEnd(3)} subsystems                                ║
║  Failures:     0                                              ║
║                                                              ║
║  No repair needed. System is stable.                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`,
          };
        }
        
        // 2. Run self-repair
        const repairReport = await runSelfRepair(3);
        
        let output = `╔══════════════════════════════════════════════════════════════╗
║  SYSTEM FIX — Audit + Auto-Repair                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌─ INITIAL AUDIT ────────────────────────────────────────────║
║  │  Subsystems: ${String(auditReport.results.length).padEnd(3)}  Failures: ${String(failures.length).padEnd(3)}                     ║`;
        
        for (const f of failures) {
          output += `
║  │  ❌ ${f.module.padEnd(18)} ${(f.detail || 'degraded').substring(0, 30)}    ║`;
        }
        
        output += `
║  └────────────────────────────────────────────────────────────║
║                                                              ║
║  ┌─ REPAIR ACTIONS ───────────────────────────────────────────║
║  │  Attempts: ${repairReport.attempts}/${repairReport.maxAttempts}                                        ║`;
        
        for (const r of repairReport.repairs) {
          output += `
║  │  ${r.repaired ? '✅' : '❌'} ${r.module.padEnd(18)} ${r.message.substring(0, 30)}    ║`;
        }
        
        output += `
║  └────────────────────────────────────────────────────────────║
║                                                              ║
║  ┌─ FINAL STATUS ─────────────────────────────────────────────║
║  │  Stable: ${repairReport.stable ? '✅ YES' : '❌ NO'}                                           ║
║  │  Final failures: ${String(repairReport.finalAudit.results.filter(r => !r.ok).length).padEnd(3)}                                ║
║  └────────────────────────────────────────────────────────────║
║                                                              ║
║  Result: ${repairReport.stable ? '🟢 SYSTEM FIXED' : '🟡 PARTIAL FIX — manual intervention may be needed'}   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
        
        return { success: repairReport.stable, output };
      } catch (err) {
        return { success: false, output: `▓ System fix error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'system.repair') {
      // Self-repair loop (3 attempts)
      try {
        const { runSelfRepair } = await import('@/lib/substrate/system/selfRepairLoop');
        const maxAttempts = args[0] ? parseInt(args[0]) : 3;
        const report = await runSelfRepair(maxAttempts);
        
        let output = `╔══════════════════════════════════════════════════════════════╗
║  SYSTEM REPAIR — Self-Repair Loop                              ║
╠══════════════════════════════════════════════════════════════╣
║  Attempts:  ${report.attempts}/${report.maxAttempts}                                             ║
║  Stable:    ${report.stable ? '✅ YES' : '❌ NO'}                                              ║
╠══════════════════════════════════════════════════════════════╣`;
        
        if (report.repairs.length > 0) {
          output += `\n║  REPAIRS APPLIED                                              ║\n╠══════════════════════════════════════════════════════════════╣`;
          for (const r of report.repairs) {
            output += `\n║  ${r.repaired ? '✅' : '❌'} ${r.module.padEnd(18)} ${r.message.substring(0, 32).padEnd(32)}║`;
          }
        } else {
          output += `\n║  No repairs were needed.                                      ║`;
        }
        
        const finalFailures = report.finalAudit.results.filter(r => !r.ok);
        if (finalFailures.length > 0) {
          output += `\n╠══════════════════════════════════════════════════════════════╣`;
          output += `\n║  REMAINING ISSUES (${finalFailures.length})                                       ║`;
          for (const f of finalFailures) {
            output += `\n║  ⚠ ${f.module.padEnd(18)} ${(f.detail || 'degraded').substring(0, 32).padEnd(32)}║`;
          }
        }
        
        output += `\n╚══════════════════════════════════════════════════════════════╝`;
        
        return { success: report.stable, output };
      } catch (err) {
        return { success: false, output: `▓ Repair error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'system.restart') {
      result = await system.restart(args[0]);
    } else if (base === 'system.backup') {
      result = await system.backup({ include_data: args[0] !== 'false' });
    } else if (base === 'system.restore') {
      result = await system.restore(args[0] || '', args[1] === 'true');
    } else if (base === 'system.restore_portable') {
      // Portable backup restore (governor only) - expects JSON input or file reference
      const effTier: CommandTier = userTier || (isOperator ? 'creator' : 'free');
      if (!meetsRequiredTier(effTier, 'governor')) {
        return { success: false, output: `▓ ACCESS DENIED: GOVERNOR tier required for 'system.restore_portable'\n  Your tier: ${getTierLabel(effTier)}\n  Upgrade at cmpsbl.com/pricing to unlock this command.` };
      }
      // Parse mode from args
      const dryRun = args.includes('--dry-run');
      const modeArg = args.find(a => a.startsWith('--mode='));
      const mode = modeArg ? modeArg.split('=')[1] as 'merge' | 'replace' : 'merge';
      
      // Check if JSON was provided (would be in first arg as parsed JSON string)
      const jsonArg = args.find(a => a.startsWith('{') || a === '--json');
      if (!jsonArg || jsonArg === '--json') {
        return { 
          success: false, 
          output: `▓ USAGE: system.restore_portable requires a JSON export package

┌─ PORTABLE BACKUP RESTORE ────────────────────────────────────
│
│  Usage:
│    system.restore_portable <json_file_content> [--dry-run] [--mode=merge|replace]
│
│  Options:
│    --dry-run      Validate without restoring
│    --mode=merge   Upsert rows (default)
│    --mode=replace Truncate tables first
│
│  For large backups, use the System panel in /os dashboard.
│  Upload the portable JSON file there for processing.
│
└──────────────────────────────────────────────────────────────`
        };
      }
      
      try {
        const exportPackage = JSON.parse(jsonArg);
        const res = await system.restorePortable({ export_package: exportPackage, dry_run: dryRun, mode });
        result = { success: !res.error, data: res.data, error: res.error?.message };
      } catch (e) {
        result = { success: false, error: `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}` };
      }
    } else if (base === 'system.list_backups') {
      result = await system.listBackups();
    } else if (base === 'system.upgrade.propose') {
      const res = await system.upgrade.propose({ scope: args[0], notes: args.slice(1).join(' ') });
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'system.upgrade.list') {
      const res = await system.upgrade.listPlans();
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'system.upgrade.apply') {
      const res = await system.upgrade.applyPlan(args[0] || '');
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'system.upgrade.rollback') {
      const res = await system.upgrade.rollbackPlan(args[0] || '');
      result = { success: !res.error, data: res.data, error: res.error?.message };
    }
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
║    2: + module-status-polling (40 node status calls)          ║
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

    // EVOLUTION node (via substrate) — handles both evolution.* and legacy modernizer.* commands
    else if (base === 'evolution.status' || base === 'modernizer.status') {
      result = await modernizer.status();
    } else if (base === 'evolution.jobs' || base === 'modernizer.jobs') {
      const limit = args[0] ? parseInt(args[0]) : 10;
      result = await modernizer.jobs(limit);
    }
    // ═══ EVOLUTION CYCLE ═══
    else if (base === 'evolution.evolve' || base === 'modernizer.evolve') {
      const { evolutionCycle } = await import('@/lib/substrate/evolution-cycle');
      
      // Parse target from args
      const targetArg = args[0]?.toLowerCase();
      const hasConfirm = args.includes('--confirm') || args.includes('-y');
      const depthArg = args.find(a => ['quick', 'standard', 'deep'].includes(a)) as 'quick' | 'standard' | 'deep' | undefined;
      
      let target: 'scan' | 'shadow' | 'production' | 'verify' | 'abort' | 'status' = 'scan';
      if (targetArg === 'shadow' || targetArg === 'apply_shadow') target = 'shadow';
      else if (targetArg === 'production' || targetArg === 'apply_production' || targetArg === 'prod') target = 'production';
      else if (targetArg === 'verify' || targetArg === 'test') target = 'verify';
      else if (targetArg === 'abort' || targetArg === 'cancel' || targetArg === 'delete') target = 'abort';
      else if (targetArg === 'status' || targetArg === 'state') target = 'status';
      
      const cycleResult = await evolutionCycle.evolve({
        target,
        depth: depthArg || 'standard',
        confirm_override: hasConfirm,
      });
      
      // Handle confirmation prompt
      if (cycleResult.requires_confirmation) {
        return {
          success: false,
          output: `
┌─ EVOLUTION CYCLE — CONFIRMATION REQUIRED ────────────────────
│
│  ⚠  An active evolution plan exists: ${cycleResult.existing_plan_id}
│
│  Running a new scan will DELETE the existing plan and
│  start a fresh Evolution Cycle.
│
│  To confirm override, run:
│    evolution.evolve --confirm
│
│  To view current plan status:
│    evolution.evolve status
│
│  To abort current plan:
│    evolution.evolve abort
│
└──────────────────────────────────────────────────────────────`,
        };
      }
      
      // Format evolution result
      const phaseIcon = cycleResult.success ? '✓' : '✗';
      const phaseDisplay = cycleResult.phase.toUpperCase().replace('_', ' ');
      
      let output = `
┌─ EVOLUTION CYCLE ────────────────────────────────────────────
│
│  ${phaseIcon} Phase: ${phaseDisplay}`;
      
      // Show BOTH short ID and full ID (mobile-friendly)
      if (cycleResult.plan_id) {
        output += `
│
│  Short ID: ${cycleResult.short_id}
│  Full ID:
│    ${cycleResult.plan_id}`;
      }
      
      output += `
│
│  ${cycleResult.message}
│`;

      // Add scan results if available
      const data = cycleResult.data as any;
      if (data?.scan_results) {
        const sr = data.scan_results;
        output += `
│  ┌─ SCAN RESULTS ───────────────────────────────────────────
│  │  Modules scanned: ${sr.modules_scanned}
│  │  Improvements found: ${sr.improvements_found}
│  │  Risk level: ${sr.risk_level}
│  │  Health before: ${sr.health_before}%
│  └──────────────────────────────────────────────────────────`;
      }
      
      // Add verification results if available
      if (data?.verification) {
        const v = data.verification;
        output += `
│  ┌─ VERIFICATION ───────────────────────────────────────────
│  │  Tests run: ${v.tests_run}
│  │  Tests passed: ${v.tests_passed}
│  │  Health after: ${v.health_after}%
│  │  Health delta: ${v.health_delta >= 0 ? '+' : ''}${v.health_delta}%
│  └──────────────────────────────────────────────────────────`;
      }
      
      // Add next steps with full plan IDs
      const planRef = cycleResult.plan_id || '<plan_id>';
      if (cycleResult.success && cycleResult.phase === 'planning') {
        output += `
│
│  Next steps:
│    evolution.evolve shadow           — Apply to shadow
│    evolution.evolve production       — Promote to production
│    evolution.evolve verify           — Run verification
│
│  Or use full plan ID:
│    evolution.review ${planRef}`;
      } else if (cycleResult.phase === 'shadow_applied') {
        output += `
│
│  Next step:
│    evolution.evolve production       — Promote to production
│    evolution.evolve verify           — Verify changes`;
      }
      
      output += `
│
└──────────────────────────────────────────────────────────────`;
      
      return { success: cycleResult.success, output };
    }
    else if (base === 'evolution.scan' || base === 'modernizer.scan') {
      // Cognitive Systems Scan with options
      const hasExplain = args.includes('--explain');
      const hasLLMReport = args.includes('--llm-report');
      const hasDryRun = args.includes('--dry-run');
      
      // Import and execute the new scan pipeline
      try {
        const { evolutionScan, formatScanResult } = await import('@/lib/evolve/scan');
        const scanResult = await evolutionScan({
          explain: hasExplain,
          llm_report: hasLLMReport,
          dry_run: hasDryRun,
        });
        
        return {
          success: scanResult.plan_ready || scanResult.proposals.length === 0,
          output: formatScanResult(scanResult, { explain: hasExplain, llm_report: hasLLMReport, dry_run: hasDryRun }),
          data: scanResult,
        };
      } catch (err) {
        // Fallback to legacy scan if new pipeline not available
        const depth = args[0] as 'quick' | 'standard' | 'deep' | undefined;
        result = await modernizer.scan({ depth: depth || 'standard' });
      }
    // NOTE: modernizer.analyze is handled by Omega Observer Engine (see line ~1354)
    // Legacy handler removed to prevent duplicate handling
    } else if (base === 'evolution.export' || base === 'modernizer.export') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: evolution.export <job_id>' };
      }
      result = await modernizer.export(args[0]);
    } else if (base === 'evolution.quota' || base === 'modernizer.quota') {
      result = await modernizer.quota();
    } else if (base === 'evolution.pulse' || base === 'modernizer.pulse') {
      result = await modernizer.pulse();
    } else if (base === 'evolution.propose' || base === 'modernizer.propose') {
      const scope = args[0] || 'all';
      const notes = args.slice(1).join(' ') || '';
      result = await modernizer.propose({ scope, notes });
    } else if (base === 'evolution.plans' || base === 'modernizer.plans') {
      result = await modernizer.plans();
    } else if (base === 'evolution.review' || base === 'modernizer.review') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.review <plan_id>' };
      }
      result = await modernizer.review(args[0]);
    } else if (base === 'evolution.validate' || base === 'modernizer.validate') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.validate <plan_id>' };
      }
      const res = await modernizer.validate(args[0]);
      const errObj = res.error as any;
      const errMsg = typeof errObj === 'string' ? errObj : errObj?.message;
      result = { success: !res.error, data: res.data, error: errMsg };
    } else if (base === 'evolution.diff' || base === 'modernizer.diff') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.diff <plan_id>' };
      }
      // Resolve short plan ID to full UUID (matching other commands)
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found\n  Use 'evolution.plans' to list available plans.` };
      }
      const res = await modernizer.diff(planId);
      const data = res.data as any;
      const errObj = res.error as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = typeof errObj === 'string' ? errObj : (errObj?.message || data?.error_message || data?.error || 'Diff view failed');
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'evolution.apply' || base === 'modernizer.apply') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.apply <plan_id>\n\n  Workflow: proposed → shadow_applied → applied (production)' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found\n  Use 'evolution.plans' to list available plans.` };
      }
      const res = await modernizer.apply(planId);
      // Check both fetch error and success:false in response data
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Apply failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'evolution.apply_shadow' || base === 'modernizer.apply_shadow') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.apply_shadow <plan_id>' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found\n  Use 'evolution.plans' to list available plans.` };
      }
      const res = await modernizer.applyShadow(planId);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Shadow apply failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'evolution.test_shadow' || base === 'modernizer.test_shadow') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.test_shadow <plan_id>' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found` };
      }
      const res = await modernizer.testShadow(planId);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Shadow test failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'evolution.apply_production' || base === 'modernizer.apply_production') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.apply_production <plan_id>\n\n  Note: Plan must be in shadow_applied status first.' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found\n  Use 'evolution.plans' to list available plans.` };
      }
      const res = await modernizer.applyProduction(planId);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Production apply failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'evolution.rollback' || base === 'modernizer.rollback') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.rollback <plan_id>' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found` };
      }
      const res = await modernizer.rollback(planId);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Rollback failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'evolution.delete' || base === 'modernizer.delete') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.delete <plan_id> [reason]' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found` };
      }
      const res = await modernizer.delete(planId, args.slice(1).join(' ') || undefined);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Delete failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'evolution.applied' || base === 'modernizer.applied') {
      const res = await modernizer.applied();
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Failed to fetch applied';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'evolution.archived' || base === 'modernizer.archived') {
      result = await modernizer.archived();
    } else if (base === 'evolution.implement' || base === 'modernizer.implement') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Both archived_function and target_action required\n  Usage: evolution.implement <archived_function> <target_action>\n  Example: evolution.implement pf-brain-systems-reasoning brain.deep_think' };
      }
      result = await modernizer.implement(args[0], args[1]);
    } else if (base === 'evolution.refresh' || base === 'modernizer.refresh') {
      result = await substrate.invoke({ module: 'evolution', action: 'refresh' });
    } else if (base === 'evolution.autopilot' || base === 'modernizer.autopilot') {
      result = await substrate.invoke({ module: 'evolution', action: 'autopilot' });
    } else if (base === 'evolution.confidence' || base === 'modernizer.confidence') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: evolution.confidence <plan_id>' };
      }
      result = await substrate.invoke({ module: 'evolution', action: 'confidence', payload: { plan_id: args[0] } });
    } else if (base === 'evolution.stamps' || base === 'modernizer.stamps') {
      const limit = parseInt(args[0]) || 10;
      try {
        const { data: stamps, error } = await supabase
          .from('brain_events')
          .select('*')
          .eq('event_type', 'evolution_stamp')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) return { success: false, output: `▓ Stamp query error: ${error.message}` };
        if (!stamps || stamps.length === 0) {
          return { success: true, output: '◉ No evolution stamps found\n  Stamps are created when evolutions apply to production.\n  Run: evolution.evolve → shadow → production to generate stamps.' };
        }
        let output = `╔══════════════════════════════════════════════════════════════╗\n║  EVOLUTION STAMPS — Verification Trail                        ║\n╠══════════════════════════════════════════════════════════════╣\n`;
        for (const stamp of stamps) {
          const data = stamp.data as Record<string, any>;
          output += `║  🔏 ${data?.stamp_id || 'N/A'}\n║     Plan: ${(data?.plan_id || 'N/A').substring(0, 8)}  |  Type: ${data?.change_type || 'evolution'}  |  ${new Date(stamp.created_at).toLocaleDateString()}\n╠──────────────────────────────────────────────────────────────╣\n`;
        }
        output = output.slice(0, -67) + '╚══════════════════════════════════════════════════════════════╝';
        return { success: true, output, data: stamps };
      } catch (err) {
        return { success: false, output: `▓ Stamps error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══ CIRCUIT BREAKER, AUTONOMY, RECEIPTS ═══
    else if (base === 'evolution.circuit' || base === 'modernizer.circuit') {
      const subCmd = args[0] || 'status';
      if (subCmd === 'status') {
        try {
          const { circuitBreaker } = await import('@/lib/evolve/circuit-breaker');
          const status = await circuitBreaker.getStatus();
          return {
            success: true,
            output: `╔══════════════════════════════════════════════════════════════╗
║  EVOLUTION CIRCUIT BREAKER                                   ║
╠══════════════════════════════════════════════════════════════╣
║  State: ${status.state.toUpperCase().padEnd(8)} ${status.state === 'open' ? '🔴 BLOCKING' : '🟢 READY'}              ║
║  Can Evolve: ${status.can_evolve ? 'YES' : 'NO '}                                           ║
${status.trip_reason ? `║  Trip Reason: ${status.trip_reason.substring(0, 40).padEnd(40)}  ║\n` : ''}${status.auto_reset_after ? `║  Auto Reset: ${status.auto_reset_after.padEnd(20)}                    ║\n` : ''}╚══════════════════════════════════════════════════════════════╝`,
            data: status,
          };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to get circuit status'}` };
        }
      } else if (subCmd === 'reset') {
        try {
          const { resetCircuit } = await import('@/lib/evolve/circuit-breaker');
          const result = await resetCircuit('Manual reset via terminal');
          return { success: result.success, output: result.message };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to reset circuit'}` };
        }
      } else if (subCmd === 'open') {
        const reason = args.slice(1).join(' ') || 'Manual trip via terminal';
        try {
          const { tripCircuit } = await import('@/lib/evolve/circuit-breaker');
          const result = await tripCircuit(reason);
          return { success: result.success, output: result.message };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to trip circuit'}` };
        }
      } else {
        return { success: false, output: '▓ ERROR: Invalid subcommand\n  Usage: evolution.circuit [status|reset|open <reason>]' };
      }
    } else if (base === 'evolution.autonomy' || base === 'modernizer.autonomy') {
      const subCmd = args[0] || 'status';
      if (subCmd === 'status') {
        try {
          const { getAutonomyStatus } = await import('@/lib/evolve/autonomy');
        const status = await getAutonomyStatus();
          return {
            success: true,
            output: `╔══════════════════════════════════════════════════════════════╗
║  GOVERNED AUTONOMY                                           ║
╠══════════════════════════════════════════════════════════════╣
║  Mode: ${status.mode.toUpperCase().padEnd(12)}                                    ║
║  Can Auto-Evolve: ${status.can_auto_evolve ? 'YES' : 'NO '}                                     ║
║  Confidence Threshold: ${(status.confidence_threshold * 100).toFixed(0)}%                             ║
║  Runs Today: ${status.runs_today}/${status.max_runs_today}                                         ║
${status.blocking_reasons.length > 0 ? `║  Blockers: ${status.blocking_reasons[0].substring(0, 40).padEnd(40)}    ║\n` : ''}╚══════════════════════════════════════════════════════════════╝`,
            data: status,
          };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to get autonomy status'}` };
        }
      } else if (subCmd === 'set') {
        const mode = args[1];
        if (!mode || !['off', 'advisory', 'governed'].includes(mode)) {
          return { success: false, output: '▓ ERROR: Invalid mode\n  Usage: evolution.autonomy set <off|advisory|governed>' };
        }
        try {
          const { setAutonomyMode } = await import('@/lib/evolve/autonomy');
          const result = await setAutonomyMode(mode as 'off' | 'advisory' | 'governed');
          return { success: result.success, output: result.message };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to set autonomy mode'}` };
        }
      } else {
        return { success: false, output: '▓ ERROR: Invalid subcommand\n  Usage: evolution.autonomy [status|set <mode>]' };
      }
    } else if (base === 'evolution.receipts' || base === 'modernizer.receipts') {
      const limit = args[0] ? parseInt(args[0]) : 10;
      try {
        const { modernizerCommands } = await import('@/lib/evolve/modernizer-commands');
        const res = await modernizerCommands.receipts(limit);
        return { success: res.success, output: res.formatted || JSON.stringify(res.data, null, 2), data: res.data };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to get receipts'}` };
      }
    } else if (base === 'evolution.receipt' || base === 'modernizer.receipt') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Run ID required\n  Usage: evolution.receipt <run_id>' };
      }
      try {
        const { modernizerCommands } = await import('@/lib/evolve/modernizer-commands');
        const res = await modernizerCommands.receipt(args[0]);
        return { success: res.success, output: res.formatted || JSON.stringify(res.data, null, 2), data: res.data };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to get receipt'}` };
      }
    }

    // ═══ OMEGA OBSERVER ENGINE ═══
    else if (base === 'evolution.verify' || base === 'modernizer.verify') {
      try {
        const { checkEligibility, formatEligibility } = await import('@/lib/evolve/eligibility-gate');
        const { evolutionRuns } = await import('@/lib/evolve/evolution-runs');
        const { evolutionReceipts } = await import('@/lib/evolve/evolution-receipts');
        
        const eligibility = await checkEligibility();
        const activeRun = await evolutionRuns.getActiveRun();
        const recentRuns = await evolutionRuns.getAllRuns(10);
        
        const lines = [formatEligibility(eligibility)];
        
        // Show active run verification status
        if (activeRun) {
          lines.push('');
          lines.push('╔══════════════════════════════════════════════════════════════╗');
          lines.push('║  ACTIVE RUN VERIFICATION                                     ║');
          lines.push('╠══════════════════════════════════════════════════════════════╣');
          lines.push(`║  Run ID:  ${activeRun.run_id.slice(0, 16)}...`);
          lines.push(`║  Phase:   ${activeRun.phase}`);
          lines.push(`║  Risk:    ${activeRun.risk_level}`);
          lines.push(`║  Conf:    ${activeRun.confidence_score !== null ? (activeRun.confidence_score * 100).toFixed(0) + '%' : 'N/A'}`);
          lines.push('╚══════════════════════════════════════════════════════════════╝');
        }
        
        // Show runs in planning/scan stage
        const planningRuns = recentRuns.filter(r => (r.phase as string) === 'planning' || (r.phase as string) === 'scanning' || (r.phase as string) === 'plan_created');
        if (planningRuns.length > 0) {
          lines.push('');
          lines.push('╔══════════════════════════════════════════════════════════════╗');
          lines.push('║  PLANS STAGE — SCAN VERIFICATION                             ║');
          lines.push('╠══════════════════════════════════════════════════════════════╣');
          for (const run of planningRuns.slice(0, 3)) {
            const meta = run.metadata || {};
            const actions = (meta.total_actions as number) || 0;
            const confidence = run.confidence_score !== null ? `${(run.confidence_score * 100).toFixed(0)}%` : 'N/A';
            lines.push(`║  📋 ${run.run_id.slice(0, 12)} │ Phase: ${run.phase.padEnd(14)} │ Actions: ${actions}`);
            lines.push(`║     Confidence: ${confidence} │ Risk: ${run.risk_level || 'unknown'}`);
          }
          lines.push('╚══════════════════════════════════════════════════════════════╝');
        }
        
        // Show shadow runs awaiting verification
        const shadowRuns = recentRuns.filter(r => r.phase === 'shadow_applied' || (r.phase as string) === 'shadow_testing');
        if (shadowRuns.length > 0) {
          lines.push('');
          lines.push('╔══════════════════════════════════════════════════════════════╗');
          lines.push('║  SHADOW APPLIED — AWAITING VERIFICATION                      ║');
          lines.push('╠══════════════════════════════════════════════════════════════╣');
          for (const run of shadowRuns.slice(0, 3)) {
            const meta = run.metadata || {};
            const actions = (meta.total_actions as number) || 0;
            lines.push(`║  🔬 ${run.run_id.slice(0, 12)} │ Phase: ${run.phase}`);
            lines.push(`║     Actions: ${actions} │ Ready for: evolution.evolve production`);
          }
          lines.push('╚══════════════════════════════════════════════════════════════╝');
        }
        
        // Show before/after stats from recent completed runs
        const completedRuns = recentRuns.filter(r => r.phase === 'verified' || r.phase === 'production_applied');
        if (completedRuns.length > 0) {
          lines.push('');
          lines.push('╔══════════════════════════════════════════════════════════════╗');
          lines.push('║  COMPLETED EVOLUTION STATS (before → after)                  ║');
          lines.push('╠══════════════════════════════════════════════════════════════╣');
          for (const run of completedRuns.slice(0, 3)) {
            const receipts = await evolutionReceipts.getReceiptsForRun(run.run_id);
            const receipt = receipts[0];
            if (receipt?.health_before && receipt?.health_after) {
              const before = receipt.health_before.overall_score;
              const after = receipt.health_after.overall_score;
              const delta = after - before;
              const arrow = delta >= 0 ? '↑' : '↓';
              const icon = delta >= 0 ? '✅' : '⚠️';
              lines.push(`║  ${icon} ${run.run_id.slice(0, 12)} │ Health: ${(before * 100).toFixed(1)}% → ${(after * 100).toFixed(1)}% (${arrow}${Math.abs(delta * 100).toFixed(1)}%)`);
              lines.push(`║     Changes: ${receipt.changes_applied.length} │ Tests: ${receipt.tests_passed}/${receipt.tests_run}`);
            } else {
              const meta = run.metadata || {};
              lines.push(`║  ⏳ ${run.run_id.slice(0, 12)} │ Phase: ${run.phase} │ Actions: ${(meta.total_actions as number) || 0}`);
            }
          }
          lines.push('╚══════════════════════════════════════════════════════════════╝');
        }
        
        // Summary
        const totalRuns = recentRuns.length;
        const successCount = completedRuns.length;
        const pendingCount = planningRuns.length + shadowRuns.length;
        lines.push('');
        lines.push(`📊 Summary: ${totalRuns} recent runs │ ${successCount} completed │ ${pendingCount} pending │ ${activeRun ? '1 active' : '0 active'}`);
        
        return {
          success: true,
          output: lines.join('\n'),
          data: { eligibility, activeRun, completedRuns: completedRuns.length, planningRuns: planningRuns.length, shadowRuns: shadowRuns.length },
        };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Verify failed'}` };
      }
    }
    
    else if (base === 'modernizer.analyze') {
      try {
        const { analyzeForwardIntent, formatAnalysis } = await import('@/lib/evolve/forward-analyzer');
        const result = await analyzeForwardIntent();
        
        return {
          success: true,
          output: formatAnalysis(result),
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Analyze failed'}` };
      }
    }
    
    else if (base === 'modernizer.forensics') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Component required\n  Usage: modernizer.forensics <component> [--since 24h|7d|last_run]' };
      }
      try {
        const { runForensics, formatForensics } = await import('@/lib/evolve/forensics');
        const component = args[0];
        const sinceArg = args.find(a => a.startsWith('--since'))?.split('=')[1] || 
                         (args.indexOf('--since') !== -1 ? args[args.indexOf('--since') + 1] : '24h');
        
        const result = await runForensics(component, sinceArg as 'last_phase' | 'last_run' | '24h' | '7d' | '30d');
        
        return {
          success: true,
          output: formatForensics(result),
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Forensics failed'}` };
      }
    }
    
    else if (base === 'modernizer.omega') {
      try {
        const { observeOmega, formatOmega, formatOmegaCompact } = await import('@/lib/evolve/omega-observer');
        
        // Parse component (optional now)
        const component = args[0] && !args[0].startsWith('--') ? args[0] : undefined;
        
        // Parse --since flag
        const sinceArg = args.find(a => a.startsWith('--since'))?.split('=')[1] || 
                         (args.indexOf('--since') !== -1 ? args[args.indexOf('--since') + 1] : '24h');
        
        // Parse --compact flag
        const isCompact = args.includes('--compact') || args.includes('-c');
        
        const result = await observeOmega(component, sinceArg as 'last_phase' | 'last_run' | '24h' | '7d' | '30d');
        
        return {
          success: true,
          output: isCompact ? formatOmegaCompact(result) : formatOmega(result),
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Omega observation failed'}` };
      }
    }

    else if (base === 'core.status') {
      result = await core.status();
    } else if (base === 'core.pulse') {
      result = await core.pulse();
    } else if (base === 'core.boot') {
      result = await core.boot();
    } else if (base === 'core.schedule') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Module and action required\n  Usage: core.schedule <module> <action> [delay]' };
      }
      result = await core.schedule({ 
        module: args[0] as any, 
        action: args[1], 
        delay: args[2] 
      });
    } else if (base === 'core.jobs') {
      result = await core.jobs(args[0] as any, args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'core.process') {
      result = await core.process();
    } else if (base === 'core.config') {
      result = await core.config(args[0], args[1]);
    } else if (base === 'core.shutdown') {
      result = await core.shutdown();
    }

    // RIPPLE module (Message Bus)
    else if (base === 'ripple.status') {
      result = await ripple.status();
    } else if (base === 'ripple.pulse') {
      result = await ripple.pulse();
    } else if (base === 'ripple.topics') {
      result = await ripple.topics();
    } else if (base === 'ripple.events') {
      result = await ripple.events({ topic: args[0], limit: args[1] ? parseInt(args[1]) : undefined });
    } else if (base === 'ripple.publish') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Topic and event_type required\n  Usage: ripple.publish <topic> <event_type> [payload]' };
      }
      const payload = args[2] ? JSON.parse(args[2]) : undefined;
      result = await ripple.publish(args[0], args[1], payload);
    } else if (base === 'ripple.subscribe') {
      if (!args[0] || !args[1] || !args[2]) {
        return { success: false, output: '▓ ERROR: Topic, module, and action required\n  Usage: ripple.subscribe <topic> <module> <action>' };
      }
      result = await ripple.subscribe(args[0], args[1] as any, args[2]);
    } else if (base === 'ripple.enqueue') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Queue and payload required\n  Usage: ripple.enqueue <queue> <payload>' };
      }
      const payload = JSON.parse(args[1]);
      result = await ripple.enqueue(args[0], payload);
    } else if (base === 'ripple.dequeue') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Queue name required\n  Usage: ripple.dequeue <queue>' };
      }
      result = await ripple.dequeue(args[0]);
    } else if (base === 'ripple.dead_letter') {
      result = await ripple.deadLetter(args[0], args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'ripple.retry') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: ripple.retry <job_id>' };
      }
      result = await ripple.retry(args[0]);
    } else if (base === 'ripple.metrics') {
      result = await ripple.metrics();
    } else if (base === 'ripple.replay') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Topic required\n  Usage: ripple.replay <topic> [limit]' };
      }
      result = await ripple.replay(args[0], args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'ripple.jobs') {
      result = await ripple.jobs({ queue: args[0], status: args[1], limit: args[2] ? parseInt(args[2]) : undefined });
    } else if (base === 'ripple.work') {
      const once = args.includes('--once');
      const queue = args.find(a => !a.startsWith('--'));
      result = await ripple.work(queue, once);
    } else if (base === 'ripple.drain') {
      result = await ripple.drain(args[0]);
    } else if (base === 'ripple.ack') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: ripple.ack <job_id>' };
      }
      result = await ripple.ack(args[0]);
    } else if (base === 'ripple.nack') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: ripple.nack <job_id> [reason]' };
      }
      result = await ripple.nack(args[0], args.slice(1).join(' ') || undefined);
    } else if (base === 'ripple.circuits') {
      result = await ripple.circuits();
    }

    // ACCESS module (Identity & Billing)
    else if (base === 'access.status') {
      result = await access.status();
    } else if (base === 'access.pulse') {
      result = await access.pulse();
    } else if (base === 'access.create_key') {
      // access.create_key [name] [scopes...] - developer auto-created from auth
      result = await access.createKey({ 
        name: args[0], 
        scopes: args.slice(1) 
      });
    } else if (base === 'access.validate_key') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: API key required\n  Usage: access.validate_key <api_key>' };
      }
      result = await access.validateKey(args[0]);
    } else if (base === 'access.revoke_key') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Key ID required\n  Usage: access.revoke_key <key_id>' };
      }
      result = await access.revokeKey(args[0]);
    } else if (base === 'access.list_keys') {
      result = await access.listKeys(args[0]);
    } else if (base === 'access.usage') {
      result = await access.getUsage({ 
        product_code: args[0], 
        days: args[1] ? parseInt(args[1]) : undefined 
      });
    } else if (base === 'access.quota') {
      result = await access.checkQuota(args[0]);
    } else if (base === 'access.subscription') {
      result = await access.subscription(args[0]);
    } else if (base === 'access.register') {
      result = await access.register(args[0]);
    } else if (base === 'access.bootstrap') {
      // Bootstrap creates developer + assigns roles + seeds governor if first user
      result = await access.bootstrap(args[0] || args.join(' ') || undefined);
    } else if (base === 'access.developer') {
      result = await access.developer(args[0]);
    } else if (base === 'access.developers') {
      result = await access.developers();
    } else if (base === 'access.identity') {
      result = await access.identity();
    } else if (base === 'access.entitlements') {
      result = await access.entitlements();
    } else if (base === 'access.products') {
      result = await access.products(args[0]);
    }

    // INTEGRATION module (Enterprise Adapters)
    else if (base === 'integration.status') {
      result = await integration.status();
    } else if (base === 'integration.pulse') {
      result = await integration.pulse();
    } else if (base === 'integration.adapters') {
      result = await integration.adapters();
    } else if (base === 'integration.connections') {
      result = await integration.connections();
    } else if (base === 'integration.discovered') {
      result = await integration.discovered(args[0]);
    } else if (base === 'integration.mapped_commands') {
      result = await integration.mappedCommands(args[0]);
    } else if (base === 'integration.policies') {
      result = await integration.policies();
    } else if (base === 'integration.audit_log') {
      result = await integration.auditLog({ adapter_id: args[0], limit: args[1] ? parseInt(args[1]) : undefined });
    } else if (base === 'integration.governance') {
      result = await integration.policies();
    } else if (base === 'integration.connect') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Type and name required\n  Usage: integration.connect <type> <name> <config>' };
      }
      const configStr = args.slice(2).join(' ') || '{}';
      result = await integration.connect({ 
        adapter_type: args[0] as any, 
        name: args[1], 
        config: JSON.parse(configStr) 
      });
    } else if (base === 'integration.disconnect') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Adapter ID required\n  Usage: integration.disconnect <adapter_id>' };
      }
      result = await integration.disconnect(args[0]);
    } else if (base === 'integration.test') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Adapter ID required\n  Usage: integration.test <adapter_id>' };
      }
      result = await integration.test(args[0]);
    } else if (base === 'integration.discover') {
      result = await integration.discover({ 
        target: args[0], 
        depth: args[1] as 'shallow' | 'deep' | undefined 
      });
    } else if (base === 'integration.map_command') {
      if (!args[0] || !args[1] || !args[2]) {
        return { success: false, output: '▓ ERROR: Function, command, and description required\n  Usage: integration.map_command <func> <cmd> <desc>' };
      }
      result = await integration.mapCommand({ 
        discovered_function: args[0], 
        terminal_command: args[1], 
        description: args.slice(2).join(' ') 
      });
    } else if (base === 'integration.set_policy') {
      const policyStr = args.slice(1).join(' ') || '{}';
      result = await integration.setPolicy({ 
        adapter_id: args[0], 
        policy: JSON.parse(policyStr) 
      });
    } else if (base === 'integration.execute') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Adapter ID and action required\n  Usage: integration.execute <adapter_id> <action> [params]' };
      }
      const paramsStr = args.slice(2).join(' ') || '{}';
      result = await integration.execute({ 
        adapter_id: args[0], 
        action: args[1], 
        parameters: JSON.parse(paramsStr) 
      });
    } else if (base === 'integration.game_discover') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Engine type required\n  Usage: integration.game_discover <engine_type>\n  Engines: unity, unreal, godot, custom' };
      }
      result = await integration.gameEngine.discover(args[0] as any, args[1]);
    } else if (base === 'integration.enterprise_discover') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: System type required\n  Usage: integration.enterprise_discover <system_type>\n  Systems: sap, salesforce, workday, servicenow, dynamics, custom' };
      }
      result = await integration.enterprise.discover(args[0] as any);
    } else if (base === 'integration.dev_discover') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Platform type required\n  Usage: integration.dev_discover <platform_type>\n  Platforms: github, gitlab, jira, confluence, linear, notion, custom' };
      }
      result = await integration.devPlatform.discover(args[0] as any);
    } else if (base === 'integration.payroll') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Adapter ID and operation required\n  Usage: integration.payroll <adapter_id> <operation> [params]\n  Operations: calculate, schedule, status' };
      }
      const paramsStr = args.slice(2).join(' ') || '{}';
      result = await integration.enterprise.payroll(args[0], args[1] as any, JSON.parse(paramsStr));
    } else if (base === 'integration.customer_service') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Adapter ID and operation required\n  Usage: integration.customer_service <adapter_id> <operation> [params]\n  Operations: respond, escalate, summarize' };
      }
      const paramsStr = args.slice(2).join(' ') || '{}';
      result = await integration.enterprise.customerService(args[0], args[1] as any, JSON.parse(paramsStr));
    }

    // CORTEX module (Agency-class Orchestrator)
    else if (base === 'cortex.status') {
      result = await cortex.status();
    } else if (base === 'cortex.health') {
      result = await cortex.health();
    } else if (base === 'cortex.pulse') {
      result = await cortex.pulse();
    } else if (base === 'cortex.diagnostics') {
      result = await cortex.diagnostics();
    } else if (base === 'cortex.mode') {
      const mode = args[0] as 'manual' | 'shadow' | 'auto' | undefined;
      result = await cortex.mode(mode);
    } else if (base === 'cortex.restart') {
      result = await cortex.restart();
    } else if (base === 'cortex.panic') {
      const panicAction = args[0] as 'freeze' | 'resume' | 'status' || 'status';
      const reason = args.slice(1).join(' ') || undefined;
      result = await cortex.panic(panicAction, reason);
    } else if (base === 'cortex.dispatch') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: cortex.dispatch <module.action> [args]\n  Example: cortex.dispatch brain.reflect' };
      }
      const [targetMod, targetAct] = args[0].split('.');
      const dispatchArgs = args[1] ? JSON.parse(args[1]) : undefined;
      result = await cortex.dispatch(targetMod, targetAct, dispatchArgs);
    } else if (base === 'cortex.observe') {
      result = await cortex.observe(args[0], args[1]?.split(','));
    } else if (base === 'cortex.propose') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Goal required\n  Usage: cortex.propose <goal> [context]\n  Example: cortex.propose "Optimize memory tiering"' };
      }
      result = await cortex.propose(args[0], args.slice(1).join(' ') || undefined);
    } else if (base === 'cortex.evaluate') {
      result = await cortex.evaluate(args[0]);
    } else if (base === 'cortex.apply') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Proposal ID required\n  Usage: cortex.apply <proposal_id> [target_module]' };
      }
      result = await cortex.apply(args[0], args[1]);
    } else if (base === 'cortex.rollback') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Apply ID required\n  Usage: cortex.rollback <apply_id> [reason]' };
      }
      result = await cortex.rollback(args[0], args.slice(1).join(' ') || undefined);
    } else if (base === 'cortex.audit') {
      result = await cortex.audit(args[0], args[1]);
    } else if (base === 'cortex.learn') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Outcome required\n  Usage: cortex.learn <outcome> [proposal_id] [feedback]\n  Example: cortex.learn success prop_abc123' };
      }
      result = await cortex.learn(args[0], args[1], args.slice(2).join(' ') || undefined);
    } else if (base === 'cortex.summary') {
      result = await cortex.summary();
    } else if (base === 'cortex.plan') {
      const eligible = args.includes('--eligible');
      const sequenceId = args.find(a => !a.startsWith('--'));
      result = await substrate.invoke({ 
        module: 'cortex', 
        action: 'plan', 
        payload: { sequence_id: sequenceId, eligible } 
      });
    } else if (base === 'cortex.run') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Sequence ID required\n  Usage: cortex.run <sequence_id> [mode]\n  Example: cortex.run abc123 shadow' };
      }
      result = await cortex.run(args[0], args[1] as 'shadow' | 'production' | undefined);
    }
    // Cortex World Model + Inventory
    else if (base === 'cortex.world') {
      const dag = args.includes('--dag');
      const roles = args.includes('--roles');
      const eligible = args.includes('--eligible');
      result = await cortex.world({ dag, roles, eligible });
    } else if (base === 'cortex.inventory') {
      const eligible = args.includes('--eligible');
      result = await substrate.invoke({ 
        module: 'cortex', 
        action: 'inventory', 
        payload: { eligible } 
      });
    }
    // Cross-Module Synergy Engine (200 Pipelines, 125 Executors)
    else if (base === 'cortex.synergy.status') {
      try {
        const { listSynergies } = await import('@/lib/capabilities/synergies');
        const all = listSynergies();
        
        return {
          success: true,
          output: `
┌─ SYNERGY ENGINE ──────────────────────────────────────────────
│
│  Pipelines:  200 total
│  Executors:  125 custom
│  Categories: 8
│
├─ COMMANDS ──────────────────────────────────────────────────
│  cortex.synergy.list      List all pipelines
│  cortex.synergy.get <id>  Get pipeline details
│  cortex.synergy.execute   Execute pipeline
│  cortex.synergy.dry_run   Preview execution
│
└──────────────────────────────────────────────────────────────`,
          data: { total: all.length },
        };
      } catch (err) {
        return { success: false, output: `▓ Synergy engine error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'cortex.synergy.list') {
      try {
        const { listSynergies } = await import('@/lib/capabilities/synergies');
        
        const categoryFilter = args.includes('--category') ? args[args.indexOf('--category') + 1] : undefined;
        let synergies = listSynergies();
        if (categoryFilter) {
          synergies = synergies.filter(s => s.category.toLowerCase() === categoryFilter.toLowerCase());
        }
        
        let output = `
┌─ SYNERGY PIPELINES ──────────────────────────────────────────
│  Total: ${synergies.length}${categoryFilter ? ` (category: ${categoryFilter})` : ''}
├──────────────────────────────────────────────────────────────`;

        for (const s of synergies.slice(0, 25)) {
          const mods = s.modules.slice(0, 3).map(m => m.name).join('+');
          output += `
│  ${s.id.padEnd(30)} ${s.category.padEnd(14)} ${mods}`;
        }
        
        if (synergies.length > 25) {
          output += `
│  ... and ${synergies.length - 25} more`;
        }
        
        output += `
└──────────────────────────────────────────────────────────────`;
        
        return { success: true, output, data: synergies };
      } catch (err) {
        return { success: false, output: `▓ List error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'cortex.synergy.get') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Synergy ID required\n  Usage: cortex.synergy.get <synergy_id>' };
      }
      try {
        const { getSynergy } = await import('@/lib/capabilities/synergies');
        const synergy = getSynergy(args[0]);
        
        if (!synergy) {
          return { success: false, output: `▓ Synergy '${args[0]}' not found` };
        }
        
        const moduleList = synergy.modules.map(m => m.name).join(' → ');
        
        return {
          success: true,
          output: `
┌─ SYNERGY: ${synergy.id} ──────────────────────────────────────
│
│  Name:        ${synergy.name}
│  Category:    ${synergy.category}
│  Risk:        ${synergy.risk}
│
│  Modules:     ${moduleList}
│
│  Description:
│    ${synergy.description}
│
└──────────────────────────────────────────────────────────────`,
          data: synergy,
        };
      } catch (err) {
        return { success: false, output: `▓ Get error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'cortex.synergy.execute') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Synergy ID required\n  Usage: cortex.synergy.execute <synergy_id> [input_json]' };
      }
      const effTier2: CommandTier = userTier || (isOperator ? 'creator' : 'free');
      if (!meetsRequiredTier(effTier2, 'creator')) {
        return { success: false, output: `▓ ACCESS DENIED: CREATOR tier required for synergy execution\n  Your tier: ${getTierLabel(effTier2)}\n  Upgrade at cmpsbl.com/pricing` };
      }
      try {
        const { executeSynergy } = await import('@/lib/capabilities/synergies');
        const input = args[1] ? JSON.parse(args[1]) : {};
        const result = await executeSynergy(args[0], input, { caller: 'terminal' });
        
        const icon = result.success ? '✓' : '✗';
        return {
          success: result.success,
          output: `
┌─ SYNERGY EXECUTION ──────────────────────────────────────────
│
│  ${icon} Synergy:  ${result.synergyId}
│  Duration:  ${result.totalDurationMs}ms
│  Steps:     ${result.steps.length} completed
│
${result.steps.map(s => `│    ${s.success ? '✓' : '✗'} [${s.module}] (${s.durationMs}ms)`).join('\n')}
│
└──────────────────────────────────────────────────────────────`,
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ Execute error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'cortex.synergy.dry_run') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Synergy ID required\n  Usage: cortex.synergy.dry_run <synergy_id>' };
      }
      try {
        const { dryRunSynergy } = await import('@/lib/capabilities/synergies');
        const input = args[1] ? JSON.parse(args[1]) : {};
        const result = await dryRunSynergy(args[0], input);
        
        return {
          success: true,
          output: `
┌─ SYNERGY DRY-RUN (Preview Only) ─────────────────────────────
│
│  Synergy:  ${result.synergy.id}
│  Risk:     ${result.riskLevel}
│  Est. Time: ${result.estimatedMs}ms
│
│  Execution Plan:
${result.plan.map((step, i) => `│    ${i + 1}. ${step}`).join('\n')}
│
│  ⚠ No side effects — use cortex.synergy.execute to run
│
└──────────────────────────────────────────────────────────────`,
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ Dry-run error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'cortex.synergy.recommend') {
      try {
        const { getRecommendedSynergies } = await import('@/lib/capabilities/synergies');
        const context = args[0] ? JSON.parse(args[0]) : {};
        const recommended = await getRecommendedSynergies(context);
        
        let output = `
┌─ RECOMMENDED SYNERGIES ──────────────────────────────────────
│  Based on current context
├──────────────────────────────────────────────────────────────`;

        for (const s of recommended.slice(0, 10)) {
          output += `
│  ★ ${s.id.padEnd(30)} ${s.category.padEnd(12)}`;
        }
        
        output += `
│
│  Execute: cortex.synergy.execute <id>
└──────────────────────────────────────────────────────────────`;
        
        return { success: true, output, data: recommended };
      } catch (err) {
        return { success: false, output: `▓ Recommend error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'cortex.synergy.categories') {
      try {
        const { getSynergyCategories } = await import('@/lib/capabilities/synergies');
        const categories = getSynergyCategories();
        
        return {
          success: true,
          output: `
┌─ SYNERGY CATEGORIES ─────────────────────────────────────────
│
${categories.map(c => `│  ${c.category.padEnd(15)} ${c.count.toString().padStart(2)} pipelines`).join('\n')}
│
└──────────────────────────────────────────────────────────────`,
          data: categories,
        };
      } catch (err) {
        return { success: false, output: `▓ Categories error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'cortex.synergy.pipeline') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Synergy IDs required\n  Usage: cortex.synergy.pipeline <id1,id2,...> [input_json]' };
      }
      try {
        const { executeSynergy } = await import('@/lib/capabilities/synergies');
        const synergyIds = args[0].split(',').map(s => s.trim());
        const input = args[1] ? JSON.parse(args[1]) : {};
        const results = [];
        let currentInput = input;
        let totalMs = 0;
        for (const sid of synergyIds) {
          const r = await executeSynergy(sid, currentInput, { caller: 'terminal-pipeline' });
          results.push(r);
          totalMs += r.totalDurationMs;
          if (!r.success) break;
          currentInput = { ...currentInput, previousOutput: r };
        }
        const allOk = results.every(r => r.success);
        let output = `
┌─ SYNERGY PIPELINE (${synergyIds.length} stages) ──────────────────────────
│
│  ${allOk ? '✓' : '✗'} Overall: ${allOk ? 'SUCCESS' : 'PARTIAL FAILURE'}
│  Total Duration: ${totalMs}ms
│`;
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          output += `\n│  ${i + 1}. ${r.success ? '✓' : '✗'} ${r.synergyId} (${r.totalDurationMs}ms)`;
        }
        output += `\n│\n└──────────────────────────────────────────────────────────────`;
        return { success: allOk, output, data: results };
      } catch (err) {
        return { success: false, output: `▓ Pipeline error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    else if (base === 'cortex.synergy.modules') {
      try {
        const { getSynergiesByModule, listSynergies } = await import('@/lib/capabilities/synergies');
        const moduleFilter = args[0]?.toUpperCase();
        
        if (moduleFilter) {
          const synergies = getSynergiesByModule(moduleFilter);
          return {
            success: true,
            output: `
┌─ SYNERGIES FOR MODULE: ${moduleFilter} ─────────────────────────
│  Total: ${synergies.length} pipelines
├──────────────────────────────────────────────────────────────
${synergies.slice(0, 20).map(s => `│  ${s.id.padEnd(30)} ${s.category}`).join('\n')}
${synergies.length > 20 ? `│  ... and ${synergies.length - 20} more` : ''}
└──────────────────────────────────────────────────────────────`,
            data: synergies,
          };
        }
        
        // Show all modules with counts
        const all = listSynergies();
        const moduleCounts: Record<string, number> = {};
        for (const s of all) {
          for (const m of s.modules) {
            moduleCounts[m.name] = (moduleCounts[m.name] || 0) + 1;
          }
        }
        const sorted = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]);
        
        return {
          success: true,
          output: `
┌─ SYNERGIES BY MODULE ────────────────────────────────────────
│
${sorted.map(([m, c]) => `│  ${m.padEnd(15)} ${c.toString().padStart(2)} pipelines`).join('\n')}
│
│  Filter: cortex.synergy.modules <MODULE>
└──────────────────────────────────────────────────────────────`,
          data: moduleCounts,
        };
      } catch (err) {
        return { success: false, output: `▓ Modules error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // INCLUSIVE module (Human Compatibility Pipeline)
    else if (base === 'inclusive.status') {
      result = await inclusive.status();
    } else if (base === 'inclusive.health') {
      result = await inclusive.health();
    } else if (base === 'inclusive.pulse') {
      result = await inclusive.pulse();
    } else if (base === 'inclusive.scan') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: inclusive.scan <url_or_html> [--wcag A|AA|AAA] [--depth quick|standard|deep]\n  Example: inclusive.scan https://example.com --wcag AA' };
      }
      const wcagLevel = args.includes('--wcag') ? args[args.indexOf('--wcag') + 1] as 'A' | 'AA' | 'AAA' : undefined;
      const depth = args.includes('--depth') ? args[args.indexOf('--depth') + 1] as 'quick' | 'standard' | 'deep' : undefined;
      result = await inclusive.scan(args[0], { wcag_level: wcagLevel, scan_depth: depth });
    } else if (base === 'inclusive.self_scan') {
      result = await inclusive.selfScan();
    } else if (base === 'inclusive.repair') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: inclusive.repair <url_or_html> [issue_ids...]' };
      }
      result = await inclusive.repair(args[0], args.slice(1).length > 0 ? args.slice(1) : undefined);
    } else if (base === 'inclusive.validate') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: inclusive.validate <url_or_html>' };
      }
      result = await inclusive.validate(args[0]);
    } else if (base === 'inclusive.profile') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Context required\n  Usage: inclusive.profile <context>\n  Example: inclusive.profile "user prefers high contrast"' };
      }
      result = await inclusive.profile(args.join(' '));
    } else if (base === 'inclusive.report') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: inclusive.report <url_or_html> [json|markdown]' };
      }
      const format = args[1] as 'json' | 'markdown' | undefined;
      result = await inclusive.report(args[0], format);
    } else if (base === 'inclusive.scan_all_templates') {
      result = await inclusive.scanAllTemplates();
    } else if (base === 'inclusive.regressions') {
      const hours = args[0] ? parseInt(args[0]) : undefined;
      result = await inclusive.regressions(hours);
    } else if (base === 'inclusive.coverage') {
      result = await inclusive.coverage();
    }

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
          output += `║  MODERNIZER IMPROVEMENTS (${improvementCount}):\n`;
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
│  Synergy Pipelines:    ${engineSummary.totalSynergyPipelines}
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
          const handlerResult = await handler();
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

    // ═══ REGISTRY-BACKED MODULE HANDLERS (All 40 Nodes + Cross-Cutting) ═══
    else if (base.startsWith('memory.') || base.startsWith('relay.') || base.startsWith('audit.') || base.startsWith('identity.') || base.startsWith('economy.') || base.startsWith('sandbox.') || base.startsWith('encode.') || base.startsWith('encoded.') || base.startsWith('gov.') || base.startsWith('obs.') || base.startsWith('analytics.') || base.startsWith('mesh.') || base.startsWith('seba.') || base.startsWith('clm.') || base.startsWith('core.') || base.startsWith('system.') || base.startsWith('brain.') || base.startsWith('dream.') || base.startsWith('ripple.') || base.startsWith('access.') || base.startsWith('defense.') || base.startsWith('decode.') || base.startsWith('nexus.') || base.startsWith('vision.') || base.startsWith('cortex.') || base.startsWith('inclusive.') || base.startsWith('integration.') || base.startsWith('modernizer.') || base.startsWith('shadow.') || base.startsWith('sovereign.') || base.startsWith('oracle.') || base.startsWith('conscience.') || base.startsWith('phantom.') || base.startsWith('forge.') || base.startsWith('lingua.') || base.startsWith('compass.') || base.startsWith('echo.') || base.startsWith('treaty.') || base.startsWith('harvest.') || base.startsWith('reflex.') || base.startsWith('evolution.') || base.startsWith('immunity.') || base.startsWith('governance.') || base.startsWith('medic.') || base.startsWith('nerve.') || base.startsWith('expansion.') || base.startsWith('hardening.') || base.startsWith('engineer.') || base.startsWith('intent.') || base.startsWith('atlas.') || base.startsWith('diligence.') || base.startsWith('eventstream.')) {
      try {
        // Lazy-register all registry-backed handlers on first use
        const { registerInfraModuleHandlers } = await import('@/lib/terminal/infra-module-handlers');
        registerInfraModuleHandlers();
        const { registerEncodeModuleHandlers } = await import('@/lib/terminal/encode-handlers');
        registerEncodeModuleHandlers();
        const { registerMeshHandlers } = await import('@/lib/terminal/mesh-handlers');
        registerMeshHandlers();
        const { registerCoreHandlers } = await import('@/lib/terminal/core-handlers');
        registerCoreHandlers();
        const { registerEncodedHandlers } = await import('@/lib/terminal/encoded-handlers');
        registerEncodedHandlers();
        const { registerGovernanceHandlers } = await import('@/lib/terminal/governance-handlers');
        registerGovernanceHandlers();
        const { registerObservabilityHandlers } = await import('@/lib/terminal/observability-handlers');
        registerObservabilityHandlers();
        const { registerAnalyticsHandlers } = await import('@/lib/terminal/analytics-handlers');
        registerAnalyticsHandlers();
        const { registerSpineHandlers } = await import('@/lib/terminal/spine-handlers');
        registerSpineHandlers();
        const { registerOCGHandlers } = await import('@/lib/terminal/ocg-handlers');
        registerOCGHandlers();
        const { registerExecutionHandlers } = await import('@/lib/terminal/execution-handlers');
        registerExecutionHandlers();
        const { registerSEBAHandlers } = await import('@/lib/terminal/seba-handlers');
        registerSEBAHandlers();
        const { registerSynergyHandlers } = await import('@/lib/terminal/synergy-handlers');
        registerSynergyHandlers();
        const { registerHardeningHandlers } = await import('@/lib/terminal/hardening-handlers');
        registerHardeningHandlers();
        const { registerExpansionHandlers } = await import('@/lib/terminal/expansion-handlers');
        registerExpansionHandlers();
        const { registerSystemAuditHandlers } = await import('@/lib/terminal/system-audit-handlers');
        registerSystemAuditHandlers();
        const { registerInfraHandlers } = await import('@/lib/terminal/infra-handlers');
        registerInfraHandlers();
        const { getHandler } = await import('@/lib/terminal/validate-registry');
        const handler = getHandler(base);
        
        if (handler) {
          const handlerResult = await handler();
          const data = handlerResult as Record<string, unknown>;
          
          // If handler returned a formatted output, use it directly
          if (data?.formatted && Array.isArray(data.formatted)) {
            return { success: true, output: (data.formatted as string[]).join('\n') };
          }

          // Governance-style output (gov.* handlers return { output, status })
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
        } else {
          // Fallback to substrate.invoke for commands not in registry
          const [mod, action] = base.split('.');
          const moduleLabel = mod.toUpperCase();
          const invokeResult = await substrate.invoke({ module: mod as any, action });
          if (invokeResult?.success) {
            return { success: true, output: `◉ ${moduleLabel}.${action}\n\n${JSON.stringify(invokeResult.data || invokeResult, null, 2)}` };
          }
          return { success: false, output: `▓ ${moduleLabel} command not found: ${base}\n  Type '${mod}.help' for available commands` };
        }
      } catch (err) {
        return { success: false, output: `▓ Module error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

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
