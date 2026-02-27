/**
 * Capabilities Depot — Artifact Packaging & Validation
 * Validates capability.json and enforces required fields
 *
 */

import type { 
  CapabilityManifest, 
  ValidationResult, 
  CapabilityCategory,
  ExecutorType,
  GovernanceLevel 
} from './types';

// === Required Manifest Fields ===
const REQUIRED_FIELDS: (keyof CapabilityManifest)[] = [
  'name',
  'version',
  'description',
  'category',
  'executorType',
  'requiredModules',
  'governanceLevel',
  'license',
  'main',
];

// === Valid Values ===
const VALID_CATEGORIES: CapabilityCategory[] = [
  'intelligence',
  'optimization',
  'resilience',
  'security',
  'accessibility',
  'automation',
];

const VALID_EXECUTOR_TYPES: ExecutorType[] = ['js', 'edge', 'wasm', 'container'];

const VALID_GOVERNANCE_LEVELS: GovernanceLevel[] = ['manual', 'governed', 'bounded'];

// === Semver Pattern ===
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/;

// === Standard Artifact Layout ===
export const ARTIFACT_STRUCTURE = {
  required: [
    'capability.json',
    'README.md',
    'LICENSE.txt',
    'CHECKSUM',
  ],
  optional: [
    'executor/',
    'examples/',
    'docs/',
    'tests/',
  ],
} as const;

// === Validate Manifest ===
export function validateManifest(manifest: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if manifest is an object
  if (!manifest || typeof manifest !== 'object') {
    return {
      valid: false,
      errors: ['Manifest must be a valid JSON object'],
      warnings: [],
    };
  }

  const m = manifest as Record<string, unknown>;

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in m) || m[field] === undefined || m[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate name
  if (typeof m.name === 'string') {
    if (m.name.length < 3) {
      errors.push('Name must be at least 3 characters');
    }
    if (m.name.length > 50) {
      errors.push('Name must be 50 characters or less');
    }
    if (!/^[a-z0-9-]+$/.test(m.name)) {
      warnings.push('Name should be lowercase with hyphens only');
    }
  }

  // Validate version
  if (typeof m.version === 'string') {
    if (!SEMVER_PATTERN.test(m.version)) {
      errors.push('Version must be valid semver (e.g., 1.0.0)');
    }
  }

  // Validate description
  if (typeof m.description === 'string') {
    if (m.description.length < 10) {
      errors.push('Description must be at least 10 characters');
    }
    if (m.description.length > 200) {
      warnings.push('Description should be 200 characters or less');
    }
  }

  // Validate category
  if (typeof m.category === 'string') {
    if (!VALID_CATEGORIES.includes(m.category as CapabilityCategory)) {
      errors.push(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  // Validate executorType
  if (typeof m.executorType === 'string') {
    if (!VALID_EXECUTOR_TYPES.includes(m.executorType as ExecutorType)) {
      errors.push(`Invalid executorType. Must be one of: ${VALID_EXECUTOR_TYPES.join(', ')}`);
    }
  }

  // Validate requiredModules
  if (Array.isArray(m.requiredModules)) {
    if (m.requiredModules.length === 0) {
      warnings.push('No required modules specified');
    }
    for (const mod of m.requiredModules) {
      if (typeof mod !== 'string') {
        errors.push('All requiredModules must be strings');
        break;
      }
    }
  } else if (m.requiredModules !== undefined) {
    errors.push('requiredModules must be an array');
  }

  // Validate governanceLevel
  if (typeof m.governanceLevel === 'string') {
    if (!VALID_GOVERNANCE_LEVELS.includes(m.governanceLevel as GovernanceLevel)) {
      errors.push(`Invalid governanceLevel. Must be one of: ${VALID_GOVERNANCE_LEVELS.join(', ')}`);
    }
  }

  // Validate license
  if (typeof m.license === 'string') {
    if (m.license.length === 0) {
      errors.push('License must not be empty');
    }
  }

  // Validate main entry point
  if (typeof m.main === 'string') {
    if (!m.main.endsWith('.js') && !m.main.endsWith('.ts') && !m.main.endsWith('.wasm')) {
      warnings.push('Main entry point should have a valid extension (.js, .ts, .wasm)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// === Validate Checksum ===
export async function validateChecksum(
  content: ArrayBuffer,
  expectedChecksum: string
): Promise<boolean> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', content);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === expectedChecksum.toLowerCase();
}

// === Generate Checksum ===
export async function generateChecksum(content: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', content);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// === Validate Artifact Structure ===
export function validateArtifactStructure(files: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required files
  for (const required of ARTIFACT_STRUCTURE.required) {
    if (!files.includes(required)) {
      errors.push(`Missing required file: ${required}`);
    }
  }

  // Check for executor directory
  const hasExecutor = files.some(f => f.startsWith('executor/'));
  if (!hasExecutor) {
    warnings.push('No executor directory found');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// === Create Manifest Template ===
export function createManifestTemplate(): CapabilityManifest {
  return {
    name: 'my-capability',
    version: '1.0.0',
    description: 'A brief description of what this capability does',
    category: 'automation',
    executorType: 'js',
    requiredModules: ['CORE'],
    governanceLevel: 'manual',
    license: 'Commercial',
    main: 'executor/index.js',
  };
}
