/**
 * Capability Detail Modal
 * Shows detailed capability information
 * v1.2.0 — Fixed viewport centering on mobile using Drawer pattern
 */

import { 
  X, 
  Download, 
  Clock, 
  Package, 
  Layers,
  Cpu,
  Loader2,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  formatPrice, 
  getTierConfig, 
  type CapabilityArtifact,
  type CapabilityCategory,
} from '@/lib/capabilities/depot';
import { useCapabilityCheckout } from '@/hooks/useCapabilityCheckout';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface CapabilityDetailModalProps {
  capability: CapabilityArtifact;
  categoryConfig: Record<CapabilityCategory, { icon: React.ElementType; label: string; colorClass: string }>;
  onClose: () => void;
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

function ModalContent({ capability, categoryConfig }: { capability: CapabilityArtifact; categoryConfig: CapabilityDetailModalProps['categoryConfig'] }) {
  const config = categoryConfig[capability.category];
  const CategoryIcon = config?.icon;
  const isSynergy = capability.id.startsWith('syn-');
  
  const lastUpdated = new Date(capability.lastUpdated);
  const daysAgo = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const updatedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  return (
    <div className="space-y-5">
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          config?.colorClass || 'bg-muted text-muted-foreground'
        )}>
          {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
          {config?.label || capability.category}
        </div>
        
        {isSynergy && (
          <Badge variant="outline" className="text-xs border-violet-500/30 bg-violet-500/10 text-violet-400">
            <Zap className="w-2.5 h-2.5 mr-1" />
            Synergy
          </Badge>
        )}
        <Badge variant="outline" className={cn("text-xs", tierColors[capability.pricingTier])}>
          {getTierConfig(capability.pricingTier).badge}
        </Badge>
      </div>
      
      {/* Version info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono">v{capability.version}</span>
        <span className="text-muted-foreground/30">•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {updatedLabel}
        </span>
      </div>

      {/* Description */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{capability.description}</p>
      </div>
      
      {/* Features */}
      {capability.features && capability.features.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Features</h4>
          <ul className="space-y-2">
            {capability.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Technical Details - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
            <Cpu className="w-3 h-3" />
            Executor
          </div>
          <div className="text-sm font-medium text-foreground capitalize">
            {capability.executorType}
          </div>
        </div>
        
        <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
            <Package className="w-3 h-3" />
            Format
          </div>
          <div className="text-sm font-medium text-foreground uppercase">
            {capability.artifactFormat}
          </div>
        </div>
        
        {capability.difficulty && (
          <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
            <div className="text-[10px] text-muted-foreground mb-1">Difficulty</div>
            <div className={cn("text-sm font-medium capitalize", difficultyColors[capability.difficulty])}>
              {capability.difficulty}
            </div>
          </div>
        )}
        
        {capability.setupTimeMinutes && (
          <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
            <div className="text-[10px] text-muted-foreground mb-1">Setup</div>
            <div className="text-sm font-medium text-foreground">
              ~{capability.setupTimeMinutes}m
            </div>
          </div>
        )}
      </div>
      
      {/* Required Modules */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Required Modules
        </h4>
        <div className="flex flex-wrap gap-2">
          {capability.requiredModules.map((module) => (
            <Badge key={module} variant="secondary" className="text-xs">
              {module}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Downloads */}
      {capability.downloads && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Download className="w-4 h-4" />
          {capability.downloads.toLocaleString()} downloads
        </div>
      )}
    </div>
  );
}

function ModalFooter({ capability, onClose }: { capability: CapabilityArtifact; onClose: () => void }) {
  const { checkout, loading, isAvailable, getPrice, isOffMenu, isRecursive, isSTier } = useCapabilityCheckout();
  const isSynergy = capability.id.startsWith('syn-');
  const hasCheckout = isAvailable(capability.id);
  const isOffMenuCapability = isOffMenu(capability.id);
  const isRecursiveCapability = isRecursive(capability.id);
  const isSTierCapability = isSTier(capability.id);
  const isPremium = isRecursiveCapability || isSTierCapability;
  
  // Get normalized price from Stripe config (null for off-menu)
  const displayPrice = getPrice(capability.id);
  const priceLabel = isOffMenuCapability || displayPrice === null 
    ? 'Licensed on request' 
    : formatPrice(displayPrice);

  const handleBuy = async () => {
    if (hasCheckout) {
      await checkout(capability.id, capability.name);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Price */}
      <div className="flex items-center justify-between">
        <div>
          <div className={cn(
            "text-2xl font-black",
            isOffMenuCapability ? "text-muted-foreground text-lg" : isPremium ? "text-primary" : "text-foreground"
          )}>
            {priceLabel}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="w-3 h-3" />
            {isOffMenuCapability ? 'Enterprise' : 'Licensed Artifact'}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          asChild 
          className="flex-1 h-12 text-base touch-manipulation"
        >
          <a href="/support">
            Support
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
        {isOffMenuCapability ? (
          <Button 
            size="lg"
            onClick={handleBuy}
            variant="secondary"
            className="flex-1 h-12 text-base touch-manipulation"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Inquire
          </Button>
        ) : (
          <Button 
            size="lg"
            onClick={handleBuy}
            disabled={loading || !hasCheckout}
            className={cn(
              "flex-1 h-12 text-base touch-manipulation",
              isRecursiveCapability && "bg-primary hover:bg-primary/90",
              isSTierCapability && !isRecursiveCapability && "bg-cyan-600 hover:bg-cyan-500",
              isSynergy && !isPremium && "bg-violet-600 hover:bg-violet-700"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Package className="w-4 h-4 mr-2" />
            )}
            Buy Now
          </Button>
        )}
      </div>
    </div>
  );
}

export function CapabilityDetailModal({ capability, categoryConfig, onClose }: CapabilityDetailModalProps) {
  const isMobile = useIsMobile();

  // Mobile: Use Drawer (slides up from bottom, proper viewport handling)
  if (isMobile) {
    return (
      <Drawer open onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="text-xl font-bold pr-8">
              {capability.name}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Details for {capability.name} capability
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 pb-4 overflow-y-auto flex-1">
            <ModalContent capability={capability} categoryConfig={categoryConfig} />
          </div>
          
          <DrawerFooter className="pt-2 border-t border-border/50">
            <ModalFooter capability={capability} onClose={onClose} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Dialog (centered modal)
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">
            {capability.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Details for {capability.name} capability
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 pr-2 -mr-2">
          <ModalContent capability={capability} categoryConfig={categoryConfig} />
        </div>
        
        <div className="pt-4 mt-4 border-t border-border/50">
          <ModalFooter capability={capability} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
