/**
 * TREATY Ultimate — Compliance Prover
 * Generates cryptographic-style proofs of SLA compliance
 * using hash-chained metric snapshots.
 */

export interface ComplianceProof {
  id: string;
  contractId: string;
  metric: string;
  periodStart: number;
  periodEnd: number;
  samples: number;
  minValue: number;
  maxValue: number;
  avgValue: number;
  slaTarget: number;
  compliant: boolean;
  proofHash: string;
  generatedAt: number;
}

const MAX_PROOFS = 500;
const proofs: ComplianceProof[] = [];
let proofCounter = 0;

function hashProof(data: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function generateComplianceProof(
  contractId: string,
  metric: string,
  samples: Array<{ value: number; timestamp: number }>,
  slaTarget: number,
): ComplianceProof {
  if (samples.length === 0) {
    const emptyProof: ComplianceProof = {
      id: `proof-${++proofCounter}`,
      contractId, metric,
      periodStart: 0, periodEnd: 0,
      samples: 0, minValue: 0, maxValue: 0, avgValue: 0,
      slaTarget, compliant: false,
      proofHash: hashProof(`${contractId}:${metric}:empty`),
      generatedAt: Date.now(),
    };
    if (proofs.length >= MAX_PROOFS) proofs.shift();
    proofs.push(emptyProof);
    return emptyProof;
  }

  const sorted = [...samples].sort((a, b) => a.timestamp - b.timestamp);
  const values = sorted.map(s => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;

  // Compliance: average must meet or exceed target
  const compliant = avg >= slaTarget;

  // Hash includes all sample values for integrity
  const dataString = `${contractId}:${metric}:${sorted.map(s => `${s.value}@${s.timestamp}`).join(',')}:${slaTarget}`;
  const proofHash = hashProof(dataString);

  const proof: ComplianceProof = {
    id: `proof-${++proofCounter}`,
    contractId, metric,
    periodStart: sorted[0].timestamp,
    periodEnd: sorted[sorted.length - 1].timestamp,
    samples: sorted.length,
    minValue: Math.round(min * 1000) / 1000,
    maxValue: Math.round(max * 1000) / 1000,
    avgValue: Math.round(avg * 1000) / 1000,
    slaTarget,
    compliant,
    proofHash,
    generatedAt: Date.now(),
  };

  if (proofs.length >= MAX_PROOFS) proofs.shift();
  proofs.push(proof);
  return proof;
}

export function verifyProof(proofId: string, samples: Array<{ value: number; timestamp: number }>, slaTarget: number): boolean {
  const proof = proofs.find(p => p.id === proofId);
  if (!proof) return false;

  const sorted = [...samples].sort((a, b) => a.timestamp - b.timestamp);
  const dataString = `${proof.contractId}:${proof.metric}:${sorted.map(s => `${s.value}@${s.timestamp}`).join(',')}:${slaTarget}`;
  return hashProof(dataString) === proof.proofHash;
}

export function getProofs(contractId?: string): ComplianceProof[] {
  if (!contractId) return [...proofs];
  return proofs.filter(p => p.contractId === contractId);
}

export function getProverStats() {
  return {
    totalProofs: proofs.length,
    compliantProofs: proofs.filter(p => p.compliant).length,
    complianceRate: proofs.length > 0
      ? Math.round(proofs.filter(p => p.compliant).length / proofs.length * 1000) / 1000
      : 0,
  };
}
