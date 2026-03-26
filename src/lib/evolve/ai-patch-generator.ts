/**
 * AI Patch Generator — NEXUS-powered code patch proposals
 * Routes through NEXUS free-tier fleet (≤$0.05/run, zero Lovable AI)
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

/** Cost ceiling: ≤$0.05 per evolution run. All models route through NEXUS free-tier fleet. */
export const EVOLUTION_COST_CEILING = 0.05;

const MODEL_MAP: Record<PatchCategory, { primary: string; fallback: string; temperature: number }> = {
  security: { primary: 'groq/llama-3.3-70b-versatile',   fallback: 'cerebras/llama3.1-8b',          temperature: 0.05 },
  fix:      { primary: 'groq/llama-3.3-70b-versatile',   fallback: 'groq/llama-3.1-8b-instant',     temperature: 0.10 },
  refactor: { primary: 'cerebras/llama3.1-8b',           fallback: 'groq/llama-3.1-8b-instant',     temperature: 0.15 },
  optimize: { primary: 'groq/llama-3.1-8b-instant',      fallback: 'cerebras/llama3.1-8b',          temperature: 0.10 },
  feature:  { primary: 'groq/llama-3.3-70b-versatile',   fallback: 'deepseek/deepseek-chat',        temperature: 0.25 },
  suggest:  { primary: 'groq/llama-3.3-70b-versatile',   fallback: 'cerebras/llama3.1-8b',          temperature: 0.35 },
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
    // Call through NEXUS router edge function
    const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
      body: {
        action: 'generate',
        model: modelConfig.primary,
        messages: [
          { role: 'system', content: PATCH_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: modelConfig.temperature,
        max_tokens: 4096,
        metadata: {
          category: 'evolution',
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
      model: modelConfig.primary,
      tokensUsed: data?.usage?.total_tokens || 0,
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

const PATCH_SYSTEM_PROMPT = `You are a senior software engineer working on the CMPSBL substrate — a cognitive operating system built with React, TypeScript, Tailwind CSS, and Supabase.

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
  return `## Patch Request

**Category:** ${candidate.category}
**Title:** ${candidate.title}
**Description:** ${candidate.description}
**Target Module:** ${candidate.targetModule}
**Target Files:** ${candidate.targetFiles.join(', ')}
**Severity:** ${candidate.severity}
**Source:** ${candidate.sourceScanner}

Generate a minimal, safe patch that addresses this issue. Focus on correctness and minimal blast radius.`;
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
