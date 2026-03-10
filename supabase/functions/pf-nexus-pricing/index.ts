/**
 * NEXUS Consensus Pricing Engine v2.0
 * Multi-model pricing with outlier rejection and median merge
 * 
 * Providers: Claude Haiku, OpenAI GPT-4o-mini, Groq Llama, OpenRouter Qwen
 * Falls back gracefully when providers are unavailable
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CONSENSUS_VERSION = '2.0.0';
const SYSTEM_PROMPT = "You are a software pricing analyst. Return only valid JSON, no markdown fences, no explanation text.";

// ── Provider Definitions ──

interface PricingProvider {
  id: string;
  name: string;
  envKey: string;
  model: string;
  call: (prompt: string, apiKey: string) => Promise<any>;
}

const PRICING_PROVIDERS: PricingProvider[] = [
  {
    id: 'claude-haiku',
    name: 'Claude Haiku 4.5',
    envKey: 'ANTHROPIC_API_KEY',
    model: 'claude-haiku-4-5',
    call: async (prompt: string, apiKey: string) => {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
      const data = await resp.json();
      return { text: data.content?.[0]?.text || '', tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0) };
    },
  },
  {
    id: 'openai-mini',
    name: 'OpenAI GPT-4o-mini',
    envKey: 'OPENAI_API_KEY',
    model: 'gpt-4o-mini',
    call: async (prompt: string, apiKey: string) => {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) throw new Error(`OpenAI API error: ${resp.status}`);
      const data = await resp.json();
      return { text: data.choices?.[0]?.message?.content || '', tokens: (data.usage?.total_tokens || 0) };
    },
  },
  {
    id: 'groq-llama',
    name: 'Groq Llama 3.3 70B',
    envKey: 'GROQ_API_KEY',
    model: 'llama-3.3-70b-versatile',
    call: async (prompt: string, apiKey: string) => {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!resp.ok) throw new Error(`Groq API error: ${resp.status}`);
      const data = await resp.json();
      return { text: data.choices?.[0]?.message?.content || '', tokens: (data.usage?.total_tokens || 0) };
    },
  },
  {
    id: 'openrouter-qwen',
    name: 'OpenRouter Qwen3 80B',
    envKey: 'OPENROUTER_API_KEY',
    model: 'qwen/qwen3-next-80b-a3b-instruct:free',
    call: async (prompt: string, apiKey: string) => {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://cmpsbl.lovable.app",
          "X-Title": "CMPSBL Pricing Engine",
        },
        body: JSON.stringify({
          model: "qwen/qwen3-next-80b-a3b-instruct:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt + "\n\nIMPORTANT: Return ONLY the JSON object, no thinking tags, no explanation." },
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!resp.ok) throw new Error(`OpenRouter API error: ${resp.status}`);
      const data = await resp.json();
      return { text: data.choices?.[0]?.message?.content || '', tokens: (data.usage?.total_tokens || 0) };
    },
  },
];
// ── Prompt Builder ──

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
  // Convert internal value to a qualitative signal to prevent anchoring bias
  const complexitySignal = (artifact.internalValue || 0) > 500000 ? 'exceptional — enterprise platform class'
    : (artifact.internalValue || 0) > 100000 ? 'very high — significant infrastructure'
    : (artifact.internalValue || 0) > 10000 ? 'high'
    : (artifact.internalValue || 0) > 1000 ? 'moderate'
    : 'standard';

  return `Price this software artifact for commercial sale. Consider all channels: enterprise licensing, marketplace distribution, SaaS integration, and direct sales.

ARTIFACT: ${artifact.name}
DESCRIPTION: ${artifact.description || 'Crystallized software pipeline / reusable code module'}
MODULES: ${artifact.modules.join(', ')} (${artifact.modules.length} total)
CJPI SCORE: ${artifact.score}/100 (higher = more sophisticated)
TIER: ${artifact.tier}
CATEGORY: ${artifact.category || 'general'}
ENGINEERING COMPLEXITY: ${complexitySignal}
HARDWARE EXPORT: ${artifact.hasHardwareExport ? 'Yes' : 'No'}
EXPORT TARGETS: ${(artifact.exportTargets || ['source']).join(', ')}
RUNTIME: ${artifact.runtimeType || 'JavaScript/TypeScript'}

PRICING GUIDELINES — price according to real commercial software market value:
- A single reusable module/library: $10-$200
- A multi-module developer toolkit (2-5 modules): $50-$2,000
- A comprehensive framework or platform (5+ modules): $500-$25,000
- Enterprise infrastructure, orchestration platforms, or AI substrates: $5,000-$500,000+
- Highly sophisticated multi-module systems with 8+ modules and high CJPI scores can exceed $100,000
- Price based on the engineering value, sophistication, and what an enterprise or serious buyer would pay
- Do NOT artificially constrain pricing — if it's worth $50,000 or $500,000, price it accordingly

Return a JSON object with EXACTLY these fields (no markdown, no explanation):
{
  "price_range_low": number (realistic minimum retail price in USD),
  "price_range_high": number (realistic maximum retail price in USD),
  "estimated_mid_price": number (best single retail price in USD),
  "market_category": "string — most fitting software market category",
  "comparable_product_types": "string — 1-2 sentences naming real comparable products at similar price points",
  "suggested_marketplaces": ["array of 2-4 best-fit platforms from: Gumroad, Lemon Squeezy, GitHub Marketplace, npm, Docker Hub, Hugging Face, Vercel Templates, AWS Marketplace"],
  "pricing_confidence": number between 0 and 1,
  "commercialization_rationale": "string — 1-2 sentences on best commercialization path"
}`;
}

// ── JSON Parser (handles markdown fences, thinking tags) ──

function parseProviderJSON(raw: string): any {
  let cleaned = raw
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
    .trim();
  
  // Try to extract JSON object if surrounded by text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  
  return JSON.parse(cleaned);
}

// ── Outlier Rejection ──

interface ProviderEstimate {
  provider: string;
  model: string;
  price_range_low: number;
  price_range_high: number;
  estimated_mid_price: number;
  market_category: string;
  comparable_product_types: string;
  suggested_marketplaces: string[];
  pricing_confidence: number;
  commercialization_rationale: string;
  success: boolean;
  excluded_as_outlier: boolean;
  error?: string;
  latency_ms?: number;
  tokens_used?: number;
  timestamp: string;
}

function rejectOutliers(estimates: ProviderEstimate[]): ProviderEstimate[] {
  const successful = estimates.filter(e => e.success);
  if (successful.length <= 2) return estimates;

  const midPrices = successful.map(e => e.estimated_mid_price).sort((a, b) => a - b);
  const q1 = midPrices[Math.floor(midPrices.length * 0.25)];
  const q3 = midPrices[Math.floor(midPrices.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = iqr > 1 ? q1 - 2.5 * iqr : q1 * 0.3;
  const upperBound = iqr > 1 ? q3 + 2.5 * iqr : q3 * 3.0;

  return estimates.map(e => {
    if (!e.success) return e;
    const isOutlier = e.estimated_mid_price < lowerBound || e.estimated_mid_price > upperBound;
    return { ...e, excluded_as_outlier: isOutlier };
  });
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mode(arr: string[]): string {
  const freq = new Map<string, number>();
  for (const v of arr) freq.set(v, (freq.get(v) || 0) + 1);
  let best = arr[0] || 'Software Tool';
  let bestCount = 0;
  for (const [k, v] of freq) { if (v > bestCount) { best = k; bestCount = v; } }
  return best;
}

// ── Consensus Computation ──

function computeConsensusPrice(
  estimates: ProviderEstimate[],
  internalValue: number,
  cjpiScore: number,
  moduleCount: number,
  hasHardwareExport: boolean,
  tier: string,
) {
  const included = estimates.filter(e => e.success && !e.excluded_as_outlier);
  const normalizedInternal = Math.max(internalValue * 0.001, 5);

  // CJPI multiplier
  let cjpiMult = 1.0;
  if (cjpiScore >= 100) cjpiMult = 2.5;
  else if (cjpiScore >= 94) cjpiMult = 2.0;
  else if (cjpiScore >= 90) cjpiMult = 1.6;
  else if (cjpiScore >= 80) cjpiMult = 1.3;
  else if (cjpiScore >= 68) cjpiMult = 1.0;
  else cjpiMult = 0.7;

  const complexityBonus = 1 + (Math.min(moduleCount, 10) * 0.05);
  const hardwarePremium = hasHardwareExport ? 1.3 : 1.0;

  // Weights based on provider count
  const successCount = included.length;
  let weights: { internal: number; market: number; cjpi: number };
  let source: string;

  if (successCount >= 3) {
    weights = { internal: 0.20, market: 0.55, cjpi: 0.25 };
    source = 'consensus';
  } else if (successCount === 2) {
    weights = { internal: 0.25, market: 0.50, cjpi: 0.25 };
    source = 'partial-consensus';
  } else if (successCount === 1) {
    weights = { internal: 0.30, market: 0.45, cjpi: 0.25 };
    source = 'single-provider';
  } else {
    weights = { internal: 0.55, market: 0.0, cjpi: 0.45 };
    source = 'local-fallback';
  }

  // Consensus mid from successful providers
  const consensusMid = included.length > 0
    ? median(included.map(e => e.estimated_mid_price))
    : null;

  const marketAnchor = consensusMid ?? normalizedInternal;
  const basePrice =
    normalizedInternal * weights.internal +
    marketAnchor * weights.market +
    normalizedInternal * cjpiMult * weights.cjpi;

  const adjustedPrice = basePrice * complexityBonus * hardwarePremium;
  const recommended = Math.round(Math.max(adjustedPrice, 1) * 100) / 100;

  // Market range
  const rangeLow = included.length > 0
    ? median(included.map(e => e.price_range_low))
    : recommended * 0.5;
  const rangeHigh = included.length > 0
    ? median(included.map(e => e.price_range_high))
    : recommended * 2.0;

  // Confidence
  let confidence = 0.2;
  confidence += Math.min(successCount / 3, 1) * 0.3;
  if (consensusMid && successCount >= 2) {
    const mids = included.map(e => e.estimated_mid_price);
    const avgDev = mids.reduce((s, m) => s + Math.abs(m - consensusMid) / consensusMid, 0) / mids.length;
    confidence += Math.max(0, 1 - avgDev) * 0.25;
  }
  if (cjpiScore > 0) confidence += 0.05;
  if (internalValue > 0) confidence += 0.05;
  if (moduleCount > 1) confidence += 0.05;
  confidence = Math.min(confidence, 1.0);

  // Aggregate metadata
  const marketCategory = included.length > 0
    ? mode(included.map(e => e.market_category))
    : 'Software Tool';
  const marketplaces = [...new Set(included.flatMap(e => e.suggested_marketplaces))].slice(0, 5);
  const bestProvider = included.sort((a, b) => b.pricing_confidence - a.pricing_confidence)[0];

  return {
    recommended_resale_price: recommended,
    indie_price: Math.round(recommended * 0.6 * 100) / 100,
    standard_price: recommended,
    enterprise_price: Math.round(recommended * 3.5 * 100) / 100,
    estimated_market_range_low: Math.round(rangeLow * 100) / 100,
    estimated_market_range_high: Math.round(rangeHigh * 100) / 100,
    pricing_confidence: Math.round(confidence * 100) / 100,
    market_category: marketCategory,
    comparable_summary: bestProvider?.comparable_product_types || 'Local estimate based on CJPI and internal signals.',
    suggested_marketplaces: marketplaces.length > 0 ? marketplaces : (cjpiScore >= 90 ? ['Gumroad', 'GitHub Marketplace'] : ['Gumroad']),
    commercialization_notes: bestProvider?.commercialization_rationale || 'Pricing generated from internal signals.',
    pricing_source: source,
    pricing_source_version: CONSENSUS_VERSION,
    pricing_evidence: {
      providers: estimates,
      consensus_mid: consensusMid,
      internal_value_contribution: Math.round(normalizedInternal * 100) / 100,
      cjpi_contribution: cjpiMult,
      outliers_rejected: estimates.filter(e => e.excluded_as_outlier).map(e => e.provider),
      providers_used: included.map(e => e.provider),
      providers_failed: estimates.filter(e => !e.success).map(e => e.provider),
      formula_weights: { internal: weights.internal, consensus_market: weights.market, cjpi_premium: weights.cjpi },
      computed_at: new Date().toISOString(),
    },
  };
}

// ── Main Handler ──

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

    if (action === 'price' && artifact) {
      const result = await priceArtifactConsensus(artifact, supabase);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'batch-reprice') {
      const results = [];
      for (const art of artifacts.slice(0, 50)) {
        try {
          const result = await priceArtifactConsensus(art, supabase);
          const pricingUpdate: Record<string, any> = {
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
            pricing_source_version: CONSENSUS_VERSION,
            pricing_evidence: result.pricing_evidence,
          };
          if (art.vault_id) {
            // Route to correct table
            const table = art.source_table || 'pipeline_vault';
            await supabase.from(table).update(pricingUpdate).eq('id', art.vault_id);
            // Also try the other table in case of cross-table artifacts
            if (table === 'pipeline_vault') {
              await supabase.from('foundry_inventory').update(pricingUpdate).eq('id', art.vault_id).maybeSingle();
            }
          }
          results.push({ id: art.vault_id, success: true, pricing: result });
        } catch (err) {
          results.push({ id: art.vault_id, success: false, error: (err as Error).message });
        }
        await new Promise(r => setTimeout(r, 300));
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

// ── Core Pricing Function ──

async function priceArtifactConsensus(artifact: any, supabase: any) {
  const modules = artifact.system_chain || artifact.modules || [];
  const score = artifact.pipeline_score || artifact.score || 50;
  const tier = artifact.pipeline_tier || artifact.tier || 'Raw';
  const internalValue = artifact.valuation_display || artifact.internalValue || 0;
  const name = artifact.pipeline_name || artifact.name || 'Unknown Artifact';
  const category = artifact.pipeline_category || artifact.category || null;

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

  // Query all available providers in parallel
  const estimates: ProviderEstimate[] = await Promise.all(
    PRICING_PROVIDERS.map(async (provider) => {
      const apiKey = Deno.env.get(provider.envKey);
      if (!apiKey) {
        return {
          provider: provider.id,
          model: provider.model,
          price_range_low: 0,
          price_range_high: 0,
          estimated_mid_price: 0,
          market_category: '',
          comparable_product_types: '',
          suggested_marketplaces: [],
          pricing_confidence: 0,
          commercialization_rationale: '',
          success: false,
          excluded_as_outlier: false,
          error: `${provider.envKey} not configured`,
          timestamp: new Date().toISOString(),
        };
      }

      const start = Date.now();
      try {
        const result = await provider.call(prompt, apiKey);
        const latencyMs = Date.now() - start;
        const parsed = parseProviderJSON(result.text);

        // Log success
        try {
          await supabase.from('ai_usage_log').insert({
            provider: provider.id,
            model: provider.model,
            category: 'nexus_consensus_pricing',
            success: true,
            tokens_used: result.tokens || 0,
            response_time_ms: latencyMs,
            cost: 0,
            metadata: { artifact_name: name, pricing_confidence: parsed.pricing_confidence },
          });
        } catch { /* non-critical */ }

        return {
          provider: provider.id,
          model: provider.model,
          price_range_low: parsed.price_range_low || 0,
          price_range_high: parsed.price_range_high || 0,
          estimated_mid_price: parsed.estimated_mid_price || ((parsed.price_range_low || 0) + (parsed.price_range_high || 0)) / 2,
          market_category: parsed.market_category || 'Software Tool',
          comparable_product_types: parsed.comparable_product_types || parsed.comparable_types || '',
          suggested_marketplaces: parsed.suggested_marketplaces || [],
          pricing_confidence: parsed.pricing_confidence || 0.5,
          commercialization_rationale: parsed.commercialization_rationale || '',
          success: true,
          excluded_as_outlier: false,
          latency_ms: latencyMs,
          tokens_used: result.tokens,
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        const latencyMs = Date.now() - start;
        // Log failure
        try {
          await supabase.from('ai_usage_log').insert({
            provider: provider.id,
            model: provider.model,
            category: 'nexus_consensus_pricing',
            success: false,
            response_time_ms: latencyMs,
            metadata: { error: (err as Error).message, artifact_name: name },
          });
        } catch { /* non-critical */ }

        return {
          provider: provider.id,
          model: provider.model,
          price_range_low: 0,
          price_range_high: 0,
          estimated_mid_price: 0,
          market_category: '',
          comparable_product_types: '',
          suggested_marketplaces: [],
          pricing_confidence: 0,
          commercialization_rationale: '',
          success: false,
          excluded_as_outlier: false,
          error: (err as Error).message,
          latency_ms: latencyMs,
          timestamp: new Date().toISOString(),
        };
      }
    }),
  );

  // Reject outliers
  const processed = rejectOutliers(estimates);

  // Compute consensus pricing
  return computeConsensusPrice(
    processed,
    internalValue,
    score,
    modules.length,
    false,
    tier,
  );
}
