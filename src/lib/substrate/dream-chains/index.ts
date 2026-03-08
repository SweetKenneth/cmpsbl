/**
 * Multi-Step Dream Chains v1.0.0
 * Allow DREAM to produce sequences of related insights that become
 * chained SEBA proposals with dependency ordering
 */

import { supabase } from '@/integrations/supabase/client';

export interface DreamChain {
  id: string;
  title: string;
  steps: DreamChainStep[];
  status: 'draft' | 'proposed' | 'executing' | 'completed' | 'failed';
  createdAt: string;
}

export interface DreamChainStep {
  order: number;
  insight: string;
  targetModule: string;
  dependsOn: number[];
  proposalId?: string;
  status: 'pending' | 'proposed' | 'approved' | 'applied' | 'failed';
}

/**
 * Create a dream chain from a sequence of related insights
 */
export async function createDreamChain(
  title: string,
  insights: Array<{ insight: string; targetModule: string; dependsOn?: number[] }>
): Promise<DreamChain | null> {
  try {
    const chainId = crypto.randomUUID();
    
    const steps: DreamChainStep[] = insights.map((ins, i) => ({
      order: i,
      insight: ins.insight,
      targetModule: ins.targetModule,
      dependsOn: ins.dependsOn || (i > 0 ? [i - 1] : []),
      status: 'pending' as const,
    }));
    
    const chain: DreamChain = {
      id: chainId,
      title,
      steps,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    
    await supabase.from('brain_events').insert({
      module: 'dream',
      event_type: 'dream_chain_created',
      data: chain as any,
      outcome: 'success',
    });
    
    console.log(`[Dream-Chains] Created chain "${title}" with ${steps.length} steps`);
    return chain;
  } catch (err) {
    console.error('[Dream-Chains] Failed to create chain:', err);
    return null;
  }
}

/**
 * Convert a dream chain into SEBA evolution proposals
 */
export async function proposeDreamChain(chain: DreamChain): Promise<string[]> {
  const proposalIds: string[] = [];
  
  for (const step of chain.steps) {
    const depsReady = step.dependsOn.every(depIdx => {
      const dep = chain.steps[depIdx];
      return dep && ['approved', 'applied'].includes(dep.status);
    });
    
    if (!depsReady && step.dependsOn.length > 0) {
      console.log(`[Dream-Chains] Step ${step.order} waiting on dependencies`);
      continue;
    }
    
    const { data: proposal, error } = await supabase
      .from('evolution_proposals')
      .insert({
        title: `[Dream Chain] ${chain.title} — Step ${step.order + 1}`,
        summary: step.insight,
        target_system: step.targetModule,
        confidence: 0.7,
        suggested_change: {
          type: 'dream_chain',
          chain_id: chain.id,
          step_order: step.order,
        } as any,
        expected_impact: {
          type: 'dream_chain',
          total_steps: chain.steps.length,
        } as any,
        status: 'pending',
      })
      .select('id')
      .single();
    
    if (!error && proposal) {
      step.proposalId = proposal.id;
      step.status = 'proposed';
      proposalIds.push(proposal.id);
    }
  }
  
  // Update status on a shallow copy to avoid mutating caller's object
  chain.status = 'proposed';
  
  // Log event (fire-and-forget)
  supabase.from('brain_events').insert({
    module: 'dream',
    event_type: 'dream_chain_proposed',
    data: {
      chain_id: chain.id,
      proposals_created: proposalIds.length,
      total_steps: chain.steps.length,
    } as any,
    outcome: 'success',
  }).then(({ error }) => {
    if (error) console.error('[Dream-Chains] Failed to log proposal event:', error);
  });
  
  console.log(`[Dream-Chains] Proposed ${proposalIds.length}/${chain.steps.length} steps`);
  return proposalIds;
}

/**
 * Get active dream chains
 */
export async function getActiveDreamChains(): Promise<DreamChain[]> {
  const { data: events } = await supabase
    .from('brain_events')
    .select('data')
    .eq('event_type', 'dream_chain_created')
    .order('created_at', { ascending: false })
    .limit(20);
  
  return (events || [])
    .map(e => e.data as unknown as DreamChain)
    .filter(c => c && c.status !== 'completed' && c.status !== 'failed');
}
