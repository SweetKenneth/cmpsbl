/**
 * AI Patch Generator — GPT-powered code patch proposals
 * Uses a dedicated OpenAI-backed evolution path for patch quality and reliability.
 * Part of the Evolution pipeline: Discovery → Generation → SEBA → Approval
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────────

export type PatchCategory = 'fix' | 'refactor' | 'optimize' | 'security' | 'feature' | 'suggest';

export interface PatchCandidate {
  id: string;
  category: PatchCategory;
  title: string;
  description: string;
  targetModule: string;
  targetFiles: string[];
  contextFiles?: Array<{ filePath: string; content: string }>;
  constraints?: string[];
  severity: number;       // 0-1
  confidence: number;     // 0-1
  sourceScanner: string;  // CDM, CLM, Scanner, ENGINEER, etc.
}

export interface PatchChange {
  filePath: string;
  operation: 'modify' | 'create' | 'delete';
  diff: string;
  explanation: string;
}

export interface GeneratedPatch {
  patchId: string;
  candidateId: string;
  category: PatchCategory;
  title: string;
  changes: PatchChange[];
  model: string;
  tokensUsed: number;
  estimatedCostUsd?: number;
  confidence: number;
  estimatedImpact: {
    healthDelta: number;
    debtReduction: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  reasoning: string;
  generatedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'shadow_running' | 'promoted' | 'rolled_back';
}

// ── Model Selection ────────────────────────────────────────

/** Cost ceiling: ≤$0.05 per evolution patch run. */
export const EVOLUTION_COST_CEILING = 0.05;

const MODEL_MAP: Record<PatchCategory, { primary: 'gpt-4o-mini'; fallback: 'gpt-4o-mini'; temperature: number }> = {
  security: { primary: 'gpt-4o-mini', fallback: 'gpt-4o-mini', temperature: 0.05 },
  fix:      { primary: 'gpt-4o-mini', fallback: 'gpt-4o-mini', temperature: 0.10 },
  refactor: { primary: 'gpt-4o-mini', fallback: 'gpt-4o-mini', temperature: 0.15 },
  optimize: { primary: 'gpt-4o-mini', fallback: 'gpt-4o-mini', temperature: 0.10 },
  feature:  { primary: 'gpt-4o-mini', fallback: 'gpt-4o-mini', temperature: 0.20 },
  suggest:  { primary: 'gpt-4o-mini', fallback: 'gpt-4o-mini', temperature: 0.25 },
};

function selectModel(category: PatchCategory) {
  return MODEL_MAP[category] || MODEL_MAP.fix;
}

// ── Patch Generation ───────────────────────────────────────

export async function generateAIPatch(candidate: PatchCandidate): Promise<GeneratedPatch> {
  const modelConfig = selectModel(candidate.category);
  const patchId = `patch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const prompt = buildPatchPrompt(candidate);

  try {
    const { data, error } = await supabase.functions.invoke('pf-evolution-patch', {
      body: {
        prompt,
        systemPrompt: PATCH_SYSTEM_PROMPT,
        model: modelConfig.primary,
        temperature: modelConfig.temperature,
        maxTokens: 2200,
        metadata: {
          category: 'evolution',
          taskType: 'code_patch',
          candidateId: candidate.id,
          patchId,
        },
      },
    });

    if (error) throw error;

    const parsed = parsePatchResponse(data?.content || data?.text || '');

    return {
      patchId,
      candidateId: candidate.id,
      category: candidate.category,
      title: candidate.title,
      changes: parsed.changes,
      model: data?.model || modelConfig.primary,
      tokensUsed: data?.tokensUsed || 0,
      estimatedCostUsd: typeof data?.estimatedCostUsd === 'number' ? data.estimatedCostUsd : undefined,
      confidence: parsed.confidence,
      estimatedImpact: parsed.impact,
      reasoning: parsed.reasoning,
      generatedAt: new Date().toISOString(),
      status: 'pending',
    };
  } catch (err) {
    console.error(`[AI-PATCH] Generation failed for ${candidate.id}:`, err);
    // Return a failed patch with explanation
    return {
      patchId,
      candidateId: candidate.id,
      category: candidate.category,
      title: candidate.title,
      changes: [],
      model: modelConfig.primary,
      tokensUsed: 0,
      estimatedCostUsd: 0,
      confidence: 0,
      estimatedImpact: { healthDelta: 0, debtReduction: 0, riskLevel: 'high' },
      reasoning: `Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      generatedAt: new Date().toISOString(),
      status: 'rejected',
    };
  }
}

// ── In-Memory Patch Store ──────────────────────────────────

const patchStore = new Map<string, GeneratedPatch>();

export function storePatch(patch: GeneratedPatch): void {
  patchStore.set(patch.patchId, patch);
}

export function getPatch(patchId: string): GeneratedPatch | undefined {
  return patchStore.get(patchId);
}

export function listPatches(status?: GeneratedPatch['status']): GeneratedPatch[] {
  const all = Array.from(patchStore.values());
  if (!status) return all.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  return all.filter(p => p.status === status).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

export function updatePatchStatus(patchId: string, status: GeneratedPatch['status']): boolean {
  const patch = patchStore.get(patchId);
  if (!patch) return false;
  patch.status = status;
  patchStore.set(patchId, patch);
  return true;
}

// ── Prompt Building ────────────────────────────────────────

const PATCH_SYSTEM_PROMPT = `You are a senior software engineer working on the CMPSBL substrate — a cognitive infrastructure substrate built with React, TypeScript, Tailwind CSS, and Supabase.

Your task is to generate precise, minimal code patches that fix issues or improve the codebase.

Rules:
1. Output changes in unified diff format
2. Explain your reasoning clearly
3. Minimize blast radius — touch only what's necessary
4. Follow existing patterns and conventions in the codebase
5. Never introduce new dependencies without explicit justification
6. Preserve all existing exports and public APIs
7. Use semantic design tokens, never hardcoded colors

Respond in this exact JSON format:
{
  "reasoning": "Brief explanation of the approach",
  "confidence": 0.0-1.0,
  "impact": { "healthDelta": number, "debtReduction": number, "riskLevel": "low|medium|high" },
  "changes": [
    {
      "filePath": "src/...",
      "operation": "modify|create|delete",
      "diff": "unified diff content",
      "explanation": "why this change"
    }
  ]
}`;

function buildPatchPrompt(candidate: PatchCandidate): string {
  const contextBlock = candidate.contextFiles?.length
    ? `\n\n## File Context\n${candidate.contextFiles
        .map(({ filePath, content }) => `### ${filePath}\n\n\
\
\

${content}`)
        .join('\n\n')}`
    : '';

  const constraintsBlock = candidate.constraints?.length
    ? `\n\n## Constraints\n${candidate.constraints.map((item) => `- ${item}`).join('\n')}`
    : '';

  return `## Patch Request

**Category:** ${candidate.category}
**Title:** ${candidate.title}
**Description:** ${candidate.description}
**Target Module:** ${candidate.targetModule}
**Target Files:** ${candidate.targetFiles.join(', ')}
**Severity:** ${candidate.severity}
**Source:** ${candidate.sourceScanner}

Generate a minimal, safe patch that addresses this issue. Focus on correctness and minimal blast radius.${constraintsBlock}${contextBlock}`;
}

// ── Response Parsing ───────────────────────────────────────

function parsePatchResponse(raw: string): {
  changes: PatchChange[];
  confidence: number;
  impact: GeneratedPatch['estimatedImpact'];
  reasoning: string;
} {
  try {
    // Try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        changes: (parsed.changes || []).map((c: Record<string, string>) => ({
          filePath: c.filePath || 'unknown',
          operation: c.operation || 'modify',
          diff: c.diff || '',
          explanation: c.explanation || '',
        })),
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        impact: {
          healthDelta: parsed.impact?.healthDelta || 0,
          debtReduction: parsed.impact?.debtReduction || 0,
          riskLevel: parsed.impact?.riskLevel || 'medium',
        },
        reasoning: parsed.reasoning || 'No reasoning provided',
      };
    }
  } catch {
    // Fall through to default
  }

  return {
    changes: [],
    confidence: 0,
    impact: { healthDelta: 0, debtReduction: 0, riskLevel: 'high' },
    reasoning: raw || 'Failed to parse AI response',
  };
}
