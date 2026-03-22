/**
 * Capability Card — Individual capability display for depot
 * Unified Pricing ($19-$299 public, off-menu licensed on request)
 */

import { 
  Download, 
  Clock, 
  Package, 
  ChevronRight,
  Layers,
  Cpu,
  Loader2,
  Zap,
  Crown,
  Sparkles,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  getTierConfig, 
  type CapabilityArtifact,
  type CapabilityCategory,
  getPricingLabel,
} from '@/lib/capabilities/depot';
import { useCapabilityCheckout } from '@/hooks/useCapabilityCheckout';
import { cn } from '@/lib/utils';

interface CapabilityCardProps {
  capability: CapabilityArtifact;
  categoryConfig: Record<CapabilityCategory, { icon: React.ElementType; label: string; colorClass: string }>;
  onViewDetails: () => void;
}

// Colorful tier badges (applied to badge only, not as page overlay)
const tierColors: Record<string, string> = {
  utility: 'border-neon-green/30 bg-neon-green/10 text-neon-green',
  advanced: 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan',
  system: 'border-primary/30 bg-primary/10 text-primary',
  flagship: 'border-neon-amber/30 bg-neon-amber/10 text-neon-amber',
};

const difficultyColors: Record<string, string> = {
  beginner: 'text-neon-green',
  intermediate: 'text-neon-cyan',
  advanced: 'text-neon-amber',
  expert: 'text-neon-magenta',
};

export function CapabilityCard({ capability, categoryConfig, onViewDetails }: CapabilityCardProps) {
  const config = categoryConfig[capability.category];
  const CategoryIcon = config?.icon;
  const tierConfig = getTierConfig(capability.pricingTier);
  const { 
    checkout, 
    loading, 
    getPrice,
    isAvailable, 
    isCheckoutEnabled,
    isOffMenu,
    isRecursive, 
    isSTier,
  } = useCapabilityCheckout();
  
  const isSynergy = capability.id.startsWith('syn-');
  const hasCheckout = isAvailable(capability.id);
  const checkoutEnabled = isCheckoutEnabled(capability.id);
  const isOffMenuCapability = isOffMenu(capability.id);
  const isRecursiveCapability = isRecursive(capability.id);
  const isSTierCapability = isSTier(capability.id);
  
  // Get normalized price (null for off-menu)
  const displayPrice = getPrice(capability.id);
  const priceLabel = getPricingLabel(displayPrice, isOffMenuCapability);
  
  // Format last updated
  const lastUpdated = new Date(capability.lastUpdated);
  const daysAgo = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const updatedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  const handleBuy = async () => {
    if (hasCheckout) {
      await checkout(capability.id, capability.name);
    }
  };

  // Premium styling (colorful accents on card borders, not overlays)
  const isPremium = isRecursiveCapability || isSTierCapability;
  const premiumBorder = isRecursiveCapability 
    ? 'ring-1 ring-primary/30 hover:ring-primary/50'
    : isSTierCapability
      ? 'ring-1 ring-neon-cyan/30 hover:ring-neon-cyan/50'
      : '';

  return (
    <div className="group">
      <Card className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1",
        "border-border/50 hover:border-border",
        premiumBorder
      )}>
        <CardContent className="relative flex-1 p-4 md:p-5">
          {/* Header: Category + Tier Badges */}
          <div className="flex items-start justify-between gap-2 mb-3 md:mb-4">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] md:text-xs font-medium",
              config?.colorClass || 'bg-muted text-muted-foreground'
            )}>
              {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
              {config?.label || capability.category}
            </div>
            
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {isOffMenuCapability && (
                <Badge className="text-[10px] bg-muted text-muted-foreground border-border">
                  <Crown className="w-2.5 h-2.5 mr-1" />
                  Enterprise
                </Badge>
              )}
              {isRecursiveCapability && (
                <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/10 text-primary">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  Recursive
                </Badge>
              )}
              {isSTierCapability && !isRecursiveCapability && (
                <Badge variant="outline" className="text-[10px] border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
                  <Zap className="w-2.5 h-2.5 mr-1" />
                  S-Tier
                </Badge>
              )}
              {isSynergy && !isPremium && !isOffMenuCapability && (
                <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/10 text-primary">
                  <Zap className="w-2.5 h-2.5 mr-1" />
                  Synergy
                </Badge>
              )}
              {!isOffMenuCapability && (
                <Badge variant="outline" className={cn("text-[10px]", tierColors[capability.pricingTier])}>
                  {tierConfig.badge}
                </Badge>
              )}
            </div>
          </div>

          {/* Title + Version */}
          <div className="mb-2 md:mb-3">
            <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {capability.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] md:text-xs font-mono text-muted-foreground">v{capability.version}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {updatedLabel}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3 md:mb-4">
            {capability.description}
          </p>

          {/* Meta info - compact on mobile */}
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
              <Layers className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[120px] md:max-w-none">
                {capability.requiredModules.slice(0, 2).join(', ')}
                {capability.requiredModules.length > 2 && ` +${capability.requiredModules.length - 2}`}
              </span>
            </div>
          </div>

          {/* Executor type + Difficulty - row on mobile */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-[10px] md:text-xs">
              <Cpu className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground capitalize">{capability.executorType}</span>
            </div>
            
            {capability.difficulty && (
              <div className={cn("text-[10px] md:text-xs font-medium capitalize", difficultyColors[capability.difficulty])}>
                {capability.difficulty}
              </div>
            )}

            {capability.setupTimeMinutes && (
              <div className="text-[10px] md:text-xs text-muted-foreground">
                ~{capability.setupTimeMinutes}m
              </div>
            )}
          </div>

          {/* Downloads */}
          {capability.downloads && (
            <div className="flex items-center gap-1.5 mt-2 md:mt-3 text-[10px] md:text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              {capability.downloads.toLocaleString()} downloads
            </div>
          )}
        </CardContent>

        <CardFooter className="relative p-3 md:p-4 pt-0 flex items-center justify-between border-t border-border/30 mt-auto">
          {/* Price */}
          <div>
            <div className={cn(
              "text-xl md:text-2xl font-black",
              isOffMenuCapability ? "text-muted-foreground text-base md:text-lg" : isPremium ? "text-primary" : "text-foreground"
            )}>
              {priceLabel}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Download className="w-2.5 h-2.5" />
              {isOffMenuCapability ? 'Enterprise' : 'Licensed'}
            </div>
          </div>

          {/* Actions - touch-friendly */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onViewDetails}
              className="h-9 px-3 touch-manipulation text-xs md:text-sm"
            >
              Details
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
            
            {isOffMenuCapability ? (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleBuy}
                className="h-9 px-3 touch-manipulation text-xs md:text-sm"
              >
                <Mail className="w-3 h-3 mr-1" />
                Inquire
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={handleBuy}
                disabled={loading || !checkoutEnabled}
                className={cn(
                  "h-9 px-3 touch-manipulation text-xs md:text-sm",
                  isRecursiveCapability && "bg-primary hover:bg-primary/90",
                  isSTierCapability && !isRecursiveCapability && "bg-neon-cyan hover:bg-neon-cyan",
                  !isPremium && "bg-primary hover:bg-primary/90"
                )}
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Package className="w-3 h-3 mr-1" />
                )}
                Buy
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
