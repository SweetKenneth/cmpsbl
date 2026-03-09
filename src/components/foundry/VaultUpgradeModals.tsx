/**
 * VaultUpgradeModals — Three upgrade modals for Memory Stream gating
 * 1. Vault Capacity Reached
 * 2. Daily Discovery Limit Reached
 * 3. Mythic Pipeline Discovered (vault full)
 * 
 * Mobile-first: min-h touch targets, safe-area padding, full-bleed on small screens
 */
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Archive, Sparkles, X, Zap } from 'lucide-react';

/* ─── Shared animated icon badge ─── */
function ModalIconBadge({ children, bgClass, borderClass }: {
  children: React.ReactNode;
  bgClass: string;
  borderClass: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15, delay: 0.1 }}
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${bgClass} border ${borderClass} flex items-center justify-center mx-auto mb-4`}
    >
      {children}
    </motion.div>
  );
}

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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-0 overflow-hidden border-amber-500/20">
        {/* Gradient header strip */}
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

        <div className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8">
          <DialogHeader className="space-y-3">
            <ModalIconBadge bgClass="bg-amber-500/10" borderClass="border-amber-500/20">
              <Archive className="w-7 h-7 text-amber-400" />
            </ModalIconBadge>
            <DialogTitle className="text-center text-lg sm:text-xl font-bold tracking-tight">
              Vault Capacity Reached
            </DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed max-w-xs mx-auto">
              Your vault is full and cannot store additional discoveries.
              Remove an existing pipeline or upgrade your plan to expand vault capacity.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-2.5 px-5 pb-6 pt-3 sm:px-8 sm:pb-8">
          <Button
            className="w-full min-h-[44px] gap-1.5 shadow-lg shadow-primary/25 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            onClick={() => { onOpenChange(false); navigate('/upgrade'); }}
          >
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Button>
          {onManageVault && (
            <Button
              variant="outline"
              className="w-full min-h-[44px] gap-1.5 hover:border-primary/30 transition-colors"
              onClick={() => { onOpenChange(false); onManageVault(); }}
            >
              <Archive className="w-4 h-4" /> Manage Vault
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full min-h-[44px] text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-0 overflow-hidden border-sky-500/20">
        <div className="h-1 bg-gradient-to-r from-sky-500 to-cyan-500" />

        <div className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8">
          <DialogHeader className="space-y-3">
            <ModalIconBadge bgClass="bg-sky-500/10" borderClass="border-sky-500/20">
              <Zap className="w-7 h-7 text-sky-400" />
            </ModalIconBadge>
            <DialogTitle className="text-center text-lg sm:text-xl font-bold tracking-tight">
              Daily Discovery Limit Reached
            </DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed max-w-xs mx-auto">
              You have used all Memory Stream pulls available for your plan today.
              Upgrade your plan to increase daily discovery capacity.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-2.5 px-5 pb-6 pt-3 sm:px-8 sm:pb-8">
          <Button
            className="w-full min-h-[44px] gap-1.5 shadow-lg shadow-primary/25 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            onClick={() => { onOpenChange(false); navigate('/upgrade'); }}
          >
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            className="w-full min-h-[44px] text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-0 overflow-hidden border-purple-500/30 ring-1 ring-purple-500/10">
        {/* Mythic gradient strip */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500" />

        <div className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8 relative">
          {/* Subtle radial glow behind icon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

          <DialogHeader className="space-y-3 relative">
            <ModalIconBadge bgClass="bg-purple-500/10" borderClass="border-purple-500/20">
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Sparkles className="w-7 h-7 text-purple-400" />
              </motion.div>
            </ModalIconBadge>
            <DialogTitle className="text-center text-lg sm:text-xl font-bold tracking-tight">
              Mythic Pipeline Discovered
            </DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed max-w-xs mx-auto">
              One of the rarest outcomes in the Memory Stream.
              Your vault is currently full.
              Upgrade now to store this discovery before it is lost.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-2.5 px-5 pb-6 pt-3 sm:px-8 sm:pb-8">
          <Button
            className="w-full min-h-[44px] gap-1.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            onClick={() => { onOpenChange(false); navigate('/upgrade'); }}
          >
            Upgrade Now <ArrowRight className="w-4 h-4" />
          </Button>
          {onManageVault && (
            <Button
              variant="outline"
              className="w-full min-h-[44px] gap-1.5 hover:border-purple-500/30 transition-colors"
              onClick={() => { onOpenChange(false); onManageVault(); }}
            >
              <Archive className="w-4 h-4" /> Manage Vault
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full min-h-[44px] text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => { onOpenChange(false); onDiscard?.(); }}
          >
            <X className="w-4 h-4 mr-1" /> Discard Discovery
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
