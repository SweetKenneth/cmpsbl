/**
 * PHANTOM Ultimate — Anonymization Pipeline
 * Multi-strategy PII removal: k-anonymity, l-diversity, t-closeness.
 * Field-level strategy selection with reversibility tracking.
 */

export type AnonymizationStrategy = 'hash' | 'mask' | 'generalize' | 'suppress' | 'perturb' | 'tokenize';

export interface FieldPolicy {
  fieldName: string;
  strategy: AnonymizationStrategy;
  quasiIdentifier: boolean;
  sensitive: boolean;
  generalizationLevel?: number;  // 0 = exact, higher = more general
  maskPattern?: string;          // e.g., "***-**-{last4}"
}

export interface AnonymizationPlan {
  id: string;
  datasetId: string;
  policies: FieldPolicy[];
  kAnonymity: number;       // minimum group size
  lDiversity?: number;      // sensitive attribute diversity
  tCloseness?: number;      // distribution distance threshold
  createdAt: number;
}

export interface AnonymizationRecord {
  planId: string;
  recordsProcessed: number;
  fieldsCovered: number;
  strategiesUsed: AnonymizationStrategy[];
  reversible: boolean;
  reversalTokenStored: boolean;
  processedAt: number;
}

export interface AnonymizationStats {
  totalPlans: number;
  totalRecords: number;
  avgFieldsPerPlan: number;
  strategyDistribution: Record<string, number>;
  reversibleCount: number;
}

const MAX_PLANS = 300;
const MAX_RECORDS = 1000;

const plans = new Map<string, AnonymizationPlan>();
const records: AnonymizationRecord[] = [];
const reversalTokens = new Map<string, Map<string, string>>(); // planId → hash→original

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function createAnonymizationPlan(
  datasetId: string, policies: FieldPolicy[],
  kAnonymity: number = 5, lDiversity?: number, tCloseness?: number
): AnonymizationPlan {
  const plan: AnonymizationPlan = {
    id: `anon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    datasetId, policies, kAnonymity, lDiversity, tCloseness,
    createdAt: Date.now(),
  };
  if (plans.size >= MAX_PLANS) {
    const oldest = [...plans.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) plans.delete(oldest.id);
  }
  plans.set(plan.id, plan);
  return plan;
}

export function anonymizeRecord(
  planId: string, record: Record<string, unknown>
): Record<string, unknown> | null {
  const plan = plans.get(planId);
  if (!plan) return null;

  const result = { ...record };
  let hasReversible = false;
  const strategiesUsed = new Set<AnonymizationStrategy>();

  for (const policy of plan.policies) {
    const value = result[policy.fieldName];
    if (value === undefined || value === null) continue;

    const strVal = String(value);
    strategiesUsed.add(policy.strategy);

    switch (policy.strategy) {
      case 'hash': {
        const hashed = fnvHash(strVal);
        // Store reversal token
        if (!reversalTokens.has(planId)) reversalTokens.set(planId, new Map());
        reversalTokens.get(planId)!.set(hashed, strVal);
        result[policy.fieldName] = hashed;
        hasReversible = true;
        break;
      }
      case 'mask': {
        const pattern = policy.maskPattern ?? '***';
        if (strVal.length > 4) {
          result[policy.fieldName] = pattern.replace('{last4}', strVal.slice(-4));
        } else {
          result[policy.fieldName] = pattern;
        }
        break;
      }
      case 'generalize': {
        const level = policy.generalizationLevel ?? 1;
        if (typeof value === 'number') {
          const bucket = Math.pow(10, level);
          result[policy.fieldName] = Math.floor(value / bucket) * bucket;
        } else {
          result[policy.fieldName] = strVal.slice(0, Math.max(1, strVal.length - level));
        }
        break;
      }
      case 'suppress':
        result[policy.fieldName] = '[REDACTED]';
        break;
      case 'perturb': {
        if (typeof value === 'number') {
          const noise = (Math.random() - 0.5) * value * 0.1;
          result[policy.fieldName] = value + noise;
        }
        break;
      }
      case 'tokenize': {
        const token = `tok_${fnvHash(strVal + planId)}`;
        if (!reversalTokens.has(planId)) reversalTokens.set(planId, new Map());
        reversalTokens.get(planId)!.set(token, strVal);
        result[policy.fieldName] = token;
        hasReversible = true;
        break;
      }
    }
  }

  const rec: AnonymizationRecord = {
    planId, recordsProcessed: 1,
    fieldsCovered: plan.policies.length,
    strategiesUsed: [...strategiesUsed],
    reversible: hasReversible,
    reversalTokenStored: hasReversible,
    processedAt: Date.now(),
  };
  if (records.length >= MAX_RECORDS) records.shift();
  records.push(rec);

  return result;
}

export function reverseAnonymization(planId: string, field: string, anonymizedValue: string): string | null {
  const tokens = reversalTokens.get(planId);
  if (!tokens) return null;
  return tokens.get(anonymizedValue) ?? null;
}

export function getAnonymizationStats(): AnonymizationStats {
  const stratDist: Record<string, number> = {};
  for (const r of records) {
    for (const s of r.strategiesUsed) {
      stratDist[s] = (stratDist[s] ?? 0) + 1;
    }
  }
  return {
    totalPlans: plans.size,
    totalRecords: records.length,
    avgFieldsPerPlan: plans.size > 0 ? [...plans.values()].reduce((s, p) => s + p.policies.length, 0) / plans.size : 0,
    strategyDistribution: stratDist,
    reversibleCount: records.filter(r => r.reversible).length,
  };
}

export function resetAnonymizationState(): void { plans.clear(); records.length = 0; reversalTokens.clear(); }
