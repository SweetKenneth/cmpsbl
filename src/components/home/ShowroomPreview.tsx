/**
 * ShowroomPreview → CatalogPreview — Live Memory Stream catalog preview with CJPI pricing
 * Shows tier distribution and graduated pricing formula
 */

import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIERS = [
  { name: "Mint", range: "68–79", rate: "$1.00/pt", priceRange: "$68–$79", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { name: "Prime", range: "80–89", rate: "$1.25/pt", priceRange: "$100–$111", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  { name: "Relic", range: "90–93", rate: "$1.50/pt", priceRange: "$135–$140", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { name: "Mythic", range: "94–99", rate: "$2.00/pt", priceRange: "$188–$198", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  { name: "Apex", range: "100", rate: "Fixed", priceRange: "$1,952", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
] as const;

export function ShowroomPreview() {
  return (
    <section className="relative z-10 px-3 sm:px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/40 mb-5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">The Showroom</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3">
            Every Discovery Has a Price
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Scored by CJPI. Priced by tier. Once purchased, permanently retired from the catalog. The center never produces the same artifact twice.
          </p>
        </div>

        {/* Pricing tiers */}
        <div className="grid sm:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-xl border p-5 text-center transition-all duration-300 hover:scale-[1.02]",
                tier.bg, tier.border,
                tier.name === "Apex" && "sm:ring-2 sm:ring-primary/30"
              )}
            >
              <div className={cn("text-xs font-bold uppercase tracking-wider mb-2", tier.color)}>
                {tier.name}
              </div>
              <div className="text-lg font-black text-foreground mb-1">{tier.priceRange}</div>
              <div className="text-[10px] text-muted-foreground">
                CJPI {tier.range} · {tier.rate}
              </div>
              {tier.name === "Apex" && (
                <div className="mt-2 text-[10px] text-primary/70 font-medium">
                  The First Compiler · 1952
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Scarcity note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground/70 mb-6 max-w-lg mx-auto">
            Every discovery ships with a unique certificate, structural fingerprint, and retirement seal. One shot to buy. The catalog rotates every 8 hours.
          </p>
          <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold">
            <Link to="/showroom">
              <Sparkles className="w-4 h-4 mr-2" />
              Browse the Showroom
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
