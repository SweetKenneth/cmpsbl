/**
 * Shadow Mesh — Module Exports (v3.0)
 * Admin-controlled adversarial probing for 13 pilot executors
 * across INCLUSIVE, COGNITIVE, OPERATIONAL, and ORCHESTRATOR modules
 */

export { generateAdversarialInputs } from './mutate';
export { runShadowProbe, runAllShadowProbes, type ShadowProbeResult, type ShadowProbeReport } from './probe';
export { runShadowBatch } from './runBatch';
export { startShadowScheduler, stopShadowScheduler } from './scheduler';
export { getShadowMeshAnalytics, type ShadowMeshAnalyticsData } from './analytics';
export { runShadowBuild, runAllShadowBuilds, getSkillStats, getAllSkills, type ShadowBuildReport, type ShadowBuildResult, type SkillRecord } from './shadowBuild';
export { runModernizerShadow as runEvolutionShadow, runModernizerShadow, getPerformanceStats, getPerformanceSummary, getPerformanceForExecutor, type ModernizerShadowReport as EvolutionShadowReport, type ModernizerShadowReport, type GapAttemptResult, type PerformanceEntry, type GapCategory } from './modernizerShadow';
