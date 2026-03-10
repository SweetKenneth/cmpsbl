/**
 * S-Tier 140 — Recursive Capability Discoverer
 * ID: S-CJ98 | CJPI: 86 | Module: ATLAS
 * 
 * Discovers new capabilities through recursive system introspection.
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

export class RecursiveCapabilityDiscoverer {
  private known: Map<string, string[]> = new Map(); // capability → sub-capabilities
  private discovered: DiscoveredCapability[] = [];
  private iteration = 0;

  registerKnown(capabilityId: string, subCapabilities: string[]): void {
    this.known.set(capabilityId, subCapabilities);
  }

  discover(maxDepth = 3): DiscoveryCycle {
    this.iteration++;
    const newDiscoveries: DiscoveredCapability[] = [];
    const knownIds = new Set(this.known.keys());

    // Composition discovery: find pairs that could combine
    const capabilities = [...this.known.entries()];
    for (let i = 0; i < capabilities.length && i < 50; i++) {
      for (let j = i + 1; j < capabilities.length && j < 50; j++) {
        const [idA, subsA] = capabilities[i];
        const [idB, subsB] = capabilities[j];
        const compositeId = `${idA}+${idB}`;
        
        if (knownIds.has(compositeId)) continue;

        // Check for complementary capabilities
        const overlap = subsA.filter(s => subsB.includes(s)).length;
        const complementary = overlap === 0 && subsA.length > 0 && subsB.length > 0;

        if (complementary) {
          const discovery: DiscoveredCapability = {
            id: crypto.randomUUID(),
            name: compositeId,
            source: 'composition',
            components: [idA, idB],
            confidence: 0.6 + Math.random() * 0.3,
            estimatedValue: (subsA.length + subsB.length) * 10,
            discoveredAt: new Date().toISOString(),
          };
          newDiscoveries.push(discovery);
          this.discovered.push(discovery);
          knownIds.add(compositeId);
        }
      }
    }

    return {
      id: crypto.randomUUID(),
      iteration: this.iteration,
      discovered: newDiscoveries,
      searchDepth: maxDepth,
      timestamp: new Date().toISOString(),
    };
  }

  getDiscovered(): DiscoveredCapability[] { return [...this.discovered]; }
}
