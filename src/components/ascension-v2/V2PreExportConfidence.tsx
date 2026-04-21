/**
 * V2 Pre-Export Confidence Panel — Sprint 4 (Ascension V2 Standalone).
 *
 * Surfaces the last "what you'll get" beat before the user clicks the
 * irreversible Export button. Aggregates signals already computed elsewhere
 * in the run so this panel is a *projection*, never a recompute:
 *
 *   - Confidence band breakdown (high / medium / low / hypothesis)
 *   - Merge verdicts (beneficial / neutral / risky)
 *   - Attached Mana layer count and total
 *   - Source-language parity status (SHIPPING vs pass-through sidecar)
 *   - Upstream license posture (declared vs NOASSERTION)
 *   - Estimated ZIP size band (small / medium / large)
 *
 * Design rules followed:
 *   - Mobile-first at 440px, semantic tokens only, no hardcoded colors.
 *   - All values derive from props — no fetch, no side effects, no mocks.
 *   - Renders nothing when there are zero capabilities (export is hidden too).
 *
 * © CMPSBL® — All rights reserved.
 */

import { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, Layers, Languages, FileWarning, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiscoveredCapability } from '@/lib/ascension-v2';
import type { DetectedLicense } from '@/lib/factory/license-attribution';
import { getLanguageParityStatus, getLanguageParityEntry } from '@/lib/export/language-parity-tiers';

interface SourceFileLite {
  readonly name: string;
  readonly content: string;
}

interface Props {
  capabilities: ReadonlyArray<DiscoveredCapability>;
  attachedLayerCount: number;
  language: string;
  shippingUpstream: DetectedLicense | null;
  /** True when SPDX is unresolved AND we have source — drives NOASSERTION warning. */
  upstreamMissing: boolean;
  /** Source files used to estimate ZIP size — content length only, no parsing. */
  sourceFiles: ReadonlyArray<SourceFileLite>;
}

type Severity = 'ok' | 'warn' | 'info';

interface Row {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  severity: Severity;
}

/** Estimate ZIP size from raw source bytes. Wrapper + docs add ~15-30KB baseline. */
function estimateZipBand(sourceFiles: ReadonlyArray<SourceFileLite>, layerCount: number): {
  band: 'small' | 'medium' | 'large';
  label: string;
} {
  const sourceBytes = sourceFiles.reduce((sum, f) => sum + f.content.length, 0);
  // ~25KB baseline (docs + manifest + harness report) + ~8KB per attached layer.
  const estimated = sourceBytes + 25_000 + layerCount * 8_000;
  if (estimated < 60_000) return { band: 'small', label: '< 60 KB' };
  if (estimated < 250_000) return { band: 'medium', label: '60–250 KB' };
  return { band: 'large', label: `~${Math.round(estimated / 1024)} KB` };
}

export function V2PreExportConfidence({
  capabilities,
  attachedLayerCount,
  language,
  shippingUpstream,
  upstreamMissing,
  sourceFiles,
}: Props) {
  // Confidence band breakdown — uses cap.band assigned during discovery.
  const bands = useMemo(() => {
    const out = { high: 0, medium: 0, low: 0, hypothesis: 0, unbanded: 0 };
    for (const c of capabilities) {
      if (!c.band) out.unbanded += 1;
      else out[c.band] += 1;
    }
    return out;
  }, [capabilities]);

  // Merge verdict roll-up — only meaningful when verdicts exist.
  const verdicts = useMemo(() => {
    const out = { beneficial: 0, neutral: 0, risky: 0, none: 0 };
    for (const c of capabilities) {
      if (!c.mergeVerdict) out.none += 1;
      else out[c.mergeVerdict] += 1;
    }
    return out;
  }, [capabilities]);

  const langParity = getLanguageParityStatus(language);
  const langEntry = getLanguageParityEntry(language);
  const sizeBand = useMemo(() => estimateZipBand(sourceFiles, attachedLayerCount), [sourceFiles, attachedLayerCount]);

  if (capabilities.length === 0) return null;

  // Build the row set. Each row is a single, scannable signal.
  const rows: Row[] = [];

  // 1. Confidence breakdown — primary signal.
  const highShare = bands.high + bands.medium;
  const totalBanded = highShare + bands.low + bands.hypothesis;
  rows.push({
    id: 'bands',
    icon: ShieldCheck,
    label: 'Confidence mix',
    value: totalBanded === 0
      ? `${capabilities.length} unbanded`
      : `${bands.high} high · ${bands.medium} med · ${bands.low + bands.hypothesis} low`,
    hint: bands.hypothesis > 0 ? `${bands.hypothesis} hypothesis-tier (italics in list)` : undefined,
    severity: highShare === 0 && totalBanded > 0 ? 'warn' : 'ok',
  });

  // 2. Merge verdicts — only show when at least one verdict was set.
  if (verdicts.beneficial + verdicts.neutral + verdicts.risky > 0) {
    rows.push({
      id: 'merge',
      icon: Layers,
      label: 'Merge verdicts',
      value: `${verdicts.beneficial} ↑ · ${verdicts.neutral} = · ${verdicts.risky} ↓`,
      hint: verdicts.risky > 0 ? 'Risky merges are flagged in the activated list above' : undefined,
      severity: verdicts.risky > 0 ? 'warn' : 'ok',
    });
  }

  // 3. Mana layers — informational.
  rows.push({
    id: 'layers',
    icon: Layers,
    label: 'Mana layers',
    value: attachedLayerCount === 0
      ? 'None attached'
      : `${attachedLayerCount} attached · auto-wires on export`,
    severity: 'info',
  });

  // 4. Language parity — warn when sidecar mode.
  rows.push({
    id: 'parity',
    icon: Languages,
    label: 'Language parity',
    value: langParity === 'CANONICAL'
      ? `${langEntry?.label ?? language} · native`
      : langParity === 'BETA_POLYGLOT'
        ? `${langEntry?.label ?? language} · polyglot (Beta)`
        : `${langEntry?.label ?? language} · pass-through sidecar`,
    hint: langParity === 'CANONICAL'
      ? undefined
      : langParity === 'BETA_POLYGLOT'
        ? 'Native file via the V1 polyglot engine — Beta tier, not byte-locked yet'
        : 'Original source ships untouched + sealed TypeScript runtime',
    severity: langParity === 'CANONICAL' ? 'ok' : langParity === 'BETA_POLYGLOT' ? 'info' : 'warn',
  });

  // 5. Upstream license posture.
  rows.push({
    id: 'license',
    icon: upstreamMissing ? FileWarning : ShieldCheck,
    label: 'Upstream license',
    value: shippingUpstream
      ? `${shippingUpstream.spdx} declared`
      : upstreamMissing
        ? 'NOASSERTION (will ship)'
        : 'None — proprietary',
    hint: upstreamMissing
      ? 'Pick an SPDX above if your source is open-source'
      : undefined,
    severity: upstreamMissing ? 'warn' : 'ok',
  });

  // 6. Estimated ZIP size — informational.
  rows.push({
    id: 'size',
    icon: HardDrive,
    label: 'Estimated size',
    value: sizeBand.label,
    severity: 'info',
  });

  const warnCount = rows.filter((r) => r.severity === 'warn').length;

  return (
    <section
      aria-label="Pre-export confidence summary"
      className="bg-muted/15 border border-border rounded-xl p-3 sm:p-4 space-y-3"
    >
      <header className="flex items-start gap-2">
        {warnCount > 0 ? (
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-neon-amber flex-shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Before you export
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
            {warnCount > 0
              ? `${warnCount} item${warnCount === 1 ? '' : 's'} worth a glance — export is irreversible once started.`
              : 'All signals look clean. Export is irreversible once started.'}
          </p>
        </div>
      </header>

      <ul className="space-y-1.5 sm:space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-start gap-2 sm:gap-2.5"
          >
            <row.icon
              className={cn(
                'w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5',
                row.severity === 'warn' && 'text-neon-amber',
                row.severity === 'ok' && 'text-primary',
                row.severity === 'info' && 'text-muted-foreground',
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] text-muted-foreground">{row.label}</span>
                <span
                  className={cn(
                    'text-[10px] sm:text-xs font-mono text-foreground truncate text-right min-w-0',
                    row.severity === 'warn' && 'text-neon-amber',
                  )}
                >
                  {row.value}
                </span>
              </div>
              {row.hint && (
                <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 leading-snug mt-0.5">
                  {row.hint}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
