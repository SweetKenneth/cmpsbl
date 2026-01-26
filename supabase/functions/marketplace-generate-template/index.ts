/**
 * AI Template Generator - Generate Unique Random Templates
 * Uses the free-tier Nexus router for AI generation
 * Price: $39 per generated template
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template generation constants - represents all possible combinations
const TEMPLATE_CATEGORIES = ['brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'system', 'integration', 'cortex'];
const TEMPLATE_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'premium', 'elite', 'pro'];
const TEMPLATE_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
const TEMPLATE_FEATURES_POOL = [
  'Memory Persistence', 'Self-Correction', 'Drift Prevention', 'Context Continuity',
  'Behavioral Anchoring', 'Dream Synthesis', 'Autonomous Learning', 'Real-time Governance',
  'Threat Detection', 'PII Filtering', 'Health Monitoring', 'Circuit Breakers',
  'Multi-Model Routing', 'Fallback Chains', 'Rate Limiting', 'Semantic Search',
  'Knowledge Graphs', 'Emotional Intelligence', 'Proactive Assistance', 'Session Memory',
  'Goal Tracking', 'Pattern Recognition', 'Anomaly Detection', 'Self-Healing',
  'Distributed Tracing', 'Cost Optimization', 'Latency Routing', 'Provider Failover',
  'Identity Protection', 'Jailbreak Defense', 'Personality Lock', 'Consistency Scoring',
  'Memory Consolidation', 'Cross-Session Recall', 'Thread Memory', 'Coherence Scoring'
];

// Calculate total possible combinations
const TOTAL_COMBINATIONS = 
  TEMPLATE_CATEGORIES.length * 
  TEMPLATE_DIFFICULTIES.length * 
  TEMPLATE_RARITIES.length * 
  Math.pow(2, Math.min(TEMPLATE_FEATURES_POOL.length, 8)); // 8 feature slots

// System prompt for template generation
const SYSTEM_PROMPT = `You are an expert AI systems architect specializing in cognitive AI templates for the PromptFluid Substrate OS.

Generate a unique, production-ready template based on the provided parameters. The template should include:

1. A creative, unique name that reflects its purpose
2. A compelling description (2-3 sentences) highlighting the unique value
3. TypeScript/JavaScript code that demonstrates the template's core functionality
4. Integration with the substrate SDK methods

Code should be:
- Well-commented
- Production-ready
- Demonstrate the specified features
- Use the substrate.{module}.{action}() pattern
- Include error handling

Respond with valid JSON only, no markdown, no code blocks:
{
  "name": "Template Name",
  "description": "Template description",
  "code": "// TypeScript code here",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "estimatedTime": "30 min",
  "useCase": "Primary use case description"
}`;

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFeatures(count: number): string[] {
  const shuffled = [...TEMPLATE_FEATURES_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateTemplateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `gen-${timestamp}-${random}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { session_id } = body; // Stripe checkout session ID for verification

    // If session_id provided, verify payment was completed
    // In production, this would verify against the Stripe session
    if (!session_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment session required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🎲 Generating unique template for user ${user.id}...`);

    // Generate random parameters
    const category = getRandomElement(TEMPLATE_CATEGORIES);
    const difficulty = getRandomElement(TEMPLATE_DIFFICULTIES);
    const rarity = getRandomElement(TEMPLATE_RARITIES);
    const featureCount = 3 + Math.floor(Math.random() * 5); // 3-7 features
    const features = getRandomFeatures(featureCount);

    // Calculate value based on rarity and difficulty
    const rarityMultiplier: Record<string, number> = { common: 1, uncommon: 1.5, rare: 2, epic: 2.5, legendary: 3, mythic: 4 };
    const difficultyMultiplier: Record<string, number> = { beginner: 1, intermediate: 1.2, advanced: 1.5, premium: 2, elite: 2.5, pro: 3 };
    const estimatedValue = Math.round(39 * (rarityMultiplier[rarity] || 1) * (difficultyMultiplier[difficulty] || 1));

    // Build generation prompt
    const generationPrompt = `Generate a unique ${rarity} ${difficulty}-level AI template for the "${category}" module.

Required features to implement:
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Category: ${category}
Difficulty: ${difficulty}  
Rarity: ${rarity}
Target estimated value: $${estimatedValue}

Make it creative, production-ready, and unique. This template should feel like it's worth $${estimatedValue}.`;

    // Generate template using free-tier AI
    const aiResult = await callFreeTierAI(generationPrompt, {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.8, // Higher creativity
      maxTokens: 2500,
      priority: 'reliability'
    });

    // Parse AI response
    let generatedTemplate;
    try {
      // Clean up response - remove any markdown code blocks if present
      let cleanContent = aiResult.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      generatedTemplate = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResult.content);
      // Fallback template if parsing fails
      generatedTemplate = {
        name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${category.charAt(0).toUpperCase() + category.slice(1)} Engine`,
        description: `A ${rarity} ${difficulty}-level template for the ${category} module with ${features.length} advanced features.`,
        code: generateFallbackCode(category, features),
        features: features,
        estimatedTime: `${20 + Math.floor(Math.random() * 40)} min`,
        useCase: `Advanced ${category} operations with ${features[0]} and ${features[1]}`
      };
    }

    const templateId = generateTemplateId();

    // Store generated template in database
    const { error: insertError } = await supabase
      .from('marketplace_generated_templates')
      .insert({
        id: templateId,
        user_id: user.id,
        session_id: session_id,
        name: generatedTemplate.name,
        description: generatedTemplate.description,
        category: category,
        difficulty: difficulty,
        rarity: rarity,
        features: features,
        code: generatedTemplate.code,
        estimated_value_cents: estimatedValue * 100,
        ai_provider: aiResult.provider,
        metadata: {
          estimatedTime: generatedTemplate.estimatedTime,
          useCase: generatedTemplate.useCase,
          generatedAt: new Date().toISOString(),
          aiModel: aiResult.model
        }
      });

    if (insertError) {
      console.error('Failed to store template:', insertError);
    }

    console.log(`✅ Generated ${rarity} ${difficulty} template: ${generatedTemplate.name}`);

    return new Response(
      JSON.stringify({
        success: true,
        template: {
          id: templateId,
          name: generatedTemplate.name,
          description: generatedTemplate.description,
          category,
          difficulty,
          rarity,
          features: generatedTemplate.features || features,
          code: generatedTemplate.code,
          estimatedTime: generatedTemplate.estimatedTime,
          useCase: generatedTemplate.useCase,
          estimatedValue: `$${estimatedValue}`,
          generatedAt: new Date().toISOString()
        },
        meta: {
          totalPossibleCombinations: TOTAL_COMBINATIONS.toLocaleString(),
          provider: aiResult.provider,
          model: aiResult.model
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Template generation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Generation failed" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback code generator if AI fails
function generateFallbackCode(category: string, features: string[]): string {
  return `import { substrate } from './lib/substrate';

/**
 * Auto-generated ${category} template
 * Features: ${features.join(', ')}
 */

async function execute(input: string, sessionId: string) {
  // Initialize ${category} module
  const result = await substrate.${category}.process({
    input,
    sessionId,
    features: ${JSON.stringify(features)},
    options: {
      enableMemory: true,
      enableLearning: true,
      selfCorrect: true
    }
  });

  // Store learning for improvement
  await substrate.brain.learn(
    \`${category} processed: \${input}\`,
    'interaction',
    { features: ${JSON.stringify(features)} }
  );

  return result;
}

// Example usage
const response = await execute('Your input here', 'session-id');
console.log('Result:', response);`;
}
