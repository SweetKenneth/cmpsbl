/**
 * TierUnlockSection — Artifact Capacity comparison
 * No internal terminology exposed. Clean posture.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ARTIFACT_PACKS, PRODUCT_TIERS, type ProductTier } from "@/lib/quarry/types";
import { Package, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_DISPLAY: { key: ProductTier; label: string; gradient: string }[] = [
  { key: 'base', label: 'Base', gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'professional', label: 'Professional', gradient: 'from-violet-500 to-purple-500' },
  { key: 'enterprise', label: 'Enterprise', gradient: 'from-amber-500 to-orange-500' },
];

const tierOrder: Record<ProductTier, number> = { base: 0, professional: 1, enterprise: 2 };

export function TierUnlockSection() {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
            <Package className="w-3 h-3 mr-1.5 inline" />
            Pack Availability
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Which Packs Fit Your Plan</h2>
          <p className="text-muted-foreground">
            Artifact packs activate within your slot capacity. Higher plans unlock more packs and deeper functionality.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pack</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground w-16">Slots</th>
                {TIER_DISPLAY.map(td => (
                  <th key={td.key} className="text-center py-3 px-4">
                    <span className={cn("font-bold bg-gradient-to-r bg-clip-text text-transparent", td.gradient)}>
                      {td.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ARTIFACT_PACKS.map(pack => (
                <tr key={pack.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium">{pack.name}</div>
                    <div className="text-xs text-muted-foreground">{pack.version}</div>
                  </td>
                  <td className="text-center py-3 px-2 text-muted-foreground">{pack.slotsRequired}</td>
                  {TIER_DISPLAY.map(td => {
                    const available = tierOrder[td.key] >= tierOrder[pack.tier];
                    return (
                      <td key={td.key} className="text-center py-3 px-4">
                        {available ? (
                          <Check className="w-4 h-4 text-primary mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Slot capacity summary */}
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-3 gap-4">
          {TIER_DISPLAY.map(td => {
            const config = PRODUCT_TIERS[td.key];
            const slotLabel = config.slots === 'unlimited' ? '∞' : String(config.slots);
            return (
              <Card key={td.key} className="text-center">
                <CardContent className="p-4">
                  <div className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", td.gradient)}>
                    {slotLabel}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {td.label} slots
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
