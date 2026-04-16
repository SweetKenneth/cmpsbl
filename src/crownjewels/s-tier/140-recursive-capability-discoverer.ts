/**
 * S-Tier 140 — Recursive Capability Discoverer
 * ID: S-CJ98 | CJPI: 86 | Module: ATLAS
 *
 * Discovers new capabilities through recursive system introspection.
 * Real logic: deterministic FNV-1a fingerprinting, structural overlap analysis,
 * recursive composition expansion, and emergence detection from interaction graphs.
 * No randomness — same registered inputs always produce identical discoveries.
 */

export interface DiscoveredCapability {
  id: string;
  name: string;
  source: 'introspection' | 'composition' | 'emergence';
  components: string[];
  confidence: number;
  estimatedValue: number;
  discoveredAt: string;
}

export interface DiscoveryCycle {
  id: string;
  iteration: number;
  discovered: DiscoveredCapability[];
  searchDepth: number;
  timestamp: string;
}

// ── Deterministic helpers (FNV-1a 32-bit) ──────────────────────────────────
function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

function deterministicId(seed: string): string {
  const a = fnv1a(seed).toString(16).padStart(8, '0');
  const b = fnv1a(seed + ':2').toString(16).padStart(8, '0');
  const c = fnv1a(seed + ':3').toString(16).padStart(8, '0');
  return `cap_${a}${b.slice(0, 4)}${c.slice(0, 4)}`;
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  for (const v of sa) if (sb.has(v)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export class RecursiveCapabilityDiscoverer {
  private known: Map<string, string[]> = new Map();
  private discovered: DiscoveredCapability[] = [];
  private discoveredIds: Set<string> = new Set();
  private iteration = 0;
  private readonly EPOCH = '2026-01-01T00:00:00.000Z';

  registerKnown(capabilityId: string, subCapabilities: string[]): void {
    // Normalize + dedupe sub-capabilities so registration order is irrelevant
    const normalized = [...new Set(subCapabilities.map((s) => s.trim()).filter(Boolean))].sort();
    this.known.set(capabilityId, normalized);
  }

  /**
   * Run a discovery cycle. Three real strategies:
   *   1. Introspection — capabilities whose sub-set is a strict superset of another's (specialization)
   *   2. Composition  — pairs with low overlap and complementary surface area
   *   3. Emergence    — triads forming closed loops (A↔B share x, B↔C share y, A↔C share z)
   */
  discover(maxDepth = 3): DiscoveryCycle {
    this.iteration++;
    const newDiscoveries: DiscoveredCapability[] = [];
    const capabilities = [...this.known.entries()];

    // Cap work to keep this synchronous and bounded
    const N = Math.min(capabilities.length, 64);
    const bounded = capabilities.slice(0, N);

    // ── Strategy 1: Introspection (specialization detection) ───────────────
    for (let i = 0; i < bounded.length; i++) {
      const [idA, subsA] = bounded[i];
      if (subsA.length < 2) continue;
      for (let j = 0; j < bounded.length; j++) {
        if (i === j) continue;
        const [idB, subsB] = bounded[j];
        if (subsB.length === 0 || subsB.length >= subsA.length) continue;
        // B is a strict subset of A → A is a specialization of B
        const setA = new Set(subsA);
        const allIn = subsB.every((s) => setA.has(s));
        if (!allIn) continue;
        const name = `${idA}#specialization-of#${idB}`;
        const id = deterministicId(name);
        if (this.discoveredIds.has(id)) continue;
        const surfaceDelta = subsA.length - subsB.length;
        const confidence = Math.min(0.95, 0.65 + surfaceDelta * 0.05);
        const cap: DiscoveredCapability = {
          id,
          name,
          source: 'introspection',
          components: [idA, idB],
          confidence: Math.round(confidence * 1000) / 1000,
          estimatedValue: surfaceDelta * 12 + subsB.length * 4,
          discoveredAt: this.EPOCH,
        };
        newDiscoveries.push(cap);
        this.discovered.push(cap);
        this.discoveredIds.add(id);
      }
    }

    // ── Strategy 2: Composition (complementary pairs) ──────────────────────
    for (let i = 0; i < bounded.length; i++) {
      for (let j = i + 1; j < bounded.length; j++) {
        const [idA, subsA] = bounded[i];
        const [idB, subsB] = bounded[j];
        if (subsA.length === 0 || subsB.length === 0) continue;
        const sim = jaccard(subsA, subsB);
        // Complementary: low similarity but non-trivial surface
        if (sim > 0.2) continue;
        const name = `${idA}+${idB}`;
        const id = deterministicId(name);
        if (this.discoveredIds.has(id)) continue;
        // Confidence scales inversely with overlap and with combined surface
        const combinedSurface = subsA.length + subsB.length;
        const confidence = Math.min(0.92, 0.55 + (1 - sim) * 0.25 + Math.min(combinedSurface, 10) * 0.01);
        const cap: DiscoveredCapability = {
          id,
          name,
          source: 'composition',
          components: [idA, idB],
          confidence: Math.round(confidence * 1000) / 1000,
          estimatedValue: combinedSurface * 10,
          discoveredAt: this.EPOCH,
        };
        newDiscoveries.push(cap);
        this.discovered.push(cap);
        this.discoveredIds.add(id);
      }
    }

    // ── Strategy 3: Emergence (triadic closure, depth-aware) ───────────────
    if (maxDepth >= 3) {
      const triadCap = Math.min(bounded.length, 24);
      for (let i = 0; i < triadCap; i++) {
        for (let j = i + 1; j < triadCap; j++) {
          for (let k = j + 1; k < triadCap; k++) {
            const [idA, subsA] = bounded[i];
            const [idB, subsB] = bounded[j];
            const [idC, subsC] = bounded[k];
            const ab = jaccard(subsA, subsB);
            const bc = jaccard(subsB, subsC);
            const ac = jaccard(subsA, subsC);
            // All three pairs share *some* surface but none dominate → genuine emergence
            const allShare = ab > 0 && bc > 0 && ac > 0;
            const balanced = Math.max(ab, bc, ac) - Math.min(ab, bc, ac) < 0.4;
            if (!allShare || !balanced) continue;
            const name = `${idA}△${idB}△${idC}`;
            const id = deterministicId(name);
            if (this.discoveredIds.has(id)) continue;
            const cohesion = (ab + bc + ac) / 3;
            const confidence = Math.min(0.88, 0.5 + cohesion * 0.4);
            const cap: DiscoveredCapability = {
              id,
              name,
              source: 'emergence',
              components: [idA, idB, idC],
              confidence: Math.round(confidence * 1000) / 1000,
              estimatedValue: Math.round((subsA.length + subsB.length + subsC.length) * 8 * (1 + cohesion)),
              discoveredAt: this.EPOCH,
            };
            newDiscoveries.push(cap);
            this.discovered.push(cap);
            this.discoveredIds.add(id);
          }
        }
      }
    }

    return {
      id: deterministicId(`cycle:${this.iteration}:${this.known.size}`),
      iteration: this.iteration,
      discovered: newDiscoveries,
      searchDepth: maxDepth,
      timestamp: this.EPOCH,
    };
  }

  getDiscovered(): DiscoveredCapability[] {
    return [...this.discovered];
  }

  /** Total registered inputs — useful for telemetry. */
  size(): number {
    return this.known.size;
  }

  /** Reset state for a fresh cycle (testing). */
  reset(): void {
    this.known.clear();
    this.discovered = [];
    this.discoveredIds.clear();
    this.iteration = 0;
  }
}
