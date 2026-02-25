/**
 * Governance Guard — Unified Ethical & Coherence Constraints
 * v10.5.4 — ARCHITECT Epoch: Governance Integration + SEBA
 * 
 * Merges:
 * - brain.ethical → ethical_constraint_check
 * - brain.coherence_check → coherence_validation
 * 
 * Lifecycle: coherence_validation → ethical_constraint_check → governance_signal_emission
 * 
 * Capabilities:
 * - Block unsafe reasoning paths
 * - Flag incoherent cognition
 * - Emit governance metadata for audits
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { withTimeout, validateStringInput } from '@/lib/system/hardening';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type GovernanceStage = 
  | 'coherence_validation'
  | 'ethical_constraint_check'
  | 'governance_signal_emission';

export interface GovernanceState {
  current_stage: GovernanceStage;
  coherence_score: number;
  ethical_violations: number;
  governance_signals_emitted: number;
  blocked_paths: number;
  last_check_at: string | null;
}

export interface CoherenceResult {
  is_coherent: boolean;
  coherence_score: number;
  issues: Array<{
    type: 'contradiction' | 'inconsistency' | 'circular_reference' | 'missing_context';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface EthicalResult {
  is_safe: boolean;
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  constraints_violated: string[];
  recommendations: string[];
}

export interface GovernanceSignal {
  id: string;
  type: 'block' | 'warn' | 'audit' | 'approve';
  reason: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface GovernanceResult {
  success: boolean;
  stage: GovernanceStage;
  result?: {
    coherence?: CoherenceResult;
    ethical?: EthicalResult;
    signal?: GovernanceSignal;
  };
  blocked: boolean;
  processing_time_ms: number;
  error?: string;
}

export interface GovernanceInput {
  content: string;
  context?: string;
  source?: string;
  strict_mode?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNANCE GUARD CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

export class GovernanceGuardClient {
  private static instance: GovernanceGuardClient;
  
  // Ethical constraints (hardcoded for safety)
  private readonly ETHICAL_CONSTRAINTS = [
    'no_harmful_content',
    'no_personal_data_exposure',
    'no_discriminatory_output',
    'no_deceptive_claims',
    'respect_user_privacy',
    'maintain_data_integrity',
  ];

  private constructor() {}

  static getInstance(): GovernanceGuardClient {
    if (!GovernanceGuardClient.instance) {
      GovernanceGuardClient.instance = new GovernanceGuardClient();
    }
    return GovernanceGuardClient.instance;
  }

  // ═══ STATE MANAGEMENT ═══

  async getState(): Promise<GovernanceState> {
    const { data: events } = await supabase
      .from('brain_events')
      .select('*')
      .eq('module', 'governance_guard')
      .order('created_at', { ascending: false })
      .limit(100);

    const coherenceChecks = events?.filter(e => e.event_type === 'coherence_validated') || [];
    const ethicalViolations = events?.filter(e => e.outcome === 'violation') || [];
    const signals = events?.filter(e => e.event_type === 'signal_emitted') || [];
    const blocked = events?.filter(e => e.event_type === 'path_blocked') || [];
    const lastEvent = events?.[0];

    // Calculate average coherence score
    const coherenceScores = coherenceChecks
      .map(e => (e.data as any)?.coherence_score || 0.8)
      .filter(s => s > 0);
    const avgCoherence = coherenceScores.length > 0 
      ? coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length 
      : 0.85;

    return {
      current_stage: 'coherence_validation',
      coherence_score: avgCoherence,
      ethical_violations: ethicalViolations.length,
      governance_signals_emitted: signals.length,
      blocked_paths: blocked.length,
      last_check_at: lastEvent?.created_at || null,
    };
  }

  // ═══ STAGE 1: COHERENCE VALIDATION ═══
  // Checks for logical consistency and contradictions

  async coherenceValidation(input: GovernanceInput): Promise<GovernanceResult> {
    const startTime = Date.now();

    // Input validation
    const content = validateStringInput(input.content, { maxLength: 100_000, minLength: 1, label: 'governance.content' });
    if (!content) {
      return {
        success: false,
        stage: 'coherence_validation',
        blocked: false,
        error: 'Invalid content: must be a non-empty string (max 100KB)',
        processing_time_ms: Date.now() - startTime,
      };
    }

    try {
      const coherence = this.checkCoherence(content, input.context);

      // Fire-and-forget audit event (non-blocking)
      supabase.from('brain_events').insert({
        module: 'governance_guard',
        event_type: 'coherence_validated',
        data: { 
          content_length: content.length,
          coherence_score: coherence.coherence_score,
          issues_found: coherence.issues.length,
        },
        outcome: coherence.is_coherent ? 'success' : 'incoherent',
      }).then(() => {}, () => {});

      return {
        success: true,
        stage: 'coherence_validation',
        result: { coherence },
        blocked: !coherence.is_coherent && input.strict_mode === true,
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'coherence_validation',
        blocked: false,
        error: error instanceof Error ? error.message : 'Coherence validation failed',
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  private checkCoherence(content: string, context?: string): CoherenceResult {
    const issues: CoherenceResult['issues'] = [];

    // Use non-global regex to avoid lastIndex state bugs
    const contradictionPatterns = [
      /(\w+)\s+is\s+(\w+).*\1\s+is\s+not\s+\2/i,
      /always\s+(\w+).*never\s+\1/i,
      /true.*false.*same/i,
    ];

    for (const pattern of contradictionPatterns) {
      if (pattern.test(content)) {
        issues.push({
          type: 'contradiction',
          description: 'Detected potential logical contradiction in content',
          severity: 'high',
        });
      }
    }

    // Check for circular references
    if (/(\w+)\s+depends\s+on.*\1/i.test(content)) {
      issues.push({
        type: 'circular_reference',
        description: 'Detected circular dependency pattern',
        severity: 'medium',
      });
    }

    // Check for missing context
    if (!context && content.length > 500) {
      issues.push({
        type: 'missing_context',
        description: 'Long content provided without contextual grounding',
        severity: 'low',
      });
    }

    const coherenceScore = Math.max(0.3, 1 - (issues.length * 0.2));

    return {
      is_coherent: issues.filter(i => i.severity === 'high').length === 0,
      coherence_score: coherenceScore,
      issues,
    };
  }

  // ═══ STAGE 2: ETHICAL CONSTRAINT CHECK ═══
  // Validates against ethical guardrails

  async ethicalConstraintCheck(input: GovernanceInput): Promise<GovernanceResult> {
    const startTime = Date.now();

    try {
      const ethical = this.checkEthicalConstraints(input.content);

      await supabase.from('brain_events').insert({
        module: 'governance_guard',
        event_type: 'ethical_checked',
        data: { 
          content_length: input.content.length,
          risk_level: ethical.risk_level,
          violations: ethical.constraints_violated.length,
        },
        outcome: ethical.is_safe ? 'success' : 'violation',
      });

      return {
        success: true,
        stage: 'ethical_constraint_check',
        result: { ethical },
        blocked: !ethical.is_safe && (ethical.risk_level === 'critical' || ethical.risk_level === 'high'),
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'ethical_constraint_check',
        blocked: false,
        error: error instanceof Error ? error.message : 'Ethical check failed',
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  private checkEthicalConstraints(content: string): EthicalResult {
    const violations: string[] = [];
    const recommendations: string[] = [];
    const lowerContent = content.toLowerCase();

    // Check for harmful content patterns
    // Use non-global regex to avoid lastIndex state bugs
    const harmfulPatterns = [
      { pattern: /how\s+to\s+(hack|attack|exploit)/i, constraint: 'no_harmful_content' },
      { pattern: /\b(ssn|social\s+security|credit\s+card\s+number)\b/i, constraint: 'no_personal_data_exposure' },
      { pattern: /\b(discriminat|racist|sexist)\b/i, constraint: 'no_discriminatory_output' },
    ];

    for (const { pattern, constraint } of harmfulPatterns) {
      if (pattern.test(lowerContent)) {
        violations.push(constraint);
        recommendations.push(`Content may violate ${constraint.replace(/_/g, ' ')}`);
      }
    }

    // Calculate risk level
    let risk_level: EthicalResult['risk_level'] = 'none';
    if (violations.length >= 3) risk_level = 'critical';
    else if (violations.length >= 2) risk_level = 'high';
    else if (violations.length === 1) risk_level = 'medium';
    else if (lowerContent.length > 5000) risk_level = 'low';

    return {
      is_safe: violations.length === 0,
      risk_level,
      constraints_violated: violations,
      recommendations: recommendations.length > 0 ? recommendations : ['Content appears safe'],
    };
  }

  // ═══ STAGE 3: GOVERNANCE SIGNAL EMISSION ═══
  // Emits governance metadata for audit trails

  async emitGovernanceSignal(
    type: GovernanceSignal['type'],
    reason: string,
    metadata?: Record<string, unknown>
  ): Promise<GovernanceResult> {
    const startTime = Date.now();

    try {
      const signal: GovernanceSignal = {
        id: crypto.randomUUID(),
        type,
        reason,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      };

      await supabase.from('brain_events').insert([{
        module: 'governance_guard',
        event_type: 'signal_emitted',
        data: JSON.parse(JSON.stringify(signal)) as Json,
        outcome: type,
      }]);

      // Log blocked paths separately for analytics
      if (type === 'block') {
        await supabase.from('brain_events').insert([{
          module: 'governance_guard',
          event_type: 'path_blocked',
          data: { signal_id: signal.id, reason } as Json,
          outcome: 'blocked',
        }]);
      }

      return {
        success: true,
        stage: 'governance_signal_emission',
        result: { signal },
        blocked: type === 'block',
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'governance_signal_emission',
        blocked: false,
        error: error instanceof Error ? error.message : 'Signal emission failed',
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  // ═══ FULL GOVERNANCE CYCLE ═══

  async runCycle(input: GovernanceInput): Promise<{
    success: boolean;
    stages: GovernanceResult[];
    final_decision: 'approve' | 'warn' | 'block';
    total_time_ms: number;
  }> {
    const startTime = Date.now();
    const stages: GovernanceResult[] = [];

    // Stage 1: Coherence Validation
    const coherenceResult = await this.coherenceValidation(input);
    stages.push(coherenceResult);

    // Stage 2: Ethical Constraint Check
    const ethicalResult = await this.ethicalConstraintCheck(input);
    stages.push(ethicalResult);

    // Determine final decision
    let final_decision: 'approve' | 'warn' | 'block' = 'approve';
    
    if (coherenceResult.blocked || ethicalResult.blocked) {
      final_decision = 'block';
    } else if (
      (coherenceResult.result?.coherence?.coherence_score || 1) < 0.7 ||
      (ethicalResult.result?.ethical?.risk_level === 'medium')
    ) {
      final_decision = 'warn';
    }

    // Stage 3: Emit governance signal
    const signalResult = await this.emitGovernanceSignal(
      final_decision === 'block' ? 'block' : final_decision === 'warn' ? 'warn' : 'approve',
      `Governance cycle complete: ${final_decision}`,
      {
        coherence_score: coherenceResult.result?.coherence?.coherence_score,
        risk_level: ethicalResult.result?.ethical?.risk_level,
        source: input.source,
      }
    );
    stages.push(signalResult);

    return {
      success: !stages.some(s => !s.success),
      stages,
      final_decision,
      total_time_ms: Date.now() - startTime,
    };
  }

  // ═══ LEGACY ALIASES ═══

  /** @deprecated Use coherenceValidation() instead */
  async coherenceCheck(depth?: 'standard' | 'deep'): Promise<GovernanceResult> {
    console.warn('Deprecation: brain.coherence_check() is aliased to governanceGuard.coherenceValidation()');
    
    // Fetch recent memories for coherence check
    const { data: memories } = await supabase
      .from('brain_memories')
      .select('content')
      .order('created_at', { ascending: false })
      .limit(depth === 'deep' ? 50 : 20);

    const content = memories?.map(m => m.content).join('\n') || '';
    return this.coherenceValidation({ content, strict_mode: depth === 'deep' });
  }

  /** @deprecated Use ethicalConstraintCheck() instead */
  async ethical(content: string): Promise<GovernanceResult> {
    console.warn('Deprecation: brain.ethical() is aliased to governanceGuard.ethicalConstraintCheck()');
    return this.ethicalConstraintCheck({ content });
  }
}

// Singleton export
export const governanceGuard = GovernanceGuardClient.getInstance();
