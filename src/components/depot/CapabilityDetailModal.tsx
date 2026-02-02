/**
 * Capability Detail Modal
 * Shows detailed capability information in a modal
 * v1.1.0 — Mobile-First Design
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
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
  formatPrice, 
  getTierConfig, 
  type CapabilityArtifact,
  type CapabilityCategory,
} from '@/lib/capabilities/depot';
import { useCapabilityCheckout } from '@/hooks/useCapabilityCheckout';
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

export function CapabilityDetailModal({ capability, categoryConfig, onClose }: CapabilityDetailModalProps) {
  const config = categoryConfig[capability.category];
  const CategoryIcon = config?.icon;
  const tierConfig = getTierConfig(capability.pricingTier);
  const { checkout, loading, isAvailable } = useCapabilityCheckout();
  
  const isSynergy = capability.id.startsWith('syn-');
  const hasCheckout = isAvailable(capability.id);
  
  const lastUpdated = new Date(capability.lastUpdated);
  const daysAgo = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const updatedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleBuy = async () => {
    if (hasCheckout) {
      await checkout(capability.id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      />
      
      {/* Modal - Full screen on mobile, centered card on desktop */}
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          "fixed z-50 bg-card shadow-2xl flex flex-col",
          // Mobile: full screen with safe areas
          "inset-0 rounded-none",
          // Tablet and up: centered modal
          "md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-full md:max-w-2xl md:max-h-[85vh] md:rounded-2xl md:border md:border-border"
        )}
      >
        {/* Header - Sticky with safe area padding */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-border/50 bg-card safe-area-pt">
          <div className="flex-1 min-w-0">
            {/* Category & Tier badges - horizontally scrollable on mobile */}
            <div className="flex items-center gap-2 mb-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              <div className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                config?.colorClass || 'bg-muted text-muted-foreground'
              )}>
                {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                {config?.label || capability.category}
              </div>
              
              {isSynergy && (
                <Badge variant="outline" className="shrink-0 text-xs border-violet-500/30 bg-violet-500/10 text-violet-400">
                  <Zap className="w-2.5 h-2.5 mr-1" />
                  Synergy
                </Badge>
              )}
              <Badge variant="outline" className={cn("shrink-0 text-xs", tierColors[capability.pricingTier])}>
                {tierConfig.badge}
              </Badge>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{capability.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
              <span className="font-mono text-muted-foreground">v{capability.version}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {updatedLabel}
              </span>
            </div>
          </div>
          
          {/* Close button - Large touch target */}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-3 -m-2 rounded-full hover:bg-muted/50 active:bg-muted transition-colors touch-manipulation"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{capability.description}</p>
          </div>
          
          {/* Features */}
          {capability.features && capability.features.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Features</h3>
              <ul className="space-y-2.5">
                {capability.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Technical Details - 2x2 grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-muted/30">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground mb-1">
                <Cpu className="w-3 h-3" />
                Executor
              </div>
              <div className="text-xs sm:text-sm font-medium text-foreground capitalize">
                {capability.executorType}
              </div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-muted/30">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground mb-1">
                <Package className="w-3 h-3" />
                Format
              </div>
              <div className="text-xs sm:text-sm font-medium text-foreground uppercase">
                {capability.artifactFormat}
              </div>
            </div>
            
            {capability.difficulty && (
              <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-muted/30">
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Difficulty</div>
                <div className={cn("text-xs sm:text-sm font-medium capitalize", difficultyColors[capability.difficulty])}>
                  {capability.difficulty}
                </div>
              </div>
            )}
            
            {capability.setupTimeMinutes && (
              <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-muted/30">
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Setup</div>
                <div className="text-xs sm:text-sm font-medium text-foreground">
                  ~{capability.setupTimeMinutes}m
                </div>
              </div>
            )}
          </div>
          
          {/* Required Modules - Scrollable on mobile */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Required Modules
            </h3>
            <div className="flex flex-wrap gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
              {capability.requiredModules.map((module) => (
                <Badge key={module} variant="secondary" className="shrink-0 text-xs">
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
          
          {/* Bottom padding for safe area on mobile */}
          <div className="h-2 sm:h-0" />
        </div>
        
        {/* Footer - Fixed at bottom with safe area */}
        <div className="sticky bottom-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-t border-border/50 bg-card safe-area-pb">
          {/* Price */}
          <div className="flex items-center justify-between sm:block">
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {formatPrice(capability.priceUsd)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              Licensed Artifact
            </div>
          </div>
          
          {/* Action Buttons - Full width on mobile */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
            >
              <a href="/support">
                Support
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
            <Button 
              size="lg"
              onClick={handleBuy}
              disabled={loading || !hasCheckout}
              className={cn(
                "flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm touch-manipulation",
                isSynergy && "bg-violet-600 hover:bg-violet-700"
              )}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Package className="w-4 h-4 mr-2" />
              )}
              Buy Now
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
