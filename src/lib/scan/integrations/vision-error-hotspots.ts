/**
 * VISION Error Hotspot Mapping (#19)
 * Identifies top error-producing code paths using VISION telemetry
 * and prioritizes scanner findings that overlap with error hotspots.
 */

export interface ErrorHotspot {
  path: string;
  module: string;
  errorCount: number;
  uniqueErrors: number;
  errorTypes: Array<{
    type: string;
    message: string;
    count: number;
    lastSeen: string;
  }>;
  severity: 'critical' | 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
  relatedFindings: string[];
}

export interface ErrorHotspotMap {
  hotspots: ErrorHotspot[];
  totalErrors: number;
  topModule: string;
  coverageGaps: string[]; // Paths with errors but no scanner findings
  generatedAt: string;
}

/**
 * Build error hotspot map from VISION logs and scanner findings
 */
export function mapErrorHotspots(
  errorLogs: Array<{
    path: string;
    module: string;
    errorType: string;
    message: string;
    timestamp: string;
    count: number;
  }>,
  scanFindings: Array<{
    id: string;
    affectedPaths: string[];
  }>,
): ErrorHotspotMap {
  // Aggregate errors by path
  const pathErrors = new Map<string, {
    module: string;
    errors: Map<string, { type: string; message: string; count: number; lastSeen: string }>;
    totalCount: number;
  }>();

  for (const log of errorLogs) {
    if (!pathErrors.has(log.path)) {
      pathErrors.set(log.path, { module: log.module, errors: new Map(), totalCount: 0 });
    }
    const entry = pathErrors.get(log.path)!;
    entry.totalCount += log.count;

    const key = `${log.errorType}:${log.message}`;
    const existing = entry.errors.get(key);
    if (existing) {
      existing.count += log.count;
      if (log.timestamp > existing.lastSeen) existing.lastSeen = log.timestamp;
    } else {
      entry.errors.set(key, {
        type: log.errorType,
        message: log.message,
        count: log.count,
        lastSeen: log.timestamp,
      });
    }
  }

  // Build finding path index
  const findingsByPath = new Map<string, string[]>();
  for (const finding of scanFindings) {
    for (const path of finding.affectedPaths) {
      if (!findingsByPath.has(path)) findingsByPath.set(path, []);
      findingsByPath.get(path)!.push(finding.id);
    }
  }

  // Assemble hotspots
  const hotspots: ErrorHotspot[] = [];
  const coverageGaps: string[] = [];
  let totalErrors = 0;

  for (const [path, data] of pathErrors) {
    totalErrors += data.totalCount;
    const relatedFindings = findingsByPath.get(path) ?? [];

    if (relatedFindings.length === 0 && data.totalCount > 5) {
      coverageGaps.push(path);
    }

    const errorTypes = [...data.errors.values()]
      .sort((a, b) => b.count - a.count);

    const severity: ErrorHotspot['severity'] =
      data.totalCount > 100 ? 'critical' :
      data.totalCount > 50 ? 'high' :
      data.totalCount > 10 ? 'medium' : 'low';

    hotspots.push({
      path,
      module: data.module,
      errorCount: data.totalCount,
      uniqueErrors: data.errors.size,
      errorTypes,
      severity,
      trend: 'stable', // Would compute from time-series in production
      relatedFindings,
    });
  }

  // Sort by error count (top offenders first)
  hotspots.sort((a, b) => b.errorCount - a.errorCount);

  const topModule = hotspots.length > 0 ? hotspots[0].module : 'none';

  return {
    hotspots,
    totalErrors,
    topModule,
    coverageGaps,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Reprioritize scan findings based on error hotspot overlap
 */
export function reprioritizeByErrors(
  findings: Array<{ id: string; priority: number; affectedPaths: string[] }>,
  hotspotMap: ErrorHotspotMap,
): Array<{ id: string; originalPriority: number; adjustedPriority: number; boost: number; reason: string }> {
  const hotspotIndex = new Map<string, ErrorHotspot>();
  for (const hs of hotspotMap.hotspots) {
    hotspotIndex.set(hs.path, hs);
  }

  return findings.map(f => {
    let maxBoost = 0;
    let boostReason = '';

    for (const path of f.affectedPaths) {
      const hotspot = hotspotIndex.get(path);
      if (hotspot) {
        const boost =
          hotspot.severity === 'critical' ? 40 :
          hotspot.severity === 'high' ? 25 :
          hotspot.severity === 'medium' ? 10 : 5;
        if (boost > maxBoost) {
          maxBoost = boost;
          boostReason = `Overlaps with ${hotspot.severity} error hotspot at ${path} (${hotspot.errorCount} errors)`;
        }
      }
    }

    return {
      id: f.id,
      originalPriority: f.priority,
      adjustedPriority: Math.min(100, f.priority + maxBoost),
      boost: maxBoost,
      reason: boostReason || 'No error hotspot overlap',
    };
  }).sort((a, b) => b.adjustedPriority - a.adjustedPriority);
}
