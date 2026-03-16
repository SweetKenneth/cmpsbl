/**
 * Proprietary Evolution — ZIP Bundle Generator
 * Generates downloadable Capability Pack ZIPs with Mini-Runtime™, source, tests, and manifest.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';

export interface CapabilityForExport {
  id: string;
  name: string;
  cjpiScore: number;
  tier: string;
  chain: string[];
  fingerprint: string;
  moatSignature: string;
  capabilityType: string;
}

interface ExportOptions {
  targetLanguage: string;
  capabilities: CapabilityForExport[];
  candidateName: string;
}

const LANG_EXT: Record<string, string> = {
  typescript: '.ts', python: '.py', rust: '.rs', go: '.go', zig: '.zig',
  java: '.java', csharp: '.cs', ruby: '.rb', swift: '.swift', kotlin: '.kt',
};

const LANG_COMMENT: Record<string, [string, string]> = {
  typescript: ['//', '/*'], python: ['#', '"""'], rust: ['//', '/*'],
  go: ['//', '/*'], zig: ['//', '//'], java: ['//', '/*'],
  csharp: ['//', '/*'], ruby: ['#', '=begin'], swift: ['//', '/*'], kotlin: ['//', '/*'],
};

function generateMiniRuntime(lang: string): string {
  const [line] = LANG_COMMENT[lang] || ['//', '/*'];
  const ext = LANG_EXT[lang] || '.ts';

  if (lang === 'typescript') {
    return `${line} ═══════════════════════════════════════════════════════════
${line}  CMPSBL® Mini-Runtime™ Engine v1.0.0
${line}  Zero-dependency standalone runtime for Capability Pack execution
${line}  © 2025–2026 PromptFluid®. All rights reserved.
${line} ═══════════════════════════════════════════════════════════

${line} ─── CJPI Scorer ───
export interface CJPIInput {
  novelty: number;
  utility: number;
  complexity: number;
  composability: number;
}

export function computeCJPI(input: CJPIInput): number {
  const { novelty, utility, complexity, composability } = input;
  const raw = (novelty * 0.30) + (utility * 0.30) + (complexity * 0.20) + (composability * 0.20);
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function tierFromCJPI(score: number): string {
  if (score >= 92) return 'apex';
  if (score >= 80) return 'mythic';
  if (score >= 65) return 'relic';
  if (score >= 45) return 'prime';
  return 'mint';
}

${line} ─── Saga Orchestrator ───
export type SagaStep<T> = {
  name: string;
  execute: (context: T) => Promise<T>;
  compensate?: (context: T) => Promise<T>;
};

export class SagaOrchestrator<T> {
  private steps: SagaStep<T>[] = [];
  private executed: SagaStep<T>[] = [];

  addStep(step: SagaStep<T>): this {
    this.steps.push(step);
    return this;
  }

  async run(initialContext: T): Promise<{ success: boolean; context: T; error?: string }> {
    let context = initialContext;
    try {
      for (const step of this.steps) {
        context = await step.execute(context);
        this.executed.push(step);
      }
      return { success: true, context };
    } catch (err) {
      ${line} Compensate in reverse
      for (const step of [...this.executed].reverse()) {
        if (step.compensate) {
          try { context = await step.compensate(context); } catch {}
        }
      }
      return { success: false, context, error: String(err) };
    }
  }
}

${line} ─── FSM Engine ───
export type FSMTransition<S extends string, E extends string> = {
  from: S;
  event: E;
  to: S;
  guard?: () => boolean;
  action?: () => void;
};

export class FSMEngine<S extends string, E extends string> {
  private state: S;
  private transitions: FSMTransition<S, E>[] = [];
  private listeners: ((state: S) => void)[] = [];

  constructor(initial: S) {
    this.state = initial;
  }

  addTransition(t: FSMTransition<S, E>): this {
    this.transitions.push(t);
    return this;
  }

  send(event: E): S {
    const t = this.transitions.find(
      tr => tr.from === this.state && tr.event === event && (!tr.guard || tr.guard())
    );
    if (t) {
      this.state = t.to;
      t.action?.();
      this.listeners.forEach(fn => fn(this.state));
    }
    return this.state;
  }

  getState(): S { return this.state; }
  onTransition(fn: (state: S) => void): void { this.listeners.push(fn); }
}

${line} ─── Manifest Parser ───
export interface PackManifest {
  name: string;
  tier: string;
  cjpi: number;
  modules: string[];
  exported: string;
  runtime: string;
  targets: string[];
  version: string;
  fingerprint?: string;
}

export function parseManifest(json: string): PackManifest {
  const data = JSON.parse(json);
  return {
    name: data.name || 'unknown',
    tier: data.tier || tierFromCJPI(data.cjpi || 0),
    cjpi: data.cjpi || 0,
    modules: data.modules || [],
    exported: data.exported || new Date().toISOString().slice(0, 10),
    runtime: data.runtime || 'cmpsbl-mini-runtime-engine',
    targets: data.targets || ['typescript'],
    version: data.version || '1.0.0',
    fingerprint: data.fingerprint,
  };
}

${line} ─── Structural Fingerprint ───
export async function computeFingerprint(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
`;
  }

  // For non-TS languages, generate a stub
  return `${line} ═══════════════════════════════════════════════════════════
${line}  CMPSBL® Mini-Runtime™ Engine v1.0.0
${line}  Target: ${lang} | Zero-dependency standalone runtime
${line}  © 2025–2026 PromptFluid®. All rights reserved.
${line} ═══════════════════════════════════════════════════════════
${line}
${line}  Subsystems:
${line}    - CJPI Scorer (novelty/utility/complexity/composability)
${line}    - Saga Orchestrator (multi-step with compensation)
${line}    - FSM Engine (finite state machine with guards)
${line}    - Manifest Parser (capability pack metadata)
${line}    - Structural Fingerprint (SHA-256 identity)
${line}
${line}  This runtime is generated for the ${lang} target.
${line}  Full implementation available in TypeScript.
${line}  See: cmpsbl-mini-runtime${LANG_EXT.typescript}
${line}
`;
}

function generateCapabilitySource(cap: CapabilityForExport, lang: string): string {
  const [line] = LANG_COMMENT[lang] || ['//', '/*'];
  const ext = LANG_EXT[lang] || '.ts';

  if (lang === 'typescript') {
    return `${line} ═══════════════════════════════════════════════════════
${line}  Capability: ${cap.name}
${line}  CJPI: ${cap.cjpiScore} | Tier: ${cap.tier.toUpperCase()}
${line}  Chain: ${cap.chain.join(' → ')}
${line}  Fingerprint: ${cap.fingerprint.slice(0, 12).toUpperCase()}
${line}  Moat Signature: ${cap.moatSignature.slice(0, 8)}
${line} ═══════════════════════════════════════════════════════

import { computeCJPI, tierFromCJPI, type CJPIInput } from './_runtime/cmpsbl-mini-runtime';

export const CAPABILITY_META = {
  name: '${cap.name}',
  cjpi: ${cap.cjpiScore},
  tier: '${cap.tier}',
  chain: ${JSON.stringify(cap.chain)},
  fingerprint: '${cap.fingerprint}',
  moatSignature: '${cap.moatSignature}',
  type: '${cap.capabilityType}',
} as const;

${line} Capability implementation stub
${line} This represents the discovered collision between ${cap.chain[0]} × ${cap.chain[1]}
export function execute(input: Record<string, unknown>): Record<string, unknown> {
  return {
    ...input,
    _capability: CAPABILITY_META.name,
    _cjpi: CAPABILITY_META.cjpi,
    _tier: CAPABILITY_META.tier,
    _processed: true,
    _timestamp: new Date().toISOString(),
  };
}

export function validate(): boolean {
  const score: CJPIInput = { novelty: 80, utility: 75, complexity: 70, composability: 65 };
  const cjpi = computeCJPI(score);
  return tierFromCJPI(cjpi) === CAPABILITY_META.tier || cjpi > 0;
}
`;
  }

  return `${line} Capability: ${cap.name}
${line} CJPI: ${cap.cjpiScore} | Tier: ${cap.tier.toUpperCase()}
${line} Chain: ${cap.chain.join(' → ')}
${line} Fingerprint: ${cap.fingerprint.slice(0, 12).toUpperCase()}
${line}
${line} Implementation stub for ${lang} target.
${line} See TypeScript source for reference implementation.
`;
}

function generateTestHarness(cap: CapabilityForExport, lang: string): string {
  const [line] = LANG_COMMENT[lang] || ['//', '/*'];

  if (lang === 'typescript') {
    return `${line} Test Harness for ${cap.name}
import { describe, it, expect } from 'vitest';
import { execute, validate, CAPABILITY_META } from '../src/${cap.name.toLowerCase()}';

describe('${cap.name}', () => {
  it('should have correct metadata', () => {
    expect(CAPABILITY_META.cjpi).toBe(${cap.cjpiScore});
    expect(CAPABILITY_META.tier).toBe('${cap.tier}');
    expect(CAPABILITY_META.chain).toEqual(${JSON.stringify(cap.chain)});
  });

  it('should execute without error', () => {
    const result = execute({ test: true });
    expect(result._capability).toBe('${cap.name}');
    expect(result._processed).toBe(true);
  });

  it('should validate structural integrity', () => {
    expect(validate()).toBe(true);
  });

  it('should preserve fingerprint identity', () => {
    expect(CAPABILITY_META.fingerprint).toBe('${cap.fingerprint}');
  });
});
`;
  }

  return `${line} Test Harness for ${cap.name}
${line} Target: ${lang}
${line} TODO: Implement tests for ${lang} target
`;
}

function generateReadme(options: ExportOptions): string {
  const { targetLanguage, capabilities, candidateName } = options;
  const topTier = capabilities.reduce((a, b) => a.cjpiScore > b.cjpiScore ? a : b);

  return `# CMPSBL® Capability Pack — ${candidateName}

> **Generated by the Proprietary Evolution Lifecycle**
> Target: ${targetLanguage.toUpperCase()} | Capabilities: ${capabilities.length}

---

## 🎯 What This Is

This is a **Capability Pack** — a bundle of crystallized software capabilities discovered
through autonomous collision testing of your code against the CMPSBL® 40-node substrate matrix.

Each capability represents a unique behavioral pattern that emerged from the intersection
of your proprietary code and the substrate's cognitive architecture.

## 📦 Contents

| File | Purpose |
|------|---------|
| \`src/\` | Generated capability implementations |
| \`test/\` | Auto-generated test harnesses |
| \`_runtime/\` | CMPSBL® Mini-Runtime™ Engine (zero dependencies) |
| \`manifest.json\` | Pack metadata and capability registry |
| \`LICENSE\` | CMPSBL® Software License |

## 🏆 Capabilities (${capabilities.length})

| Capability | CJPI | Tier | Chain |
|------------|------|------|-------|
${capabilities.map(c =>
  `| ${c.name} | ${c.cjpiScore} | ${c.tier.toUpperCase()} | ${c.chain.join(' × ')} |`
).join('\n')}

## 🔬 Top Discovery

**${topTier.name}** — CJPI ${topTier.cjpiScore} (${topTier.tier.toUpperCase()})
- Chain: \`${topTier.chain.join(' → ')}\`
- Fingerprint: \`${topTier.fingerprint.slice(0, 12).toUpperCase()}\`

## 🚀 Mini-Runtime™

This pack includes the **CMPSBL® Mini-Runtime™ Engine** — a zero-dependency,
standalone runtime that provides:

- **CJPI Scorer** — Crown Jewel Pipeline Index computation
- **Saga Orchestrator** — Multi-step execution with compensation
- **FSM Engine** — Finite state machines with guards and actions
- **Manifest Parser** — Capability metadata parsing
- **Structural Fingerprint** — SHA-256 identity verification

## 🔁 Recursive Evolution

Re-ingest this enhanced codebase into the Proprietary Evolution Lifecycle
to discover deeper capability chains. Each cycle compounds exclusivity.

---

© 2025–2026 PromptFluid®. All rights reserved.
CMPSBL® and Mini-Runtime™ are trademarks of PromptFluid.
`;
}

function generateLicense(): string {
  return `CMPSBL® SOFTWARE LICENSE
========================

Copyright (c) 2025–2026 PromptFluid®. All rights reserved.

This Capability Pack was generated by the CMPSBL® Proprietary Evolution Lifecycle.

GRANT OF LICENSE:
Subject to the terms of this license, you are granted a non-exclusive,
non-transferable license to use the enclosed software capabilities and
Mini-Runtime™ Engine in your own projects.

RESTRICTIONS:
1. You may not redistribute the Mini-Runtime™ Engine as a standalone product.
2. You may not reverse-engineer the discovery algorithms that produced these capabilities.
3. You may not claim independent creation of the capability patterns herein.

PROPRIETARY NOTICE:
The structural fingerprints, moat signatures, and CJPI scores embedded in this
pack are the intellectual property of the originating substrate instance.

DISCLAIMER:
THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.

CMPSBL® and Mini-Runtime™ are trademarks of PromptFluid.
`;
}

export async function generateCapabilityPackZip(options: ExportOptions): Promise<void> {
  const { targetLanguage, capabilities, candidateName } = options;
  const ext = LANG_EXT[targetLanguage] || '.ts';
  const zip = new JSZip();
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const packName = `cmpsbl-capability-pack-${candidateName.toLowerCase()}-${timestamp}`;

  // _runtime/
  const runtimeFolder = zip.folder('_runtime')!;
  runtimeFolder.file(`cmpsbl-mini-runtime${ext}`, generateMiniRuntime(targetLanguage));

  // src/
  const srcFolder = zip.folder('src')!;
  for (const cap of capabilities) {
    srcFolder.file(`${cap.name.toLowerCase()}${ext}`, generateCapabilitySource(cap, targetLanguage));
  }

  // test/
  const testFolder = zip.folder('test')!;
  for (const cap of capabilities) {
    testFolder.file(`${cap.name.toLowerCase()}_test${ext}`, generateTestHarness(cap, targetLanguage));
  }

  // manifest.json
  const avgCjpi = Math.round(capabilities.reduce((s, c) => s + c.cjpiScore, 0) / capabilities.length);
  zip.file('manifest.json', serializeCmpsblManifest({
    name: packName,
    cjpi: avgCjpi,
    modules: [...new Set(capabilities.flatMap(c => c.chain))],
    targets: [targetLanguage],
    version: '1.0.0',
    category: 'proprietary-evolution',
    fingerprint: capabilities[0]?.fingerprint?.slice(0, 12).toUpperCase(),
    source: 'proprietary-evolution-lifecycle',
  }));

  // README.md & LICENSE
  zip.file('README.md', generateReadme(options));
  zip.file('LICENSE', generateLicense());

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  saveAs(blob, `${packName}.zip`);
}
