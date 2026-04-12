/**
 * Mana Runtime Loader — Node.js Module Interception Hook
 * U.S. Patent App. No. 64/031,637
 *
 * Usage: node --loader ./loader.mjs your-app.js
 *
 * Intercepts ES module resolution to inject Layer 2 wrappers
 * at the module boundary without modifying source files.
 *
 * Phase 0: Single-package interception
 * Phase 1: Multi-package composition via mana.config.json
 *
 * © CMPSBL® — All rights reserved.
 */

import { readFile } from 'node:fs/promises';
import { resolve as pathResolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

/**
 * @typedef {Object} ManaLoaderTarget
 * @property {string} package - Package name or file path to intercept
 * @property {Array<{functionName: string, capability: string, rulePayload?: unknown}>} attachments
 * @property {string} [lexMode] - 'permissive' | 'strict'
 */

/**
 * @typedef {Object} ManaLoaderConfig
 * @property {ManaLoaderTarget[]} targets - Packages to intercept
 * @property {boolean} [telemetry] - Enable telemetry collection
 * @property {boolean} [dreamSynthesis] - Enable DREAM synthesis
 * @property {string} [lexMode] - Global lex mode default
 * @property {string} [manifestPath] - Path to Ascension manifest for auto-config
 */

/** @type {ManaLoaderConfig | null} */
let loaderConfig = null;

/** @type {Set<string>} */
const interceptedModules = new Set();

/** @type {Map<string, ManaLoaderTarget>} */
const targetMap = new Map();

// ═══════════════════════════════════════════════════════════════
// Config Loading
// ═══════════════════════════════════════════════════════════════

async function loadConfig() {
  if (loaderConfig) return;

  const configPaths = [
    'mana.config.json',
    'mana.config.mjs',
    '.mana.json',
  ];

  for (const configPath of configPaths) {
    try {
      const fullPath = pathResolve(process.cwd(), configPath);
      const raw = await readFile(fullPath, 'utf-8');
      loaderConfig = JSON.parse(raw);

      // Build target lookup map
      if (loaderConfig?.targets) {
        for (const target of loaderConfig.targets) {
          targetMap.set(target.package, target);
        }
      }

      console.error(`[MANA/LOADER] Config loaded from ${configPath} — ${targetMap.size} target(s)`);
      return;
    } catch {
      // Try next path
    }
  }

  // No config found — loader is a no-op pass-through
  loaderConfig = { targets: [] };
  console.error('[MANA/LOADER] No mana.config.json found — pass-through mode');
}

// ═══════════════════════════════════════════════════════════════
// Node.js Loader Hooks (register API)
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve hook — intercepts module specifier resolution.
 * Marks targeted packages for interception in the load phase.
 *
 * @param {string} specifier
 * @param {Object} context
 * @param {Function} nextResolve
 */
export async function resolve(specifier, context, nextResolve) {
  await loadConfig();

  // Check if this specifier matches a configured target
  if (targetMap.has(specifier)) {
    const resolved = await nextResolve(specifier, context);
    interceptedModules.add(resolved.url);
    return resolved;
  }

  return nextResolve(specifier, context);
}

/**
 * Load hook — wraps module source with Mana Layer 2 injection.
 * Only modifies the module namespace export, never the source code.
 *
 * For CJS modules (most npm packages), we wrap the default export.
 * For ESM modules, we wrap individual named exports.
 *
 * @param {string} url
 * @param {Object} context
 * @param {Function} nextLoad
 */
export async function load(url, context, nextLoad) {
  await loadConfig();

  if (!interceptedModules.has(url)) {
    return nextLoad(url, context);
  }

  const result = await nextLoad(url, context);

  // Find which target config matches this URL
  let matchedTarget = null;
  for (const [pkg, target] of targetMap.entries()) {
    if (url.includes(`/node_modules/${pkg}/`) || url.includes(pkg)) {
      matchedTarget = target;
      break;
    }
  }

  if (!matchedTarget || !matchedTarget.attachments?.length) {
    return result;
  }

  // Generate the wrapper injection code
  const attachmentsJson = JSON.stringify(matchedTarget.attachments);
  const lexMode = matchedTarget.lexMode || loaderConfig?.lexMode || 'permissive';

  // Wrap the module with Mana Layer 2
  // This injects a post-load hook that wraps exported functions
  const wrapperSource = `
// ═══ MANA LAYER 2 — Silent Software Symbiosis ═══
// U.S. Patent App. No. 64/031,637
// This wrapper is injected at the module boundary.
// The original source code is NEVER modified.

import * as _manaOriginal from ${JSON.stringify(url + '?mana-bypass')};
import { configure, attach, registerRule } from '@cmpsbl/mana';

const _manaAttachments = ${attachmentsJson};
const _manaLexMode = ${JSON.stringify(lexMode)};

// Configure engine
configure({
  telemetry: ${loaderConfig?.telemetry ?? true},
  dreamSynthesis: ${loaderConfig?.dreamSynthesis ?? false},
  lexMode: _manaLexMode,
});

// Create mutable module proxy
const _manaHost = { ..._manaOriginal };

// Collect source fingerprint for proof
const _manaSourceParts = [];
for (const [key, val] of Object.entries(_manaHost)) {
  if (typeof val === 'function') {
    _manaSourceParts.push(key + ':' + val.toString().length);
  }
}
const _manaSourceHash = _manaSourceParts.join('|');

// Register Lex rules for deny attachments
for (const att of _manaAttachments) {
  if (att.rulePayload) {
    registerRule(att.capability, att.functionName, 'deny', 'Loader-configured rule');
  }
}

// Attach Layer 2
await attach(_manaHost, _manaAttachments, _manaSourceHash);

// Re-export wrapped functions
export default _manaHost;
${Object.keys(matchedTarget.attachments.reduce((acc, a) => {
  acc[a.functionName] = true;
  return acc;
}, {})).map(name => `export const ${name} = _manaHost['${name}'];`).join('\n')}
`;

  // Return bypass for the original (unwrapped) import
  if (url.endsWith('?mana-bypass')) {
    return result;
  }

  return {
    ...result,
    format: 'module',
    source: wrapperSource,
    shortCircuit: true,
  };
}
