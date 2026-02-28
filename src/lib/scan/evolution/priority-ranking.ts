/**
 * #22 — Priority Ranking via Impact × Effort Matrix
 * Score every suggestion on user-impact vs implementation-effort
 * and surface a ranked remediation roadmap.
 */

export interface PriorityRanking {
  items: RankedItem[];
  quickWins: RankedItem[];
  strategicInvestments: RankedItem[];
  majorProjects: RankedItem[];
  lowPriority: RankedItem[];
  totalItems: number;
  roadmap: RoadmapPhase[];
  scanTimestamp: string;
}

export interface RankedItem {
  id: string;
  title: string;
  category: string;
  impactScore: number;      // 1-10
  effortScore: number;      // 1-10
  priorityScore: number;    // calculated
  quadrant: 'quick_win' | 'strategic' | 'major_project' | 'low_priority';
  estimatedHours: number;
  businessValue: string;
  dependencies: string[];
}

export interface RoadmapPhase {
  name: string;
  timeframe: string;
  items: RankedItem[];
  totalEffortHours: number;
  cumulativeImpact: number;
}

// Impact weights by category
const IMPACT_WEIGHTS: Record<string, number> = {
  security: 10,
  reliability: 8,
  performance: 7,
  scalability: 6,
  maintainability: 5,
  accessibility: 5,
  architecture: 4,
  testing: 4,
  documentation: 2,
};

// Effort estimates by type
const EFFORT_ESTIMATES: Record<string, number> = {
  trivial: 1,
  small: 3,
  medium: 5,
  large: 8,
  major: 10,
};

/**
 * Rank all findings by impact × effort matrix
 */
export function rankByPriority(
  findings: Array<{
    id: string;
    title: string;
    category: string;
    severity: string;
    effort?: string;
    dependencies?: string[];
  }>
): PriorityRanking {
  const items: RankedItem[] = findings.map(finding => {
    const categoryWeight = IMPACT_WEIGHTS[finding.category] || 5;
    const severityMultiplier = finding.severity === 'critical' ? 1.0 :
      finding.severity === 'high' ? 0.8 :
      finding.severity === 'medium' ? 0.5 : 0.3;
    
    const impactScore = Math.round(categoryWeight * severityMultiplier * 10) / 10;
    const effortScore = EFFORT_ESTIMATES[finding.effort || 'medium'] || 5;
    
    // Priority = Impact / Effort (higher = do first)
    const priorityScore = Math.round((impactScore / Math.max(effortScore, 1)) * 100) / 100;

    // Quadrant classification
    const highImpact = impactScore >= 6;
    const lowEffort = effortScore <= 4;
    
    const quadrant: RankedItem['quadrant'] = 
      highImpact && lowEffort ? 'quick_win' :
      highImpact && !lowEffort ? 'strategic' :
      !highImpact && !lowEffort ? 'major_project' : 'low_priority';

    // Estimate hours
    const estimatedHours = effortScore * 2;

    // Business value description
    const businessValue = 
      finding.category === 'security' ? 'Reduces breach risk and protects user data' :
      finding.category === 'performance' ? 'Improves user experience and reduces churn' :
      finding.category === 'reliability' ? 'Reduces downtime and incident response' :
      finding.category === 'scalability' ? 'Enables growth without re-architecture' :
      finding.category === 'accessibility' ? 'Expands user base and ensures compliance' :
      'Reduces maintenance costs and developer friction';

    return {
      id: finding.id,
      title: finding.title,
      category: finding.category,
      impactScore,
      effortScore,
      priorityScore,
      quadrant,
      estimatedHours,
      businessValue,
      dependencies: finding.dependencies || [],
    };
  });

  // Sort by priority score descending
  items.sort((a, b) => b.priorityScore - a.priorityScore);

  const quickWins = items.filter(i => i.quadrant === 'quick_win');
  const strategicInvestments = items.filter(i => i.quadrant === 'strategic');
  const majorProjects = items.filter(i => i.quadrant === 'major_project');
  const lowPriority = items.filter(i => i.quadrant === 'low_priority');

  // Build roadmap
  const roadmap: RoadmapPhase[] = [
    {
      name: 'Immediate (This Sprint)',
      timeframe: '1-2 weeks',
      items: quickWins.slice(0, 5),
      totalEffortHours: quickWins.slice(0, 5).reduce((s, i) => s + i.estimatedHours, 0),
      cumulativeImpact: quickWins.slice(0, 5).reduce((s, i) => s + i.impactScore, 0),
    },
    {
      name: 'Short-term (Next Month)',
      timeframe: '2-4 weeks',
      items: [...quickWins.slice(5), ...strategicInvestments.slice(0, 3)],
      totalEffortHours: [...quickWins.slice(5), ...strategicInvestments.slice(0, 3)].reduce((s, i) => s + i.estimatedHours, 0),
      cumulativeImpact: [...quickWins.slice(5), ...strategicInvestments.slice(0, 3)].reduce((s, i) => s + i.impactScore, 0),
    },
    {
      name: 'Medium-term (Next Quarter)',
      timeframe: '1-3 months',
      items: strategicInvestments.slice(3),
      totalEffortHours: strategicInvestments.slice(3).reduce((s, i) => s + i.estimatedHours, 0),
      cumulativeImpact: strategicInvestments.slice(3).reduce((s, i) => s + i.impactScore, 0),
    },
    {
      name: 'Long-term (Backlog)',
      timeframe: '3+ months',
      items: [...majorProjects, ...lowPriority],
      totalEffortHours: [...majorProjects, ...lowPriority].reduce((s, i) => s + i.estimatedHours, 0),
      cumulativeImpact: [...majorProjects, ...lowPriority].reduce((s, i) => s + i.impactScore, 0),
    },
  ];

  return {
    items,
    quickWins,
    strategicInvestments,
    majorProjects,
    lowPriority,
    totalItems: items.length,
    roadmap,
    scanTimestamp: new Date().toISOString(),
  };
}
