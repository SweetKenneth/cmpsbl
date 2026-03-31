/**
 * AscensionStepper — Step progress indicator for the wizard flow
 * Supports 4 core steps + optional 5th "Forge" step for Vertical Packs.
 */

import { Upload, Zap, Diamond, Package, Check, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'ingest', label: 'Ingest', icon: Upload },
  { id: 'discovery', label: 'Discovery', icon: Zap },
  { id: 'ascend', label: 'Ascend', icon: Diamond },
  { id: 'forge', label: 'Forge', icon: Flame },
  { id: 'export', label: 'Export', icon: Package },
] as const;

interface Props {
  activeStep: number;
  onStepClick: (index: number) => void;
  /** Total steps to show (4 = classic, 5 = with vertical forge) */
  totalSteps?: number;
}

export function AscensionStepper({ activeStep, onStepClick, totalSteps = 5 }: Props) {
  const visibleSteps = STEPS.slice(0, totalSteps);

  return (
    <div className="flex items-center w-full max-w-xl mx-auto px-1">
      {visibleSteps.map((step, i) => {
        const isActive = i === activeStep;
        const isComplete = i < activeStep;
        const Icon = isComplete ? Check : step.icon;
        const isForge = step.id === 'forge';

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <button
              onClick={() => onStepClick(i)}
              className={cn(
                "flex flex-col items-center gap-1.5 group transition-all relative",
                isActive || isComplete ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive && isForge
                    ? "border-orange-500/60 bg-orange-500/15 shadow-[0_0_20px_hsl(25_95%_53%/0.3)] scale-105"
                    : isActive
                      ? "border-primary bg-primary/15 shadow-[0_0_20px_hsl(var(--primary)/0.3)] scale-105"
                      : isComplete
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/30 bg-muted/15 hover:border-border/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive && isForge
                      ? "text-orange-400"
                      : isActive
                        ? "text-primary"
                        : isComplete
                          ? "text-primary/70"
                          : "text-muted-foreground/50"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap",
                  isActive && isForge
                    ? "text-orange-400 font-bold"
                    : isActive
                      ? "text-primary font-bold"
                      : isComplete
                        ? "text-primary/60"
                        : "text-muted-foreground/50"
                )}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {i < visibleSteps.length - 1 && (
              <div className="flex-1 h-[2px] mx-1.5 sm:mx-3 mt-[-20px]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    i < activeStep
                      ? "bg-gradient-to-r from-primary/60 to-primary/40"
                      : "bg-border/20"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
