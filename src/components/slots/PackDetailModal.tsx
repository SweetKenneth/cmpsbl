/**
 * PackDetailModal — Two-step mobile-first modal system for capability packs.
 * Step 1: Overview card (name, description, activation toggle)
 * Step 2: Full details (components, use case, emergence clause)
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Package, Loader2, Sparkles, Shield, Zap, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArtifactPack } from '@/lib/quarry/types';
import type { SlotState } from '@/hooks/useArtifactSlots';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PackDetailModalProps {
  pack: ArtifactPack | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotState: SlotState;
  onActivate: (packId: string) => Promise<void>;
  onDeactivate: (packId: string) => Promise<void>;
  onSlotPressure: (packName: string) => void;
}

export function PackDetailModal({
  pack,
  open,
  onOpenChange,
  slotState,
  onActivate,
  onDeactivate,
  onSlotPressure,
}: PackDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'overview' | 'details'>('overview');

  if (!pack) return null;

  const isActive = slotState.isPackActive(pack.id);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      if (checked) {
        if (slotState.atCapacity) {
          onSlotPressure(pack.name);
          return;
        }
        await onActivate(pack.id);
      } else {
        await onDeactivate(pack.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (o: boolean) => {
    if (!o) {
      setStep('overview');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-md p-0 overflow-hidden border-0",
        isActive ? "ring-1 ring-primary/30" : ""
      )}>
        <AnimatePresence mode="wait" initial={false}>
          {step === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Colored header band */}
              <div className={cn(
                "px-5 pt-5 pb-4",
                isActive
                  ? "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
                  : "bg-gradient-to-br from-muted/80 via-muted/30 to-transparent"
              )}>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      isActive
                        ? "bg-primary/20 ring-1 ring-primary/30"
                        : "bg-muted ring-1 ring-border/50"
                    )}>
                      <Package className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="text-lg font-black tracking-tight">{pack.name}</DialogTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={isActive ? "default" : "outline"}
                          className={cn(
                            "text-[10px] px-2 py-0",
                            isActive && "bg-primary text-primary-foreground"
                          )}
                        >
                          {isActive ? '● Active' : '1 slot'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* Body */}
              <div className="px-5 pb-5 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pack.description}
                </p>

                {/* Activation toggle */}
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  isActive ? "border-primary/20 bg-primary/5" : "border-border/50 bg-muted/30"
                )}>
                  <div>
                    <p className="text-sm font-bold">{isActive ? 'Pack Active' : 'Activate Pack'}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {slotState.remaining} of {slotState.capacity} slots remaining
                    </p>
                  </div>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Switch
                      checked={isActive}
                      onCheckedChange={handleToggle}
                      aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${pack.name}`}
                    />
                  )}
                </div>

                {/* View details button */}
                <Button
                  variant="ghost"
                  className="w-full justify-between text-sm font-semibold h-11 text-primary hover:text-primary hover:bg-primary/5"
                  onClick={() => setStep('details')}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    View Components & Details
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="max-h-[80vh] overflow-y-auto"
            >
              {/* Colored header */}
              <div className="px-5 pt-4 pb-3 bg-gradient-to-br from-primary/10 via-transparent to-transparent sticky top-0 z-10 backdrop-blur-sm">
                <button
                  onClick={() => setStep('overview')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to overview
                </button>
                <h3 className="text-base font-black tracking-tight">{pack.name} — Details</h3>
              </div>

              <div className="px-5 pb-5 space-y-5">
                {/* Use Case */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="text-sm font-bold mb-1.5 text-foreground flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Use Case
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pack.useCase}
                  </p>
                </div>

                {/* Components */}
                {pack.components && pack.components.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold mb-2.5 text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Components &amp; Capabilities
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {pack.components.map((component, i) => (
                        <div
                          key={i}
                          className="text-xs text-muted-foreground bg-muted/50 border border-border/30 rounded-md px-3 py-2 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>{component}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why This Pack Matters */}
                {pack._emergenceClause && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <h4 className="text-sm font-bold mb-1.5 text-foreground flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      Why This Pack Matters
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pack._emergenceClause}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
