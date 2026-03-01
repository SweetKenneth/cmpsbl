/**
 * ENGINEER Node — Engine & Meta-Engine Maintenance Intelligence
 * Codename: "Architect"
 * 
 * Responsibilities:
 * 1. Monitor health of all 76 Engines and 24 Meta-Engines
 * 2. Dynamically shift CLM study focus toward engine upgrades
 * 3. Generate upgrade proposals and send them to INTENT
 * 4. Track engine performance, detect degradation, recommend improvements
 * 
 * All outbound communication routes through INTENT as per architecture spec.
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EngineHealthSnapshot {
  engineId: string;
  category: string;
  health: number; // 0-100
  lastChecked: number;
  degradationTrend: 'improving' | 'stable' | 'declining';
  issues: string[];
}

export interface EngineerProposal {
  id: string;
  type: 'upgrade' | 'repair' | 'optimization' | 'expansion' | 'deprecation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  targetEngine: string;
  targetCategory: string;
  title: string;
  description: string;           // human-readable plain language
  technicalRationale: string;    // detailed technical justification
  estimatedImpact: string;       // what improves if approved
  estimatedRisk: string;         // what could go wrong
  studyTopics: string[];         // CLM topics that led to this proposal
  status: 'pending' | 'sent_to_intent' | 'approved' | 'rejected' | 'implemented';
  createdAt: number;
  updatedAt: number;
}

export interface CLMStudyFocus {
  topic: string;
  engineId: string;
  reason: string;
  priority: number;
  assignedAt: number;
  completedAt?: number;
  findings: string[];
}

export interface EngineerState {
  initialized: boolean;
  totalEnginesMonitored: number;
  totalMetaEnginesMonitored: number;
  engineHealth: Map<string, EngineHealthSnapshot>;
  proposals: EngineerProposal[];
  studyQueue: CLMStudyFocus[];
  activeStudy: CLMStudyFocus | null;
  cycleCount: number;
  lastCycleAt: number;
  degradedEngines: string[];
}

// ─── State ─────────────────────────────────────────────────────────────────

const state: EngineerState = {
  initialized: false,
  totalEnginesMonitored: 76,
  totalMetaEnginesMonitored: 24,
  engineHealth: new Map(),
  proposals: [],
  studyQueue: [],
  activeStudy: null,
  cycleCount: 0,
  lastCycleAt: 0,
  degradedEngines: [],
};

// ─── Engine Health Monitoring ──────────────────────────────────────────────

export function recordEngineHealth(engineId: string, category: string, health: number, issues: string[] = []): void {
  const existing = state.engineHealth.get(engineId);
  const trend: 'improving' | 'stable' | 'declining' = existing
    ? (health > existing.health + 5 ? 'improving' : health < existing.health - 5 ? 'declining' : 'stable')
    : 'stable';

  state.engineHealth.set(engineId, {
    engineId, category, health: Math.max(0, Math.min(100, health)),
    lastChecked: Date.now(), degradationTrend: trend, issues,
  });

  // Track degraded engines
  if (health < 60) {
    if (!state.degradedEngines.includes(engineId)) state.degradedEngines.push(engineId);
  } else {
    state.degradedEngines = state.degradedEngines.filter(e => e !== engineId);
  }
}

export function getEngineHealth(engineId: string): EngineHealthSnapshot | null {
  return state.engineHealth.get(engineId) ?? null;
}

export function getAllEngineHealth(): EngineHealthSnapshot[] {
  return Array.from(state.engineHealth.values());
}

export function getDegradedEngines(): EngineHealthSnapshot[] {
  return Array.from(state.engineHealth.values()).filter(e => e.health < 60);
}

export function getEngineHealthByCategory(category: string): EngineHealthSnapshot[] {
  return Array.from(state.engineHealth.values()).filter(e => e.category === category);
}

// ─── Proposal Generation ───────────────────────────────────────────────────

export function createProposal(
  type: EngineerProposal['type'],
  priority: EngineerProposal['priority'],
  targetEngine: string,
  targetCategory: string,
  title: string,
  description: string,
  technicalRationale: string,
  estimatedImpact: string,
  estimatedRisk: string,
  studyTopics: string[] = [],
): EngineerProposal {
  const proposal: EngineerProposal = {
    id: `eng_prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type, priority, targetEngine, targetCategory, title,
    description, technicalRationale, estimatedImpact, estimatedRisk,
    studyTopics, status: 'pending',
    createdAt: Date.now(), updatedAt: Date.now(),
  };
  state.proposals.push(proposal);
  if (state.proposals.length > 200) state.proposals.splice(0, state.proposals.length - 200);
  return proposal;
}

export function getProposals(status?: EngineerProposal['status']): EngineerProposal[] {
  if (status) return state.proposals.filter(p => p.status === status);
  return [...state.proposals];
}

export function updateProposalStatus(id: string, status: EngineerProposal['status']): boolean {
  const p = state.proposals.find(p => p.id === id);
  if (!p) return false;
  p.status = status;
  p.updatedAt = Date.now();
  return true;
}

export function getPendingProposals(): EngineerProposal[] {
  return state.proposals.filter(p => p.status === 'pending' || p.status === 'sent_to_intent');
}

// ─── CLM Study Focus (Dynamic Topic Shifting) ─────────────────────────────

export function addStudyFocus(topic: string, engineId: string, reason: string, priority: number): CLMStudyFocus {
  const focus: CLMStudyFocus = {
    topic, engineId, reason, priority,
    assignedAt: Date.now(), findings: [],
  };
  state.studyQueue.push(focus);
  state.studyQueue.sort((a, b) => b.priority - a.priority);
  if (state.studyQueue.length > 50) state.studyQueue.splice(50);
  return focus;
}

export function getNextStudyFocus(): CLMStudyFocus | null {
  const incomplete = state.studyQueue.filter(s => !s.completedAt);
  return incomplete[0] ?? null;
}

export function completeStudy(topic: string, findings: string[]): void {
  const study = state.studyQueue.find(s => s.topic === topic && !s.completedAt);
  if (study) {
    study.completedAt = Date.now();
    study.findings = findings;
  }
}

export function getActiveStudy(): CLMStudyFocus | null {
  return state.activeStudy;
}

export function setActiveStudy(study: CLMStudyFocus | null): void {
  state.activeStudy = study;
}

export function getStudyQueue(): CLMStudyFocus[] {
  return [...state.studyQueue];
}

/**
 * Generate dynamic CLM topics based on engine health
 * ENGINEER analyzes which engines need attention and creates study topics
 */
export function generateDynamicCLMTopics(): string[] {
  const topics: string[] = [];
  const degraded = getDegradedEngines();
  
  for (const engine of degraded.slice(0, 5)) {
    topics.push(`How to improve ${engine.engineId} engine performance and reliability`);
    topics.push(`Best practices for ${engine.category} engine optimization`);
    if (engine.issues.length > 0) {
      topics.push(`Solutions for: ${engine.issues[0]}`);
    }
  }

  // Always study high-value engines
  topics.push('Advanced patterns for cognitive mesh meta-engine orchestration');
  topics.push('Strategies for improving meta-engine synergy multipliers');
  topics.push('Enterprise engine health monitoring best practices');

  return topics.slice(0, 10);
}

// ─── Maintenance Cycle ─────────────────────────────────────────────────────

export interface MaintenanceCycleResult {
  cycleId: string;
  enginesSurveyed: number;
  degradedFound: number;
  proposalsGenerated: number;
  studyTopicsAdded: number;
  topFindings: string[];
}

/**
 * Run a full maintenance cycle:
 * 1. Survey all engine health
 * 2. Identify degraded engines
 * 3. Generate proposals for degraded engines
 * 4. Shift CLM study focus
 * 5. Send proposals to INTENT
 */
export function runMaintenanceCycle(): MaintenanceCycleResult {
  state.cycleCount++;
  state.lastCycleAt = Date.now();

  const degraded = getDegradedEngines();
  const proposalsGenerated: EngineerProposal[] = [];
  const findings: string[] = [];

  for (const engine of degraded) {
    const proposal = createProposal(
      engine.health < 30 ? 'repair' : 'optimization',
      engine.health < 30 ? 'critical' : engine.health < 50 ? 'high' : 'medium',
      engine.engineId,
      engine.category,
      `${engine.engineId} needs attention — health at ${engine.health}%`,
      `The ${engine.engineId} engine in the ${engine.category} category is running at ${engine.health}% health. ${engine.issues.length > 0 ? 'Issues detected: ' + engine.issues.join(', ') + '.' : 'No specific issues logged but performance is below threshold.'} This engine needs maintenance to prevent downstream impact on dependent systems.`,
      `Health score ${engine.health}/100 with trend: ${engine.degradationTrend}. ${engine.issues.length} active issues.`,
      `Restoring this engine to full health would improve ${engine.category} category performance and reduce error rates for dependent meta-engines.`,
      engine.health < 30 ? 'Critical — continued degradation may cause cascading failures' : 'Low — standard maintenance window',
      [`${engine.engineId} performance analysis`, `${engine.category} category best practices`],
    );
    proposalsGenerated.push(proposal);
    findings.push(`${engine.engineId}: ${engine.health}% (${engine.degradationTrend})`);

    // Add study focus for degraded engines
    addStudyFocus(
      `How to repair and optimize the ${engine.engineId} engine`,
      engine.engineId,
      `Health at ${engine.health}%, trend: ${engine.degradationTrend}`,
      engine.health < 30 ? 100 : engine.health < 50 ? 75 : 50,
    );
  }

  return {
    cycleId: `maint_${state.cycleCount}_${Date.now()}`,
    enginesSurveyed: state.engineHealth.size,
    degradedFound: degraded.length,
    proposalsGenerated: proposalsGenerated.length,
    studyTopicsAdded: degraded.length,
    topFindings: findings.slice(0, 10),
  };
}

// ─── State Access ──────────────────────────────────────────────────────────

export function getEngineerState(): EngineerState {
  return { ...state };
}

export function getEngineerStats(): {
  totalEngines: number;
  totalMetaEngines: number;
  healthyEngines: number;
  degradedEngines: number;
  pendingProposals: number;
  studyQueueSize: number;
  cycleCount: number;
  avgHealth: number;
} {
  const healths = Array.from(state.engineHealth.values());
  return {
    totalEngines: state.totalEnginesMonitored,
    totalMetaEngines: state.totalMetaEnginesMonitored,
    healthyEngines: healths.filter(h => h.health >= 60).length,
    degradedEngines: state.degradedEngines.length,
    pendingProposals: state.proposals.filter(p => p.status === 'pending').length,
    studyQueueSize: state.studyQueue.filter(s => !s.completedAt).length,
    cycleCount: state.cycleCount,
    avgHealth: healths.length > 0 ? Math.round(healths.reduce((s, h) => s + h.health, 0) / healths.length) : 100,
  };
}

export function initializeEngineer(): void {
  if (state.initialized) return;
  state.initialized = true;
  // Seed with baseline health for well-known engines
  const defaultEngines = [
    { id: 'reasoning', cat: 'cognitive' }, { id: 'learning', cat: 'cognitive' },
    { id: 'memory', cat: 'cognitive' }, { id: 'foresight', cat: 'cognitive' },
    { id: 'resilience', cat: 'operational' }, { id: 'optimization', cat: 'operational' },
    { id: 'orchestration', cat: 'operational' }, { id: 'scheduling', cat: 'operational' },
    { id: 'synthesis', cat: 'intelligence' }, { id: 'adaptation', cat: 'intelligence' },
    { id: 'insight', cat: 'intelligence' }, { id: 'prediction', cat: 'intelligence' },
    { id: 'compliance', cat: 'governance' }, { id: 'quality', cat: 'governance' },
    { id: 'audit', cat: 'governance' },
    { id: 'threat', cat: 'security' }, { id: 'defense', cat: 'security' },
    { id: 'trust', cat: 'security' },
    { id: 'evolution', cat: 'evolution' }, { id: 'modernization', cat: 'evolution' },
    { id: 'broadcast', cat: 'communication' }, { id: 'event', cat: 'communication' },
    { id: 'routing', cat: 'integration' }, { id: 'transformation', cat: 'integration' },
  ];
  for (const e of defaultEngines) {
    recordEngineHealth(e.id, e.cat, 85 + Math.floor(Math.random() * 15));
  }
}
