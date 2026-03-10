/**
 * NEXUS Pricing Engine — Claude Haiku market comparison via NEXUS router
 * Routes through pf-nexus-router with anthropic-haiku preference for pricing analysis
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Pricing prompt template ──
function buildPricingPrompt(artifact: {
  name: string;
  description?: string;
  modules: string[];
  score: number;
  tier: string;
  category?: string;
  internalValue?: number;
  hasHardwareExport?: boolean;
  exportTargets?: string[];
  runtimeType?: string;
}): string {
  return `Analyze this software artifact for commercialization pricing:

ARTIFACT: ${artifact.name}
DESCRIPTION: ${artifact.description || 'Crystallized software pipeline'}
MODULES: ${artifact.modules.join(', ')}
CJPI SCORE: ${artifact.score}/100
TIER: ${artifact.tier}
CATEGORY: ${artifact.category || 'general'}
INTERNAL VALUE ESTIMATE: $${artifact.internalValue || 0}
HARDWARE EXPORT: ${artifact.hasHardwareExport ? 'Yes' : 'No'}
EXPORT TARGETS: ${(artifact.exportTargets || ['source']).join(', ')}
RUNTIME: ${artifact.runtimeType || 'JavaScript/TypeScript'}

Return a JSON object with EXACTLY these fields (no markdown, no explanation):
{
  "market_category": "string — most fitting software market category",
  "comparable_types": "string — 1-2 sentences on comparable products/tools",
  "price_range_low": number,
  "price_range_high": number,
  "suggested_marketplaces": ["array of 2-4 best-fit platforms from: Gumroad, Lemon Squeezy, GitHub Marketplace, npm, Docker Hub, Hugging Face, Unity Asset Store, AWS Marketplace, Vercel Templates"],
  "pricing_confidence": number between 0 and 1,
  "commercialization_rationale": "string — 1-2 sentences on best commercialization path",
  "distribution_type": "string — one of: library, package, template, artifact_pack, open_core, enterprise_licensed, infrastructure_image, hardware_asset"
}

Bias toward realistic indie/solo-developer pricing for tools and libraries. Enterprise pricing only if artifact complexity warrants it.`;
}

// ── Grounded pricing formula ──
interface PricingInputs {
  internalValue: number;
  cjpiScore: number;
  claudeRangeLow?: number;
  claudeRangeHigh?: number;
  moduleCount: number;
  hasHardwareExport: boolean;
  tier: string;
}

interface PricingOutput {
  recommended_resale_price: number;
  indie_price: number;
  standard_price: number;
  enterprise_price: number;
  estimated_market_range_low: number;
  estimated_market_range_high: number;
}

function computeGroundedPricing(inputs: PricingInputs): PricingOutput {
  const { internalValue, cjpiScore, claudeRangeLow, claudeRangeHigh, moduleCount, hasHardwareExport, tier } = inputs;

  // Normalize internal value to realistic range ($5 - $2000 for indie software)
  const normalizedInternal = Math.min(Math.max(internalValue * 0.001, 5), 2000);

  // Claude market median (if available)
  const hasClaudeData = claudeRangeLow !== undefined && claudeRangeHigh !== undefined;
  const claudeMedian = hasClaudeData ? (claudeRangeLow! + claudeRangeHigh!) / 2 : normalizedInternal;
  const marketLow = hasClaudeData ? claudeRangeLow! : normalizedInternal * 0.5;
  const marketHigh = hasClaudeData ? claudeRangeHigh! : normalizedInternal * 2;

  // CJPI adjustment: score 90+ gets premium multiplier
  let cjpiMultiplier = 1.0;
  if (cjpiScore >= 100) cjpiMultiplier = 2.5;
  else if (cjpiScore >= 94) cjpiMultiplier = 2.0;
  else if (cjpiScore >= 90) cjpiMultiplier = 1.6;
  else if (cjpiScore >= 80) cjpiMultiplier = 1.3;
  else if (cjpiScore >= 68) cjpiMultiplier = 1.0;
  else cjpiMultiplier = 0.7;

  // Module complexity bonus
  const complexityBonus = 1 + (Math.min(moduleCount, 10) * 0.05);

  // Hardware export premium
  const hardwarePremium = hasHardwareExport ? 1.3 : 1.0;

  // Weighted combination: 30% internal, 50% Claude market, 20% CJPI adjustment
  const basePrice = hasClaudeData
    ? (normalizedInternal * 0.3 + claudeMedian * 0.5 + normalizedInternal * cjpiMultiplier * 0.2)
    : normalizedInternal * cjpiMultiplier;

  const adjustedPrice = basePrice * complexityBonus * hardwarePremium;
  const recommended = Math.round(adjustedPrice * 100) / 100;

  return {
    recommended_resale_price: recommended,
    indie_price: Math.round(recommended * 0.6 * 100) / 100,
    standard_price: Math.round(recommended * 100) / 100,
    enterprise_price: Math.round(recommended * 3.5 * 100) / 100,
    estimated_market_range_low: Math.round(marketLow * 100) / 100,
    estimated_market_range_high: Math.round(marketHigh * 100) / 100,
  };
}

// ── Local fallback pricing (no Claude) ──
function computeFallbackPricing(artifact: {
  score: number;
  internalValue: number;
  moduleCount: number;
  tier: string;
  hasHardwareExport: boolean;
}): PricingOutput & { market_category: string; suggested_marketplaces: string[]; pricing_confidence: number; comparable_summary: string; commercialization_notes: string } {
  const pricing = computeGroundedPricing({
    internalValue: artifact.internalValue,
    cjpiScore: artifact.score,
    moduleCount: artifact.moduleCount,
    hasHardwareExport: artifact.hasHardwareExport,
    tier: artifact.tier,
  });

  const marketplaces = artifact.score >= 90
    ? ['Gumroad', 'GitHub Marketplace', 'Lemon Squeezy']
    : ['Gumroad', 'npm'];

  return {
    ...pricing,
    market_category: 'Software Tool',
    suggested_marketplaces: marketplaces,
    pricing_confidence: 0.4,
    comparable_summary: 'Local estimate based on CJPI and internal valuation signals.',
    commercialization_notes: 'Pricing generated from internal signals only. Enable Claude Haiku analysis for market-grounded pricing.',
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json();
    const { action = 'price', artifacts = [], artifact } = body;

    // Single artifact pricing
    if (action === 'price' && artifact) {
      const result = await priceArtifact(artifact, supabase);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch reprice
    if (action === 'batch-reprice') {
      const results = [];
      for (const art of artifacts.slice(0, 50)) {
        try {
          const result = await priceArtifact(art, supabase);
          // Update DB — update both foundry_inventory and pipeline_vault
          const pricingUpdate = {
            recommended_resale_price: result.recommended_resale_price,
            indie_price: result.indie_price,
            standard_price: result.standard_price,
            enterprise_price: result.enterprise_price,
            estimated_market_range_low: result.estimated_market_range_low,
            estimated_market_range_high: result.estimated_market_range_high,
            pricing_confidence: result.pricing_confidence,
            market_category: result.market_category,
            comparable_summary: result.comparable_summary,
            suggested_marketplaces: result.suggested_marketplaces,
            commercialization_notes: result.commercialization_notes,
            pricing_last_updated_at: new Date().toISOString(),
            pricing_source: result.pricing_source,
            pricing_source_version: '1.0.0',
          };
          if (art.vault_id) {
            // Try foundry_inventory first (primary table), then pipeline_vault
            await Promise.allSettled([
              supabase.from('foundry_inventory').update(pricingUpdate).eq('id', art.vault_id),
              supabase.from('pipeline_vault').update(pricingUpdate).eq('id', art.vault_id),
            ]);
          }
          results.push({ id: art.vault_id, success: true, pricing: result });
        } catch (err) {
          results.push({ id: art.vault_id, success: false, error: (err as Error).message });
        }
        // Rate limit spacing
        await new Promise(r => setTimeout(r, 200));
      }
      return new Response(JSON.stringify({ results, processed: results.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Pricing engine error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function priceArtifact(artifact: any, supabase: any) {
  const modules = artifact.system_chain || artifact.modules || [];
  const score = artifact.pipeline_score || artifact.score || 50;
  const tier = artifact.pipeline_tier || artifact.tier || 'Raw';
  const internalValue = artifact.valuation_display || artifact.internalValue || 0;
  const name = artifact.pipeline_name || artifact.name || 'Unknown Artifact';
  const category = artifact.pipeline_category || artifact.category || null;

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  
  if (!anthropicKey) {
    // Fallback: no Claude available
    const fallback = computeFallbackPricing({
      score,
      internalValue,
      moduleCount: modules.length,
      tier,
      hasHardwareExport: false,
    });
    return { ...fallback, pricing_source: 'local' };
  }

  // Call Claude Haiku directly (not through pf-nexus-router to avoid circular complexity)
  try {
    const prompt = buildPricingPrompt({
      name,
      modules,
      score,
      tier,
      category,
      internalValue,
      hasHardwareExport: false,
      exportTargets: ['source', 'typescript', 'python'],
      runtimeType: 'JavaScript/TypeScript',
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        system: "You are a software pricing analyst. Return only valid JSON, no markdown fences, no explanation text.",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Claude Haiku error [${response.status}]: ${errText.slice(0, 200)}`);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    // Parse Claude's JSON response
    let claudeResult: any;
    try {
      // Handle potential markdown fences
      const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      claudeResult = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse Claude pricing response:', content.slice(0, 200));
      throw new Error('Invalid Claude response format');
    }

    // Compute grounded pricing using Claude + internal signals
    const pricing = computeGroundedPricing({
      internalValue,
      cjpiScore: score,
      claudeRangeLow: claudeResult.price_range_low,
      claudeRangeHigh: claudeResult.price_range_high,
      moduleCount: modules.length,
      hasHardwareExport: false,
      tier,
    });

    // Log pricing event
    try {
      await supabase.from('ai_usage_log').insert({
        provider: 'anthropic-haiku',
        model: 'claude-3-5-haiku-20241022',
        category: 'nexus_pricing',
        success: true,
        tokens_used: data.usage?.input_tokens + data.usage?.output_tokens || 0,
        cost: 0,
        metadata: { artifact_name: name, pricing_confidence: claudeResult.pricing_confidence },
      });
    } catch { /* non-critical */ }

    return {
      ...pricing,
      market_category: claudeResult.market_category || 'Software Tool',
      suggested_marketplaces: claudeResult.suggested_marketplaces || ['Gumroad'],
      pricing_confidence: claudeResult.pricing_confidence || 0.7,
      comparable_summary: claudeResult.comparable_types || '',
      commercialization_notes: claudeResult.commercialization_rationale || '',
      pricing_source: 'claude-haiku',
    };
  } catch (err) {
    console.error('Claude pricing failed, using fallback:', (err as Error).message);
    
    // Log failure
    try {
      await supabase.from('ai_usage_log').insert({
        provider: 'anthropic-haiku',
        model: 'claude-3-5-haiku-20241022',
        category: 'nexus_pricing',
        success: false,
        metadata: { error: (err as Error).message, artifact_name: name },
      });
    } catch { /* non-critical */ }

    const fallback = computeFallbackPricing({
      score,
      internalValue,
      moduleCount: modules.length,
      tier,
      hasHardwareExport: false,
    });
    return { ...fallback, pricing_source: 'local-fallback' };
  }
}
