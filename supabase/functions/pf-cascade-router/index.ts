import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Capability definitions with routing logic
const CAPABILITIES = {
  // Circadian Intelligence v8.0 - Adaptive daily cycles
  'circadian_intelligence': {
    functions: ['pf-brain-circadian-orchestrator'],
    keywords: ['circadian', 'daily cycle', 'schedule', 'phase', 'state', 'rest', 'dream', 'learning phase', 'adaptive rhythm'],
    priority: 'high',
  },
  
  // Memory Echo Engine v7.0 + v7.3 Deep Echo Expansion
  'memory_echo': {
    functions: ['pf-brain-memory-echo'],
    keywords: ['memory', 'echo', 'temporal', 'delta', 'insight', 'emotional', 'weave', 'whisper', 'self-repair', 'reflection shroud', 'meta-learning', 'self-generated', 'theory'],
    priority: 'high',
  },
  'temporal_analysis': {
    functions: ['pf-brain-temporal-delta'],
    keywords: ['temporal', 'delta', 'change', 'evolution', 'pattern shift'],
    priority: 'high',
  },
  
  // Improv Cortex v6.0 - Adaptive intelligence
  'improv_cortex': {
    functions: ['pf-brain-improv-cortex'],
    keywords: ['improvise', 'adaptive', 'creative solution', 'uncertainty', 'incomplete', 'ambiguous', 'unknown'],
    priority: 'high',
  },
  'gap_bridge': {
    functions: ['pf-brain-gap-bridge'],
    keywords: ['missing data', 'incomplete', 'gap', 'conflicting', 'uncertain', 'speculate'],
    priority: 'high',
  },
  'concept_remix': {
    functions: ['pf-brain-concept-remix'],
    keywords: ['combine', 'merge', 'remix', 'hybrid', 'cross-domain', 'innovative', 'creative'],
    priority: 'high',
  },
  'role_shift': {
    functions: ['pf-brain-role-shift'],
    keywords: ['perspective', 'viewpoint', 'expert', 'lens', 'different angle', 'stakeholder'],
    priority: 'high',
  },
  'flowchain': {
    functions: ['pf-brain-flowchain'],
    keywords: ['roadmap', 'plan', 'steps', 'procedure', 'workflow', 'process', 'phases'],
    priority: 'high',
  },
  
  // Operational Intelligence v5.0 - Advanced reasoning suite
  'operational_intelligence': {
    functions: ['pf-brain-operational-suite'],
    keywords: ['complex', 'system', 'ethical', 'analyze deeply', 'comprehensive', 'strategic', 'pattern'],
    priority: 'high',
  },
  
  // Cognitive v4.0 - Enhanced reasoning
  'cognitive_reasoning': {
    functions: ['pf-brain-cognitive-cycle'],
    keywords: ['think', 'reason', 'analyze', 'plan', 'strategize', 'solve'],
    priority: 'high',
  },
  
  // Emotional Intelligence
  'emotional_intelligence': {
    functions: ['pf-brain-emotional-model'],
    keywords: ['tone', 'urgent', 'frustrated', 'confused', 'empathy', 'feeling'],
    priority: 'high',
  },
  
  // Creative generation
  'image_generation': {
    functions: ['pf-nexus-image'],
    keywords: ['image', 'picture', 'photo', 'visual', 'draw', 'design', 'logo', 'icon'],
    priority: 'high',
  },
  'video_generation': {
    functions: ['pf-nexus-video'],
    keywords: ['video', 'animation', 'clip', 'motion', 'movie'],
    priority: 'high',
  },
  'text_generation': {
    functions: ['pf-nexus-text'],
    keywords: ['write', 'copy', 'content', 'article', 'blog', 'story'],
    priority: 'medium',
  },
  
  // Technical capabilities
  'code_generation': {
    functions: ['pf-studio-build'],
    keywords: ['code', 'function', 'debug', 'refactor', 'build', 'develop'],
    priority: 'high',
  },
  
  // Research & intelligence
  'deep_research': {
    functions: ['pf-research-deepreach', 'pf-brain-auto-research'],
    keywords: ['research', 'analyze', 'investigate', 'trend', 'market', 'data'],
    priority: 'medium',
  },
  
  // Learning & knowledge
  'knowledge_ingestion': {
    functions: ['pf-brain-learn', 'pf-brain-ingest-global'],
    keywords: ['learn', 'remember', 'store', 'knowledge', 'train'],
    priority: 'medium',
  },
  
  // Security & auditing
  'security_audit': {
    functions: ['pf-access-scan', 'pf-defense-diagnostics'],
    keywords: ['audit', 'security', 'scan', 'vulnerability', 'check'],
    priority: 'low',
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { intent, parameters = {}, user_message } = await req.json();

    console.log('🧠 Cascade Router analyzing intent:', intent);

    // Analyze intent and select best capability
    const selectedCapability = await analyzeIntent(intent, user_message);
    
    if (!selectedCapability) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unable to determine capability for this request',
          suggestion: 'Please rephrase your request more specifically'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Selected capability: ${selectedCapability.name}`);
    console.log(`📞 Will invoke: ${selectedCapability.functions.join(', ')}`);

    // Log routing decision
    await supabase.from('brain_events').insert({
      module: 'cascade',
      event_type: 'capability_routing',
      data: {
        intent,
        selected_capability: selectedCapability.name,
        functions: selectedCapability.functions,
        parameters,
        confidence: selectedCapability.confidence,
      },
      outcome: 'routed',
    });

    // Execute the selected function(s)
    const results = await executeCapability(supabase, selectedCapability, parameters);

    return new Response(
      JSON.stringify({ 
        success: true, 
        capability: selectedCapability.name,
        functions_invoked: selectedCapability.functions,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Cascade router error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeIntent(intent: string, userMessage: string): Promise<any> {
  const text = `${intent} ${userMessage}`.toLowerCase();
  
  // Score each capability based on keyword matching
  const scores = Object.entries(CAPABILITIES).map(([name, capability]) => {
    const keywordMatches = capability.keywords.filter(kw => text.includes(kw)).length;
    const priorityBoost = capability.priority === 'high' ? 0.2 : capability.priority === 'medium' ? 0.1 : 0;
    
    return {
      name,
      ...capability,
      confidence: Math.min(keywordMatches * 0.3 + priorityBoost, 1.0),
    };
  });

  // Return highest scoring capability
  scores.sort((a, b) => b.confidence - a.confidence);
  
  return scores[0].confidence > 0 ? scores[0] : null;
}

async function executeCapability(supabase: any, capability: any, parameters: Record<string, any>) {
  const results = [];
  
  for (const functionName of capability.functions) {
    console.log(`⚡ Invoking ${functionName}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: parameters,
      });
      
      if (error) throw error;
      
      results.push({
        function: functionName,
        success: true,
        data,
      });
    } catch (error) {
      console.error(`Failed to invoke ${functionName}:`, error);
      results.push({
        function: functionName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return results;
}
