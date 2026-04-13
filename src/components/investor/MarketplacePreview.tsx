/**
 * MarketplacePreview — shows the store/marketplace/junkyard ecosystem to investors
 */
import { motion } from "framer-motion";
import { Store, Sparkles, Recycle, Package, ArrowRight, DollarSign } from "lucide-react";

const MARKETPLACE_FEATURES = [
  {
    title: "Software Store",
    icon: Store,
    desc: "CJPI-weighted pricing ($10–$50). Mint to Apex quality tiers. Daily free drops.",
    stats: "Auto-priced · 8hr refresh",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "The Showroom",
    icon: Sparkles,
    desc: "Crown Jewel showcase. Interactive demos of the substrate's highest-tier discoveries.",
    stats: "S-Tier only · Curated",
    color: "text-[hsl(var(--neon-amber))]",
    bg: "bg-[hsl(var(--neon-amber)/0.1)]",
  },
  {
    title: "The Junkyard",
    icon: Recycle,
    desc: "Free/discounted software below S-Tier thresholds. Salvaged discoveries, still functional.",
    stats: "CJPI < 80 · Free tier",
    color: "text-[hsl(var(--neon-green))]",
    bg: "bg-[hsl(var(--neon-green)/0.1)]",
  },
  {
    title: "Product Compiler",
    icon: Package,
    desc: "Bundles primitives into sellable products. Automatic pricing based on chain complexity.",
    stats: "Auto-compiled · $10 floor",
    color: "text-[hsl(var(--neon-cyan))]",
    bg: "bg-[hsl(var(--neon-cyan)/0.1)]",
  },
] as const;

export function MarketplacePreview({ compact = false }: { compact?: boolean }) {
  const items = compact ? MARKETPLACE_FEATURES.slice(0, 3) : MARKETPLACE_FEATURES;

  return (
    <div className="space-y-3">
      {/* Revenue model callout */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Revenue: 5 Tiers + Marketplace</p>
          <p className="text-xs text-muted-foreground">
            Free · Studio ($29) · Creator ($49) · Architect ($79) · Enterprise ($999+) + per-item marketplace sales
          </p>
        </div>
      </div>

      <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} gap-3`}>
        {items.map(({ title, icon: Icon, desc, stats, color, bg }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-[9px] font-mono text-muted-foreground">{stats}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
