/**
 * V2GovernanceModeStep — wizard step 2.5 (between Enhance and Analyze).
 *
 * Combines:
 *   • V2GovernanceModePicker — choose OBSERVE / SOFT / ENFORCE
 *   • V2GovernancePreview    — see WHERE governance applies + WHAT it provides
 *
 * Captures the selection into sessionStorage for the export pipeline to read
 * later (Step 3 — pending governor approval to inject the Layer 2 mode
 * constant). Touches NO Layer 2 internals.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { V2GovernanceModePicker } from './V2GovernanceModePicker';
import { V2GovernancePreview } from './V2GovernancePreview';
import {
  DEFAULT_GOVERNANCE_MODE,
  readSourcePreview,
  writeModeSelection,
  type GovernanceMode,
} from '@/lib/ascension-v2/governance-mode';

interface Props {
  onComplete: () => void;
  /** When 'simple' the env-var hint is suppressed to keep the calm path quiet. */
  uiMode?: 'simple' | 'advanced';
}

export function V2GovernanceModeStep({ onComplete, uiMode = 'simple' }: Props) {
  const isAdvanced = uiMode === 'advanced';
  const [mode, setMode] = useState<GovernanceMode>(DEFAULT_GOVERNANCE_MODE);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [source, setSource] = useState<string | null>(null);

  // Pull the cached source snippet stashed by V2UploadStep
  useEffect(() => {
    setSource(readSourcePreview());
  }, []);

  const handleToggleExclude = useCallback((fn: string) => {
    setExcluded((prev) =>
      prev.includes(fn) ? prev.filter((n) => n !== fn) : [...prev, fn],
    );
  }, []);

  const handleContinue = useCallback(() => {
    writeModeSelection({
      mode,
      excludedFunctions: excluded,
      chosenAt: new Date().toISOString(),
    });
    onComplete();
  }, [mode, excluded, onComplete]);

  const summary = useMemo(() => {
    const excludedCount = excluded.length;
    const modeLabel = mode === 'observe' ? 'Observe' : mode === 'soft' ? 'Soft' : 'Enforce';
    if (excludedCount === 0) {
      return `Continuing with ${modeLabel} governance across all detected surfaces.`;
    }
    return `Continuing with ${modeLabel} governance — ${excludedCount} ${excludedCount === 1 ? 'surface' : 'surfaces'} excluded by you.`;
  }, [mode, excluded]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="text-center">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          Choose Your Protection Mode
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          See exactly where Ascension governs — and decide how strict you want it to be.
        </p>
      </div>

      <V2GovernanceModePicker selected={mode} onSelect={setMode} />

      <V2GovernancePreview
        source={source}
        excludedFunctions={excluded}
        onToggleExclude={handleToggleExclude}
        selectedMode={mode}
      />

      <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
        <p className="text-[11px] text-muted-foreground text-center">{summary}</p>
        <Button onClick={handleContinue} size="sm" className="gap-1.5">
          Continue to Analyze
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        {isAdvanced && (
          <p className="text-[10px] text-muted-foreground/80">
            You can change governance mode anytime by setting <code className="font-mono">CMPSBL_MODE</code> in your environment.
          </p>
        )}
      </div>
    </div>
  );
}
