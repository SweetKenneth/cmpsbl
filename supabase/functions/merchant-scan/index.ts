/**
 * merchant-scan — MERCHANT Agent Cross-Substrate Scanner
 * 
 * Scans S-Tier, A-Tier, and Discovery vaults across all substrates.
 * Qualifies items (CJPI 75+), calculates ECONOMY pricing ($10–$50),
 * and upserts into marketplace_inventory.
 * 
 * Scheduled: every 8 hours via pg_cron
 * Auth: service_role (no JWT required — invoked by cron)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** ECONOMY-aligned pricing: $10–$50 range */
function calculatePrice(cjpi: number, chainLength: number): number {
  const floor = 1000;
  const ceiling = 5000;
  const normalized = Math.max(0, Math.min(1, (cjpi - 75) / 25));
  const scorePremium = normalized * (ceiling - floor);
  const chainBonus = Math.max(0, chainLength - 2) * 200;
  return Math.min(ceiling, Math.round((floor + scorePremium + chainBonus) / 100) * 100);
}

function getTier(cjpi: number): string {
  if (cjpi >= 100) return 'Apex';
  if (cjpi >= 94) return 'Mythic';
  if (cjpi >= 90) return 'Relic';
  if (cjpi >= 80) return 'Prime';
  return 'Mint';
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

/** Source tables to scan — these are the actual vault/registry tables */
const SCAN_SOURCES = [
  { table: 'artifact_registry', vault: 's-tier', tierFilter: 's-tier' },
  { table: 'artifact_registry', vault: 'a-tier', tierFilter: 'a-tier' },
] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const scanResults: Array<{
      substrate: string;
      vault: string;
      items_scanned: number;
      items_qualified: number;
      items_added: number;
      items_retired: number;
    }> = [];

    let totalAdded = 0;
    let totalScanned = 0;

    // Scan artifact_registry for S-Tier and A-Tier items
    for (const source of SCAN_SOURCES) {
      const { data: artifacts, error } = await supabase
        .from(source.table)
        .select('*')
        .eq('tier', source.tierFilter);

      if (error) {
        console.error(`Scan error on ${source.table}/${source.vault}:`, error.message);
        continue;
      }

      const items = artifacts ?? [];
      const scanned = items.length;
      totalScanned += scanned;
      let qualified = 0;
      let added = 0;

      for (const artifact of items) {
        const meta = (artifact.metadata ?? {}) as Record<string, unknown>;
        const cjpi = Number(meta.cjpiScore ?? meta.cjpi ?? 0);
        const chain = (meta.primitiveChain ?? []) as string[];

        // Qualification gate
        if (cjpi < 75) continue;
        if (chain.length < 2) continue;
        qualified++;

        const slug = slugify(artifact.name);
        const priceCents = calculatePrice(cjpi, chain.length);
        const tier = getTier(cjpi);

        // Determine substrate from category or metadata
        const substrate = String(meta.substrate ?? artifact.category ?? 'primary').toLowerCase();
        const category = String(meta.category ?? artifact.category ?? 'meta-engine');

        // Upsert — slug is unique so this is idempotent
        const { error: upsertErr } = await supabase
          .from('marketplace_inventory')
          .upsert({
            slug,
            title: artifact.name,
            subtitle: artifact.description?.slice(0, 120) ?? '',
            description: artifact.description ?? '',
            pain_points: (meta.painPoints ?? []) as string[],
            features: (meta.features ?? []) as string[],
            source_substrate: substrate,
            source_vault: source.vault,
            source_id: artifact.slug ?? artifact.id,
            category,
            cjpi_score: cjpi,
            tier,
            price_cents: priceCents,
            original_value_cents: Math.round(cjpi * 150),
            primitive_chain: chain,
            is_featured: cjpi >= 90,
            is_active: true,
            tags: (meta.tags ?? []) as string[],
            version: String(meta.version ?? '1.0.0'),
            last_verified_at: new Date().toISOString(),
          }, { onConflict: 'slug' });

        if (!upsertErr) added++;
      }

      // Determine substrate grouping for scan log
      const substrates = new Set(items.map((a: Record<string, unknown>) => {
        const m = (a.metadata ?? {}) as Record<string, unknown>;
        return String(m.substrate ?? a.category ?? 'primary').toLowerCase();
      }));

      for (const sub of substrates) {
        scanResults.push({
          substrate: sub,
          vault: source.vault,
          items_scanned: scanned,
          items_qualified: qualified,
          items_added: added,
          items_retired: 0,
        });
      }

      totalAdded += added;
    }

    // Retire items not verified in 90+ days
    const retireThreshold = new Date(Date.now() - 90 * 86_400_000).toISOString();
    const { data: retired } = await supabase
      .from('marketplace_inventory')
      .update({ is_active: false })
      .lt('last_verified_at', retireThreshold)
      .eq('is_active', true)
      .select('id');

    const retiredCount = retired?.length ?? 0;

    // Log scan results
    for (const result of scanResults) {
      await supabase.from('merchant_scan_log').insert({
        substrate: result.substrate,
        vault: result.vault,
        items_scanned: result.items_scanned,
        items_qualified: result.items_qualified,
        items_added: result.items_added,
        items_retired: retiredCount,
        scan_duration_ms: Date.now() - startMs,
      });
    }

    // If no scan sources had data, log at least one entry
    if (scanResults.length === 0) {
      await supabase.from('merchant_scan_log').insert({
        substrate: 'primary',
        vault: 's-tier',
        items_scanned: 0,
        items_qualified: 0,
        items_added: 0,
        items_retired: retiredCount,
        scan_duration_ms: Date.now() - startMs,
      });
    }

    const summary = {
      scanned: totalScanned,
      added: totalAdded,
      retired: retiredCount,
      durationMs: Date.now() - startMs,
      scanResults,
    };

    console.log(`[MERCHANT] Scan complete:`, JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[MERCHANT] Scan failed:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Scan failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
