/**
 * DREAM Module Enhancements — v7.5.0 SYNERGY Epoch
 * CreativeMutator, InsightCrystallizer, PatternEvolver, DreamJournal
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CREATIVE MUTATOR — Genetic algorithm knowledge mutation
// ═══════════════════════════════════════════════════════════════════════════════

interface Chromosome {
  id: string;
  genes: number[];
  fitness: number;
  generation: number;
  parentIds: string[];
}

interface MutationResult {
  offspring: Chromosome;
  mutationType: 'crossover' | 'mutation' | 'hybrid';
  mutatedGenes: number;
}

export class CreativeMutator {
  private population: Chromosome[] = [];
  private generation: number = 0;
  private mutationRate: number = 0.1;
  private crossoverRate: number = 0.7;

  /** Initialize population with random chromosomes */
  initPopulation(size: number, geneLength: number): void {
    this.population = [];
    for (let i = 0; i < size; i++) {
      this.population.push({
        id: `chr_${Date.now()}_${i}`,
        genes: Array.from({ length: geneLength }, () => Math.random()),
        fitness: 0,
        generation: 0,
        parentIds: [],
      });
    }
  }

  /** Evaluate fitness for all chromosomes */
  evaluateFitness(fitnessFunction: (genes: number[]) => number): void {
    for (const chr of this.population) {
      chr.fitness = fitnessFunction(chr.genes);
    }
    this.population.sort((a, b) => b.fitness - a.fitness);
  }

  /** Create next generation through selection, crossover, and mutation */
  evolve(): MutationResult[] {
    this.generation++;
    const results: MutationResult[] = [];
    const newPopulation: Chromosome[] = [];

    // Elitism: keep top 10%
    const eliteCount = Math.ceil(this.population.length * 0.1);
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push({ ...this.population[i], generation: this.generation });
    }

    // Generate rest through crossover and mutation
    while (newPopulation.length < this.population.length) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();

      let offspring: Chromosome;
      let mutationType: MutationResult['mutationType'];
      let mutatedGenes = 0;

      if (Math.random() < this.crossoverRate) {
        // Crossover
        const crossoverPoint = Math.floor(Math.random() * parent1.genes.length);
        const genes = [
          ...parent1.genes.slice(0, crossoverPoint),
          ...parent2.genes.slice(crossoverPoint),
        ];
        offspring = {
          id: `chr_${Date.now()}_${newPopulation.length}`,
          genes,
          fitness: 0,
          generation: this.generation,
          parentIds: [parent1.id, parent2.id],
        };
        mutationType = 'crossover';
      } else {
        // Clone
        offspring = {
          id: `chr_${Date.now()}_${newPopulation.length}`,
          genes: [...parent1.genes],
          fitness: 0,
          generation: this.generation,
          parentIds: [parent1.id],
        };
        mutationType = 'mutation';
      }

      // Apply mutations
      for (let i = 0; i < offspring.genes.length; i++) {
        if (Math.random() < this.mutationRate) {
          offspring.genes[i] = Math.random();
          mutatedGenes++;
        }
      }

      if (mutationType === 'crossover' && mutatedGenes > 0) {
        mutationType = 'hybrid';
      }

      newPopulation.push(offspring);
      results.push({ offspring, mutationType, mutatedGenes });
    }

    this.population = newPopulation;
    return results;
  }

  /** Tournament selection */
  private selectParent(): Chromosome {
    const tournamentSize = 3;
    let best = this.population[Math.floor(Math.random() * this.population.length)];
    
    for (let i = 1; i < tournamentSize; i++) {
      const candidate = this.population[Math.floor(Math.random() * this.population.length)];
      if (candidate.fitness > best.fitness) {
        best = candidate;
      }
    }
    
    return best;
  }

  /** Get best chromosome */
  getBest(): Chromosome | null {
    return this.population[0] || null;
  }

  /** Get population statistics */
  getStats(): { generation: number; avgFitness: number; bestFitness: number; diversity: number } {
    if (this.population.length === 0) {
      return { generation: 0, avgFitness: 0, bestFitness: 0, diversity: 0 };
    }

    const avgFitness = this.population.reduce((a, b) => a + b.fitness, 0) / this.population.length;
    const bestFitness = this.population[0].fitness;
    
    // Calculate diversity as variance in fitness
    const variance = this.population.reduce((a, b) => a + Math.pow(b.fitness - avgFitness, 2), 0) / this.population.length;
    const diversity = Math.sqrt(variance) / (bestFitness || 1);

    return { generation: this.generation, avgFitness, bestFitness, diversity };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSIGHT CRYSTALLIZER — Pattern distillation to permanent memory
// ═══════════════════════════════════════════════════════════════════════════════

interface RawInsight {
  id: string;
  content: string;
  source: string;
  timestamp: number;
  confidence: number;
}

interface CrystallizedInsight {
  id: string;
  essence: string;
  supportingEvidence: string[];
  crystallizationScore: number;
  permanence: number;
  connections: string[];
  createdAt: number;
}

export class InsightCrystallizer {
  private rawInsights: RawInsight[] = [];
  private crystallized: Map<string, CrystallizedInsight> = new Map();
  private crystallizationThreshold: number = 0.75;

  /** Add a raw insight */
  addRawInsight(content: string, source: string, confidence: number): string {
    const id = `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.rawInsights.push({
      id,
      content,
      source,
      timestamp: Date.now(),
      confidence,
    });

    // Keep last 1000 raw insights
    if (this.rawInsights.length > 1000) {
      this.rawInsights.shift();
    }

    return id;
  }

  /** Attempt to crystallize insights into permanent knowledge */
  crystallize(): CrystallizedInsight[] {
    const newCrystals: CrystallizedInsight[] = [];
    
    // Group similar insights
    const groups = this.groupSimilarInsights();

    for (const [essence, group] of groups.entries()) {
      if (group.length < 2) continue;

      // Calculate crystallization score
      const avgConfidence = group.reduce((a, b) => a + b.confidence, 0) / group.length;
      const recency = this.calculateRecency(group);
      const consistency = this.calculateConsistency(group);

      const score = (avgConfidence * 0.4) + (recency * 0.3) + (consistency * 0.3);

      if (score >= this.crystallizationThreshold) {
        const crystal: CrystallizedInsight = {
          id: `crystal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          essence,
          supportingEvidence: group.map(i => i.id),
          crystallizationScore: score,
          permanence: Math.min(1, score + 0.1), // Slightly boost permanence
          connections: [],
          createdAt: Date.now(),
        };

        this.crystallized.set(crystal.id, crystal);
        newCrystals.push(crystal);

        // Find connections to existing crystals
        this.findConnections(crystal);

        // Remove crystallized raw insights
        const usedIds = new Set(group.map(i => i.id));
        this.rawInsights = this.rawInsights.filter(i => !usedIds.has(i.id));
      }
    }

    return newCrystals;
  }

  private groupSimilarInsights(): Map<string, RawInsight[]> {
    const groups = new Map<string, RawInsight[]>();
    
    // Simple grouping by first 50 chars (in production, use semantic similarity)
    for (const insight of this.rawInsights) {
      const key = insight.content.slice(0, 50).toLowerCase().trim();
      const existing = groups.get(key) || [];
      existing.push(insight);
      groups.set(key, existing);
    }

    return groups;
  }

  private calculateRecency(insights: RawInsight[]): number {
    const now = Date.now();
    const avgAge = insights.reduce((a, b) => a + (now - b.timestamp), 0) / insights.length;
    const dayMs = 86400000;
    return Math.max(0, 1 - (avgAge / (7 * dayMs))); // Decay over 7 days
  }

  private calculateConsistency(insights: RawInsight[]): number {
    if (insights.length < 2) return 1;
    
    // Check if insights came from multiple sources
    const sources = new Set(insights.map(i => i.source));
    return Math.min(1, sources.size / 3); // Max consistency at 3+ sources
  }

  private findConnections(crystal: CrystallizedInsight): void {
    for (const [id, existing] of this.crystallized.entries()) {
      if (id === crystal.id) continue;

      // Simple similarity check (in production, use embeddings)
      const similarity = this.calculateSimilarity(crystal.essence, existing.essence);
      if (similarity > 0.5) {
        crystal.connections.push(id);
        existing.connections.push(crystal.id);
      }
    }
  }

  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
    const union = wordsA.size + wordsB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /** Get all crystallized insights */
  getCrystallized(): CrystallizedInsight[] {
    return Array.from(this.crystallized.values())
      .sort((a, b) => b.crystallizationScore - a.crystallizationScore);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN EVOLVER — Emergent pattern detection and evolution
// ═══════════════════════════════════════════════════════════════════════════════

interface Pattern {
  id: string;
  signature: string;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  strength: number;
  evolved: boolean;
  parentPattern?: string;
}

interface EvolutionEvent {
  oldPattern: string;
  newPattern: string;
  timestamp: number;
  evolutionType: 'specialization' | 'generalization' | 'mutation';
}

export class PatternEvolver {
  private patterns: Map<string, Pattern> = new Map();
  private evolutionHistory: EvolutionEvent[] = [];
  private evolutionThreshold: number = 10; // Occurrences before evolution

  /** Record a pattern occurrence */
  record(signature: string): Pattern {
    let pattern = this.patterns.get(signature);
    
    if (!pattern) {
      pattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        signature,
        occurrences: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        strength: 0,
        evolved: false,
      };
      this.patterns.set(signature, pattern);
    }

    pattern.occurrences++;
    pattern.lastSeen = Date.now();
    pattern.strength = this.calculateStrength(pattern);

    // Check for evolution opportunity
    if (pattern.occurrences >= this.evolutionThreshold && !pattern.evolved) {
      this.attemptEvolution(pattern);
    }

    return pattern;
  }

  /** Attempt to evolve a pattern */
  private attemptEvolution(pattern: Pattern): void {
    // Look for related patterns to merge or specialize
    const related = this.findRelatedPatterns(pattern);
    
    if (related.length >= 2) {
      // Generalization: merge related patterns
      const generalizedSignature = this.generalize(pattern, related[0]);
      if (generalizedSignature && generalizedSignature !== pattern.signature) {
        const evolved: Pattern = {
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          signature: generalizedSignature,
          occurrences: pattern.occurrences + related[0].occurrences,
          firstSeen: Math.min(pattern.firstSeen, related[0].firstSeen),
          lastSeen: Date.now(),
          strength: 0,
          evolved: true,
          parentPattern: pattern.id,
        };
        evolved.strength = this.calculateStrength(evolved);

        this.patterns.set(generalizedSignature, evolved);
        this.evolutionHistory.push({
          oldPattern: pattern.signature,
          newPattern: generalizedSignature,
          timestamp: Date.now(),
          evolutionType: 'generalization',
        });

        pattern.evolved = true;
      }
    }
  }

  private findRelatedPatterns(pattern: Pattern): Pattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.id !== pattern.id && !p.evolved)
      .filter(p => {
        const similarity = this.calculateSimilarity(pattern.signature, p.signature);
        return similarity > 0.6 && similarity < 1;
      })
      .sort((a, b) => b.strength - a.strength);
  }

  private generalize(p1: Pattern, p2: Pattern): string | null {
    // Simple generalization: find common prefix
    const s1 = p1.signature;
    const s2 = p2.signature;
    
    let common = '';
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
      if (s1[i] === s2[i]) {
        common += s1[i];
      } else {
        break;
      }
    }

    return common.length >= 3 ? common + '*' : null;
  }

  private calculateSimilarity(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    
    return matches / maxLen;
  }

  private calculateStrength(pattern: Pattern): number {
    const recency = Math.exp(-(Date.now() - pattern.lastSeen) / 86400000);
    const frequency = Math.log(pattern.occurrences + 1) / Math.log(100);
    return (recency * 0.4) + (Math.min(1, frequency) * 0.6);
  }

  /** Get strongest patterns */
  getStrongest(limit: number = 10): Pattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  /** Get evolution history */
  getEvolutionHistory(): EvolutionEvent[] {
    return [...this.evolutionHistory].reverse();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DREAM JOURNAL — Dream state logging and analysis
// ═══════════════════════════════════════════════════════════════════════════════

interface DreamEntry {
  id: string;
  timestamp: number;
  phase: 'rem' | 'deep' | 'light';
  duration: number;          // ms
  themes: string[];
  emotionalValence: number;  // -1 to 1
  lucidity: number;          // 0-1
  insights: string[];
}

interface DreamAnalysis {
  totalDreams: number;
  avgDuration: number;
  dominantThemes: Array<{ theme: string; count: number }>;
  emotionalTrend: number;
  lucidityScore: number;
  insightDensity: number;
}

export class DreamJournal {
  private entries: DreamEntry[] = [];

  /** Log a dream entry */
  log(entry: Omit<DreamEntry, 'id' | 'timestamp'>): string {
    const id = `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.entries.push({
      id,
      timestamp: Date.now(),
      ...entry,
    });

    // Keep last 1000 entries
    if (this.entries.length > 1000) {
      this.entries.shift();
    }

    return id;
  }

  /** Analyze dream patterns */
  analyze(timeRangeMs: number = 7 * 86400000): DreamAnalysis {
    const now = Date.now();
    const recentDreams = this.entries.filter(e => now - e.timestamp < timeRangeMs);

    if (recentDreams.length === 0) {
      return {
        totalDreams: 0,
        avgDuration: 0,
        dominantThemes: [],
        emotionalTrend: 0,
        lucidityScore: 0,
        insightDensity: 0,
      };
    }

    // Calculate metrics
    const avgDuration = recentDreams.reduce((a, b) => a + b.duration, 0) / recentDreams.length;
    
    // Theme frequency
    const themeCounts = new Map<string, number>();
    for (const dream of recentDreams) {
      for (const theme of dream.themes) {
        themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
      }
    }
    const dominantThemes = Array.from(themeCounts.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Emotional trend (recent vs older)
    const midpoint = Math.floor(recentDreams.length / 2);
    const olderAvg = recentDreams.slice(0, midpoint).reduce((a, b) => a + b.emotionalValence, 0) / midpoint || 0;
    const newerAvg = recentDreams.slice(midpoint).reduce((a, b) => a + b.emotionalValence, 0) / (recentDreams.length - midpoint) || 0;
    const emotionalTrend = newerAvg - olderAvg;

    // Lucidity score
    const lucidityScore = recentDreams.reduce((a, b) => a + b.lucidity, 0) / recentDreams.length;

    // Insight density (insights per dream)
    const totalInsights = recentDreams.reduce((a, b) => a + b.insights.length, 0);
    const insightDensity = totalInsights / recentDreams.length;

    return {
      totalDreams: recentDreams.length,
      avgDuration,
      dominantThemes,
      emotionalTrend,
      lucidityScore,
      insightDensity,
    };
  }

  /** Get dreams with specific theme */
  findByTheme(theme: string): DreamEntry[] {
    return this.entries.filter(e => e.themes.includes(theme));
  }

  /** Get recent insights from dreams */
  getInsights(limit: number = 20): Array<{ insight: string; dreamId: string; timestamp: number }> {
    const insights: Array<{ insight: string; dreamId: string; timestamp: number }> = [];
    
    for (const dream of [...this.entries].reverse()) {
      for (const insight of dream.insights) {
        insights.push({
          insight,
          dreamId: dream.id,
          timestamp: dream.timestamp,
        });
        if (insights.length >= limit) break;
      }
      if (insights.length >= limit) break;
    }

    return insights;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const dreamEnhancements = {
  CreativeMutator,
  InsightCrystallizer,
  PatternEvolver,
  DreamJournal,
};

export type {
  Chromosome,
  MutationResult,
  RawInsight,
  CrystallizedInsight,
  Pattern,
  EvolutionEvent,
  DreamEntry,
  DreamAnalysis,
};
