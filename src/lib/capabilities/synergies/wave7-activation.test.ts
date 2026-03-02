import { describe, it, expect } from 'vitest';
import { executeWave7, PIPELINE_SEEDS } from './wave7-activation';
import { computeCJPI, autoAssignTier } from './discovery-epoch';

describe('Wave 7 Activation', () => {
  it('should activate and crystallize all eligible pipelines', () => {
    const { epoch, results, stats } = executeWave7();
    
    expect(epoch.status).toBe('active');
    expect(results.length).toBe(PIPELINE_SEEDS.length);
    
    // All should be crystallized (all seeds have CJPI >= 55)
    const crystallized = results.filter(r => r.status === 'crystallized');
    expect(crystallized.length).toBe(PIPELINE_SEEDS.length);
    
    // Print tier distribution
    console.log('\n═══ WAVE 7 RESULTS ═══');
    console.log(`Total: ${stats.totalCandidates}`);
    console.log(`Progress: ${stats.progressPercent}%`);
    console.log(`Avg CJPI: ${stats.avgCJPI}`);
    console.log(`Highest CJPI: ${stats.highestCJPI}`);
    console.log(`Lowest CJPI: ${stats.lowestCJPI}`);
    console.log('\nTier Distribution:');
    console.log(`  Creator:      ${stats.byTier.creator}`);
    console.log(`  Architect:    ${stats.byTier.architect}`);
    console.log(`  Enterprise:   ${stats.byTier.enterprise}`);
    console.log(`  CMPSBL-Only:  ${stats.byTier['cmpsbl-only']}`);
    console.log(`  Untiered:     ${stats.byTier.untiered}`);
    
    console.log('\nCategory Distribution:');
    for (const [cat, count] of Object.entries(stats.byCategory)) {
      console.log(`  ${cat}: ${count}`);
    }
    
    console.log('\n═══ FULL PIPELINE LIST ═══');
    const sorted = [...results].sort((a, b) => b.cjpiScore - a.cjpiScore);
    for (const p of sorted) {
      console.log(`[${p.assignedTier?.toUpperCase().padEnd(11) || 'UNTIERED   '}] CJPI: ${String(p.cjpiScore).padStart(5)} | ${p.name}`);
    }
  });
  
  it('should correctly compute CJPI scores', () => {
    const score = computeCJPI({
      strategicLeverage: 100,
      recursionPotential: 100,
      crossNodeImpact: 100,
      composability: 100,
      governanceInfluence: 100,
      moatSensitivity: 100,
    });
    expect(score).toBe(100);
  });
  
  it('should auto-assign tiers correctly', () => {
    expect(autoAssignTier(96)).toBe('cmpsbl-only');
    expect(autoAssignTier(87)).toBe('enterprise');
    expect(autoAssignTier(75)).toBe('architect');
    expect(autoAssignTier(60)).toBe('creator');
    expect(autoAssignTier(40)).toBeNull();
  });
});
