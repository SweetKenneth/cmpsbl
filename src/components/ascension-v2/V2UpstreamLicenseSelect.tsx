/**
 * V2 Upstream License SPDX Selector
 * ─────────────────────────────────────────────────────────────────────────
 * Restoration-Shop-style dropdown for declaring the upstream license of the
 * customer's source when no inline header is present (or to override
 * detection). The selected SPDX flows into the export pipeline and produces
 * LICENSE-UPSTREAM.txt inside the ZIP.
 *
 * Pure presentational component — state is owned by V2ResultsStep so the
 * dropdown stays in sync with the live detection preview.
 *
 * © CMPSBL® — All rights reserved.
 */
import { ScrollText, ShieldCheck, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DetectedLicense, SupportedSpdx } from '@/lib/factory/license-attribution';

export type SpdxChoice = 'auto' | SupportedSpdx | 'none';

interface SpdxOption {
  value: SpdxChoice;
  label: string;
  hint: string;
}

const SPDX_OPTIONS: ReadonlyArray<SpdxOption> = [
  { value: 'auto', label: 'Auto-detect from source header', hint: 'Scans your file for SPDX or license blocks' },
  { value: 'Apache-2.0', label: 'Apache License 2.0', hint: 'Bundles full license text — required by §4(a)' },
  { value: 'MIT', label: 'MIT License', hint: 'Permissive — short notice bundled' },
  { value: 'BSD-3-Clause', label: 'BSD 3-Clause', hint: 'Short notice bundled' },
  { value: 'BSD-2-Clause', label: 'BSD 2-Clause', hint: 'Short notice bundled' },
  { value: 'MPL-2.0', label: 'Mozilla Public License 2.0', hint: 'Short notice bundled' },
  { value: 'ISC', label: 'ISC License', hint: 'Short notice bundled' },
  { value: 'none', label: 'Proprietary / no upstream license', hint: 'No LICENSE-UPSTREAM.txt will ship' },
];

interface Props {
  value: SpdxChoice;
  onChange: (choice: SpdxChoice) => void;
  detected: DetectedLicense | null;
  hasSource: boolean;
}

export function V2UpstreamLicenseSelect({ value, onChange, detected, hasSource }: Props) {
  // What will actually ship after Auto resolves to detected (or nothing).
  const effective: DetectedLicense | null =
    value === 'none' ? null : value === 'auto' ? detected : null;

  // For non-auto, find the option label to render in the badge.
  const explicitLabel =
    value !== 'auto' && value !== 'none'
      ? SPDX_OPTIONS.find((o) => o.value === value)?.label
      : null;

  const willShipText = (() => {
    if (!hasSource) return 'No source uploaded yet — selector will activate after upload.';
    if (value === 'none') return 'No LICENSE-UPSTREAM.txt will be added to the ZIP.';
    if (value === 'auto') {
      return detected
        ? `Detected ${detected.label} — LICENSE-UPSTREAM.txt will ship.`
        : 'No license header detected. Pick an SPDX above if your source is open-source.';
    }
    return `Manual override: ${explicitLabel} — LICENSE-UPSTREAM.txt will ship.`;
  })();

  const willShip =
    hasSource && value !== 'none' && (value !== 'auto' || detected !== null);

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex items-start gap-2 sm:gap-3">
        <ScrollText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Upstream License (Layer 1)
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug mt-0.5">
            Declare your source's license so attribution travels with the export.
            CAAL-1.0 only governs Layer 2 — your code keeps its own license.
          </p>
        </div>
      </div>

      <label className="block">
        <span className="sr-only">Upstream SPDX license</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SpdxChoice)}
          disabled={!hasSource}
          className={cn(
            'w-full h-10 sm:h-11 rounded-lg border border-border bg-background',
            'px-2 sm:px-3 text-xs sm:text-sm text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          aria-label="Upstream SPDX license"
        >
          {SPDX_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="block mt-1 text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
          {SPDX_OPTIONS.find((o) => o.value === value)?.hint}
        </span>
      </label>

      <div
        className={cn(
          'flex items-start gap-2 rounded-lg px-2 sm:px-3 py-2 text-[10px] sm:text-[11px] leading-snug',
          willShip
            ? 'bg-primary/10 text-primary'
            : 'bg-muted/40 text-muted-foreground',
        )}
        role="status"
        aria-live="polite"
      >
        {willShip ? (
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        ) : (
          <Search className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        )}
        <span className="min-w-0 break-words">{willShipText}</span>
      </div>

      {effective?.attribution && (
        <p className="text-[10px] sm:text-[11px] text-muted-foreground italic leading-snug">
          Attribution carried: {effective.attribution}
        </p>
      )}
    </div>
  );
}
