/**
 * S-Tier 115 — Recursive Architecture Refactorer
 * ID: S-CJ73 | CJPI: 88 | Module: SYSTEM
 * 
 * Automated architecture refactoring with impact analysis.
 */

export interface ArchComponent {
  id: string;
  name: string;
  type: 'module' | 'service' | 'library' | 'interface';
  dependencies: string[];
  complexity: number; // cyclomatic
  codeSize: number; // lines
  changeFrequency: number; // changes per week
  couplingScore: number; // 0-1
}

export interface RefactoringProposal {
  id: string;
  type: 'extract' | 'merge' | 'decompose' | 'relocate' | 'decouple';
  target: string[];
  reason: string;
  expectedImpact: ImpactAnalysis;
  priority: number;
  effort: 'low' | 'medium' | 'high';
}

export interface ImpactAnalysis {
  complexityReduction: number;
  couplingReduction: number;
  affectedComponents: string[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedHours: number;
}

export class RecursiveArchitectureRefactorer {
  private components: Map<string, ArchComponent> = new Map();

  registerComponent(comp: ArchComponent): void {
    this.components.set(comp.id, comp);
  }

  analyzeSmells(): RefactoringProposal[] {
    const proposals: RefactoringProposal[] = [];

    for (const comp of this.components.values()) {
      // God module detection
      if (comp.complexity > 50 && comp.codeSize > 500) {
        proposals.push({
          id: crypto.randomUUID(),
          type: 'decompose',
          target: [comp.id],
          reason: `High complexity (${comp.complexity}) and size (${comp.codeSize} lines)`,
          expectedImpact: {
            complexityReduction: comp.complexity * 0.4,
            couplingReduction: 0.2,
            affectedComponents: comp.dependencies,
            riskLevel: 'medium',
            estimatedHours: Math.ceil(comp.codeSize / 100),
          },
          priority: comp.complexity * comp.changeFrequency,
          effort: comp.codeSize > 1000 ? 'high' : 'medium',
        });
      }

      // High coupling detection
      if (comp.couplingScore > 0.7) {
        proposals.push({
          id: crypto.randomUUID(),
          type: 'decouple',
          target: [comp.id],
          reason: `High coupling score (${comp.couplingScore.toFixed(2)})`,
          expectedImpact: {
            complexityReduction: 0,
            couplingReduction: comp.couplingScore * 0.3,
            affectedComponents: this.findCoupled(comp.id),
            riskLevel: 'low',
            estimatedHours: 4,
          },
          priority: comp.couplingScore * 100,
          effort: 'low',
        });
      }

      // Shotgun surgery detection (high change frequency with many dependents)
      const dependents = this.findDependents(comp.id);
      if (comp.changeFrequency > 5 && dependents.length > 5) {
        proposals.push({
          id: crypto.randomUUID(),
          type: 'extract',
          target: [comp.id],
          reason: `Shotgun surgery: ${comp.changeFrequency} changes/week affecting ${dependents.length} dependents`,
          expectedImpact: {
            complexityReduction: comp.complexity * 0.2,
            couplingReduction: 0.3,
            affectedComponents: dependents,
            riskLevel: 'medium',
            estimatedHours: 8,
          },
          priority: comp.changeFrequency * dependents.length,
          effort: 'medium',
        });
      }
    }

    return proposals.sort((a, b) => b.priority - a.priority);
  }

  private findCoupled(id: string): string[] {
    const comp = this.components.get(id);
    if (!comp) return [];
    return comp.dependencies.filter(d => {
      const dep = this.components.get(d);
      return dep?.dependencies.includes(id);
    });
  }

  private findDependents(id: string): string[] {
    return [...this.components.values()]
      .filter(c => c.dependencies.includes(id))
      .map(c => c.id);
  }
}
