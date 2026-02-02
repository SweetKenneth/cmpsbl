/**
 * Capability Detail Modal
 * Shows detailed capability information in a modal
 * v1.0.0
 */

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
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-2xl md:max-h-[85vh] overflow-auto rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 border-b border-border/50 bg-card/95 backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
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
                {tierConfig.badge}
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground">{capability.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono text-muted-foreground">v{capability.version}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {updatedLabel}
              </span>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground">{capability.description}</p>
          </div>
          
          {/* Features */}
          {capability.features && capability.features.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Features</h3>
              <ul className="space-y-2">
                {capability.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Technical Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Cpu className="w-3 h-3" />
                Executor Type
              </div>
              <div className="text-sm font-medium text-foreground capitalize">
                {capability.executorType}
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Package className="w-3 h-3" />
                Artifact Format
              </div>
              <div className="text-sm font-medium text-foreground uppercase">
                {capability.artifactFormat}
              </div>
            </div>
            
            {capability.difficulty && (
              <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Difficulty</div>
                <div className={cn("text-sm font-medium capitalize", difficultyColors[capability.difficulty])}>
                  {capability.difficulty}
                </div>
              </div>
            )}
            
            {capability.setupTimeMinutes && (
              <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Setup Time</div>
                <div className="text-sm font-medium text-foreground">
                  ~{capability.setupTimeMinutes} minutes
                </div>
              </div>
            )}
          </div>
          
          {/* Required Modules */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Required Modules
            </h3>
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
        
        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-4 p-6 border-t border-border/50 bg-card/95 backdrop-blur-sm">
          <div>
            <div className="text-3xl font-black text-foreground">
              {formatPrice(capability.priceUsd)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              Licensed Artifact
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <a href="/support" target="_blank" rel="noopener">
                Get Support
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
            <Button 
              size="lg"
              onClick={handleBuy}
              disabled={loading || !hasCheckout}
              className={cn(
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
