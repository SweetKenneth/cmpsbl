/**
 * Mana Config Types — Declarative Layer 2 Deployment Configuration
 * U.S. Patent App. No. 64/031,637
 *
 * Defines the configuration schema for mana.config.json files.
 * Users create a config file in their project root to specify
 * which packages receive Layer 2 capabilities.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ManaCapability } from './types';

/** Single function attachment directive */
export interface ManaAttachmentDirective {
  /** Function name to wrap */
  readonly functionName: string;
  /** Layer 2 capability to apply */
  readonly capability: ManaCapability;
  /** Optional payload (e.g., shadow rule message) */
  readonly rulePayload?: unknown;
}

/** Target package configuration */
export interface ManaTargetConfig {
  /** Package name (e.g., 'lodash', 'express') or relative path */
  readonly package: string;
  /** Attachment directives for this package */
  readonly attachments: ManaAttachmentDirective[];
  /** Override Lex mode for this package */
  readonly lexMode?: 'permissive' | 'strict';
  /** Auto-derive attachments from an Ascension manifest */
  readonly ascensionManifest?: string;
}

/** Root configuration for mana.config.json */
export interface ManaLoaderConfig {
  /** Schema version */
  readonly version: '1.0.0';
  /** Target packages to intercept */
  readonly targets: ManaTargetConfig[];
  /** Global telemetry toggle */
  readonly telemetry?: boolean;
  /** Global DREAM synthesis toggle */
  readonly dreamSynthesis?: boolean;
  /** Global Lex mode default */
  readonly lexMode?: 'permissive' | 'strict';
  /** Path to an Ascension export manifest for auto-configuration */
  readonly manifestPath?: string;
}

/**
 * Generate an example mana.config.json for a given package.
 * Used by the CLI and export pipeline to bootstrap configs.
 */
export function generateExampleConfig(
  packageName: string,
  functionNames: string[],
): ManaLoaderConfig {
  // Auto-derive sensible capabilities from function names
  const attachments: ManaAttachmentDirective[] = functionNames.map(name => {
    const capability = inferCapabilityFromName(name);
    return { functionName: name, capability };
  });

  return {
    version: '1.0.0',
    targets: [{
      package: packageName,
      attachments,
    }],
    telemetry: true,
    dreamSynthesis: false,
    lexMode: 'permissive',
  };
}

/** Infer a sensible default capability from a function name */
function inferCapabilityFromName(name: string): ManaCapability {
  const lower = name.toLowerCase();

  // DEFENSE signals
  if (/^(parse|validate|sanitize|decode|handle.*input|process.*request)/.test(lower)) return 'defense_gate';
  if (/^(clean|strip|escape|normalize|purify)/.test(lower)) return 'input_sanitizer';

  // GOVERNANCE signals
  if (/^(save|update|delete|remove|create|insert|write|set|put|patch|modify)/.test(lower)) return 'governance_hook';
  if (/^(auth|login|logout|verify|grant|revoke)/.test(lower)) return 'access_controller';

  // FAILSAFE signals
  if (/^(fetch|call|request|query|get.*api|post|send|connect)/.test(lower)) return 'circuit_breaker';

  // AUDIT signals
  if (/^(log|track|record|emit|report|audit)/.test(lower)) return 'audit_trail';

  // Default: BEACON telemetry for all others
  return 'beacon_telemetry';
}
