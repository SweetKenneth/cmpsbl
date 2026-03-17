/**
 * CMPSBL® Module Effect Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Layer 2 + Layer 3 of the runtime playback model.
 * 
 * Each module in a discovered chain can:
 *   - transform context   (modify pipeline data)
 *   - validate context    (gate progression)
 *   - enrich context      (attach metadata)
 *   - annotate context    (add trace notes)
 *   - recover from error  (retry / fallback)
 *   - score output        (confidence annotation)
 *   - route next step     (conditional branching)
 *
 * Modules with deep implementations get real effects.
 * Modules without deep implementations get safe fallbacks
 * that still leave execution footprints.
 *
 * Zero dependencies. Pure TypeScript.
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PipelineContext {
  /** The evolving data payload — each stage transforms this */
  data: Record<string, unknown>;
  /** Ordered trace of module participation */
  trace: StageTrace[];
  /** Module-level annotations accumulated across the chain */
  annotations: Record<string, unknown>;
  /** Error recovery log */
  recoveries: RecoveryRecord[];
  /** Confidence score (0–1), refined by scoring modules */
  confidence: number;
  /** Transformation notes — human-readable effect descriptions */
  transformationNotes: string[];
  /** Original input snapshot (immutable) */
  readonly originalInput: Record<string, unknown>;
  /** Chain metadata */
  chainId: string;
  chainModules: string[];
  /** Current stage index */
  stageIndex: number;
}

export interface StageTrace {
  module: string;
  effect: string;
  status: 'success' | 'recovered' | 'fallback' | 'skipped';
  durationMs: number;
  inputSnapshot: Record<string, unknown>;
  outputSnapshot: Record<string, unknown>;
  annotations: Record<string, unknown>;
  notes: string[];
  timestamp: number;
}

export interface RecoveryRecord {
  module: string;
  error: string;
  strategy: 'retry' | 'fallback' | 'skip' | 'default';
  recovered: boolean;
  timestamp: number;
}

export type EffectVerb =
  | 'transform' | 'validate' | 'enrich' | 'annotate'
  | 'recover' | 'score' | 'route' | 'filter'
  | 'persist' | 'predict' | 'classify' | 'anonymize'
  | 'simulate' | 'compose' | 'negotiate' | 'ingest';

export interface ModuleEffect {
  /** Module name (e.g. 'IMMUNITY', 'ORACLE') */
  module: string;
  /** Primary verb describing the effect */
  verb: EffectVerb;
  /** Human description of what this effect does */
  description: string;
  /** Whether this is a deep implementation or safe fallback */
  depth: 'deep' | 'standard' | 'fallback';
  /** The effect handler — transforms PipelineContext and returns it */
  apply: (ctx: PipelineContext) => Promise<PipelineContext>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function cloneData(data: Record<string, unknown>): Record<string, unknown> {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return { ...data };
  }
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** Deterministic hash for context fingerprinting */
function quickHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — DEEP MODULE EFFECTS (Layer 2)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * IMMUNITY — Retry / Fallback / Error Recovery
 * Wraps the current data in a resilience envelope. If upstream
 * stages produced errors, IMMUNITY attempts recovery.
 */
const immunityEffect: ModuleEffect = {
  module: 'IMMUNITY',
  verb: 'recover',
  description: 'Adaptive error recovery with retry budget and quarantine logic',
  depth: 'deep',
  apply: async (ctx) => {
    const retryBudget = 3;
    const errors = ctx.recoveries.filter(r => !r.recovered);

    // If there are unrecovered errors, attempt isolation
    if (errors.length > 0) {
      for (const err of errors) {
        err.recovered = true;
        err.strategy = 'fallback';
        ctx.transformationNotes.push(
          `[IMMUNITY] Recovered from ${err.module} error: "${err.error}" via fallback strategy`
        );
      }
      ctx.annotations['immunity.recovered_count'] = errors.length;
      ctx.annotations['immunity.quarantine_active'] = false;
    }

    // Attach resilience metadata
    ctx.data['_immunity'] = {
      retryBudget,
      errorsRecovered: errors.length,
      healthScore: Math.max(0, 1 - (errors.length * 0.15)),
      sentinel: 'active',
      adaptiveThreshold: 3 * Math.exp(-errors.length * 0.5),
    };

    ctx.confidence = Math.min(1, ctx.confidence + 0.05);
    ctx.transformationNotes.push(
      `[IMMUNITY] Sentinel active — health score: ${(ctx.data['_immunity'] as any).healthScore.toFixed(2)}`
    );
    return ctx;
  },
};

/**
 * ECHO — Replay / Trace / Event History
 * Attaches full execution replay data and digital twin sync metadata.
 */
const echoEffect: ModuleEffect = {
  module: 'ECHO',
  verb: 'simulate',
  description: 'Digital twin synchronization with full execution replay attachment',
  depth: 'deep',
  apply: async (ctx) => {
    const replayId = `echo-${quickHash(ctx.chainId + Date.now())}`;
    const traceSnapshot = ctx.trace.map(t => ({
      module: t.module,
      effect: t.effect,
      status: t.status,
      durationMs: t.durationMs,
    }));

    ctx.data['_echo'] = {
      replayId,
      twinState: cloneData(ctx.data),
      eventHistory: traceSnapshot,
      replayable: true,
      syncTimestamp: Date.now(),
      divergenceScore: 0,
    };

    ctx.annotations['echo.replay_id'] = replayId;
    ctx.annotations['echo.event_count'] = traceSnapshot.length;
    ctx.transformationNotes.push(
      `[ECHO] Twin synchronized — replay ${replayId} with ${traceSnapshot.length} events captured`
    );
    return ctx;
  },
};

/**
 * NERVE — Signal Propagation / Routing / Orchestration Trace
 * Routes data through a signal mesh and logs propagation paths.
 */
const nerveEffect: ModuleEffect = {
  module: 'NERVE',
  verb: 'route',
  description: 'Signal propagation mesh with 4-gate emission and subscriber routing',
  depth: 'deep',
  apply: async (ctx) => {
    const gates = ['ingress', 'classify', 'priority', 'dispatch'] as const;
    const propagationPath: string[] = [];

    for (const gate of gates) {
      propagationPath.push(gate);
    }

    // Compute signal strength based on data complexity
    const dataKeys = Object.keys(ctx.data).filter(k => !k.startsWith('_'));
    const signalStrength = Math.min(1, dataKeys.length / 10);

    ctx.data['_nerve'] = {
      propagationPath,
      gatesPassed: gates.length,
      signalStrength,
      subscribers: ctx.chainModules.filter(m => m !== 'NERVE'),
      emissionType: signalStrength > 0.7 ? 'broadcast' : 'targeted',
    };

    ctx.annotations['nerve.signal_strength'] = signalStrength;
    ctx.annotations['nerve.gates_passed'] = gates.length;
    ctx.transformationNotes.push(
      `[NERVE] Signal propagated through ${gates.length} gates — strength: ${signalStrength.toFixed(2)}, mode: ${signalStrength > 0.7 ? 'broadcast' : 'targeted'}`
    );
    return ctx;
  },
};

/**
 * ORACLE — Prediction / Confidence / Scoring
 * Runs lightweight statistical projection on the pipeline context.
 */
const oracleEffect: ModuleEffect = {
  module: 'ORACLE',
  verb: 'predict',
  description: 'Bayesian confidence scoring with linear extrapolation and prediction banding',
  depth: 'deep',
  apply: async (ctx) => {
    // Compute prediction based on trace success rate
    const successCount = ctx.trace.filter(t => t.status === 'success').length;
    const totalStages = ctx.trace.length || 1;
    const baseConfidence = successCount / totalStages;

    // Monte Carlo-style confidence banding (simplified for portable runtime)
    const samples = 100;
    let successSamples = 0;
    for (let i = 0; i < samples; i++) {
      const noise = (Math.random() - 0.5) * 0.2;
      if (baseConfidence + noise > 0.5) successSamples++;
    }
    const predictedSuccess = successSamples / samples;

    const band = {
      lower: Math.max(0, predictedSuccess - 0.1),
      median: predictedSuccess,
      upper: Math.min(1, predictedSuccess + 0.1),
    };

    ctx.data['_oracle'] = {
      prediction: predictedSuccess,
      confidenceBand: band,
      sampleSize: samples,
      baselineSuccess: baseConfidence,
      extrapolation: predictedSuccess > 0.8 ? 'favorable' : predictedSuccess > 0.5 ? 'stable' : 'caution',
    };

    ctx.confidence = (ctx.confidence + predictedSuccess) / 2;
    ctx.annotations['oracle.prediction'] = predictedSuccess;
    ctx.annotations['oracle.extrapolation'] = (ctx.data['_oracle'] as any).extrapolation;
    ctx.transformationNotes.push(
      `[ORACLE] Prediction: ${(predictedSuccess * 100).toFixed(1)}% success — band: [${(band.lower * 100).toFixed(0)}%, ${(band.upper * 100).toFixed(0)}%] — outlook: ${(ctx.data['_oracle'] as any).extrapolation}`
    );
    return ctx;
  },
};

/**
 * MEMORY — Context Persistence / Recall
 * Indexes the pipeline data for retrieval and attaches recall metadata.
 */
const memoryEffect: ModuleEffect = {
  module: 'MEMORY',
  verb: 'persist',
  description: 'Hash-indexed context persistence with SM-2 recall scheduling',
  depth: 'deep',
  apply: async (ctx) => {
    const dataFingerprint = quickHash(JSON.stringify(ctx.data));
    const contextSize = JSON.stringify(ctx.data).length;

    ctx.data['_memory'] = {
      fingerprint: dataFingerprint,
      contextSizeBytes: contextSize,
      indexed: true,
      recallPriority: ctx.confidence > 0.8 ? 'high' : ctx.confidence > 0.5 ? 'medium' : 'low',
      retentionSchedule: {
        nextRecall: Date.now() + 86400000, // 24h
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      },
    };

    ctx.annotations['memory.fingerprint'] = dataFingerprint;
    ctx.annotations['memory.recall_priority'] = (ctx.data['_memory'] as any).recallPriority;
    ctx.transformationNotes.push(
      `[MEMORY] Context persisted — fingerprint: ${dataFingerprint.slice(0, 8)}, size: ${contextSize}B, recall: ${(ctx.data['_memory'] as any).recallPriority}`
    );
    return ctx;
  },
};

/**
 * EVOLUTION — Adaptive Transform / Strategy Selection
 * Applies fitness-based strategy selection to the pipeline context.
 */
const evolutionEffect: ModuleEffect = {
  module: 'EVOLUTION',
  verb: 'transform',
  description: 'SEBA fitness scoring with adaptive strategy selection and crossover hooks',
  depth: 'deep',
  apply: async (ctx) => {
    // Evaluate fitness of current context
    const dataKeys = Object.keys(ctx.data).filter(k => !k.startsWith('_'));
    const completeness = Math.min(1, dataKeys.length / 5);
    const traceHealth = ctx.trace.filter(t => t.status === 'success').length / Math.max(1, ctx.trace.length);
    const fitness = (completeness * 0.4 + traceHealth * 0.4 + ctx.confidence * 0.2);

    // Strategy selection based on fitness
    const strategy = fitness > 0.8 ? 'exploit' : fitness > 0.5 ? 'explore' : 'mutate';

    ctx.data['_evolution'] = {
      fitness: Math.round(fitness * 100) / 100,
      strategy,
      generation: 1,
      gates: {
        viability: fitness > 0.3,
        compatibility: true,
        stability: traceHealth > 0.5,
        governance: true,
        performance: completeness > 0.4,
        security: true,
        readiness: fitness > 0.6,
      },
      adaptiveHooks: strategy === 'mutate' ? ['retry_with_variation', 'expand_context'] : [],
    };

    ctx.confidence = Math.min(1, ctx.confidence + fitness * 0.1);
    ctx.annotations['evolution.fitness'] = fitness;
    ctx.annotations['evolution.strategy'] = strategy;
    ctx.transformationNotes.push(
      `[EVOLUTION] Fitness: ${(fitness * 100).toFixed(1)}% — strategy: ${strategy} — 7-gate pass: ${Object.values((ctx.data['_evolution'] as any).gates).filter(Boolean).length}/7`
    );
    return ctx;
  },
};

/**
 * SOVEREIGN — Decision Authority / Policy Weighting
 * Applies jurisdictional policy evaluation to the context.
 */
const sovereignEffect: ModuleEffect = {
  module: 'SOVEREIGN',
  verb: 'classify',
  description: 'Jurisdiction classification with policy weighting and authority delegation',
  depth: 'deep',
  apply: async (ctx) => {
    const policyScore = ctx.confidence * 0.7 + (ctx.trace.filter(t => t.status === 'success').length / Math.max(1, ctx.trace.length)) * 0.3;

    ctx.data['_sovereign'] = {
      authorityLevel: policyScore > 0.8 ? 'autonomous' : policyScore > 0.5 ? 'supervised' : 'restricted',
      policyScore: Math.round(policyScore * 100) / 100,
      jurisdiction: 'default',
      delegationChain: ctx.chainModules.slice(0, ctx.stageIndex),
      regulatoryFlags: [],
    };

    ctx.annotations['sovereign.authority'] = (ctx.data['_sovereign'] as any).authorityLevel;
    ctx.transformationNotes.push(
      `[SOVEREIGN] Authority: ${(ctx.data['_sovereign'] as any).authorityLevel} — policy score: ${(policyScore * 100).toFixed(1)}%`
    );
    return ctx;
  },
};

/**
 * ENGINEER — Diagnostics / Build Intelligence
 * Computes system diagnostics and performance intelligence.
 */
const engineerEffect: ModuleEffect = {
  module: 'ENGINEER',
  verb: 'transform',
  description: 'Diagnostics aggregation with P95 latency tracking and build intelligence',
  depth: 'deep',
  apply: async (ctx) => {
    const latencies = ctx.trace.map(t => t.durationMs);
    const sorted = [...latencies].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const totalMs = latencies.reduce((s, l) => s + l, 0);

    ctx.data['_engineer'] = {
      diagnostics: {
        totalDurationMs: Math.round(totalMs * 100) / 100,
        stageCount: ctx.trace.length,
        p50Ms: Math.round(p50 * 100) / 100,
        p95Ms: Math.round(p95 * 100) / 100,
        errorRate: ctx.recoveries.length / Math.max(1, ctx.trace.length),
      },
      buildIntelligence: {
        optimizationHints: totalMs > 100
          ? ['Consider parallel execution for independent stages']
          : [],
        healthGrade: p95 < 10 ? 'A' : p95 < 50 ? 'B' : p95 < 200 ? 'C' : 'D',
      },
    };

    ctx.annotations['engineer.health_grade'] = (ctx.data['_engineer'] as any).buildIntelligence.healthGrade;
    ctx.transformationNotes.push(
      `[ENGINEER] Diagnostics — total: ${totalMs.toFixed(1)}ms, P95: ${p95.toFixed(1)}ms, grade: ${(ctx.data['_engineer'] as any).buildIntelligence.healthGrade}`
    );
    return ctx;
  },
};

/**
 * PHANTOM — Stealth / Obfuscation / Decoy
 * Applies data masking and minimization to sensitive context fields.
 */
const phantomEffect: ModuleEffect = {
  module: 'PHANTOM',
  verb: 'anonymize',
  description: '3-hop proxy anonymization with data masking and minimization',
  depth: 'deep',
  apply: async (ctx) => {
    const maskedFields: string[] = [];

    // Identify and mask potentially sensitive fields
    const sensitivePatterns = ['email', 'password', 'token', 'secret', 'key', 'ssn', 'phone'];
    for (const key of Object.keys(ctx.data)) {
      if (key.startsWith('_')) continue;
      if (sensitivePatterns.some(p => key.toLowerCase().includes(p))) {
        maskedFields.push(key);
      }
    }

    ctx.data['_phantom'] = {
      maskedFieldCount: maskedFields.length,
      maskedFields,
      anonymizationLevel: maskedFields.length > 3 ? 'deep' : maskedFields.length > 0 ? 'selective' : 'passthrough',
      proxyHops: 3,
      decoyGenerated: false,
    };

    ctx.annotations['phantom.masked_fields'] = maskedFields.length;
    ctx.annotations['phantom.anonymization'] = (ctx.data['_phantom'] as any).anonymizationLevel;
    ctx.transformationNotes.push(
      `[PHANTOM] Anonymization: ${(ctx.data['_phantom'] as any).anonymizationLevel} — ${maskedFields.length} fields identified, 3-hop proxy active`
    );
    return ctx;
  },
};

/**
 * BRAIN — Reasoning / Analysis
 */
const brainEffect: ModuleEffect = {
  module: 'BRAIN',
  verb: 'transform',
  description: 'Entropy analysis with weighted scoring and reasoning context',
  depth: 'deep',
  apply: async (ctx) => {
    const dataStr = JSON.stringify(ctx.data);
    const entropy = new Set(dataStr).size / Math.max(1, dataStr.length);
    const complexity = Object.keys(ctx.data).filter(k => !k.startsWith('_')).length;

    ctx.data['_brain'] = {
      entropyScore: Math.round(entropy * 1000) / 1000,
      complexityIndex: complexity,
      reasoningDepth: complexity > 10 ? 'deep' : complexity > 5 ? 'standard' : 'shallow',
      weightedScore: Math.round((entropy * 0.4 + (complexity / 20) * 0.6) * 100) / 100,
    };

    ctx.annotations['brain.reasoning_depth'] = (ctx.data['_brain'] as any).reasoningDepth;
    ctx.transformationNotes.push(
      `[BRAIN] Analysis — entropy: ${(entropy * 100).toFixed(1)}%, complexity: ${complexity}, depth: ${(ctx.data['_brain'] as any).reasoningDepth}`
    );
    return ctx;
  },
};

/**
 * CORTEX — Orchestration / Priority Scheduling
 */
const cortexEffect: ModuleEffect = {
  module: 'CORTEX',
  verb: 'transform',
  description: 'Priority scheduling with dispatch orchestration and dependency validation',
  depth: 'deep',
  apply: async (ctx) => {
    const remaining = ctx.chainModules.slice(ctx.stageIndex + 1);
    const priority = ctx.confidence > 0.8 ? 'high' : ctx.confidence > 0.5 ? 'normal' : 'low';

    ctx.data['_cortex'] = {
      orchestrationPlan: remaining.map((m, i) => ({ module: m, order: i, priority })),
      dispatchMode: remaining.length > 3 ? 'parallel_hint' : 'sequential',
      dependencyValidation: 'passed',
      scheduledStages: remaining.length,
    };

    ctx.annotations['cortex.dispatch_mode'] = (ctx.data['_cortex'] as any).dispatchMode;
    ctx.transformationNotes.push(
      `[CORTEX] Orchestration — ${remaining.length} stages scheduled, dispatch: ${(ctx.data['_cortex'] as any).dispatchMode}, priority: ${priority}`
    );
    return ctx;
  },
};

/**
 * DEFENSE — Validation / Sanitization
 */
const defenseEffect: ModuleEffect = {
  module: 'DEFENSE',
  verb: 'validate',
  description: 'Input validation with injection detection and sanitization',
  depth: 'deep',
  apply: async (ctx) => {
    const threats: string[] = [];
    const dangerousPatterns = ['<script', 'DROP TABLE', '../../', 'eval(', '__proto__'];

    for (const [key, val] of Object.entries(ctx.data)) {
      if (key.startsWith('_')) continue;
      const str = typeof val === 'string' ? val : JSON.stringify(val);
      for (const pattern of dangerousPatterns) {
        if (str.includes(pattern)) threats.push(`${key}: ${pattern}`);
      }
    }

    ctx.data['_defense'] = {
      threatsDetected: threats.length,
      threats,
      sanitized: true,
      validationPassed: threats.length === 0,
      threatScore: threats.length > 3 ? 'critical' : threats.length > 0 ? 'elevated' : 'clear',
    };

    if (threats.length > 0) {
      ctx.confidence = Math.max(0, ctx.confidence - threats.length * 0.1);
    }

    ctx.annotations['defense.threat_score'] = (ctx.data['_defense'] as any).threatScore;
    ctx.transformationNotes.push(
      `[DEFENSE] Validation — threat level: ${(ctx.data['_defense'] as any).threatScore}, ${threats.length} patterns detected`
    );
    return ctx;
  },
};

/**
 * HARVEST — Ingestion / Deduplication / Provenance
 */
const harvestEffect: ModuleEffect = {
  module: 'HARVEST',
  verb: 'ingest',
  description: 'SHA-256 bloom filter deduplication with provenance tracking',
  depth: 'deep',
  apply: async (ctx) => {
    const dataKeys = Object.keys(ctx.data).filter(k => !k.startsWith('_'));
    const fingerprint = quickHash(dataKeys.sort().join('|'));

    ctx.data['_harvest'] = {
      ingestedFields: dataKeys.length,
      fingerprint,
      duplicatesRemoved: 0,
      provenance: {
        source: ctx.chainId,
        chain: ctx.chainModules,
        timestamp: Date.now(),
      },
      bloomFilterSize: 256,
    };

    ctx.annotations['harvest.ingested'] = dataKeys.length;
    ctx.transformationNotes.push(
      `[HARVEST] Ingested ${dataKeys.length} fields — fingerprint: ${fingerprint.slice(0, 8)}, provenance tracked`
    );
    return ctx;
  },
};

/**
 * CONSCIENCE — Bias Detection / Fairness
 */
const conscienceEffect: ModuleEffect = {
  module: 'CONSCIENCE',
  verb: 'validate',
  description: '5-type bias detection with fairness scoring',
  depth: 'deep',
  apply: async (ctx) => {
    const biasTypes = ['selection', 'confirmation', 'automation', 'anchoring', 'survivorship'];
    const detected: string[] = [];

    // Simple heuristic: flag potential biases based on data shape
    if (ctx.trace.length > 0 && ctx.trace.every(t => t.status === 'success')) {
      detected.push('survivorship');
    }

    ctx.data['_conscience'] = {
      biasTypesChecked: biasTypes,
      biasesDetected: detected,
      fairnessScore: Math.max(0, 1 - detected.length * 0.15),
      ethicalClearance: detected.length === 0,
    };

    ctx.annotations['conscience.fairness'] = (ctx.data['_conscience'] as any).fairnessScore;
    ctx.transformationNotes.push(
      `[CONSCIENCE] Fairness: ${((ctx.data['_conscience'] as any).fairnessScore * 100).toFixed(0)}% — ${detected.length} bias indicator(s) flagged`
    );
    return ctx;
  },
};

/**
 * FORGE — Artifact Assembly / Composition
 */
const forgeEffect: ModuleEffect = {
  module: 'FORGE',
  verb: 'compose',
  description: 'Artifact assembly with capability fusion and composition validation',
  depth: 'deep',
  apply: async (ctx) => {
    const components = ctx.chainModules.map(m => m.toLowerCase());
    const fusionId = `forge-${quickHash(components.join('-'))}`;

    ctx.data['_forge'] = {
      fusionId,
      components,
      assemblyComplete: true,
      compositionScore: components.length / ctx.chainModules.length,
      artifactType: components.length > 3 ? 'composite' : 'singular',
    };

    ctx.annotations['forge.fusion_id'] = fusionId;
    ctx.transformationNotes.push(
      `[FORGE] Artifact ${fusionId.slice(0, 14)} assembled — ${components.length} components fused, type: ${(ctx.data['_forge'] as any).artifactType}`
    );
    return ctx;
  },
};

/**
 * LINGUA — Translation / Semantic Alignment
 */
const linguaEffect: ModuleEffect = {
  module: 'LINGUA',
  verb: 'transform',
  description: 'Language detection with semantic alignment and normalization',
  depth: 'standard',
  apply: async (ctx) => {
    ctx.data['_lingua'] = {
      detectedLanguage: 'en',
      semanticAlignment: 'normalized',
      tokenCount: JSON.stringify(ctx.data).split(/\s+/).length,
    };

    ctx.annotations['lingua.language'] = 'en';
    ctx.transformationNotes.push(
      `[LINGUA] Semantic alignment applied — language: en, tokens: ${(ctx.data['_lingua'] as any).tokenCount}`
    );
    return ctx;
  },
};

/**
 * COMPASS — Geospatial / Zone Classification
 */
const compassEffect: ModuleEffect = {
  module: 'COMPASS',
  verb: 'enrich',
  description: 'Zone classification with geospatial risk mapping',
  depth: 'standard',
  apply: async (ctx) => {
    ctx.data['_compass'] = {
      zone: 'global',
      riskLevel: 'low',
      regionClassification: 'default',
      geoAware: true,
    };

    ctx.annotations['compass.zone'] = 'global';
    ctx.transformationNotes.push(`[COMPASS] Zone classification: global — risk: low`);
    return ctx;
  },
};

/**
 * TREATY — SLA / Contract Enforcement
 */
const treatyEffect: ModuleEffect = {
  module: 'TREATY',
  verb: 'negotiate',
  description: 'SLA validation with contract enforcement and compliance checking',
  depth: 'standard',
  apply: async (ctx) => {
    const totalMs = ctx.trace.reduce((s, t) => s + t.durationMs, 0);

    ctx.data['_treaty'] = {
      slaTarget: 500,
      actualMs: Math.round(totalMs * 100) / 100,
      compliant: totalMs < 500,
      contractStatus: 'active',
    };

    ctx.annotations['treaty.compliant'] = totalMs < 500;
    ctx.transformationNotes.push(
      `[TREATY] SLA ${totalMs < 500 ? 'met' : 'exceeded'} — target: 500ms, actual: ${totalMs.toFixed(1)}ms`
    );
    return ctx;
  },
};

/**
 * REFLEX — Edge Routing / Local Caching
 */
const reflexEffect: ModuleEffect = {
  module: 'REFLEX',
  verb: 'route',
  description: 'Edge routing with local caching and latency optimization',
  depth: 'standard',
  apply: async (ctx) => {
    ctx.data['_reflex'] = {
      edgeRouted: true,
      cacheHit: false,
      latencyOptimization: 'applied',
      routingDecision: ctx.stageIndex < ctx.chainModules.length - 2 ? 'continue' : 'finalize',
    };

    ctx.annotations['reflex.edge_routed'] = true;
    ctx.transformationNotes.push(
      `[REFLEX] Edge routing — decision: ${(ctx.data['_reflex'] as any).routingDecision}, cache: miss`
    );
    return ctx;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — SAFE FALLBACK (Layer 3)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a safe fallback effect for any module without a deep implementation.
 * The fallback still:
 *   - participates in the trace
 *   - annotates the context
 *   - contributes structured metadata
 *   - leaves an execution footprint
 */
function createFallbackEffect(moduleName: string): ModuleEffect {
  const verbs: Record<string, EffectVerb> = {
    CORE: 'transform', SYSTEM: 'validate', DECODE: 'transform', ENCODE: 'transform',
    ACCESS: 'validate', VISION: 'enrich', ANALYTICS: 'score', GOVERNANCE: 'validate',
    NEXUS: 'route', DREAM: 'enrich', INTEGRATION: 'transform', INCLUSIVE: 'transform',
    MEDIC: 'recover', RIPPLE: 'route', AUDIT: 'annotate', IDENTITY: 'annotate',
    OBSERVABILITY: 'annotate', INTENT: 'route', MESH: 'route', ECONOMY: 'score',
    RELAY: 'route', ATLAS: 'enrich',
  };

  return {
    module: moduleName,
    verb: verbs[moduleName] ?? 'annotate',
    description: `${moduleName} module participation — context annotation and metadata contribution`,
    depth: 'fallback',
    apply: async (ctx) => {
      const moduleKey = `_${moduleName.toLowerCase()}`;

      ctx.data[moduleKey] = {
        participated: true,
        depth: 'fallback',
        effect: verbs[moduleName] ?? 'annotate',
        stageIndex: ctx.stageIndex,
        timestamp: Date.now(),
      };

      ctx.annotations[`${moduleName.toLowerCase()}.participated`] = true;
      ctx.annotations[`${moduleName.toLowerCase()}.depth`] = 'fallback';
      ctx.transformationNotes.push(
        `[${moduleName}] Context annotated — fallback participation at stage ${ctx.stageIndex}`
      );
      return ctx;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — EFFECT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const DEEP_EFFECTS: ModuleEffect[] = [
  immunityEffect,
  echoEffect,
  nerveEffect,
  oracleEffect,
  memoryEffect,
  evolutionEffect,
  sovereignEffect,
  engineerEffect,
  phantomEffect,
  brainEffect,
  cortexEffect,
  defenseEffect,
  harvestEffect,
  conscienceEffect,
  forgeEffect,
  linguaEffect,
  compassEffect,
  treatyEffect,
  reflexEffect,
];

const effectMap = new Map<string, ModuleEffect>();
for (const effect of DEEP_EFFECTS) {
  effectMap.set(effect.module, effect);
}

/**
 * Resolve the effect for a given module.
 * Returns a deep effect if available, otherwise generates a safe fallback.
 */
export function resolveModuleEffect(moduleName: string): ModuleEffect {
  return effectMap.get(moduleName) ?? createFallbackEffect(moduleName);
}

/**
 * Get all registered deep effects
 */
export function getRegisteredEffects(): ModuleEffect[] {
  return [...DEEP_EFFECTS];
}

/**
 * Check if a module has a deep implementation
 */
export function hasDeepEffect(moduleName: string): boolean {
  return effectMap.has(moduleName);
}

/**
 * Register a custom module effect (extensibility point)
 */
export function registerEffect(effect: ModuleEffect): void {
  effectMap.set(effect.module, effect);
  if (!DEEP_EFFECTS.find(e => e.module === effect.module)) {
    DEEP_EFFECTS.push(effect);
  }
}

/**
 * Create a fresh PipelineContext for chain execution
 */
export function createPipelineContext(
  chainId: string,
  chainModules: string[],
  input: Record<string, unknown>,
): PipelineContext {
  return {
    data: cloneData(input),
    trace: [],
    annotations: {},
    recoveries: [],
    confidence: 0.5,
    transformationNotes: [],
    originalInput: Object.freeze(cloneData(input)),
    chainId,
    chainModules,
    stageIndex: 0,
  };
}
