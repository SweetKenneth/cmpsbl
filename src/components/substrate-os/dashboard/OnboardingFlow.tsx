/**
 * OnboardingFlow — Guided onboarding for Free/Builder users
 * Step 1: Welcome → Step 2: Pick starter packs → Step 3: Confirmation
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, Check, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useArtifactSlots } from '@/hooks/useArtifactSlots';
import { ARTIFACT_PACKS } from '@/lib/quarry/types';
import { toast } from 'sonner';

const STARTER_PACKS = [
  'pack-persistent-memory',
  'pack-deep-research',
  'pack-workflow-automation',
  'pack-agent-composer',
  'pack-intent-resolution',
  'pack-threat-intelligence',
];

interface OnboardingFlowProps {
  tier: string;
  onComplete: () => void;
}

export function OnboardingFlow({ tier, onComplete }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'welcome' | 'pick' | 'done'>('welcome');
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const slots = useArtifactSlots(tier);

  // Check if onboarding is already completed
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('user_onboarding')
      .select('completed_at, step')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.completed_at) {
          setDismissed(true);
        } else if (data?.step) {
          setStep(data.step as any);
        }
        setLoading(false);
      });
  }, [user?.id]);

  const completeOnboarding = async () => {
    if (!user?.id) return;
    await supabase.from('user_onboarding').upsert({
      user_id: user.id,
      step: 'done',
      completed_at: new Date().toISOString(),
      completed_steps: ['welcome', 'pick', 'done'],
    }, { onConflict: 'user_id' });
    onComplete();
    setDismissed(true);
  };

  const handleActivatePack = async (packId: string) => {
    try {
      await slots.activate.mutateAsync(packId);
      toast.success('Pack activated!');
    } catch (e: any) {
      if (e.message === 'SLOT_LIMIT_REACHED') {
        toast.info('All slots filled! You\'re ready to go.');
        setStep('done');
      }
    }
  };

  const handleDismiss = async () => {
    await completeOnboarding();
  };

  if (loading || dismissed) return null;
  if (slots.activeCount >= 3 && step !== 'done') {
    // User already has packs, skip to done or dismiss
    return null;
  }

  const starterPackData = STARTER_PACKS.map(id => ARTIFACT_PACKS.find(p => p.id === id)).filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        className="relative rounded-2xl border border-primary/20 overflow-hidden"
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-card/80 to-card/60 backdrop-blur-xl" />

        <div className="relative p-6">
          {/* Dismiss */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-7 w-7 text-muted-foreground/40 hover:text-foreground"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>

          {step === 'welcome' && (
            <motion.div className="text-center space-y-4 py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Welcome to the Substrate</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  You have <span className="font-semibold text-foreground">{slots.capacity} Artifact Slots</span> available.
                  Activate your first packs to unlock substrate capabilities.
                </p>
              </div>
              <Button onClick={() => setStep('pick')} className="gap-2">
                Choose Your Packs <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 'pick' && (
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recommended Starter Packs</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {slots.activeCount}/{slots.capacity} SLOTS USED
                  </p>
                </div>
                {slots.activeCount > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setStep('done')} className="text-xs gap-1">
                    Done <Check className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {starterPackData.map(pack => {
                  if (!pack) return null;
                  const isActive = slots.isPackActive(pack.id);
                  const canActivate = !isActive && !slots.atCapacity;

                  return (
                    <motion.button
                      key={pack.id}
                      onClick={() => !isActive && canActivate && handleActivatePack(pack.id)}
                      disabled={isActive || !canActivate || slots.activate.isPending}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all',
                        isActive
                          ? 'border-primary/30 bg-primary/5'
                          : canActivate
                          ? 'border-border/30 hover:border-primary/30 hover:bg-primary/[0.03]'
                          : 'border-border/15 opacity-50'
                      )}
                      whileHover={canActivate ? { y: -2 } : {}}
                      whileTap={canActivate ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Package className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                        {isActive && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <h4 className="text-xs font-semibold text-foreground">{pack.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{pack.useCase}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div className="text-center space-y-4 py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">You're Set Up!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {slots.activeCount} pack{slots.activeCount !== 1 ? 's' : ''} activated. Explore your dashboard below.
                </p>
              </div>
              <Button variant="outline" onClick={completeOnboarding} className="text-xs">
                Got it
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
