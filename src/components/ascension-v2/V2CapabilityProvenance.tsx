/**
 * V2 Capability Provenance — Sprint 5 (Ascension V2 Standalone).
 *
 * "Why does this capability exist?" — the honest answer derived entirely from
 * real signals already attached to each DiscoveredCapability:
 *
 *   - chain        : exact primitive collision sequence that produced it
 *   - tier         : substrate tier classification at lock time
 *   - band         : confidence tier (high/medium/low/hypothesis)
 *   - bandChannels : how many of 3 detection channels agreed
 *   - closedGaps   : prior coverage gaps this capability closed
 *   - synergies    : composability synergies unlocked
 *   - merge        : merge verdict + net improvement
 *
 * No fabrication. No source-line mapping (the substrate doesn't track that
 * today). Just the real provenance the discovery engine already produced.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useMemo, useState } from 'react';
import { ChevronDown, GitBranch, ShieldCheck, AlertTriangle, Sparkles, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatEnhancedCapabilityName } from '@/lib/export/humanize-name';
import type { DiscoveredCapability } from '@/lib/ascension-v2';

interface Props {
  capabilities: ReadonlyArray<DiscoveredCapability>;
}

interface ProvenanceFact {
  id: string;
  label: string;
  value: string;
  tone: 'ok' | 'warn' | 'info';
}

/**
 * Distill a capability into the small set of facts that explain its origin.
 * Only emits a fact when the underlying field is present and meaningful.
 */
function buildFacts(cap: DiscoveredCapability): ProvenanceFact[] {
  const facts: ProvenanceFact[] = [];

  // 1. Confidence channels — strongest provenance signal we have.
  if (cap.band) {
    const channels = cap.bandChannelCount;
    facts.push({
      id: 'band',
      label: 'Confidence',
      value: channels !== undefined
        ? `${cap.band} · ${channels}/3 detection channels agreed`
        : cap.band,
      tone: cap.band === 'high' || cap.band === 'medium' ? 'ok' : 'warn',
    });
  }

  // 2. Tier — substrate's own classification at lock time.
  if (cap.tier) {
    facts.push({
      id: 'tier',
      label: 'Tier',
      value: cap.tier,
      tone: 'info',
    });
  }

  // 3. Compatibility composite — only when we have a real number.
  if (typeof cap.compatibilityComposite === 'number') {
    facts.push({
      id: 'composite',
      label: 'Composite',
      value: `${Math.round(cap.compatibilityComposite)} / 100`,
      tone: cap.compatibilityComposite >= 70 ? 'ok' : 'info',
    });
  }

  // 4. Merge verdict — when present.
  if (cap.mergeVerdict) {
    const delta = cap.mergeNetImprovement !== undefined
      ? ` · Δ ${cap.mergeNetImprovement > 0 ? '+' : ''}${cap.mergeNetImprovement}`
      : '';
    facts.push({
      id: 'merge',
      label: 'Merge',
      value: `${cap.mergeVerdict}${delta}`,
      tone: cap.mergeVerdict === 'beneficial' ? 'ok' : cap.mergeVerdict === 'risky' ? 'warn' : 'info',
    });
  }

  return facts;
}

const toneIconClass: Record<ProvenanceFact['tone'], string> = {
  ok: 'text-primary',
  warn: 'text-neon-amber',
  info: 'text-muted-foreground',
};

const toneIcon: Record<ProvenanceFact['tone'], React.ComponentType<{ className?: string }>> = {
  ok: ShieldCheck,
  warn: AlertTriangle,
  info: Layers,
};

export function V2CapabilityProvenance({ capabilities }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Stable keys — capabilities don't carry ids, so derive one from name+chain.
  const items = useMemo(
    () =>
      capabilities.map((cap, i) => ({
        cap,
        key: `${cap.name}__${cap.chain.join('-')}__${i}`,
        cleanChain: cap.chain.filter((p) => p !== 'CANDIDATE'),
        facts: buildFacts(cap),
      })),
    [capabilities],
  );

  if (capabilities.length === 0) return null;

  return (
    <section
      aria-label="Capability provenance trace"
      className="bg-muted/15 border border-border rounded-xl p-3 sm:p-4 space-y-3"
    >
      <header className="flex items-start gap-2">
        <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Why these capabilities
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
            Tap any capability to see the primitive chain, confidence channels, and merge signals
            that produced it. No external metadata — pure substrate trace.
          </p>
        </div>
      </header>

      <ul className="space-y-1.5">
        {items.map(({ cap, key, cleanChain, facts }) => {
          const open = openId === key;
          const displayName = formatEnhancedCapabilityName(cap.name, cleanChain);
          return (
            <li key={key} className="rounded-lg border border-border bg-background/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : key)}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors',
                  'hover:bg-muted/30',
                )}
                aria-expanded={open}
                aria-controls={`prov-${key}`}
              >
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform',
                    open && 'rotate-180',
                  )}
                />
                <span className="text-[11px] sm:text-xs text-foreground truncate flex-1 min-w-0">
                  {displayName}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground flex-shrink-0">
                  {cleanChain.length} prim
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-primary flex-shrink-0">
                  {cap.cjpiScore}
                </span>
              </button>

              {open && (
                <div
                  id={`prov-${key}`}
                  className="border-t border-border bg-muted/10 px-2.5 py-2.5 space-y-2.5"
                >
                  {/* Primitive chain — the literal collision sequence */}
                  <div>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Primitive chain
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cleanChain.length === 0 ? (
                        <span className="text-[10px] text-muted-foreground italic">Sealed (chain redacted)</span>
                      ) : (
                        cleanChain.map((p, i) => (
                          <span
                            key={`${p}-${i}`}
                            className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Derived facts — confidence, tier, composite, merge */}
                  {facts.length > 0 && (
                    <ul className="space-y-1">
                      {facts.map((f) => {
                        const Icon = toneIcon[f.tone];
                        return (
                          <li key={f.id} className="flex items-start gap-2">
                            <Icon className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 mt-0.5', toneIconClass[f.tone])} />
                            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                                {f.label}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] sm:text-[11px] font-mono text-foreground truncate text-right min-w-0',
                                  f.tone === 'warn' && 'text-neon-amber',
                                )}
                              >
                                {f.value}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Closed gaps — when present */}
                  {cap.closedGaps && cap.closedGaps.length > 0 && (
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Closed gaps
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {cap.closedGaps.map((g, i) => (
                          <span
                            key={`gap-${i}`}
                            className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/5 text-foreground border border-border"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unlocked synergies — when present */}
                  {cap.unlockedSynergies && cap.unlockedSynergies.length > 0 && (
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Unlocked synergies
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {cap.unlockedSynergies.map((s, i) => (
                          <span
                            key={`syn-${i}`}
                            className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description — when the discovery engine produced one */}
                  {cap.description && (
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-2">
                      {cap.description}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
