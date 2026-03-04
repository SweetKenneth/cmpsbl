/**
 * OnboardingFlow — Guided onboarding for Free/Builder users
 * Step 1: Welcome → Step 2: Pick starter packs (reversible) → Step 3: Confirmation
 * Users can toggle packs on/off freely before completing.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, Check, ArrowRight, ArrowLeft, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useArtifactSlots } from '@/hooks/useArtifactSlots';
import { ARTIFACT_PACKS } from '@/lib/quarry/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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
  const [toggling, setToggling] = useState<string | null>(null);
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

  const handleTogglePack = async (packId: string) => {
    setToggling(packId);
    try {
      const isActive = slots.isPackActive(packId);
      if (isActive) {
        // Allow deactivation — user can change their mind
        await slots.deactivate.mutateAsync(packId);
        toast.success('Pack deactivated — choose another if you like.');
      } else {
        if (slots.atCapacity) {
          toast.info('All slots filled! Deactivate a pack first to swap.');
          return;
        }
        await slots.activate.mutateAsync(packId);
        toast.success('Pack activated!');
      }
    } catch (e: any) {
      if (e.message === 'SLOT_LIMIT_REACHED') {
        toast.info('All slots filled! Deactivate a pack first to swap.');
      }
    } finally {
      setToggling(null);
    }
  };

  const handleDismiss = async () => {
    await completeOnboarding();
  };

  if (loading || dismissed) return null;
  if (slots.activeCount >= 3 && step !== 'done' && step !== 'pick') {
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

        <div className="relative p-5 sm:p-6">
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
                <h3 className="text-lg font-bold text-foreground">Welcome to the Memory Stream</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  You have <span className="font-semibold text-foreground">{slots.capacity} Pipeline Slots</span> available.
                  Choose your starter packs — you can change your mind anytime.
                </p>
              </div>
              <Button onClick={() => setStep('pick')} className="gap-2">
                Choose Your Packs <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 'pick' && (
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Choose Your Starter Packs</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {slots.activeCount}/{slots.capacity} SLOTS USED — TAP TO TOGGLE
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStep('welcome')} 
                    className="text-xs gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </Button>
                  {slots.activeCount > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setStep('done')} className="text-xs gap-1">
                      Continue <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Hint banner */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Tap any pack to activate or deactivate it. You can swap packs freely.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {starterPackData.map(pack => {
                  if (!pack) return null;
                  const isActive = slots.isPackActive(pack.id);
                  const canActivate = !isActive && !slots.atCapacity;
                  const isToggling = toggling === pack.id;

                  return (
                    <motion.button
                      key={pack.id}
                      onClick={() => !isToggling && handleTogglePack(pack.id)}
                      disabled={isToggling || (!isActive && !canActivate && slots.atCapacity)}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all relative',
                        isActive
                          ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/10'
                          : canActivate
                          ? 'border-border/30 hover:border-primary/30 hover:bg-primary/[0.03]'
                          : 'border-border/15 opacity-50'
                      )}
                      whileHover={!isToggling ? { y: -2 } : {}}
                      whileTap={!isToggling ? { scale: 0.98 } : {}}
                    >
                      {isToggling && (
                        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl z-10">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <Package className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                        {isActive && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <h4 className="text-xs font-semibold text-foreground">{pack.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{pack.useCase}</p>
                      <Badge variant="outline" className={cn(
                        "mt-2 text-[9px] px-1.5",
                        isActive ? "text-primary border-primary/30" : "text-muted-foreground"
                      )}>
                        {isActive ? 'Active — tap to remove' : 'Tap to activate'}
                      </Badge>
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
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  {slots.activeCount} pack{slots.activeCount !== 1 ? 's' : ''} activated. 
                  You can change your packs anytime from the <strong>Packs</strong> page.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => setStep('pick')} className="text-xs gap-1">
                  <ArrowLeft className="w-3 h-3" /> Change Packs
                </Button>
                <Button size="sm" onClick={completeOnboarding} className="text-xs gap-1">
                  Start Exploring <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Manage packs anytime at{' '}
                <Link to="/packs" className="text-primary hover:underline font-medium">
                  /packs
                </Link>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
