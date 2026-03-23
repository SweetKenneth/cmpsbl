/**
 * CORTEX Module — Orchestration Pipeline & Workflow Coordinator
 * Ultimate Form v9.0.0 "Conductor"
 *
 * 10 Engines:
 *  1. DAG Execution Engine
 *  2. Pipeline State Machine
 *  3. Workflow Template Registry
 *  4. Cascade Failure Predictor
 *  5. Load Shedding Engine
 *  6. Backpressure Controller
 *  7. Bottleneck Analyzer
 *  8. Critical Path Optimizer
 *  9. Pipeline Analytics Collector
 * 10. Orchestration Telemetry Emitter
 */

export const CORTEX_VERSION = '9.0.0';
export const CORTEX_CODENAME = 'Conductor';

export { executeDAG, type DAGNode, type DAGNodeResult, type DAGExecutionResult } from './dagExecutionEngine';
export { createPipeline, transitionPipeline, isTerminal, canRetry, getPipelineDuration, type PipelineState, type PipelineInstance } from './pipelineStateMachine';
export { getTemplate, registerTemplate, listTemplates, findBestTemplate, recordTemplateUsage, type WorkflowTemplate, type WorkflowPattern } from './workflowTemplateRegistry';
export { assessCascadeRisk, type CascadeRiskResult, type NodeHealthSnapshot, type CascadeRiskNode } from './cascadeFailurePredictor';
export { decideShedding, requeueShedTasks, type SheddingDecision, type SheddableTask, type TaskPriority } from './loadSheddingEngine';
export { initBackpressure, updateQueueDepth, shouldAccept, getBackpressureState, getAllBackpressureStates, resetBackpressure, type BackpressureState } from './backpressureController';
export { analyzeBottlenecks, recordStageLatency, type BottleneckReport, type StageMetrics } from './bottleneckAnalyzer';
export { analyzeCriticalPath, type CriticalPathAnalysis, type PathNode, type PathOptimization } from './criticalPathOptimizer';
export { recordStageExecution, getPipelineAnalytics, getGlobalAnalytics, clearAnalytics, type PipelineAnalytics, type StageExecution } from './pipelineAnalyticsCollector';
export { emitOrchestrationEvent, onOrchestrationEvent, getRecentEvents, getEventsByPipeline, clearTelemetryBuffer, type OrchestrationTelemetryEvent, type OrchestrationEventType } from './orchestrationTelemetry';
