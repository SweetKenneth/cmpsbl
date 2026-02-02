/**
 * Capability Card — Individual capability display for depot
 * v1.2.0 — Performance Optimized with Static Classes
 */

import { Link } from 'react-router-dom';
import { 
  Download, 
  Clock, 
  Package, 
  ChevronRight,
  Layers,
  Cpu,
  Loader2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  formatPrice, 
  getTierConfig, 
  type CapabilityArtifact,
  type CapabilityCategory,
} from '@/lib/capabilities/depot';
import { useCapabilityCheckout } from '@/hooks/useCapabilityCheckout';
import { cn } from '@/lib/utils';

interface CapabilityCardProps {
  capability: CapabilityArtifact;
  categoryConfig: Record<CapabilityCategory, { icon: React.ElementType; label: string; colorClass: string }>;
}

const tierColors: Record<string, string> = {
  utility: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  advanced: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-500',
  system: 'border-violet-500/30 bg-violet-500/10 text-violet-500',
  flagship: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
};

const difficultyColors: Record<string, string> = {
  beginner: 'text-emerald-500',
  intermediate: 'text-cyan-500',
  advanced: 'text-amber-500',
  expert: 'text-rose-500',
};

export function CapabilityCard({ capability, categoryConfig }: CapabilityCardProps) {
  const config = categoryConfig[capability.category];
  const CategoryIcon = config?.icon;
  const tierConfig = getTierConfig(capability.pricingTier);
  const { checkout, loading, isAvailable } = useCapabilityCheckout();
  
  const isSynergy = capability.id.startsWith('syn-');
  const hasCheckout = isAvailable(capability.id);
  
  // Format last updated
  const lastUpdated = new Date(capability.lastUpdated);
  const daysAgo = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const updatedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  const handleBuy = async () => {
    if (hasCheckout) {
      await checkout(capability.id);
    }
  };

  return (
    <div className="group">
      <Card className={cn(
        "h-full flex flex-col overflow-hidden border-border/50 hover:border-primary/30 transition-colors hover:-translate-y-1 duration-200",
        isSynergy && "ring-1 ring-violet-500/20"
      )}>
        <CardContent className="flex-1 p-5">
          {/* Header: Category + Tier */}
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              config?.colorClass || 'bg-muted text-muted-foreground'
            )}>
              {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
              {config?.label || capability.category}
            </div>
            
            <div className="flex items-center gap-1.5">
              {isSynergy && (
                <Badge variant="outline" className="text-xs border-violet-500/30 bg-violet-500/10 text-violet-400">
                  <Zap className="w-2.5 h-2.5 mr-1" />
                  Synergy
                </Badge>
              )}
              <Badge variant="outline" className={cn("text-xs", tierColors[capability.pricingTier])}>
                {tierConfig.badge}
              </Badge>
            </div>
          </div>

          {/* Title + Version */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {capability.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-muted-foreground">v{capability.version}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {updatedLabel}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {capability.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Required modules */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="w-3 h-3" />
              {capability.requiredModules.slice(0, 3).join(', ')}
              {capability.requiredModules.length > 3 && ` +${capability.requiredModules.length - 3}`}
            </div>
          </div>

          {/* Executor type + Difficulty */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <Cpu className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground capitalize">{capability.executorType}</span>
            </div>
            
            {capability.difficulty && (
              <div className={cn("text-xs font-medium capitalize", difficultyColors[capability.difficulty])}>
                {capability.difficulty}
              </div>
            )}

            {capability.setupTimeMinutes && (
              <div className="text-xs text-muted-foreground">
                ~{capability.setupTimeMinutes}m setup
              </div>
            )}
          </div>

          {/* Downloads */}
          {capability.downloads && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              {capability.downloads.toLocaleString()} downloads
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/30 mt-auto">
          {/* Price */}
          <div>
            <div className="text-2xl font-black text-foreground">
              {formatPrice(capability.priceUsd)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Download className="w-2.5 h-2.5" />
              Licensed
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to={`/capabilities/${capability.slug}`}>
                Details
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
            <Button 
              size="sm" 
              onClick={handleBuy}
              disabled={loading || !hasCheckout}
              className={cn(
                isSynergy && "bg-violet-600 hover:bg-violet-700"
              )}
            >
              {loading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Package className="w-3 h-3 mr-1" />
              )}
              Buy
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
