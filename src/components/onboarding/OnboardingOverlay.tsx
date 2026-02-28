/**
 * User Onboarding Flow — first-run guided experience
 * Item #23: Highlight key features to reduce bounce rate
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scan, Brain, FlaskConical, Store, Terminal, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'cmpsbl_onboarded';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkLabel: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: <Scan className="h-6 w-6" />,
    title: 'Scan Any Site',
    description: 'Run accessibility, SEO, and security scans on any domain — instant results.',
    link: '/scan',
    linkLabel: 'Try a Scan',
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'Persistent Memory',
    description: 'Give your AI agent permanent memory in under an hour. Free tier available.',
    link: '/persistent-memory',
    linkLabel: 'Explore Memory',
  },
  {
    icon: <FlaskConical className="h-6 w-6" />,
    title: 'Experimentation Lab',
    description: 'Test substrate modules in a live sandbox environment.',
    link: '/lab',
    linkLabel: 'Open Lab',
  },
  {
    icon: <Store className="h-6 w-6" />,
    title: 'Artifact Store',
    description: 'Browse pre-built capabilities, templates, and synergy pipelines.',
    link: '/store',
    linkLabel: 'Browse Store',
  },
  {
    icon: <Terminal className="h-6 w-6" />,
    title: 'DECODE Terminal',
    description: 'Natural language interface to the cognitive substrate.',
    link: '/decode',
    linkLabel: 'Try DECODE',
  },
];

export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
  };

  return { show, dismiss };
}

interface OnboardingOverlayProps {
  onDismiss: () => void;
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </div>
            <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3 text-primary">
                {STEPS[step].icon}
                <h3 className="text-lg font-semibold text-foreground">{STEPS[step].title}</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{STEPS[step].description}</p>
              <Link to={STEPS[step].link} onClick={onDismiss}>
                <Button variant="outline" size="sm" className="mb-4">
                  {STEPS[step].linkLabel} <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <button
              onClick={onDismiss}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => setStep(s => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button size="sm" onClick={onDismiss}>
                  Get Started
                </Button>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
