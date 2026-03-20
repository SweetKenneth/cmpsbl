/**
 * Humanize Capability Name
 * Converts raw chain-based or module-prefixed names into investor-friendly,
 * readable product names.
 *
 * Examples:
 *   "Ψ₄₁_TRADEMATCHER" + chain ["BRAIN","DEFENSE"] → "TradeMatcher Cognitive Shield Edition"
 *   "BRAIN_x_DEFENSE_x_CORTEX" → "Cognitive Shield Orchestrator"
 *   "Adaptive Working Memory Controller" → "Adaptive Working Memory Controller" (unchanged)
 *
 * © CMPSBL® — All rights reserved.
 */

/** Maps module names to short, human-readable capability labels */
const MODULE_LABELS: Record<string, string> = {
  BRAIN: 'Cognitive',
  CORTEX: 'Orchestrator',
  DEFENSE: 'Shield',
  MEMORY: 'Recall',
  DREAM: 'Adaptive',
  EVOLUTION: 'Evolution',
  GOVERNANCE: 'Governance',
  VISION: 'Insight',
  ORACLE: 'Foresight',
  NEXUS: 'Routing',
  RIPPLE: 'Signal',
  NERVE: 'Nerve',
  RELAY: 'Relay',
  DECODE: 'Cipher',
  ENCODE: 'Encoder',
  CONSCIENCE: 'Ethics',
  PHANTOM: 'Stealth',
  HARVEST: 'Harvest',
  IMMUNITY: 'Sentinel',
  SHADOW: 'Shadow',
  INTENT: 'Intent',
  ATLAS: 'Atlas',
  FORGE: 'Forge',
  LINGUA: 'Lingua',
  ECHO: 'Mirror',
  SOVEREIGN: 'Sovereign',
  REFLEX: 'Reflex',
  TREATY: 'Treaty',
  ENGINEER: 'Engineer',
  COMPASS: 'Navigator',
  OBSERVER: 'Observer',
  AUDIT: 'Audit',
  SYSTEM: 'Core',
  CORE: 'Core',
  ANALYTICS: 'Analytics',
  SANDBOX: 'Sandbox',
  MEDIC: 'Medic',
};

/** Edition suffixes based on chain category / flavor */
const CATEGORY_EDITIONS: Record<string, string> = {
  security: 'Shield Edition',
  cognitive: 'Cognitive Edition',
  governance: 'Governance Edition',
  evolution: 'Evolution Edition',
  routing: 'Mesh Edition',
  learning: 'Adaptive Edition',
  observability: 'Insight Edition',
  general: 'Enhanced Edition',
  'proprietary-evolution': 'Evolved Edition',
};

/**
 * Check if a name is already human-readable (has spaces, mixed case, etc.)
 */
function isAlreadyHumanized(name: string): boolean {
  // Contains spaces and has mixed case — likely already a nice name
  if (/\s/.test(name) && /[a-z]/.test(name) && /[A-Z]/.test(name)) return true;
  // Title Case multi-word
  if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)+/.test(name)) return true;
  return false;
}

/**
 * Extract the original software name from an ascension-prefixed or raw module name.
 * "Ψ₄₁_TRADEMATCHER" → "TradeMatcher"
 * "TRADEMATCHER" → "TradeMatcher"
 * "my_analysis_tool" → "My Analysis Tool"
 */
function extractBaseName(raw: string): string {
  // Strip ascension prefix
  let cleaned = raw.replace(/^Ψ₄₁_(?:X_)?/i, '');

  // Strip chain separators
  cleaned = cleaned.replace(/_x_/gi, ' ').replace(/ × /g, ' ');

  // If it's all caps with underscores like MY_ANALYSIS_TOOL → split on underscore
  if (/^[A-Z0-9_]+$/.test(cleaned)) {
    const words = cleaned.split('_').filter(Boolean);
    // Filter out known module names to get the "original" name parts
    const nonModuleWords = words.filter(w => !MODULE_LABELS[w]);
    const targetWords = nonModuleWords.length > 0 ? nonModuleWords : words.slice(0, 1);
    return targetWords
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  }

  // CamelCase-ish: just titlecase it
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

/**
 * Build a short, evocative capability label from the module chain.
 * ["BRAIN", "DEFENSE", "CORTEX"] → "Cognitive Shield"
 * Takes at most 2 labels to keep it concise.
 */
function buildCapabilityLabel(chain: string[]): string {
  const labels = chain
    .map(m => MODULE_LABELS[m.toUpperCase()])
    .filter((l): l is string => !!l);

  // Deduplicate
  const unique = [...new Set(labels)];
  return unique.slice(0, 2).join(' ');
}

/**
 * Get the edition suffix from category or chain.
 */
function getEditionSuffix(category?: string, chain?: string[]): string {
  if (category) {
    const edition = CATEGORY_EDITIONS[category.toLowerCase()];
    if (edition) return edition;
  }

  // Infer from chain
  if (chain && chain.length > 0) {
    const upper = chain.map(c => c.toUpperCase());
    if (upper.includes('DEFENSE') || upper.includes('IMMUNITY')) return 'Shield Edition';
    if (upper.includes('BRAIN') || upper.includes('CORTEX')) return 'Cognitive Edition';
    if (upper.includes('GOVERNANCE') || upper.includes('AUDIT')) return 'Governance Edition';
    if (upper.includes('EVOLUTION') || upper.includes('DREAM')) return 'Adaptive Edition';
    if (upper.includes('NEXUS') || upper.includes('RIPPLE') || upper.includes('RELAY')) return 'Mesh Edition';
    if (upper.includes('VISION') || upper.includes('OBSERVER')) return 'Insight Edition';
  }

  return 'Enhanced Edition';
}

/**
 * Main entry: convert any raw capability name into a human-readable product name.
 *
 * @param rawName     The raw name (e.g. "Ψ₄₁_TRADEMATCHER", "BRAIN_x_DEFENSE_x_CORTEX")
 * @param chain       Module chain (e.g. ["BRAIN", "DEFENSE"])
 * @param category    Optional category string
 * @returns           Human-readable name like "TradeMatcher Cognitive Shield Edition"
 */
export function humanizeCapabilityName(
  rawName: string,
  chain?: string[],
  category?: string,
): string {
  if (!rawName) return 'Unnamed Capability';

  // Already a nice name? Return as-is
  if (isAlreadyHumanized(rawName)) return rawName;

  const baseName = extractBaseName(rawName);
  const edition = getEditionSuffix(category, chain);

  // If baseName is a single short word and we have a chain, add a capability label
  if (baseName.length <= 12 && chain && chain.length >= 2) {
    const capLabel = buildCapabilityLabel(chain);
    if (capLabel) {
      return `${baseName} ${capLabel} Edition`;
    }
  }

  return `${baseName} ${edition}`;
}

/**
 * Shorten a raw name for use in filenames while keeping it readable.
 * "Ψ₄₁_TRADEMATCHER" → "tradematcher"
 */
export function humanizeFilename(rawName: string): string {
  return rawName
    .replace(/^Ψ₄₁_(?:X_)?/i, '')
    .replace(/_x_/gi, '-')
    .replace(/ × /g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
}
