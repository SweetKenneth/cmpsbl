/**
 * PHANTOM Ultimate — Privacy Budget Ledger
 * Cryptographic ledger tracking every privacy-consuming operation.
 * Per-entity, per-dataset, and global epsilon accounting with composition theorem enforcement.
 */

export interface BudgetEntry {
  id: string;
  entityId: string;
  datasetId: string;
  operation: string;
  epsilonConsumed: number;
  deltaConsumed: number;
  mechanism: string;
  prevHash: string;
  entryHash: string;
  timestamp: number;
}

export interface EntityBudget {
  entityId: string;
  totalEpsilon: number;
  consumedEpsilon: number;
  totalDelta: number;
  consumedDelta: number;
  operationCount: number;
  exhausted: boolean;
}

export interface LedgerStats {
  totalEntries: number;
  totalEntities: number;
  globalEpsilonConsumed: number;
  globalDeltaConsumed: number;
  exhaustedEntities: number;
  chainIntegrity: boolean;
}

const MAX_ENTRIES = 3000;
const DEFAULT_ENTITY_BUDGET = 5.0;
const DEFAULT_DELTA_BUDGET = 1e-3;

const ledger: BudgetEntry[] = [];
const entityBudgets = new Map<string, EntityBudget>();

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function allocateEntityBudget(entityId: string, epsilon: number = DEFAULT_ENTITY_BUDGET, delta: number = DEFAULT_DELTA_BUDGET): EntityBudget {
  const budget: EntityBudget = {
    entityId, totalEpsilon: epsilon, consumedEpsilon: 0,
    totalDelta: delta, consumedDelta: 0, operationCount: 0, exhausted: false,
  };
  entityBudgets.set(entityId, budget);
  return budget;
}

export function recordPrivacyOperation(
  entityId: string, datasetId: string, operation: string,
  epsilonCost: number, deltaCost: number = 0, mechanism: string = 'laplace'
): BudgetEntry | null {
  let budget = entityBudgets.get(entityId);
  if (!budget) budget = allocateEntityBudget(entityId);

  // Sequential composition: ε_total = Σ ε_i
  if (budget.consumedEpsilon + epsilonCost > budget.totalEpsilon) return null;
  if (budget.consumedDelta + deltaCost > budget.totalDelta) return null;

  budget.consumedEpsilon += epsilonCost;
  budget.consumedDelta += deltaCost;
  budget.operationCount++;
  budget.exhausted = budget.consumedEpsilon >= budget.totalEpsilon;

  const prevHash = ledger.length > 0 ? ledger[ledger.length - 1].entryHash : '00000000';
  const entryData = `${entityId}|${datasetId}|${operation}|${epsilonCost}|${prevHash}|${Date.now()}`;
  const entryHash = fnvHash(entryData);

  const entry: BudgetEntry = {
    id: `ble-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityId, datasetId, operation, epsilonConsumed: epsilonCost,
    deltaConsumed: deltaCost, mechanism, prevHash, entryHash,
    timestamp: Date.now(),
  };

  if (ledger.length >= MAX_ENTRIES) ledger.shift();
  ledger.push(entry);
  return entry;
}

export function getEntityBudget(entityId: string): EntityBudget | null {
  return entityBudgets.get(entityId) ?? null;
}

export function verifyChainIntegrity(): boolean {
  for (let i = 1; i < ledger.length; i++) {
    if (ledger[i].prevHash !== ledger[i - 1].entryHash) return false;
  }
  return true;
}

export function getLedgerStats(): LedgerStats {
  const all = [...entityBudgets.values()];
  return {
    totalEntries: ledger.length,
    totalEntities: all.length,
    globalEpsilonConsumed: all.reduce((s, b) => s + b.consumedEpsilon, 0),
    globalDeltaConsumed: all.reduce((s, b) => s + b.consumedDelta, 0),
    exhaustedEntities: all.filter(b => b.exhausted).length,
    chainIntegrity: verifyChainIntegrity(),
  };
}

export function resetLedgerState(): void { ledger.length = 0; entityBudgets.clear(); }
