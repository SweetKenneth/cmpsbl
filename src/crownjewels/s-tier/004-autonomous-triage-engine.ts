/**
 * S-Tier Crown Jewel #4 — MEDIC Autonomous Triage Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 4 | CJPI: 97 | Version: 1.0.0
 * Module: MEDIC | Type: Architecture
 * Signature: d6fa04c3
 * Generated: 2026-03-01T00:00:00.000Z
 */

type Severity = 'critical' | 'degraded' | 'warning' | 'info';
type RepairAction = 'restart' | 'scale_up' | 'circuit_break' | 'reroute' | 'alert' | 'rollback' | 'quarantine' | 'none';

interface SymptomReport { nodeId: string; symptom: string; value: number; threshold?: number; timestamp: number; }
interface Diagnosis { nodeId: string; severity: Severity; symptoms: SymptomReport[]; possibleCauses: string[]; recommendedActions: RepairAction[]; confidence: number; diagnosedAt: number; }
interface FailureSignature { name: string; symptoms: Array<{ symptom: string; minValue: number }>; severity: Severity; causes: string[]; actions: RepairAction[]; confidence: number; }

export function createTriageEngine() {
  const symptoms = new Map<string, SymptomReport[]>();
  const repairHistory: Array<{ nodeId: string; action: RepairAction; success: boolean; durationMs: number; timestamp: number }> = [];
  const nodeHealth = new Map<string, number>();

  const signatures: FailureSignature[] = [
    { name: 'memory_leak', symptoms: [{ symptom: 'memory_usage', minValue: 0.9 }, { symptom: 'gc_pressure', minValue: 0.7 }], severity: 'critical', causes: ['Unbounded cache growth', 'Event listener accumulation'], actions: ['restart', 'alert'], confidence: 0.85 },
    { name: 'cascading_failure', symptoms: [{ symptom: 'error_rate', minValue: 0.3 }, { symptom: 'dependency_errors', minValue: 0.5 }], severity: 'critical', causes: ['Upstream failure', 'Network partition'], actions: ['circuit_break', 'reroute', 'alert'], confidence: 0.80 },
    { name: 'latency_spike', symptoms: [{ symptom: 'latency_p95', minValue: 5000 }], severity: 'degraded', causes: ['Slow query', 'API timeout'], actions: ['scale_up', 'reroute'], confidence: 0.75 },
    { name: 'capacity_exhaustion', symptoms: [{ symptom: 'cpu_usage', minValue: 0.85 }, { symptom: 'queue_depth', minValue: 100 }], severity: 'degraded', causes: ['Traffic spike', 'Inefficient queries'], actions: ['scale_up', 'alert'], confidence: 0.80 },
    { name: 'data_corruption', symptoms: [{ symptom: 'checksum_failures', minValue: 1 }], severity: 'critical', causes: ['Disk failure', 'Race condition'], actions: ['quarantine', 'rollback', 'alert'], confidence: 0.90 },
  ];

  function reportSymptom(report: Omit<SymptomReport, 'timestamp'>) {
    const full: SymptomReport = { ...report, timestamp: Date.now() };
    if (!symptoms.has(report.nodeId)) symptoms.set(report.nodeId, []);
    const list = symptoms.get(report.nodeId)!;
    list.push(full);
    if (list.length > 100) list.splice(0, list.length - 100);
  }

  function matchSignature(nodeSymptoms: SymptomReport[]): FailureSignature | null {
    let best: FailureSignature | null = null; let bestScore = 0;
    for (const sig of signatures) {
      let matched = 0;
      for (const req of sig.symptoms) {
        const recent = nodeSymptoms.filter(s => s.symptom === req.symptom && Date.now() - s.timestamp < 300_000).sort((a, b) => b.timestamp - a.timestamp)[0];
        if (recent && recent.value >= req.minValue) matched++;
      }
      const score = sig.symptoms.length > 0 ? matched / sig.symptoms.length : 0;
      if (score > bestScore && score >= 0.5) { best = sig; bestScore = score; }
    }
    return best;
  }

  function diagnose(nodeId?: string): Diagnosis[] {
    const diagnoses: Diagnosis[] = [];
    const targets = nodeId ? [nodeId] : [...symptoms.keys()];
    for (const nid of targets) {
      const ns = (symptoms.get(nid) ?? []).filter(s => Date.now() - s.timestamp < 300_000);
      if (!ns.length) continue;
      const sig = matchSignature(ns);
      if (sig) diagnoses.push({ nodeId: nid, severity: sig.severity, symptoms: ns, possibleCauses: sig.causes, recommendedActions: sig.actions, confidence: sig.confidence, diagnosedAt: Date.now() });
    }
    const order: Record<Severity, number> = { critical: 0, degraded: 1, warning: 2, info: 3 };
    return diagnoses.sort((a, b) => order[a.severity] - order[b.severity]);
  }

  function recordRepair(outcome: { nodeId: string; action: RepairAction; success: boolean; durationMs: number }) {
    repairHistory.push({ ...outcome, timestamp: Date.now() });
    if (repairHistory.length > 500) repairHistory.splice(0, repairHistory.length - 500);
    if (outcome.success) nodeHealth.set(outcome.nodeId, Math.min(1, (nodeHealth.get(outcome.nodeId) ?? 0.5) + 0.1));
  }

  function addSignature(sig: FailureSignature) { signatures.push(sig); }
  function getRepairSuccessRate(): number { return repairHistory.length === 0 ? 1 : repairHistory.filter(r => r.success).length / repairHistory.length; }

  return { reportSymptom, diagnose, recordRepair, addSignature, getRepairSuccessRate };
}
