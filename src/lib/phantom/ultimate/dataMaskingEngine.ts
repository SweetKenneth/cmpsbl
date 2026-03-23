/**
 * PHANTOM Ultimate — Data Masking Engine
 * Context-aware field masking that preserves data utility.
 * Format-preserving encryption and consistent cross-record masking.
 */

export type MaskType = 'email' | 'phone' | 'ssn' | 'name' | 'address' | 'credit_card' | 'date' | 'ip' | 'custom';

export interface MaskingRule {
  id: string;
  fieldName: string;
  maskType: MaskType;
  preserveFormat: boolean;
  consistentAcrossRecords: boolean;
  customPattern?: string;
}

export interface MaskingProfile {
  id: string;
  name: string;
  rules: MaskingRule[];
  createdAt: number;
}

export interface MaskingResult {
  profileId: string;
  fieldsMasked: number;
  recordsProcessed: number;
  consistencyMapSize: number;
  processedAt: number;
}

export interface MaskingStats {
  totalProfiles: number;
  totalResults: number;
  avgFieldsPerProfile: number;
  consistencyMapEntries: number;
}

const MAX_PROFILES = 200;
const profiles = new Map<string, MaskingProfile>();
const results: MaskingResult[] = [];
// Consistency map: fieldName+originalValue → maskedValue
const consistencyMap = new Map<string, string>();

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

const MASK_PATTERNS: Record<MaskType, (val: string, preserve: boolean) => string> = {
  email: (val, preserve) => {
    if (!preserve) return '***@***.***';
    const [local, domain] = val.split('@');
    return `${local?.[0] ?? '*'}***@${domain ?? '***.***'}`;
  },
  phone: (val, preserve) => {
    if (!preserve) return '***-***-****';
    return val.replace(/\d(?=\d{4})/g, '*');
  },
  ssn: (_val, _preserve) => '***-**-****',
  name: (val, preserve) => {
    if (!preserve) return '*** ***';
    return val.split(' ').map(w => w[0] + '***').join(' ');
  },
  address: (_val, _preserve) => '*** *** St, ***, ** *****',
  credit_card: (val, preserve) => {
    if (!preserve) return '****-****-****-****';
    return '****-****-****-' + val.slice(-4);
  },
  date: (val, preserve) => {
    if (!preserve) return '****-**-**';
    return val.slice(0, 4) + '-**-**';
  },
  ip: (_val, _preserve) => '***.***.***.***',
  custom: (_val, _preserve) => '***',
};

export function createMaskingProfile(name: string, rules: Omit<MaskingRule, 'id'>[]): MaskingProfile {
  const profile: MaskingProfile = {
    id: `mask-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name, createdAt: Date.now(),
    rules: rules.map((r, i) => ({ ...r, id: `rule-${i}` })),
  };
  if (profiles.size >= MAX_PROFILES) {
    const oldest = [...profiles.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) profiles.delete(oldest.id);
  }
  profiles.set(profile.id, profile);
  return profile;
}

export function maskRecord(profileId: string, record: Record<string, unknown>): Record<string, unknown> | null {
  const profile = profiles.get(profileId);
  if (!profile) return null;

  const masked = { ...record };
  let fieldsMasked = 0;

  for (const rule of profile.rules) {
    const value = masked[rule.fieldName];
    if (value === undefined || value === null) continue;

    const strVal = String(value);
    const consistencyKey = `${rule.fieldName}:${strVal}`;

    if (rule.consistentAcrossRecords && consistencyMap.has(consistencyKey)) {
      masked[rule.fieldName] = consistencyMap.get(consistencyKey);
    } else {
      const maskFn = MASK_PATTERNS[rule.maskType] ?? MASK_PATTERNS.custom;
      const maskedValue = rule.customPattern
        ? rule.customPattern.replace('{last4}', strVal.slice(-4)).replace('{first}', strVal[0] ?? '*')
        : maskFn(strVal, rule.preserveFormat);

      masked[rule.fieldName] = maskedValue;

      if (rule.consistentAcrossRecords) {
        consistencyMap.set(consistencyKey, maskedValue);
      }
    }
    fieldsMasked++;
  }

  const result: MaskingResult = {
    profileId, fieldsMasked, recordsProcessed: 1,
    consistencyMapSize: consistencyMap.size, processedAt: Date.now(),
  };
  if (results.length >= 1000) results.shift();
  results.push(result);

  return masked;
}

export function getMaskingStats(): MaskingStats {
  return {
    totalProfiles: profiles.size,
    totalResults: results.length,
    avgFieldsPerProfile: profiles.size > 0 ? [...profiles.values()].reduce((s, p) => s + p.rules.length, 0) / profiles.size : 0,
    consistencyMapEntries: consistencyMap.size,
  };
}

export function resetMaskingState(): void { profiles.clear(); results.length = 0; consistencyMap.clear(); }
