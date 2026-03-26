/**
 * SlotPressureModal — Contextual upgrade trigger
 * Shown when user attempts to activate beyond capacity.
 * Purely structural messaging — no aggressive upsell.
 */
import { Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PRODUCT_TIERS, PRODUCT_TIER_LABELS, type ProductTier } from '@/lib/quarry/types';
import { cn } from '@/lib/utils';

interface SlotPressureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: ProductTier;
  packName?: string;
}

const TIER_ORDER: ProductTier[] = ['builder', 'studio', 'creator', 'architect', 'enterprise'];

export function SlotPressureModal({
  open,
  onOpenChange,
  currentTier,
  packName,
}: SlotPressureModalProps) {
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const nextTier = currentIdx < TIER_ORDER.length - 1 ? TIER_ORDER[currentIdx + 1] : null;
  const currentSlots = PRODUCT_TIERS[currentTier].slots;
  const nextSlots = nextTier ? PRODUCT_TIERS[nextTier].slots : currentSlots;
  const slotsGain = nextSlots - currentSlots;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Capacity Reached
          </DialogTitle>
          <DialogDescription>
            {packName
              ? `You tried to activate "${packName}" but all ${currentSlots} slots are in use.`
              : `All ${currentSlots} capability slots are currently active.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current vs Next comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/50 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Current</div>
              <div className="text-2xl font-bold">{currentSlots}</div>
              <div className="text-xs text-muted-foreground">{PRODUCT_TIER_LABELS[currentTier]}</div>
            </div>
            {nextTier && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <div className="text-xs text-primary mb-1">Next</div>
                <div className="text-2xl font-bold text-primary">{nextSlots}</div>
                <div className="text-xs text-muted-foreground">{PRODUCT_TIER_LABELS[nextTier]}</div>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {nextTier
              ? `Upgrade to unlock ${slotsGain} additional slot${slotsGain !== 1 ? 's' : ''}.`
              : 'You are on the highest capacity plan. Deactivate a pack to make room.'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Manage Packs
          </Button>
          {nextTier && (
            <Button className="flex-1" asChild>
              <Link to="/store?tab=plans" onClick={() => onOpenChange(false)}>
                View Plans <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
