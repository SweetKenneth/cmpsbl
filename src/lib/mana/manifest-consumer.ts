/**
 * Manifest Consumer — Ascension → Mana Auto-Configuration Bridge
 * U.S. Patent App. No. 64/031,637
 *
 * Consumes Ascension export artifacts (CJPI certificates, attachment plans)
 * and auto-generates Mana deployment configurations. This closes the loop:
 *   Ascension scans → discovers gaps → produces manifest
 *   Manifest Consumer reads manifest → generates mana.config.json
 *   Loader.mjs reads config → deploys Layer 2 at runtime
 *
 * Zero manual configuration required between scan and deploy.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ManaCapability, AscensionFinding, ManaAttachmentEntry } from './types';
import type { ManaLoaderConfig, ManaAttachmentDirective, ManaTargetConfig } from './config';

// ═══════════════════════════════════════════════════════════════
// §1 — Ascension Manifest Format
// ═══════════════════════════════════════════════════════════════

/** Structure of an Ascension export manifest (from ZIP artifacts) */
export interface AscensionManifest {
  /** Source package or file identifier */
  readonly source: string;
  /** Detected language */
  readonly language: string;
  /** CJPI score */
  readonly cjpiScore: number;
  /** Fingerprint hash */
  readonly fingerprint: string;
  /** Attachment plan from the findings bridge */
  readonly attachmentPlan: ManaAttachmentEntry[];
  /** Primitives that were applied during Ascension */
  readonly appliedPrimitives: string[];
  /** Export timestamp */
  readonly exportedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// §2 — Manifest → Config Conversion
// ═══════════════════════════════════════════════════════════════

/**
 * Convert an Ascension manifest into a deployable Mana config.
 * This is the critical bridge: scan → deploy in one step.
 */
export function manifestToConfig(
  manifest: AscensionManifest,
  options?: {
    packageName?: string;
    lexMode?: 'permissive' | 'strict';
    telemetry?: boolean;
  }
): ManaLoaderConfig {
  const packageName = options?.packageName || manifest.source || 'target';

  // Convert attachment entries to directives
  const attachments: ManaAttachmentDirective[] = manifest.attachmentPlan.map(entry => ({
    functionName: entry.functionName,
    capability: entry.capability,
  }));

  // Deduplicate by function+capability key
  const seen = new Set<string>();
  const deduped = attachments.filter(a => {
    const key = `${a.functionName}:${a.capability}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const target: ManaTargetConfig = {
    package: packageName,
    attachments: deduped,
    lexMode: options?.lexMode,
  };

  return {
    version: '1.0.0',
    targets: [target],
    telemetry: options?.telemetry ?? true,
    dreamSynthesis: false,
    lexMode: options?.lexMode || 'permissive',
  };
}

/**
 * Merge multiple Ascension manifests into a single multi-package config.
 * Phase 1: Multi-package composition.
 */
export function mergeManifests(
  manifests: Array<{ manifest: AscensionManifest; packageName: string }>,
  globalOptions?: {
    lexMode?: 'permissive' | 'strict';
    telemetry?: boolean;
  }
): ManaLoaderConfig {
  const targets: ManaTargetConfig[] = manifests.map(({ manifest, packageName }) => {
    const seen = new Set<string>();
    const attachments: ManaAttachmentDirective[] = manifest.attachmentPlan
      .filter(entry => {
        const key = `${entry.functionName}:${entry.capability}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(entry => ({
        functionName: entry.functionName,
        capability: entry.capability,
      }));

    return {
      package: packageName,
      attachments,
    };
  });

  return {
    version: '1.0.0',
    targets,
    telemetry: globalOptions?.telemetry ?? true,
    dreamSynthesis: false,
    lexMode: globalOptions?.lexMode || 'permissive',
  };
}

// ═══════════════════════════════════════════════════════════════
// §3 — Config Serialization
// ═══════════════════════════════════════════════════════════════

/**
 * Serialize a ManaLoaderConfig to JSON for writing to mana.config.json
 */
export function serializeConfig(config: ManaLoaderConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Parse a mana.config.json string into a typed config.
 * Validates required fields.
 */
export function parseConfig(raw: string): ManaLoaderConfig {
  const parsed = JSON.parse(raw);

  if (!parsed.version) {
    throw new Error('[MANA] Config missing "version" field');
  }
  if (!Array.isArray(parsed.targets)) {
    throw new Error('[MANA] Config missing "targets" array');
  }

  for (const target of parsed.targets) {
    if (!target.package) {
      throw new Error('[MANA] Target missing "package" field');
    }
    if (!Array.isArray(target.attachments)) {
      throw new Error(`[MANA] Target "${target.package}" missing "attachments" array`);
    }
  }

  return parsed as ManaLoaderConfig;
}

// ═══════════════════════════════════════════════════════════════
// §4 — Deployment Summary
// ═══════════════════════════════════════════════════════════════

export interface DeploymentSummary {
  readonly totalTargets: number;
  readonly totalAttachments: number;
  readonly capabilityBreakdown: Record<string, number>;
  readonly primitiveBreakdown: Record<string, number>;
  readonly configSize: number;
}

/**
 * Generate a human-readable deployment summary from a config.
 */
export function summarizeDeployment(config: ManaLoaderConfig): DeploymentSummary {
  let totalAttachments = 0;
  const capabilityBreakdown: Record<string, number> = {};
  const primitiveBreakdown: Record<string, number> = {};

  for (const target of config.targets) {
    totalAttachments += target.attachments.length;
    for (const att of target.attachments) {
      capabilityBreakdown[att.capability] = (capabilityBreakdown[att.capability] || 0) + 1;
      // Extract primitive family from capability name
      const family = att.capability.split('_')[0].toUpperCase();
      primitiveBreakdown[family] = (primitiveBreakdown[family] || 0) + 1;
    }
  }

  return {
    totalTargets: config.targets.length,
    totalAttachments,
    capabilityBreakdown,
    primitiveBreakdown,
    configSize: serializeConfig(config).length,
  };
}
