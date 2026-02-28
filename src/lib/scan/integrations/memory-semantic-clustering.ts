/**
 * MEMORY — Semantic Similarity Clustering (#31)
 * Groups related findings by semantic similarity to reduce
 * noise and enable batch remediation of related debt.
 */

export interface FindingCluster {
  clusterId: string;
  label: string;
  centroidCategory: string;
  findings: Array<{
    findingId: string;
    category: string;
    description: string;
    similarity: number; // 0-1 distance from centroid
  }>;
  avgSeverity: number;
  batchRemediable: boolean;
  suggestedFixStrategy: string;
}

export interface ClusterReport {
  clusters: FindingCluster[];
  totalFindings: number;
  clusteredFindings: number;
  outliers: string[]; // findingIds that didn't fit any cluster
  clusteringQuality: number; // silhouette score 0-1
  generatedAt: string;
}

interface ScanFinding {
  id: string;
  category: string;
  description: string;
  filePath?: string;
  severity: number;
}

/**
 * Compute simple token-overlap similarity between two descriptions
 */
function textSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.toLowerCase().split(/\W+/).filter(t => t.length > 2));
  const tokensB = new Set(b.toLowerCase().split(/\W+/).filter(t => t.length > 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokensA) if (tokensB.has(t)) overlap++;
  return overlap / Math.max(tokensA.size, tokensB.size);
}

/**
 * Cluster findings by semantic similarity + category + file proximity
 */
export function clusterFindings(
  findings: ScanFinding[],
  similarityThreshold = 0.35,
): ClusterReport {
  const assigned = new Set<string>();
  const clusters: FindingCluster[] = [];

  // Sort by severity descending so high-severity seeds clusters
  const sorted = [...findings].sort((a, b) => b.severity - a.severity);

  for (const seed of sorted) {
    if (assigned.has(seed.id)) continue;

    const members: FindingCluster['findings'] = [{
      findingId: seed.id,
      category: seed.category,
      description: seed.description,
      similarity: 1,
    }];
    assigned.add(seed.id);

    for (const candidate of sorted) {
      if (assigned.has(candidate.id)) continue;

      // Category match gives base similarity boost
      const catBoost = seed.category === candidate.category ? 0.2 : 0;
      // File proximity boost
      const fileBoost = seed.filePath && candidate.filePath &&
        seed.filePath.split('/').slice(0, -1).join('/') ===
        candidate.filePath.split('/').slice(0, -1).join('/') ? 0.15 : 0;
      const textSim = textSimilarity(seed.description, candidate.description);
      const totalSim = Math.min(1, textSim + catBoost + fileBoost);

      if (totalSim >= similarityThreshold) {
        members.push({
          findingId: candidate.id,
          category: candidate.category,
          description: candidate.description,
          similarity: totalSim,
        });
        assigned.add(candidate.id);
      }
    }

    if (members.length >= 2) {
      const avgSev = members.reduce((s, m) => {
        const f = findings.find(x => x.id === m.findingId);
        return s + (f?.severity ?? 0);
      }, 0) / members.length;

      clusters.push({
        clusterId: `cluster_${clusters.length + 1}`,
        label: `${seed.category} cluster`,
        centroidCategory: seed.category,
        findings: members,
        avgSeverity: avgSev,
        batchRemediable: new Set(members.map(m => m.category)).size <= 2,
        suggestedFixStrategy: inferStrategy(seed.category, members.length),
      });
    }
  }

  const clusteredIds = new Set(clusters.flatMap(c => c.findings.map(f => f.findingId)));
  const outliers = findings.filter(f => !clusteredIds.has(f.id)).map(f => f.id);

  return {
    clusters,
    totalFindings: findings.length,
    clusteredFindings: clusteredIds.size,
    outliers,
    clusteringQuality: clusters.length > 0 ? Math.min(1, clusters.reduce((s, c) =>
      s + c.findings.reduce((a, f) => a + f.similarity, 0) / c.findings.length, 0) / clusters.length) : 0,
    generatedAt: new Date().toISOString(),
  };
}

function inferStrategy(category: string, count: number): string {
  if (category === 'security') return 'Apply security patch pattern across all affected files';
  if (category === 'performance') return 'Batch optimize with shared profiling session';
  if (category === 'accessibility') return 'Apply ARIA/semantic HTML template fix';
  if (count > 5) return 'Generate codemod for automated batch application';
  return 'Manual review with grouped context';
}
