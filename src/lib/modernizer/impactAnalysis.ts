/**
  * EVOLUTION Impact Analysis
  * v7.5.0 — Predict and validate evolution impact
  */
 
 // Impact prediction
 export interface ImpactPrediction {
   proposalId: string;
   performanceDelta: number; // -100 to +100
   memoryDelta: number;
   riskScore: number;
   affectedModules: string[];
   breakingChanges: BreakingChange[];
   confidence: number;
   recommendation: 'proceed' | 'caution' | 'abort';
 }
 
 // Breaking change
 export interface BreakingChange {
   type: 'api' | 'schema' | 'behavior' | 'dependency';
   description: string;
   severity: 'low' | 'medium' | 'high';
   mitigation?: string;
 }
 
 // Impact validation result
 export interface ImpactValidation {
   proposalId: string;
   predicted: ImpactPrediction;
   actual: {
     performanceDelta: number;
     memoryDelta: number;
     errorsIntroduced: number;
   };
   accuracy: number;
   validated: boolean;
 }
 
 // Historical impact data for learning
 const impactHistory: ImpactValidation[] = [];
 const MAX_HISTORY = 100;
 
 // Category weights for impact calculation
 const CATEGORY_WEIGHTS: Record<string, number> = {
   security: 1.5,
   performance: 1.3,
   maintainability: 1.0,
   accessibility: 1.2,
   modernization: 0.8,
 };
 
 /**
  * Predict impact of a proposed change
  */
 export function predictImpact(config: {
   proposalId: string;
   category: string;
   affectedFiles: string[];
   changeType: 'add' | 'modify' | 'delete' | 'refactor';
   complexity: number; // 1-10
 }): ImpactPrediction {
   const { proposalId, category, affectedFiles, changeType, complexity } = config;
   
   // Calculate affected modules from file paths
   const affectedModules = extractModulesFromPaths(affectedFiles);
   
   // Base performance delta based on change type
   let performanceDelta = 0;
   switch (changeType) {
     case 'delete': performanceDelta = 5; break; // Removing code often helps
     case 'refactor': performanceDelta = 3; break;
     case 'modify': performanceDelta = -1; break;
     case 'add': performanceDelta = -2; break;
   }
   
   // Adjust by complexity
   performanceDelta -= Math.floor(complexity / 3);
   
   // Memory delta estimation
   const memoryDelta = changeType === 'add' ? -complexity : 
                       changeType === 'delete' ? complexity : 0;
   
   // Calculate risk score
   const riskScore = calculateRiskScore(affectedModules, changeType, complexity);
   
   // Detect breaking changes
   const breakingChanges = detectBreakingChanges(
     affectedFiles, 
     changeType, 
     complexity
   );
   
   // Calculate confidence based on historical accuracy
   const confidence = calculateConfidence(category);
   
   // Make recommendation
   let recommendation: ImpactPrediction['recommendation'] = 'proceed';
   if (riskScore > 70 || breakingChanges.some(bc => bc.severity === 'high')) {
     recommendation = 'abort';
   } else if (riskScore > 40 || breakingChanges.length > 0) {
     recommendation = 'caution';
   }
   
   return {
     proposalId,
     performanceDelta,
     memoryDelta,
     riskScore,
     affectedModules,
     breakingChanges,
     confidence,
     recommendation,
   };
 }
 
 /**
  * Extract modules from file paths
  */
 function extractModulesFromPaths(paths: string[]): string[] {
   const modules = new Set<string>();
   
   for (const path of paths) {
     const match = path.match(/src\/lib\/(\w+)/);
     if (match) {
       modules.add(match[1]);
     }
   }
   
   return Array.from(modules);
 }
 
 /**
  * Calculate risk score
  */
 function calculateRiskScore(
   affectedModules: string[],
   changeType: string,
   complexity: number
 ): number {
   let score = 0;
   
   // Module criticality
   const criticalModules = ['core', 'access', 'defense', 'brain'];
   const criticalCount = affectedModules.filter(m => 
     criticalModules.includes(m)
   ).length;
   score += criticalCount * 15;
   
   // Change type risk
   switch (changeType) {
     case 'delete': score += 20; break;
     case 'refactor': score += 15; break;
     case 'modify': score += 10; break;
     case 'add': score += 5; break;
   }
   
   // Complexity factor
   score += complexity * 3;
   
   // Multi-module changes are riskier
   score += Math.max(0, (affectedModules.length - 1) * 10);
   
   return Math.min(100, score);
 }
 
 /**
  * Detect potential breaking changes
  */
 function detectBreakingChanges(
   files: string[],
   changeType: string,
   complexity: number
 ): BreakingChange[] {
   const changes: BreakingChange[] = [];
   
   // Index file changes are often breaking
   if (files.some(f => f.includes('index.ts'))) {
     changes.push({
       type: 'api',
       description: 'Changes to module index may affect exports',
       severity: changeType === 'delete' ? 'high' : 'medium',
       mitigation: 'Verify all dependent imports',
     });
   }
   
   // Type file changes
   if (files.some(f => f.includes('types.ts') || f.includes('.d.ts'))) {
     changes.push({
       type: 'api',
       description: 'Type definition changes may break consumers',
       severity: 'medium',
       mitigation: 'Use deprecation pattern for removed types',
     });
   }
   
   // High complexity refactors
   if (changeType === 'refactor' && complexity > 7) {
     changes.push({
       type: 'behavior',
       description: 'Complex refactoring may introduce subtle behavior changes',
       severity: 'medium',
       mitigation: 'Increase test coverage before and after',
     });
   }
   
   return changes;
 }
 
 /**
  * Calculate prediction confidence based on history
  */
 function calculateConfidence(category: string): number {
   const relevant = impactHistory.filter(h => 
     h.accuracy > 0 // Has been validated
   );
   
   if (relevant.length < 5) return 0.6; // Low confidence with little data
   
   const avgAccuracy = relevant.reduce((sum, h) => sum + h.accuracy, 0) / relevant.length;
   return Math.min(0.95, avgAccuracy);
 }
 
 /**
  * Validate a prediction against actual results
  */
 export function validateImpact(
   prediction: ImpactPrediction,
   actual: {
     performanceDelta: number;
     memoryDelta: number;
     errorsIntroduced: number;
   }
 ): ImpactValidation {
   // Calculate accuracy
   const perfAccuracy = 1 - Math.abs(prediction.performanceDelta - actual.performanceDelta) / 100;
   const memAccuracy = 1 - Math.abs(prediction.memoryDelta - actual.memoryDelta) / 100;
   
   const accuracy = (perfAccuracy + memAccuracy) / 2;
   
   const validation: ImpactValidation = {
     proposalId: prediction.proposalId,
     predicted: prediction,
     actual,
     accuracy,
     validated: true,
   };
   
   // Store for learning
   impactHistory.push(validation);
   if (impactHistory.length > MAX_HISTORY) {
     impactHistory.shift();
   }
   
   return validation;
 }
 
 /**
  * Get impact statistics
  */
 export function getImpactStats(): {
   totalPredictions: number;
   avgAccuracy: number;
   categoryAccuracy: Record<string, number>;
   recentTrend: 'improving' | 'stable' | 'declining';
 } {
   if (impactHistory.length === 0) {
     return {
       totalPredictions: 0,
       avgAccuracy: 0,
       categoryAccuracy: {},
       recentTrend: 'stable',
     };
   }
   
   const avgAccuracy = impactHistory.reduce((sum, h) => sum + h.accuracy, 0) / impactHistory.length;
   
   // Calculate trend from last 10 vs previous 10
   let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
   if (impactHistory.length >= 20) {
     const recent = impactHistory.slice(-10);
     const previous = impactHistory.slice(-20, -10);
     
     const recentAvg = recent.reduce((s, h) => s + h.accuracy, 0) / 10;
     const prevAvg = previous.reduce((s, h) => s + h.accuracy, 0) / 10;
     
     if (recentAvg - prevAvg > 0.05) recentTrend = 'improving';
     else if (prevAvg - recentAvg > 0.05) recentTrend = 'declining';
   }
   
   return {
     totalPredictions: impactHistory.length,
     avgAccuracy,
     categoryAccuracy: {},
     recentTrend,
   };
 }
 
 /**
  * Generate impact report
  */
 export function generateImpactReport(prediction: ImpactPrediction): string {
   const lines: string[] = [
     `# Impact Analysis Report`,
     `Proposal: ${prediction.proposalId}`,
     ``,
     `## Summary`,
     `- Performance Delta: ${prediction.performanceDelta > 0 ? '+' : ''}${prediction.performanceDelta}%`,
     `- Memory Delta: ${prediction.memoryDelta > 0 ? '+' : ''}${prediction.memoryDelta}%`,
     `- Risk Score: ${prediction.riskScore}/100`,
     `- Confidence: ${Math.round(prediction.confidence * 100)}%`,
     `- Recommendation: **${prediction.recommendation.toUpperCase()}**`,
     ``,
     `## Affected Modules`,
     ...prediction.affectedModules.map(m => `- ${m}`),
     ``,
   ];
   
   if (prediction.breakingChanges.length > 0) {
     lines.push(`## Breaking Changes`);
     for (const bc of prediction.breakingChanges) {
       lines.push(`### ${bc.type.toUpperCase()} (${bc.severity})`);
       lines.push(bc.description);
       if (bc.mitigation) {
         lines.push(`**Mitigation:** ${bc.mitigation}`);
       }
       lines.push(``);
     }
   }
   
   return lines.join('\n');
 }