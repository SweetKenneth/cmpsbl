/**
 * Capability Detail Modal
 * Shows detailed capability information with code preview
 * Code snippets + CodeLab integration
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  Clock, 
  Package, 
  Layers,
  Cpu,
  Zap,
  CheckCircle2,
  Unlock,
  Code,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Lock,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  getTierConfig, 
  type CapabilityArtifact,
  type CapabilityCategory,
} from '@/lib/capabilities/depot';
import { getCodeSnippet, getSDKImport, getQuickStartSnippet } from '@/lib/capabilities/depot/code-snippets';
import { isCrownJewelCapability, isSourcePreviewBlocked, isCopyBlocked } from '@/lib/capabilities/crown-jewel-gate';
import { isExperienceCrownJewel } from '@/lib/capabilities/crown-jewel-registry';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CapabilityDetailModalProps {
  capability: CapabilityArtifact;
  categoryConfig: Record<CapabilityCategory, { icon: React.ElementType; label: string; colorClass: string }>;
  onClose: () => void;
}

const tierColors: Record<string, string> = {
  utility: 'border-neon-green/30 bg-neon-green/10 text-neon-green',
  advanced: 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan',
  system: 'border-neon-purple/30 bg-neon-purple/10 text-neon-purple',
  flagship: 'border-neon-amber/30 bg-neon-amber/10 text-neon-amber',
};

const difficultyColors: Record<string, string> = {
  beginner: 'text-neon-green',
  intermediate: 'text-neon-cyan',
  advanced: 'text-neon-amber',
  expert: 'text-neon-magenta',
};

function ModalContent({ capability, categoryConfig }: { capability: CapabilityArtifact; categoryConfig: CapabilityDetailModalProps['categoryConfig'] }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'code'>('code');
  const isGated = isCrownJewelCapability(capability.id);
  const isBlackBoxed = isExperienceCrownJewel(capability.id);
  const isCodeBlocked = isSourcePreviewBlocked(capability.id, capability.name);
  const isCopyDisabled = isCopyBlocked(capability.id, capability.name);
  
  const config = categoryConfig[capability.category];
  const CategoryIcon = config?.icon;
  const isSynergy = capability.id.startsWith('syn-');
  
  const lastUpdated = new Date(capability.lastUpdated);
  const daysAgo = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const updatedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  const codeSnippet = getCodeSnippet(capability);
  const sdkImport = getSDKImport(capability);
  const quickStart = getQuickStartSnippet(capability);

  const handleCopy = async (text: string) => {
    if (isCopyDisabled) {
      toast.error('Copy disabled — this artifact is black-box protected');
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <Badge variant="outline" className="text-xs border-neon-purple/30 bg-neon-purple/10 text-neon-purple">
            <Zap className="w-2.5 h-2.5 mr-1" />
            Synergy
          </Badge>
        )}
        <Badge variant="outline" className={cn("text-xs", tierColors[capability.pricingTier])}>
          {getTierConfig(capability.pricingTier).badge}
        </Badge>
        
        {isGated ? (
          <Badge className="text-xs bg-neon-amber/10 text-neon-amber border-neon-amber/30">
            <Crown className="w-2.5 h-2.5 mr-1" />
            ENTERPRISE ONLY
          </Badge>
        ) : (
          <Badge className="text-xs bg-neon-green/10 text-neon-green border-neon-green/30">
            <Unlock className="w-2.5 h-2.5 mr-1" />
            FREE
          </Badge>
        )}
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

      {/* Tabs: Code (default) | Overview */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'code')} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="code" className="gap-2">
            <Code className="w-4 h-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <Package className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* CODE TAB */}
        <TabsContent value="code" className="mt-4 space-y-4">
          {(isGated || isBlackBoxed) ? (
            <div className={cn(
              "p-6 rounded-xl border text-center space-y-3",
              isBlackBoxed && !isGated
                ? "border-neon-amber/20 bg-neon-amber/5"
                : "border-neon-amber/20 bg-neon-amber/5"
            )}>
              <Lock className={cn("w-10 h-10 mx-auto", isBlackBoxed && !isGated ? "text-neon-amber" : "text-neon-amber")} />
              <h4 className="text-lg font-bold text-foreground">
                {isGated ? 'Enterprise Only' : 'Sealed Runtime'}
              </h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {isGated 
                  ? 'This Apex Discovery capability requires an Enterprise subscription. Upgrade to unlock code snippets, SDK imports, and full documentation.'
                  : 'This artifact is delivered as a black-boxed runtime. Source code, export, and cloning are permanently disabled to protect proprietary architecture.'}
              </p>
              <Button asChild className={cn("mt-2", isBlackBoxed && !isGated ? "bg-neon-amber hover:bg-neon-amber" : "bg-neon-amber hover:bg-neon-amber")}>
                <Link to="/store?tab=plans">
                  <Crown className="w-4 h-4 mr-2" />
                  {isGated ? 'View Enterprise Plans' : 'View Plans'}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Quick Import */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    SDK Import
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(sdkImport)}
                    className="h-7 px-2 text-xs"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="p-3 rounded-lg bg-muted/50 border border-border/50 text-xs font-mono overflow-x-auto">
                  <code className="text-primary">{sdkImport}</code>
                </pre>
              </div>

              {/* Full Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">Full Example</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(codeSnippet)}
                    className="h-7 px-2 text-xs"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="p-4 rounded-lg bg-muted/50 border border-border/50 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                  <code className="text-muted-foreground whitespace-pre">{codeSnippet}</code>
                </pre>
              </div>

              {/* Open in Playground CTA */}
              <Button asChild className="w-full" variant="outline">
                <Link to={`/codelab?capability=${capability.id}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Playground
                </Link>
              </Button>
            </>
          )}
        </TabsContent>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4 space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ModalFooter({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Free Status */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-black text-neon-green flex items-center gap-2">
            <Unlock className="w-5 h-5" />
            FREE
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3" />
            Unlocked — Available by default
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex-1 h-12 text-base touch-manipulation"
        >
          Close
        </Button>
        <Button 
          size="lg"
          asChild
          className="flex-1 h-12 text-base touch-manipulation bg-neon-green hover:bg-neon-green"
        >
          <a href="/support">
            <Download className="w-4 h-4 mr-2" />
            Get Support
          </a>
        </Button>
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
            <ModalFooter onClose={onClose} />
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
          <ModalFooter onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
