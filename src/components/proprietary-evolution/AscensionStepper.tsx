/**
 * AscensionStepper — Step progress indicator for the wizard flow
 */

import { Upload, Zap, Diamond, Package, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'ingest', label: 'Ingest', icon: Upload },
  { id: 'discovery', label: 'Discovery', icon: Zap },
  { id: 'ascend', label: 'Ascend', icon: Diamond },
  { id: 'export', label: 'Export', icon: Package },
] as const;

interface Props {
  activeStep: number;
  onStepClick: (index: number) => void;
}

export function AscensionStepper({ activeStep, onStepClick }: Props) {
  return (
    <div className="flex items-center w-full max-w-xl mx-auto">
      {STEPS.map((step, i) => {
        const isActive = i === activeStep;
        const isComplete = i < activeStep;
        const Icon = isComplete ? Check : step.icon;

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
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isActive
                    ? "border-primary bg-primary/15 shadow-[0_0_16px_hsl(var(--primary)/0.25)] stepper-active-pulse"
                    : isComplete
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/40 bg-muted/20"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-primary"
                      : isComplete
                        ? "text-primary/70"
                        : "text-muted-foreground/50"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap",
                  isActive
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
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 sm:mx-3 mt-[-18px]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    i < activeStep
                      ? "bg-primary/50"
                      : "bg-border/30"
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
