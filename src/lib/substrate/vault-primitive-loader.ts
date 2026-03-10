/**
 * Vault Primitive Loader — Runtime integration of 1,894 vault discoveries
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Reads vault_promotions from the database at boot and registers each
 * discovery as a runtime capability primitive in the substrate.
 *
 * Ownership follows category-based mapping:
 *   security → DEFENSE, cognitive → BRAIN, evolution → EVOLUTION, etc.
 * Data/ingestion discoveries are routed to HARVEST.
 */

import { supabase } from '@/integrations/supabase/client';
import { registerCapability } from './capability-router';

// ─── Category → Home Node mapping ──────────────────────────────────────────

const CATEGORY_NODE_MAP: Record<string, string> = {
  // Security & compliance
  security: 'defense',
  threat: 'defense',
  firewall: 'defense',
  compliance: 'sovereign',
  sovereignty: 'sovereign',
  privacy: 'phantom',
  anonymization: 'phantom',
  contracts: 'treaty',
  agreement: 'treaty',
  ethics: 'conscience',
  bias: 'conscience',

  // Cognitive & learning
  cognitive: 'brain',
  reasoning: 'brain',
  intelligence: 'brain',
  neural: 'brain',
  learning: 'brain',
  prediction: 'oracle',
  forecasting: 'oracle',
  bayesian: 'oracle',
  simulation: 'echo',
  replay: 'echo',

  // Memory & knowledge
  memory: 'memory',
  persistence: 'memory',
  knowledge: 'memory',
  caching: 'memory',
  retention: 'memory',

  // Execution & orchestration
  orchestration: 'cortex',
  pipeline: 'cortex',
  workflow: 'cortex',
  routing: 'nexus',
  fleet: 'nexus',
  provider: 'nexus',
  ai_routing: 'nexus',
  edge: 'reflex',
  latency: 'reflex',

  // Communication & decode
  conversation: 'decode',
  intent: 'decode',
  interface: 'decode',
  nlp: 'decode',

  // Build & encode
  generation: 'encode',
  build: 'encode',
  compilation: 'encode',

  // Governance & evolution
  governance: 'governance',
  policy: 'governance',
  audit: 'governance',
  evolution: 'evolution',
  mutation: 'evolution',
  optimization: 'evolution',

  // Observability & health
  observability: 'vision',
  monitoring: 'vision',
  anomaly: 'vision',
  diagnostics: 'medic',
  triage: 'medic',
  healing: 'immunity',
  resilience: 'immunity',
  self_healing: 'immunity',

  // Integration & infrastructure
  integration: 'integration',
  webhook: 'integration',
  api: 'integration',
  connector: 'integration',

  // Identity & access
  identity: 'identity',
  authentication: 'identity',
  authorization: 'identity',

  // Economy
  economy: 'economy',
  billing: 'economy',
  cost: 'economy',
  pricing: 'economy',

  // Dream & synthesis
  dream: 'dream',
  imagination: 'dream',
  hypothesis: 'dream',

  // Specialized
  localization: 'lingua',
  translation: 'lingua',
  language: 'lingua',
  geospatial: 'compass',
  navigation: 'compass',
  synthesis: 'forge',
  artifact: 'forge',
  crafting: 'forge',

  // Signal & relay
  signal: 'nerve',
  relay: 'nerve',
  messaging: 'nerve',

  // Data/ingestion → HARVEST
  acquisition: 'harvest',
  ingestion: 'harvest',
  crawling: 'harvest',
  scraping: 'harvest',
  data: 'harvest',

  // Shadow & testing
  shadow: 'shadow',
  testing: 'shadow',
  verification: 'shadow',

  // Sandbox
  sandbox: 'sandbox',
  isolation: 'sandbox',
};

/** Fallback: if category not mapped, use first module in chain (lowercased) */
function resolveHomeNode(category: string, moduleChain: string[]): string {
  return CATEGORY_NODE_MAP[category] ?? moduleChain[0]?.toLowerCase() ?? 'core';
}

// ─── Primitive type for loaded vault entries ────────────────────────────────

export interface VaultPrimitive {
  id: string;
  discoveryId: string;
  name: string;
  cjpi: number;
  tier: string;
  category: string;
  moduleChain: string[];
  homeNode: string;
  description: string;
  status: string;
  promotedAt: string | null;
}

// ─── Runtime state ──────────────────────────────────────────────────────────

let loaded = false;
let loadedCount = 0;
const primitivesByNode = new Map<string, VaultPrimitive[]>();
const primitivesById = new Map<string, VaultPrimitive>();

// ─── Loader ─────────────────────────────────────────────────────────────────

/**
 * Load all vault_promotions from the database and register them as
 * substrate capabilities. Paginated to handle >1000 rows.
 * Safe to call multiple times — only loads once.
 */
export async function loadVaultPrimitives(): Promise<{
  loaded: number;
  byNode: Record<string, number>;
  errors: string[];
}> {
  if (loaded) {
    return {
      loaded: loadedCount,
      byNode: Object.fromEntries(
        [...primitivesByNode.entries()].map(([k, v]) => [k, v.length])
      ),
      errors: [],
    };
  }

  const errors: string[] = [];
  const allRows: VaultPrimitive[] = [];
  let offset = 0;
  const pageSize = 1000;

  // Paginated fetch
  while (true) {
    const { data, error } = await supabase
      .from('vault_promotions')
      .select('id, discovery_id, name, cjpi, tier, module_chain, description, category, status, promoted_at')
      .eq('export_ready', true)
      .order('cjpi', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      errors.push(`Fetch error at offset ${offset}: ${error.message}`);
      break;
    }

    if (!data || data.length === 0) break;

    for (const row of data) {
      const moduleChain: string[] = (row.module_chain as string[]) ?? [];
      const category = row.category ?? 'unknown';
      const homeNode = resolveHomeNode(category, moduleChain);

      const primitive: VaultPrimitive = {
        id: row.id,
        discoveryId: row.discovery_id ?? row.id,
        name: row.name ?? 'Unknown',
        cjpi: Number(row.cjpi) || 0,
        tier: row.tier ?? 'unknown',
        category,
        moduleChain,
        homeNode,
        description: row.description ?? '',
        status: row.status ?? 'promoted',
        promotedAt: row.promoted_at,
      };

      allRows.push(primitive);
      primitivesById.set(primitive.id, primitive);

      // Group by home node
      if (!primitivesByNode.has(homeNode)) primitivesByNode.set(homeNode, []);
      primitivesByNode.get(homeNode)!.push(primitive);

      // Register as capability in the router
      // Capability key: snake_case of the name
      const capKey = `vault_${primitive.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')}`;
      const priority = Math.min(75, Math.round(primitive.cjpi * 0.7)); // Vault primitives get 0-75 priority (below S-tier)
      registerCapability(homeNode, capKey, priority);

      // Also register secondary capabilities for each module in the chain
      for (const mod of moduleChain) {
        const modLower = mod.toLowerCase();
        if (modLower !== homeNode) {
          registerCapability(modLower, capKey, Math.max(10, priority - 15));
        }
      }
    }

    offset += pageSize;
    if (data.length < pageSize) break;
  }

  loadedCount = allRows.length;
  loaded = true;

  const byNode: Record<string, number> = {};
  for (const [node, prims] of primitivesByNode) {
    byNode[node] = prims.length;
  }

  console.log(
    `[VAULT-LOADER] Loaded ${loadedCount} vault primitives across ${primitivesByNode.size} nodes`,
    byNode
  );

  return { loaded: loadedCount, byNode, errors };
}

// ─── Query API ──────────────────────────────────────────────────────────────

/** Get all primitives assigned to a specific node */
export function getNodePrimitives(node: string): VaultPrimitive[] {
  return primitivesByNode.get(node.toLowerCase()) ?? [];
}

/** Get a specific primitive by vault ID */
export function getPrimitive(id: string): VaultPrimitive | undefined {
  return primitivesById.get(id);
}

/** Get total loaded count */
export function getVaultPrimitiveCount(): number {
  return loadedCount;
}

/** Get distribution across nodes */
export function getVaultDistribution(): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const [node, prims] of primitivesByNode) {
    dist[node] = prims.length;
  }
  return dist;
}

/** Get all primitives by category */
export function getPrimitivesByCategory(category: string): VaultPrimitive[] {
  const results: VaultPrimitive[] = [];
  for (const prim of primitivesById.values()) {
    if (prim.category === category) results.push(prim);
  }
  return results;
}

/** Get top N primitives by CJPI score */
export function getTopPrimitives(n = 25): VaultPrimitive[] {
  return [...primitivesById.values()]
    .sort((a, b) => b.cjpi - a.cjpi)
    .slice(0, n);
}

/** Check if vault primitives have been loaded */
export function isVaultLoaded(): boolean {
  return loaded;
}

/** Reset loader state (for testing) */
export function resetVaultLoader(): void {
  loaded = false;
  loadedCount = 0;
  primitivesByNode.clear();
  primitivesById.clear();
}
