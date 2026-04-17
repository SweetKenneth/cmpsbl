/**
 * 5-Language Sealed-Output Spot Check
 * Confirms every shipping language emits valid output with NO leaky
 * architectural identifiers and DOES contain sealed banner markers.
 */
import { describe, it, expect } from 'vitest';
import { generateUnifiedCapabilityFile } from '@/lib/export/unified-capability-file';

const SHIPPING_LANGUAGES = ['typescript', 'javascript', 'python', 'rust', 'go'] as const;

const cap = {
  id: 'sc1',
  name: 'SpotCheck',
  cjpiScore: 88,
  tier: 'architect',
  chain: ['CANDIDATE', 'DEFENSE', 'BRAIN', 'IMMUNITY', 'AUDIT'],
  fingerprint: 'FP_SPOTCHECK',
  moatSignature: 'MS',
  capabilityType: 'utility',
};

const userSrc = {
  name: 'app',
  extension: 'ts',
  language: 'typescript',
  content: 'export function hello() { return "hi"; }\n',
};

const LEAKY = /Crown Jewel|Self-Healing Orchestrator|Welford streaming|FNV-1a entry hashing|Hash-chained audit log|Medical-grade triage|outermost wrapper|Real reasoning: Shannon entropy|Differential diagnosis with automated repair/;

describe('5-Language Sealed-Output Spot Check', () => {
  for (const lang of SHIPPING_LANGUAGES) {
    describe(`language=${lang}`, () => {
      let out: string;

      it('generates non-trivial output without throwing', () => {
        out = generateUnifiedCapabilityFile([cap], 'SC_PACK', lang, [userSrc]);
        expect(out.length).toBeGreaterThan(2000);
      });

      it('contains no leaky architectural identifiers in headers', () => {
        const matches = out.match(LEAKY);
        expect(matches, `Leak found in ${lang}: ${matches?.[0]}`).toBeNull();
      });

      it('contains the sealed banner marker', () => {
        const sealedHits = (out.match(/Sealed Module \(proprietary\)|Sealed wrapper|Sealed handler|Sealed dispatch|Sealed propagation/gi) || []).length;
        expect(sealedHits, `${lang} should contain at least one sealed marker`).toBeGreaterThan(0);
      });
    });
  }
});
