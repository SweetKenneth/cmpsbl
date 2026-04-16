/**
 * V2 Primitive Reference — bottom-of-page glossary for the 40-Primitive matrix.
 * Linked from the V2 hero so users can quickly understand what each layer does
 * before / after running an Ascension.
 */

import { Brain, Layers, Zap, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrimitiveEntry {
  name: string;
  blurb: string;
}

interface PrimitiveGroup {
  id: string;
  label: string;
  count: number;
  blurb: string;
  Icon: typeof Brain;
  items: PrimitiveEntry[];
}

// Short, plain-English descriptions of what each primitive does at runtime.
// Source of truth: docs/libraries/internal/15-primitive-specifications.md
const GROUPS: PrimitiveGroup[] = [
  {
    id: 'organs',
    label: 'Organs',
    count: 12,
    blurb: 'Long-running cognitive infrastructure — the substrate\'s "always-on" body.',
    Icon: Brain,
    items: [
      { name: 'CORE', blurb: 'Boot kernel and primitive lifecycle controller.' },
      { name: 'SYSTEM', blurb: 'Process orchestrator and inter-primitive bus.' },
      { name: 'BRAIN', blurb: 'Reasoning loop and decision arbitration.' },
      { name: 'MEMORY', blurb: 'Persistent state, recall, and retention.' },
      { name: 'NERVE', blurb: 'Signal fan-out and event routing fabric.' },
      { name: 'NEXUS', blurb: 'AI provider router and model selection.' },
      { name: 'IDENTITY', blurb: 'Actor identity, sessions, and role binding.' },
      { name: 'SOVEREIGN', blurb: 'Authority and permission resolution.' },
      { name: 'ATLAS', blurb: 'Capability registry and topology map.' },
      { name: 'MEDIC', blurb: 'Diagnostics, healing, and recovery.' },
      { name: 'RELAY', blurb: 'External connectors and outbound delivery.' },
      { name: 'CONSCIENCE', blurb: 'Ethical guardrails and refusal logic.' },
    ],
  },
  {
    id: 'layers',
    label: 'Layers',
    count: 12,
    blurb: 'Cross-cutting policy planes that wrap every call without source changes.',
    Icon: Layers,
    items: [
      { name: 'DEFENSE', blurb: 'Threat scoring and request shielding.' },
      { name: 'IMMUNITY', blurb: 'Self-healing patches and quarantine.' },
      { name: 'GOVERNANCE', blurb: 'Rule evaluation and audit attestation.' },
      { name: 'TREATY', blurb: 'Cross-system contracts and SLAs.' },
      { name: 'EVOLUTION', blurb: 'Safe in-place upgrades and migration.' },
      { name: 'REFLEX', blurb: 'Sub-millisecond automatic responses.' },
      { name: 'COMPASS', blurb: 'Goal alignment and intent steering.' },
      { name: 'INTEGRATION', blurb: 'Adapter binding for foreign systems.' },
      { name: 'INTENT', blurb: 'Parses and verifies caller intent.' },
      { name: 'ACCESS', blurb: 'Quotas, scopes, and rate enforcement.' },
      { name: 'VISION', blurb: 'Observability and structured tracing.' },
      { name: 'SHADOW', blurb: 'Side-channel verification (TSAC).' },
    ],
  },
  {
    id: 'engines',
    label: 'Engines',
    count: 8,
    blurb: 'High-throughput compute units that do focused, heavy work on demand.',
    Icon: Zap,
    items: [
      { name: 'DREAM', blurb: 'Offline synthesis and discovery (no AI).' },
      { name: 'HARVEST', blurb: 'Crawls and ingests external sources.' },
      { name: 'FORGE', blurb: 'Compiles candidates into shipping artifacts.' },
      { name: 'LINGUA', blurb: 'Polyglot transpilation across 30+ languages.' },
      { name: 'ECHO', blurb: 'Replays and reproduces past runs.' },
      { name: 'PHANTOM', blurb: 'Anonymizing multi-hop proxy.' },
      { name: 'SANDBOX', blurb: 'Isolated execution and dry-runs.' },
      { name: 'RIPPLE', blurb: 'Propagates updates across deployments.' },
    ],
  },
  {
    id: 'agents',
    label: 'Agents',
    count: 8,
    blurb: 'Goal-directed actors that coordinate organs, layers, and engines.',
    Icon: Bot,
    items: [
      { name: 'ENCODE', blurb: 'Serializes data into safe transit forms.' },
      { name: 'DECODE', blurb: 'Parses inbound payloads and intent.' },
      { name: 'AUDIT', blurb: 'Tamper-evident receipts and chain anchors.' },
      { name: 'ECONOMY', blurb: 'Cost accounting and budget enforcement.' },
      { name: 'INCLUSIVE', blurb: 'Accessibility and locale adaptation.' },
      { name: 'CORTEX', blurb: 'Behavior orchestration and policy fan-out.' },
      { name: 'ORACLE', blurb: 'Read-only foresight queries.' },
      { name: 'ENGINEER', blurb: 'Builds, deploys, and maintains substrate code.' },
    ],
  },
];

export function V2PrimitiveReference() {
  return (
    <section
      id="primitive-reference"
      aria-labelledby="primitive-reference-heading"
      className="mt-12 sm:mt-20 scroll-mt-24"
    >
      <div className="text-center mb-6 sm:mb-10">
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Reference
        </p>
        <h2
          id="primitive-reference-heading"
          className="text-xl sm:text-3xl font-bold tracking-tight text-foreground"
        >
          What each layer does
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto mt-2">
          Your code collides against the canonical 40-Primitive matrix. Each
          primitive plays one of four roles — Organs, Layers, Engines, or Agents.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {GROUPS.map((group) => {
          const { Icon } = group;
          return (
            <div
              key={group.id}
              className={cn(
                'rounded-2xl border border-border bg-card/40 p-4 sm:p-5',
                'backdrop-blur-sm',
              )}
            >
              <header className="flex items-start gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">
                      {group.label}
                    </h3>
                    <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                      ×{group.count}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                    {group.blurb}
                  </p>
                </div>
              </header>

              <ul className="space-y-1.5 sm:space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-baseline gap-2 sm:gap-3 text-[11px] sm:text-xs"
                  >
                    <span className="font-mono font-semibold text-foreground min-w-[68px] sm:min-w-[88px] flex-shrink-0">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground leading-snug">
                      {item.blurb}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-6 sm:mt-8">
        12 Organs · 12 Layers · 8 Engines · 8 Agents = 40 Primitives
      </p>
    </section>
  );
}
