/**
 * DEFENSE Event Bus v1.0.0
 * Lightweight in-memory event emitter for defense alerts.
 * Bridges DEFENSE engine verdicts → UI-safe, redacted alert stream.
 *
 * Rules:
 *  - Never exposes raw payloads, secrets, or full match content
 *  - Bounded queue (max 100 events, UI reads last 20)
 *  - Non-blocking: emit failures are swallowed
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DefenseAlertEvent {
  readonly type: 'DEFENSE_ALERT';
  readonly id: string;
  readonly timestamp: number;
  readonly actorId: string;
  readonly verdict: 'clean' | 'suspicious' | 'malicious' | 'blocked';
  readonly riskScore: number;
  readonly summary: string;
  readonly topThreat: {
    readonly category: string;
    readonly severity: string;
    readonly description: string;
  } | null;
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  readonly actionTaken: 'allow' | 'flag' | 'throttle' | 'block';
  readonly threatCount: number;
  readonly behavioralAlertCount: number;
}

export type DefenseEventListener = (event: DefenseAlertEvent) => void;

// ═══════════════════════════════════════════════════════════════════════════════
// REDACTION — strip sensitive data before emitting
// ═══════════════════════════════════════════════════════════════════════════════

interface RawThreatInfo {
  category: string;
  severity: string;
  description: string;
  matchedContent?: string;
  pattern?: string;
}

/**
 * Redact a threat for UI consumption.
 * Strips: raw input, match content, regex patterns.
 * Keeps: category, severity, short description only.
 */
function redactThreat(threat: RawThreatInfo): DefenseAlertEvent['topThreat'] {
  return Object.freeze({
    category: threat.category,
    severity: threat.severity,
    description: threat.description.slice(0, 120),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY GENERATOR — human-readable alert descriptions
// ═══════════════════════════════════════════════════════════════════════════════

const VERDICT_SUMMARIES: Record<string, string> = {
  blocked: 'Threat blocked',
  malicious: 'Malicious activity detected',
  suspicious: 'Suspicious activity flagged',
  clean: 'Request verified clean',
};

const CATEGORY_LABELS: Record<string, string> = {
  remote_code_execution: 'RCE attempt',
  shell_access: 'shell access attempt',
  reverse_shell: 'reverse shell attempt',
  web_shell: 'web shell signature',
  data_exfiltration: 'data exfiltration vector',
  cryptominer: 'cryptominer signature',
  obfuscation: 'obfuscated payload',
  ransomware: 'ransomware indicator',
  keylogger: 'keylogger pattern',
  supply_chain: 'supply chain attack',
  high_entropy: 'encrypted/packed payload',
  deep_encoding: 'deeply encoded payload',
  oversized_payload: 'oversized payload',
  polyglot_file: 'polyglot file bypass',
  binary_detected: 'dangerous binary',
  sql_injection: 'SQL injection',
  xss: 'XSS attack',
  command_injection: 'command injection',
  ssrf: 'SSRF targeting internal network',
  template_injection: 'template injection',
  prototype_pollution: 'prototype pollution',
  path_traversal: 'path traversal',
  header_injection: 'header injection',
  nosql_injection: 'NoSQL injection',
  xml_injection: 'XXE injection',
  open_redirect: 'open redirect',
  exfiltration: 'data exfiltration pattern',
  lateral_movement: 'lateral movement',
  privilege_escalation: 'privilege escalation',
  reconnaissance: 'reconnaissance activity',
  persistence: 'persistence establishment',
  anomalous: 'behavioral anomaly',
  evasion: 'evasion technique',
  environment_access: 'environment access',
  filesystem_access: 'filesystem access',
  dynamic_import: 'dynamic remote import',
  code_generation: 'dynamic code generation',
};

function generateSummary(
  verdict: string,
  topCategory: string | null,
  behavioralCount: number,
): string {
  const base = VERDICT_SUMMARIES[verdict] || 'Security event';
  if (topCategory) {
    const label = CATEGORY_LABELS[topCategory] || topCategory.replace(/_/g, ' ');
    return `${base}: ${label}`;
  }
  if (behavioralCount > 0) {
    return `${base}: behavioral anomaly detected`;
  }
  return base;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT BUS
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_QUEUE = 100;
const eventQueue: DefenseAlertEvent[] = [];
const listeners = new Set<DefenseEventListener>();
let eventSeq = 0;

/**
 * Emit a defense alert event to all listeners.
 * Input is pre-redacted — raw payloads never reach this layer.
 */
export function emitDefenseEvent(params: {
  actorId: string;
  verdict: DefenseAlertEvent['verdict'];
  riskScore: number;
  threats: RawThreatInfo[];
  behavioralAlertCount: number;
  actionTaken: DefenseAlertEvent['actionTaken'];
}): DefenseAlertEvent {
  const { actorId, verdict, riskScore, threats, behavioralAlertCount, actionTaken } = params;

  // Find top threat by severity priority
  const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
  const sorted = [...threats].sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));
  const topRaw = sorted[0] || null;

  // Determine overall severity
  let severity: DefenseAlertEvent['severity'] = 'info';
  if (verdict === 'blocked') severity = 'critical';
  else if (verdict === 'malicious') severity = 'high';
  else if (verdict === 'suspicious') severity = 'medium';
  else if (threats.length > 0) severity = 'low';

  const event: DefenseAlertEvent = Object.freeze({
    type: 'DEFENSE_ALERT' as const,
    id: `DEF-${Date.now().toString(36)}-${(++eventSeq).toString(36)}`,
    timestamp: Date.now(),
    actorId,
    verdict,
    riskScore,
    summary: generateSummary(verdict, topRaw?.category || null, behavioralAlertCount),
    topThreat: topRaw ? redactThreat(topRaw) : null,
    severity,
    actionTaken,
    threatCount: threats.length,
    behavioralAlertCount,
  });

  // Push to bounded queue
  eventQueue.push(event);
  if (eventQueue.length > MAX_QUEUE) {
    eventQueue.splice(0, eventQueue.length - MAX_QUEUE);
  }

  // Notify listeners (non-blocking)
  for (const listener of listeners) {
    try { listener(event); } catch { /* swallow — UI must not crash defense */ }
  }

  return event;
}

/**
 * Subscribe to defense alert events.
 * Returns unsubscribe function.
 */
export function onDefenseEvent(listener: DefenseEventListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/**
 * Get recent alerts (most recent first), capped at `limit`.
 */
export function getRecentAlerts(limit = 20): readonly DefenseAlertEvent[] {
  const start = Math.max(0, eventQueue.length - limit);
  return Object.freeze(eventQueue.slice(start).reverse());
}

/**
 * Get event bus stats.
 */
export function getEventBusStats() {
  return {
    queueSize: eventQueue.length,
    maxQueue: MAX_QUEUE,
    listenerCount: listeners.size,
    totalEmitted: eventSeq,
  };
}
