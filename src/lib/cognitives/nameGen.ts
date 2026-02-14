/**
 * CMPSBL-style Cognitive Name Generator
 * Short, punchy, safe names for personalization
 */

const PREFIXES = [
  'Nova', 'Apex', 'Cipher', 'Drift', 'Echo', 'Flux', 'Ghost', 'Helix',
  'Ion', 'Jade', 'Kite', 'Lux', 'Mako', 'Nex', 'Onyx', 'Pulse',
  'Quark', 'Rune', 'Shard', 'Thorn', 'Umbra', 'Vex', 'Wren', 'Xeno',
  'Zenith', 'Arc', 'Bolt', 'Crest', 'Dusk', 'Ember',
];

const SUFFIXES = [
  'Agent', 'Mind', 'Core', 'Node', 'Wire', 'Byte', 'Link', 'Spark',
  'Forge', 'Lens', 'Wave', 'Grid', 'Vault', 'Sync', 'Trace',
  'Cell', 'Arch', 'Ray', 'Bit', 'Helm',
];

export function generateCognitiveName(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `${prefix}-${suffix}`;
}

export function validateCognitiveName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }
  if (name.length > 32) {
    return { valid: false, error: 'Name must be 32 characters or less' };
  }
  if (!/^[a-zA-Z0-9 .\-_]+$/.test(name)) {
    return { valid: false, error: 'Only letters, numbers, spaces, dots, hyphens, and underscores' };
  }
  return { valid: true };
}
