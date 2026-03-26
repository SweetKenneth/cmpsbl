/**
 * Feature Suggestion Engine — Autonomous discovery of new functions & features
 * Routes through NEXUS free-tier fleet (≤$0.05/run)
 * 
 * Analyzes codebase patterns, telemetry gaps, and substrate topology
 * to propose new functions, resolvers, hooks, and UI features.
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────────

export type SuggestionCategory = 
  | 'resolver'     // New node resolver
  | 'hook'         // New React hook
  | 'edge-function'// New backend function
  | 'ui-feature'   // New dashboard/page/component
  | 'integration'  // New external integration
  | 'optimization' // Performance/architecture improvement
  ;

export interface FeatureSuggestion {
  id: string;
  category: SuggestionCategory;
  title: string;
  description: string;
  rationale: string;
  targetModule: string;
  estimatedEffort: 'trivial' | 'small' | 'medium' | 'large';
  impactScore: number;       // 0-1
  noveltyScore: number;      // 0-1
  feasibilityScore: number;  // 0-1
  compositeScore: number;    // weighted blend
  suggestedFiles: string[];
  dependencies: string[];
  generatedAt: string;
  status: 'new' | 'accepted' | 'deferred' | 'rejected';
  model: string;
}

// ── System Context Prompts ─────────────────────────────────

const SUGGESTION_SYSTEM_PROMPT = `You are a senior software architect analyzing the CMPSBL cognitive operating system — a React/TypeScript/Tailwind/Supabase platform with 27+ substrate nodes (BRAIN, MEMORY, CORTEX, DEFENSE, ORACLE, EVOLUTION, etc.).

Your task is to suggest NEW functions, features, resolvers, or capabilities that would meaningfully extend the system.

Focus areas:
- Missing resolvers that nodes should expose
- Hooks that would simplify common patterns
- Dashboard features that surface buried telemetry
- Cross-node integrations that create emergent capabilities
- Edge functions for autonomous background processing
- Performance optimizations with measurable impact

Rules:
1. Suggestions must be actionable and specific (file paths, function signatures)
2. Must not duplicate existing capabilities
3. Prefer composable, small additions over monolithic features
4. Every suggestion needs a clear rationale tied to system health or capability

Respond in this exact JSON format:
{
  "suggestions": [
    {
      "category": "resolver|hook|edge-function|ui-feature|integration|optimization",
      "title": "Short descriptive name",
      "description": "What it does (2-3 sentences)",
      "rationale": "Why the system needs this now",
      "targetModule": "NODE_NAME",
      "estimatedEffort": "trivial|small|medium|large",
      "impactScore": 0.0-1.0,
      "noveltyScore": 0.0-1.0,
      "feasibilityScore": 0.0-1.0,
      "suggestedFiles": ["src/..."],
      "dependencies": ["existing-module-or-lib"]
    }
  ]
}`;

// ── Context Gathering ──────────────────────────────────────

async function gatherSystemContext(): Promise<string> {
  const contextParts: string[] = [];

  // Recent evolution runs
  try {
    const { data: runs } = await supabase
      .from('evolution_runs')
      .select('title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (runs?.length) {
      contextParts.push(`Recent evolution runs:\n${runs.map(r => `- ${r.title} (${r.status})`).join('\n')}`);
    }
  } catch { /* non-critical */ }

  // Recent mesh communications (system activity)
  try {
    const { data: comms } = await supabase
      .from('mesh_comms')
      .select('source_module, target_module, category, raw_signal')
      .order('created_at', { ascending: false })
      .limit(20);
    if (comms?.length) {
      const modules = new Set(comms.flatMap(c => [c.source_module, c.target_module].filter(Boolean)));
      contextParts.push(`Active modules: ${[...modules].join(', ')}`);
      const categories = new Set(comms.map(c => c.category).filter(Boolean));
      contextParts.push(`Signal categories: ${[...categories].join(', ')}`);
    }
  } catch { /* non-critical */ }

  // Analytics health
  try {
    const { data: snapshots } = await supabase
      .from('analytics_snapshots')
      .select('health_score, error_rate, active_modules')
      .order('created_at', { ascending: false })
      .limit(1);
    if (snapshots?.[0]) {
      const s = snapshots[0];
      contextParts.push(`System health: ${s.health_score}%, error rate: ${s.error_rate}%, active modules: ${s.active_modules}`);
    }
  } catch { /* non-critical */ }

  return contextParts.join('\n\n') || 'No telemetry context available — suggest based on general substrate architecture.';
}

// ── Generation ─────────────────────────────────────────────

export async function generateSuggestions(focusArea?: string): Promise<FeatureSuggestion[]> {
  const context = await gatherSystemContext();
  
  const userPrompt = `## System Context
${context}

${focusArea ? `## Focus Area\n${focusArea}\n` : ''}
## Task
Suggest 3-5 new functions, features, or capabilities that would meaningfully improve this system. Prioritize practical, implementable additions over speculative ideas.`;

  try {
    const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
      body: {
        action: 'generate',
        model: 'groq/llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SUGGESTION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 3000,
        metadata: {
          category: 'evolution',
          subtype: 'feature_suggestion',
        },
      },
    });

    if (error) throw error;

    const raw = data?.content || data?.text || '';
    return parseSuggestions(raw);
  } catch (err) {
    console.error('[SUGGESTION-ENGINE] Generation failed:', err);
    return [];
  }
}

// ── Parsing ────────────────────────────────────────────────

function parseSuggestions(raw: string): FeatureSuggestion[] {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    const suggestions = parsed.suggestions || [];

    return suggestions.map((s: Record<string, unknown>, i: number) => {
      const impact = typeof s.impactScore === 'number' ? s.impactScore : 0.5;
      const novelty = typeof s.noveltyScore === 'number' ? s.noveltyScore : 0.5;
      const feasibility = typeof s.feasibilityScore === 'number' ? s.feasibilityScore : 0.5;

      return {
        id: `sug-${Date.now()}-${i}`,
        category: s.category || 'optimization',
        title: s.title || 'Untitled Suggestion',
        description: s.description || '',
        rationale: s.rationale || '',
        targetModule: s.targetModule || 'CORE',
        estimatedEffort: s.estimatedEffort || 'medium',
        impactScore: impact,
        noveltyScore: novelty,
        feasibilityScore: feasibility,
        compositeScore: (impact * 0.4) + (novelty * 0.25) + (feasibility * 0.35),
        suggestedFiles: Array.isArray(s.suggestedFiles) ? s.suggestedFiles : [],
        dependencies: Array.isArray(s.dependencies) ? s.dependencies : [],
        generatedAt: new Date().toISOString(),
        status: 'new' as const,
        model: 'groq/llama-3.3-70b-versatile',
      };
    }).sort((a: FeatureSuggestion, b: FeatureSuggestion) => b.compositeScore - a.compositeScore);
  } catch {
    return [];
  }
}

// ── In-Memory Store ────────────────────────────────────────

const suggestionStore = new Map<string, FeatureSuggestion>();

export function storeSuggestion(s: FeatureSuggestion): void {
  suggestionStore.set(s.id, s);
}

export function storeSuggestions(items: FeatureSuggestion[]): void {
  items.forEach(s => suggestionStore.set(s.id, s));
}

export function listSuggestions(status?: FeatureSuggestion['status']): FeatureSuggestion[] {
  const all = Array.from(suggestionStore.values());
  const filtered = status ? all.filter(s => s.status === status) : all;
  return filtered.sort((a, b) => b.compositeScore - a.compositeScore);
}

export function updateSuggestionStatus(id: string, status: FeatureSuggestion['status']): boolean {
  const s = suggestionStore.get(id);
  if (!s) return false;
  s.status = status;
  suggestionStore.set(id, s);
  return true;
}

export function getSuggestion(id: string): FeatureSuggestion | undefined {
  return suggestionStore.get(id);
}
