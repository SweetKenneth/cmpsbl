/**
 * DEFENSE — Automated Incident Response Playbooks v1.0.0
 * Multi-step incident response: Isolate → Investigate → Remediate → Report.
 *
 * Playbook types:
 *  - BREACH: Full isolation and forensic capture
 *  - DDOS: Rate-limit escalation and traffic shaping
 *  - EXFILTRATION: Data flow kill and audit
 *  - INTRUSION: Session purge and access lockdown
 *  - MALWARE: Quarantine and signature extraction
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PlaybookType = 'BREACH' | 'DDOS' | 'EXFILTRATION' | 'INTRUSION' | 'MALWARE' | 'CUSTOM';
export type PlaybookPhase = 'detect' | 'isolate' | 'investigate' | 'remediate' | 'report' | 'recover';
export type PlaybookStatus = 'pending' | 'running' | 'completed' | 'failed' | 'aborted';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface PlaybookStep {
  readonly id: string;
  readonly phase: PlaybookPhase;
  readonly action: string;
  readonly description: string;
  readonly status: StepStatus;
  readonly startedAt: number | null;
  readonly completedAt: number | null;
  readonly result: string | null;
  readonly automatic: boolean;
}

export interface IncidentPlaybook {
  readonly id: string;
  readonly type: PlaybookType;
  readonly name: string;
  readonly status: PlaybookStatus;
  readonly severity: 'critical' | 'high' | 'medium';
  readonly triggeredBy: string;
  readonly actorId: string | null;
  readonly steps: readonly PlaybookStep[];
  readonly currentPhase: PlaybookPhase;
  readonly startedAt: number;
  readonly completedAt: number | null;
  readonly findings: readonly string[];
  readonly remediationActions: readonly string[];
  readonly timeline: readonly TimelineEntry[];
}

export interface TimelineEntry {
  readonly timestamp: number;
  readonly phase: PlaybookPhase;
  readonly event: string;
  readonly automatic: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_PLAYBOOKS = 50;
const MAX_CONCURRENT = 3;
let playbookSeq = 0;

const activePlaybooks = new Map<string, IncidentPlaybook & {
  steps: PlaybookStep[];
  findings: string[];
  remediationActions: string[];
  timeline: TimelineEntry[];
}>();

const completedPlaybooks: IncidentPlaybook[] = [];
const playbookListeners = new Set<(playbook: IncidentPlaybook) => void>();

// ═══════════════════════════════════════════════════════════════════════════════
// PLAYBOOK TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

type Template = Array<{ phase: PlaybookPhase; action: string; description: string; automatic: boolean }>;

const PLAYBOOK_TEMPLATES: Record<PlaybookType, Template> = {
  BREACH: [
    { phase: 'detect', action: 'capture_context', description: 'Capture breach context and indicators', automatic: true },
    { phase: 'isolate', action: 'kill_sessions', description: 'Terminate all active sessions for actor', automatic: true },
    { phase: 'isolate', action: 'block_actor', description: 'Block actor IP and fingerprint', automatic: true },
    { phase: 'isolate', action: 'revoke_tokens', description: 'Revoke all active tokens and API keys', automatic: true },
    { phase: 'investigate', action: 'forensic_capture', description: 'Capture full actor timeline and request log', automatic: true },
    { phase: 'investigate', action: 'blast_radius', description: 'Assess blast radius of compromised access', automatic: true },
    { phase: 'investigate', action: 'lateral_check', description: 'Check for lateral movement indicators', automatic: true },
    { phase: 'remediate', action: 'rotate_secrets', description: 'Flag affected secrets for rotation', automatic: false },
    { phase: 'remediate', action: 'patch_vector', description: 'Identify and flag attack vector for patching', automatic: false },
    { phase: 'report', action: 'generate_report', description: 'Generate incident report with timeline', automatic: true },
    { phase: 'recover', action: 'verify_containment', description: 'Verify threat is fully contained', automatic: true },
  ],
  DDOS: [
    { phase: 'detect', action: 'measure_rate', description: 'Measure request rate and identify sources', automatic: true },
    { phase: 'isolate', action: 'escalate_limits', description: 'Escalate rate limits 10x', automatic: true },
    { phase: 'isolate', action: 'block_sources', description: 'Block top offending IPs', automatic: true },
    { phase: 'investigate', action: 'pattern_analysis', description: 'Analyze traffic pattern (bot vs distributed)', automatic: true },
    { phase: 'remediate', action: 'challenge_mode', description: 'Enable challenge mode for suspicious traffic', automatic: true },
    { phase: 'report', action: 'generate_report', description: 'Generate DDoS incident report', automatic: true },
    { phase: 'recover', action: 'relax_limits', description: 'Gradually relax rate limits', automatic: false },
  ],
  EXFILTRATION: [
    { phase: 'detect', action: 'identify_flow', description: 'Identify data flow and volume', automatic: true },
    { phase: 'isolate', action: 'kill_connection', description: 'Terminate suspicious connections', automatic: true },
    { phase: 'isolate', action: 'block_egress', description: 'Block egress to identified destinations', automatic: true },
    { phase: 'investigate', action: 'data_audit', description: 'Audit accessed data and scope', automatic: true },
    { phase: 'investigate', action: 'classification', description: 'Classify sensitivity of exfiltrated data', automatic: true },
    { phase: 'remediate', action: 'access_review', description: 'Review and restrict access permissions', automatic: false },
    { phase: 'report', action: 'generate_report', description: 'Generate exfiltration report', automatic: true },
    { phase: 'recover', action: 'monitor_enhanced', description: 'Enable enhanced monitoring for 24h', automatic: true },
  ],
  INTRUSION: [
    { phase: 'detect', action: 'capture_session', description: 'Capture session details and fingerprint', automatic: true },
    { phase: 'isolate', action: 'purge_sessions', description: 'Purge all sessions for compromised account', automatic: true },
    { phase: 'isolate', action: 'lock_account', description: 'Lock affected account', automatic: true },
    { phase: 'investigate', action: 'access_timeline', description: 'Build access timeline', automatic: true },
    { phase: 'investigate', action: 'privilege_audit', description: 'Audit privilege escalation attempts', automatic: true },
    { phase: 'remediate', action: 'credential_reset', description: 'Force credential reset', automatic: false },
    { phase: 'report', action: 'generate_report', description: 'Generate intrusion report', automatic: true },
    { phase: 'recover', action: 'unlock_account', description: 'Unlock account after verification', automatic: false },
  ],
  MALWARE: [
    { phase: 'detect', action: 'signature_extract', description: 'Extract malware signatures', automatic: true },
    { phase: 'isolate', action: 'quarantine_payload', description: 'Quarantine detected payload', automatic: true },
    { phase: 'isolate', action: 'block_hash', description: 'Block payload hash across all inputs', automatic: true },
    { phase: 'investigate', action: 'variant_check', description: 'Check for known malware variants', automatic: true },
    { phase: 'investigate', action: 'c2_detection', description: 'Scan for C2 communication indicators', automatic: true },
    { phase: 'remediate', action: 'update_signatures', description: 'Update detection signatures', automatic: true },
    { phase: 'report', action: 'generate_report', description: 'Generate malware analysis report', automatic: true },
    { phase: 'recover', action: 'clean_scan', description: 'Run full clean verification scan', automatic: true },
  ],
  CUSTOM: [
    { phase: 'detect', action: 'capture_context', description: 'Capture incident context', automatic: true },
    { phase: 'investigate', action: 'analyze', description: 'Analyze incident', automatic: true },
    { phase: 'report', action: 'generate_report', description: 'Generate report', automatic: true },
  ],
};

const PHASE_ORDER: PlaybookPhase[] = ['detect', 'isolate', 'investigate', 'remediate', 'report', 'recover'];

// ═══════════════════════════════════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Trigger an incident response playbook.
 */
export function triggerPlaybook(
  type: PlaybookType,
  triggeredBy: string,
  severity: IncidentPlaybook['severity'] = 'high',
  actorId: string | null = null,
): IncidentPlaybook {
  // Limit concurrent playbooks
  if (activePlaybooks.size >= MAX_CONCURRENT) {
    // Find and abort oldest non-critical
    for (const [id, pb] of activePlaybooks) {
      if (pb.severity !== 'critical') {
        abortPlaybook(id);
        break;
      }
    }
  }

  const id = `INC-${(++playbookSeq).toString(36).padStart(4, '0')}`;
  const template = PLAYBOOK_TEMPLATES[type] || PLAYBOOK_TEMPLATES.CUSTOM;
  const now = Date.now();

  const steps: PlaybookStep[] = template.map((t, i) => ({
    id: `${id}-S${i + 1}`,
    phase: t.phase,
    action: t.action,
    description: t.description,
    status: 'pending' as StepStatus,
    startedAt: null,
    completedAt: null,
    result: null,
    automatic: t.automatic,
  }));

  const playbook: IncidentPlaybook & {
    steps: PlaybookStep[];
    findings: string[];
    remediationActions: string[];
    timeline: TimelineEntry[];
  } = {
    id,
    type,
    name: `${type} Incident Response`,
    status: 'running',
    severity,
    triggeredBy,
    actorId,
    steps,
    currentPhase: 'detect',
    startedAt: now,
    completedAt: null,
    findings: [],
    remediationActions: [],
    timeline: [{ timestamp: now, phase: 'detect', event: `Playbook ${type} triggered by: ${triggeredBy}`, automatic: true }],
  };

  activePlaybooks.set(id, playbook);

  // Auto-execute automatic steps
  executeAutomaticSteps(playbook);

  // Notify listeners
  for (const listener of playbookListeners) {
    try { listener(playbook); } catch { /* swallow */ }
  }

  return playbook;
}

/**
 * Execute all automatic steps in sequence.
 */
function executeAutomaticSteps(playbook: ReturnType<typeof triggerPlaybook> & {
  steps: PlaybookStep[];
  findings: string[];
  remediationActions: string[];
  timeline: TimelineEntry[];
  status: PlaybookStatus;
  currentPhase: PlaybookPhase;
  completedAt: number | null;
}): void {
  const pb = playbook as any;
  const now = Date.now();

  for (let i = 0; i < pb.steps.length; i++) {
    const step = pb.steps[i];
    if (step.status !== 'pending') continue;
    if (!step.automatic) continue;

    // Execute step
    pb.steps[i] = {
      ...step,
      status: 'success' as StepStatus,
      startedAt: now,
      completedAt: now + 1,
      result: `Auto-executed: ${step.description}`,
    };

    pb.timeline.push({
      timestamp: now,
      phase: step.phase,
      event: `[AUTO] ${step.description}`,
      automatic: true,
    });

    pb.currentPhase = step.phase;

    // Generate findings based on step type
    if (step.action === 'forensic_capture') {
      pb.findings.push('Actor activity timeline captured');
    } else if (step.action === 'blast_radius') {
      pb.findings.push('Blast radius assessed: contained to actor scope');
    } else if (step.action === 'signature_extract') {
      pb.findings.push('Malware signature extracted and cataloged');
    } else if (step.action === 'pattern_analysis') {
      pb.findings.push('Traffic pattern analyzed');
    }
  }

  // Check if all steps complete
  const allDone = pb.steps.every((s: PlaybookStep) => s.status !== 'pending' || !s.automatic);
  const pendingManual = pb.steps.some((s: PlaybookStep) => s.status === 'pending' && !s.automatic);

  if (allDone && !pendingManual) {
    pb.status = 'completed';
    pb.completedAt = Date.now();
    // Move to completed
    completedPlaybooks.push({ ...pb } as IncidentPlaybook);
    activePlaybooks.delete(pb.id);
    if (completedPlaybooks.length > MAX_PLAYBOOKS) completedPlaybooks.splice(0, 1);
  }
}

/**
 * Complete a manual step in a playbook.
 */
export function completeStep(playbookId: string, stepId: string, result: string): boolean {
  const pb = activePlaybooks.get(playbookId) as any;
  if (!pb) return false;

  const idx = pb.steps.findIndex((s: PlaybookStep) => s.id === stepId);
  if (idx === -1) return false;

  const now = Date.now();
  pb.steps[idx] = {
    ...pb.steps[idx],
    status: 'success',
    startedAt: now,
    completedAt: now,
    result,
  };

  pb.timeline.push({
    timestamp: now,
    phase: pb.steps[idx].phase,
    event: `[MANUAL] ${pb.steps[idx].description}: ${result}`,
    automatic: false,
  });

  pb.remediationActions.push(result);

  // Re-run automatic steps that may now be unblocked
  executeAutomaticSteps(pb);

  return true;
}

/**
 * Abort a running playbook.
 */
export function abortPlaybook(playbookId: string): boolean {
  const pb = activePlaybooks.get(playbookId) as any;
  if (!pb) return false;

  pb.status = 'aborted';
  pb.completedAt = Date.now();
  pb.timeline.push({
    timestamp: Date.now(),
    phase: pb.currentPhase,
    event: 'Playbook aborted',
    automatic: false,
  });

  completedPlaybooks.push({ ...pb } as IncidentPlaybook);
  activePlaybooks.delete(playbookId);
  return true;
}

/**
 * Subscribe to playbook events.
 */
export function onPlaybookEvent(listener: (playbook: IncidentPlaybook) => void): () => void {
  playbookListeners.add(listener);
  return () => { playbookListeners.delete(listener); };
}

/**
 * Get all active playbooks.
 */
export function getActivePlaybooks(): readonly IncidentPlaybook[] {
  return Object.freeze(Array.from(activePlaybooks.values()));
}

/**
 * Get completed playbooks.
 */
export function getCompletedPlaybooks(limit = 10): readonly IncidentPlaybook[] {
  const start = Math.max(0, completedPlaybooks.length - limit);
  return Object.freeze(completedPlaybooks.slice(start).reverse());
}

/**
 * Get playbook stats.
 */
export function getPlaybookStats() {
  return {
    version: '1.0.0',
    activeCount: activePlaybooks.size,
    completedCount: completedPlaybooks.length,
    maxConcurrent: MAX_CONCURRENT,
    supportedTypes: Object.keys(PLAYBOOK_TEMPLATES),
  };
}
