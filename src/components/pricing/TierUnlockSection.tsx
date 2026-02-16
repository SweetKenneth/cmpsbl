/**
 * "What You Unlock at Each Tier" — Pricing Page Expansion
 * Outcome-oriented language, no CMPSBL-only jewels exposed.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  getCapabilitiesByCategory, 
  CATEGORY_LABELS,
  type PublicCapability 
} from "@/lib/capabilities/public-capability-manifest";
import { Shield, Brain, Zap, FileCheck, Eye, Lock, Sparkles, Crown, Building2 } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  security: Shield,
  intelligence: Brain,
  optimization: Zap,
  compliance: FileCheck,
  observability: Eye,
};

const TIER_DISPLAY = [
  { 
    tier: 'creator' as const, 
    label: 'Creator', 
    price: '$49/mo', 
    gradient: 'from-blue-500 to-cyan-500',
    icon: Sparkles,
    tagline: '12 intelligent capabilities that optimize before you ask'
  },
  { 
    tier: 'architect' as const, 
    label: 'Architect', 
    price: '$149/mo', 
    gradient: 'from-violet-500 to-purple-500',
    icon: Crown,
    tagline: '14 advanced capabilities for security, compliance, and deep intelligence'
  },
  { 
    tier: 'enterprise' as const, 
    label: 'Enterprise', 
    price: 'Custom', 
    gradient: 'from-amber-500 to-orange-500',
    icon: Building2,
    tagline: 'Full sovereignty with source access and custom governance'
  },
];

function CategoryGroup({ category, capabilities }: { category: string; capabilities: PublicCapability[] }) {
  const meta = CATEGORY_LABELS[category] || { label: category, icon: '📦' };
  const Icon = CATEGORY_ICONS[category] || Zap;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {meta.label}
      </div>
      <div className="space-y-1.5">
        {capabilities.map((cap) => (
          <div key={cap.name} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5 shrink-0">•</span>
            <span className="text-muted-foreground">{cap.outcome_summary}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TierUnlockSection() {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
            <Lock className="w-3 h-3 mr-1.5 inline" />
            Tiered Intelligence
          </Badge>
          <h2 className="text-3xl font-bold mb-4">What You Unlock at Each Tier</h2>
          <p className="text-muted-foreground">
            Each tier adds autonomous capabilities that work behind the scenes — predicting, protecting, and optimizing without manual intervention.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TIER_DISPLAY.map((td) => {
            const grouped = getCapabilitiesByCategory(td.tier);
            const TierIcon = td.icon;
            
            return (
              <Card key={td.tier} className="relative overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${td.gradient}`} />
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${td.gradient} flex items-center justify-center`}>
                        <TierIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{td.label}</h3>
                        <span className="text-xs text-muted-foreground">{td.price}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{td.tagline}</p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(grouped).map(([category, caps]) => (
                      <CategoryGroup key={category} category={category} capabilities={caps} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Scarcity footer */}
        <TooltipProvider>
          <div className="max-w-3xl mx-auto mt-8 text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground/60 cursor-help hover:text-muted-foreground/80 transition-colors">
                  Not all Crown Jewels are released to the public.
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Some capabilities remain internal to preserve system integrity and long-term advantage.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
