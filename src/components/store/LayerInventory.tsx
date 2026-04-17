/**
 * LayerInventory — first-class section on /store.
 * Pulls active items from marketplace_inventory where pillar IS NOT NULL,
 * groups them by pillar, and renders one horizontal snap-scroll row per category.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LayerCard } from "./LayerCard";
import {
  groupByPillar,
  type LayerInventoryRow,
} from "@/lib/store/layer-categories";

export function LayerInventory() {
  const [rows, setRows] = useState<LayerInventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: queryError } = await supabase
        .from("marketplace_inventory")
        .select(
          "id,slug,title,subtitle,description,category,tier,price_cents,original_value_cents,cjpi_score,kind,pillar,origin_vertical,suite_capabilities,primitive_chain,is_featured,tags"
        )
        .eq("is_active", true)
        .not("pillar", "is", null)
        .order("price_cents", { ascending: false });

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      const normalized: LayerInventoryRow[] = (data ?? []).map((r: any) => ({
        ...r,
        suite_capabilities: Array.isArray(r.suite_capabilities)
          ? r.suite_capabilities
          : [],
        primitive_chain: Array.isArray(r.primitive_chain) ? r.primitive_chain : [],
        tags: Array.isArray(r.tags) ? r.tags : [],
      }));
      setRows(normalized);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-12 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </section>
    );
  }

  if (error || rows.length === 0) {
    // Silent empty state — section just hides if nothing seeded.
    return null;
  }

  const groups = groupByPillar(rows);

  return (
    <motion.section
      id="layer-inventory"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 sm:mb-24 scroll-mt-24"
    >
      {/* Section header */}
      {/* Section header removed — cinematic hero already introduces the Layers */}

      {/* Category rows */}
      <div className="space-y-12">
        {groups.map(({ meta, items }) => (
          <div key={meta.pillar}>
            <div className="flex items-baseline justify-between mb-4 px-1">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                  {meta.label}
                </h3>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {meta.tagline}
                </p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums tracking-wider">
                {String(items.length).padStart(2, "0")} item
                {items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div
              className={cn(
                "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3",
                "-mx-4 px-4 sm:-mx-1 sm:px-1",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
              )}
            >
              {items.map((item) => (
                <LayerCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
