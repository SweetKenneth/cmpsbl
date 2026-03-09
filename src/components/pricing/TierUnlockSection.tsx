/**
 * TierUnlockSection — Equal-slot capacity comparison
 * All 24 packs visible to all tiers. No pack gating.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PRODUCT_TIERS, STRATEGIC_DOMAINS, type ProductTier } from "@/lib/quarry/types";
import { VAULT_TIER_LIMITS } from "@/lib/substrate/vault-limits";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_DISPLAY: { key: ProductTier; label: string; gradient: string }[] = [
  { key: 'builder', label: 'Builder', gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'operator', label: 'Studio', gradient: 'from-violet-500 to-purple-500' },
  { key: 'studio', label: 'Creator', gradient: 'from-blue-500 to-indigo-500' },
  { key: 'architect', label: 'Architect', gradient: 'from-amber-500 to-orange-500' },
];

export function TierUnlockSection() {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
            <Package className="w-3 h-3 mr-1.5 inline" />
            Equal-Slot Capacity
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Every Pack = 1 Slot</h2>
          <p className="text-muted-foreground">
            All 24 artifact packs are visible to every plan. Your subscription controls how many you can activate — not which ones you can see.
          </p>
        </div>

        {/* Slot capacity summary */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mb-10">
          {TIER_DISPLAY.map(td => {
            const config = PRODUCT_TIERS[td.key];
            return (
              <Card key={td.key} className="text-center">
                <CardContent className="p-6">
                  <div className={cn("text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent", td.gradient)}>
                    {config.slots}
                  </div>
                  <div className="text-sm font-medium mt-1">{td.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {config.slots} slots · {VAULT_TIER_LIMITS[td.key].vaultCapacity === -1 ? '∞' : VAULT_TIER_LIMITS[td.key].vaultCapacity} vault · {VAULT_TIER_LIMITS[td.key].pullsPerDay}/day
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Domain distribution */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-center mb-6">Strategic Domain Distribution</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STRATEGIC_DOMAINS.map(domain => (
              <div key={domain.id} className="rounded-xl border border-border/30 p-4">
                <div className="font-medium text-sm mb-1">{domain.name}</div>
                <div className="text-xs text-muted-foreground">{domain.packIds.length} packs available</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
