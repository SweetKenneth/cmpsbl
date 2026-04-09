/**
 * TrialBanner — Displays on Plans page and Vertical Portal
 * Shows trial CTA for free users, or trial countdown for active trials.
 */
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTrialAccess } from '@/hooks/useTrialAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Sparkles, Clock, ArrowUpRight } from 'lucide-react';

export function TrialBanner() {
  const { user } = useAuth();
  const { role, isGovernor } = useUserRole();
  const { isTrialActive, trialTier, daysRemaining, hasUsedTrial, startTrial, isLoading } = useTrialAccess();

  // Don't show for Governor or paid users or while loading
  if (isGovernor || isLoading) return null;
  if (role !== 'free' && !isTrialActive) return null;

  // Active trial countdown
  if (isTrialActive && trialTier) {
    const tierLabel = trialTier.charAt(0).toUpperCase() + trialTier.slice(1);
    return (
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {tierLabel} Trial — {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-xs text-muted-foreground">
                Subscribe now to keep your access and everything you've built.
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0" asChild>
            <Link to="/plans">
              Subscribe <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Already used trial — don't show CTA
  if (hasUsedTrial) return null;

  // Free user — show trial CTA
  if (!user) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-[hsl(var(--neon-cyan)/0.05)] p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Try any paid tier free for 7 days</p>
            <p className="text-xs text-muted-foreground">
              Full access to substrates, memory, and radio. No credit card required.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => startTrial('studio')} className="text-xs">
            Try Studio
          </Button>
          <Button size="sm" variant="outline" onClick={() => startTrial('creator')} className="text-xs">
            Try Creator
          </Button>
          <Button size="sm" onClick={() => startTrial('architect')} className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" /> Try Architect
          </Button>
        </div>
      </div>
    </div>
  );
}
