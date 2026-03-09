/**
 * VaultUpgradeModals — Three upgrade modals for Memory Stream gating
 * 1. Vault Capacity Reached
 * 2. Daily Discovery Limit Reached
 * 3. Mythic Pipeline Discovered (vault full)
 */
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Archive, Sparkles, X } from 'lucide-react';

/* ─── Modal 1: Vault Capacity ─── */
export function VaultCapacityModal({
  open,
  onOpenChange,
  onManageVault,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onManageVault?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <Archive className="w-6 h-6 text-amber-400" />
          </div>
          <DialogTitle className="text-center text-xl">Vault Capacity Reached</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Your vault is full and cannot store additional discoveries.
            Remove an existing pipeline or upgrade your plan to expand vault capacity.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
          <Button className="w-full" onClick={() => { onOpenChange(false); navigate('/upgrade'); }}>
            Upgrade Plan <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          {onManageVault && (
            <Button variant="outline" className="w-full" onClick={() => { onOpenChange(false); onManageVault(); }}>
              Manage Vault
            </Button>
          )}
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 2: Daily Pull Limit ─── */
export function DailyLimitModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-sky-400" />
          </div>
          <DialogTitle className="text-center text-xl">Daily Discovery Limit Reached</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            You have used all Memory Stream pulls available for your plan today.
            Upgrade your plan to increase discovery capacity.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
          <Button className="w-full" onClick={() => { onOpenChange(false); navigate('/upgrade'); }}>
            Upgrade Plan <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 3: Mythic Discovery ─── */
export function MythicDiscoveryModal({
  open,
  onOpenChange,
  onManageVault,
  onDiscard,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onManageVault?: () => void;
  onDiscard?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <DialogTitle className="text-center text-xl">Mythic Pipeline Discovered</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            One of the rarest outcomes in the Memory Stream.
            Your vault is currently full.
            Upgrade now to store this discovery before it is lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
          <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0 hover:opacity-90" onClick={() => { onOpenChange(false); navigate('/upgrade'); }}>
            Upgrade Now <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          {onManageVault && (
            <Button variant="outline" className="w-full" onClick={() => { onOpenChange(false); onManageVault(); }}>
              Manage Vault
            </Button>
          )}
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { onOpenChange(false); onDiscard?.(); }}>
            <X className="w-4 h-4 mr-1" /> Discard Discovery
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
