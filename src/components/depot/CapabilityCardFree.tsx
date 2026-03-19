/**
 * Capability Card (Free) — Unlocked capability display for depot
 * All capabilities FREE, no checkout
 */

import { 
  Clock, 
  ChevronRight,
  Layers,
  Cpu,
  Check,
  Unlock,
  Lock,
  Crown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  type CapabilityArtifact,
  type CapabilityCategory,
} from '@/lib/capabilities/depot';
import { isCrownJewelCapability } from '@/lib/capabilities/crown-jewel-gate';
import { cn } from '@/lib/utils';

interface CapabilityCardFreeProps {
  capability: CapabilityArtifact;
  categoryConfig: Record<CapabilityCategory, { icon: React.ElementType; label: string; colorClass: string }>;
  onViewDetails: () => void;
}

const difficultyColors: Record<string, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-cyan-400',
  advanced: 'text-amber-400',
  expert: 'text-rose-400',
};

export function CapabilityCardFree({ capability, categoryConfig, onViewDetails }: CapabilityCardFreeProps) {
  const config = categoryConfig[capability.category];
  const CategoryIcon = config?.icon;
  const isGated = isCrownJewelCapability(capability.id);
  
  // Format last updated
  const lastUpdated = new Date(capability.lastUpdated);
  const daysAgo = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const updatedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  return (
    <div className="group">
      <Card className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1",
        "border-border/50 hover:border-emerald-500/30"
      )}>
        <CardContent className="relative flex-1 p-4 md:p-5">
          {/* Header: Category Badge */}
          <div className="flex items-start justify-between gap-2 mb-3 md:mb-4">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] md:text-xs font-medium",
              config?.colorClass || 'bg-muted text-muted-foreground'
            )}>
              {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
              {config?.label || capability.category}
            </div>
            
            {/* FREE Badge */}
            {isGated ? (
              <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                <Crown className="w-2.5 h-2.5 mr-1" />
                ENTERPRISE
              </Badge>
            ) : (
              <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <Unlock className="w-2.5 h-2.5 mr-1" />
                FREE
              </Badge>
            )}
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

          {/* Meta info */}
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
              <Layers className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[120px] md:max-w-none">
                {capability.requiredModules.slice(0, 2).join(', ')}
                {capability.requiredModules.length > 2 && ` +${capability.requiredModules.length - 2}`}
              </span>
            </div>
          </div>

          {/* Executor type + Difficulty */}
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
        </CardContent>

        <CardFooter className="relative p-3 md:p-4 pt-0 flex items-center justify-between border-t border-border/30 mt-auto">
          {/* Status */}
          <div>
            {isGated ? (
              <>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Lock className="w-4 h-4" />
                  <span className="font-semibold text-sm">Enterprise Only</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Upgrade to unlock
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span className="font-semibold">Unlocked</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Available by default
                </div>
              </>
            )}
          </div>

          {/* View Details Button */}
          {isGated ? (
            <Button 
              size="sm" 
              variant="outline" 
              asChild
              className="h-9 px-3 touch-manipulation text-xs md:text-sm border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Link to="/store?tab=plans">
                Upgrade
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onViewDetails}
              className="h-9 px-3 touch-manipulation text-xs md:text-sm"
            >
              Details
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
