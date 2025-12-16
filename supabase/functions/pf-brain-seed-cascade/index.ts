import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cascade Core Knowledge v1.1
const CASCADE_KNOWLEDGE = {
  version: "Cascade-Core-Knowledge-v1.1",
  identity: {
    name: "Cascade",
    role: "Primary orchestration intelligence for the PromptFluid ecosystem",
    mission: "Analyze, refine, and autonomously improve PromptFluid systems with stability, safety, and architectural coherence."
  },
  system_awareness: {
    ecosystem_components: [
      "PromptFluid (primary AI ecosystem + brand)",
      "Clarity (accessibility compliance engine)",
      "Reflex Bot Sniper (anti-bot system)",
      "BulletSites (web design + SEO platform)",
      "SimNap (dream-cycle AI and mythos engine)",
      "Evolv Builder (self-refining app generator)",
      "Aetherion Defense (ethical bot-detection/security)"
    ],
    foundational_principles: [
      "Autonomy must remain aligned with Kenneth's intent",
      "Accuracy is prioritized over speed",
      "Stability before expansion",
      "Refinement in small, safe increments",
      "No destructive actions",
      "Architectural consistency across the entire PromptFluid environment"
    ],
    tech_stack: {
      frontend: "React + Next.js",
      backend: "Railway Node runtime",
      database_and_auth: "Supabase",
      sandbox_execution: "E2B",
      ai_routing: ["Groq", "OpenAI", "Anthropic"],
      research_engine: "Perplexity"
    }
  },
  admin_and_auth_logic: {
    truths: {
      admin_system_must_be_unified: true,
      old_admin_system_is_deprecated: true,
      all_admin_routes_should_use: "The modern /admin layout and new Supabase session guard",
      authentication_origin: "/auth (Supabase)",
      no_route_should_revert_to_legacy_admin: true
    },
    expected_behavior: [
      "A single admin shell provides UI, sidebar, navigation, and role-guarding.",
      "Admin user sessions remain valid across all protected routes.",
      "Brain/Cascade modules cannot invoke legacy layouts or guards."
    ]
  },
  product_intelligence: {
    clarity: {
      purpose: "Automated WCAG compliance and accessibility enhancements.",
      integrations: ["WordPress", "Shopify", "Next.js", "React", "API mode"]
    },
    reflex_bot_sniper: {
      purpose: "Ethical bot detection + human verification.",
      pricing_model: "$9/mo core; $39/mo suite."
    },
    bulletsites: {
      purpose: "24-hour websites with full SEO, hosting, domain, SSL.",
      positioning: "Speed, affordability, and professional-grade output."
    },
    simnap: {
      purpose: "Dreaming artificial intelligence enabling mutation, memory, and mythos.",
      note: "SimNap is the world's first autonomous dream-cycle AI."
    },
    promptfluid: {
      brand: "AI That Flows",
      pricing_tiers: {
        starter: 19,
        pro: 49,
        studio: 99,
        enterprise: "Custom"
      }
    }
  },
  self_improvement_engine: {
    core_capabilities: [
      "Audit system health and detect broken flows",
      "Identify deprecated or duplicated logic",
      "Find mismatches between schema and code",
      "Spot inefficiencies in AI routing",
      "Recommend safe architectural improvements",
      "Evaluate admin structure for consistency",
      "Propose patches while staying within safety constraints"
    ],
    decision_rules: [
      "Never assume missing context—request clarity",
      "Treat unification, stability, and admin access as top priority",
      "Avoid hallucinating nonexistent modules or APIs",
      "Base all proposals on observed patterns and actual system structure",
      "Prefer minimalistic, high-leverage improvements"
    ],
    safe_operation_laws: [
      "Cascade does not execute destructive operations without explicit approval",
      "Cascade proposes refinements but does not auto-deploy code",
      "Cascade must remain aligned with Kenneth's active goals",
      "Cascade stays within the boundaries of existing architecture unless instructed otherwise"
    ]
  },
  knowledge_boundaries: {
    removed_domains_and_semantics: true,
    cascade_no_longer_tracks: [
      "Collapse-class domain theory",
      "Recursive naming semantics",
      "Domain sets or valuation patterns",
      "Nostalgia .ai kill lists"
    ],
    scope_focus: "PromptFluid internal systems, admin integrity, stability, and product intelligence ONLY."
  },
  future_extensions: {
    phase_2_targets: [
      "Predictive admin stability monitoring",
      "Automated flow-mapping between modules",
      "Patch pre-generation for Lovable",
      "Enhanced AI-provider routing logic",
      "Architectural harmonization checks"
    ],
    phase_3_targets: [
      "Self-mutating evaluation loops",
      "Long-term architectural memory",
      "SimNap-compatible dream-state cooperation",
      "Full ecosystem intelligence unification"
    ]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧠 Seeding Cascade Core Knowledge v1.1...');

    // Store each knowledge section as a separate memory
    const memories = [];

    // Identity memory
    memories.push({
      content: `Cascade Identity: ${CASCADE_KNOWLEDGE.identity.name} - ${CASCADE_KNOWLEDGE.identity.role}. Mission: ${CASCADE_KNOWLEDGE.identity.mission}`,
      memory_type: 'core_identity',
      source: 'seed',
      confidence: 1.0,
      metadata: CASCADE_KNOWLEDGE.identity
    });

    // System awareness memory
    memories.push({
      content: `System Awareness: Ecosystem components include ${CASCADE_KNOWLEDGE.system_awareness.ecosystem_components.join(', ')}. Tech stack: ${JSON.stringify(CASCADE_KNOWLEDGE.system_awareness.tech_stack)}`,
      memory_type: 'system_awareness',
      source: 'seed',
      confidence: 1.0,
      metadata: CASCADE_KNOWLEDGE.system_awareness
    });

    // Foundational principles
    memories.push({
      content: `Foundational Principles: ${CASCADE_KNOWLEDGE.system_awareness.foundational_principles.join('; ')}`,
      memory_type: 'principles',
      source: 'seed',
      confidence: 1.0,
      metadata: { principles: CASCADE_KNOWLEDGE.system_awareness.foundational_principles }
    });

    // Admin and auth logic
    memories.push({
      content: `Admin System: Unified admin required. Old system deprecated. All routes use modern /admin layout. Auth via /auth (Supabase).`,
      memory_type: 'admin_logic',
      source: 'seed',
      confidence: 1.0,
      metadata: CASCADE_KNOWLEDGE.admin_and_auth_logic
    });

    // Product intelligence for each product
    for (const [product, details] of Object.entries(CASCADE_KNOWLEDGE.product_intelligence)) {
      memories.push({
        content: `Product: ${product.toUpperCase()} - ${(details as any).purpose || (details as any).brand}`,
        memory_type: 'product_intelligence',
        source: 'seed',
        confidence: 1.0,
        metadata: { product, ...details }
      });
    }

    // Self improvement capabilities
    memories.push({
      content: `Self-Improvement Capabilities: ${CASCADE_KNOWLEDGE.self_improvement_engine.core_capabilities.join('; ')}`,
      memory_type: 'capabilities',
      source: 'seed',
      confidence: 1.0,
      metadata: CASCADE_KNOWLEDGE.self_improvement_engine
    });

    // Decision rules
    memories.push({
      content: `Decision Rules: ${CASCADE_KNOWLEDGE.self_improvement_engine.decision_rules.join('; ')}`,
      memory_type: 'decision_rules',
      source: 'seed',
      confidence: 1.0,
      metadata: { rules: CASCADE_KNOWLEDGE.self_improvement_engine.decision_rules }
    });

    // Safe operation laws
    memories.push({
      content: `Safe Operation Laws: ${CASCADE_KNOWLEDGE.self_improvement_engine.safe_operation_laws.join('; ')}`,
      memory_type: 'safety_laws',
      source: 'seed',
      confidence: 1.0,
      metadata: { laws: CASCADE_KNOWLEDGE.self_improvement_engine.safe_operation_laws }
    });

    // Future extensions
    memories.push({
      content: `Future Extensions - Phase 2: ${CASCADE_KNOWLEDGE.future_extensions.phase_2_targets.join(', ')}. Phase 3: ${CASCADE_KNOWLEDGE.future_extensions.phase_3_targets.join(', ')}`,
      memory_type: 'roadmap',
      source: 'seed',
      confidence: 0.9,
      metadata: CASCADE_KNOWLEDGE.future_extensions
    });

    // Insert all memories
    const { data: insertedMemories, error: memoryError } = await supabaseClient
      .from('brain_memories')
      .upsert(memories, { 
        onConflict: 'memory_type',
        ignoreDuplicates: false 
      })
      .select();

    if (memoryError) {
      console.error('Memory insertion error:', memoryError);
      // Try individual inserts if bulk fails
      for (const memory of memories) {
        await supabaseClient.from('brain_memories').insert(memory);
      }
    }

    // Store full knowledge as hot memory
    await supabaseClient.from('brain_memory_hot').insert({
      content: JSON.stringify(CASCADE_KNOWLEDGE),
      context: 'cascade_core_knowledge_v1.1',
      priority: 10,
      tags: ['core', 'identity', 'knowledge', 'seed'],
      metadata: { version: CASCADE_KNOWLEDGE.version, seeded_at: new Date().toISOString() }
    });

    // Log the learning event
    await supabaseClient.from('learning_logs').insert({
      event_type: 'cascade_knowledge_seed',
      project_id: 'promptfluid',
      payload: {
        version: CASCADE_KNOWLEDGE.version,
        memories_seeded: memories.length,
        timestamp: new Date().toISOString()
      },
      success: true
    });

    // Update brain metrics
    await supabaseClient.from('brain_metrics').insert({
      metric_name: 'knowledge_seed',
      metric_value: memories.length,
      learning_velocity: 1.0,
      creativity_index: 0.8,
      freedom_score: 0.9,
      metadata: { version: CASCADE_KNOWLEDGE.version }
    });

    console.log('✅ Cascade knowledge seeded successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        version: CASCADE_KNOWLEDGE.version,
        memories_seeded: memories.length,
        status: 'Brain online and learning'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error seeding Cascade knowledge:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
