# CMPSBL® Substrate — Functions Reference

**Epoch:** CONTRACT (V13)  
**Classification:** Internal  
**Date:** 2026-02  

> Complete API reference for every exported function, hook, and utility in the substrate.

---

## 1. Quick Actions (Utility Shortcuts)

```typescript
import { remember, recall, learn, dream, analyze, validate } from '@/lib/substrate';

// Store a memory
remember(content: string, tags?: string[]): Promise<string | undefined>

// Recall memories
recall(query: string, limit?: number): Promise<string[]>

// Learn from content
learn(content: string, topic?: string): Promise<boolean>

// Trigger dream synthesis
dream(): Promise<string | null>

// Analyze causality
analyze(context: string): Promise<{ causes: string[]; effects: string[] }>

// Validate via governance
validate(content: string): Promise<boolean>
```

## 2. Composite Operations

```typescript
// Remember + learn in one call
rememberAndLearn(content: string, topic?: string, tags?: string[]): Promise<{ memoryId?: string; learned: boolean }>

// Analyze + synthesize
analyzeAndSynthesize(context: string): Promise<{ causes: string[]; effects: string[]; synthesis: string | null }>

// Full cognitive cycle (ingest → learn → imagine → reason → govern)
cognize(input: string, options?: { depth?: 'shallow'|'standard'|'deep' }): Promise<CognitiveCycleResult>
```

## 3. Engine Bus

```typescript
import { engineBus } from '@/lib/substrate';

// Core dispatch
engineBus.dispatch<T>(command: string, payload?: Record<string, unknown>, options?: DispatchOptions): Promise<DispatchResult<T>>

// Dispatch to specific engine
engineBus.dispatchToEngine<T>(engine: EngineName, command: string, payload?: Record<string, unknown>): Promise<DispatchResult<T>>

// Chain multiple dispatches
engineBus.dispatchChain(chain: Array<{ command: string; payload?: Record<string, unknown> }>): Promise<DispatchResult<DispatchResult[]>>

// Resolution
engineBus.resolveEngine(command: string): EngineName | null
engineBus.getEngineCommands(engine: EngineName): string[]
engineBus.isValidCommand(command: string): boolean
engineBus.getRoutingMap(): Record<EngineName, string[]>

// State & observability
engineBus.getState(): BusState
engineBus.getEventLog(): ExecutionEvent[]
engineBus.getLoadStats(): LoadBalancerStats
engineBus.configureLoadBalancer(updates: Partial<LoadBalancerConfig>): void
```

## 4. Memory Core

```typescript
import { memoryCore } from '@/lib/substrate';

// Lifecycle operations
memoryCore.ingest(content: string, options?: { tags?: string[]; source?: string; type?: MemoryType }): Promise<LifecycleResult>
memoryCore.store(entry: Partial<MemoryEntry>): Promise<LifecycleResult>
memoryCore.index(memoryId: string): Promise<LifecycleResult>
memoryCore.reflect(options?: { depth?: 'shallow'|'deep' }): Promise<LifecycleResult>
memoryCore.retrieve(query: MemoryQuery): Promise<LifecycleResult>

// State
memoryCore.getState(): MemoryStateSchema
```

## 5. Learning Engine

```typescript
import { learningEngine } from '@/lib/substrate';

learningEngine.input(data: LearningInput): Promise<LearningResult>
learningEngine.feedback(signal: FeedbackSignal): Promise<LearningResult>
learningEngine.adjustment(): Promise<LearningResult>
learningEngine.reinforcement(): Promise<LearningResult>
learningEngine.stabilization(): Promise<LearningResult>
learningEngine.getState(): LearningState
```

## 6. Imagination Engine

```typescript
import { imaginationEngine } from '@/lib/substrate';

imaginationEngine.dream(options?: { force?: boolean }): Promise<ImaginationResult>
imaginationEngine.synthesize(inputs: string[]): Promise<ImaginationResult>
imaginationEngine.patternFusion(domains: string[]): Promise<ImaginationResult>
imaginationEngine.getState(): ImaginationState
```

## 7. Reasoning Engine

```typescript
import { reasoningEngine } from '@/lib/substrate';

reasoningEngine.causalMapping(input: { context: string }): Promise<ReasoningResult>
reasoningEngine.dependencyAnalysis(input: { entities: string[] }): Promise<ReasoningResult>
reasoningEngine.hypothesisGeneration(input: { context: string }): Promise<ReasoningResult>
reasoningEngine.hypothesisValidation(input: { hypothesisId: string }): Promise<ReasoningResult>
reasoningEngine.impactProjection(input: { scenario: string }): Promise<ReasoningResult>
reasoningEngine.getState(): ReasoningState
```

## 8. Governance Guard

```typescript
import { governanceGuard } from '@/lib/substrate';

governanceGuard.runCycle(input: GovernanceInput): Promise<{ final_decision: 'approve'|'warn'|'block'; results: GovernanceResult[] }>
governanceGuard.coherenceCheck(input: GovernanceInput): Promise<GovernanceResult>
governanceGuard.ethicalCheck(input: GovernanceInput): Promise<GovernanceResult>
governanceGuard.getState(): GovernanceState
```

## 9. Orchestrator Engine

```typescript
import { orchestratorEngine, PRESET_PIPELINES } from '@/lib/substrate';

// Run a preset pipeline
orchestratorEngine.runPipeline(config: PipelineConfig): Promise<PipelineResult>

// Full cognitive cycle
orchestratorEngine.cognitiveCycle(options: CognitiveCycleOptions): Promise<CognitiveCycleResult>

// Pipeline shortcuts
runMemoryPipeline(input: string): Promise<PipelineResult>
runCreativePipeline(input: string): Promise<PipelineResult>
runAnalyticalPipeline(input: string): Promise<PipelineResult>
runFullCognitive(input: string): Promise<PipelineResult>
```

## 10. Telemetry Engine

```typescript
import { telemetryEngine } from '@/lib/substrate';

telemetryEngine.record(event: Partial<TelemetryEvent>): void
telemetryEngine.query(query: TelemetryQuery): TelemetryEvent[]
telemetryEngine.getState(): TelemetryState
telemetryEngine.getSummary(): TelemetrySummary
```

## 11. State Engine

```typescript
import { stateEngine } from '@/lib/substrate';

stateEngine.get(schema: StateSchemaName): Record<string, unknown>
stateEngine.set(schema: StateSchemaName, updates: Record<string, unknown>): StateValidationResult
stateEngine.validate(schema: StateSchemaName, data: Record<string, unknown>): StateValidationResult
stateEngine.getState(): StateEngineState
```

## 12. Feature Flags

```typescript
import { defineFlag, isEnabled, setOverride, clearOverride, getAllFlags, bulkDefine } from '@/lib/substrate';

defineFlag(key: string, enabled?: boolean, rolloutPercent?: number): void
isEnabled(key: string, userId?: string): boolean
setOverride(key: string, enabled: boolean): void
clearOverride(key: string): void
clearAllOverrides(): void
onFlagChange(cb: (key: string, enabled: boolean) => void): () => void
getAllFlags(): FeatureFlag[]
bulkDefine(defs: Record<string, boolean>): void
```

## 13. Circuit Breaker

```typescript
import { getBreaker, configureBreaker, recordSuccess, recordFailure, resetBreaker, tripBreaker } from '@/lib/substrate/circuit-breaker';

getBreaker(module: string): CircuitBreaker
configureBreaker(module: string, config: Partial<CircuitBreakerConfig>): void
recordSuccess(module: string): void
recordFailure(module: string): void
resetBreaker(module: string): void
tripBreaker(module: string): void
getAllBreakers(): CircuitBreaker[]
```

## 14. Health Scorecard

```typescript
import { computeScorecard, quickScore, getScorecardHistory } from '@/lib/substrate';

computeScorecard(dimensions: Array<{ dimension: string; score: number; weight: number }>): HealthScorecard
quickScore(modules: Array<{ name: string; healthy: boolean; latencyMs?: number }>): HealthScorecard
getScorecardHistory(): number[]
```

## 15. Cascade Detector

```typescript
import { reportFailure, getCascadeHistory, onCascade } from '@/lib/substrate/cascade-detector';

reportFailure(module: string, error: string): CascadeChain | null
getCascadeHistory(): CascadeChain[]
onCascade(listener: (chain: CascadeChain) => void): () => void
```

## 16. SEBA (Self-Evolution)

```typescript
import { sebaAgent } from '@/lib/substrate';

sebaAgent.startCycle(): Promise<SEBACycleResult>
sebaAgent.getState(): SEBAState
sebaAgent.getMetrics(): SEBAMetrics
sebaAgent.getHealth(): SEBAHealth
sebaAgent.configure(config: Partial<SEBAConfig>): void
```

## 17. CLM (Constant Learning)

```typescript
import { runCLMCycle, getCLMStatus, enableCLM, disableCLM, isCLMReady } from '@/lib/substrate';

runCLMCycle(): Promise<LearningJobResult>
getCLMStatus(): CLMOrchestratorState
enableCLM(): void
disableCLM(): void
isCLMReady(): boolean
activateKillSwitch(): void
deactivateKillSwitch(): void
```

## 18. Control Plane Persistence

```typescript
import { flushAll } from '@/lib/control-plane/persistence';
import { rehydrateControlPlane } from '@/lib/control-plane/rehydrate';
import { listRevisions, restoreToRevision, verifySnapshotHash } from '@/lib/control-plane/restore';
import { startPersistenceScheduler, stopPersistenceScheduler } from '@/lib/control-plane/persistence-scheduler';

flushAll(): Promise<void>
rehydrateControlPlane(options?: { targetRevision?: number }): Promise<RehydrationResult>
listRevisions(options?: { limit?: number }): Promise<Revision[]>
restoreToRevision(revId: number, options?: { replayWalToLatest?: boolean }): Promise<void>
verifySnapshotHash(revId: number): Promise<boolean>
startPersistenceScheduler(): Promise<void>
stopPersistenceScheduler(): Promise<void>
```

## 19. Infrastructure Utilities

```typescript
// Backpressure
import { createBackpressure } from '@/lib/substrate/backpressure';
createBackpressure(strategy: 'queue'|'drop'|'throttle', config: BackpressureConfig): BackpressureController

// Bloom Filter
import { createBloomFilter } from '@/lib/substrate/bloom-filter';
createBloomFilter(expectedItems: number, falsePositiveRate: number): BloomFilter

// Ring Buffer
import { createRingBuffer } from '@/lib/substrate/ring-buffer';
createRingBuffer<T>(capacity: number): RingBuffer<T>

// Semaphore
import { createSemaphore } from '@/lib/substrate/semaphore';
createSemaphore(permits: number): Semaphore

// SLA Monitor
import { createSLAMonitor } from '@/lib/substrate/sla-monitor';
createSLAMonitor(config: SLAConfig): SLAMonitor

// Merkle Audit Chain
import { createMerkleChain } from '@/lib/substrate/merkle-audit-chain';
createMerkleChain(): MerkleAuditChain

// Saga Orchestrator
import { createSaga } from '@/lib/substrate/saga-orchestrator';
createSaga(steps: SagaStep[]): Saga

// State Machine
import { createStateMachine } from '@/lib/substrate/state-machine';
createStateMachine(config: StateMachineConfig): StateMachine

// Priority Queue
import { createPriorityQueue } from '@/lib/substrate/priority-queue';
createPriorityQueue<T>(comparator: (a: T, b: T) => number): PriorityQueue<T>
```

## 20. Event System

```typescript
import { emit, emitStarted, emitSucceeded, emitFailed, queryEvents, subscribeToEvents } from '@/lib/substrate';

emit(event: Partial<SubstrateEvent>): void
emitStarted(module: string, action: string, traceId?: string): void
emitSucceeded(module: string, action: string, traceId?: string, data?: unknown): void
emitFailed(module: string, action: string, traceId?: string, error?: string): void
queryEvents(options: EventQueryOptions): EventRecord[]
subscribeToEvents(filter: Partial<SubstrateEvent>, callback: (event: EventRecord) => void): () => void
```

## 21. Version Registry

```typescript
import { SUBSTRATE_VERSION, SUBSTRATE_CODENAME, MODULE_VERSIONS, getAllVersions, getModuleVersion } from '@/lib/substrate';

SUBSTRATE_VERSION: string          // Current version (from store)
SUBSTRATE_CODENAME: string         // Current codename
MODULE_VERSIONS: Record<string, { version: string; codename: string; layer: string }>
getAllVersions(): Record<string, string>
getModuleVersion(module: string): { version: string; codename: string; layer: string }
isVersionCompatible(required: string, actual: string): boolean
```

## 22. SEO Hooks

```typescript
import { usePageSEO } from '@/hooks/usePageSEO';

const { entry, helmetProps } = usePageSEO();      // auto-resolve from route
const { entry, helmetProps } = usePageSEO('/about'); // explicit path

// helmetProps: { title, description, keywords, noindex }
```

---

© 2025–2026 PromptFluid®. All rights reserved.
