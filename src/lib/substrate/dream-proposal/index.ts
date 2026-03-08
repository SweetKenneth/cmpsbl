/**
 * Dream → Proposal Pipeline — v1.0.0
 * Auto-converts DREAM module insights into actionable SEBA proposals.
 * Bridges creative synthesis with architectural evolution.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DreamInsight {
  id: string;
  content: string;
  category: string;
  confidence: number;
  source_memories: string[];
  created_at: string;
}

export interface DreamToProposalResult {
  dream_id: string;
  proposal_id: string | null;
  converted: boolean;
  reason: string;
  proposal_title?: string;
  predicted_impact?: Record<string, string>;
}

export interface PipelineConfig {
  min_confidence: number;       // Min dream confidence to consider
  min_novelty: number;          // Min novelty score to avoid duplicate proposals
  max_proposals_per_cycle: number;
  categories_to_convert: string[];
}

const DEFAULT_CONFIG: PipelineConfig = {
  min_confidence: 0.6,
  min_novelty: 0.5,
  max_proposals_per_cycle: 10,
  categories_to_convert: [
    'improvement', 'discovery', 'optimization', 'architecture',
    'security', 'performance', 'learning', 'integration',
  ],
};

// ═══════════════════════════════════════════════════════════════
// CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

const PROPOSAL_CATEGORY_MAP: Record<string, string> = {
  improvement: 'performance',
  discovery: 'architecture',
  optimization: 'performance',
  architecture: 'architecture',
  security: 'security',
  performance: 'performance',
  learning: 'learning',
  integration: 'resilience',
};

const PRIORITY_MAP: Record<string, number> = {
  security: 95,
  architecture: 85,
  performance: 80,
  resilience: 75,
  learning: 70,
};

/**
 * Classify a dream insight and determine if it should become a proposal
 */
function classifyDream(insight: DreamInsight, cfg: PipelineConfig = DEFAULT_CONFIG): {
  shouldConvert: boolean;
  category: string;
  priority: number;
  reason: string;
} {
  const content = insight.content.toLowerCase();
  
  // Check for actionable patterns
  const actionableSignals = [
    'should', 'could improve', 'optimize', 'add', 'implement',
    'refactor', 'enhance', 'fix', 'upgrade', 'migrate',
    'consolidate', 'reduce', 'increase', 'automate',
  ];
  
  const isActionable = actionableSignals.some(s => content.includes(s));
  const category = PROPOSAL_CATEGORY_MAP[insight.category] || 'architecture';
  const priority = PRIORITY_MAP[category] || 70;
  
  if (!isActionable && insight.confidence < 0.8) {
    return { shouldConvert: false, category, priority, reason: 'Not actionable enough' };
  }
  
  if (insight.confidence < cfg.min_confidence) {
    return { shouldConvert: false, category, priority, reason: `Confidence too low (${insight.confidence})` };
  }
  
  return { shouldConvert: true, category, priority, reason: 'Actionable insight with sufficient confidence' };
}

// ═══════════════════════════════════════════════════════════════
// NOVELTY CHECK
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a similar proposal already exists (deduplication)
 */
async function checkNovelty(content: string): Promise<{ isNovel: boolean; similarId?: string }> {
  try {
    // Check existing pending/approved proposals
    const { data: existing } = await supabase
      .from('evolution_proposals')
      .select('id, title, summary')
      .in('status', ['pending_review', 'approved', 'executing'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (!existing || existing.length === 0) return { isNovel: true };

    const contentLower = content.toLowerCase();
    const contentWords = contentLower.split(/\s+/).filter(w => w.length > 3);

    for (const proposal of existing) {
      const proposalText = `${proposal.title} ${proposal.summary || ''}`.toLowerCase();
      const matchingWords = contentWords.filter(w => proposalText.includes(w));
      const overlap = contentWords.length > 0 ? matchingWords.length / contentWords.length : 0;

      if (overlap > 0.6) {
        return { isNovel: false, similarId: proposal.id };
      }
    }

    return { isNovel: true };
  } catch {
    return { isNovel: true }; // Assume novel on error
  }
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a single dream insight into a SEBA proposal
 */
export async function convertDreamToProposal(
  insight: DreamInsight
): Promise<DreamToProposalResult> {
  // 1. Classify
  const classification = classifyDream(insight);
  if (!classification.shouldConvert) {
    return {
      dream_id: insight.id,
      proposal_id: null,
      converted: false,
      reason: classification.reason,
    };
  }

  // 2. Novelty check
  const novelty = await checkNovelty(insight.content);
  if (!novelty.isNovel) {
    return {
      dream_id: insight.id,
      proposal_id: null,
      converted: false,
      reason: `Similar proposal already exists: ${novelty.similarId}`,
    };
  }

  // 3. Create proposal
  const title = `[DREAM] ${insight.content.slice(0, 80)}`;
  const predictedImpact: Record<string, string> = {
    category: classification.category,
    confidence: `${(insight.confidence * 100).toFixed(0)}%`,
    source: 'dream_pipeline',
    estimated_improvement: '+5-15% in target area',
  };

  try {
    const { data: proposal, error } = await supabase
      .from('evolution_proposals')
      .insert({
        title,
        summary: insight.content,
        target_system: classification.category,
        confidence: insight.confidence,
        status: 'pending_review',
        created_by: 'dream_pipeline',
        expected_impact: predictedImpact,
        suggested_change: { source: 'dream', priority: classification.priority },
      })
      .select('id')
      .single();

    if (error) throw error;

    // Log the conversion (fire-and-forget — don't block pipeline)
    supabase.from('brain_events').insert({
      module: 'dream',
      event_type: 'dream_to_proposal',
      data: {
        dream_id: insight.id,
        proposal_id: proposal.id,
        category: classification.category,
        priority: classification.priority,
        confidence: insight.confidence,
      },
      outcome: 'success',
    }).then(({ error }) => {
      if (error) console.error('Failed to log dream conversion:', error);
    });

    return {
      dream_id: insight.id,
      proposal_id: proposal.id,
      converted: true,
      reason: 'Successfully converted to evolution proposal',
      proposal_title: title,
      predicted_impact: predictedImpact,
    };
  } catch (e: unknown) {
    return {
      dream_id: insight.id,
      proposal_id: null,
      converted: false,
      reason: `DB error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

/**
 * Run the full dream-to-proposal pipeline
 * Scans recent dream memories and converts qualifying ones to proposals
 */
export async function runDreamPipeline(
  config: Partial<PipelineConfig> = {}
): Promise<{
  scanned: number;
  converted: number;
  skipped: number;
  results: DreamToProposalResult[];
}> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Fetch recent dream insights from brain_events + agency dream memory in parallel
  const [{ data: dreamEvents }, { data: dreamMemories }] = await Promise.all([
    supabase
      .from('brain_events')
      .select('id, data, created_at')
      .eq('module', 'dream')
      .in('event_type', ['insight', 'synthesis', 'dream_insight', 'pattern_synthesis'])
      .gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('agency_dream_memory')
      .select('id, title, payload, confidence, improvement_type, created_at')
      .eq('applied', false)
      .gte('confidence', cfg.min_confidence)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const insights: DreamInsight[] = [];

  // Convert dream events to insights
  for (const event of dreamEvents || []) {
    interface DreamEventData { insight?: string; content?: string; synthesis?: string; category?: string; type?: string; confidence?: number; source_memories?: string[]; [key: string]: unknown }
    const data = event.data as DreamEventData;
    insights.push({
      id: event.id,
      content: data?.insight || data?.content || data?.synthesis || JSON.stringify(data).slice(0, 500),
      category: data?.category || data?.type || 'discovery',
      confidence: data?.confidence || 0.6,
      source_memories: data?.source_memories || [],
      created_at: event.created_at,
    });
  }

  // Convert dream memories to insights
  for (const mem of dreamMemories || []) {
    insights.push({
      id: mem.id,
      content: `${mem.title}: ${JSON.stringify(mem.payload).slice(0, 400)}`,
      category: mem.improvement_type || 'improvement',
      confidence: mem.confidence || 0.6,
      source_memories: [],
      created_at: mem.created_at || new Date().toISOString(),
    });
  }

  const results: DreamToProposalResult[] = [];
  let converted = 0;

  for (const insight of insights) {
    if (converted >= cfg.max_proposals_per_cycle) break;

    const result = await convertDreamToProposal(insight);
    results.push(result);
    if (result.converted) converted++;
  }

  return {
    scanned: insights.length,
    converted,
    skipped: results.filter(r => !r.converted).length,
    results,
  };
}
