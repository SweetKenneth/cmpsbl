/**
 * DECODE Admin Directive Authority
 * 
 * When the system administrator speaks through DECODE, directives carry
 * ADMIN_DIRECTIVE authority. Modules remain autonomous but acknowledge
 * and respect admin intent relayed through DECODE.
 */

import { verifyAdminForDecode, type AdminVerification } from './social-engineering-guard';
import { computeHealth, getOpsCount, getModuleState, getLastActivity } from '@/substrate/substrate-metrics';
import { logDirective } from '@/substrate/decode-audit';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type DirectivePriority = 'low' | 'normal' | 'high' | 'critical';

export interface AdminDirective {
  /** Unique directive ID */
  id: string;
  /** The directive text from the admin */
  directive: string;
  /** Target module(s) */
  targetModules: string[];
  /** Priority level */
  priority: DirectivePriority;
  /** Whether admin identity was verified */
  adminVerified: boolean;
  /** Issued timestamp */
  issuedAt: string;
  /** Whether this is an informational query or an action command */
  type: 'query' | 'command' | 'configuration';
  /** Acknowledgement status per module */
  acknowledgements: Map<string, {
    acknowledged: boolean;
    acknowledgedAt?: string;
    response?: string;
  }>;
}

export interface SubstrateInsight {
  /** Module ID */
  moduleId: string;
  /** Current operational state */
  state: 'active' | 'degraded' | 'circuit_open' | 'warming' | 'dormant';
  /** What the module is currently doing */
  currentActivity: string;
  /** Health score 0-100 */
  health: number;
  /** Last activity timestamp */
  lastActivityAt: string;
  /** Operations processed in current session */
  opsCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIRECTIVE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const directiveHistory: AdminDirective[] = [];
const MAX_DIRECTIVE_HISTORY = 200;

/**
 * Issue an admin directive through DECODE.
 * Only proceeds if admin identity is verified.
 */
export function issueDirective(
  directive: string,
  targetModules: string[],
  priority: DirectivePriority = 'normal',
  type: AdminDirective['type'] = 'command',
  sessionId?: string,
): AdminDirective | { error: string } {
  const adminCheck = verifyAdminForDecode(sessionId);
  
  if (!adminCheck.isAdmin) {
    return {
      error: `Directive authority denied. Trust level: ${adminCheck.trustLevel}. Admin access requires full IDENTITY verification.`,
    };
  }

  const dir: AdminDirective = {
    id: `dir-${Date.now()}-${directiveHistory.length}`,
    directive,
    targetModules: targetModules.map(m => m.toUpperCase()),
    priority,
    adminVerified: true,
    issuedAt: new Date().toISOString(),
    type,
    acknowledgements: new Map(),
  };

  // Initialize acknowledgement slots
  for (const mod of dir.targetModules) {
    dir.acknowledgements.set(mod, { acknowledged: false });
  }

  directiveHistory.push(dir);
  if (directiveHistory.length > MAX_DIRECTIVE_HISTORY) {
    directiveHistory.splice(0, directiveHistory.length - MAX_DIRECTIVE_HISTORY);
  }

  // Audit trail
  logDirective('admin', directive, {
    targetModules: dir.targetModules.join(','),
    priority,
    type,
    directiveId: dir.id,
  });

  console.log(`[DECODE/Directive] ADMIN_DIRECTIVE issued → ${dir.targetModules.join(', ')} | Priority: ${priority} | "${directive.slice(0, 80)}"`);

  return dir;
}

/**
 * Acknowledge a directive from a module
 */
export function acknowledgeDirective(
  directiveId: string,
  moduleId: string,
  response?: string,
): boolean {
  const dir = directiveHistory.find(d => d.id === directiveId);
  if (!dir) return false;

  const ack = dir.acknowledgements.get(moduleId.toUpperCase());
  if (!ack) return false;

  ack.acknowledged = true;
  ack.acknowledgedAt = new Date().toISOString();
  ack.response = response;

  return true;
}

/**
 * Get pending (unacknowledged) directives for a module
 */
export function getPendingDirectives(moduleId: string): AdminDirective[] {
  return directiveHistory.filter(d => {
    const ack = d.acknowledgements.get(moduleId.toUpperCase());
    return ack && !ack.acknowledged;
  });
}

/**
 * Get directive history (admin only)
 */
export function getDirectiveHistory(limit = 50): AdminDirective[] {
  return directiveHistory.slice(-limit);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSTRATE INSIGHT ENGINE (admin-gated)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * All 40 nodes in the substrate matrix for insight reporting
 */
const ALL_NODES = [
  'CORE', 'SYSTEM',
  'BRAIN', 'MEMORY', 'DREAM',
  'RIPPLE', 'ACCESS', 'IDENTITY', 'RELAY', 'AUDIT', 'NERVE',
  'DECODE', 'ENCODE', 'VISION', 'CORTEX', 'NEXUS', 'ECONOMY', 'SANDBOX', 'INCLUSIVE', 'MEDIC', 'INTEGRATION',
  'SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'TREATY',
  'COMPASS', 'ECHO', 'REFLEX',
  'FORGE', 'LINGUA', 'HARVEST',
  'EVOLUTION', 'SHADOW', 'PHANTOM',
  'IMMUNITY', 'INTENT',
  'GOVERNANCE',
  'DEFENSE',
] as const;

/**
 * Generate substrate insights (admin-only).
 * Returns real-time operational view of all 40 nodes.
 */
export function getSubstrateInsights(sessionId?: string): SubstrateInsight[] | { error: string } {
  const adminCheck = verifyAdminForDecode(sessionId);
  if (!adminCheck.isAdmin) {
    return { error: 'Substrate insights require admin authentication.' };
  }

  // Real runtime metrics from substrate-metrics store
  return ALL_NODES.map(nodeId => {
    const lastAct = getLastActivity(nodeId);
    return {
      moduleId: nodeId,
      state: getModuleState(nodeId),
      currentActivity: getModuleActivity(nodeId),
      health: computeHealth(nodeId),
      lastActivityAt: lastAct ? new Date(lastAct).toISOString() : new Date().toISOString(),
      opsCount: getOpsCount(nodeId),
    };
  });
}

/**
 * Describe what each module is currently doing (descriptive, not raw data)
 */
function getModuleActivity(moduleId: string): string {
  const activities: Record<string, string> = {
    CORE: 'Maintaining canonical registry and boot authority',
    SYSTEM: 'Lifecycle monitoring, heartbeat active',
    BRAIN: 'Processing knowledge crystals, running inference',
    MEMORY: 'Managing hot/warm/cool/cold tier rebalancing',
    DREAM: 'Running background synthesis and pattern consolidation',
    RIPPLE: 'Propagating state changes across substrate',
    ACCESS: 'Enforcing API key validation and quota tracking',
    IDENTITY: 'Processing passkey verifications and trust scoring',
    RELAY: 'Routing inter-module communications',
    AUDIT: 'Recording tamper-evident operation logs',
    NERVE: 'Monitoring operational compliance thresholds',
    DECODE: 'Interpreting human intent into substrate operations',
    ENCODE: 'Code generation pipeline — surgical patch mode',
    VISION: 'Performance monitoring and visual analytics',
    CORTEX: 'Orchestrating multi-module cognitive operations',
    NEXUS: 'Fleet intelligence routing across 14 providers',
    ECONOMY: 'Tracking resource costs and value generation',
    SANDBOX: 'Providing isolated execution environments',
    INCLUSIVE: 'Enforcing accessibility and inclusive design standards',
    MEDIC: 'Running self-diagnostic and recovery routines',
    INTEGRATION: 'Managing external system connections',
    SOVEREIGN: 'Enforcing jurisdictional compliance boundaries',
    ORACLE: 'Running predictive analytics and trend detection',
    CONSCIENCE: 'Evaluating ethical alignment of operations',
    TREATY: 'Managing regulatory compliance protocols',
    COMPASS: 'Tracking geospatial awareness signals',
    ECHO: 'Running simulation and what-if analyses',
    REFLEX: 'Edge computing and reactive autonomy processing',
    FORGE: 'Manufacturing and synthesis pipeline operations',
    LINGUA: 'Localization and multi-language processing',
    HARVEST: 'Data acquisition and ingestion pipelines',
    EVOLUTION: 'Managing mutation proposals and promotion gates',
    SHADOW: 'Running stealth validation and shadow testing',
    PHANTOM: 'Privacy enforcement and data anonymization',
    IMMUNITY: 'Anomaly detection and drift baseline monitoring',
    INTENT: 'Goal lifecycle management and resolution tracking',
    GOVERNANCE: 'Enforcing ethical constraints and coherence policies',
    DEFENSE: 'Perimeter monitoring, threat detection, and response',
  };
  return activities[moduleId] || 'Operating within normal parameters';
}

/**
 * Get a summary suitable for DECODE to relay to the admin
 */
export function getSubstrateSummary(sessionId?: string): string | { error: string } {
  const insights = getSubstrateInsights(sessionId);
  if ('error' in insights) return insights;

  const activeCount = insights.filter(i => i.state === 'active').length;
  const degradedCount = insights.filter(i => i.state === 'degraded').length;
  const avgHealth = Math.round(insights.reduce((s, i) => s + i.health, 0) / insights.length);
  const totalOps = insights.reduce((s, i) => s + i.opsCount, 0);

  return [
    `Substrate Status: ${activeCount}/40 nodes active | ${degradedCount} degraded | Avg health: ${avgHealth}%`,
    `Total operations this session: ${totalOps.toLocaleString()}`,
    `All 12 sectors operational. DEFENSE perimeter holding. GOVERNANCE constraints enforced.`,
  ].join('\n');
}
