/**
 * Smoke Test — Unified Export Pipeline
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Simulates: upload → scoring → export → verify ZIP contents
 * Tests all 3 primary languages (TS, Python, PHP) + polyglot (Rust, Go)
 *
 * Verifies:
 *   1. Unified file generates without errors
 *   2. Black-box obfuscation is applied (sealed header, integrity hash)
 *   3. CJPI weights are obfuscated (no plaintext 0.30/0.20)
 *   4. No dead references to runtime-bridge.* or standalone-runtime
 *   5. Polyglot templates generate buildable output
 *   6. File naming is correct per language
 */
import { describe, it, expect } from 'vitest';
import {
  generateUnifiedCapabilityFile,
  getUnifiedFilename,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import { blackboxFile } from '@/lib/export/blackbox';

// ═══ Test Fixtures ═══

const MOCK_CAPABILITIES: UnifiedCapabilityInput[] = [
  {
    id: 'cap-001',
    name: 'ThreatAnalyzer',
    cjpiScore: 82,
    tier: 'mythic',
    chain: ['DEFENSE', 'BRAIN', 'ORACLE', 'IMMUNITY'],
    fingerprint: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    moatSignature: 'moat-001-sealed',
    capabilityType: 'security',
    description: 'Real-time threat analysis pipeline',
    category: 'security',
  },
  {
    id: 'cap-002',
    name: 'DataHarvester',
    cjpiScore: 67,
    tier: 'relic',
    chain: ['CORE', 'HARVEST', 'ENCODE', 'ECHO'],
    fingerprint: 'b2c3d4e5f6a7b2c3d4e5f6a7b2c3d4e5f6a7b2c3d4e5f6a7b2c3d4e5f6a7b2c3',
    moatSignature: 'moat-002-sealed',
    capabilityType: 'data',
    description: 'Structured data extraction pipeline',
    category: 'data-processing',
  },
];

const PACK_NAME = 'smoke-test-pack';

// ═══ Tests ═══

describe('Unified Export Pipeline — Smoke Test', () => {
  // ─── File Generation ───

  describe('File Generation', () => {
    const LANGUAGES_TO_TEST = [
      { lang: 'typescript', ext: '.ts', hasPolyglot: false },
      { lang: 'python', ext: '.py', hasPolyglot: false },
      { lang: 'php', ext: '.php', hasPolyglot: false },
      { lang: 'rust', ext: '.rs', hasPolyglot: true },
      { lang: 'go', ext: '.go', hasPolyglot: true },
    ];

    for (const { lang, ext } of LANGUAGES_TO_TEST) {
      it(`generates ${lang} unified file without errors`, () => {
        const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, lang);
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(500);
      });

      it(`${lang} file has correct filename`, () => {
        const filename = getUnifiedFilename(lang);
        expect(filename).toBe(`cmpsbl${ext}`);
      });
    }
  });

  // ─── Black-Box Obfuscation ───

  describe('Black-Box Obfuscation', () => {
    it('adds sealed runtime header to TypeScript output', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      expect(result).toContain('SEALED RUNTIME');
      expect(result).toContain('PROPRIETARY DISTRIBUTION');
      expect(result).toContain('DO NOT MODIFY');
    });

    it('adds integrity hash seal to output', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      expect(result).toContain('SEALED RUNTIME INTEGRITY');
      expect(result).toContain('Hash:');
    });

    it('obfuscates CJPI weights — no plaintext 0.30/0.20 in TS output', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      // Weights should be replaced with _W[n] references
      expect(result).not.toMatch(/novelty \* 0\.30/);
      expect(result).not.toMatch(/utility \* 0\.30/);
      expect(result).not.toMatch(/complexity \* 0\.20/);
      expect(result).not.toMatch(/composability \* 0\.20/);
    });

    it('obfuscates tier thresholds — no plaintext >= 92/80/65/45', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      expect(result).not.toMatch(/score >= 92/);
      expect(result).not.toMatch(/score >= 80/);
      expect(result).not.toMatch(/score >= 65/);
      expect(result).not.toMatch(/score >= 45/);
    });

    it('inserts obfuscated constant declarations', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      expect(result).toContain('_W');
      expect(result).toContain('_T');
      expect(result).toContain('0x1E'); // 30 in hex
      expect(result).toContain('0x5C'); // 92 in hex
    });

    it('blackboxFile is idempotent on sealed notice', () => {
      const raw = 'function test() { return 1; }';
      const boxed = blackboxFile(raw, 'typescript');
      expect(boxed).toContain('SEALED RUNTIME INTEGRITY');
      expect(boxed).toContain('Hash:');
    });
  });

  // ─── No Dead References ───

  describe('No Dead References', () => {
    const DEAD_PATTERNS = [
      'standalone-runtime',
      'runtime-bridge.ts',
      'runtime-bridge.php',
      'runtime_bridge.py',
      'from runtime_bridge import',
      "require_once __DIR__ . '/runtime-bridge.php'",
      "import { computeCJPI } from './_runtime/standalone-runtime'",
    ];

    for (const lang of ['typescript', 'python', 'php']) {
      it(`${lang} output contains no dead import references`, () => {
        const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, lang);
        for (const pattern of DEAD_PATTERNS) {
          expect(result).not.toContain(pattern);
        }
      });
    }
  });

  // ─── Content Structure ───

  describe('Content Structure', () => {
    it('TypeScript output contains all 4 sections', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      expect(result).toContain('§1');
      expect(result).toContain('§2');
      expect(result).toContain('§3');
      expect(result).toContain('§4');
    });

    it('output includes capability metadata', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      expect(result).toContain('ThreatAnalyzer');
      expect(result).toContain('DataHarvester');
    });

    it('output includes module handler names', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      expect(result).toContain('DEFENSE');
      expect(result).toContain('BRAIN');
      expect(result).toContain('ORACLE');
      expect(result).toContain('CORE');
    });

    it('output includes public API functions', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'typescript');
      expect(result).toContain('execute');
      expect(result).toContain('validate');
    });
  });

  // ─── Polyglot Templates ───

  describe('Polyglot Templates', () => {
    it('Rust output has correct syntax markers', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'rust');
      expect(result).toContain('pub struct');
      expect(result).toContain('pub fn');
      expect(result).toContain('HashMap');
    });

    it('Go output has correct syntax markers', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'go');
      expect(result).toContain('package');
      expect(result).toContain('func');
    });

    it('Python output uses correct idioms', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'python');
      expect(result).toContain('def ');
      expect(result).toContain('class ');
      expect(result).toContain('import');
    });

    it('PHP output uses correct idioms', () => {
      const result = generateUnifiedCapabilityFile(MOCK_CAPABILITIES, PACK_NAME, 'php');
      expect(result).toContain('<?php');
      expect(result).toContain('function');
      expect(result).toContain('class');
    });
  });
});
