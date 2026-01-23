// ================================================
// pf-templates - Developer Templates Module
// Starter kits for Gaming & App Developers
// ================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params } = await req.json();
    let result: any;

    switch (action) {
      case 'pulse':
      case 'status': {
        const { count } = await supabase
          .from('developer_templates')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        
        result = {
          active: true,
          module: 'templates',
          version: '1.0.0',
          template_count: count || 0,
          categories: ['gaming', 'chatbot', 'agent', 'rag', 'world_engine', 'utility']
        };
        break;
      }

      case 'list': {
        const { category, featured_only, difficulty } = params;
        
        let query = supabase
          .from('developer_templates')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('install_count', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }
        if (featured_only) {
          query = query.eq('is_featured', true);
        }
        if (difficulty) {
          query = query.eq('difficulty', difficulty);
        }

        const { data, error } = await query;
        if (error) throw error;

        result = { templates: data || [] };
        break;
      }

      case 'get': {
        const { slug, id } = params;
        
        let query = supabase
          .from('developer_templates')
          .select('*')
          .eq('is_active', true);

        if (slug) {
          query = query.eq('slug', slug);
        } else if (id) {
          query = query.eq('id', id);
        } else {
          throw new Error('slug or id required');
        }

        const { data, error } = await query.single();
        if (error) throw error;

        result = { template: data };
        break;
      }

      case 'install': {
        const { slug, developer_id, app_id } = params;
        
        if (!slug || !developer_id) {
          throw new Error('slug and developer_id required');
        }

        // Get template
        const { data: template, error: templateError } = await supabase
          .from('developer_templates')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (templateError || !template) {
          throw new Error('Template not found');
        }

        // Increment install count
        await supabase
          .from('developer_templates')
          .update({ install_count: template.install_count + 1 })
          .eq('id', template.id);

        // Return installation package
        result = {
          installed: true,
          template: {
            name: template.name,
            slug: template.slug,
            category: template.category
          },
          config: template.default_config,
          required_modules: template.required_modules,
          setup_instructions: generateSetupInstructions(template),
          sdk_code: generateSDKCode(template)
        };
        break;
      }

      case 'categories': {
        const { data, error } = await supabase
          .from('developer_templates')
          .select('category')
          .eq('is_active', true);

        if (error) throw error;

        const categoryCounts = (data || []).reduce((acc: Record<string, number>, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {});

        result = {
          categories: [
            { id: 'gaming', name: 'Gaming', count: categoryCounts['gaming'] || 0, icon: '🎮' },
            { id: 'world_engine', name: 'World Engine', count: categoryCounts['world_engine'] || 0, icon: '🌍' },
            { id: 'chatbot', name: 'Chatbot', count: categoryCounts['chatbot'] || 0, icon: '💬' },
            { id: 'agent', name: 'AI Agent', count: categoryCounts['agent'] || 0, icon: '🤖' },
            { id: 'rag', name: 'RAG Pipeline', count: categoryCounts['rag'] || 0, icon: '📚' },
            { id: 'utility', name: 'Utility', count: categoryCounts['utility'] || 0, icon: '🔧' }
          ]
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        module: 'templates',
        action,
        latency_ms: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        module: 'templates',
        latency_ms: Date.now() - startTime
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSetupInstructions(template: any): string[] {
  const instructions = [
    `1. Install the promptfluid SDK: npm install @promptfluid/sdk`,
    `2. Initialize with your API key`,
    `3. Enable required modules: ${template.required_modules.join(', ')}`
  ];

  if (template.category === 'gaming') {
    instructions.push(
      `4. Create NPC entities with brain.remember()`,
      `5. Use decode.chat() for NPC dialogue`,
      `6. Enable dream.cycle() for offline learning`
    );
  } else if (template.category === 'chatbot') {
    instructions.push(
      `4. Set up conversation context with brain.remember()`,
      `5. Use decode.chat() for user interactions`,
      `6. Configure rate limiting with access module`
    );
  } else if (template.category === 'world_engine') {
    instructions.push(
      `4. Initialize world state with brain module`,
      `5. Set up NPC registry and faction systems`,
      `6. Configure ripple for event propagation`,
      `7. Enable vision for world monitoring`
    );
  }

  return instructions;
}

function generateSDKCode(template: any): string {
  const modules = template.required_modules;
  
  if (template.category === 'gaming' || template.slug === 'npc-brain') {
    return `import { SubstrateClient } from '@promptfluid/sdk';

const substrate = new SubstrateClient({
  apiKey: process.env.PROMPTFLUID_API_KEY,
  config: ${JSON.stringify(template.default_config, null, 2)}
});

// Store NPC memory
await substrate.brain.remember({
  content: 'Player helped me find my lost cat',
  memory_type: 'interaction',
  entity_id: 'npc_guard_001',
  metadata: { player_id: 'player_123', sentiment: 'grateful' }
});

// NPC dialogue with context
const response = await substrate.decode.chat({
  message: 'Hello guard, how are you?',
  context: { npc_id: 'npc_guard_001', player_id: 'player_123' }
});

// Trigger dream cycle (call during idle/night)
await substrate.dream.cycle({ entity_id: 'npc_guard_001' });`;
  }

  if (template.category === 'world_engine') {
    return `import { SubstrateClient } from '@promptfluid/sdk';

const substrate = new SubstrateClient({
  apiKey: process.env.PROMPTFLUID_API_KEY,
  config: ${JSON.stringify(template.default_config, null, 2)}
});

// Initialize world state
await substrate.brain.remember({
  content: 'The kingdom is at war with the northern tribes',
  memory_type: 'world_state',
  metadata: { faction: 'kingdom', event_type: 'conflict' }
});

// Propagate world event to all NPCs
await substrate.ripple.publish({
  event_type: 'world.event',
  payload: { 
    event: 'dragon_attack', 
    location: 'village_east',
    affected_npcs: ['npc_001', 'npc_002', 'npc_003']
  }
});

// Monitor world health
const health = await substrate.vision.health();`;
  }

  if (template.category === 'chatbot') {
    return `import { SubstrateClient } from '@promptfluid/sdk';

const substrate = new SubstrateClient({
  apiKey: process.env.PROMPTFLUID_API_KEY,
  config: ${JSON.stringify(template.default_config, null, 2)}
});

// Chat with memory
const response = await substrate.decode.chat({
  message: userMessage,
  user_id: 'user_123',
  remember: true  // Automatically stores conversation
});

// Query past interactions
const memories = await substrate.brain.query({
  query: 'What did this user ask about before?',
  filters: { user_id: 'user_123' }
});`;
  }

  // Default code
  return `import { SubstrateClient } from '@promptfluid/sdk';

const substrate = new SubstrateClient({
  apiKey: process.env.PROMPTFLUID_API_KEY,
  config: ${JSON.stringify(template.default_config, null, 2)}
});

// Use required modules: ${modules.join(', ')}
const status = await substrate.core.status();
console.log('Substrate ready:', status);`;
}
